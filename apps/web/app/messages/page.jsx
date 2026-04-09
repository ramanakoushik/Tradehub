"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { getSocket } from '@/lib/socket';
import { Send, ArrowLeft, Check, X, Package } from 'lucide-react';

// Parse wishlist offer from message text
function parseWishlistOffer(text) {
  const match = text?.match(/\[wishlist-offer:([a-f0-9]+)\]/);
  if (!match) return null;
  // Extract the clean display parts
  const displayText = text.replace(/🔗 \[wishlist-offer:[a-f0-9]+\]/, '').trim();
  return { requestId: match[1], displayText };
}

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState('');
  const [typing, setTyping] = useState(null);
  const [loading, setLoading] = useState(true);
  const [offerStates, setOfferStates] = useState({}); // { requestId: 'pending'|'accepted'|'declined' }
  const scrollRef = useRef(null);
  const typingTimeout = useRef(null);

  // Fetch conversations
  useEffect(() => {
    const fetchConvos = async () => {
      try {
        const res = await api.get('/conversations');
        setConversations(res.data);
        // Auto-open if convo param exists
        const convoId = searchParams.get('convo');
        if (convoId) {
          const c = res.data.find(c => c._id === convoId);
          if (c) setActiveConvo(c);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    if (user) fetchConvos();
  }, [user, searchParams]);

  // Fetch messages when active convo changes
  useEffect(() => {
    if (!activeConvo) return;
    const fetchMsgs = async () => {
      try {
        const res = await api.get(`/conversations/${activeConvo._id}/messages`);
        setMessages(res.data.messages || []);
        // Mark as read
        await api.patch(`/conversations/${activeConvo._id}/read`);

        // Check offer states for any wishlist offer messages
        const msgs = res.data.messages || [];
        for (const msg of msgs) {
          const offer = parseWishlistOffer(msg.text);
          if (offer) {
            try {
              const statusRes = await api.get(`/wishlist/${offer.requestId}/status`);
              setOfferStates(prev => ({ ...prev, [offer.requestId]: statusRes.data.status }));
            } catch (e) { /* ignore */ }
          }
        }
      } catch (err) { console.error(err); }
    };
    fetchMsgs();
  }, [activeConvo]);

  // Socket.io listeners
  useEffect(() => {
    const socket = getSocket();
    if (!socket || !activeConvo) return;

    socket.emit('join_conversation', activeConvo._id);

    const handleNewMsg = (msg) => {
      setMessages(prev => [...prev, msg]);
      setTyping(null);
      setConversations(prev => prev.map(c =>
        c._id === activeConvo._id ? { ...c, lastMessage: msg.text, lastTimestamp: msg.createdAt } : c
      ));
    };

    const handleTyping = (data) => {
      if (data.userId !== user?._id) setTyping(data.name);
    };
    const handleStopTyping = (data) => {
      if (data.userId !== user?._id) setTyping(null);
    };

    socket.on('new_message', handleNewMsg);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);

    return () => {
      socket.emit('leave_conversation', activeConvo._id);
      socket.off('new_message', handleNewMsg);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
    };
  }, [activeConvo, user]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, typing]);

  // Accept/Decline wishlist offer
  const handleOfferAction = async (requestId, action) => {
    try {
      if (action === 'accept') {
        // Find the offer associated with the sender in this conversation
        const statusRes = await api.get(`/wishlist/${requestId}/status`);
        const offerId = statusRes.data.offerId;
        if (offerId) {
          await api.patch(`/wishlist/${requestId}/fulfill`, { offerId });
        }
        setOfferStates(prev => ({ ...prev, [requestId]: 'fulfilled' }));
        // Send confirmation message
        await api.post('/messages', {
          conversationId: activeConvo._id,
          text: `✅ I've accepted your wishlist offer! Let's coordinate the details.`
        });
      } else {
        await api.patch(`/wishlist/${requestId}/decline-offer`, {
          conversationId: activeConvo._id
        });
        setOfferStates(prev => ({ ...prev, [requestId]: 'declined' }));
        // Send decline message
        await api.post('/messages', {
          conversationId: activeConvo._id,
          text: `❌ I've declined this offer. Thanks anyway!`
        });
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed');
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMsg.trim()) return;

    const socket = getSocket();
    const optimistic = {
      _id: Date.now().toString(),
      sender: { _id: user._id, name: user.name },
      text: newMsg,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, optimistic]);
    setNewMsg('');

    if (socket?.connected) {
      socket.emit('send_message', { conversationId: activeConvo._id, text: newMsg });
      socket.emit('typing_stop', { conversationId: activeConvo._id });
    } else {
      await api.post('/messages', { conversationId: activeConvo._id, text: newMsg });
    }
  };

  const handleInputChange = (e) => {
    setNewMsg(e.target.value);
    const socket = getSocket();
    if (!socket) return;
    socket.emit('typing_start', { conversationId: activeConvo._id, name: user.name });
    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit('typing_stop', { conversationId: activeConvo._id });
    }, 1500);
  };

  const getOtherUser = (convo) => convo.participants?.find(p => p._id !== user?._id);

  // Render a message bubble — handles wishlist offers specially
  const renderMessage = (msg, i) => {
    const isMine = msg.sender?._id === user._id;
    const offer = parseWishlistOffer(msg.text);

    if (offer) {
      const state = offerStates[offer.requestId];
      // The request owner (not the person who sent the offer) can accept/reject
      const canAct = !isMine && (state === 'open' || !state);

      return (
        <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[80%] border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] overflow-hidden
            ${isMine ? 'bg-accent-teal text-white' : 'bg-white'}`}>
            {/* Offer header */}
            <div className={`px-4 py-2 flex items-center gap-2 text-xs font-black uppercase border-b-2 border-black
              ${isMine ? 'bg-black/20' : 'bg-accent-teal/10 text-accent-teal'}`}>
              <Package size={14} /> Wishlist Offer
            </div>
            {/* Offer body */}
            <div className="p-4">
              <div className="text-sm font-bold whitespace-pre-line">{offer.displayText}</div>
              <div className={`text-[8px] mt-2 opacity-60 font-black ${isMine ? 'text-right' : ''}`}>
                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            {/* Action buttons — only for the request owner viewing someone else's offer */}
            {canAct && (
              <div className="border-t-2 border-black flex">
                <button onClick={() => handleOfferAction(offer.requestId, 'accept')}
                  className="flex-1 py-3 font-black uppercase text-xs flex items-center justify-center gap-1 bg-green-500 text-white hover:bg-green-600 transition-colors border-r border-black">
                  <Check size={14} /> Accept
                </button>
                <button onClick={() => handleOfferAction(offer.requestId, 'decline')}
                  className="flex-1 py-3 font-black uppercase text-xs flex items-center justify-center gap-1 bg-red-50 text-red-500 hover:bg-red-100 transition-colors">
                  <X size={14} /> Decline
                </button>
              </div>
            )}
            {/* Status badges */}
            {state === 'fulfilled' && (
              <div className="border-t-2 border-black bg-green-100 py-2 px-4 text-center">
                <span className="text-xs font-black uppercase text-green-700 flex items-center justify-center gap-1">
                  <Check size={14} /> Offer Accepted
                </span>
              </div>
            )}
            {state === 'declined' && (
              <div className="border-t-2 border-black bg-red-50 py-2 px-4 text-center">
                <span className="text-xs font-black uppercase text-red-500 flex items-center justify-center gap-1">
                  <X size={14} /> Offer Declined
                </span>
              </div>
            )}
            {state === 'closed' && (
              <div className="border-t-2 border-black bg-gray-100 py-2 px-4 text-center">
                <span className="text-xs font-black uppercase text-gray-500">Request Closed</span>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Regular message
    return (
      <div key={msg._id || i} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
        <div className={`max-w-[75%] p-3 border-2 border-black text-sm font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]
          ${isMine ? 'bg-accent-teal text-white' : 'bg-white'}`}>
          {msg.text}
          <div className={`text-[8px] mt-1 opacity-60 font-black ${isMine ? 'text-right' : ''}`}>
            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </div>
        </div>
      </div>
    );
  };


  if (!user) return (
    <main className="min-h-screen bg-cream"><Navbar />
      <div className="container mx-auto px-4 py-20 text-center font-black uppercase italic">Please log in to view messages</div>
    </main>
  );

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="container mx-auto px-4 py-4">
        <div className="card-neo bg-white overflow-hidden" style={{ height: 'calc(100vh - 120px)' }}>
          <div className="flex h-full">

            {/* Conversation List */}
            <div className={`w-full md:w-80 border-r-2 border-black flex flex-col ${activeConvo ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-4 border-b-2 border-black bg-cream">
                <h2 className="text-xl font-black uppercase italic">Messages</h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-100 animate-pulse" />)}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <div className="text-4xl mb-2">📪</div>
                    <p className="text-sm font-bold text-gray-500">No conversations yet</p>
                  </div>
                ) : conversations.map(convo => {
                  const other = getOtherUser(convo);
                  const unread = convo.unreadCount?.[user._id] || 0;
                  return (
                    <button key={convo._id} onClick={() => setActiveConvo(convo)}
                      className={`w-full text-left p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors flex items-center gap-3
                        ${activeConvo?._id === convo._id ? 'bg-accent-teal/10 border-l-4 border-l-accent-teal' : ''}`}>
                      <div className="w-10 h-10 bg-accent-teal text-white border-2 border-black flex items-center justify-center font-black shrink-0">
                        {other?.name?.charAt(0) || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center">
                          <span className="font-black text-sm truncate">{other?.name}</span>
                          <span className="text-[9px] text-gray-400 font-bold shrink-0">
                            {convo.lastTimestamp ? new Date(convo.lastTimestamp).toLocaleDateString() : ''}
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-0.5">
                          <p className="text-xs text-gray-500 truncate">{convo.lastMessage || 'No messages'}</p>
                          {unread > 0 && (
                            <span className="bg-red-500 text-white text-[9px] font-black rounded-full w-5 h-5 flex items-center justify-center shrink-0">{unread}</span>
                          )}
                        </div>
                        {convo.listing && <p className="text-[9px] text-accent-teal font-bold mt-0.5 truncate">Re: {convo.listing.title}</p>}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Chat Window */}
            <div className={`flex-1 flex flex-col ${!activeConvo ? 'hidden md:flex' : 'flex'}`}>
              {!activeConvo ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-6xl mb-4">💬</div>
                    <p className="font-black uppercase italic text-gray-400">Select a conversation</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="p-4 border-b-2 border-black bg-accent-teal text-white flex items-center gap-3">
                    <button onClick={() => setActiveConvo(null)} className="md:hidden"><ArrowLeft size={20} /></button>
                    <div className="w-8 h-8 bg-black/20 border border-white flex items-center justify-center font-black text-sm">
                      {getOtherUser(activeConvo)?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black uppercase text-sm">{getOtherUser(activeConvo)?.name}</p>
                      {activeConvo.listing && <p className="text-[9px] opacity-80">Re: {activeConvo.listing.title}</p>}
                    </div>
                  </div>

                  {/* Messages */}
                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream">
                    {messages.map((msg, i) => renderMessage(msg, i))}
                    {typing && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 border-2 border-black px-4 py-2 text-xs font-bold italic animate-pulse">
                          {typing} is typing...
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Input */}
                  <div className="p-4 border-t-2 border-black bg-white">
                    <form onSubmit={handleSend} className="flex gap-2">
                      <input type="text" value={newMsg} onChange={handleInputChange}
                        placeholder="Type a message..." className="input-neo flex-1 px-4 py-3" />
                      <button type="submit" disabled={!newMsg.trim()}
                        className="btn-neo bg-black text-white p-3 disabled:opacity-50">
                        <Send size={20} />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center font-black uppercase">Loading...</div>}>
      <MessagesContent />
    </Suspense>
  );
}

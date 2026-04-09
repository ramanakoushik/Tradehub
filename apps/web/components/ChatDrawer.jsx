"use client";

import { useState, useEffect, useRef } from 'react';
import { X, Send, User } from 'lucide-react';
import api from '@/lib/api';

export default function ChatDrawer({ isOpen, onClose, recipientId, recipientName }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const pollingRef = useRef(null);

  const fetchHistory = async () => {
    if (!recipientId) return;
    try {
      const res = await api.get(`/messages/history/${recipientId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Failed to fetch chat history:", err);
    }
  };

  useEffect(() => {
    if (isOpen && recipientId) {
      fetchHistory();
      // Start polling every 3 seconds
      pollingRef.current = setInterval(fetchHistory, 3000);
    } else {
      clearInterval(pollingRef.current);
    }
    return () => clearInterval(pollingRef.current);
  }, [isOpen, recipientId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || loading) return;

    try {
      setLoading(true);
      await api.post('/messages/send', {
        recipient: recipientId,
        content: newMessage
      });
      setNewMessage('');
      fetchHistory(); // Refresh immediately
    } catch (err) {
      alert("Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white border-l-4 border-black shadow-[-10px_0px_0px_0px_rgba(0,0,0,0.2)] z-50 flex flex-col transform transition-transform duration-300">
      {/* Header */}
      <div className="p-6 border-b-4 border-black bg-accent-teal text-white flex justify-between items-center shadow-[0px_4px_0px_0px_rgba(0,0,0,1)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center bg-black/20">
            <User size={20} />
          </div>
          <div>
            <h3 className="font-black uppercase italic tracking-tighter leading-none">{recipientName}</h3>
            <p className="text-[10px] font-bold uppercase opacity-80 mt-1">Active Conversation</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-black/10 transition-colors">
          <X size={24} />
        </button>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-cream scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-30 select-none">
            <div className="text-6xl mb-4">💬</div>
            <p className="font-black uppercase italic text-xs tracking-widest">No messages yet.<br/>Start the conversation!</p>
          </div>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={msg._id || i}
              className={`flex ${msg.sender === recipientId ? 'justify-start' : 'justify-end'}`}
            >
              <div className={`
                max-w-[80%] p-4 border-2 border-black font-bold text-sm
                shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                ${msg.sender === recipientId ? 'bg-white rounded-tr-xl rounded-br-xl rounded-bl-sm' : 'bg-accent-teal text-white rounded-tl-xl rounded-bl-xl rounded-br-sm'}
              `}>
                {msg.content}
                <div className={`text-[8px] mt-2 opacity-60 uppercase font-black ${msg.sender === recipientId ? 'text-gray-500' : 'text-white'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Input Area */}
      <div className="p-6 border-t-4 border-black bg-white">
        <form onSubmit={handleSend} className="flex gap-2">
          <input 
            type="text" 
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="input-neo flex-1 px-4 py-3"
          />
          <button 
            type="submit"
            disabled={loading || !newMessage.trim()}
            className="btn-neo bg-black text-white p-3 disabled:opacity-50"
          >
            <Send size={24} />
          </button>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Heart, Plus, X, Send, Check, Clock, AlertTriangle, Package, Trash2, MessageSquare } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other'];
const URGENCY_STYLES = {
  low: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Low' },
  medium: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Medium' },
  high: { bg: 'bg-red-100', text: 'text-red-700', label: 'Urgent' },
};

export default function WishlistPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(null);
  const [offerMsg, setOfferMsg] = useState('');
  const [tab, setTab] = useState('community');
  const [filter, setFilter] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '', description: '', category: 'Other', budget: '', urgency: 'medium'
  });

  const fetchRequests = async () => {
    setLoading(true);
    try {
      let url = '/wishlist';
      if (tab === 'mine') url = '/wishlist/mine';
      else if (filter) url = `/wishlist?category=${filter}`;
      const res = await api.get(url);
      setRequests(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRequests(); }, [tab, filter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/wishlist', { ...form, budget: Number(form.budget) || 0 });
      setRequests(prev => [res.data, ...prev]);
      setShowCreate(false);
      setForm({ title: '', description: '', category: 'Other', budget: '', urgency: 'medium' });
    } catch (err) { alert(err.response?.data?.msg || 'Failed'); }
  };

  // Send offer → creates conversation → redirect to chat
  const handleOffer = async (reqId) => {
    setSubmitting(true);
    try {
      const res = await api.post(`/wishlist/${reqId}/offer`, {
        message: offerMsg || 'I can help with this!'
      });
      setShowOfferModal(null);
      setOfferMsg('');
      // Redirect to the conversation
      if (res.data.conversationId) {
        router.push(`/messages?convo=${res.data.conversationId}`);
      }
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed');
    }
    finally { setSubmitting(false); }
  };

  const handleAcceptOffer = async (reqId, offerId) => {
    try {
      const res = await api.patch(`/wishlist/${reqId}/fulfill`, { offerId });
      setRequests(prev => prev.map(r => r._id === reqId ? res.data : r));
    } catch (err) { alert(err.response?.data?.msg || 'Failed'); }
  };

  const handleClose = async (reqId) => {
    try {
      await api.patch(`/wishlist/${reqId}/close`);
      setRequests(prev => prev.map(r => r._id === reqId ? { ...r, status: 'closed' } : r));
    } catch (err) { alert('Failed'); }
  };

  const handleDelete = async (reqId) => {
    if (!confirm('Delete this request?')) return;
    try {
      await api.delete(`/wishlist/${reqId}`);
      setRequests(prev => prev.filter(r => r._id !== reqId));
    } catch (err) { alert('Failed'); }
  };

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-black uppercase italic tracking-tighter flex items-center gap-3">
              <Heart size={32} className="text-accent-teal" /> Community Wishlist
            </h1>
            <p className="text-sm text-gray-500 font-bold mt-1">Post what you need — someone might have it!</p>
          </div>
          {user && (
            <button onClick={() => setShowCreate(true)}
              className="btn-neo bg-accent-teal text-white px-6 py-3 uppercase font-black flex items-center gap-2 text-sm">
              <Plus size={18} /> Post a Request
            </button>
          )}
        </div>

        {/* Tabs + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => setTab('community')}
              className={`px-5 py-2 font-black uppercase text-xs border-2 border-black transition-all
                ${tab === 'community' ? 'bg-black text-white shadow-none' : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
              All Requests
            </button>
            {user && (
              <button onClick={() => setTab('mine')}
                className={`px-5 py-2 font-black uppercase text-xs border-2 border-black transition-all
                  ${tab === 'mine' ? 'bg-black text-white shadow-none' : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                My Requests
              </button>
            )}
          </div>
          {tab === 'community' && (
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setFilter('')}
                className={`px-3 py-1 text-[10px] font-black uppercase border border-black transition-all
                  ${!filter ? 'bg-accent-teal text-white' : 'bg-white'}`}>All</button>
              {CATEGORIES.map(c => (
                <button key={c} onClick={() => setFilter(c)}
                  className={`px-3 py-1 text-[10px] font-black uppercase border border-black transition-all
                    ${filter === c ? 'bg-accent-teal text-white' : 'bg-white'}`}>{c}</button>
              ))}
            </div>
          )}
        </div>

        {/* Request Cards */}
        {loading ? (
          <div className="space-y-4">{[1,2,3].map(i => <div key={i} className="h-28 bg-gray-100 animate-pulse border-2 border-black" />)}</div>
        ) : requests.length === 0 ? (
          <div className="card-neo bg-white p-16 text-center">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-black uppercase italic mb-2">
              {tab === 'mine' ? 'You haven\'t posted any requests' : 'No requests yet'}
            </h3>
            <p className="text-sm text-gray-500 font-bold">Be the first to post what you're looking for!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {requests.map(req => {
              const urg = URGENCY_STYLES[req.urgency] || URGENCY_STYLES.medium;
              const isOwner = user && user._id === req.user?._id;
              const alreadyOffered = req.offers?.some(o => o.user?._id === user?._id || o.user === user?._id);

              return (
                <div key={req._id} className={`card-neo bg-white overflow-hidden ${req.status !== 'open' ? 'opacity-70' : ''}`}>
                  {/* Header bar */}
                  <div className="flex items-center justify-between px-5 py-3 bg-cream border-b-2 border-black">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-accent-teal text-white border border-black flex items-center justify-center text-xs font-black">
                        {req.user?.name?.charAt(0)}
                      </div>
                      <div>
                        <span className="font-black text-xs uppercase">{req.user?.name}</span>
                        {req.user?.college && <span className="text-[9px] text-gray-400 font-bold ml-2">{req.user.college}</span>}
                      </div>
                    </div>
                    <div className="flex gap-1 items-center">
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black ${urg.bg} ${urg.text}`}>
                        {urg.label}
                      </span>
                      <span className={`px-2 py-0.5 text-[9px] font-black uppercase border border-black
                        ${req.status === 'open' ? 'bg-green-100 text-green-700' : req.status === 'fulfilled' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100'}`}>
                        {req.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5">
                    <h3 className="text-lg font-black uppercase tracking-tight">{req.title}</h3>
                    {req.description && <p className="text-sm text-gray-600 mt-1">{req.description}</p>}

                    <div className="flex items-center gap-3 mt-3 flex-wrap">
                      <span className="px-2 py-0.5 text-[9px] font-black uppercase bg-gray-100 border border-black">{req.category}</span>
                      {req.budget > 0 && (
                        <span className="text-accent-teal font-black text-sm">Budget: ₹{req.budget}</span>
                      )}
                      <span className="text-[9px] text-gray-400 font-bold ml-auto">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    {/* Offers count */}
                    {req.offers?.length > 0 && (
                      <div className="mt-3 bg-accent-teal/5 border border-accent-teal/20 p-3">
                        <p className="text-xs font-black uppercase text-accent-teal">
                          {req.offers.length} offer{req.offers.length > 1 ? 's' : ''} received
                        </p>
                        {/* Show offers if owner */}
                        {isOwner && req.status === 'open' && (
                          <div className="mt-2 space-y-2">
                            {req.offers.map((offer, i) => (
                              <div key={i} className="flex items-center gap-2 bg-white p-2 border border-black text-xs">
                                <span className="font-black">{offer.user?.name || 'User'}</span>
                                <span className="flex-1 text-gray-500 truncate">{offer.message}</span>
                                <button onClick={() => handleAcceptOffer(req._id, offer._id)}
                                  className="px-3 py-1 bg-green-500 text-white font-black uppercase text-[9px] border border-black shrink-0">
                                  Accept
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Fulfilled info */}
                    {req.status === 'fulfilled' && req.fulfilledBy && (
                      <div className="mt-3 bg-green-50 border-2 border-green-500 p-3 flex items-center gap-2">
                        <Check size={16} className="text-green-600" />
                        <span className="text-xs font-bold text-green-700">Fulfilled by {req.fulfilledBy.name}</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 mt-4">
                      {/* Offer button for non-owners on open requests */}
                      {!isOwner && user && req.status === 'open' && !alreadyOffered && (
                        <button onClick={() => { setShowOfferModal(req._id); setOfferMsg(''); }}
                          className="btn-neo bg-accent-teal text-white px-4 py-2 uppercase font-black text-xs flex items-center gap-1">
                          <Package size={14} /> I Can Help
                        </button>
                      )}
                      {alreadyOffered && req.status === 'open' && !isOwner && (
                        <span className="px-4 py-2 text-xs font-black uppercase text-accent-teal border-2 border-accent-teal/30 flex items-center gap-1">
                          <MessageSquare size={14} /> Offer Sent — Check Messages
                        </span>
                      )}
                      {/* Owner actions */}
                      {isOwner && req.status === 'open' && (
                        <>
                          <button onClick={() => handleClose(req._id)}
                            className="btn-neo bg-white px-4 py-2 uppercase font-black text-xs flex items-center gap-1">
                            <X size={14} /> Close
                          </button>
                          <button onClick={() => handleDelete(req._id)}
                            className="btn-neo bg-red-50 px-4 py-2 uppercase font-black text-xs flex items-center gap-1 text-red-500">
                            <Trash2 size={14} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Request Modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowCreate(false)}>
          <div className="card-neo bg-white p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black uppercase italic mb-6">What Do You Need?</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Item Name *</label>
                <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="input-neo w-full px-4 py-3" placeholder="e.g., USB-C adapter, Operating Systems textbook" />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Details</label>
                <textarea rows={3} value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="input-neo w-full px-4 py-3 resize-none" placeholder="Describe what you need..." />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-gray-500">Category</label>
                  <select value={form.category} onChange={e => setForm({...form, category: e.target.value})}
                    className="input-neo w-full px-3 py-3 bg-white text-sm">
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black uppercase mb-1 text-gray-500">Budget (₹)</label>
                  <input type="number" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})}
                    className="input-neo w-full px-3 py-3" placeholder="Optional" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-1 text-gray-500">Urgency</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(u => (
                    <button key={u} type="button" onClick={() => setForm({...form, urgency: u})}
                      className={`flex-1 py-2 font-black uppercase text-xs border-2 border-black transition-all
                        ${form.urgency === u ? `${URGENCY_STYLES[u].bg} ${URGENCY_STYLES[u].text} shadow-none` : 'bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'}`}>
                      {u === 'high' ? '🔥 Urgent' : u === 'medium' ? '⏳ Medium' : '🌿 Low'}
                    </button>
                  ))}
                </div>
              </div>
              <button type="submit" className="btn-neo bg-black text-white w-full py-4 uppercase font-black flex items-center justify-center gap-2">
                <Plus size={18} /> Post Request
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Offer Modal — now redirects to chat */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowOfferModal(null)}>
          <div className="card-neo bg-white p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <h2 className="text-2xl font-black uppercase italic mb-2">Offer to Help</h2>
            <p className="text-sm text-gray-600 mb-4">You'll be redirected to a chat with the requester to work out details.</p>
            <textarea rows={3} value={offerMsg} onChange={e => setOfferMsg(e.target.value)}
              className="input-neo w-full px-4 py-3 resize-none mb-4" placeholder="e.g., I have one! It's in great condition..." />
            <div className="flex gap-3">
              <button onClick={() => setShowOfferModal(null)} className="btn-neo bg-white flex-1 py-3 uppercase font-black text-sm">Cancel</button>
              <button onClick={() => handleOffer(showOfferModal)} disabled={submitting}
                className="btn-neo bg-accent-teal text-white flex-1 py-3 uppercase font-black text-sm flex items-center justify-center gap-2 disabled:opacity-50">
                <MessageSquare size={16} /> {submitting ? 'Sending...' : 'Send & Chat'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

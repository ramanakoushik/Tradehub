"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Upload, X, Plus } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '', description: '', category: 'Electronics', condition: 'Good',
    type: [], price: '', rentPeriod: 'daily', tradePreference: '', images: ['']
  });

  const toggleType = (t) => {
    setForm(prev => ({
      ...prev,
      type: prev.type.includes(t) ? prev.type.filter(x => x !== t) : [...prev.type, t]
    }));
  };

  const updateImage = (i, val) => {
    const imgs = [...form.images];
    imgs[i] = val;
    setForm({ ...form, images: imgs });
  };

  const addImageSlot = () => {
    if (form.images.length < 5) setForm({ ...form, images: [...form.images, ''] });
  };

  const removeImageSlot = (i) => {
    setForm({ ...form, images: form.images.filter((_, idx) => idx !== i) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (form.type.length === 0) { alert('Select at least one listing type'); return; }

    setLoading(true);
    try {
      const payload = {
        ...form,
        price: Number(form.price) || 0,
        images: form.images.filter(u => u.trim())
      };
      const res = await api.post('/listings', payload);
      router.push(`/listing/${res.data._id}`);
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to create listing');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-8">Post New Item</h1>

        <form onSubmit={handleSubmit} className="card-neo bg-white p-8 space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-black uppercase mb-2 text-gray-500">Title *</label>
            <input type="text" required value={form.title} onChange={(e) => setForm({...form, title: e.target.value})}
              className="input-neo w-full px-4 py-3" placeholder="What are you selling?" />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-black uppercase mb-2 text-gray-500">Description</label>
            <textarea rows={4} value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
              className="input-neo w-full px-4 py-3 resize-none" placeholder="Describe your item..." />
          </div>

          {/* Category + Condition */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-gray-500">Category *</label>
              <select value={form.category} onChange={(e) => setForm({...form, category: e.target.value})}
                className="input-neo w-full px-4 py-3 bg-white">
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-gray-500">Condition *</label>
              <select value={form.condition} onChange={(e) => setForm({...form, condition: e.target.value})}
                className="input-neo w-full px-4 py-3 bg-white">
                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Listing Type */}
          <div>
            <label className="block text-xs font-black uppercase mb-2 text-gray-500">Listing Type * (select one or more)</label>
            <div className="flex gap-3">
              {['sell', 'rent', 'trade'].map(t => (
                <button key={t} type="button" onClick={() => toggleType(t)}
                  className={`flex-1 py-3 font-black uppercase border-2 border-black text-sm transition-all
                    ${form.type.includes(t) ? 'bg-accent-teal text-white shadow-none' : 'bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Conditional: Price */}
          {(form.type.includes('sell') || form.type.includes('rent')) && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-black uppercase mb-2 text-gray-500">Price (₹) *</label>
                <input type="number" required value={form.price} onChange={(e) => setForm({...form, price: e.target.value})}
                  className="input-neo w-full px-4 py-3" placeholder="0" />
              </div>
              {form.type.includes('rent') && (
                <div>
                  <label className="block text-xs font-black uppercase mb-2 text-gray-500">Rent Period</label>
                  <select value={form.rentPeriod} onChange={(e) => setForm({...form, rentPeriod: e.target.value})}
                    className="input-neo w-full px-4 py-3 bg-white">
                    <option value="daily">Per Day</option>
                    <option value="weekly">Per Week</option>
                    <option value="monthly">Per Month</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Conditional: Trade Preference */}
          {form.type.includes('trade') && (
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-gray-500">What do you want in return?</label>
              <input type="text" value={form.tradePreference} onChange={(e) => setForm({...form, tradePreference: e.target.value})}
                className="input-neo w-full px-4 py-3" placeholder="e.g., A laptop, textbook, guitar..." />
            </div>
          )}

          {/* Images */}
          <div>
            <label className="block text-xs font-black uppercase mb-2 text-gray-500">Image URLs (up to 5)</label>
            <div className="space-y-2">
              {form.images.map((url, i) => (
                <div key={i} className="flex gap-2">
                  <input type="url" value={url} onChange={(e) => updateImage(i, e.target.value)}
                    className="input-neo flex-1 px-4 py-2 text-sm" placeholder="https://..." />
                  {form.images.length > 1 && (
                    <button type="button" onClick={() => removeImageSlot(i)} className="p-2 text-red-500 hover:bg-red-50 border-2 border-black">
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
              {form.images.length < 5 && (
                <button type="button" onClick={addImageSlot}
                  className="text-xs font-black uppercase text-accent-teal flex items-center gap-1 mt-1">
                  <Plus size={14} /> Add Another Image
                </button>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-neo bg-black text-white w-full py-4 uppercase font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50">
            <Upload size={20} /> {loading ? 'Posting...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </main>
  );
}

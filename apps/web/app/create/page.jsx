"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { Upload, X, Plus, Image as ImageIcon } from 'lucide-react';

const CATEGORIES = ['Electronics', 'Books', 'Furniture', 'Clothing', 'Sports', 'Other'];
const CONDITIONS = ['New', 'Like New', 'Good', 'Fair'];

export default function CreateListingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [localFiles, setLocalFiles] = useState([]); // Array of File objects
  const [previews, setPreviews] = useState([]); // Array of Object URLs
  const [form, setForm] = useState({
    title: '', description: '', category: 'Electronics', condition: 'Good',
    type: [], price: '', rentPeriod: 'daily', tradePreference: '', images: []
  });

  const toggleType = (t) => {
    setForm(prev => ({
      ...prev,
      type: prev.type.includes(t) ? prev.type.filter(x => x !== t) : [...prev.type, t]
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (localFiles.length + files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setLocalFiles(prev => [...prev, ...files]);
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviews(prev => [...prev, ...newPreviews]);
  };

  const removeLocalFile = (index) => {
    setLocalFiles(prev => prev.filter((_, i) => i !== index));
    // Revoke the URL to avoid memory leaks
    URL.revokeObjectURL(previews[index]);
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImages = async () => {
    if (localFiles.length === 0) return [];
    
    const formData = new FormData();
    localFiles.forEach(file => {
      formData.append('images', file);
    });

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data.urls;
    } catch (err) {
      console.error('Upload Error:', err);
      throw new Error('Failed to upload images');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) { router.push('/login'); return; }
    if (form.type.length === 0) { alert('Select at least one listing type'); return; }

    setLoading(true);
    try {
      // 1. Upload local images first
      const uploadedUrls = await uploadImages();
      
      // 2. Combine with any URL-based images (if we still allowed them, but we've simplified to local)
      const finalImages = uploadedUrls;

      const payload = {
        ...form,
        price: Number(form.price) || 0,
        images: finalImages
      };
      
      const res = await api.post('/listings', payload);
      router.push(`/listing/${res.data._id}`);
    } catch (err) {
      alert(err.message || err.response?.data?.msg || 'Failed to create listing');
    } finally { setLoading(false); }
  };

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <h1 className="text-4xl font-black uppercase italic tracking-tighter mb-8 text-black">Post New Item</h1>

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

          {/* Local Image Upload */}
          <div>
            <label className="block text-xs font-black uppercase mb-2 text-gray-500">Photos (up to 5)</label>
            
            <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            <div className="grid grid-cols-3 gap-4">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] bg-gray-100 group">
                  <img src={src} alt="Preview" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeLocalFile(i)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-1 border-2 border-black rounded-none hover:bg-red-600 transition-colors">
                    <X size={14} />
                  </button>
                </div>
              ))}
              
              {localFiles.length < 5 && (
                <button type="button" onClick={() => fileInputRef.current?.click()}
                  className="aspect-square border-2 border-dashed border-black flex flex-col items-center justify-center gap-2 hover:bg-accent-teal/5 transition-colors group">
                  <div className="w-10 h-10 bg-accent-teal/10 flex items-center justify-center border-2 border-black group-hover:bg-accent-teal group-hover:text-white transition-all">
                    <Plus size={20} />
                  </div>
                  <span className="text-[10px] font-black uppercase">Add Photo</span>
                </button>
              )}
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="btn-neo bg-black text-white w-full py-4 uppercase font-black text-lg flex items-center justify-center gap-2 disabled:opacity-50">
            <Upload size={20} /> {loading ? 'Uploading & Posting...' : 'Post Listing'}
          </button>
        </form>
      </div>
    </main>
  );
}

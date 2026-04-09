'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Camera, MapPin, Check } from 'lucide-react';

export default function CreateListing() {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    condition: 'good',
    type: 'Trade',
    pricePerDay: '',
    lng: 0,
    lat: 0,
    images: []
  });
  const router = useRouter();

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData({ ...formData, lng: pos.coords.longitude, lat: pos.coords.latitude });
    });
  };

  const categoryImages = {
    'Electronics': 'https://images.unsplash.com/photo-1498049794561-7780e7231661',
    'Books': 'https://images.unsplash.com/photo-1544640808-32ca72ac7f67',
    'Lab Equipment': 'https://images.unsplash.com/photo-1532094349884-543bc11b234d',
    'Furniture': 'https://images.unsplash.com/photo-1524758631624-e2822e304c36',
    'Clothing': 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b',
    'Appliances': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a'
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const finalImages = formData.images.length > 0 ? formData.images : [categoryImages[formData.category] || 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3'];
      
      await api.post('/items/create', {
        ...formData,
        images: finalImages,
        pricePerDay: (formData.type === 'Rent' || formData.type === 'Sell') ? parseInt(formData.pricePerDay) : undefined,
        geoPosition: { type: 'Point', coordinates: [formData.lng, formData.lat] }
      });
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.msg || 'Failed to create listing');
    }
  };

  return (
    <main className="min-h-screen bg-cream pb-20">
      <Navbar />
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="card-neo bg-white p-10 w-full max-w-2xl">
          <h1 className="text-4xl font-black uppercase tracking-tighter mb-8 italic">List a New <span className="text-accent-teal underline">Item</span></h1>
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div>
                <label className="block font-black uppercase text-sm mb-2 italic">Item Name</label>
                <input 
                  type="text" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  className="input-neo w-full px-4 py-3"
                  placeholder="e.g. Morris Mano Digital logic"
                  required
                />
              </div>

              <div>
                <label className="block font-black uppercase text-sm mb-2 italic">Category</label>
                <select 
                  value={formData.category} 
                  onChange={(e) => setFormData({...formData, category: e.target.value})} 
                  className="input-neo w-full px-4 py-3 appearance-none bg-white"
                  required
                >
                  <option value="">Select Category</option>
                  <option value="Electronics">Electronics</option>
                  <option value="Books">Books</option>
                  <option value="Lab Equipment">Lab Equipment</option>
                  <option value="Furniture">Furniture</option>
                  <option value="Clothing">Clothing</option>
                  <option value="Appliances">Appliances</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-black uppercase text-sm mb-2 italic">Condition</label>
                  <select 
                    value={formData.condition} 
                    onChange={(e) => setFormData({...formData, condition: e.target.value})} 
                    className="input-neo w-full px-4 py-3 appearance-none bg-white"
                  >
                    <option value="new">New</option>
                    <option value="good">Good</option>
                    <option value="fair">Fair</option>
                    <option value="poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block font-black uppercase text-sm mb-2 italic">Type</label>
                  <select 
                    value={formData.type} 
                    onChange={(e) => setFormData({...formData, type: e.target.value})} 
                    className="input-neo w-full px-4 py-3 appearance-none bg-white font-black"
                  >
                    <option value="Trade">TRADE</option>
                    <option value="Rent">RENT</option>
                    <option value="Sell">SELL</option>
                    <option value="Share">SHARE</option>
                  </select>
                </div>
              </div>

              {(formData.type === 'Rent' || formData.type === 'Sell') && (
                <div>
                  <label className="block font-black uppercase text-sm mb-2 italic">
                    {formData.type === 'Rent' ? 'Price (₹ per day)' : 'Sale Price (₹)'}
                  </label>
                  <input 
                    type="number" 
                    value={formData.pricePerDay} 
                    onChange={(e) => setFormData({...formData, pricePerDay: e.target.value})} 
                    className="input-neo w-full px-4 py-3"
                    required
                  />
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <label className="block font-black uppercase text-sm mb-2 italic">Custom Photo URL (Optional)</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="https://..."
                    className="input-neo w-full px-4 py-3"
                    onBlur={(e) => {
                      if (e.target.value) setFormData({...formData, images: [e.target.value]});
                    }}
                  />
                  <div className="btn-neo p-3 bg-gray-100"><Camera size={24} /></div>
                </div>
                <p className="text-[10px] font-bold text-gray-400 mt-2 italic">If left blank, a high-quality category image will be used.</p>
              </div>

              <div className="p-6 border-4 border-dashed border-black bg-gray-50 flex flex-col items-center justify-center text-center">
                 <div className="mb-4">
                   <MapPin size={32} className="text-accent-teal" />
                 </div>
                 <h3 className="font-black uppercase mb-1">Set Location</h3>
                 <p className="text-[10px] font-bold text-gray-500 mb-4 italic">Auto-capture location for matching</p>
                 <button type="button" onClick={handleLocation} className={`btn-neo px-6 py-2 text-xs flex items-center gap-2 ${formData.lng !== 0 ? 'bg-accent-teal text-white' : 'bg-black text-white'}`}>
                   {formData.lng !== 0 ? <><Check size={14} /> CAPTURED</> : 'CAPTURE GPS'}
                 </button>
              </div>

              <button type="submit" className="btn-neo w-full bg-accent-teal text-white py-6 text-2xl font-black uppercase italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all">
                Publish Listing
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

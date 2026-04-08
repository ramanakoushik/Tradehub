'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import ItemCard from '@/components/ItemCard';
import api from '@/lib/api';
import { Search, Sliders } from 'lucide-react';
import { Item } from '@/lib/types';

export default function BrowsePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    type: '',
    condition: '',
    radius: '5000',
    lat: '',
    lng: ''
  });

  const fetchItems = useCallback(async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await api.get(`/items/search?${query}`);
      setItems(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [filters]);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFilters(prev => ({ ...prev, lat: pos.coords.latitude.toString(), lng: pos.coords.longitude.toString() }));
    });
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Sidebar */}
          <aside className="w-full lg:w-80">
            <div className="card-neo bg-white p-8 sticky top-28">
              <div className="flex items-center gap-2 mb-6">
                <Sliders size={20} className="text-accent-teal" />
                <h2 className="text-2xl font-black uppercase italic">Filters</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block font-black uppercase text-xs mb-2 italic text-gray-500 tracking-wider">Category</label>
                  <select 
                    value={filters.category} 
                    onChange={(e) => setFilters({...filters, category: e.target.value})}
                    className="input-neo w-full px-3 py-2 text-sm bg-white"
                  >
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Books">Books</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block font-black uppercase text-xs mb-2 italic text-gray-500 tracking-wider">Type</label>
                  <div className="flex gap-2">
                    {['Trade', 'Rent', 'Share'].map(t => (
                      <button 
                        key={t}
                        onClick={() => setFilters({...filters, type: filters.type === t ? '' : t})}
                        className={`flex-1 py-2 text-[10px] font-black border-2 border-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${filters.type === t ? 'bg-accent-teal text-white -translate-y-[1px] -translate-x-[1px] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black'}`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                   <label className="block font-black uppercase text-xs mb-2 italic text-gray-500 tracking-wider">Radius ({parseInt(filters.radius)/1000}km)</label>
                   <input 
                     type="range" 
                     min="1000" max="20000" step="1000"
                     value={filters.radius}
                     onChange={(e) => setFilters({...filters, radius: e.target.value})}
                     className="w-full accent-accent-teal"
                   />
                </div>
              </div>
            </div>
          </aside>

          {/* Results Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-8">
               <h1 className="text-4xl font-black uppercase italic tracking-tighter">Results ({items.length})</h1>
               <div className="relative">
                 <input type="text" placeholder="Search..." className="input-neo pl-10 pr-4 py-2 w-64" />
                 <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
               </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {items.map((item: Item) => (
                <ItemCard key={item._id} id={item._id} {...item} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

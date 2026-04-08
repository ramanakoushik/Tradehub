'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import Navbar from '@/components/Navbar';
import ItemCard from '@/components/ItemCard';
import { Sparkles, MapPin } from 'lucide-react';
import { Item } from '@/lib/types';

export default function Dashboard() {
  const { user, loading } = useAuth();
  const [nearbyItems, setNearbyItems] = useState<Item[]>([]);
  const [recommendations, setRecommendations] = useState<Item[]>([]);

  useEffect(() => {
    if (user) {
      // Fetch nearby items (within 5km default)
      const fetchNearby = async () => {
        try {
          const res = await api.get(`/items/search?lat=${user.location.coordinates[1]}&lng=${user.location.coordinates[0]}&radius=5000`);
          setNearbyItems(res.data);
        } catch (err) {
          console.error(err);
        }
      };

      // Fetch recommendations
      const fetchRecs = async () => {
        try {
          const res = await api.get(`/items/recommendations/${user._id}`);
          setRecommendations(res.data);
        } catch (err) {
          console.error(err);
        }
      };

      fetchNearby();
      fetchRecs();
    }
  }, [user]);

  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login to view dashboard</div>;

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        <header className="mb-12">
          <h1 className="text-5xl font-black uppercase tracking-tighter mb-2">Welcome back, <span className="text-accent-teal">{user.username}</span></h1>
          <div className="flex items-center gap-2 font-bold text-gray-600">
            <MapPin size={18} className="text-accent-teal" />
            <span>Reputation Score: <span className="text-black">{user.reputationScore}</span></span>
          </div>
        </header>

        {/* Nearby Items */}
        <section className="mb-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-accent-teal p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MapPin size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-black uppercase italic">Nearby Listings</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {nearbyItems.length > 0 ? (
              nearbyItems.map((item: Item) => (
                <ItemCard key={item._id} id={item._id} {...item} />
              ))
            ) : (
              <p className="font-bold italic text-gray-500">No items found nearby. Be the first to list one!</p>
            )}
          </div>
        </section>

        {/* Recommendations */}
        <section>
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-accent-cyan p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <Sparkles size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-black uppercase italic">Picked for You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recommendations.length > 0 ? (
              recommendations.map((item: Item) => (
                <ItemCard key={item._id} id={item._id} {...item} />
              ))
            ) : (
              <p className="font-bold italic text-gray-500">More transactions will help us find better recommendations for you!</p>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

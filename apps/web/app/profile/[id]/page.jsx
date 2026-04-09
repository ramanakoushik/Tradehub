'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import ItemCard from '@/components/ItemCard';
import api from '@/lib/api';
import { Star, ShieldCheck, MapPin, Calendar } from 'lucide-react';

export default function ProfilePage() {
  const { id } = useParams();
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get(`/users/profile/${id}`);
        setProfileData(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchProfile();
  }, [id]);

  if (!profileData) return <div className="min-h-screen bg-cream flex items-center justify-center font-black uppercase italic">Loading Profile...</div>;

  const { user, items } = profileData;

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        {/* Profile Header */}
        <div className="card-neo bg-white p-12 mb-16 flex flex-col md:flex-row gap-12 items-center">
          <div className="w-32 h-32 bg-accent-teal text-white border-4 border-black flex items-center justify-center text-5xl font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            {user.username[0]}
          </div>
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-6xl font-black uppercase tracking-tighter mb-4 italic">{user.username}</h1>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 font-bold text-gray-600 uppercase italic">
              <div className="flex items-center gap-2 text-accent-teal">
                <Star size={20} fill="currentColor" />
                <span>{user.reputationScore} Reputation Score</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-green-500" />
                <span>Verified Student</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={20} />
                <span>Joined {new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-4">
             <div className="bg-black text-white p-6 border-2 border-black text-center shadow-[4px_4px_0px_0px_rgba(20,184,166,1)]">
               <p className="text-xs uppercase font-black mb-1 opacity-70">Listings</p>
               <p className="text-3xl font-black">{items.length}</p>
             </div>
          </div>
        </div>

        {/* User's Listings */}
        <section>
          <div className="flex items-center gap-3 mb-10">
            <div className="bg-accent-cyan p-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <MapPin size={24} className="text-white" />
            </div>
            <h2 className="text-3xl font-black uppercase italic">Current Listings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <ItemCard key={item._id} id={item._id} {...item} ownerID={{ username: user.username, reputationScore: user.reputationScore }} />
            ))}
            {items.length === 0 && (
              <div className="col-span-full py-20 text-center card-neo border-dashed border-gray-300 bg-gray-50 font-black uppercase italic text-gray-400 text-2xl">
                This user has no active listings.
              </div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

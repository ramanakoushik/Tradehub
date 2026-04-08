"use client";

import Navbar from "@/components/Navbar";
import { Share2, Heart, MessageCircle, ShoppingCart, ShieldCheck, MapPin, ChevronLeft } from "lucide-react";
import Link from "next/link";
// import { useParams } from "next/navigation";
import UndoButton from "@/components/UndoButton";

export default function ListingDetailPage() {
  // const { id } = useParams();

  // Mock data for a single listing
  const listing = {
    title: "Digital Logic Design (Morris Mano)",
    price: 350,
    category: "Books",
    type: "TRADE",
    condition: "Like New",
    description: "Used this for only one semester. No markings or highlights inside. Condition is excellent, almost like brand new. Perfect for CSE/ECE first-year students.",
    owner: {
        name: "Rahul Sharma",
        hostel: "Block B, Room 304",
        joined: "Oct 2023",
        stats: "12 successful trades"
    },
    specs: [
        { label: "Edition", value: "5th Edition" },
        { label: "Subject", value: "Computer Architecture" },
        { label: "Author", value: "M. Morris Mano" },
        { label: "Course", value: "CS201" }
    ]
  };

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        <Link href="/explore" className="inline-flex items-center gap-2 font-black uppercase text-xs hover:text-accent-orange transition-colors mb-8">
           <ChevronLeft size={16} /> BACK TO EXPLORE
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image & Gallery */}
          <div className="space-y-4">
             <div className="aspect-square border-4 border-black bg-white shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-9xl">
                📚
             </div>
             <div className="grid grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square border-2 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all cursor-pointer"></div>
                ))}
             </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
             <div>
                <div className="flex items-center gap-3 mb-4">
                   <span className="badge-neo bg-accent-lime">TRADE</span>
                   <span className="badge-neo bg-white uppercase tracking-widest ">Books</span>
                </div>
                <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none mb-4 italic">
                  {listing.title}
                </h1>
                <div className="text-5xl font-black text-accent-orange italic">₹{listing.price}</div>
             </div>

             <p className="text-xl font-bold text-gray-800 leading-snug">
               &quot;{listing.description}&quot;
             </p>

             <div className="grid grid-cols-2 gap-4">
                {listing.specs.map((spec) => (
                  <div key={spec.label} className="card-neo bg-white p-4">
                     <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{spec.label}</p>
                     <p className="font-black italic">{spec.value}</p>
                  </div>
                ))}
             </div>

              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <button 
                  className="btn-neo-primary flex-1 py-5 text-2xl flex items-center justify-center gap-2"
                  onClick={() => alert("Offer sent to seller! Check your dashboard for updates.")}
                >
                   <ShoppingCart size={24} />
                   MAKE OFFER
                </button>
                <div className="flex gap-4">
                  <button className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                     <Heart size={28} />
                  </button>
                  <button className="w-16 h-16 border-4 border-black bg-accent-blue text-white flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                     <Share2 size={28} />
                  </button>
                </div>
              </div>

              {/* Owner Card */}
              <div className="card-neo bg-accent-lime flex items-center p-6 gap-6">
                 <div className="w-16 h-16 border-4 border-black bg-white flex items-center justify-center text-3xl font-black">
                    {listing.owner.name.charAt(0)}
                 </div>
                 <div className="flex-1">
                    <h3 className="text-xl font-black uppercase italic">{listing.owner.name}</h3>
                    <div className="flex items-center gap-2 text-sm font-bold opacity-75">
                       <MapPin size={14} /> {listing.owner.hostel}
                    </div>
                    <div className="mt-2 flex items-center gap-2 text-[10px] bg-black text-white px-2 py-1 uppercase font-black tracking-widest w-fit">
                       {listing.owner.stats}
                    </div>
                 </div>
                 <button 
                  onClick={() => alert(`Starting a chat with ${listing.owner.name}...`)}
                  className="btn-neo bg-white p-3 hover:translate-x-0 hover:translate-y-0"
                 >
                    <MessageCircle size={24} />
                 </button>
              </div>

             <div className="flex items-center gap-3 text-xs font-black uppercase italic text-gray-500">
                <ShieldCheck size={18} className="text-green-600" />
                Verified Student Trade | Guaranteed by TradeHub
             </div>
          </div>
        </div>
      </div>
      <UndoButton />
    </main>
  );
}

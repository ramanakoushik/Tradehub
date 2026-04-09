"use client";

import Navbar from "@/components/Navbar";
import UndoButton from "@/components/UndoButton";
import { Plus, Filter, MessageSquare, Clock, AlertCircle, Sparkles, User } from "lucide-react";
import { useRouter } from "next/navigation";

const DEMO_REQUESTS = [
  {
    id: "w1",
    user: "Sneha Reddy",
    category: "Books",
    description: "Looking for 'Design and Analysis of Algorithms' by Sartaj Sahni. Urgent for upcoming midterms!",
    budget: 45000, // ₹450
    urgency: "WITHIN_3_DAYS",
    createdAt: "2h ago"
  },
  {
    id: "w2",
    user: "Karthik M.",
    category: "Lab Equipment",
    description: "Need a working multimeter for one week. Willing to pay rent or exchange for chocolate/coffee!",
    budget: 20000, // ₹200
    urgency: "WITHIN_WEEK",
    createdAt: "5h ago"
  },
  {
    id: "w3",
    user: "Abhinav Singh",
    category: "Electronics",
    description: "Searching for a second-hand monitor or small TV for my hostel room (Block A).",
    budget: 350000, // ₹3500
    urgency: "FLEXIBLE",
    createdAt: "1d ago"
  },
  {
    id: "w4",
    user: "Divya P.",
    category: "Furniture",
    description: "Does anyone have a spare bean bag or a comfortable study chair they want to sell?",
    budget: 120000, // ₹1200
    urgency: "WITHIN_WEEK",
    createdAt: "2d ago"
  }
];

export default function WishlistPage() {
  const router = useRouter();

  const handleFulfill = (user) => {
    alert(`Starting a chat to fulfill ${user}'s request! Check your messages.`);
  };

  const getUrgencyStyles = (urgency) => {
    switch (urgency) {
      case "WITHIN_3_DAYS":
        return "bg-accent-orange text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
      case "WITHIN_WEEK":
        return "bg-accent-blue text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
      default:
        return "bg-accent-lime text-black border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]";
    }
  };

  const getUrgencyLabel = (urgency) => {
    return urgency.replace(/_/g, " ");
  };

  return (
    <main className="min-h-screen bg-cream text-black">
      <Navbar />
      
      {/* Hero Section */}
      <header className="bg-white border-b-4 border-black py-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center md:text-left space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-accent-lime text-xs font-black uppercase italic tracking-widest shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles size={14} /> The Campus Wishlist
              </div>
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
                CANT FIND <span className="text-accent-orange underline whitespace-nowrap">IT?</span>
              </h1>
              <p className="text-xl font-bold text-gray-700 max-w-xl">
                Post what you&apos;re looking for and let the campus come to you. Trade, rent, or buy—the community has your back.
              </p>
            </div>
            
            <button 
              onClick={() => router.push("/post")}
              className="btn-neo-primary text-xl px-10 py-6 flex items-center gap-3"
            >
              <Plus size={28} />
              POST A REQUEST
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-72 space-y-8">
            <div className="card-neo bg-black text-white p-6 space-y-4 shadow-[8px_8px_0px_0px_rgba(212,255,63,1)]">
               <h3 className="text-xl font-black uppercase italic flex items-center gap-2">
                 <AlertCircle size={20} className="text-accent-lime" />
                 Pro Tip
               </h3>
               <p className="text-sm font-bold opacity-80 italic">
                 &quot;Requests with a clear budget and urgent timeline get 4x more responses!&quot;
               </p>
            </div>

            <div className="space-y-6">
               <div>
                  <h3 className="text-lg font-black uppercase mb-4 flex items-center gap-2">
                    <Filter size={18} /> Filters
                  </h3>
                  <div className="card-neo bg-white p-4 space-y-4">
                     <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 mb-2">Category</p>
                        <select className="w-full border-2 border-black p-2 font-bold text-xs bg-white">
                          <option>All Categories</option>
                          <option>Books</option>
                          <option>Electronics</option>
                          <option>Lab Gear</option>
                        </select>
                     </div>
                  </div>
               </div>
            </div>
          </aside>

          {/* Requests Feed */}
          <section className="flex-1">
             <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-black">
                <div className="flex items-center gap-4">
                  <h2 className="text-2xl font-black uppercase italic tracking-tight">Campus Needs</h2>
                  <div className="text-xs bg-black text-white px-2 py-0.5 font-bold">{DEMO_REQUESTS.length} LIVE</div>
                </div>
             </div>

             <div className="space-y-6">
                {DEMO_REQUESTS.map((request) => (
                  <div key={request.id} className="card-neo bg-white p-6 hover:translate-x-[-4px] hover:translate-y-[-4px] transition-all group">
                     <div className="flex flex-col md:flex-row justify-between gap-6">
                        <div className="flex-1 space-y-3">
                           <div className="flex flex-wrap items-center gap-3">
                              <span className={`px-2 py-0.5 border-2 text-[10px] font-black uppercase tracking-widest ${getUrgencyStyles(request.urgency)}`}>
                                 {getUrgencyLabel(request.urgency)}
                              </span>
                              <span className="text-[10px] font-black uppercase text-gray-400">
                                {request.category} | POSTED {request.createdAt}
                              </span>
                           </div>
                           <h3 className="text-2xl font-black leading-tight italic group-hover:text-accent-orange transition-colors uppercase">
                             {request.description}
                           </h3>
                           <div className="flex items-center gap-3 pt-2">
                              <div className="w-8 h-8 border-2 border-black bg-accent-lime flex items-center justify-center text-xs font-black">
                                 {request.user.charAt(0)}
                              </div>
                              <span className="font-bold text-sm underline underline-offset-4 decoration-2 decoration-accent-lime">
                                 {request.user}
                              </span>
                           </div>
                        </div>

                        <div className="md:text-right space-y-4 md:border-l-2 md:border-black md:pl-6 min-w-[150px]">
                           <div className="text-[10px] font-black uppercase text-gray-400">Budget Range</div>
                           <div className="text-3xl font-black tabular-nums">₹{request.budget / 100}</div>
                           <button 
                            onClick={() => handleFulfill(request.user)}
                            className="btn-neo bg-black text-white w-full py-2 flex items-center justify-center gap-2 text-xs"
                           >
                              <MessageSquare size={14} /> FULFILL THIS
                           </button>
                        </div>
                     </div>
                  </div>
                ))}
             </div>

             {/* Bottom Info */}
             <div className="mt-16 bg-accent-lime border-4 border-black p-8 text-center relative overflow-hidden shadow-[12px_12px_0px_0px_rgba(0,0,0,1)]">
                <div className="absolute top-[-10px] right-[-10px] text-6xl opacity-20 rotate-12">🤝</div>
                <h3 className="text-3xl font-black uppercase italic italic tracking-tighter mb-4">Help a Buddy Out!</h3>
                <p className="font-bold text-gray-800 max-w-2xl mx-auto italic mb-8">
                  Check the wishlist regularly. You might have exactly what someone else is desperately looking for, and make some quick cash or coins along the way!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                   <div className="flex items-center gap-2 font-black text-xs uppercase"><Clock size={16}/> Instant Notifications</div>
                   <div className="flex items-center gap-2 font-black text-xs uppercase"><User size={16}/> Verified Peers</div>
                </div>
             </div>
          </section>
        </div>
      </div>

      <UndoButton />
    </main>
  );
}

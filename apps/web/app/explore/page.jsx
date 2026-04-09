"use client";

import Navbar from "@/components/Navbar";
import ListingCard from "@/components/ListingCard";
import UndoButton from "@/components/UndoButton";
import { Search, SlidersHorizontal, ChevronDown, CheckCheck } from "lucide-react";
import { useState, useMemo } from "react";

const CATEGORIES = ["All", "Books", "Electronics", "Lab Gear", "Clothing", "Furniture"];
const ALL_LISTINGS = [
  { id: "1", title: "Digital Logic Design (Morris Mano)", price: 35000, category: "Books", type: "TRADE", condition: "Like New", image: "https://loremflickr.com/800/600/book,technical" },
  { id: "2", title: "Casio fx-991ES Plus Scientific Calculator", price: 90000, category: "Electronics", type: "TRADE", condition: "Good", image: "https://loremflickr.com/800/600/calculator,scientific" },
  { id: "3", title: "Drafting Board & Stand for EG", price: 120000, category: "Lab Gear", type: "TRADE", condition: "Fair", image: "https://loremflickr.com/800/600/drafting,board" },
  { id: "4", title: "Presto Electric Kettle (1.5L)", price: 2500, category: "Electronics", type: "RENT", condition: "New", isRental: true, image: "https://loremflickr.com/800/600/kettle,electric" },
  { id: "5", title: "RS Aggarwal Quantitative Aptitude", price: 20000, category: "Books", type: "TRADE", condition: "Good", image: "https://loremflickr.com/800/600/textbook" },
  { id: "6", title: "Wireless Mouse & Keyboard Combo", price: 50000, category: "Electronics", type: "TRADE", condition: "Excellent", image: "https://loremflickr.com/800/600/keyboard,mouse" },
  { id: "7", title: "Lab Coat (White, Large)", price: 25000, category: "Lab Gear", type: "TRADE", condition: "Good", image: "https://loremflickr.com/800/600/labcoat" },
  { id: "8", title: "Study Table (Wooden)", price: 150000, category: "Furniture", type: "TRADE", condition: "Fair", image: "https://loremflickr.com/800/600/desk,wooden" },
];

export default function ExplorePage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredListings = useMemo(() => {
    return ALL_LISTINGS.filter(listing => {
      const matchesCategory = activeCategory === "All" || listing.category === activeCategory;
      const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      
      <header className="bg-black text-white py-12 md:py-20 border-b-4 border-black">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic mb-8">
            The Hub <span className="text-accent-lime">Market</span>
          </h1>
          
          <div className="flex flex-col md:flex-row gap-4 items-center max-w-4xl">
            <div className="relative flex-1 w-full text-black">
              <input 
                type="text" 
                placeholder="Search for books, gadgets, anything..." 
                className="w-full px-6 py-4 bg-white border-4 border-white text-black font-bold focus:outline-none focus:ring-0 shadow-[8px_8px_0px_0px_rgba(212,255,63,1)]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute right-6 top-1/2 -translate-y-1/2 text-black" size={24} />
            </div>
            <button className="btn-neo-primary w-full md:w-auto h-16 px-8 text-xl">
               SEARCH
            </button>
          </div>
        </div>
      </header>

      <section className="py-12 border-b-4 border-black bg-white">
        <div className="container mx-auto px-4 overflow-x-auto">
          <div className="flex gap-4 pb-2">
            {CATEGORIES.map((cat) => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-6 py-2 border-2 border-black font-black uppercase text-sm tracking-widest whitespace-nowrap shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all
                  ${cat === activeCategory ? 'bg-accent-orange text-white' : 'bg-white hover:bg-gray-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Filters Desktop */}
          <aside className="hidden lg:block w-72 space-y-8">
             <div>
                <h3 className="text-xl font-black uppercase mb-4 flex items-center gap-2">
                   <SlidersHorizontal size={20} /> FILTERS
                </h3>
                <div className="space-y-6">
                   <div className="card-neo p-4">
                      <p className="font-black uppercase text-xs mb-3">Listing Type</p>
                      <div className="space-y-2">
                         <label className="flex items-center gap-3 font-bold cursor-pointer">
                            <div className="w-5 h-5 border-2 border-black bg-accent-lime flex items-center justify-center"><CheckCheck size={12} /></div>
                            Buy / Trade
                         </label>
                         <label className="flex items-center gap-3 font-bold cursor-pointer">
                            <div className="w-5 h-5 border-2 border-black"></div>
                            Rentals
                         </label>
                      </div>
                   </div>

                   <div className="card-neo p-4">
                      <p className="font-black uppercase text-xs mb-3">Price Range</p>
                      <input type="range" className="w-full h-2 bg-gray-200 appearance-none border border-black" />
                      <div className="flex justify-between mt-2 font-bold text-sm">
                         <span>₹0</span>
                         <span>₹5000+</span>
                      </div>
                   </div>

                   <div className="card-neo p-4">
                      <p className="font-black uppercase text-xs mb-3">Location (Hostel)</p>
                      <div className="relative">
                         <select className="w-full px-3 py-2 border-2 border-black font-bold uppercase text-xs appearance-none">
                            <option>Any Block</option>
                            <option>Block A</option>
                            <option>Block B</option>
                            <option>Girls Hostel</option>
                         </select>
                         <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" size={16} />
                      </div>
                   </div>
                </div>
             </div>
          </aside>

          {/* Results */}
          <section className="flex-1">
             <div className="flex items-center justify-between mb-8">
                <p className="font-bold uppercase text-gray-500 italic">Showing 150 items found at <span className="text-black underline">MLRIT</span></p>
                <div className="flex items-center gap-2 font-bold text-sm">
                   SORT BY: 
                   <span className="underline decoration-accent-orange decoration-2 cursor-pointer uppercase font-black tracking-tight">Newest First</span>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 text-black">
                {filteredListings.length > 0 ? (
                  filteredListings.map((listing) => (
                    <ListingCard key={listing.id} {...listing} />
                  ))
                ) : (
                  <div className="col-span-full py-20 text-center card-neo bg-white border-black border-4 border-dashed">
                    <div className="text-4xl mb-4">🔍</div>
                    <h3 className="text-2xl font-black uppercase">No items found</h3>
                    <p className="font-bold text-gray-500 italic">Try searching for something else or change the category.</p>
                  </div>
                )}
             </div>

             <div className="mt-20 flex justify-center">
                <button className="btn-neo bg-white px-12 py-4 font-black italic shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                   LOAD MORE ITEMS
                </button>
             </div>
          </section>
        </div>
      </div>
      <UndoButton />
    </main>
  );
}

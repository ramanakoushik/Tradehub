import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import ItemCard from "@/components/ItemCard";
import { Sparkles, TrendingUp } from "lucide-react";
import Link from 'next/link';

// Demo listings for landing page until real data is populated
const LANDING_DEMOS = [
  {
    _id: "demo1",
    name: "Digital Logic Design (Morris Mano)",
    category: "Books",
    condition: "Good",
    type: "Trade",
    ownerID: { username: "alex_stud", reputationScore: 15 },
    images: ["https://loremflickr.com/800/600/book,technical"],
    currentState: "Available"
  },
  {
    _id: "demo2",
    name: "Scientific Calculator fx-991ES",
    category: "Electronics",
    condition: "New",
    type: "Rent",
    pricePerDay: 40,
    ownerID: { username: "pria_22", reputationScore: 24 },
    images: ["https://loremflickr.com/800/600/calculator"],
    currentState: "Available"
  },
  {
    _id: "demo3",
    name: "Lab Coat (XL) - Cotton",
    category: "Clothing",
    condition: "Good",
    type: "Trade",
    ownerID: { username: "rahul_m", reputationScore: 8 },
    images: ["https://loremflickr.com/800/600/labcoat"],
    currentState: "Available"
  }
];

export default function Home() {
  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <Hero />
      
      {/* Trending Section */}
      <section className="py-24 bg-white border-y-4 border-black">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 border-2 border-black bg-accent-teal text-white font-bold text-xs uppercase mb-4 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                <Sparkles size={14} fill="currentColor" />
                Featured Picks
              </div>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">
                Trending on <span className="text-accent-teal">Campus</span>
              </h2>
            </div>
            
            <Link href="/browse" className="btn-neo bg-black text-white px-8 py-4 uppercase font-black italic flex items-center gap-2">
              Browse All <TrendingUp size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {LANDING_DEMOS.map((item) => (
              <ItemCard key={item._id} {...item} />
            ))}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-24 bg-cream overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="card-neo bg-accent-teal p-10 text-white">
              <div className="text-5xl mb-6">🔒</div>
              <h3 className="text-2xl font-black mb-4 uppercase italic">Secure Hub</h3>
              <p className="font-bold italic opacity-90 leading-relaxed text-sm">
                Each user is verified through their institutional email domain. No outsiders, no scams, just your fellow students.
              </p>
            </div>
            <div className="card-neo bg-accent-cyan p-10 text-white">
              <div className="text-5xl mb-6">📍</div>
              <h3 className="text-2xl font-black mb-4 uppercase italic">Hyper-Local</h3>
              <p className="font-bold italic opacity-90 leading-relaxed text-sm">
                Matches are found within physical reach. Meet at common campus landmarks and complete your trades instantly.
              </p>
            </div>
            <div className="card-neo bg-black p-10 text-white">
              <div className="text-5xl mb-6">📈</div>
              <h3 className="text-2xl font-black mb-4 uppercase italic">Fair Play</h3>
              <p className="font-bold italic opacity-90 leading-relaxed text-sm">
                Our reputation score system ensures that trustworthy traders are rewarded and the community remains high-quality.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-20 border-t-8 border-accent-teal">
        <div className="container mx-auto px-4">
           <div className="flex flex-col md:flex-row justify-between items-center gap-12 text-center md:text-left">
              <div>
                <h2 className="text-4xl font-black tracking-tighter mb-4 italic">TRADEHUB</h2>
                <p className="text-gray-400 font-bold max-w-xs uppercase text-xs tracking-widest leading-loose">
                  Empowering students to live sustainably and affordably through community sharing and trading.
                </p>
              </div>
              <div className="flex gap-12 font-black uppercase text-sm italic">
                <a href="#" className="hover:text-accent-teal">Security</a>
                <a href="#" className="hover:text-accent-teal">Careers</a>
                <a href="#" className="hover:text-accent-teal">Contact</a>
              </div>
           </div>
           <div className="mt-20 pt-8 border-t border-gray-800 flex justify-between items-center text-[10px] uppercase font-black tracking-widest text-gray-600">
              <p>© 2026 TRADEHUB INC.</p>
              <p>DESIGNED FOR THE CAMPUS ERA</p>
           </div>
        </div>
      </footer>
    </main>
  );
}

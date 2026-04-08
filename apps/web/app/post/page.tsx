"use client";

import Navbar from "@/components/Navbar";
import { useState } from "react";
import { Camera, IndianRupee, NotebookPen, Info, CheckCircle2 } from "lucide-react";
import UndoButton from "@/components/UndoButton";
import { useRouter } from "next/navigation";

export default function PostListingPage() {
  const [step, setStep] = useState(1);
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    window.dispatchEvent(new Event('tradehub-action'));
    setStep(3);
    setTimeout(() => {
        router.push("/dashboard");
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12 flex justify-center">
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
             <div className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black ${step >= 1 ? 'bg-accent-lime' : 'bg-white'}`}>1</div>
             <div className="h-0.5 flex-1 bg-black"></div>
             <div className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black ${step >= 2 ? 'bg-accent-lime' : 'bg-white'}`}>2</div>
             <div className="h-0.5 flex-1 bg-black"></div>
             <div className={`w-10 h-10 border-2 border-black flex items-center justify-center font-black ${step >= 3 ? 'bg-accent-lime' : 'bg-white'}`}>3</div>
          </div>

          <div className="card-neo bg-white p-8 md:p-12">
            {step === 1 && (
              <div className="space-y-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Tell us about <span className="text-accent-orange">the item</span></h1>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Item Title</label>
                    <input type="text" placeholder="e.g. Lab Coat L size, 2nd year" className="input-neo" />
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Category</label>
                    <select className="input-neo appearance-none bg-white">
                      <option>Books & Study Materials</option>
                      <option>Electronics</option>
                      <option>Lab Equipment</option>
                      <option>Clothing & Formals</option>
                      <option>Furniture</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-black uppercase mb-2">Condition</label>
                        <select className="input-neo appearance-none bg-white">
                          <option>New</option>
                          <option>Like New</option>
                          <option>Good</option>
                          <option>Fair</option>
                        </select>
                     </div>
                     <div>
                        <label className="block text-sm font-black uppercase mb-2">Listing Type</label>
                        <select className="input-neo appearance-none bg-white">
                          <option>TRADE</option>
                          <option>RENT</option>
                        </select>
                     </div>
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="btn-neo-primary w-full py-4 text-xl flex items-center justify-center gap-2"
                >
                  NEXT STEP
                </button>
              </div>
            )}

            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-8">
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Price & <span className="text-accent-blue">Photos</span></h1>
                
                <div className="p-8 border-4 border-dashed border-black bg-gray-50 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-cream transition-colors">
                  <Camera size={48} className="mb-4" />
                  <p className="font-bold uppercase tracking-tight">Upload up to 4 photos</p>
                  <p className="text-xs font-medium text-gray-500 mt-1">JPEG or PNG works best</p>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Price (In Rupees)</label>
                    <div className="relative">
                       <input type="number" placeholder="450" className="input-neo pl-12" />
                       <IndianRupee size={20} className="absolute left-4 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-black uppercase mb-2">Description</label>
                    <textarea rows={4} placeholder="Tell us more about the item's history, any marks, etc." className="input-neo py-4"></textarea>
                  </div>
                </div>

                <div className="flex gap-4">
                   <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="btn-neo bg-white flex-1 py-4 text-xl"
                   >
                     BACK
                   </button>
                   <button 
                    type="submit"
                    className="btn-neo-primary flex-[2] py-4 text-xl"
                   >
                     PUBLISH LISTING
                   </button>
                </div>
              </form>
            )}

            {step === 3 && (
              <div className="py-12 text-center space-y-6">
                 <div className="inline-block p-6 border-4 border-black bg-accent-lime rounded-full mb-4 animate-bounce">
                    <CheckCircle2 size={64} />
                 </div>
                 <h1 className="text-5xl font-black uppercase italic tracking-tighter">BOOM! IT&apos;S LIVE.</h1>
                 <p className="text-xl font-bold text-gray-700">Your item is now visible to everyone at MLRIT.</p>
                 <div className="pt-8 italic text-gray-500 font-bold">Redirecting to your dashboard...</div>
              </div>
            )}
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="card-neo bg-accent-blue text-white p-4 flex gap-3 items-center">
                <Info size={24} />
                <p className="text-xs font-bold leading-tight uppercase tracking-tight">Pro Tip: Items with clear photos sell 3x faster!</p>
             </div>
             <div className="card-neo bg-black text-white p-4 flex gap-3 items-center">
                <NotebookPen size={24} className="text-accent-lime" />
                <p className="text-xs font-bold leading-tight uppercase tracking-tight">Be honest about the condition to maintain your trust score.</p>
             </div>
          </div>
        </div>
      </div>
      <UndoButton />
    </main>
  );
}

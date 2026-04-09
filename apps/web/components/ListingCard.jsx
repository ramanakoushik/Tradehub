"use client";

import { Heart, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function ListingCard({ id, title, price, category, type, condition, isRental, image }) {
  const router = useRouter();
  return (
    <div className="card-neo flex flex-col h-full group">
      <div className="aspect-[4/3] border-2 border-black bg-white mb-4 relative overflow-hidden">
        {image ? (
          <img 
            src={image} 
            alt={title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl group-hover:scale-110 transition-transform duration-500 bg-gray-100">
             {category === "Books" ? "📚" : category === "Electronics" ? "💻" : "📦"}
          </div>
        )}
        <div className="absolute top-2 left-2">
           <span className={cn(
             "badge-neo text-white",
             type === "RENT" ? "bg-accent-cyan" : "bg-accent-teal"
           )}>
             {type}
           </span>
        </div>
        {isRental && (
          <div className="absolute top-2 right-2 bg-black text-white p-1 text-[10px] font-black italic flex items-center gap-1">
             <Clock size={10} />
             PER DAY
          </div>
        )}
      </div>
      <div className="flex-1">
        <div className="text-xs font-bold text-gray-500 uppercase mb-1">{category} | {condition}</div>
        <h3 className="text-xl font-black mb-2 leading-tight group-hover:text-accent-teal transition-colors">{title}</h3>
      </div>

      <div className="mt-4 flex items-center justify-between pt-4 border-t-2 border-black">
        <div className="text-2xl font-black">
          ₹{(price / 100).toLocaleString()}
        </div>
        <div className="flex gap-2">
          <button className="w-8 h-8 border-2 border-black flex items-center justify-center hover:bg-black hover:text-white transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none">
            <Heart size={16} />
          </button>
          <button 
            className="btn-neo-primary py-1 px-3 text-sm"
            onClick={() => {
              router.push(`/listing/${id || '1'}`);
            }}
          >
            Details
          </button>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { LogIn, Search, Menu, User as UserIcon, Plus, LogOut } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <nav className="sticky top-0 z-50 w-full bg-cream border-b-2 border-black py-4">
      <div className="container mx-auto px-4 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter flex items-center gap-2">
          <div className="w-8 h-8 bg-accent-teal border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center text-white">
            T
          </div>
          TRADEHUB
          <span className="text-[10px] bg-black text-white px-1 ml-1 uppercase">Campus</span>
        </Link>

        <div className="hidden md:flex items-center gap-8 font-bold uppercase text-sm">
          <Link href="/browse" className="hover:text-accent-teal transition-colors">Browse</Link>
          <Link href="/rentals" className="hover:text-accent-teal transition-colors italic">Rentals</Link>
          <Link href="/requests" className="hover:text-accent-teal transition-colors">Wishlist</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="hidden sm:flex items-center justify-center w-10 h-10 border-2 border-black hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none translate-x-[-2px] translate-y-[-2px] hover:translate-x-0 hover:translate-y-0">
            <Search size={20} />
          </button>
          
          {user ? (
            <div className="flex items-center gap-4">
               <button 
                onClick={() => router.push("/create-listing")}
                className="hidden sm:flex btn-neo bg-black text-white py-2 px-4 text-sm gap-2"
               >
                 <Plus size={18} /> LIST ITEM
               </button>
               <Link href="/dashboard" className="flex items-center gap-2 font-black border-2 border-black px-3 py-1 bg-accent-teal text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                 <UserIcon size={18} />
                 <span className="hidden lg:inline">{user.username}</span>
               </Link>
               <button onClick={logout} className="p-2 border-2 border-black bg-white hover:bg-red-50 transition-colors transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none">
                 <LogOut size={18} className="text-red-500" />
               </button>
            </div>
          ) : (
            <Link href="/login" className="btn-neo bg-accent-teal text-white text-sm py-2 px-6 flex items-center gap-2 font-black uppercase">
              <LogIn size={18} />
              Login
            </Link>
          )}

          <button className="md:hidden">
            <Menu size={24} />
          </button>
        </div>
      </div>
    </nav>
  );
}

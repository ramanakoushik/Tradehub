"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { LogIn, Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', form);
      await login(res.data.token, res.data.user);
      router.push('/listings');
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-cream">
      <Navbar />
      <div className="flex items-center justify-center py-20 px-4">
        <div className="card-neo bg-white p-10 w-full max-w-md">
          <h1 className="text-3xl font-black uppercase italic tracking-tighter mb-2">Sign In</h1>
          <p className="text-sm text-gray-500 font-bold mb-8">Welcome back to TradeHub Campus</p>

          {error && <div className="bg-red-50 border-2 border-red-500 p-3 mb-6 text-red-600 text-sm font-bold">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-gray-500">Email</label>
              <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})}
                className="input-neo w-full px-4 py-3" placeholder="your@email.com" />
            </div>
            <div>
              <label className="block text-xs font-black uppercase mb-2 text-gray-500">Password</label>
              <div className="relative">
                <input type={showPw ? 'text' : 'password'} required value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  className="input-neo w-full px-4 py-3 pr-12" placeholder="••••••••" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-gray-400">
                  {showPw ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading}
              className="btn-neo bg-black text-white w-full py-4 uppercase font-black flex items-center justify-center gap-2 disabled:opacity-50">
              <LogIn size={20} /> {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="text-center mt-6 text-sm font-bold text-gray-500">
            Don't have an account? <Link href="/register" className="text-accent-teal font-black">Register</Link>
          </p>
        </div>
      </div>
    </main>
  );
}

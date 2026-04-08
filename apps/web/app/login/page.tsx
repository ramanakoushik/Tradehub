'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/login', { username, password });
      await login(res.data.token);
      router.push('/dashboard');
    } catch {
      alert('Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="card-neo bg-white p-8 w-full max-auto max-w-md">
        <h1 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">Login to <span className="text-accent-teal">TradeHub</span></h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block font-bold mb-2 uppercase text-sm">Username</label>
            <input 
              type="text" 
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              className="input-neo w-full px-4 py-3"
              placeholder="Your Username"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-2 uppercase text-sm">Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="input-neo w-full px-4 py-3"
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn-neo w-full bg-accent-teal text-white py-4 font-black uppercase text-lg">
            Sign In
          </button>
        </form>
        <p className="mt-6 text-center font-bold">
          Don&apos;t have an account? <a href="/register" className="text-accent-teal underline">Register</a>
        </p>
      </div>
    </div>
  );
}

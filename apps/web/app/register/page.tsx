'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    lng: 0,
    lat: 0
  });
  const { login } = useAuth();
  const router = useRouter();

  const handleLocation = () => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setFormData({ ...formData, lng: pos.coords.longitude, lat: pos.coords.latitude });
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/auth/register', {
        ...formData,
        location: { type: 'Point', coordinates: [formData.lng, formData.lat] }
      });
      await login(res.data.token);
      router.push('/dashboard');
    } catch {
      alert('Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4">
      <div className="card-neo bg-white p-8 w-full max-auto max-w-md">
        <h1 className="text-3xl font-black mb-8 text-center uppercase tracking-tighter">Join <span className="text-accent-teal">TradeHub</span></h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-bold mb-1 uppercase text-sm">Username</label>
            <input 
              type="text" 
              value={formData.username} 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
              className="input-neo w-full px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-1 uppercase text-sm">Email</label>
            <input 
              type="email" 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
              className="input-neo w-full px-4 py-2"
              required
            />
          </div>
          <div>
            <label className="block font-bold mb-1 uppercase text-sm">Password</label>
            <input 
              type="password" 
              value={formData.password} 
              onChange={(e) => setFormData({...formData, password: e.target.value})} 
              className="input-neo w-full px-4 py-2"
              required
            />
          </div>
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <label className="block font-bold mb-1 uppercase text-sm">Location Cache</label>
              <div className="text-xs text-gray-500 font-mono">
                {formData.lng.toFixed(4)}, {formData.lat.toFixed(4)}
              </div>
            </div>
            <button type="button" onClick={handleLocation} className="btn-neo-outline px-3 py-1 text-xs">
              Detect
            </button>
          </div>
          <button type="submit" className="btn-neo w-full bg-accent-teal text-white py-4 font-black uppercase mt-4">
            Register
          </button>
        </form>
        <p className="mt-6 text-center font-bold">
          Already have an account? <a href="/login" className="text-accent-teal underline">Login</a>
        </p>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Lock, User, AlertCircle, Sparkles } from 'lucide-react';
import { getErrorMessage } from '../services/api';

interface AdminLoginProps {
  onLoginSuccess: (user: any, csrfToken: string) => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth.php?action=login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (data.success && data.data) {
        onLoginSuccess(data.data.user, data.data.csrf_token);
      } else {
        setError(getErrorMessage(data?.error || data, 'Invalid credentials. Please try again.'));
      }
    } catch (err: any) {
      setError('Connection error. Please ensure the API backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-4 font-sans selection:bg-amber-400 selection:text-black">
      <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
        {/* Holographic Header Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-amber-400 to-rose-500" />

        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-zinc-800 border border-zinc-700 rounded-full text-[10px] tracking-widest text-amber-300 uppercase font-medium">
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>ARRINA ATELIER CMS</span>
          </div>
          <h1 className="font-serif text-3xl font-normal text-white uppercase tracking-wider">
            AROMATICA ADMIN
          </h1>
          <p className="text-xs text-zinc-400 font-light">
            Sign in to manage storefront, products, orders & content
          </p>
        </div>

        {error && (
          <div className="mb-6 p-3 bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[10px] font-sans tracking-widest text-zinc-400 uppercase mb-1.5 font-medium">
              Username or Email
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="admin"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-sans tracking-widest text-zinc-400 uppercase mb-1.5 font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-950 border border-zinc-700 pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold py-3 px-4 text-xs tracking-widest uppercase transition-all duration-200 cursor-pointer disabled:opacity-50 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <p className="text-[11px] text-zinc-500">
            Default credentials: <span className="text-zinc-300 font-mono">admin</span> / <span className="text-zinc-300 font-mono">admin123</span>
          </p>
        </div>
      </div>
    </div>
  );
};

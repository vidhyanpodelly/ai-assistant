'use client';

import { login } from '@/app/actions/auth';
import { useState } from 'react';
import { LogIn, User as UserIcon, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    const result = await login(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white selection:bg-blue-500/30">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
            <LogIn className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
            Welcome Back
          </h1>
          <p className="text-white/40 mt-2 text-sm text-center">
            Login to access your multi-tenant workspace
          </p>
        </div>

        <form action={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider ml-1">
              Email Address
            </label>
            <div className="relative group">
              <input
                name="email"
                type="email"
                placeholder="admin@example.com"
                required
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all group-hover:border-white/20"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-white/60 uppercase tracking-wider ml-1">
              Access Role
            </label>
            <div className="grid grid-cols-2 gap-4">
              <label className="relative group cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  defaultChecked
                  className="peer sr-only"
                />
                <div className="flex items-center justify-center space-x-2 p-3 bg-black/40 border border-white/10 rounded-xl text-sm font-medium transition-all peer-checked:bg-blue-600/20 peer-checked:border-blue-500 group-hover:border-white/20">
                  <ShieldCheck className="w-4 h-4 text-blue-400" />
                  <span>Admin</span>
                </div>
              </label>
              <label className="relative group cursor-pointer">
                <input
                  type="radio"
                  name="role"
                  value="member"
                  className="peer sr-only"
                />
                <div className="flex items-center justify-center space-x-2 p-3 bg-black/40 border border-white/10 rounded-xl text-sm font-medium transition-all peer-checked:bg-purple-600/20 peer-checked:border-purple-500 group-hover:border-white/20">
                  <UserIcon className="w-4 h-4 text-purple-400" />
                  <span>Member</span>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-lg text-center animate-shake">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? 'Verifying...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-[10px] text-white/20 uppercase tracking-[0.2em]">
            Internal Access Only
          </p>
        </div>
      </div>
    </div>
  );
}

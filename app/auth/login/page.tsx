'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { safetyStore } from '@/lib/supabase/store';
import { SEEDED_PROFILES } from '@/lib/mock-data/seed';
import { Shield, Lock, Mail, ArrowRight, UserCheck, Sparkles } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      // Find matching profile or default to Alex
      const matched = SEEDED_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase()) || SEEDED_PROFILES[0];
      safetyStore.setCurrentUser(matched);
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  const handleQuickPersona = (profile: typeof SEEDED_PROFILES[0]) => {
    safetyStore.setCurrentUser(profile);
    router.push('/dashboard');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10">
      <div className="w-full max-w-md space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Sign In to WalkSafe</h1>
          <p className="text-xs text-slate-400">
            Access your active journey monitor, trusted responders, and AI SafeRoute grid.
          </p>
        </div>

        {/* 1-Click Quick Demo Personas */}
        <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 bg-cyan-950/20 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-300">
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              1-Click Demo Personas
            </span>
            <span className="text-[10px] text-slate-400 font-normal">Instant Login</span>
          </div>

          <div className="space-y-1.5">
            {SEEDED_PROFILES.map((persona) => (
              <button
                key={persona.id}
                type="button"
                onClick={() => handleQuickPersona(persona)}
                className="w-full p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-left flex items-center justify-between transition-all group"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-xs flex items-center justify-center">
                    {persona.full_name[0]}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                      {persona.full_name}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      {persona.email}
                    </div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
              </button>
            ))}
          </div>
        </div>

        {/* Standard Login Form */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@university.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              {isLoading ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <UserCheck className="w-4 h-4" />
                  Sign In with Password
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-400">
            Don’t have an account?{' '}
            <Link href="/auth/signup" className="text-emerald-400 font-semibold hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

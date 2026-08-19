'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { safetyStore } from '@/lib/supabase/store';
import { Shield, Lock, Mail, User, Phone, KeyRound, ArrowRight } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('1234');
  const [safePhrase, setSafePhrase] = useState('Safe and sound');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      const newProfile = {
        id: 'user-' + Date.now(),
        email: email || 'newuser@safetynet.ai',
        full_name: fullName || 'New Safety Member',
        phone: phone || '+1 (555) 000-1122',
        emergency_pin: pin || '1234',
        safe_phrase: safePhrase || 'Safe and sound',
        duress_code: '9999',
        default_grace_period_seconds: 60,
        created_at: new Date().toISOString(),
      };
      safetyStore.setCurrentUser(newProfile);
      setIsLoading(false);
      router.push('/dashboard');
    }, 600);
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mb-2 shadow-lg shadow-emerald-500/10">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Create Your Safety Profile</h1>
          <p className="text-xs text-slate-400">
            Set up your proactive monitoring account, emergency safe phrase, and de-escalation PIN.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Full Legal Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex.rivera@university.edu"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Mobile Phone (For Alerts)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">4-Digit Safe PIN</label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={4}
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    placeholder="1234"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-mono tracking-widest text-center"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Emergency Safe Phrase</label>
                <input
                  type="text"
                  value={safePhrase}
                  onChange={(e) => setSafePhrase(e.target.value)}
                  placeholder="Midnight Horizon"
                  className="w-full px-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all mt-2"
            >
              {isLoading ? <span>Creating Account...</span> : <span>Create Account & Enter Dashboard</span>}
            </button>
          </form>

          <div className="text-center pt-2 text-xs text-slate-400">
            Already registered?{' '}
            <Link href="/auth/login" className="text-emerald-400 font-semibold hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

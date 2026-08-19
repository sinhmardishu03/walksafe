import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, AlertCircle, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400 text-xs mt-20 pb-28 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Mission */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2 text-white font-extrabold text-base">
              <Shield className="w-5 h-5 text-emerald-400" />
              <span>WalkSafe</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              Your quiet safety companion for solo walks and unfamiliar journeys. WalkSafe combines route intelligence, journey monitoring, trusted connections, and proactive escalation—always with explicit consent.
            </p>
            <div className="flex items-center gap-4 text-[11px] text-slate-500 pt-2">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-400" /> End-to-End Privacy
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-cyan-400" /> Explicit Consent Only
              </span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Core Modules</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/saferoute" className="hover:text-emerald-400 transition-colors">
                  SafeRoute Intelligence
                </Link>
              </li>
              <li>
                <Link href="/journey/new" className="hover:text-emerald-400 transition-colors">
                  Start Safety Journey
                </Link>
              </li>
              <li>
                <Link href="/walktogether" className="hover:text-emerald-400 transition-colors">
                  WalkTogether Companion Sync
                </Link>
              </li>
              <li>
                <Link href="/circle" className="hover:text-emerald-400 transition-colors">
                  Trusted Circle Responders
                </Link>
              </li>
              <li>
                <Link href="/reports" className="hover:text-emerald-400 transition-colors">
                  Community Hazard Grid
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Emergency Quick Dials */}
          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">
              Emergency Hotlines
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-medium text-slate-300">Police & Ambulance</span>
                <span className="font-bold font-mono text-rose-400">911 / 112</span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                <span className="font-medium text-slate-300">Campus Safety</span>
                <span className="font-bold font-mono text-cyan-400">(555) 999-0011</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transparent Legal Disclaimer */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] text-slate-500">
          <p className="flex items-center gap-1.5 text-center md:text-left">
            <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>
              <strong>Disclaimer:</strong> Safety scores and SafeRoute recommendations are probabilistic risk indicators based on aggregated community data and urban infrastructure. They do not constitute an absolute guarantee of safety.
            </span>
          </p>
          <div className="shrink-0 text-slate-400">
            WalkSafe &copy; 2026 • Full-Stack Hackathon MVP
          </div>
        </div>
      </div>
    </footer>
  );
};

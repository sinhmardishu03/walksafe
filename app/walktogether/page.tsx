'use client';

import React, { useState, useEffect } from 'react';
import { safetyStore } from '@/lib/supabase/store';
import { WalkTogetherRequest } from '@/lib/types/database';
import { InteractiveRouteMap } from '@/components/map/InteractiveRouteMap';
import { SAMPLE_ROUTES, SEEDED_COMMUNITY_REPORTS } from '@/lib/mock-data/seed';
import {
  Users,
  Shield,
  Lock,
  CheckCircle2,
  XCircle,
  MapPin,
  Clock,
  MessageCircle,
  Sparkles,
  ArrowRight,
  EyeOff,
  UserCheck,
} from 'lucide-react';

export default function WalkTogetherPage() {
  const [requests, setRequests] = useState<WalkTogetherRequest[]>(safetyStore.getWalkTogetherRequests());
  const [activeBuddy, setActiveBuddy] = useState<WalkTogetherRequest | null>(null);
  const [isOptedIn, setIsOptedIn] = useState<boolean>(true);
  const [pairingSuccessMsg, setPairingSuccessMsg] = useState<string>('');

  useEffect(() => {
    const unsub = safetyStore.subscribe(() => {
      const updated = safetyStore.getWalkTogetherRequests();
      setRequests([...updated]);
      const accepted = updated.find((r) => r.status === 'accepted');
      setActiveBuddy(accepted || null);
    });
    const accepted = requests.find((r) => r.status === 'accepted');
    setActiveBuddy(accepted || null);
    return unsub;
  }, []);

  const handleAccept = (req: WalkTogetherRequest) => {
    safetyStore.acceptWalkTogether(req.id);
    setActiveBuddy({ ...req, status: 'accepted' });
    setPairingSuccessMsg(`✓ You are now safely paired with ${req.requester_name}! Shared rendezvous link created.`);
    setTimeout(() => setPairingSuccessMsg(''), 5000);
  };

  const handleDecline = (req: WalkTogetherRequest) => {
    safetyStore.declineWalkTogether(req.id);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* 1. HEADER & PRIVACY BANNER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-400 uppercase tracking-wider">
            <Users className="w-4 h-4" />
            <span>Privacy-First Route Sharing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">WalkTogether Companion Matching</h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Never walk isolated at night. Discover verified solo walkers heading in your direction with zero exact GPS exposure before mutual consent.
          </p>
        </div>

        {/* Opt-In Toggle */}
        <div className="glass-panel p-3 rounded-2xl border border-teal-500/30 flex items-center gap-3">
          <input
            type="checkbox"
            id="optin-toggle"
            checked={isOptedIn}
            onChange={(e) => setIsOptedIn(e.target.checked)}
            className="w-4 h-4 accent-teal-500 rounded cursor-pointer"
          />
          <label htmlFor="optin-toggle" className="text-xs cursor-pointer">
            <span className="font-bold text-white block">Discoverable Mode</span>
            <span className="text-[10px] text-teal-300">
              {isOptedIn ? 'Visible to verified nearby walkers' : 'Hidden / Solo Mode'}
            </span>
          </label>
        </div>
      </div>

      {pairingSuccessMsg && (
        <div className="p-4 rounded-xl bg-teal-500/20 border border-teal-500/50 text-teal-200 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          {pairingSuccessMsg}
        </div>
      )}

      {/* 2. PRIVACY GUARANTEE BANNER */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-700/80 bg-slate-900/60 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-300">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
            <EyeOff className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Fuzzy Coordinates</span>
            <span className="text-[11px] text-slate-400">Approximate radius only</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <UserCheck className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Verified Identities</span>
            <span className="text-[11px] text-slate-400">Students & local residents</span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <span className="font-bold text-white block">Auto-Expiring</span>
            <span className="text-[11px] text-slate-400">Connection ends on arrival</span>
          </div>
        </div>
      </div>

      {/* 3. ACTIVE BUDDY CARD (IF PAIRED) */}
      {activeBuddy && (
        <div className="glass-panel p-6 rounded-2xl border-2 border-teal-500/60 bg-teal-950/20 shadow-2xl space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-500/20 border-2 border-teal-400 flex items-center justify-center text-xl font-bold text-white">
                {activeBuddy.requester_name ? activeBuddy.requester_name[0] : 'M'}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-extrabold text-white text-base">{activeBuddy.requester_name}</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 font-semibold border border-teal-500/30">
                    Active WalkTogether Buddy
                  </span>
                </div>
                <div className="text-xs text-slate-300 mt-0.5">{activeBuddy.matched_user_badge}</div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Live Co-Monitoring
              </span>
              <span className="text-[10px] text-slate-400">Mutual Alert Protection</span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
            <div>
              <span className="text-slate-400">Safe Meeting Point:</span>{' '}
              <strong className="text-white">Civic Center Metro Plaza (Brightly Lit Area)</strong>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">~120m away</span>
          </div>
        </div>
      )}

      {/* 4. DISCOVERABLE NEARBY COMPANIONS & MAP */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Proximity Map */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
            <span>Live Companion Proximity Grid</span>
            <span className="text-[10px] text-teal-400 font-normal">(Fuzzy blue circles indicate matches)</span>
          </div>

          <InteractiveRouteMap
            routes={SAMPLE_ROUTES}
            activeRouteId="route-safest"
            walkTogetherRequests={requests}
            reports={SEEDED_COMMUNITY_REPORTS}
            height="400px"
          />
        </div>

        {/* Right 1 Col: Match Requests List */}
        <div className="space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-300">
            Route Matches Nearby ({requests.length})
          </div>

          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  req.status === 'accepted'
                    ? 'bg-teal-950/30 border-teal-500/50'
                    : req.status === 'declined'
                    ? 'bg-slate-900/40 border-slate-800 opacity-60'
                    : 'glass-panel border-slate-700/80'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{req.requester_name}</h4>
                    <span className="text-[10px] text-teal-300 font-semibold block mt-0.5">
                      {req.matched_user_badge}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 border border-teal-500/30">
                    {req.overlap_percentage}% Overlap
                  </span>
                </div>

                <div className="text-xs text-slate-400 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" />
                    <span>~{req.approx_distance_meters}m away • Heading to Oak St</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <span>Request expires in 45 minutes</span>
                  </div>
                </div>

                {req.status === 'pending' && (
                  <div className="flex gap-2 pt-2 border-t border-slate-800">
                    <button
                      onClick={() => handleAccept(req)}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Accept & Pair
                    </button>
                    <button
                      onClick={() => handleDecline(req)}
                      className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs transition-colors"
                      title="Decline request"
                    >
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {req.status === 'accepted' && (
                  <div className="text-xs font-bold text-emerald-400 flex items-center gap-1 pt-1 border-t border-slate-800">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Pairing Active
                  </div>
                )}

                {req.status === 'declined' && (
                  <div className="text-xs text-slate-500 pt-1 border-t border-slate-800">
                    Request declined
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

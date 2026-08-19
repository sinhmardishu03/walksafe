'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { safetyStore } from '@/lib/supabase/store';
import { Profile, SafetyJourney, TrustedContact, CommunityReport } from '@/lib/types/database';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SafetyScoreMeter } from '@/components/common/SafetyScoreMeter';
import { SmartEscalationEngine } from '@/lib/safety-engine/escalation';
import { useDemo } from '@/lib/safety-engine/demo-controller';
import {
  Navigation,
  Flame,
  Shield,
  Compass,
  Users,
  UserCheck,
  AlertTriangle,
  Clock,
  MapPin,
  ArrowUpRight,
  Play,
  CheckCircle2,
  Bell,
  Sparkles,
  ChevronRight,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { startDemoScenario } = useDemo();
  const [user, setUser] = useState<Profile>(safetyStore.getCurrentUser());
  const [activeJourney, setActiveJourney] = useState<SafetyJourney | null>(safetyStore.getActiveJourney());
  const [recentJourneys, setRecentJourneys] = useState<SafetyJourney[]>(safetyStore.getRecentJourneys());
  const [contacts, setContacts] = useState<TrustedContact[]>(safetyStore.getContacts());
  const [reports, setReports] = useState<CommunityReport[]>(safetyStore.getReports());
  const [testPingSent, setTestPingSent] = useState<boolean>(false);

  useEffect(() => {
    const unsub = safetyStore.subscribe(() => {
      setUser(safetyStore.getCurrentUser());
      setActiveJourney(safetyStore.getActiveJourney());
      setRecentJourneys([...safetyStore.getRecentJourneys()]);
      setContacts([...safetyStore.getContacts()]);
      setReports([...safetyStore.getReports()]);
    });
    return unsub;
  }, []);

  const handleStartPreset = (destination: string, lat: number, lng: number, score: number) => {
    const journey = safetyStore.startJourney({
      origin_name: 'Current Immediate Location (Downtown Hub)',
      origin_lat: 37.7805,
      origin_lng: -122.4225,
      dest_name: destination,
      dest_lat: lat,
      dest_lng: lng,
      transport_mode: 'walking',
      route_name: 'Avenue of the Arts (AI Safest)',
      safety_score: score,
      distance_km: 2.1,
      estimated_duration_mins: 22,
      expected_arrival_at: new Date(Date.now() + 22 * 60 * 1000).toISOString(),
      grace_period_seconds: 60,
    });
    router.push(`/journey/${journey.id}`);
  };

  const handleQuickSOS = () => {
    if (activeJourney) {
      SmartEscalationEngine.triggerSOS(activeJourney.id, true);
      router.push(`/journey/${activeJourney.id}`);
    } else {
      const emergencyJourney = safetyStore.startJourney({
        origin_name: 'Current Immediate Location',
        origin_lat: 37.7758,
        origin_lng: -122.4165,
        dest_name: 'Nearest Safe Facility / Police Hub',
        dest_lat: 37.7738,
        dest_lng: -122.4128,
        transport_mode: 'walking',
        route_name: 'Emergency Direct Path',
        safety_score: 95,
        distance_km: 1.0,
        estimated_duration_mins: 10,
        expected_arrival_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        grace_period_seconds: 30,
      });
      SmartEscalationEngine.triggerSOS(emergencyJourney.id, true);
      router.push(`/journey/${emergencyJourney.id}`);
    }
  };

  const handleSendTestPing = () => {
    setTestPingSent(true);
    contacts.forEach((c) => {
      safetyStore.addNotification({
        channel: 'SMS',
        recipientName: c.name,
        recipientPhone: c.phone,
        message: `🛡️ WalkSafe Test Ping: ${user.full_name} is testing their emergency reachability link. No action required.`,
        priority: 'NORMAL',
      });
    });
    setTimeout(() => setTestPingSent(false), 3500);
  };

  return (
    <div className="space-y-8">
      {/* 1. TOP WELCOME & CURRENT SAFETY STATUS BANNER */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white">Welcome back, {user.full_name}</h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
              Safe Phrase: &ldquo;{user.safe_phrase}&rdquo;
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Proactive monitoring active for urban journeys in San Francisco Metropolitan Area.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <StatusBadge status={activeJourney ? activeJourney.status : 'inactive'} size="md" />
          </div>

          {activeJourney ? (
            <Link
              href={`/journey/${activeJourney.id}`}
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all animate-pulse"
            >
              <Navigation className="w-4 h-4" />
              Open Active Journey
            </Link>
          ) : (
            <Link
              href="/journey/new"
              className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              Start New Journey
            </Link>
          )}
        </div>
      </div>

      {/* 2. HERO ACTION GRID (START JOURNEY & QUICK SOS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card A: Start Monitored Safety Journey */}
        <div className="md:col-span-2 glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 space-y-5 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400 uppercase tracking-wider">
                <Navigation className="w-4 h-4" />
                <span>Proactive Journey Monitor</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">GPS Auto-Telemetry</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              Where are you heading right now?
            </h2>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Select a frequent preset or enter a custom destination. WalkSafe computes the safest illuminated route and triggers automatic check-ins if delayed.
            </p>
          </div>

          {/* Preset Buttons */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Quick Presets:</div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                onClick={() => handleStartPreset('Home (Oak St Residences)', 37.7738, -122.4128, 92)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-400">🏠 Home</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Oak St Apts • 22m</div>
              </button>

              <button
                onClick={() => handleStartPreset('University Campus Library', 37.7805, -122.4225, 94)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-400">🏛️ Library</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Campus Quad • 15m</div>
              </button>

              <button
                onClick={() => handleStartPreset('Civic Center Metro Station', 37.7791, -122.4148, 86)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-400">🚇 Metro Hub</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Market & 7th • 12m</div>
              </button>

              <button
                onClick={() => handleStartPreset('City General Hospital', 37.7812, -122.4239, 90)}
                className="p-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-left transition-all group"
              >
                <div className="text-xs font-bold text-white group-hover:text-emerald-400">🏥 Hospital</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Van Ness Ave • 18m</div>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <Link
              href="/journey/new"
              className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
            >
              Configure custom destination & contacts →
            </Link>
            <button
              onClick={startDemoScenario}
              className="text-xs text-cyan-300 font-semibold hover:underline flex items-center gap-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Run Demo Simulator
            </button>
          </div>
        </div>

        {/* Card B: Quick SOS Emergency Trigger */}
        <div className="glass-panel p-6 rounded-2xl border border-rose-500/40 bg-rose-950/20 space-y-4 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-extrabold text-rose-400 uppercase tracking-wider">
              <Flame className="w-4 h-4" />
              <span>Emergency Dispatch</span>
            </div>
            <h3 className="text-lg font-bold text-white">Immediate SOS Trigger</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Instantly activates siren, broadcasts GPS coordinates, and dispatches automated emergency alerts to all {contacts.length} Trusted Contacts.
            </p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleQuickSOS}
              className="w-full py-4 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-2xl shadow-rose-600/50 emergency-strobe transition-all"
            >
              <Flame className="w-5 h-5 fill-current" />
              TRIGGER EMERGENCY SOS
            </button>

            <p className="text-[10px] text-slate-400 text-center">
              Requires personal 4-digit PIN ({user.emergency_pin}) to de-escalate.
            </p>
          </div>
        </div>
      </div>

      {/* 3. MIDDLE DUAL SECTION: TRUSTED CIRCLE & RECENT JOURNEYS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trusted Circle Quick View */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Trusted Circle Responders</h3>
                <p className="text-[11px] text-slate-400">{contacts.length} active emergency contacts</p>
              </div>
            </div>
            <Link
              href="/circle"
              className="text-xs text-cyan-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              Manage <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="font-bold text-white">{c.name}</div>
                  <div className="text-[10px] text-slate-400">{c.relationship} • {c.phone}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">
                    Priority {c.alert_priority}
                  </span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="Active responder" />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <button
              onClick={handleSendTestPing}
              disabled={testPingSent}
              className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5 text-cyan-400" />
              {testPingSent ? '✓ Test Alert Ping Dispatched!' : 'Send Test Ping to All Responders'}
            </button>
          </div>
        </div>

        {/* Recent Journeys History */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Recent Journeys</h3>
                <p className="text-[11px] text-slate-400">Past monitored trips & safety logs</p>
              </div>
            </div>
            <Link
              href="/journey/new"
              className="text-xs text-emerald-400 font-semibold hover:underline flex items-center gap-0.5"
            >
              Start New <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2">
            {recentJourneys.slice(0, 3).map((j) => (
              <div
                key={j.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs hover:border-slate-700 transition-colors"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span>{j.dest_name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 font-mono">
                      {j.safety_score}/100 Safe
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    From {j.origin_name} • {j.distance_km}km • {j.estimated_duration_mins}m duration
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] text-slate-500">
                    {new Date(j.started_at).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </div>
                  <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-semibold">
                    <CheckCircle2 className="w-3 h-3" /> Safe
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-2 border-t border-slate-800 text-center">
            <Link
              href="/saferoute"
              className="text-xs text-slate-400 hover:text-emerald-400 font-medium transition-colors"
            >
              View route safety intelligence & scores →
            </Link>
          </div>
        </div>
      </div>

      {/* 4. LIVE COMMUNITY HAZARDS FEED TICKER */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-white text-sm">Community Safety Reports (Vicinity)</h3>
          </div>
          <Link href="/reports" className="text-xs text-amber-400 font-semibold hover:underline">
            Submit Hazard / View Map ({reports.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {reports.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-xs space-y-1.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 uppercase tracking-wide">
                  {r.category.replace('_', ' ')}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">{r.upvotes} upvotes</span>
              </div>
              <div className="font-bold text-white truncate">{r.title}</div>
              <div className="text-[11px] text-slate-400 line-clamp-2">{r.description}</div>
              <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800/80">
                📍 {r.location_name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

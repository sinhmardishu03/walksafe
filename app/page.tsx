'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Shield,
  Navigation,
  Compass,
  Users,
  AlertTriangle,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Lock,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { InteractiveRouteMap } from '@/components/map/InteractiveRouteMap';
import { SAMPLE_ROUTES, SEEDED_COMMUNITY_REPORTS } from '@/lib/mock-data/seed';
import { SafetyScoreMeter } from '@/components/common/SafetyScoreMeter';
import { useDemo } from '@/lib/safety-engine/demo-controller';

export default function LandingPage() {
  const { startDemoScenario } = useDemo();
  const [activeTab, setActiveTab] = useState<'safest' | 'fastest'>('safest');

  return (
    <div className="space-y-24 py-6">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-6 pb-12">
        {/* Glow background accents */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none -z-10" />
        <div className="absolute top-1/3 left-1/4 w-[350px] h-[250px] bg-cyan-500/10 blur-[110px] rounded-full pointer-events-none -z-10" />

        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Top pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-semibold backdrop-blur-md shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>WALKSAFE GUARDIAN NETWORK</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Never Walk Alone. <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7cff6b] via-emerald-300 to-cyan-300">Even When You Are.</span>
          </h1>

          {/* Subtitle */}
          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            WalkSafe quietly watches over an active journey with your permission, helps you compare lower-risk routes, and activates your safety network when you cannot respond.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
            <Link
              href="/journey/new"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all transform hover:-translate-y-0.5"
            >
              <Navigation className="w-4 h-4" />
              Start Walking Safer
            </Link>

            <button
              onClick={startDemoScenario}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 font-bold text-sm flex items-center justify-center gap-2 transition-all"
            >
              <Sparkles className="w-4 h-4 text-cyan-400" />
              Run Guardian Demo
            </button>

            <Link
              href="/saferoute"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel hover:bg-slate-800 text-slate-300 font-semibold text-sm flex items-center justify-center gap-1.5 transition-all"
            >
              Explore SafeRoute Intelligence
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quick trust metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-10 border-t border-slate-800/80 max-w-3xl mx-auto text-left">
            <div className="glass-panel p-3.5 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Monitoring Logic</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">Automated</div>
              <div className="text-[10px] text-slate-500">Zero-tap escalation</div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">SafeRoute Model</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">Multi-Factor</div>
              <div className="text-[10px] text-slate-500">Lighting + Incident stats</div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Privacy Standard</div>
              <div className="text-base font-bold text-emerald-400 mt-0.5">100% Consent</div>
              <div className="text-[10px] text-slate-500">Auto-expiring tokens</div>
            </div>
            <div className="glass-panel p-3.5 rounded-xl">
              <div className="text-xs text-slate-400 font-medium">Platform Access</div>
              <div className="text-base font-bold text-cyan-400 mt-0.5">Web Native</div>
              <div className="text-[10px] text-slate-500">Any browser on mobile/PC</div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE DEMO MAP PREVIEW */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Activity className="w-4 h-4" />
              WALKSAFE ROUTE INTELLIGENCE
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Choose the route that feels safer, not just faster
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('safest')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'safest'
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'glass-panel text-slate-400 hover:text-white'
              }`}
            >
              Safest Route (92 Score)
            </button>
            <button
              onClick={() => setActiveTab('fastest')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'fastest'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'glass-panel text-slate-400 hover:text-white'
              }`}
            >
              Fastest Alley Route (54 Score)
            </button>
          </div>
        </div>

        {/* Map Display */}
        <InteractiveRouteMap
          routes={SAMPLE_ROUTES}
          activeRouteId={activeTab === 'safest' ? 'route-safest' : 'route-fastest'}
          reports={SEEDED_COMMUNITY_REPORTS}
          height="460px"
        />

        {/* SafeRoute Breakdown Card */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-700/70 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          <div className="space-y-1">
            <div className="text-xs text-slate-400 font-semibold uppercase">Selected Route Profile</div>
            <h3 className="text-lg font-bold text-white">
              {activeTab === 'safest' ? 'Avenue of the Arts & Civic Plaza' : 'Industrial Cut-Through Alley'}
            </h3>
            <p className="text-xs text-slate-400">
              {activeTab === 'safest'
                ? 'Main thoroughfare with high-intensity streetlamps, active open shops, and CCTV coverage.'
                : 'Direct geographic line through unlit warehouse zone with 2 recent safety hazard reports.'}
            </p>
          </div>

          <div className="flex items-center justify-center">
            <SafetyScoreMeter score={activeTab === 'safest' ? 92 : 54} size="lg" />
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Street Lighting Quality</span>
              <span className="font-bold text-emerald-400">{activeTab === 'safest' ? '96%' : '42%'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Open Facilities & Foot Traffic</span>
              <span className="font-bold text-emerald-400">{activeTab === 'safest' ? '88%' : '25%'}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Community Hazard Incident Risk</span>
              <span className="font-bold text-emerald-400">{activeTab === 'safest' ? 'Low (0 reports)' : 'High (2 reports)'}</span>
            </div>
            <Link
              href="/saferoute"
              className="inline-flex items-center gap-1.5 text-xs text-cyan-400 font-bold hover:underline pt-1"
            >
              Analyze all 3 route alternatives →
            </Link>
          </div>
        </div>
      </section>

      {/* 3. PARADIGM SHIFT: REACTIVE VS PROACTIVE */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-cyan-400">The Problem with Legacy Safety</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Why Reactive Panic Buttons Aren’t Enough
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            If a lone traveler is disoriented, incapacitated, or their phone is out of reach, they cannot press a button.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Old Way */}
          <div className="glass-panel p-6 rounded-2xl border-rose-500/30 bg-rose-950/10 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
                <Flame className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Traditional Safety Apps</h3>
                <span className="text-xs text-rose-400 font-semibold">100% Reactive</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                Requires manual button press during extreme crisis
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                Zero pre-trip safety optimization or hazard avoidance
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                No automatic detection if a traveler stops or deviates
              </li>
              <li className="flex items-start gap-2">
                <span className="text-rose-400 font-bold">✕</span>
                Family only finds out hours later when someone doesn’t arrive
              </li>
            </ul>
          </div>

          {/* WalkSafe Way */}
          <div className="glass-panel p-6 rounded-2xl border-emerald-500/40 bg-emerald-950/15 space-y-4 shadow-xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">WalkSafe Platform</h3>
                <span className="text-xs text-emerald-400 font-semibold">Always watching, only with consent</span>
              </div>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200">
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                SafeRoute Intelligences steer you away from dark, isolated alleys
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                Proactive smart escalations if you miss your arrival time
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                WalkTogether privacy-preserving companion pairing
              </li>
              <li className="flex items-start gap-2">
                <span className="text-emerald-400 font-bold">✓</span>
                Automatic multi-tier dispatch to Trusted Circle & emergency contacts
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 4. CORE FEATURES SHOWCASE */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="text-xs font-bold uppercase tracking-wider text-emerald-400">Comprehensive Safety Stack</div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Built for Real-World Urban Journeys
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="glass-panel-hover glass-panel p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Navigation className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Smart Safety Journey</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Start an active monitored journey with your expected arrival time and trusted contacts. Browser geolocation checks your progress continually.
            </p>
            <Link href="/journey/new" className="text-xs text-emerald-400 font-semibold inline-flex items-center gap-1 hover:underline">
              Launch a journey →
            </Link>
          </div>

          <div className="glass-panel-hover glass-panel p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">SafeRoute Intelligence Scoring</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Computes transparent safety scores (0-100) analyzing streetlights, business density, open facilities, and historical community incident clusters.
            </p>
            <Link href="/saferoute" className="text-xs text-cyan-400 font-semibold inline-flex items-center gap-1 hover:underline">
              Calculate route scores →
            </Link>
          </div>

          <div className="glass-panel-hover glass-panel p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">WalkTogether Matching</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Discover verified companions walking in the same direction without revealing exact GPS before mutual agreement.
            </p>
            <Link href="/walktogether" className="text-xs text-teal-400 font-semibold inline-flex items-center gap-1 hover:underline">
              Find walking companions →
            </Link>
          </div>

          <div className="glass-panel-hover glass-panel p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Rules-Based Escalation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Missed arrival triggers a timed 45s safety check dialog. Lack of response automatically escalates to Alert, then full Emergency SOS dispatch.
            </p>
            <button onClick={startDemoScenario} className="text-xs text-amber-400 font-semibold inline-flex items-center gap-1 hover:underline">
              Simulate escalation flow →
            </button>
          </div>

          <div className="glass-panel-hover glass-panel p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Trusted Circle Responders</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Configure priority levels for family, roommates, or campus security to receive instant automated SMS, GPS tracking, and medical notes.
            </p>
            <Link href="/circle" className="text-xs text-purple-400 font-semibold inline-flex items-center gap-1 hover:underline">
              Manage contacts →
            </Link>
          </div>

          <div className="glass-panel-hover glass-panel p-6 rounded-2xl space-y-3">
            <div className="p-3 w-fit rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base">Community Safety Grid</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crowdsourced hazard reporting for poor street lighting, construction obstacles, aggressive loitering, and isolated sectors.
            </p>
            <Link href="/reports" className="text-xs text-rose-400 font-semibold inline-flex items-center gap-1 hover:underline">
              View hazard reports →
            </Link>
          </div>
        </div>
      </section>

      {/* 5. BOTTOM CTA BANNER */}
      <section className="relative glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/30 overflow-hidden text-center space-y-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/30 via-slate-900/60 to-cyan-950/30 pointer-events-none" />
        <div className="relative z-10 max-w-2xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Your journey deserves a guardian.
          </h2>
          <p className="text-slate-300 text-sm">
            WalkSafe is built for the moments when you want someone watching your journey without getting in your way.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              href="/dashboard"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-xl shadow-emerald-500/20 transition-all"
            >
              Open WalkSafe
            </Link>
            <Link
              href="/auth/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl glass-panel text-slate-200 hover:text-white text-sm font-semibold"
            >
              Login / Persona Switch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { safetyStore } from '@/lib/supabase/store';
import { SEEDED_PROFILES } from '@/lib/mock-data/seed';
import { Profile, SafetyJourney } from '@/lib/types/database';
import { NotificationDrawer } from '../common/NotificationDrawer';
import { SmartEscalationEngine } from '@/lib/safety-engine/escalation';
import {
  Shield,
  Navigation,
  Compass,
  Users,
  Bell,
  UserCheck,
  AlertOctagon,
  Menu,
  X,
  FileText,
  LayoutDashboard,
  Flame,
  ChevronDown,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [currentUser, setCurrentUser] = useState<Profile>(safetyStore.getCurrentUser());
  const [activeJourney, setActiveJourney] = useState<SafetyJourney | null>(safetyStore.getActiveJourney());
  const [isNotifOpen, setIsNotifOpen] = useState<boolean>(false);
  const [notifCount, setNotifCount] = useState<number>(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isPersonaOpen, setIsPersonaOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsub = safetyStore.subscribe(() => {
      setCurrentUser(safetyStore.getCurrentUser());
      setActiveJourney(safetyStore.getActiveJourney());
      setNotifCount(safetyStore.getNotifications().length);
    });
    setNotifCount(safetyStore.getNotifications().length);
    return unsub;
  }, []);

  const handleSelectPersona = (profile: Profile) => {
    safetyStore.setCurrentUser(profile);
    setIsPersonaOpen(false);
  };

  const handleQuickSOS = () => {
    const journey = safetyStore.getActiveJourney();
    if (journey) {
      SmartEscalationEngine.triggerSOS(journey.id, true);
    } else {
      // Start instant emergency journey
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
    }
  };

  const navLinks = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'SafeRoute', href: '/saferoute', icon: Compass },
    { name: 'Start Journey', href: '/journey/new', icon: Navigation },
    { name: 'WalkTogether', href: '/walktogether', icon: Users },
    { name: 'Trusted Circle', href: '/circle', icon: UserCheck },
    { name: 'Community Reports', href: '/reports', icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#080b14]/85 backdrop-blur-xl transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative p-2 rounded-xl bg-[#7cff6b]/10 border border-[#7cff6b]/30 text-[#7cff6b] group-hover:border-emerald-400/60 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]">
                  <Shield className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-lg tracking-tight text-white flex items-center gap-1">Walk<span className="text-[#7cff6b]">Safe</span></span>
                  <span className="text-[10px] text-slate-400 tracking-[0.18em] uppercase font-semibold">Guardian Network</span>
                </div>
              </Link>

              {/* Desktop Nav Links */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all ${
                        isActive
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {link.name}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2.5">
              {/* Active Journey Live Pill */}
              {activeJourney && (
                <Link
                  href={`/journey/${activeJourney.id}`}
                  className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-semibold animate-pulse transition-all bg-emerald-950/40 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Live Journey: {activeJourney.status.toUpperCase()}</span>
                </Link>
              )}

              {/* Persona Switcher Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsPersonaOpen(!isPersonaOpen)}
                  className="glass-panel px-2.5 py-1.5 rounded-xl text-xs font-medium text-slate-200 flex items-center gap-2 hover:bg-slate-800 transition-colors"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-emerald-500 to-cyan-500 flex items-center justify-center text-[10px] font-bold text-slate-950">
                    {currentUser.full_name[0]}
                  </div>
                  <span className="hidden md:inline max-w-[100px] truncate">{currentUser.full_name}</span>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isPersonaOpen && (
                  <div className="absolute right-0 mt-2 w-64 glass-panel bg-slate-900 border border-slate-700 rounded-xl p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800">
                      Switch Hackathon Persona
                    </div>
                    <div className="mt-1 space-y-1">
                      {SEEDED_PROFILES.map((p) => (
                        <button
                          key={p.id}
                          onClick={() => handleSelectPersona(p)}
                          className={`w-full p-2 rounded-lg text-left text-xs transition-colors flex items-center gap-2.5 ${
                            p.id === currentUser.id
                              ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                              : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300">
                            {p.full_name[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-white">{p.full_name}</div>
                            <div className="text-[10px] text-slate-400 truncate">{p.email}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Notification Drawer Bell */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-xl glass-panel text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="View Simulated Notifications"
              >
                <Bell className="w-4 h-4" />
                {notifCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 rounded-full bg-cyan-500 text-[10px] font-bold text-slate-950 animate-pulse">
                    {notifCount}
                  </span>
                )}
              </button>

              {/* Quick SOS Trigger Button */}
              <button
                onClick={handleQuickSOS}
                className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/30 emergency-strobe transition-all"
                title="Instant Emergency SOS"
              >
                <Flame className="w-4 h-4 fill-current" />
                <span className="hidden sm:inline">QUICK</span> SOS
              </button>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl glass-panel text-slate-300 hover:text-white"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-2 animate-in slide-in-from-top duration-200">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.name}
                </Link>
              );
            })}
          </div>
        )}
      </header>

      {/* Slide-out simulated notifications */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
    </>
  );
};

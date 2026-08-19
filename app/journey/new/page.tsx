'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { safetyStore } from '@/lib/supabase/store';
import { TransportMode } from '@/lib/types/database';
import { SAMPLE_ROUTES } from '@/lib/mock-data/seed';
import { RouteOption } from '@/lib/types/safety';
import { SafetyScoreMeter } from '@/components/common/SafetyScoreMeter';
import { InteractiveRouteMap } from '@/components/map/InteractiveRouteMap';
import {
  Navigation,
  MapPin,
  Clock,
  UserCheck,
  Users,
  Shield,
  Compass,
  CheckCircle2,
  AlertCircle,
  Footprints,
  Car,
  Train,
  Bike,
  Sparkles,
} from 'lucide-react';

export default function NewJourneyPage() {
  const router = useRouter();
  const [origin, setOrigin] = useState('Current GPS Location (Downtown Plaza)');
  const [destination, setDestination] = useState('Oak Street Apartments');
  const [destCoords, setDestCoords] = useState<{ lat: number; lng: number }>({
    lat: 37.7738,
    lng: -122.4128,
  });
  const [transportMode, setTransportMode] = useState<TransportMode>('walking');
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-safest');
  const [durationMins, setDurationMins] = useState<number>(24);
  const [gracePeriodSeconds, setGracePeriodSeconds] = useState<number>(60);
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([]);
  const [enableWalkTogether, setEnableWalkTogether] = useState<boolean>(true);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  const contacts = safetyStore.getContacts();
  const selectedRoute = SAMPLE_ROUTES.find((r) => r.id === selectedRouteId) || SAMPLE_ROUTES[0];

  useEffect(() => {
    // Select all contacts by default
    setSelectedContactIds(contacts.map((c) => c.id));
  }, [contacts]);

  const requestLiveGPS = () => {
    setIsLocating(true);
    setGeoError(null);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setIsLocating(false);
          setOrigin(`Verified GPS Coordinates (${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)})`);
        },
        (err) => {
          setIsLocating(false);
          setGeoError('Browser geolocation permission denied or unavailable. Using simulated high-accuracy GPS.');
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setIsLocating(false);
      setGeoError('Geolocation not supported by browser. Using demo GPS.');
    }
  };

  const handleToggleContact = (id: string) => {
    setSelectedContactIds((prev) =>
      prev.includes(id) ? prev.filter((cId) => cId !== id) : [...prev, id]
    );
  };

  const handleStartJourney = (e: React.FormEvent) => {
    e.preventDefault();
    const expectedArrival = new Date(Date.now() + durationMins * 60 * 1000).toISOString();

    const journey = safetyStore.startJourney({
      origin_name: origin,
      origin_lat: 37.7805,
      origin_lng: -122.4225,
      dest_name: destination,
      dest_lat: destCoords.lat,
      dest_lng: destCoords.lng,
      transport_mode: transportMode,
      route_name: selectedRoute.name,
      safety_score: selectedRoute.safetyScore,
      distance_km: selectedRoute.distanceKm,
      estimated_duration_mins: durationMins,
      expected_arrival_at: expectedArrival,
      grace_period_seconds: gracePeriodSeconds,
    });

    router.push(`/journey/${journey.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-4">
      {/* Header */}
      <div className="space-y-1">
        <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider">
          <Navigation className="w-4 h-4" />
          <span>Active Journey Configurator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-white">Start a Monitored Safety Journey</h1>
        <p className="text-xs text-slate-400">
          WalkSafe will compute the safest route, monitor your progress via GPS, and check in automatically if delayed.
        </p>
      </div>

      <form onSubmit={handleStartJourney} className="space-y-8">
        {/* SECTION 1: ORIGIN & DESTINATION */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
            1. Locations & Transport Mode
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Origin */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-300">Origin (Starting Point)</label>
                <button
                  type="button"
                  onClick={requestLiveGPS}
                  className="text-[11px] text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <MapPin className="w-3 h-3" />
                  {isLocating ? 'Acquiring GPS...' : 'Use Live GPS'}
                </button>
              </div>
              <div className="relative">
                <MapPin className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
              {geoError && <p className="text-[11px] text-amber-400 mt-1">{geoError}</p>}
            </div>

            {/* Destination */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Destination</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-cyan-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="e.g. Oak Street Apartments or Metro Hub"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Transport Mode */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">Transport Mode</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { id: 'walking' as TransportMode, label: 'Walking', icon: Footprints },
                { id: 'transit' as TransportMode, label: 'Public Transit', icon: Train },
                { id: 'rideshare' as TransportMode, label: 'Rideshare / Taxi', icon: Car },
                { id: 'cycling' as TransportMode, label: 'Cycling', icon: Bike },
              ].map((mode) => {
                const Icon = mode.icon;
                const isSelected = transportMode === mode.id;
                return (
                  <button
                    key={mode.id}
                    type="button"
                    onClick={() => setTransportMode(mode.id)}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500 shadow-md'
                        : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{mode.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* SECTION 2: AI SAFEROUTE SELECTOR */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Compass className="w-4 h-4 text-emerald-400" />
              2. Select AI SafeRoute Option
            </h2>
            <span className="text-[10px] text-slate-400">Score based on street lighting & historical reports</span>
          </div>

          {/* Route Option Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {SAMPLE_ROUTES.map((r) => {
              const isSelected = selectedRouteId === r.id;
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRouteId(r.id);
                    setDurationMins(r.durationMins);
                  }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                    isSelected
                      ? 'bg-emerald-950/40 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.2)]'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide ${
                          r.type === 'safest'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : r.type === 'balanced'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {r.tag}
                      </span>
                      <h3 className="font-bold text-white text-xs mt-1">{r.name}</h3>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black font-mono text-emerald-400">
                        {r.safetyScore}
                        <span className="text-[10px] text-slate-400">/100</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed">{r.recommendationReason}</p>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-800">
                    <span>⏱️ {r.durationMins} mins</span>
                    <span>📍 {r.distanceKm} km</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Interactive Map Visualizer */}
          <div className="pt-2">
            <InteractiveRouteMap
              routes={SAMPLE_ROUTES}
              activeRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              height="280px"
            />
          </div>
        </div>

        {/* SECTION 3: TIMING, TRUSTED CONTACTS & WALKTOGETHER */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Timing & Grace Window */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              3. ETA & Grace Window
            </h2>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Estimated Travel Duration
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={5}
                  max={60}
                  step={1}
                  value={durationMins}
                  onChange={(e) => setDurationMins(Number(e.target.value))}
                  className="w-full accent-emerald-500"
                />
                <span className="text-sm font-bold font-mono text-emerald-400 shrink-0 w-16 text-right">
                  {durationMins} mins
                </span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Expected Arrival Time:{' '}
                <span className="text-white font-semibold">
                  {new Date(Date.now() + durationMins * 60 * 1000).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Safety Check Grace Period (Non-Response Window)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { sec: 30, label: '30s (Strict)' },
                  { sec: 60, label: '60s (Standard)' },
                  { sec: 120, label: '120s (Relaxed)' },
                ].map((g) => (
                  <button
                    key={g.sec}
                    type="button"
                    onClick={() => setGracePeriodSeconds(g.sec)}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-colors ${
                      gracePeriodSeconds === g.sec
                        ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500'
                        : 'bg-slate-900 border-slate-800 text-slate-400'
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-500 mt-1.5">
                If expected arrival passes, you will have this window to confirm you are safe before SMS alerts dispatch.
              </p>
            </div>
          </div>

          {/* Trusted Contacts & WalkTogether */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              4. Alert Dispatches & Buddies
            </h2>

            <div>
              <div className="text-xs font-semibold text-slate-300 mb-2">
                Select Responders to Notify ({selectedContactIds.length}/{contacts.length})
              </div>
              <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {contacts.map((c) => {
                  const isChecked = selectedContactIds.includes(c.id);
                  return (
                    <div
                      key={c.id}
                      onClick={() => handleToggleContact(c.id)}
                      className={`p-2 rounded-lg border text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isChecked
                          ? 'bg-slate-800/90 border-emerald-500/50 text-white'
                          : 'bg-slate-950 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="accent-emerald-500 rounded"
                        />
                        <span className="font-semibold">{c.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">{c.relationship}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* WalkTogether Toggle */}
            <div className="p-3 rounded-xl bg-slate-900/80 border border-teal-500/30 flex items-start gap-3">
              <input
                type="checkbox"
                id="walktogether-optin"
                checked={enableWalkTogether}
                onChange={(e) => setEnableWalkTogether(e.target.checked)}
                className="accent-teal-500 mt-1"
              />
              <label htmlFor="walktogether-optin" className="text-xs cursor-pointer">
                <span className="font-bold text-teal-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  Enable WalkTogether Route Matching
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5 leading-relaxed">
                  Allow verified solo walkers with overlapping routes to request pairing. Your exact GPS remains private until mutual consent.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="pt-2">
          <button
            type="submit"
            className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.99] text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-2xl shadow-emerald-500/30 transition-all"
          >
            <Shield className="w-5 h-5 text-slate-950" />
            ACTIVATE MONITORED SAFETY JOURNEY
          </button>
          <p className="text-[11px] text-slate-500 text-center mt-2">
            By activating, you authorize continuous browser location tracking until you confirm safe arrival.
          </p>
        </div>
      </form>
    </div>
  );
}

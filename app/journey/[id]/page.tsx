'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { safetyStore } from '@/lib/supabase/store';
import { SafetyJourney, SafetyEvent } from '@/lib/types/database';
import { SAMPLE_ROUTES, SEEDED_COMMUNITY_REPORTS } from '@/lib/mock-data/seed';
import { InteractiveRouteMap } from '@/components/map/InteractiveRouteMap';
import { StatusBadge } from '@/components/common/StatusBadge';
import { SafetyCheckModal } from '@/components/journey/SafetyCheckModal';
import { EmergencyOverlay } from '@/components/journey/EmergencyOverlay';
import { SmartEscalationEngine } from '@/lib/safety-engine/escalation';
import { useDemo } from '@/lib/safety-engine/demo-controller';
import { AIJourneyAnomalyDetector } from '@/lib/safety-engine/ai-anomaly-detector';
import { realtimeGPSEngine, LiveTelemetryPacket } from '@/lib/safety-engine/gps-simulator';
import {
  Navigation,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Flame,
  Phone,
  ArrowLeft,
  Activity,
  MapPin,
  Sparkles,
  KeyRound,
  ShieldAlert,
  Zap,
  Compass,
  Smartphone,
  RotateCcw,
} from 'lucide-react';

export default function ActiveJourneyPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { isDemoActive, currentStep } = useDemo();

  const [journey, setJourney] = useState<SafetyJourney | null>(safetyStore.getActiveJourney());
  const [events, setEvents] = useState<SafetyEvent[]>([]);
  const [telemetry, setTelemetry] = useState<LiveTelemetryPacket>(realtimeGPSEngine.getTelemetryPacket());
  const [showSafeArrivalModal, setShowSafeArrivalModal] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string>('');
  const [isHardwareGPS, setIsHardwareGPS] = useState<boolean>(false);

  useEffect(() => {
    const current = safetyStore.getActiveJourney();
    setJourney(current);
    if (current) {
      setEvents(safetyStore.getEvents(current.id));
    }

    const unsubStore = safetyStore.subscribe(() => {
      const updated = safetyStore.getActiveJourney();
      setJourney(updated);
      if (updated) {
        setEvents([...safetyStore.getEvents(updated.id)]);
      }
    });

    const unsubGPS = realtimeGPSEngine.subscribe((packet) => {
      setTelemetry(packet);
    });

    return () => {
      unsubStore();
      unsubGPS();
    };
  }, []);

  if (!journey) {
    return (
      <div className="max-w-xl mx-auto py-20 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 inline-flex text-emerald-400">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <h2 className="text-2xl font-bold text-white">No Active Journey In Progress</h2>
        <p className="text-xs text-slate-400">
          Your previous journey was safely completed or cancelled. You can start a new monitored trip anytime.
        </p>
        <button
          onClick={() => router.push('/journey/new')}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg"
        >
          Start New Safety Journey
        </button>
      </div>
    );
  }

  const anomalyStatus = AIJourneyAnomalyDetector.analyzeTelemetry({
    currentLat: telemetry.lat,
    currentLng: telemetry.lng,
    speedMps: telemetry.speedMps,
    accuracyMeters: telemetry.accuracyMeters,
    batteryLevelPercent: telemetry.batteryPercent,
    timeSinceLastMovementSeconds: telemetry.stationaryDurationSeconds,
    distanceFromPlannedRouteMeters: telemetry.isOffRoute ? 180 : 10,
    currentSegmentRiskLevel: telemetry.currentSegmentRisk,
  });

  const handleToggleHardwareGPS = () => {
    const next = !isHardwareGPS;
    setIsHardwareGPS(next);
    realtimeGPSEngine.toggleHardwareGPS(next);
  };

  const handleSafeArrival = (e: React.FormEvent) => {
    e.preventDefault();
    const user = safetyStore.getCurrentUser();
    if (pinInput && pinInput !== user.emergency_pin && pinInput !== '1234') {
      setPinError('Incorrect Safety PIN (Demo default: 1234)');
      return;
    }
    safetyStore.completeJourney();
    setShowSafeArrivalModal(false);
    router.push('/dashboard');
  };

  const handleExtendETA = (mins: number) => {
    safetyStore.extendETA(mins);
  };

  const handleManualSOS = () => {
    SmartEscalationEngine.triggerSOS(journey.id, true);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* 1. TOP STATUS BAR */}
      <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-1 text-slate-400 hover:text-white rounded transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-xs font-mono uppercase text-slate-400">
              Live Journey ID: {journey.id.slice(0, 14)}
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <span>En Route to {journey.dest_name}</span>
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge status={journey.status} size="lg" />

          <button
            onClick={handleToggleHardwareGPS}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors border ${
              isHardwareGPS
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                : 'glass-panel text-slate-300 hover:text-white border-slate-700'
            }`}
            title="Switch between live physical phone GPS and realistic physics simulator"
          >
            <Smartphone className="w-4 h-4" />
            <span>{isHardwareGPS ? 'Live Device GPS Active' : 'IRL Simulator Mode'}</span>
          </button>

          <button
            onClick={() => setShowSafeArrivalModal(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            I Have Arrived Safely
          </button>
        </div>
      </div>

      {/* 2. MAIN SPLIT: MAP & TELEMETRY */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Real-World Street Map Visualizer */}
        <div className="lg:col-span-2 space-y-4">
          <InteractiveRouteMap
            routes={SAMPLE_ROUTES}
            activeRouteId="route-safest"
            reports={SEEDED_COMMUNITY_REPORTS}
            height="460px"
          />

          {/* AI Telemetry Anomaly Panel */}
          <div
            className={`p-4 rounded-2xl border transition-all ${
              anomalyStatus.hasAnomaly
                ? 'bg-amber-950/40 border-amber-500/60 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                : 'glass-panel border-slate-800'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-cyan-300">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Journey Signal & Telemetry Monitor</span>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${
                  anomalyStatus.hasAnomaly
                    ? 'bg-amber-500 text-slate-950 font-black'
                    : 'bg-emerald-500/20 text-emerald-300'
                }`}
              >
                {anomalyStatus.hasAnomaly ? 'ANOMALY DETECTED' : 'NORMAL TRACKING'}
              </span>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed font-sans">
              {anomalyStatus.naturalLanguageReason}
            </p>

            <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400 font-mono">
              <div>GPS Accuracy: ~{telemetry.accuracyMeters}m</div>
              <div>Battery Level: {telemetry.batteryPercent}%</div>
              <div>Confidence: {anomalyStatus.confidencePercent}%</div>
            </div>
          </div>

          {/* Real-time Telemetry Metrics Bar */}
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-panel p-3.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Distance Remaining</div>
              <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">
                {telemetry.distanceRemainingMeters}m
              </div>
              <div className="text-[10px] text-slate-500">
                {telemetry.progressPercent}% Route Complete
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Current Pace & Bearing</div>
              <div className="text-xl font-mono font-black text-cyan-400 mt-0.5">
                {telemetry.speedKmh} km/h
              </div>
              <div className="text-[10px] text-slate-500">
                Bearing: {telemetry.headingDegrees}° • {telemetry.speedMps} m/s
              </div>
            </div>

            <div className="glass-panel p-3.5 rounded-xl text-center">
              <div className="text-[10px] text-slate-400 uppercase font-semibold">Route Safety Score</div>
              <div className="text-xl font-mono font-black text-emerald-400 mt-0.5">
                {journey.safety_score}/100
              </div>
              <div className="text-[10px] text-slate-500">High-Illumination Path</div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Control Panel & Escalation Audit Timeline */}
        <div className="space-y-6">
          {/* Action Quick Panel */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Activity className="w-4 h-4 text-emerald-400" />
              In-Journey Safety Actions
            </h3>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleExtendETA(5)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  +5 Mins Buffer
                </button>
                <button
                  onClick={() => handleExtendETA(15)}
                  className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1 transition-colors"
                >
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  +15 Mins Buffer
                </button>
              </div>

              <button
                onClick={() => {
                  safetyStore.logEvent(journey.id, 'safety_check_confirmed', 'info', {
                    manual_check_in: true,
                    note: `User confirmed safe progress at coordinates ${telemetry.lat}, ${telemetry.lng}`,
                  });
                }}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Check In Now (Log Safe Progress)
              </button>

              <button
                onClick={handleManualSOS}
                className="w-full py-3 px-3 rounded-xl bg-rose-600/90 hover:bg-rose-600 active:scale-95 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-rose-600/30 transition-all"
              >
                <Flame className="w-4 h-4 fill-current" />
                Trigger Emergency SOS
              </button>
            </div>
          </div>

          {/* Escalation Audit Timeline */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Escalation Event Audit Log
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">{events.length} Events</span>
            </div>

            <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
              {events.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-500">
                  Monitoring started. No escalation events logged.
                </div>
              ) : (
                events.map((ev) => (
                  <div key={ev.id} className="flex items-start gap-2.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                        ev.severity === 'critical'
                          ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,1)]'
                          : ev.severity === 'high'
                          ? 'bg-orange-500'
                          : ev.severity === 'medium'
                          ? 'bg-amber-400'
                          : 'bg-emerald-400'
                      }`}
                    />
                    <div className="space-y-0.5">
                      <div className="font-bold text-white">
                        {ev.event_type.replace(/_/g, ' ').toUpperCase()}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {ev.details_json?.reason || ev.details_json?.note || 'Telemetry recorded successfully.'}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        {new Date(ev.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. SAFETY CHECK DIALOG (SHOWN WHEN CHECK REQUIRED) */}
      <SafetyCheckModal
        journeyId={journey.id}
        isOpen={journey.status === 'check_required'}
        onResolved={() => {
          setJourney(safetyStore.getActiveJourney());
        }}
      />

      {/* 4. EMERGENCY SOS FULLSCREEN OVERLAY (SHOWN WHEN IN SOS MODE) */}
      <EmergencyOverlay
        journeyId={journey.id}
        isOpen={journey.status === 'sos'}
      />

      {/* 5. SAFE ARRIVAL VERIFICATION MODAL */}
      {showSafeArrivalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 inline-flex">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-white">Confirm Safe Arrival</h3>
              <p className="text-xs text-slate-400">
                Glad you made it safely! Your Trusted Circle will receive an automated arrival confirmation.
              </p>
            </div>

            <form onSubmit={handleSafeArrival} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-Digit PIN (1234)"
                  className="w-full text-center text-xl tracking-[0.4em] font-mono py-2.5 px-3 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-emerald-500 focus:outline-none"
                  autoFocus
                />
                {pinError && <p className="text-xs text-rose-400 mt-1.5">{pinError}</p>}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowSafeArrivalModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs"
                >
                  Confirm Arrival
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

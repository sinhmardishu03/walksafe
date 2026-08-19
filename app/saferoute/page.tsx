'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SAMPLE_ROUTES, SEEDED_COMMUNITY_REPORTS } from '@/lib/mock-data/seed';
import { RouteOption } from '@/lib/types/safety';
import { InteractiveRouteMap } from '@/components/map/InteractiveRouteMap';
import { SafetyScoreMeter } from '@/components/common/SafetyScoreMeter';
import { safetyStore } from '@/lib/supabase/store';
import { TransparentRiskAnalysisEngine } from '@/lib/saferoute/ai-risk-engine';
import {
  Compass,
  Shield,
  Clock,
  MapPin,
  AlertTriangle,
  Lightbulb,
  Building,
  Users,
  AlertCircle,
  CheckCircle2,
  Navigation,
  ChevronRight,
  Info,
  ShieldAlert,
  Sparkles,
  Sun,
  Moon,
  TrendingUp,
} from 'lucide-react';

export default function SafeRoutePage() {
  const router = useRouter();
  const [selectedRouteId, setSelectedRouteId] = useState<string>('route-safest');
  const [originText] = useState('University Campus Quad');
  const [destText] = useState('Oak Street Apartments');
  const [selectedSegmentIdx, setSelectedSegmentIdx] = useState<number | null>(null);
  const [isNighttime, setIsNighttime] = useState<boolean>(true);

  const selectedRoute = SAMPLE_ROUTES.find((r) => r.id === selectedRouteId) || SAMPLE_ROUTES[0];

  // AI Reasoning Generation
  const aiExplanation = TransparentRiskAnalysisEngine.generateAIExplanation(
    selectedRoute.name,
    selectedRoute.type,
    isNighttime ? selectedRoute.safetyScore : Math.min(99, selectedRoute.safetyScore + 6),
    {
      lightingScore: selectedRoute.factors.lighting,
      infrastructureScore: selectedRoute.factors.infrastructureScore,
      incidentDensityScore: selectedRoute.factors.incidentDensityScore,
      emergencyProximityScore: selectedRoute.factors.emergencyProximity,
      footTrafficScore: selectedRoute.factors.footTraffic,
      isolationRiskPenalty: selectedRoute.factors.isolationRisk,
      timeOfDayPenalty: isNighttime ? 8 : 0,
    },
    selectedRoute.distanceKm,
    selectedRoute.durationMins
  );

  const handleStartOnRoute = (route: RouteOption) => {
    const journey = safetyStore.startJourney({
      origin_name: originText,
      origin_lat: 37.7805,
      origin_lng: -122.4225,
      dest_name: destText,
      dest_lat: 37.7738,
      dest_lng: -122.4128,
      transport_mode: 'walking',
      route_name: route.name,
      safety_score: route.safetyScore,
      distance_km: route.distanceKm,
      estimated_duration_mins: route.durationMins,
      expected_arrival_at: new Date(Date.now() + route.durationMins * 60 * 1000).toISOString(),
      grace_period_seconds: 60,
    });
    router.push(`/journey/${journey.id}`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto py-4">
      {/* 1. HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <Compass className="w-4 h-4" />
            <span>AI SafeRoute Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">
            Multi-Route Safety Intelligence & Analysis
          </h1>
          <p className="text-xs text-slate-400 max-w-xl">
            Transparent multi-factor risk assessment evaluating municipal streetlights, business hours, emergency proximity, and recent community incident reports.
          </p>
        </div>

        {/* Time of Day Heuristic Toggle */}
        <div className="flex items-center gap-2 self-start md:self-auto">
          <div className="glass-panel px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2 text-xs">
            <span className="text-slate-400 font-medium">Time Scenario:</span>
            <button
              onClick={() => setIsNighttime(!isNighttime)}
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-colors ${
                isNighttime
                  ? 'bg-indigo-900/80 text-indigo-300 border border-indigo-500/40'
                  : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              }`}
            >
              {isNighttime ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-indigo-400" />
                  Night (11:00 PM) -8pts
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  Day (2:00 PM)
                </>
              )}
            </button>
          </div>

          <button
            onClick={() => handleStartOnRoute(selectedRoute)}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/25 transition-all"
          >
            <Navigation className="w-4 h-4" />
            Select Route & Start Journey
          </button>
        </div>
      </div>

      {/* 2. MAP & ROUTE SELECTION GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Interactive Map & Segment Risk Inspector */}
        <div className="lg:col-span-2 space-y-4">
          <InteractiveRouteMap
            routes={SAMPLE_ROUTES}
            activeRouteId={selectedRouteId}
            onSelectRoute={(id) => {
              setSelectedRouteId(id);
              setSelectedSegmentIdx(null);
            }}
            reports={SEEDED_COMMUNITY_REPORTS}
            height="440px"
          />

          {/* AI Route Intelligence Card */}
          <div className="glass-panel p-5 rounded-2xl border border-cyan-500/40 bg-slate-900/80 space-y-3 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>AI Safety Reasoning & Context Engine</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 font-mono">
                Model: Rule-Engine + Contextual Heuristics
              </span>
            </div>

            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {aiExplanation.summary}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-amber-400 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  Illumination Assessment
                </div>
                <div className="text-[11px] text-slate-300">{aiExplanation.illuminationAssessment}</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-cyan-400 flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5" />
                  Open Facilities & Refuge
                </div>
                <div className="text-[11px] text-slate-300">{aiExplanation.amenitiesAssessment}</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-purple-400 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5" />
                  Incident Telemetry
                </div>
                <div className="text-[11px] text-slate-300">{aiExplanation.incidentHistoryAssessment}</div>
              </div>

              <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  Recommended Trade-Off
                </div>
                <div className="text-[11px] text-slate-300">{aiExplanation.recommendedTradeoff}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Route Alternative Cards */}
        <div className="space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span>Route Alternatives</span>
            <span className="text-[10px] text-slate-500">Safest vs Fastest</span>
          </div>

          <div className="space-y-3">
            {SAMPLE_ROUTES.map((r) => {
              const isSelected = selectedRouteId === r.id;
              const displayScore = isNighttime ? r.safetyScore : Math.min(99, r.safetyScore + 6);
              return (
                <div
                  key={r.id}
                  onClick={() => {
                    setSelectedRouteId(r.id);
                    setSelectedSegmentIdx(null);
                  }}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all space-y-3 ${
                    isSelected
                      ? 'bg-slate-900 border-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.15)]'
                      : 'glass-panel border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          r.type === 'safest'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : r.type === 'balanced'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {r.tag}
                      </span>
                      <h3 className="font-bold text-white text-sm mt-1">{r.name}</h3>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-emerald-400">
                        {displayScore}
                        <span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{r.recommendationReason}</p>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                    <span className="flex items-center gap-1 font-semibold text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {r.durationMins} mins
                    </span>
                    <span>{r.distanceKm} km distance</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Factor Breakdown Scorecard */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
              <span>Transparent Factor Weights</span>
              <span className="font-mono text-emerald-400 text-xs">{selectedRoute.safetyScore}/100</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    Street Lighting Quality (25%)
                  </span>
                  <span className="font-bold text-emerald-400">{selectedRoute.factors.lighting}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-amber-400 h-1.5 rounded-full"
                    style={{ width: `${selectedRoute.factors.lighting}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-cyan-400" />
                    Open Facilities & Stores (20%)
                  </span>
                  <span className="font-bold text-cyan-400">{selectedRoute.factors.infrastructureScore}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-cyan-400 h-1.5 rounded-full"
                    style={{ width: `${selectedRoute.factors.infrastructureScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-teal-400" />
                    Pedestrian Foot Traffic (15%)
                  </span>
                  <span className="font-bold text-teal-400">{selectedRoute.factors.footTraffic}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-teal-400 h-1.5 rounded-full"
                    style={{ width: `${selectedRoute.factors.footTraffic}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-purple-400" />
                    Incident Density Score (25%)
                  </span>
                  <span className="font-bold text-purple-400">{selectedRoute.factors.incidentDensityScore}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-purple-400 h-1.5 rounded-full"
                    style={{ width: `${selectedRoute.factors.incidentDensityScore}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-slate-300 mb-1">
                  <span className="flex items-center gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                    Isolation Risk Penalty (15%)
                  </span>
                  <span className="font-bold text-rose-400">-{selectedRoute.factors.isolationRisk}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div
                    className="bg-rose-400 h-1.5 rounded-full"
                    style={{ width: `${selectedRoute.factors.isolationRisk}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TRANSPARENT LEGAL & ALGORITHMIC DISCLAIMER */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 bg-slate-950/60 flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-slate-200">Algorithmic Transparency & Risk Disclaimer:</strong>
          <p className="leading-relaxed">
            {TransparentRiskAnalysisEngine.getDisclaimer()}
          </p>
        </div>
      </div>
    </div>
  );
}

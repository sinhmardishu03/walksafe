'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDemo, DEMO_SCENARIO_STEPS } from '@/lib/safety-engine/demo-controller';
import { safetyStore } from '@/lib/supabase/store';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ShieldAlert,
  Flame,
  CheckCircle,
  AlertTriangle,
  Navigation,
  Eye,
} from 'lucide-react';

export const DemoControllerBar: React.FC = () => {
  const router = useRouter();
  const {
    isDemoActive,
    currentStepIndex,
    currentStep,
    isPlaying,
    playbackSpeed,
    startDemoScenario,
    nextStep,
    prevStep,
    goToStep,
    togglePlayPause,
    setPlaybackSpeed,
    resetDemo,
  } = useDemo();

  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const handleLaunchAndNavigate = () => {
    startDemoScenario();
    const journey = safetyStore.getActiveJourney();
    if (journey) {
      router.push(`/journey/${journey.id}`);
    }
  };

  const handleStageClick = (idx: number) => {
    goToStep(idx);
    const journey = safetyStore.getActiveJourney();
    if (journey) {
      router.push(`/journey/${journey.id}`);
    }
  };

  return (
    <aside
      aria-label="Hackathon Demo Controller"
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 w-[96%] max-w-4xl transition-all duration-300 select-none"
    >
      <div className="bg-slate-900/95 border-2 border-cyan-500/60 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_25px_rgba(6,182,212,0.35)] backdrop-blur-xl overflow-hidden">
        {/* Header Bar */}
        <div className="bg-slate-950/90 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Presentation Flow Simulator
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:inline">
              (AI SafeRoute → Deviation → Safety Check → SMS Alert → SOS)
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!isDemoActive ? (
              <button
                onClick={handleLaunchAndNavigate}
                className="px-3.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500 to-emerald-400 hover:from-cyan-400 hover:to-emerald-300 text-slate-950 font-black text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                ⚡ Run Presentation Flow
              </button>
            ) : (
              <button
                onClick={resetDemo}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 transition-colors"
                title="Reset scenario"
              >
                <RotateCcw className="w-3 h-3" />
                Reset State
              </button>
            )}

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title={isExpanded ? 'Minimize controls' : 'Expand controls'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Expandable Controls Body */}
        {isExpanded && (
          <div className="p-3 sm:p-4 space-y-3">
            {/* Step Selection Tabs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-1.5">
              {DEMO_SCENARIO_STEPS.map((step, idx) => {
                const isActive = isDemoActive && currentStepIndex === idx;
                const isPast = isDemoActive && currentStepIndex > idx;

                let stateColor = 'border-slate-800 text-slate-400 hover:bg-slate-800/60';
                if (isActive) {
                  if (step.status === 'sos') {
                    stateColor = 'border-rose-500 bg-rose-950/80 text-rose-300 font-bold shadow-[0_0_15px_rgba(244,63,94,0.5)] emergency-strobe';
                  } else if (step.status === 'alert') {
                    stateColor = 'border-orange-500 bg-orange-950/80 text-orange-300 font-bold shadow-[0_0_12px_rgba(249,115,22,0.4)]';
                  } else if (step.status === 'check_required') {
                    stateColor = 'border-amber-500 bg-amber-950/80 text-amber-300 font-bold shadow-[0_0_12px_rgba(245,158,11,0.4)]';
                  } else {
                    stateColor = 'border-cyan-500 bg-cyan-950/80 text-cyan-300 font-bold shadow-[0_0_12px_rgba(6,182,212,0.3)]';
                  }
                } else if (isPast) {
                  stateColor = 'border-slate-700 bg-slate-800/40 text-slate-300';
                }

                return (
                  <button
                    key={step.id}
                    onClick={() => handleStageClick(idx)}
                    className={`p-2 rounded-xl border text-left transition-all flex flex-col justify-between ${stateColor}`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] uppercase font-mono tracking-wider font-semibold">
                        Stage {step.id}
                      </span>
                      {step.status === 'sos' && <Flame className="w-3.5 h-3.5 text-rose-400" />}
                      {step.status === 'alert' && <ShieldAlert className="w-3.5 h-3.5 text-orange-400" />}
                      {step.status === 'check_required' && <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />}
                      {step.status === 'active' && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                    </div>
                    <span className="text-xs font-semibold mt-1 truncate">
                      {step.title.replace(/^\d+\.\s*/, '')}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Current Step Description & Playback Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/70 p-2.5 rounded-xl border border-slate-800">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-white mr-1.5">{currentStep.title}:</span>
                  <span className="text-slate-300">{currentStep.shortDesc}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                <button
                  onClick={prevStep}
                  disabled={currentStepIndex === 0}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Previous stage"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={togglePlayPause}
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 transition-all shadow"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      Pause
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      Auto-Play
                    </>
                  )}
                </button>

                <button
                  onClick={nextStep}
                  disabled={currentStepIndex === DEMO_SCENARIO_STEPS.length - 1}
                  className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 disabled:opacity-40 transition-colors"
                  title="Next stage"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Speed Toggle */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-lg p-0.5 ml-1 text-xs">
                  {[1, 2, 5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => setPlaybackSpeed(spd)}
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        playbackSpeed === spd
                          ? 'bg-cyan-500 text-slate-950'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};

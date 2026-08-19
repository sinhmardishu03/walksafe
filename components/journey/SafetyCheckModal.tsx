'use client';

import React, { useState, useEffect } from 'react';
import { safetyStore } from '@/lib/supabase/store';
import { safetyAudio, SmartEscalationEngine } from '@/lib/safety-engine/escalation';
import { AlertTriangle, CheckCircle, Clock, ShieldAlert, HeartHandshake } from 'lucide-react';

interface SafetyCheckModalProps {
  journeyId: string;
  isOpen: boolean;
  onResolved: () => void;
}

export const SafetyCheckModal: React.FC<SafetyCheckModalProps> = ({ journeyId, isOpen, onResolved }) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(45);

  useEffect(() => {
    if (!isOpen) {
      setSecondsRemaining(45);
      return;
    }

    safetyAudio.playCheckInPing();

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Escalation: Timer expired without response -> Trigger Alert
          SmartEscalationEngine.triggerAlert(journeyId, '45-second in-app safety check timed out without confirmation');
          onResolved();
          return 0;
        }
        if (prev <= 15) {
          safetyAudio.playCountdownTick();
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, journeyId, onResolved]);

  if (!isOpen) return null;

  const handleConfirmSafe = () => {
    safetyStore.updateJourneyStatus('active');
    safetyStore.logEvent(journeyId, 'safety_check_confirmed', 'info', {
      method: 'in_app_modal_button',
      timestamp: new Date().toISOString(),
    });
    onResolved();
  };

  const handleExtend = (mins: number) => {
    safetyStore.extendETA(mins);
    onResolved();
  };

  const handleImmediateHelp = () => {
    SmartEscalationEngine.triggerSOS(journeyId, true);
    onResolved();
  };

  const progressPercent = (secondsRemaining / 45) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-slate-900 border-2 border-amber-500/80 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.25)] overflow-hidden text-center">
        {/* Header Ribbon */}
        <div className="bg-amber-500/20 border-b border-amber-500/40 p-4 flex items-center justify-center gap-2">
          <AlertTriangle className="w-6 h-6 text-amber-400 animate-bounce" />
          <span className="font-bold text-amber-300 text-lg uppercase tracking-wide">
            Safety Check Required
          </span>
        </div>

        <div className="p-6 space-y-6">
          <p className="text-slate-300 text-sm">
            You have not reached your destination or movement stopped. Please confirm you are safe before escalation begins.
          </p>

          {/* Countdown Clock */}
          <div className="relative w-32 h-32 mx-auto flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="currentColor"
                strokeWidth="8"
                className="text-slate-800"
                fill="transparent"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke={secondsRemaining <= 10 ? '#f43f5e' : '#f59e0b'}
                strokeWidth="8"
                strokeDasharray={351.8}
                strokeDashoffset={351.8 - (progressPercent / 100) * 351.8}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-linear"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className={`text-4xl font-extrabold font-mono ${secondsRemaining <= 10 ? 'text-rose-400 animate-pulse' : 'text-amber-400'}`}>
                {secondsRemaining}s
              </span>
              <span className="text-[10px] text-slate-400 uppercase">Auto-Escalate</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleConfirmSafe}
              className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 active:scale-[0.98] text-slate-950 font-bold text-base shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all"
            >
              <CheckCircle className="w-5 h-5 text-slate-950" />
              I Am Safe (Everything is Fine)
            </button>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => handleExtend(5)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Clock className="w-4 h-4 text-cyan-400" />
                Add +5 Mins
              </button>
              <button
                onClick={() => handleExtend(15)}
                className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-[0.98] text-slate-200 text-xs font-semibold border border-slate-700 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Clock className="w-4 h-4 text-cyan-400" />
                Add +15 Mins
              </button>
            </div>

            <button
              onClick={handleImmediateHelp}
              className="w-full py-3 px-4 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-600/60 active:scale-[0.98] text-rose-300 font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              I Feel Unsafe — Trigger Emergency SOS
            </button>
          </div>
        </div>

        <div className="bg-slate-950 p-3 text-[11px] text-slate-500 border-t border-slate-800">
          Failure to respond will automatically alert your Trusted Circle with live coordinates.
        </div>
      </div>
    </div>
  );
};

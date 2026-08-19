'use client';

import React, { useState } from 'react';
import { safetyStore } from '@/lib/supabase/store';
import { SmartEscalationEngine } from '@/lib/safety-engine/escalation';
import { Flame, Phone, ShieldAlert, KeyRound, Check, X, AlertCircle } from 'lucide-react';

interface EmergencyOverlayProps {
  journeyId: string;
  isOpen: boolean;
}

export const EmergencyOverlay: React.FC<EmergencyOverlayProps> = ({ journeyId, isOpen }) => {
  const [pinInput, setPinInput] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [showPinModal, setShowPinModal] = useState<boolean>(false);

  if (!isOpen) return null;

  const journey = safetyStore.getActiveJourney();
  const user = safetyStore.getCurrentUser();
  const contacts = safetyStore.getContacts().filter((c) => c.notify_on_sos);

  const handleCancelSOS = (e: React.FormEvent) => {
    e.preventDefault();
    const success = SmartEscalationEngine.cancelSOS(journeyId, pinInput);
    if (success) {
      setShowPinModal(false);
      setPinInput('');
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid Safety PIN. (Demo default is 1234)');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-between bg-rose-950/90 backdrop-blur-xl p-4 md:p-8 animate-in fade-in overflow-y-auto text-white">
      {/* Top Banner */}
      <div className="flex flex-col items-center text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-600 border border-rose-400 emergency-strobe text-white font-extrabold uppercase tracking-widest text-sm">
          <Flame className="w-5 h-5 animate-bounce" />
          Critical SOS Mode Active
        </div>
        <h1 className="text-2xl md:text-3xl font-black tracking-tight">
          EMERGENCY DISPATCH INITIATED
        </h1>
        <p className="text-rose-200 text-xs md:text-sm max-w-xl">
          Live GPS telemetry, emergency medical data, and incident audio are being transmitted to your Trusted Circle and emergency services.
        </p>
      </div>

      {/* Center Live Data Card */}
      <div className="max-w-2xl mx-auto w-full bg-slate-950/90 border-2 border-rose-500/80 rounded-2xl p-5 md:p-6 shadow-2xl space-y-4 my-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <div className="text-xs text-slate-400 font-mono">USER IDENTITY</div>
            <div className="text-base font-bold text-white">{user.full_name}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-400 font-mono">BLOOD GROUP</div>
            <div className="text-base font-bold text-rose-400">{user.blood_group || 'O+'}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium mb-1">Last Broadcast GPS</div>
            <div className="font-mono text-emerald-400 text-sm font-bold">
              {journey ? `${journey.dest_lat.toFixed(5)}, ${journey.dest_lng.toFixed(5)}` : '37.7758, -122.4165'}
            </div>
            <div className="text-slate-500 text-[11px] mt-1">Accuracy: ~4.2m radius</div>
          </div>
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800">
            <div className="text-slate-400 font-medium mb-1">Medical Summary</div>
            <div className="text-slate-200 font-semibold">{user.medical_notes || 'No critical restrictions'}</div>
          </div>
        </div>

        {/* Notified Contacts */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Dispatched Responders ({contacts.length})
          </div>
          <div className="space-y-1.5">
            {contacts.map((c) => (
              <div
                key={c.id}
                className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="text-slate-400 text-[11px]">({c.relationship})</span>
                </div>
                <span className="font-mono text-rose-300 font-bold">ALERT SENT</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Emergency Action Buttons */}
      <div className="max-w-2xl mx-auto w-full space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <a
            href="tel:911"
            className="py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-[0.98] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-rose-600/40 transition-all text-center"
          >
            <Phone className="w-5 h-5 animate-pulse" />
            Call Emergency Services (911)
          </a>
          <button
            onClick={() => setShowPinModal(true)}
            className="py-3.5 px-4 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 active:scale-[0.98] text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <KeyRound className="w-5 h-5 text-amber-400" />
            Cancel SOS (Enter Safe PIN)
          </button>
        </div>
      </div>

      {/* PIN Unlock Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-base flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-amber-400" />
                De-escalate Emergency SOS
              </h3>
              <button
                onClick={() => setShowPinModal(false)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              To prevent forced deactivation by an attacker, enter your personal 4-digit Emergency PIN.
            </p>

            <form onSubmit={handleCancelSOS} className="space-y-4">
              <div>
                <input
                  type="password"
                  maxLength={4}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Enter 4-digit PIN (1234)"
                  className="w-full text-center text-2xl tracking-[0.5em] font-mono py-3 px-4 rounded-xl bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:outline-none text-white"
                  autoFocus
                />
                {errorMsg && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    {errorMsg}
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowPinModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300 hover:bg-slate-700"
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-slate-950 flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  Confirm PIN
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

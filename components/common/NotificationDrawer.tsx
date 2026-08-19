'use client';

import React from 'react';
import { safetyStore } from '@/lib/supabase/store';
import { MockNotification } from '@/lib/types/safety';
import { MessageSquare, Bell, X, Trash2, Smartphone, ShieldAlert, CheckCircle2 } from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = React.useState<MockNotification[]>([]);

  React.useEffect(() => {
    setNotifications(safetyStore.getNotifications());
    const unsub = safetyStore.subscribe(() => {
      setNotifications([...safetyStore.getNotifications()]);
    });
    return unsub;
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="w-full max-w-md bg-slate-900 border-l border-slate-700/70 h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white flex items-center gap-2">
                Simulated Alerts & SMS
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                  {notifications.length}
                </span>
              </h3>
              <p className="text-xs text-slate-400">Live mock deliveries to Trusted Contacts & Dispatch</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {notifications.length > 0 && (
              <button
                onClick={() => safetyStore.clearNotifications()}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors"
                title="Clear all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-slate-800/40 p-3 text-xs text-slate-400 border-b border-slate-800/80 flex items-center gap-2">
          <Bell className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>In production, these trigger Twilio SMS, Firebase Web Push, and automated emergency telephony webhooks.</span>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <MessageSquare className="w-12 h-12 mb-3 stroke-[1.5] text-slate-600" />
              <p className="text-sm font-medium text-slate-400">No simulated dispatches yet</p>
              <p className="text-xs mt-1 text-slate-600">
                Start a journey or advance the Demo Controller to trigger automated SMS dispatches.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div
                key={n.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  n.priority === 'EMERGENCY'
                    ? 'bg-rose-950/30 border-rose-500/50 shadow-[0_0_15px_rgba(244,63,94,0.15)]'
                    : n.priority === 'URGENT'
                    ? 'bg-amber-950/30 border-amber-500/40'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded tracking-wide uppercase ${
                        n.channel === 'DISPATCH'
                          ? 'bg-rose-500 text-white'
                          : 'bg-cyan-900/60 text-cyan-300 border border-cyan-700/40'
                      }`}
                    >
                      {n.channel}
                    </span>
                    <span className="text-xs font-semibold text-slate-300 truncate max-w-[170px]">
                      {n.recipientName}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">{n.timestamp}</span>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans mt-1 bg-slate-950/40 p-2 rounded-lg border border-slate-800">
                  {n.message}
                </p>
                <div className="flex items-center justify-between mt-2 pt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3 h-3" /> Delivered
                  </span>
                  <span className="text-slate-500 font-mono">{n.recipientPhone}</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-800 bg-slate-950 text-center">
          <p className="text-[11px] text-slate-500">WalkSafe Proactive Dispatch Subsystem</p>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { JourneyStatus } from '@/lib/types/database';
import { ShieldCheck, AlertTriangle, AlertOctagon, Flame } from 'lucide-react';

interface StatusBadgeProps {
  status: JourneyStatus | 'inactive';
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md', showIcon = true }) => {
  const config = {
    inactive: {
      label: 'Standby / Inactive',
      classes: 'bg-slate-800/80 text-slate-300 border-slate-700',
      dotClass: 'bg-slate-400',
      icon: ShieldCheck,
    },
    active: {
      label: 'Monitoring Active (Normal)',
      classes: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      dotClass: 'bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
      icon: ShieldCheck,
    },
    check_required: {
      label: 'Safety Check Required',
      classes: 'bg-amber-500/15 text-amber-400 border-amber-500/40 animate-pulse',
      dotClass: 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
      icon: AlertTriangle,
    },
    alert: {
      label: 'Alert Dispatched',
      classes: 'bg-orange-500/20 text-orange-400 border-orange-500/50 animate-pulse',
      dotClass: 'bg-orange-400 shadow-[0_0_12px_rgba(249,115,22,0.9)]',
      icon: AlertOctagon,
    },
    sos: {
      label: 'CRITICAL EMERGENCY SOS',
      classes: 'bg-rose-600/30 text-rose-300 border-rose-500 emergency-strobe',
      dotClass: 'bg-rose-400 shadow-[0_0_15px_rgba(244,63,94,1)]',
      icon: Flame,
    },
    completed: {
      label: 'Completed Safely',
      classes: 'bg-emerald-900/30 text-emerald-300 border-emerald-600/40',
      dotClass: 'bg-emerald-400',
      icon: ShieldCheck,
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-slate-800 text-slate-400 border-slate-700',
      dotClass: 'bg-slate-500',
      icon: ShieldCheck,
    },
  }[status] || {
    label: status,
    classes: 'bg-slate-800 text-slate-300 border-slate-700',
    dotClass: 'bg-slate-400',
    icon: ShieldCheck,
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs gap-1.5',
    md: 'px-3 py-1 text-sm gap-2',
    lg: 'px-4 py-1.5 text-base gap-2.5 font-semibold',
  }[size];

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizeClasses} ${config.classes}`}
    >
      <span className={`w-2 h-2 rounded-full ${config.dotClass}`} />
      {showIcon && <Icon className="w-4 h-4 shrink-0" />}
      <span>{config.label}</span>
    </span>
  );
};

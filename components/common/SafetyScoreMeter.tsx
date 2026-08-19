import React from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface SafetyScoreMeterProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showBreakdown?: boolean;
}

export const SafetyScoreMeter: React.FC<SafetyScoreMeterProps> = ({
  score,
  size = 'md',
}) => {
  let color = 'from-rose-500 to-amber-500 text-rose-400';
  let badgeText = 'High Risk';
  let strokeColor = '#f43f5e';

  if (score >= 85) {
    color = 'from-emerald-500 to-teal-400 text-emerald-400';
    badgeText = 'High Safety';
    strokeColor = '#10b981';
  } else if (score >= 70) {
    color = 'from-cyan-500 to-blue-500 text-cyan-400';
    badgeText = 'Moderate Safety';
    strokeColor = '#06b6d4';
  } else if (score >= 55) {
    color = 'from-amber-500 to-orange-400 text-amber-400';
    badgeText = 'Caution Advised';
    strokeColor = '#f59e0b';
  }

  const radius = size === 'sm' ? 24 : size === 'lg' ? 44 : 34;
  const strokeWidth = size === 'sm' ? 4 : size === 'lg' ? 6 : 5;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex items-center gap-3">
      <div className="relative inline-flex items-center justify-center">
        <svg
          className="transform -rotate-90"
          width={radius * 2 + strokeWidth * 2}
          height={radius * 2 + strokeWidth * 2}
        >
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke="currentColor"
            strokeWidth={strokeWidth}
            className="text-slate-800"
            fill="transparent"
          />
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <span
            className={`font-bold tracking-tight ${
              size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-lg'
            }`}
          >
            {score}
          </span>
          {size === 'lg' && <span className="text-[10px] text-slate-400 uppercase -mt-1">/100</span>}
        </div>
      </div>
      <div>
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Safety Score</span>
        </div>
        <div className={`text-sm font-semibold mt-0.5 ${color.split(' ')[2] || 'text-emerald-400'}`}>
          {badgeText}
        </div>
      </div>
    </div>
  );
};

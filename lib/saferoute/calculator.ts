import { RouteOption } from '../types/safety';
import { SAMPLE_ROUTES } from '../mock-data/seed';

export interface ScoreFactors {
  lighting: number; // 0-100
  footTraffic: number; // 0-100
  emergencyProximity: number; // 0-100
  incidentDensityScore: number; // 0-100 (100 = 0 incidents)
  infrastructureScore: number; // 0-100
  isolationRisk: number; // 0-100 (0 = very open/active, 100 = very isolated)
}

export interface CalculatedSafetyScore {
  totalScore: number;
  factors: ScoreFactors;
  timeOfDayAdjustment: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  badgeColor: string;
  disclaimer: string;
}

export function calculateSafetyScore(
  baseFactors: ScoreFactors,
  currentHour = new Date().getHours()
): CalculatedSafetyScore {
  // Time of day modifier (late night hours 22:00 to 05:00 penalize isolated/unlit routes more)
  let timeMultiplier = 1.0;
  let timeOfDayAdjustment = 0;

  if (currentHour >= 22 || currentHour < 5) {
    timeMultiplier = 0.88;
    timeOfDayAdjustment = -8;
  } else if (currentHour >= 19 || currentHour < 22) {
    timeMultiplier = 0.94;
    timeOfDayAdjustment = -4;
  }

  // Transparent Weighted Formula:
  // Lighting: 25%
  // Infrastructure & Amenities: 20%
  // Incident Density: 25%
  // Emergency Facility Proximity: 15%
  // Foot Traffic / Open Businesses: 15%
  // Isolation penalty: -0.2 * isolationRisk

  const rawScore =
    baseFactors.lighting * 0.25 +
    baseFactors.infrastructureScore * 0.2 +
    baseFactors.incidentDensityScore * 0.25 +
    baseFactors.emergencyProximity * 0.15 +
    baseFactors.footTraffic * 0.15 -
    baseFactors.isolationRisk * 0.15;

  const adjustedScore = Math.max(10, Math.min(99, Math.round(rawScore * timeMultiplier + timeOfDayAdjustment)));

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  let badgeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';

  if (adjustedScore >= 90) {
    grade = 'A+';
    badgeColor = 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10';
  } else if (adjustedScore >= 80) {
    grade = 'A';
    badgeColor = 'text-emerald-300 border-emerald-400/40 bg-emerald-400/10';
  } else if (adjustedScore >= 70) {
    grade = 'B';
    badgeColor = 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10';
  } else if (adjustedScore >= 55) {
    grade = 'C';
    badgeColor = 'text-amber-400 border-amber-500/40 bg-amber-500/10';
  } else {
    grade = 'D';
    badgeColor = 'text-rose-400 border-rose-500/40 bg-rose-500/10';
  }

  const disclaimer =
    'Safety scores are probabilistic risk estimates based on community reports, public lighting, and infrastructure density. They do not constitute an absolute guarantee of safety. Always remain alert and trust your instincts.';

  return {
    totalScore: adjustedScore,
    factors: baseFactors,
    timeOfDayAdjustment,
    grade,
    badgeColor,
    disclaimer,
  };
}

export function getRouteOptionsForCoordinates(
  _origin: [number, number],
  _destination: [number, number]
): RouteOption[] {
  // Returns realistic multi-route options for presentation
  return SAMPLE_ROUTES;
}

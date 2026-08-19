import { TransportMode, RiskLevel, RouteSafetySegment } from './database';

export interface RouteOption {
  id: string;
  name: string;
  type: 'safest' | 'balanced' | 'fastest';
  tag: string;
  distanceKm: number;
  durationMins: number;
  safetyScore: number;
  recommendationReason: string;
  factors: {
    lighting: number; // 0-100
    footTraffic: number; // 0-100
    emergencyProximity: number; // 0-100
    incidentDensityScore: number; // 0-100 (higher = fewer incidents)
    infrastructureScore: number; // 0-100
    isolationRisk: number; // 0-100 (lower is better, shown inverted or as safety)
  };
  keyHighlights: string[];
  riskWarnings: string[];
  coordinates: [number, number][]; // [lng, lat]
  segments: RouteSafetySegment[];
}

export interface DemoStep {
  id: number;
  title: string;
  shortDesc: string;
  status: 'active' | 'check_required' | 'alert' | 'sos' | 'completed';
  progressPercent: number;
  currentCoord: [number, number]; // [lng, lat]
  etaRemainingMins: number;
  triggerEvent?: string;
  notificationLog?: {
    recipient: string;
    type: 'SMS' | 'PUSH' | 'AUTOMATED CALL';
    message: string;
    timestamp: string;
  };
}

export interface MockNotification {
  id: string;
  timestamp: string;
  channel: 'SMS' | 'PUSH' | 'DISPATCH';
  recipientName: string;
  recipientPhone: string;
  message: string;
  priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}

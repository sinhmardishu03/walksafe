export type TransportMode = 'walking' | 'transit' | 'rideshare' | 'cycling';
export type JourneyStatus = 'active' | 'completed' | 'check_required' | 'alert' | 'sos' | 'cancelled';
export type SafetySeverity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type SafetyEventType =
  | 'journey_started'
  | 'route_deviation'
  | 'missed_eta'
  | 'safety_check_triggered'
  | 'safety_check_confirmed'
  | 'safety_check_missed'
  | 'alert_dispatched'
  | 'sos_activated'
  | 'sos_cancelled'
  | 'journey_completed';

export type ReportCategory =
  | 'poor_lighting'
  | 'harassment'
  | 'suspicious_activity'
  | 'isolated_area'
  | 'infrastructure_hazard'
  | 'other';

export type ReportStatus = 'verified' | 'pending' | 'resolved';
export type RiskLevel = 'low' | 'medium' | 'high';
export type WalkTogetherStatus = 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';

export interface Profile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  emergency_pin: string;
  safe_phrase: string;
  duress_code: string;
  blood_group?: string;
  medical_notes?: string;
  default_grace_period_seconds: number;
  created_at: string;
  updated_at?: string;
}

export interface TrustedContact {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  alert_priority: 1 | 2 | 3;
  notify_on_start: boolean;
  notify_on_check_missed: boolean;
  notify_on_sos: boolean;
  created_at: string;
}

export interface SafetyJourney {
  id: string;
  user_id: string;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  dest_name: string;
  dest_lat: number;
  dest_lng: number;
  transport_mode: TransportMode;
  route_name: string;
  safety_score: number;
  distance_km: number;
  estimated_duration_mins: number;
  expected_arrival_at: string;
  grace_period_seconds: number;
  status: JourneyStatus;
  started_at: string;
  completed_at?: string;
}

export interface LocationUpdate {
  id: string;
  journey_id: string;
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  accuracy?: number;
  battery_level?: number;
  created_at: string;
}

export interface SafetyEvent {
  id: string;
  journey_id: string;
  event_type: SafetyEventType;
  severity: SafetySeverity;
  details_json: Record<string, any>;
  created_at: string;
}

export interface CommunityReport {
  id: string;
  reporter_id?: string;
  category: ReportCategory;
  severity: 'low' | 'medium' | 'high' | 'urgent';
  title: string;
  description: string;
  lat: number;
  lng: number;
  location_name: string;
  upvotes: number;
  status: ReportStatus;
  created_at: string;
}

export interface RouteSafetySegment {
  id: string;
  route_id: string;
  segment_index: number;
  start_lat: number;
  start_lng: number;
  end_lat: number;
  end_lng: number;
  risk_level: RiskLevel;
  lighting_score: number;
  incident_count: number;
  nearby_amenities_count: number;
  notes?: string;
}

export interface WalkTogetherRequest {
  id: string;
  requester_id: string;
  matched_user_id: string;
  requester_name?: string;
  matched_user_name?: string;
  matched_user_badge?: string;
  journey_id?: string;
  approx_origin_lat: number;
  approx_origin_lng: number;
  approx_dest_lat: number;
  approx_dest_lng: number;
  approx_distance_meters: number;
  overlap_percentage: number;
  status: WalkTogetherStatus;
  created_at: string;
  expires_at: string;
}

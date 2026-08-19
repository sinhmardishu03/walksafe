-- WalkSafe - Complete Supabase PostgreSQL Database Schema
-- Run this in your Supabase SQL Editor or migration runner

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    avatar_url TEXT,
    emergency_pin TEXT DEFAULT '1234',
    safe_phrase TEXT DEFAULT 'Safe and sound',
    duress_code TEXT DEFAULT '9999',
    blood_group TEXT,
    medical_notes TEXT,
    default_grace_period_seconds INTEGER DEFAULT 60,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. TRUSTED CONTACTS TABLE
CREATE TABLE IF NOT EXISTS trusted_contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    relationship TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT,
    alert_priority INTEGER DEFAULT 1 CHECK (alert_priority IN (1, 2, 3)),
    notify_on_start BOOLEAN DEFAULT true,
    notify_on_check_missed BOOLEAN DEFAULT true,
    notify_on_sos BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. SAFETY JOURNEYS TABLE
CREATE TABLE IF NOT EXISTS safety_journeys (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    origin_name TEXT NOT NULL,
    origin_lat DOUBLE PRECISION NOT NULL,
    origin_lng DOUBLE PRECISION NOT NULL,
    dest_name TEXT NOT NULL,
    dest_lat DOUBLE PRECISION NOT NULL,
    dest_lng DOUBLE PRECISION NOT NULL,
    transport_mode TEXT DEFAULT 'walking' CHECK (transport_mode IN ('walking', 'transit', 'rideshare', 'cycling')),
    route_name TEXT,
    safety_score INTEGER CHECK (safety_score >= 0 AND safety_score <= 100),
    distance_km DOUBLE PRECISION,
    estimated_duration_mins INTEGER,
    expected_arrival_at TIMESTAMP WITH TIME ZONE NOT NULL,
    grace_period_seconds INTEGER DEFAULT 60,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'check_required', 'alert', 'sos', 'cancelled')),
    started_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 4. LOCATION UPDATES TABLE
CREATE TABLE IF NOT EXISTS location_updates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES safety_journeys(id) ON DELETE CASCADE NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION,
    heading DOUBLE PRECISION,
    accuracy DOUBLE PRECISION,
    battery_level INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. SAFETY EVENTS TABLE (ESCALATION AUDIT LOG)
CREATE TABLE IF NOT EXISTS safety_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    journey_id UUID REFERENCES safety_journeys(id) ON DELETE CASCADE NOT NULL,
    event_type TEXT NOT NULL CHECK (event_type IN (
        'journey_started',
        'route_deviation',
        'missed_eta',
        'safety_check_triggered',
        'safety_check_confirmed',
        'safety_check_missed',
        'alert_dispatched',
        'sos_activated',
        'sos_cancelled',
        'journey_completed'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'low', 'medium', 'high', 'critical')),
    details_json JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. COMMUNITY REPORTS TABLE
CREATE TABLE IF NOT EXISTS community_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    category TEXT NOT NULL CHECK (category IN (
        'poor_lighting',
        'harassment',
        'suspicious_activity',
        'isolated_area',
        'infrastructure_hazard',
        'other'
    )),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'urgent')),
    title TEXT NOT NULL,
    description TEXT,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    location_name TEXT,
    upvotes INTEGER DEFAULT 1,
    status TEXT DEFAULT 'verified' CHECK (status IN ('verified', 'pending', 'resolved')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. ROUTE SAFETY SEGMENTS TABLE
CREATE TABLE IF NOT EXISTS route_safety_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    route_id TEXT NOT NULL,
    segment_index INTEGER NOT NULL,
    start_lat DOUBLE PRECISION NOT NULL,
    start_lng DOUBLE PRECISION NOT NULL,
    end_lat DOUBLE PRECISION NOT NULL,
    end_lng DOUBLE PRECISION NOT NULL,
    risk_level TEXT NOT NULL CHECK (risk_level IN ('low', 'medium', 'high')),
    lighting_score INTEGER CHECK (lighting_score >= 0 AND lighting_score <= 100),
    incident_count INTEGER DEFAULT 0,
    nearby_amenities_count INTEGER DEFAULT 0,
    notes TEXT
);

-- 8. WALK TOGETHER REQUESTS TABLE
CREATE TABLE IF NOT EXISTS walk_together_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    requester_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    matched_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    journey_id UUID REFERENCES safety_journeys(id) ON DELETE SET NULL,
    approx_origin_lat DOUBLE PRECISION NOT NULL,
    approx_origin_lng DOUBLE PRECISION NOT NULL,
    approx_dest_lat DOUBLE PRECISION NOT NULL,
    approx_dest_lng DOUBLE PRECISION NOT NULL,
    overlap_percentage INTEGER CHECK (overlap_percentage >= 0 AND overlap_percentage <= 100),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired', 'completed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- INDEXES FOR HIGH PERFORMANCE REALTIME QUERIES
CREATE INDEX IF NOT EXISTS idx_safety_journeys_user_status ON safety_journeys(user_id, status);
CREATE INDEX IF NOT EXISTS idx_location_updates_journey ON location_updates(journey_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_safety_events_journey ON safety_events(journey_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_reports_coords ON community_reports(lat, lng);
CREATE INDEX IF NOT EXISTS idx_walk_together_status ON walk_together_requests(status, expires_at);

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE trusted_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_journeys ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE safety_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE route_safety_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE walk_together_requests ENABLE ROW LEVEL SECURITY;

-- Public read for community reports & route segments
CREATE POLICY "Public community reports read" ON community_reports FOR SELECT USING (true);
CREATE POLICY "Public route segments read" ON route_safety_segments FOR SELECT USING (true);

'use client';

export interface GPSCoordinate {
  lat: number;
  lng: number;
}

export interface LiveTelemetryPacket {
  lat: number;
  lng: number;
  accuracyMeters: number;
  speedKmh: number;
  speedMps: number;
  headingDegrees: number;
  distanceRemainingMeters: number;
  distanceTraveledMeters: number;
  progressPercent: number;
  batteryPercent: number;
  isOffRoute: boolean;
  isStationary: boolean;
  stationaryDurationSeconds: number;
  currentSegmentIndex: number;
  currentSegmentRisk: 'low' | 'medium' | 'high';
  timestamp: string;
  source: 'SIMULATED_IRL_PHYSICS' | 'HARDWARE_DEVICE_GPS';
}

// Highly precise real-world San Francisco street waypoints
export const REAL_STREET_WAYPOINTS: GPSCoordinate[] = [
  { lat: 37.7818, lng: -122.4242 }, // University / Library Plaza
  { lat: 37.7812, lng: -122.4228 }, // Larkin St & McAllister
  { lat: 37.7801, lng: -122.4208 }, // Civic Center Plaza (Well-lit)
  { lat: 37.7791, lng: -122.4188 }, // Grove St & Polk
  { lat: 37.7778, lng: -122.4168 }, // Market St & 8th St (Transit Corridor)
  { lat: 37.7762, lng: -122.4148 }, // 7th St & Mission
  { lat: 37.7748, lng: -122.4135 }, // Howard & 6th St
  { lat: 37.7738, lng: -122.4128 }, // Oak St Residences (Destination)
];

// Detour off-route path (diverges into isolated alley behind 7th St)
export const REAL_DETOUR_WAYPOINTS: GPSCoordinate[] = [
  { lat: 37.7778, lng: -122.4168 }, // Divergence point at 8th St
  { lat: 37.7770, lng: -122.4185 }, // Dark alleyway cut-through
  { lat: 37.7760, lng: -122.4200 }, // Isolated industrial loading dock (Stationary point)
  { lat: 37.7760, lng: -122.4200 },
];

class RealtimeGPSEngine {
  private currentCoord: GPSCoordinate = { ...REAL_STREET_WAYPOINTS[0] };
  private activeWaypoints: GPSCoordinate[] = [...REAL_STREET_WAYPOINTS];
  private currentWaypointIndex: number = 0;
  private interpolationT: number = 0; // 0 to 1 between waypoints
  private speedKmh: number = 4.8; // Standard pedestrian walking pace
  private speedMultiplier: number = 1;
  private heading: number = 135;
  private batteryPercent: number = 88;
  private distanceTraveledMeters: number = 0;
  private isOffRoute: boolean = false;
  private isStationary: boolean = false;
  private stationarySeconds: number = 0;
  private isRunning: boolean = false;
  private isUsingHardwareGPS: boolean = false;
  private hardwareWatchId: number | null = null;
  private timer: any = null;
  private breadcrumbs: GPSCoordinate[] = [{ ...REAL_STREET_WAYPOINTS[0] }];
  private listeners: Set<(packet: LiveTelemetryPacket) => void> = new Set();

  constructor() {
    this.startSimulation();
  }

  public subscribe(listener: (packet: LiveTelemetryPacket) => void) {
    this.listeners.add(listener);
    listener(this.getTelemetryPacket());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const packet = this.getTelemetryPacket();
    this.listeners.forEach((l) => l(packet));
  }

  // Haversine distance formula in meters
  public calculateDistance(c1: GPSCoordinate, c2: GPSCoordinate): number {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (c1.lat * Math.PI) / 180;
    const φ2 = (c2.lat * Math.PI) / 180;
    const Δφ = ((c2.lat - c1.lat) * Math.PI) / 180;
    const Δλ = ((c2.lng - c1.lng) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Calculate bearing in degrees (0 = North, 90 = East, 180 = South, 270 = West)
  public calculateBearing(c1: GPSCoordinate, c2: GPSCoordinate): number {
    const φ1 = (c1.lat * Math.PI) / 180;
    const φ2 = (c2.lat * Math.PI) / 180;
    const Δλ = ((c2.lng - c1.lng) * Math.PI) / 180;

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x =
      Math.cos(φ1) * Math.sin(φ2) -
      Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    const θ = Math.atan2(y, x);
    return ((θ * 180) / Math.PI + 360) % 360;
  }

  public startSimulation() {
    if (this.timer) clearInterval(this.timer);
    this.isRunning = true;

    this.timer = setInterval(() => {
      if (this.isUsingHardwareGPS) return;

      if (this.isStationary) {
        this.stationarySeconds += 1;
        // Minor realistic GPS jitter when standing still (±1 meter)
        const jitterLat = (Math.random() - 0.5) * 0.000015;
        const jitterLng = (Math.random() - 0.5) * 0.000015;
        this.currentCoord = {
          lat: this.currentCoord.lat + jitterLat,
          lng: this.currentCoord.lng + jitterLng,
        };
        this.notify();
        return;
      }

      this.stationarySeconds = 0;

      // Advance along waypoints
      if (this.currentWaypointIndex < this.activeWaypoints.length - 1) {
        const start = this.activeWaypoints[this.currentWaypointIndex];
        const end = this.activeWaypoints[this.currentWaypointIndex + 1];
        const segDist = this.calculateDistance(start, end);

        // Pedestrian walking speed ~ 1.35 m/s * multiplier
        const stepMeters = 1.35 * this.speedMultiplier;
        const deltaT = segDist > 0 ? stepMeters / segDist : 1;

        this.interpolationT += deltaT;
        this.distanceTraveledMeters += stepMeters;

        if (this.interpolationT >= 1) {
          this.currentWaypointIndex += 1;
          this.interpolationT = 0;
        }

        const currStart = this.activeWaypoints[this.currentWaypointIndex];
        const currEnd =
          this.currentWaypointIndex < this.activeWaypoints.length - 1
            ? this.activeWaypoints[this.currentWaypointIndex + 1]
            : currStart;

        // Linear interpolation with realistic micro-jitter
        const baseLat = currStart.lat + (currEnd.lat - currStart.lat) * this.interpolationT;
        const baseLng = currStart.lng + (currEnd.lng - currStart.lng) * this.interpolationT;
        const jitter = (Math.random() - 0.5) * 0.00001;

        this.currentCoord = {
          lat: baseLat + jitter,
          lng: baseLng + jitter,
        };

        if (currEnd !== currStart) {
          this.heading = Math.round(this.calculateBearing(currStart, currEnd));
        }

        // Add to breadcrumb trail every 4 meters
        const lastBreadcrumb = this.breadcrumbs[this.breadcrumbs.length - 1];
        if (!lastBreadcrumb || this.calculateDistance(lastBreadcrumb, this.currentCoord) > 4) {
          this.breadcrumbs.push({ ...this.currentCoord });
          if (this.breadcrumbs.length > 500) this.breadcrumbs.shift();
        }
      }

      this.notify();
    }, 1000);
  }

  public setSpeedMultiplier(mult: number) {
    this.speedMultiplier = Math.max(1, Math.min(20, mult));
    this.speedKmh = 4.8 * this.speedMultiplier;
    this.notify();
  }

  public triggerDetour() {
    this.isOffRoute = true;
    this.isStationary = false;
    this.activeWaypoints = [...REAL_DETOUR_WAYPOINTS];
    this.currentWaypointIndex = 0;
    this.interpolationT = 0;
    this.notify();
  }

  public triggerStationaryHalt() {
    this.isStationary = true;
    this.speedKmh = 0;
    this.notify();
  }

  public resumeNormalRoute() {
    this.isOffRoute = false;
    this.isStationary = false;
    this.activeWaypoints = [...REAL_STREET_WAYPOINTS];
    this.currentWaypointIndex = Math.min(3, this.currentWaypointIndex);
    this.interpolationT = 0;
    this.notify();
  }

  public toggleHardwareGPS(enable: boolean) {
    if (typeof window === 'undefined') return;

    if (enable && 'geolocation' in navigator) {
      this.isUsingHardwareGPS = true;
      this.hardwareWatchId = navigator.geolocation.watchPosition(
        (pos) => {
          this.currentCoord = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          this.speedKmh = pos.coords.speed ? pos.coords.speed * 3.6 : 4.5;
          this.heading = pos.coords.heading || this.heading;
          this.breadcrumbs.push({ ...this.currentCoord });
          this.notify();
        },
        (err) => {
          console.warn('Hardware GPS error, falling back to IRL physics simulation', err);
          this.isUsingHardwareGPS = false;
        },
        { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
      );
    } else {
      this.isUsingHardwareGPS = false;
      if (this.hardwareWatchId !== null && navigator.geolocation) {
        navigator.geolocation.clearWatch(this.hardwareWatchId);
        this.hardwareWatchId = null;
      }
      this.notify();
    }
  }

  public resetSimulation() {
    this.currentCoord = { ...REAL_STREET_WAYPOINTS[0] };
    this.activeWaypoints = [...REAL_STREET_WAYPOINTS];
    this.currentWaypointIndex = 0;
    this.interpolationT = 0;
    this.speedMultiplier = 1;
    this.speedKmh = 4.8;
    this.isOffRoute = false;
    this.isStationary = false;
    this.stationarySeconds = 0;
    this.distanceTraveledMeters = 0;
    this.breadcrumbs = [{ ...REAL_STREET_WAYPOINTS[0] }];
    this.notify();
  }

  public getTelemetryPacket(): LiveTelemetryPacket {
    const dest = REAL_STREET_WAYPOINTS[REAL_STREET_WAYPOINTS.length - 1];
    const distRemaining = Math.max(0, Math.round(this.calculateDistance(this.currentCoord, dest)));
    const totalDist = 2100;
    const progress = Math.min(100, Math.max(0, Math.round(((totalDist - distRemaining) / totalDist) * 100)));

    let riskLevel: 'low' | 'medium' | 'high' = 'low';
    if (this.isOffRoute) riskLevel = 'high';
    else if (this.currentWaypointIndex >= 4) riskLevel = 'medium';

    return {
      lat: Number(this.currentCoord.lat.toFixed(6)),
      lng: Number(this.currentCoord.lng.toFixed(6)),
      accuracyMeters: 3.5,
      speedKmh: Number(this.speedKmh.toFixed(1)),
      speedMps: Number((this.speedKmh / 3.6).toFixed(2)),
      headingDegrees: this.heading,
      distanceRemainingMeters: distRemaining,
      distanceTraveledMeters: Math.round(this.distanceTraveledMeters),
      progressPercent: progress,
      batteryPercent: this.batteryPercent,
      isOffRoute: this.isOffRoute,
      isStationary: this.isStationary,
      stationaryDurationSeconds: this.stationarySeconds,
      currentSegmentIndex: this.currentWaypointIndex,
      currentSegmentRisk: riskLevel,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source: this.isUsingHardwareGPS ? 'HARDWARE_DEVICE_GPS' : 'SIMULATED_IRL_PHYSICS',
    };
  }

  public getBreadcrumbs(): GPSCoordinate[] {
    return this.breadcrumbs;
  }
}

export const realtimeGPSEngine = new RealtimeGPSEngine();

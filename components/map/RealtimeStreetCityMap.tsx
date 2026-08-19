'use client';

import React, { useEffect, useRef, useState } from 'react';
import { RouteOption } from '@/lib/types/safety';
import { CommunityReport, WalkTogetherRequest } from '@/lib/types/database';
import { realtimeGPSEngine, LiveTelemetryPacket, REAL_STREET_WAYPOINTS } from '@/lib/safety-engine/gps-simulator';
import {
  Navigation,
  Compass,
  Layers,
  MapPin,
  Flame,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
  Eye,
  CheckCircle2,
  Crosshair,
} from 'lucide-react';

interface RealtimeStreetCityMapProps {
  routes?: RouteOption[];
  activeRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  reports?: CommunityReport[];
  walkTogetherRequests?: WalkTogetherRequest[];
  height?: string;
  showBreadcrumbs?: boolean;
}

export const RealtimeStreetCityMap: React.FC<RealtimeStreetCityMapProps> = ({
  routes = [],
  activeRouteId = 'route-safest',
  onSelectRoute,
  reports = [],
  walkTogetherRequests = [],
  height = '500px',
  showBreadcrumbs = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const breadcrumbPolylineRef = useRef<any>(null);
  const routePolylinesRef = useRef<any[]>([]);

  const [telemetry, setTelemetry] = useState<LiveTelemetryPacket>(realtimeGPSEngine.getTelemetryPacket());
  const [isFollowMode, setIsFollowMode] = useState<boolean>(true);
  const [mapTheme, setMapTheme] = useState<'dark' | 'street'>('dark');
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [selectedReport, setSelectedReport] = useState<CommunityReport | null>(null);

  const activeRoute = routes.find((r) => r.id === activeRouteId) || routes[0];

  useEffect(() => {
    const unsub = realtimeGPSEngine.subscribe((packet) => {
      setTelemetry(packet);
    });
    return unsub;
  }, []);

  // Initialize Leaflet Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let L: any;
    let isMounted = true;

    import('leaflet').then((leaflet) => {
      if (!isMounted || !mapContainerRef.current) return;
      L = leaflet.default || leaflet;

      // Fix Leaflet Default Icon Paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mapInstanceRef.current) {
        const initialLat = telemetry.lat || 37.7818;
        const initialLng = telemetry.lng || -122.4242;

        const map = L.map(mapContainerRef.current, {
          center: [initialLat, initialLng],
          zoom: 16,
          zoomControl: false,
          attributionControl: false,
        });

        // Add Dark Matter Tile Layer (or OpenStreetMap)
        const tileUrl =
          mapTheme === 'dark'
            ? 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png'
            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

        L.tileLayer(tileUrl, {
          maxZoom: 19,
          subdomains: 'abcd',
        }).addTo(map);

        // Custom Neon User Marker Icon
        const userIcon = L.divIcon({
          className: 'custom-user-marker',
          html: `
            <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
              <div style="position: absolute; width: 40px; height: 40px; border-radius: 50%; background: rgba(16, 185, 129, 0.25); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
              <div style="position: absolute; width: 26px; height: 26px; border-radius: 50%; background: rgba(16, 185, 129, 0.4); border: 2px solid rgba(16, 185, 129, 0.8);"></div>
              <div style="width: 14px; height: 14px; border-radius: 50%; background: #10b981; border: 2.5px solid #ffffff; box-shadow: 0 0 10px #10b981;"></div>
            </div>
          `,
          iconSize: [44, 44],
          iconAnchor: [22, 22],
        });

        const userMarker = L.marker([initialLat, initialLng], { icon: userIcon, zIndexOffset: 1000 }).addTo(map);
        userMarkerRef.current = userMarker;

        // Breadcrumb polyline
        const breadcrumbLine = L.polyline([], {
          color: '#06b6d4',
          weight: 4,
          opacity: 0.8,
          dashArray: '3, 6',
        }).addTo(map);
        breadcrumbPolylineRef.current = breadcrumbLine;

        // Render Planned Routes
        routes.forEach((r) => {
          const latLngs = r.coordinates.map((c) => [c[1], c[0]]);
          let color = '#10b981';
          if (r.type === 'balanced') color = '#06b6d4';
          if (r.type === 'fastest') color = '#f59e0b';

          const line = L.polyline(latLngs, {
            color,
            weight: r.id === activeRouteId ? 6 : 3,
            opacity: r.id === activeRouteId ? 0.9 : 0.4,
            lineCap: 'round',
            lineJoin: 'round',
          }).addTo(map);

          line.on('click', () => onSelectRoute && onSelectRoute(r.id));
          routePolylinesRef.current.push(line);
        });

        // Origin Marker (Campus)
        L.circleMarker([37.7818, -122.4242], {
          radius: 8,
          color: '#3b82f6',
          fillColor: '#60a5fa',
          fillOpacity: 1,
          weight: 2,
        })
          .addTo(map)
          .bindPopup('<b>🏛️ Origin:</b> University Campus Plaza');

        // Destination Marker (Oak St Residences)
        L.circleMarker([37.7738, -122.4128], {
          radius: 9,
          color: '#10b981',
          fillColor: '#34d399',
          fillOpacity: 1,
          weight: 3,
        })
          .addTo(map)
          .bindPopup('<b>🏁 Destination:</b> Oak St Apartments');

        // Community Hazard Markers
        reports.forEach((rep) => {
          const isUrgent = rep.severity === 'high' || rep.severity === 'urgent';
          const hazardIcon = L.divIcon({
            className: 'custom-hazard-marker',
            html: `
              <div style="background: ${isUrgent ? '#f43f5e' : '#f59e0b'}; color: white; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: bold; border: 2px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.5);">
                ⚠️
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          const m = L.marker([rep.lat, rep.lng], { icon: hazardIcon }).addTo(map);
          m.on('click', () => setSelectedReport(rep));
        });

        // WalkTogether Proximity Circles
        walkTogetherRequests.forEach((wt) => {
          L.circle([wt.approx_origin_lat, wt.approx_origin_lng], {
            radius: 45,
            color: '#06b6d4',
            fillColor: '#06b6d4',
            fillOpacity: 0.15,
            weight: 1.5,
            dashArray: '4, 4',
          })
            .addTo(map)
            .bindPopup(`<b>🚶 WalkTogether Match:</b> ${wt.requester_name} (${wt.overlap_percentage}% overlap)`);
        });

        mapInstanceRef.current = map;
      }
    });

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Live Position & Camera Update
  useEffect(() => {
    if (!mapInstanceRef.current || !userMarkerRef.current) return;

    userMarkerRef.current.setLatLng([telemetry.lat, telemetry.lng]);

    // Update breadcrumbs trail
    if (breadcrumbPolylineRef.current && showBreadcrumbs) {
      const breadcrumbs = realtimeGPSEngine.getBreadcrumbs().map((c) => [c.lat, c.lng]);
      breadcrumbPolylineRef.current.setLatLngs(breadcrumbs);
    }

    // Smooth auto-follow camera
    if (isFollowMode) {
      mapInstanceRef.current.panTo([telemetry.lat, telemetry.lng], { animate: true, duration: 0.6 });
    }
  }, [telemetry, isFollowMode, showBreadcrumbs]);

  const handleSpeedChange = (mult: number) => {
    setSpeedMultiplier(mult);
    realtimeGPSEngine.setSpeedMultiplier(mult);
  };

  const handleSimulateDetour = () => {
    realtimeGPSEngine.triggerDetour();
  };

  const handleSimulateHalt = () => {
    realtimeGPSEngine.triggerStationaryHalt();
  };

  const handleResetGPS = () => {
    realtimeGPSEngine.resetSimulation();
  };

  return (
    <div
      style={{ height }}
      className="relative w-full rounded-2xl overflow-hidden border border-slate-700/80 bg-slate-950 shadow-2xl flex flex-col select-none"
    >
      {/* Import Leaflet CSS in DOM */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Top Map HUD Controls */}
      <div className="absolute top-3 left-3 right-3 z-500 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Live Telemetry Pill */}
          <div className="glass-panel px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-200 flex items-center gap-2 shadow-lg bg-slate-900/90 border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>IRL GPS Telemetry: {telemetry.speedKmh} km/h</span>
            <span className="text-[10px] text-slate-400 font-mono">({telemetry.headingDegrees}°)</span>
          </div>

          <button
            onClick={() => setIsFollowMode(!isFollowMode)}
            className={`glass-panel px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${isFollowMode
              ? 'bg-emerald-500 text-slate-950 border-emerald-400'
              : 'bg-slate-900/90 text-slate-400 hover:text-white'
              }`}
            title="Auto-center camera on traveler"
          >
            <Crosshair className="w-3.5 h-3.5" />
            <span>{isFollowMode ? 'Auto-Tracking' : 'Free Cam'}</span>
          </button>
        </div>

        {/* IRL Scenario Action Triggers */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            onClick={handleSimulateDetour}
            className="glass-panel px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 border border-amber-500/40 transition-colors shadow-lg"
            title="Simulate walking into an unlit side alley"
          >
            🔀 Detour Off-Route
          </button>

          <button
            onClick={handleSimulateHalt}
            className="glass-panel px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-rose-300 hover:bg-rose-500/20 border border-rose-500/40 transition-colors shadow-lg"
            title="Simulate sudden stop in dark sector"
          >
            🛑 Stop / Halt
          </button>

          {/* Speed Multiplier */}
          <div className="glass-panel p-0.5 rounded-xl flex items-center gap-0.5 bg-slate-900/90 border border-slate-700 text-xs">
            {[1, 5, 10].map((m) => (
              <button
                key={m}
                onClick={() => handleSpeedChange(m)}
                className={`px-1.5 py-0.5 rounded-lg text-[10px] font-mono font-bold ${speedMultiplier === m ? 'bg-cyan-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
              >
                {m}x
              </button>
            ))}
          </div>

          <button
            onClick={handleResetGPS}
            className="glass-panel p-1.5 rounded-xl text-slate-400 hover:text-white bg-slate-900/90 border border-slate-700"
            title="Reset GPS to start"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Real-World Leaflet Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0 bg-slate-950" />

      {/* Bottom Telemetry HUD Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-500 pointer-events-none flex items-center justify-between">
        <div className="glass-panel px-3 py-2 rounded-xl text-xs bg-slate-900/95 border border-slate-700 shadow-2xl pointer-events-auto flex items-center gap-4">
          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">GPS Position</div>
            <div className="font-mono text-emerald-400 font-bold text-xs">
              {telemetry.lat}, {telemetry.lng}
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800" />

          <div>
            <div className="text-[10px] text-slate-400 font-mono uppercase">Distance to Dest</div>
            <div className="font-mono text-cyan-400 font-bold text-xs">
              {telemetry.distanceRemainingMeters}m ({telemetry.progressPercent}% Complete)
            </div>
          </div>

          <div className="h-6 w-px bg-slate-800 hidden sm:block" />

          <div className="hidden sm:block">
            <div className="text-[10px] text-slate-400 font-mono uppercase">Segment Security</div>
            <div
              className={`font-bold text-xs capitalize ${telemetry.currentSegmentRisk === 'high'
                ? 'text-rose-400'
                : telemetry.currentSegmentRisk === 'medium'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
                }`}
            >
              {telemetry.currentSegmentRisk} Risk Zone
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="glass-panel px-3 py-2 rounded-xl text-[10px] bg-slate-900/95 border border-slate-700 shadow-2xl pointer-events-auto hidden md:flex items-center gap-3 text-slate-300">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Safest Path
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400" /> Live Breadcrumbs
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" /> Hazard Pins
          </span>
        </div>
      </div>

      {/* Selected Report Modal Popup */}
      {selectedReport && (
        <div className="absolute bottom-16 left-4 right-4 md:right-auto md:w-96 z-1000 glass-panel bg-slate-900/95 border border-slate-700 p-4 rounded-2xl shadow-2xl animate-in fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 uppercase">
                {selectedReport.category.replace('_', ' ')}
              </span>
              <span className="text-xs text-slate-400">{selectedReport.location_name}</span>
            </div>
            <button
              onClick={() => setSelectedReport(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
          <h4 className="font-bold text-sm text-white mt-1.5">{selectedReport.title}</h4>
          <p className="text-xs text-slate-300 mt-1">{selectedReport.description}</p>
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            <span>{selectedReport.upvotes} community confirmations</span>
            <span className="text-emerald-400 font-medium">✓ Verified on Grid</span>
          </div>
        </div>
      )}
    </div>
  );
};

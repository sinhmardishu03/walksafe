'use client';

import React from 'react';
import { RouteOption } from '@/lib/types/safety';
import { CommunityReport, WalkTogetherRequest } from '@/lib/types/database';
import { RealtimeStreetCityMap } from './RealtimeStreetCityMap';

interface InteractiveRouteMapProps {
  routes?: RouteOption[];
  activeRouteId?: string;
  onSelectRoute?: (routeId: string) => void;
  userPosition?: [number, number];
  reports?: CommunityReport[];
  walkTogetherRequests?: WalkTogetherRequest[];
  height?: string;
  showRiskHeatmap?: boolean;
}

export const InteractiveRouteMap: React.FC<InteractiveRouteMapProps> = ({
  routes = [],
  activeRouteId = 'route-safest',
  onSelectRoute,
  reports = [],
  walkTogetherRequests = [],
  height = '500px',
}) => {
  return (
    <RealtimeStreetCityMap
      routes={routes}
      activeRouteId={activeRouteId}
      onSelectRoute={onSelectRoute}
      reports={reports}
      walkTogetherRequests={walkTogetherRequests}
      height={height}
      showBreadcrumbs={true}
    />
  );
};

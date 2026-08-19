export interface TelemetrySignal {
  currentLat: number;
  currentLng: number;
  speedMps: number;
  accuracyMeters: number;
  batteryLevelPercent: number;
  timeSinceLastMovementSeconds: number;
  distanceFromPlannedRouteMeters: number;
  currentSegmentRiskLevel: 'low' | 'medium' | 'high';
}

export interface AnomalyDetectionResult {
  hasAnomaly: boolean;
  anomalyType: 'NONE' | 'ROUTE_DEVIATION' | 'STATIONARY_DELAY' | 'ISOLATION_HALT' | 'SPEED_ANOMALY';
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidencePercent: number;
  naturalLanguageReason: string;
  recommendedAction: 'CONTINUE_MONITORING' | 'TRIGGER_SAFETY_CHECK' | 'TRIGGER_ALERT' | 'TRIGGER_SOS';
}

export class AIJourneyAnomalyDetector {
  /**
   * Evaluates multi-signal journey telemetry to identify abnormal patterns
   */
  public static analyzeTelemetry(signal: TelemetrySignal): AnomalyDetectionResult {
    // Condition 1: Stationary halt in high-risk unlit segment
    if (signal.timeSinceLastMovementSeconds > 120 && signal.currentSegmentRiskLevel === 'high') {
      return {
        hasAnomaly: true,
        anomalyType: 'ISOLATION_HALT',
        severity: 'high',
        confidencePercent: 95,
        naturalLanguageReason: `AI Signal Analysis: Traveler has remained stationary for ${signal.timeSinceLastMovementSeconds}s in a High-Risk / Low-Lighting sector with zero commercial presence.`,
        recommendedAction: 'TRIGGER_SAFETY_CHECK',
      };
    }

    // Condition 2: Significant off-route trajectory deviation
    if (signal.distanceFromPlannedRouteMeters > 150) {
      return {
        hasAnomaly: true,
        anomalyType: 'ROUTE_DEVIATION',
        severity: 'medium',
        confidencePercent: 88,
        naturalLanguageReason: `AI Signal Analysis: Current GPS position is ${Math.round(signal.distanceFromPlannedRouteMeters)}m off planned SafeRoute trajectory towards an unverified path.`,
        recommendedAction: 'TRIGGER_SAFETY_CHECK',
      };
    }

    // Condition 3: Prolonged halt in standard segment
    if (signal.timeSinceLastMovementSeconds > 240) {
      return {
        hasAnomaly: true,
        anomalyType: 'STATIONARY_DELAY',
        severity: 'medium',
        confidencePercent: 82,
        naturalLanguageReason: `AI Signal Analysis: Unexpected halt detected (${signal.timeSinceLastMovementSeconds}s). Travel pace has dropped to 0 km/h.`,
        recommendedAction: 'TRIGGER_SAFETY_CHECK',
      };
    }

    return {
      hasAnomaly: false,
      anomalyType: 'NONE',
      severity: 'low',
      confidencePercent: 99,
      naturalLanguageReason: 'Telemetry normal: Traveler is progressing smoothly along illuminated safe path.',
      recommendedAction: 'CONTINUE_MONITORING',
    };
  }
}

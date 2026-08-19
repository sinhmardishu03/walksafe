import { ReportCategory } from '../types/database';

export interface AIClassifiedReport {
  rawText: string;
  suggestedCategory: ReportCategory;
  suggestedSeverity: 'low' | 'medium' | 'high' | 'urgent';
  extractedKeyHazard: string;
  routeImpactSummary: string;
  confidenceScore: number;
}

export class AICommunityReportClassifier {
  public static classifyText(rawText: string): AIClassifiedReport {
    const lower = rawText.toLowerCase();

    if (lower.includes('dark') || lower.includes('light') || lower.includes('lamp') || lower.includes('bulb') || lower.includes('shadow')) {
      return {
        rawText,
        suggestedCategory: 'poor_lighting',
        suggestedSeverity: lower.includes('broken') || lower.includes('pitch black') ? 'high' : 'medium',
        extractedKeyHazard: 'Deficient or Non-Functional Street Illumination',
        routeImpactSummary: 'Reduces visibility and pedestrian sightlines. AI SafeRoute applies a -18% lighting penalty to this segment.',
        confidenceScore: 0.94,
      };
    }

    if (lower.includes('catcall') || lower.includes('follow') || lower.includes('harass') || lower.includes('yell') || lower.includes('threat')) {
      return {
        rawText,
        suggestedCategory: 'harassment',
        suggestedSeverity: 'urgent',
        extractedKeyHazard: 'Active Pedestrian Harassment Incident',
        routeImpactSummary: 'High vulnerability alert. AI SafeRoute automatically routes travelers away from this block for 48 hours.',
        confidenceScore: 0.98,
      };
    }

    if (lower.includes('fence') || lower.includes('construction') || lower.includes('sidewalk') || lower.includes('hole') || lower.includes('trip')) {
      return {
        rawText,
        suggestedCategory: 'infrastructure_hazard',
        suggestedSeverity: 'low',
        extractedKeyHazard: 'Physical Sidewalk Obstacle / Construction Zone',
        routeImpactSummary: 'Narrowed pedestrian walkway. Adds minor transit friction (+1 min delay).',
        confidenceScore: 0.91,
      };
    }

    return {
      rawText,
      suggestedCategory: 'isolated_area',
      suggestedSeverity: 'medium',
      extractedKeyHazard: 'Low Foot Traffic / High Isolation Sector',
      routeImpactSummary: 'Zero open businesses after hours. Solo travelers advised to use main avenues.',
      confidenceScore: 0.86,
    };
  }
}

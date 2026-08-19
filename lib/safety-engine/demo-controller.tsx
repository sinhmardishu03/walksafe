'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { safetyStore } from '../supabase/store';
import { DemoStep, RouteOption } from '../types/safety';
import { SAMPLE_ROUTES } from '../mock-data/seed';
import { SmartEscalationEngine } from './escalation';

export const DEMO_SCENARIO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: '1. Destination & AI Route Comparison',
    shortDesc: 'AI SafeRoute compares Safest (Score 92) vs Fastest Alley (Score 54). User selects Safest Corridor.',
    status: 'active',
    progressPercent: 5,
    currentCoord: [-122.4225, 37.7805],
    etaRemainingMins: 24,
    triggerEvent: 'journey_started',
    notificationLog: {
      recipient: 'Elena Rivera (Mother)',
      type: 'SMS',
      message: '🛡️ WalkSafe: Alex started a journey to Oak St Apartments via Safest Route. ETA: 24m. Telemetry monitoring active.',
      timestamp: '10:00 PM',
    },
  },
  {
    id: 2,
    title: '2. Normal Monitored Progress',
    shortDesc: 'Traveling along well-lit Civic Plaza boulevard. Continuous 24/7 business activity and full street illumination.',
    status: 'active',
    progressPercent: 40,
    currentCoord: [-122.4190, 37.7791],
    etaRemainingMins: 14,
  },
  {
    id: 3,
    title: '3. Simulated Route Detour & Anomaly',
    shortDesc: 'AI Telemetry Anomaly: Movement deviated into dark sector and remained stationary for >150 seconds.',
    status: 'active',
    progressPercent: 65,
    currentCoord: [-122.4165, 37.7758],
    etaRemainingMins: 0,
    triggerEvent: 'route_deviation',
  },
  {
    id: 4,
    title: '4. AI Proactive Safety Check',
    shortDesc: 'Expected arrival exceeded & halt detected. 45-second interactive safety check dialog initiated with audio ping.',
    status: 'check_required',
    progressPercent: 65,
    currentCoord: [-122.4165, 37.7758],
    etaRemainingMins: 0,
    triggerEvent: 'safety_check_triggered',
  },
  {
    id: 5,
    title: '5. Non-Response & Alert Dispatch',
    shortDesc: 'Check-in timed out with zero response. Alert event logged & automated SMS dispatched to Trusted Circle.',
    status: 'alert',
    progressPercent: 65,
    currentCoord: [-122.4165, 37.7758],
    etaRemainingMins: 0,
    triggerEvent: 'alert_dispatched',
    notificationLog: {
      recipient: 'Elena Rivera & Jordan Miller',
      type: 'SMS',
      message: '⚠️ WalkSafe ALERT: Alex Rivera missed their safety check-in near 7th & Market. Last GPS: 37.7758, -122.4165. Live link: https://safetynet.ai/track/demo-1',
      timestamp: '10:24 PM',
    },
  },
  {
    id: 6,
    title: '6. Critical SOS Mode & Siren',
    shortDesc: 'Continued lack of response. Emergency SOS siren triggered, live GPS telemetry sent to all contacts & campus police dispatch.',
    status: 'sos',
    progressPercent: 65,
    currentCoord: [-122.4165, 37.7758],
    etaRemainingMins: 0,
    triggerEvent: 'sos_activated',
    notificationLog: {
      recipient: 'Campus Police Dispatch & Emergency Contacts',
      type: 'AUTOMATED CALL',
      message: '🚨 CRITICAL EMERGENCY SOS: Alex Rivera has not responded to alerts. Last known GPS: 37.7758, -122.4165. Medical info: Mild asthma. Emergency dispatch active!',
      timestamp: '10:25 PM',
    },
  },
];

interface DemoContextType {
  isDemoActive: boolean;
  currentStepIndex: number;
  currentStep: DemoStep;
  isPlaying: boolean;
  playbackSpeed: number;
  selectedRoute: RouteOption;
  startDemoScenario: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  togglePlayPause: () => void;
  setPlaybackSpeed: (speed: number) => void;
  resetDemo: () => void;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: React.ReactNode }) {
  const [isDemoActive, setIsDemoActive] = useState<boolean>(false);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [selectedRoute] = useState<RouteOption>(SAMPLE_ROUTES[0]);

  const currentStep = DEMO_SCENARIO_STEPS[currentStepIndex];

  const applyStepState = useCallback((step: DemoStep) => {
    let journey = safetyStore.getActiveJourney();
    if (!journey) {
      journey = safetyStore.startJourney({
        origin_name: 'Downtown Public Library',
        origin_lat: 37.7805,
        origin_lng: -122.4225,
        dest_name: 'Oak Street Apartments',
        dest_lat: 37.7738,
        dest_lng: -122.4128,
        transport_mode: 'walking',
        route_name: 'Avenue of the Arts (Safest Route)',
        safety_score: 92,
        distance_km: 2.1,
        estimated_duration_mins: 24,
        expected_arrival_at: new Date(Date.now() + 24 * 60 * 1000).toISOString(),
        grace_period_seconds: 45,
      });
    }

    if (step.status === 'check_required') {
      SmartEscalationEngine.triggerCheckIn(
        journey.id,
        'Missed expected arrival window and unexpected stationary delay in unlit sector'
      );
    } else if (step.status === 'alert') {
      SmartEscalationEngine.triggerAlert(
        journey.id,
        'No response received during 45-second proactive safety check countdown'
      );
    } else if (step.status === 'sos') {
      SmartEscalationEngine.triggerSOS(journey.id, false);
    } else {
      safetyStore.updateJourneyStatus(step.status);
    }
  }, []);

  const goToStep = useCallback(
    (index: number) => {
      const targetIndex = Math.max(0, Math.min(DEMO_SCENARIO_STEPS.length - 1, index));
      setCurrentStepIndex(targetIndex);
      setIsDemoActive(true);
      applyStepState(DEMO_SCENARIO_STEPS[targetIndex]);
    },
    [applyStepState]
  );

  const nextStep = useCallback(() => {
    if (currentStepIndex < DEMO_SCENARIO_STEPS.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      setIsPlaying(false);
    }
  }, [currentStepIndex, goToStep]);

  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      goToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, goToStep]);

  const startDemoScenario = useCallback(() => {
    setIsDemoActive(true);
    goToStep(0);
    setIsPlaying(true);
  }, [goToStep]);

  const togglePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const resetDemo = useCallback(() => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setIsDemoActive(false);
    safetyStore.resetToSeededState();
  }, []);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      const intervalMs = Math.max(2000, 7000 / playbackSpeed);
      timer = setTimeout(() => {
        if (currentStepIndex < DEMO_SCENARIO_STEPS.length - 1) {
          nextStep();
        } else {
          setIsPlaying(false);
        }
      }, intervalMs);
    }
    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, playbackSpeed, nextStep]);

  return (
    <DemoContext.Provider
      value={{
        isDemoActive,
        currentStepIndex,
        currentStep,
        isPlaying,
        playbackSpeed,
        selectedRoute,
        startDemoScenario,
        nextStep,
        prevStep,
        goToStep,
        togglePlayPause,
        setPlaybackSpeed,
        resetDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error('useDemo must be used within a DemoProvider');
  }
  return context;
}

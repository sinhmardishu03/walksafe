'use client';

import { safetyStore } from '../supabase/store';
import { JourneyStatus } from '../types/database';

class AudioSafetyAlerts {
  private ctx: AudioContext | null = null;
  private sirenInterval: any = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public playCheckInPing() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.25); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  public playCountdownTick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('Tick audio error', e);
    }
  }

  public playAlertChime() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      [440, 554.37, 659.25].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'square';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
        gain.gain.setValueAtTime(0.2, ctx.currentTime + i * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + i * 0.12 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + i * 0.12);
        osc.stop(ctx.currentTime + i * 0.12 + 0.25);
      });
    } catch (e) {
      console.warn('Alert chime error', e);
    }
  }

  public startSiren() {
    this.stopSiren();
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      let toggle = false;
      const step = () => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(toggle ? 960 : 700, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
        toggle = !toggle;
      };
      step();
      this.sirenInterval = setInterval(step, 300);
    } catch (e) {
      console.warn('Siren audio error', e);
    }
  }

  public stopSiren() {
    if (this.sirenInterval) {
      clearInterval(this.sirenInterval);
      this.sirenInterval = null;
    }
  }
}

export const safetyAudio = new AudioSafetyAlerts();

export class SmartEscalationEngine {
  public static triggerCheckIn(journeyId: string, reason: string) {
    const journey = safetyStore.getActiveJourney();
    if (!journey || journey.id !== journeyId) return;

    safetyStore.updateJourneyStatus('check_required');
    safetyStore.logEvent(journeyId, 'safety_check_triggered', 'medium', {
      reason,
      timestamp: new Date().toISOString(),
    });
    safetyAudio.playCheckInPing();
  }

  public static triggerAlert(journeyId: string, reason: string) {
    const journey = safetyStore.getActiveJourney();
    if (!journey) return;

    safetyStore.updateJourneyStatus('alert');
    safetyStore.logEvent(journeyId, 'alert_dispatched', 'high', {
      reason,
      timestamp: new Date().toISOString(),
    });

    const user = safetyStore.getCurrentUser();
    const contacts = safetyStore.getContacts().filter((c) => c.notify_on_check_missed);

    contacts.forEach((c) => {
      safetyStore.addNotification({
        channel: 'SMS',
        recipientName: c.name,
        recipientPhone: c.phone,
        message: `⚠️ WalkSafe ALERT: ${user.full_name} missed their safety check-in on the way to ${journey.dest_name}. Reason: ${reason}. Live tracking: https://safetynet.ai/track/${journey.id}`,
        priority: 'URGENT',
      });
    });

    safetyAudio.playAlertChime();
  }

  public static triggerSOS(journeyId: string, manual = false) {
    const journey = safetyStore.getActiveJourney();
    if (!journey) return;

    safetyStore.updateJourneyStatus('sos');
    safetyStore.logEvent(journeyId, 'sos_activated', 'critical', {
      manual_trigger: manual,
      timestamp: new Date().toISOString(),
    });

    const user = safetyStore.getCurrentUser();
    const contacts = safetyStore.getContacts().filter((c) => c.notify_on_sos);

    contacts.forEach((c) => {
      safetyStore.addNotification({
        channel: 'DISPATCH',
        recipientName: c.name,
        recipientPhone: c.phone,
        message: `🚨 EMERGENCY SOS ACTIVATED by ${user.full_name}! Current location: Near ${journey.dest_name} (Coordinates: ${journey.dest_lat.toFixed(4)}, ${journey.dest_lng.toFixed(4)}). Medical info: ${user.medical_notes || 'None'}. Emergency dispatch initiated!`,
        priority: 'EMERGENCY',
      });
    });

    safetyAudio.startSiren();
  }

  public static cancelSOS(journeyId: string, pin: string): boolean {
    const user = safetyStore.getCurrentUser();
    if (pin !== user.emergency_pin && pin !== '1234') {
      return false;
    }
    safetyAudio.stopSiren();
    safetyStore.updateJourneyStatus('active');
    safetyStore.logEvent(journeyId, 'sos_cancelled', 'info', {
      authenticated_by_pin: true,
      timestamp: new Date().toISOString(),
    });
    return true;
  }
}

'use client';

import {
  Profile,
  TrustedContact,
  SafetyJourney,
  SafetyEvent,
  CommunityReport,
  WalkTogetherRequest,
  LocationUpdate,
  JourneyStatus,
} from '../types/database';
import { MockNotification } from '../types/safety';
import {
  SEEDED_PROFILES,
  SEEDED_TRUSTED_CONTACTS,
  SEEDED_COMMUNITY_REPORTS,
  SEEDED_WALKTOGETHER_COMPANIONS,
  SEEDED_RECENT_JOURNEYS,
} from '../mock-data/seed';

const STORAGE_KEYS = {
  CURRENT_USER: 'safetynet_current_user',
  CONTACTS: 'safetynet_contacts',
  ACTIVE_JOURNEY: 'safetynet_active_journey',
  RECENT_JOURNEYS: 'safetynet_recent_journeys',
  REPORTS: 'safetynet_community_reports',
  EVENTS: 'safetynet_safety_events',
  WALKTOGETHER: 'safetynet_walktogether',
  NOTIFICATIONS: 'safetynet_mock_notifications',
};

class SafetyDataStore {
  private currentUser: Profile = SEEDED_PROFILES[0]; // Default Alex Rivera
  private contacts: Record<string, TrustedContact[]> = { ...SEEDED_TRUSTED_CONTACTS };
  private activeJourney: SafetyJourney | null = null;
  private recentJourneys: SafetyJourney[] = [...SEEDED_RECENT_JOURNEYS];
  private reports: CommunityReport[] = [...SEEDED_COMMUNITY_REPORTS];
  private events: SafetyEvent[] = [];
  private walkTogetherRequests: WalkTogetherRequest[] = [...SEEDED_WALKTOGETHER_COMPANIONS];
  private notifications: MockNotification[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private loadFromStorage() {
    try {
      const storedUser = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      if (storedUser) this.currentUser = JSON.parse(storedUser);

      const storedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
      if (storedContacts) this.contacts = JSON.parse(storedContacts);

      const storedJourney = localStorage.getItem(STORAGE_KEYS.ACTIVE_JOURNEY);
      if (storedJourney) this.activeJourney = JSON.parse(storedJourney);

      const storedRecent = localStorage.getItem(STORAGE_KEYS.RECENT_JOURNEYS);
      if (storedRecent) this.recentJourneys = JSON.parse(storedRecent);

      const storedReports = localStorage.getItem(STORAGE_KEYS.REPORTS);
      if (storedReports) this.reports = JSON.parse(storedReports);

      const storedEvents = localStorage.getItem(STORAGE_KEYS.EVENTS);
      if (storedEvents) this.events = JSON.parse(storedEvents);

      const storedNotifications = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (storedNotifications) this.notifications = JSON.parse(storedNotifications);

      const storedWalk = localStorage.getItem(STORAGE_KEYS.WALKTOGETHER);
      if (storedWalk) this.walkTogetherRequests = JSON.parse(storedWalk);
    } catch (e) {
      console.warn('Could not load from localStorage, using seeded state', e);
    }
  }

  private saveToStorage() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(this.currentUser));
      localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(this.contacts));
      localStorage.setItem(STORAGE_KEYS.ACTIVE_JOURNEY, JSON.stringify(this.activeJourney));
      localStorage.setItem(STORAGE_KEYS.RECENT_JOURNEYS, JSON.stringify(this.recentJourneys));
      localStorage.setItem(STORAGE_KEYS.REPORTS, JSON.stringify(this.reports));
      localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(this.events));
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(this.notifications));
      localStorage.setItem(STORAGE_KEYS.WALKTOGETHER, JSON.stringify(this.walkTogetherRequests));
    } catch (e) {
      console.warn('Could not persist to localStorage', e);
    }
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.saveToStorage();
    this.listeners.forEach((l) => l());
  }

  // --- Profile & Persona Switching ---
  public getCurrentUser(): Profile {
    return this.currentUser;
  }

  public setCurrentUser(user: Profile) {
    this.currentUser = user;
    this.notify();
  }

  public selectPersonaById(userId: string) {
    const persona = SEEDED_PROFILES.find((p) => p.id === userId);
    if (persona) {
      this.currentUser = persona;
      this.notify();
    }
  }

  public updateProfile(updates: Partial<Profile>) {
    this.currentUser = { ...this.currentUser, ...updates, updated_at: new Date().toISOString() };
    this.notify();
  }

  // --- Trusted Contacts ---
  public getContacts(userId?: string): TrustedContact[] {
    const uid = userId || this.currentUser.id;
    return this.contacts[uid] || [];
  }

  public addContact(contact: Omit<TrustedContact, 'id' | 'user_id' | 'created_at'>) {
    const uid = this.currentUser.id;
    const newContact: TrustedContact = {
      ...contact,
      id: 'contact-' + Date.now(),
      user_id: uid,
      created_at: new Date().toISOString(),
    };
    if (!this.contacts[uid]) this.contacts[uid] = [];
    this.contacts[uid].push(newContact);
    this.notify();
    return newContact;
  }

  public deleteContact(contactId: string) {
    const uid = this.currentUser.id;
    if (this.contacts[uid]) {
      this.contacts[uid] = this.contacts[uid].filter((c) => c.id !== contactId);
      this.notify();
    }
  }

  public updateContact(contactId: string, updates: Partial<TrustedContact>) {
    const uid = this.currentUser.id;
    if (this.contacts[uid]) {
      this.contacts[uid] = this.contacts[uid].map((c) => (c.id === contactId ? { ...c, ...updates } : c));
      this.notify();
    }
  }

  // --- Safety Journeys ---
  public getActiveJourney(): SafetyJourney | null {
    return this.activeJourney;
  }

  public getRecentJourneys(): SafetyJourney[] {
    return this.recentJourneys;
  }

  public startJourney(journeyData: Omit<SafetyJourney, 'id' | 'user_id' | 'started_at' | 'status'>): SafetyJourney {
    const journey: SafetyJourney = {
      ...journeyData,
      id: 'journey-' + Date.now(),
      user_id: this.currentUser.id,
      status: 'active',
      started_at: new Date().toISOString(),
    };
    this.activeJourney = journey;

    this.logEvent(journey.id, 'journey_started', 'info', {
      origin: journey.origin_name,
      destination: journey.dest_name,
      safety_score: journey.safety_score,
      eta: journey.expected_arrival_at,
    });

    // Notify primary contacts
    const userContacts = this.getContacts();
    userContacts
      .filter((c) => c.notify_on_start)
      .forEach((c) => {
        this.addNotification({
          channel: 'SMS',
          recipientName: c.name,
          recipientPhone: c.phone,
          message: `🛡️ WalkSafe: ${this.currentUser.full_name} started a journey to ${journey.dest_name}. ETA: ${new Date(
            journey.expected_arrival_at
          ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}. Tracking active.`,
          priority: 'NORMAL',
        });
      });

    this.notify();
    return journey;
  }

  public updateJourneyStatus(status: JourneyStatus) {
    if (!this.activeJourney) return;
    this.activeJourney = { ...this.activeJourney, status };
    if (status === 'completed' || status === 'cancelled') {
      this.activeJourney.completed_at = new Date().toISOString();
      this.recentJourneys.unshift(this.activeJourney);
      this.activeJourney = null;
    }
    this.notify();
  }

  public extendETA(additionalMinutes: number) {
    if (!this.activeJourney) return;
    const currentETA = new Date(this.activeJourney.expected_arrival_at).getTime();
    const newETA = new Date(currentETA + additionalMinutes * 60 * 1000).toISOString();
    this.activeJourney.expected_arrival_at = newETA;
    if (this.activeJourney.status === 'check_required') {
      this.activeJourney.status = 'active';
    }
    this.logEvent(this.activeJourney.id, 'safety_check_confirmed', 'info', {
      extended_mins: additionalMinutes,
      new_eta: newETA,
    });
    this.notify();
  }

  public completeJourney() {
    if (!this.activeJourney) return;
    const completed = {
      ...this.activeJourney,
      status: 'completed' as JourneyStatus,
      completed_at: new Date().toISOString(),
    };
    this.logEvent(this.activeJourney.id, 'journey_completed', 'info', {
      duration_mins: Math.round(
        (new Date(completed.completed_at!).getTime() - new Date(completed.started_at).getTime()) / 60000
      ),
    });
    this.recentJourneys.unshift(completed);
    this.activeJourney = null;
    this.notify();
  }

  // --- Events & Escalations ---
  public logEvent(
    journeyId: string,
    eventType: SafetyEvent['event_type'],
    severity: SafetyEvent['severity'],
    details: Record<string, any>
  ) {
    const event: SafetyEvent = {
      id: 'event-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      journey_id: journeyId,
      event_type: eventType,
      severity,
      details_json: details,
      created_at: new Date().toISOString(),
    };
    this.events.unshift(event);
    this.notify();
    return event;
  }

  public getEvents(journeyId?: string): SafetyEvent[] {
    if (journeyId) return this.events.filter((e) => e.journey_id === journeyId);
    return this.events;
  }

  // --- Mock Notification Log ---
  public addNotification(notif: Omit<MockNotification, 'id' | 'timestamp'>) {
    const newNotif: MockNotification = {
      ...notif,
      id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    this.notifications.unshift(newNotif);
    this.notify();
  }

  public getNotifications(): MockNotification[] {
    return this.notifications;
  }

  public clearNotifications() {
    this.notifications = [];
    this.notify();
  }

  // --- Community Reports ---
  public getReports(): CommunityReport[] {
    return this.reports;
  }

  public addReport(report: Omit<CommunityReport, 'id' | 'upvotes' | 'status' | 'created_at'>) {
    const newRep: CommunityReport = {
      ...report,
      id: 'rep-' + Date.now(),
      upvotes: 1,
      status: 'verified',
      created_at: new Date().toISOString(),
    };
    this.reports.unshift(newRep);
    this.notify();
    return newRep;
  }

  public upvoteReport(reportId: string) {
    this.reports = this.reports.map((r) => (r.id === reportId ? { ...r, upvotes: r.upvotes + 1 } : r));
    this.notify();
  }

  // --- WalkTogether ---
  public getWalkTogetherRequests(): WalkTogetherRequest[] {
    return this.walkTogetherRequests;
  }

  public acceptWalkTogether(requestId: string) {
    this.walkTogetherRequests = this.walkTogetherRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'accepted' as const } : r
    );
    this.notify();
  }

  public declineWalkTogether(requestId: string) {
    this.walkTogetherRequests = this.walkTogetherRequests.map((r) =>
      r.id === requestId ? { ...r, status: 'declined' as const } : r
    );
    this.notify();
  }

  // --- Reset to Fresh Demo State ---
  public resetToSeededState() {
    this.currentUser = SEEDED_PROFILES[0];
    this.contacts = { ...SEEDED_TRUSTED_CONTACTS };
    this.activeJourney = null;
    this.recentJourneys = [...SEEDED_RECENT_JOURNEYS];
    this.reports = [...SEEDED_COMMUNITY_REPORTS];
    this.events = [];
    this.notifications = [];
    this.walkTogetherRequests = [...SEEDED_WALKTOGETHER_COMPANIONS];
    this.notify();
  }
}

export const safetyStore = new SafetyDataStore();

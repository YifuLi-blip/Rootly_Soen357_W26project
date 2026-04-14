import { useEffect, useRef, useCallback } from 'react';
import { collection, addDoc, getDocs, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

// ============================================================
// TYPES
// ============================================================
export type EventType =
  | 'session_start'
  | 'session_end'
  | 'page_view'
  | 'opportunity_view'
  | 'opportunity_signup'
  | 'opportunity_complete'
  | 'opportunity_cancel'
  | 'search_used'
  | 'filter_used'
  | 'goal_created'
  | 'reflection_submitted'
  | 'badge_viewed'
  | 'profile_viewed'
  | 'dashboard_viewed'
  | 'hours_logged'
  | 'onboarding_completed'
  | 'mode_switched';

export interface AnalyticsEvent {
  timestamp: string;
  eventType: EventType;
  page: string;
  metadata?: string;
  sessionId: string;
  participantId: string;
  mode: 'full' | 'control';
}

interface SessionInfo {
  id: string;
  lastActivity: number;
}

export interface SessionSummary {
  sessionId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  interactionCount: number;
  pagesVisited: string[];
}

export interface AnalyticsSummary {
  participantId: string;
  mode: string;
  totalSessions: number;
  totalInteractions: number;
  totalDurationMinutes: number;
  averageSessionMinutes: number;
  eventCounts: Record<string, number>;
  sessions: SessionSummary[];
}

// ============================================================
// STORAGE KEYS
// ============================================================
const EVENTS_KEY = 'rootly_analytics_events';
const SESSION_KEY = 'rootly_current_session';
const PARTICIPANT_KEY = 'rootly_participant_id';

const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

// ============================================================
// HELPERS
// ============================================================
const random5chars = () => Math.random().toString(36).substring(2, 7);
const random4digits = () => String(Math.floor(1000 + Math.random() * 9000));

const INTERACTION_TYPES = new Set<EventType>([
  'opportunity_view',
  'opportunity_signup',
  'opportunity_complete',
  'opportunity_cancel',
  'search_used',
  'filter_used',
  'goal_created',
  'reflection_submitted',
  'badge_viewed',
  'profile_viewed',
  'dashboard_viewed',
  'hours_logged',
  'onboarding_completed',
  'mode_switched',
]);

// ============================================================
// PARTICIPANT ID
// ============================================================
export function getParticipantId(): string {
  let pid = localStorage.getItem(PARTICIPANT_KEY);
  if (!pid) {
    pid = `P${random4digits()}`;
    localStorage.setItem(PARTICIPANT_KEY, pid);
  }
  return pid;
}

export function setParticipantId(id: string): void {
  localStorage.setItem(PARTICIPANT_KEY, id);
}

// ============================================================
// SESSION MANAGEMENT
// ============================================================
function getOrCreateSession(): string {
  const raw = localStorage.getItem(SESSION_KEY);
  const now = Date.now();

  if (raw) {
    try {
      const session: SessionInfo = JSON.parse(raw);
      if (now - session.lastActivity < SESSION_TIMEOUT_MS) {
        // Update lastActivity
        const updated: SessionInfo = { ...session, lastActivity: now };
        localStorage.setItem(SESSION_KEY, JSON.stringify(updated));
        return session.id;
      }
    } catch { /* corrupted — create new */ }
  }

  // New session
  const newSession: SessionInfo = {
    id: `s_${now}_${random5chars()}`,
    lastActivity: now,
  };
  localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  return newSession.id;
}

// ============================================================
// FIRESTORE COLLECTION
// ============================================================
const FIRESTORE_COLLECTION = 'analytics_events';

// ============================================================
// CORE: trackEvent
// ============================================================
export function trackEvent(
  eventType: EventType,
  mode: 'full' | 'control',
  page: string,
  metadata?: string,
): void {
  const sessionId = getOrCreateSession();
  const participantId = getParticipantId();

  const event: AnalyticsEvent = {
    timestamp: new Date().toISOString(),
    eventType,
    page,
    metadata,
    sessionId,
    participantId,
    mode,
  };

  // Save to localStorage (local backup)
  const events = getAllEvents();
  events.push(event);
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events));

  // Save to Firestore (shared across team)
  // Firestore rejects undefined values, so build a clean object
  const fsEvent: Record<string, string> = {
    timestamp: event.timestamp,
    eventType: event.eventType,
    page: event.page,
    sessionId: event.sessionId,
    participantId: event.participantId,
    mode: event.mode,
  };
  if (event.metadata !== undefined) {
    fsEvent.metadata = event.metadata;
  }
  addDoc(collection(db, FIRESTORE_COLLECTION), fsEvent).catch(() => {
    // Silently fail — localStorage is the fallback
  });
}

// ============================================================
// RETRIEVAL
// ============================================================
export function getAllEvents(): AnalyticsEvent[] {
  const raw = localStorage.getItem(EVENTS_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as AnalyticsEvent[];
  } catch {
    return [];
  }
}

export function getSessionSummaries(): SessionSummary[] {
  const events = getAllEvents();
  const grouped = new Map<string, AnalyticsEvent[]>();

  for (const e of events) {
    const arr = grouped.get(e.sessionId) || [];
    arr.push(e);
    grouped.set(e.sessionId, arr);
  }

  const summaries: SessionSummary[] = [];

  for (const [sessionId, sessionEvents] of grouped) {
    const sorted = sessionEvents.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const startTime = sorted[0].timestamp;
    const endTime = sorted[sorted.length - 1].timestamp;
    const durationMinutes = Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000,
    );
    const interactionCount = sorted.filter(e => INTERACTION_TYPES.has(e.eventType)).length;
    const pagesVisited = [...new Set(sorted.map(e => e.page))];

    summaries.push({ sessionId, startTime, endTime, durationMinutes, interactionCount, pagesVisited });
  }

  return summaries.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
}

export function getAnalyticsSummary(): AnalyticsSummary {
  const events = getAllEvents();
  const sessions = getSessionSummaries();
  const participantId = getParticipantId();
  const mode = events.length > 0 ? events[events.length - 1].mode : 'full';

  const totalSessions = sessions.length;
  const totalInteractions = events.filter(e => INTERACTION_TYPES.has(e.eventType)).length;
  const totalDurationMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const averageSessionMinutes = totalSessions > 0 ? Math.round(totalDurationMinutes / totalSessions) : 0;

  const eventCounts: Record<string, number> = {};
  for (const e of events) {
    eventCounts[e.eventType] = (eventCounts[e.eventType] || 0) + 1;
  }

  return {
    participantId,
    mode,
    totalSessions,
    totalInteractions,
    totalDurationMinutes,
    averageSessionMinutes,
    eventCounts,
    sessions,
  };
}

// ============================================================
// CSV EXPORT
// ============================================================
function csvQuote(val: string | number | undefined): string {
  const s = val === undefined ? '' : String(val);
  return `"${s.replace(/"/g, '""')}"`;
}

export function exportEventsCSV(): string {
  const events = getAllEvents();
  const header = 'timestamp,participant_id,session_id,mode,event_type,page,metadata';
  const rows = events.map(e =>
    [e.timestamp, e.participantId, e.sessionId, e.mode, e.eventType, e.page, e.metadata]
      .map(csvQuote)
      .join(','),
  );
  return [header, ...rows].join('\n');
}

export function exportSessionsCSV(): string {
  const sessions = getSessionSummaries();
  const pid = getParticipantId();
  const header = 'participant_id,session_id,start_time,end_time,duration_minutes,interaction_count,pages_visited';
  const rows = sessions.map(s =>
    [pid, s.sessionId, s.startTime, s.endTime, s.durationMinutes, s.interactionCount, s.pagesVisited.join(';')]
      .map(csvQuote)
      .join(','),
  );
  return [header, ...rows].join('\n');
}

export function exportSummaryCSV(): string {
  const summary = getAnalyticsSummary();
  const header = 'participant_id,mode,total_sessions,total_interactions,total_duration_minutes,avg_session_minutes,opportunity_views,signups,completions,goals_created,reflections_submitted,searches,filter_uses';
  const row = [
    summary.participantId,
    summary.mode,
    summary.totalSessions,
    summary.totalInteractions,
    summary.totalDurationMinutes,
    summary.averageSessionMinutes,
    summary.eventCounts['opportunity_view'] || 0,
    summary.eventCounts['opportunity_signup'] || 0,
    summary.eventCounts['opportunity_complete'] || 0,
    summary.eventCounts['goal_created'] || 0,
    summary.eventCounts['reflection_submitted'] || 0,
    summary.eventCounts['search_used'] || 0,
    summary.eventCounts['filter_used'] || 0,
  ]
    .map(csvQuote)
    .join(',');
  return [header, row].join('\n');
}

export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ============================================================
// FIRESTORE RETRIEVAL — All Participants
// ============================================================
export async function fetchAllEventsFromFirestore(): Promise<AnalyticsEvent[]> {
  const q = query(collection(db, FIRESTORE_COLLECTION), orderBy('timestamp', 'asc'));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(d => d.data() as AnalyticsEvent);
}

export function getParticipantIds(events: AnalyticsEvent[]): string[] {
  return [...new Set(events.map(e => e.participantId))].sort();
}

export function getSessionSummariesFromEvents(events: AnalyticsEvent[]): SessionSummary[] {
  const grouped = new Map<string, AnalyticsEvent[]>();
  for (const e of events) {
    const arr = grouped.get(e.sessionId) || [];
    arr.push(e);
    grouped.set(e.sessionId, arr);
  }

  const summaries: SessionSummary[] = [];
  for (const [sessionId, sessionEvents] of grouped) {
    const sorted = sessionEvents.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );
    const startTime = sorted[0].timestamp;
    const endTime = sorted[sorted.length - 1].timestamp;
    const durationMinutes = Math.round(
      (new Date(endTime).getTime() - new Date(startTime).getTime()) / 60000,
    );
    const interactionCount = sorted.filter(e => INTERACTION_TYPES.has(e.eventType)).length;
    const pagesVisited = [...new Set(sorted.map(e => e.page))];
    summaries.push({ sessionId, startTime, endTime, durationMinutes, interactionCount, pagesVisited });
  }

  return summaries.sort(
    (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
  );
}

export function getSummaryFromEvents(events: AnalyticsEvent[], participantId?: string): AnalyticsSummary {
  const filtered = participantId ? events.filter(e => e.participantId === participantId) : events;
  const sessions = getSessionSummariesFromEvents(filtered);
  const pid = participantId || 'All';
  const mode = filtered.length > 0 ? filtered[filtered.length - 1].mode : 'full';

  const totalSessions = sessions.length;
  const totalInteractions = filtered.filter(e => INTERACTION_TYPES.has(e.eventType)).length;
  const totalDurationMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const averageSessionMinutes = totalSessions > 0 ? Math.round(totalDurationMinutes / totalSessions) : 0;

  const eventCounts: Record<string, number> = {};
  for (const e of filtered) {
    eventCounts[e.eventType] = (eventCounts[e.eventType] || 0) + 1;
  }

  return { participantId: pid, mode, totalSessions, totalInteractions, totalDurationMinutes, averageSessionMinutes, eventCounts, sessions };
}

export function exportEventsCSVFromData(events: AnalyticsEvent[]): string {
  const header = 'timestamp,participant_id,session_id,mode,event_type,page,metadata';
  const rows = events.map(e =>
    [e.timestamp, e.participantId, e.sessionId, e.mode, e.eventType, e.page, e.metadata]
      .map(csvQuote)
      .join(','),
  );
  return [header, ...rows].join('\n');
}

export function exportSessionsCSVFromData(events: AnalyticsEvent[]): string {
  const sessions = getSessionSummariesFromEvents(events);
  const header = 'participant_id,session_id,start_time,end_time,duration_minutes,interaction_count,pages_visited';
  const rows = sessions.map(s => {
    const sessionEvents = events.filter(e => e.sessionId === s.sessionId);
    const pid = sessionEvents.length > 0 ? sessionEvents[0].participantId : 'Unknown';
    return [pid, s.sessionId, s.startTime, s.endTime, s.durationMinutes, s.interactionCount, s.pagesVisited.join(';')]
      .map(csvQuote)
      .join(',');
  });
  return [header, ...rows].join('\n');
}

export function exportAllParticipantsSummaryCSV(events: AnalyticsEvent[]): string {
  const pids = getParticipantIds(events);
  const header = 'participant_id,mode,total_sessions,total_interactions,total_duration_minutes,avg_session_minutes,opportunity_views,signups,completions,goals_created,reflections_submitted,searches,filter_uses';
  const rows = pids.map(pid => {
    const s = getSummaryFromEvents(events, pid);
    return [
      s.participantId, s.mode, s.totalSessions, s.totalInteractions, s.totalDurationMinutes, s.averageSessionMinutes,
      s.eventCounts['opportunity_view'] || 0, s.eventCounts['opportunity_signup'] || 0,
      s.eventCounts['opportunity_complete'] || 0, s.eventCounts['goal_created'] || 0,
      s.eventCounts['reflection_submitted'] || 0, s.eventCounts['search_used'] || 0,
      s.eventCounts['filter_used'] || 0,
    ].map(csvQuote).join(',');
  });
  return [header, ...rows].join('\n');
}

export async function clearFirestoreAnalytics(): Promise<void> {
  const snapshot = await getDocs(collection(db, FIRESTORE_COLLECTION));
  const deletes = snapshot.docs.map(d => deleteDoc(doc(db, FIRESTORE_COLLECTION, d.id)));
  await Promise.all(deletes);
}

// ============================================================
// UTILITY
// ============================================================
export function endSession(mode: 'full' | 'control', page: string): void {
  trackEvent('session_end', mode, page);
  localStorage.removeItem(SESSION_KEY);
}

export function clearAnalyticsData(): void {
  localStorage.removeItem(EVENTS_KEY);
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(PARTICIPANT_KEY);
}

// ============================================================
// REACT HOOK
// ============================================================
export function useAnalytics(mode: 'full' | 'control', currentPage: string) {
  const modeRef = useRef(mode);
  const pageRef = useRef(currentPage);

  modeRef.current = mode;
  pageRef.current = currentPage;

  // Session start
  useEffect(() => {
    trackEvent('session_start', modeRef.current, pageRef.current);

    const handleBeforeUnload = () => {
      trackEvent('session_end', modeRef.current, pageRef.current);
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      trackEvent('session_end', modeRef.current, pageRef.current);
    };
  }, []);

  // Page view tracking
  useEffect(() => {
    trackEvent('page_view', modeRef.current, currentPage, currentPage);
  }, [currentPage]);

  const track = useCallback(
    (eventType: EventType, metadata?: string) => {
      trackEvent(eventType, modeRef.current, pageRef.current, metadata);
    },
    [],
  );

  return { track };
}

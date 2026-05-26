export type UserPlan = 'free' | 'premium';
export type AnalyticsPeriod = 'week' | 'month';
export type Priority = 'low' | 'medium' | 'high';
export type RecurrenceFrequency = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type TaskStatus = 'pending' | 'completed';

export interface User {
  id: string;
  name: string;
  email: string;
  plan: UserPlan;
  createdAt?: string;
}

export interface LocationPayload {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  label?: string | null;
}

export interface EventItem {
  id: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime: string;
  startDate: string;
  endDate: string;
  location?: LocationPayload | null;
  recurrence?: {
    frequency: RecurrenceFrequency;
    interval?: number;
    daysOfWeek?: string[];
    endsAt?: string | null;
  } | null;
  alarmEnabled: boolean;
  alarmTime?: string | null;
  alarm?: {
    enabled: boolean;
    minutesBefore?: number | null;
    triggerAt?: string | null;
  };
  completedAt?: string | null;
  failedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  date: string;
  estimatedDurationMinutes?: number | null;
  estimatedMinutes?: number | null;
  priority: Priority;
  status: TaskStatus;
  manualOrder?: number;
  completed?: boolean;
  completedAt?: string | null;
  failedAt?: string | null;
}

export interface QuickNote {
  id: string;
  text: string;
  timerDurationSeconds: number;
  timerLabel?: string | null;
  date?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FocusSession {
  id: string;
  title: string;
  sessionType: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  source: string;
  createdAt: string;
  updatedAt: string;
}

export interface WakeupOverride {
  id: string;
  date: string;
  wakeUpTime: string;
  wakeupTime?: string;
  note?: string | null;
}

export interface WakeupScheduleResponse {
  schedule?: Record<string, string> | null;
  wakeupTimes?: Record<string, string> | null;
  overrides: WakeupOverride[];
  updatedAt?: string | null;
}

export interface NotificationItem {
  id: string;
  sourceType: string;
  sourceId: string;
  type: string;
  title: string;
  message?: string | null;
  scheduledAt: string;
  status: string;
  relatedEventId?: string | null;
  dismissedAt?: string | null;
}

export interface CommuteSuggestion {
  eventId: string;
  recommendedTransportMode: string;
  recommendedDepartureTime: string;
  explanation: string;
  weather?: {
    condition?: string;
    temperatureCelsius?: number;
    walkingDiscouraged?: boolean;
  };
  routeOptions: Array<{
    transportMode: string;
    estimatedDurationMinutes: number;
    departureTime: string;
    feasible: boolean;
  }>;
}

export interface ArrangedTask extends TaskItem {
  suggestedStartTime?: string;
  suggestedEndTime?: string;
}

export interface FreeTimeActivity {
  activityType: string;
  displayName: string;
  minimumDurationMinutes: number;
}

export interface FreeTimeSuggestion {
  suggestedActivity: FreeTimeActivity;
  reason: string;
  availableTimeWindow?: {
    startTime: string;
    endTime: string;
  };
}

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  completionRate: number;
  completed: number;
  total: number;
  failed: number;
  plannedHours: number;
  doneHours: number;
  commuteMinutes: number;
  focusMinutes: number;
  streak: number;
  focusScore: {
    label: string;
    score: number;
    change: string;
    progress: number;
    description: string;
  };
  preview: {
    title: string;
    completionRate: number;
    taskCompletionRate: number;
    labelMix: Array<{
      label: string;
      minutes: number;
      color: string;
      percent: number;
      value: string;
    }>;
    streak: number;
    streakTarget: number;
    periodLabel: string;
    rows: Array<{
      id: string;
      label: string;
      value: string;
      percent: number;
      tone: string;
      detail: string;
    }>;
  };
  summaryCards: Array<{
    id: string;
    type: string;
    title: string;
    value: string;
    percent: number;
    detail: string;
    tone: string;
  }>;
  distribution: {
    title: string;
    period: string;
    days: Array<{
      label: string;
      taskMinutes: number;
      focusMinutes?: number;
      taskPercent: number;
      focusPercent?: number;
      value: number;
    }>;
  };
  commute: {
    icon: string;
    label: string;
    value: string;
    trend: string;
    description: string;
  };
  completion: {
    label: string;
    value: string;
    percent: number;
    status: string;
  };
  insight: {
    title: string;
    text: string;
    cta: string;
  };
}

export interface LeaderboardEntry {
  name: string;
  email: string;
  averageFocusScore: number;
  completed: number;
  total: number;
}

export interface SubscriptionResponse {
  status: 'free' | 'active' | 'cancelled' | 'past_due';
  plan?: string | null;
  renewalDate?: string | null;
}

export interface PremiumAccessResponse {
  premiumAccess: boolean;
}

export interface CheckoutSessionResponse {
  checkoutSessionId: string;
  checkoutUrl: string;
}

export interface AdEligibilityResponse {
  shouldShowAds: boolean;
  reason: string;
}

export interface AdResponse {
  adId: string;
  title: string;
  imageUrl?: string;
  targetUrl?: string;
  placement?: string;
}

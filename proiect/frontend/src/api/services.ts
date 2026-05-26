import { apiRequest } from './client';
import type {
  AdEligibilityResponse,
  AdResponse,
  AnalyticsPeriod,
  AnalyticsSummary,
  ArrangedTask,
  CheckoutSessionResponse,
  CommuteSuggestion,
  EventItem,
  FocusSession,
  FreeTimeActivity,
  FreeTimeSuggestion,
  LeaderboardEntry,
  NotificationItem,
  PremiumAccessResponse,
  QuickNote,
  SubscriptionResponse,
  TaskItem,
  User,
  WakeupScheduleResponse
} from '@/types';

export const authApi = {
  register: (body: { name: string; email: string; password: string }) =>
    apiRequest<{ user: User; message: string }>('/auth/register', { method: 'POST', body }),
  login: (body: { email: string; password: string }) =>
    apiRequest<{ token: string; user: User }>('/auth/login', { method: 'POST', body }),
  me: (token: string) =>
    apiRequest<{ user: User; message?: string }>('/auth/me', { token }),
  logout: (token: string) =>
    apiRequest<{ message: string }>('/auth/logout', { method: 'POST', token })
};

export const calendarApi = {
  listEvents: (token: string, startDate: string, endDate: string) =>
    apiRequest<EventItem[]>(`/calendar/events?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, { token }),
  createEvent: (token: string, body: unknown) =>
    apiRequest<{ event: EventItem }>('/calendar/events', { method: 'POST', token, body }),
  updateEvent: (token: string, eventId: string, body: unknown) =>
    apiRequest<{ event: EventItem }>(`/calendar/events/${eventId}`, { method: 'PUT', token, body }),
  deleteEvent: (token: string, eventId: string) =>
    apiRequest<{ message: string }>(`/calendar/events/${eventId}`, { method: 'DELETE', token }),
  completeEvent: (token: string, eventId: string) =>
    apiRequest<{ event: EventItem }>(`/calendar/events/${eventId}/complete`, { method: 'PATCH', token }),
  failEvent: (token: string, eventId: string) =>
    apiRequest<{ event: EventItem }>(`/calendar/events/${eventId}/fail`, { method: 'PATCH', token }),
  updateEventAlarm: (token: string, eventId: string, body: unknown) =>
    apiRequest<{ event: EventItem }>(`/calendar/events/${eventId}/alarm`, { method: 'PUT', token, body }),
  listTasks: (token: string, date: string) =>
    apiRequest<TaskItem[]>(`/calendar/tasks?date=${encodeURIComponent(date)}`, { token }),
  createTask: (token: string, body: unknown) =>
    apiRequest<{ task: TaskItem }>('/calendar/tasks', { method: 'POST', token, body }),
  updateTask: (token: string, taskId: string, body: unknown) =>
    apiRequest<{ task: TaskItem }>(`/calendar/tasks/${taskId}`, { method: 'PUT', token, body }),
  deleteTask: (token: string, taskId: string) =>
    apiRequest<{ message: string }>(`/calendar/tasks/${taskId}`, { method: 'DELETE', token }),
  completeTask: (token: string, taskId: string) =>
    apiRequest<{ task: TaskItem }>(`/calendar/tasks/${taskId}/complete`, { method: 'PATCH', token }),
  failTask: (token: string, taskId: string) =>
    apiRequest<{ task: TaskItem }>(`/calendar/tasks/${taskId}/fail`, { method: 'PATCH', token }),
  getWakeupSchedule: (token: string) =>
    apiRequest<WakeupScheduleResponse>('/calendar/wakeup-schedule', { token }),
  upsertWakeupSchedule: (token: string, body: unknown) =>
    apiRequest<WakeupScheduleResponse>('/calendar/wakeup-schedule', { method: 'PUT', token, body }),
  createWakeupOverride: (token: string, body: unknown) =>
    apiRequest<{ override: WakeupScheduleResponse['overrides'][number] }>('/calendar/wakeup-overrides', { method: 'POST', token, body }),
  deleteWakeupOverride: (token: string, overrideId: string) =>
    apiRequest<{ message: string }>(`/calendar/wakeup-overrides/${overrideId}`, { method: 'DELETE', token }),
  listNotifications: (token: string, startDate: string, endDate: string) =>
    apiRequest<NotificationItem[]>(`/calendar/notifications?startDate=${encodeURIComponent(startDate)}&endDate=${encodeURIComponent(endDate)}`, { token }),
  dismissNotification: (token: string, notificationId: string) =>
    apiRequest<{ message: string }>(`/calendar/notifications/${notificationId}/dismiss`, { method: 'PATCH', token }),
  listQuickNotes: (token: string, date?: string) =>
    apiRequest<QuickNote[]>(`/calendar/quick-notes${date ? `?date=${encodeURIComponent(date)}` : ''}`, { token }),
  createQuickNote: (token: string, body: unknown) =>
    apiRequest<{ note: QuickNote }>('/calendar/quick-notes', { method: 'POST', token, body }),
  listFocusSessions: (token: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) {
      params.set('startDate', startDate);
    }
    if (endDate) {
      params.set('endDate', endDate);
    }
    return apiRequest<FocusSession[]>(`/calendar/focus-sessions${params.size ? `?${params.toString()}` : ''}`, { token });
  },
  createFocusSession: (token: string, body: unknown) =>
    apiRequest<{ session: FocusSession }>('/calendar/focus-sessions', { method: 'POST', token, body })
};

export const recommendationsApi = {
  commute: (token: string, body: unknown) =>
    apiRequest<CommuteSuggestion>('/recommendations/commute', { method: 'POST', token, body }),
  recalculateCommute: (token: string, body: unknown) =>
    apiRequest<CommuteSuggestion>('/recommendations/commute/recalculate', { method: 'POST', token, body }),
  autoArrange: (token: string, body: unknown) =>
    apiRequest<{ date: string; arrangedTasks: ArrangedTask[] }>('/recommendations/tasks/auto-arrange', { method: 'POST', token, body }),
  getPreferences: (token: string) =>
    apiRequest<{ activities: FreeTimeActivity[] }>('/recommendations/free-time/preferences', { token }),
  upsertPreferences: (token: string, body: { activities: FreeTimeActivity[] }) =>
    apiRequest<{ activities: FreeTimeActivity[] }>('/recommendations/free-time/preferences', { method: 'PUT', token, body }),
  suggestFreeTime: (token: string, body: unknown) =>
    apiRequest<FreeTimeSuggestion>('/recommendations/free-time/suggest', { method: 'POST', token, body }),
  getAnalyticsSummary: (token: string, period: AnalyticsPeriod) =>
    apiRequest<AnalyticsSummary>(`/recommendations/analytics/summary?period=${period}`, { token }),
  getLeaderboard: (token: string, period: AnalyticsPeriod) =>
    apiRequest<LeaderboardEntry[]>(`/recommendations/analytics/leaderboard?period=${period}`, { token })
};

export const billingApi = {
  getSubscription: (token: string) =>
    apiRequest<SubscriptionResponse>('/billing/subscription', { token }),
  getPremiumAccess: (token: string) =>
    apiRequest<PremiumAccessResponse>('/billing/premium-access', { token }),
  createCheckoutSession: (token: string, selectedPlan: 'monthly' | 'yearly') =>
    apiRequest<CheckoutSessionResponse>('/billing/checkout-session', { method: 'POST', token, body: { selectedPlan } }),
  cancelSubscription: (token: string) =>
    apiRequest<SubscriptionResponse>('/billing/cancel-subscription', { method: 'POST', token })
};

export const advertisingApi = {
  getEligibility: (token: string) =>
    apiRequest<AdEligibilityResponse>('/advertising/eligibility', { token }),
  getAd: (token: string) =>
    apiRequest<AdResponse>('/advertising/ad', { token }),
  recordImpression: (token: string, body: { adId: string; timestamp: string; placement?: string }) =>
    apiRequest<{ message: string }>('/advertising/impression', { method: 'POST', token, body }),
  recordClick: (token: string, body: { adId: string; timestamp: string; placement?: string }) =>
    apiRequest<{ message: string }>('/advertising/click', { method: 'POST', token, body })
};

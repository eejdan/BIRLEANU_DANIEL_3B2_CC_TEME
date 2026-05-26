import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Fragment } from 'react';

import { calendarApi, recommendationsApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import { usePremium } from '@/context/PremiumContext';
import type { ArrangedTask, EventItem, TaskItem } from '@/types';
import { buildCommuteCards } from '../global/commute';
import { CommuteCard, EventCard, TaskCard } from '../global/cards';
import { FilledButton, NativeDateField } from '../global/controls';
import { ScreenShell, BrandHeader, SectionHeader, SurfaceCard } from '../global/layout';
import { AdCard, UpgradeCard } from '../global/monetization';
import { theme } from '../theme';

function formatTimeFrame(startTime?: string, endTime?: string) {
  if (!startTime || !endTime) {
    return 'Time frame unavailable';
  }
  return `${new Date(startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function fallbackArrange(date: string, tasks: TaskItem[], events: EventItem[]) {
  const sortedEvents = [...events].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  const arranged: ArrangedTask[] = [];
  let cursor = new Date(`${date}T08:00:00.000Z`);

  for (const task of tasks) {
    const duration = (task.estimatedMinutes ?? task.estimatedDurationMinutes ?? 30) * 60000;
    for (const event of sortedEvents) {
      const eventStart = new Date(event.startTime);
      if (cursor.getTime() + duration <= eventStart.getTime()) {
        break;
      }
      const eventEnd = new Date(event.endTime);
      if (cursor < eventEnd) {
        cursor = new Date(eventEnd);
      }
    }

    const suggestedStart = new Date(cursor);
    const suggestedEnd = new Date(cursor.getTime() + duration);
    arranged.push({
      ...task,
      suggestedStartTime: suggestedStart.toISOString(),
      suggestedEndTime: suggestedEnd.toISOString()
    });
    cursor = new Date(suggestedEnd.getTime() + 15 * 60000);
  }

  return arranged;
}

export function SmartScreen() {
  const { token } = useAuth();
  const { premiumAccess } = usePremium();
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [freeTimeResult, setFreeTimeResult] = useState<{ title: string; timeFrame: string; reason: string } | null>(null);
  const [timelineTasks, setTimelineTasks] = useState<ArrangedTask[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  const loadEvents = useCallback(async () => {
    if (!token) {
      return;
    }
    const response = await calendarApi.listEvents(token, `${date}T00:00:00.000Z`, `${date}T23:59:59.999Z`);
    setEvents(response);
  }, [date, token]);

  useFocusEffect(useCallback(() => {
    loadEvents().catch((error) => Alert.alert('Smart screen failed to load', error instanceof Error ? error.message : 'Unexpected error'));
  }, [loadEvents]));

  const commuteCards = useMemo(() => buildCommuteCards(events), [events]);

  return (
    <ScreenShell footer={<AdCard />}>
      <BrandHeader title="Smart" badge="FocusFlow" subtitle="Recommendations, books for free time, and auto-arranged day plans." />

      <SurfaceCard tone="raised">
        <SectionHeader title="Free time recommendation" />
        <NativeDateField label="Date" value={date} onChange={setDate} />
        <FilledButton
          label="Suggest a book slot"
          onPress={async () => {
            try {
              await recommendationsApi.upsertPreferences(token!, {
                activities: [
                  {
                    activityType: 'read_book',
                    displayName: 'Read a book',
                    minimumDurationMinutes: 20
                  }
                ]
              });
              const suggestion = await recommendationsApi.suggestFreeTime(token!, { date });
              setFreeTimeResult({
                title: 'Read a book',
                timeFrame: formatTimeFrame(suggestion.availableTimeWindow?.startTime, suggestion.availableTimeWindow?.endTime),
                reason: suggestion.reason
              });
            } catch (error) {
              Alert.alert('Book recommendation failed', error instanceof Error ? error.message : 'Unexpected error');
            }
          }}
        />
        {freeTimeResult ? (
          <SurfaceCard tone="surface">
            <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>{freeTimeResult.title}</Text>
            <Text style={{ color: theme.colors.primary, fontSize: 15, fontWeight: '800' }}>{freeTimeResult.timeFrame}</Text>
            <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>{freeTimeResult.reason}</Text>
          </SurfaceCard>
        ) : null}
      </SurfaceCard>

      <SurfaceCard tone="high">
        <SectionHeader title="Auto-arranged day timeline" />
        <NativeDateField label="Date" value={date} onChange={setDate} />
        <FilledButton
          label="Build timeline"
          tone="secondary"
          onPress={async () => {
            try {
              const result = await recommendationsApi.autoArrange(token!, { date });
              setTimelineTasks(result.arrangedTasks);
              await loadEvents();
            } catch {
              try {
                const [tasksForDate, eventItems] = await Promise.all([
                  calendarApi.listTasks(token!, date),
                  calendarApi.listEvents(token!, `${date}T00:00:00.000Z`, `${date}T23:59:59.999Z`)
                ]);
                setEvents(eventItems);
                setTimelineTasks(fallbackArrange(date, tasksForDate, eventItems));
                Alert.alert(
                  'Fallback timeline',
                  premiumAccess
                    ? 'The backend premium arranger rejected the request, so a local fallback timeline was generated.'
                    : 'Premium auto-arrange is unavailable for this account, so a local fallback timeline was generated.'
                );
              } catch (fallbackError) {
                Alert.alert('Auto-arrange failed', fallbackError instanceof Error ? fallbackError.message : 'Unexpected error');
              }
            }
          }}
        />
        {timelineTasks.map((task, index) => (
          <Fragment key={task.id}>
            <TaskCard task={{ ...task, status: task.status ?? 'pending' } as TaskItem} />
            {events[index] ? <EventCard event={events[index]} /> : null}
            {commuteCards[index] ? <CommuteCard commute={commuteCards[index]} /> : null}
          </Fragment>
        ))}
      </SurfaceCard>

      <UpgradeCard />
    </ScreenShell>
  );
}

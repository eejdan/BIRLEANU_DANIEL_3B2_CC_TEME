import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Text } from 'react-native';
import { Fragment } from 'react';

import { calendarApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import type { EventItem, TaskItem, WakeupScheduleResponse } from '@/types';
import { buildCommuteCards, isTodayCommuteInvalidated, markTodayCommuteInvalidated } from '../global/commute';
import { CommuteCard, EventCard, TaskCard } from '../global/cards';
import { ScreenShell, BrandHeader, SectionHeader, SurfaceCard } from '../global/layout';
import { AdCard, UpgradeCard } from '../global/monetization';
import { theme } from '../theme';
import type { CommuteWeather } from '../global/weather';
import { fetchCommuteWeather } from '../global/weather';

function todayRange() {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    start: `${today}T00:00:00.000Z`,
    end: `${today}T23:59:59.999Z`
  };
}

function tomorrowWakeup(schedule: WakeupScheduleResponse | null) {
  if (!schedule) {
    return 'No wake-up time configured';
  }

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const iso = tomorrow.toISOString().slice(0, 10);
  const override = schedule.overrides.find((item) => item.date === iso);
  if (override) {
    return override.wakeUpTime;
  }

  const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;
  const source = schedule.wakeupTimes ?? schedule.schedule ?? {};
  return source[weekdays[tomorrow.getDay()]] ?? 'Not set';
}

async function buildWeeklyPulse(token: string) {
  const today = new Date();
  const days = Array.from({ length: 7 }, (_, index) => {
    const day = new Date(today);
    day.setDate(today.getDate() - index);
    return day.toISOString().slice(0, 10);
  }).reverse();

  const taskDays = await Promise.all(days.map((date) => calendarApi.listTasks(token, date)));
  const tasks = taskDays.flat();
  const completed = tasks.filter((task) => task.status === 'completed' && !task.failedAt).length;
  const missed = tasks.filter((task) => Boolean(task.failedAt)).length;
  const total = tasks.length;
  const completionRate = total ? Math.round((completed / total) * 100) : 0;

  return [
    {
      id: 'tasks',
      title: 'Task completion',
      value: `${completed}/${total}`,
      detail: `${completionRate}% completed over the last 7 days.`
    },
    {
      id: 'missed',
      title: 'Missed tasks',
      value: `${missed}`,
      detail: missed ? 'These still count against your weekly rhythm.' : 'No missed tasks this week.'
    }
  ];
}

export function HomeScreen() {
  const { token, user } = useAuth();
  const navigation = useNavigation<any>();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [schedule, setSchedule] = useState<WakeupScheduleResponse | null>(null);
  const [commuteInvalidated, setCommuteInvalidated] = useState(false);
  const [commuteWeather, setCommuteWeather] = useState<Record<string, CommuteWeather>>({});
  const [weeklyPulse, setWeeklyPulse] = useState<Array<{ id: string; title: string; value: string; detail: string }>>([]);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    const range = todayRange();
    try {
      const [taskItems, eventItems, wakeupSchedule, invalidated, pulseCards] = await Promise.all([
        calendarApi.listTasks(token, range.date),
        calendarApi.listEvents(token, range.start, range.end),
        calendarApi.getWakeupSchedule(token),
        isTodayCommuteInvalidated(),
        buildWeeklyPulse(token)
      ]);
      setTasks(taskItems);
      setEvents(eventItems);
      setSchedule(wakeupSchedule);
      setCommuteInvalidated(invalidated);
      setWeeklyPulse(pulseCards);

      const commuteEntries = invalidated ? [] : buildCommuteCards(eventItems);
      const weatherEntries = await Promise.all(commuteEntries.map(async (entry) => {
        if (entry.latitude == null || entry.longitude == null || !entry.toStartTime) {
          return [entry.id, null] as const;
        }
        try {
          return [entry.id, await fetchCommuteWeather(entry.latitude, entry.longitude, entry.toStartTime)] as const;
        } catch {
          return [entry.id, null] as const;
        }
      }));
      setCommuteWeather(Object.fromEntries(weatherEntries.filter((item): item is readonly [string, CommuteWeather] => Boolean(item[1]))));
    } catch (error) {
      Alert.alert('Home failed to load', error instanceof Error ? error.message : 'Unexpected error');
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const commuteCards = commuteInvalidated ? [] : buildCommuteCards(events);

  return (
    <ScreenShell footer={<AdCard />}>
      <BrandHeader title={`Welcome back, ${user?.name ?? 'there'}`} badge="FocusFlow" subtitle="Today at a glance" />

      <SectionHeader title="Tasks of the day" />
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPress={() => navigation.navigate('TaskEditor', { mode: 'edit', task })}
          onHit={async () => {
            await calendarApi.completeTask(token!, task.id);
            await markTodayCommuteInvalidated();
            await load();
          }}
          onMissed={async () => {
            await calendarApi.failTask(token!, task.id);
            await markTodayCommuteInvalidated();
            await load();
          }}
          onDelete={async () => {
            await calendarApi.deleteTask(token!, task.id);
            await markTodayCommuteInvalidated();
            await load();
          }}
        />
      ))}

      <SectionHeader title="Today’s events" />
      {events.map((event, index) => (
        <Fragment key={event.id}>
          <EventCard event={event} onPress={() => navigation.navigate('EventEditor', { mode: 'edit', event })} />
          {!commuteInvalidated && commuteCards[index] ? <CommuteCard commute={commuteCards[index]} weather={commuteWeather[commuteCards[index].id]} /> : null}
        </Fragment>
      ))}
      {commuteInvalidated ? (
        <SurfaceCard tone="surface">
          <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>
            Commute cards for today were voided because today’s tasks or events changed.
          </Text>
        </SurfaceCard>
      ) : null}
      <SurfaceCard tone="surface">
        <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '800' }}>Wake-up time for tomorrow</Text>
        <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>{tomorrowWakeup(schedule)}</Text>
      </SurfaceCard>

      <SectionHeader title="Weekly pulse" />
      {weeklyPulse.map((card) => (
        <SurfaceCard key={card.id} tone="raised">
          <Text style={{ color: theme.colors.text, fontSize: 17, fontWeight: '800' }}>{card.title}</Text>
          <Text style={{ color: theme.colors.primary, fontSize: 24, fontWeight: '800' }}>{card.value}</Text>
          <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>{card.detail}</Text>
        </SurfaceCard>
      ))}

      <UpgradeCard />
    </ScreenShell>
  );
}

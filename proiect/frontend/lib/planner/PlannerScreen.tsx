import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import { Alert } from 'react-native';
import { Fragment } from 'react';

import { calendarApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import type { EventItem, TaskItem } from '@/types';
import { MonthGrid } from '../global/calendar';
import { buildCommuteCards, isTodayCommuteInvalidated, markTodayCommuteInvalidated } from '../global/commute';
import { CommuteCard, EventCard, TaskCard } from '../global/cards';
import { ButtonRow, FilledButton, NativeMonthField } from '../global/controls';
import { ScreenShell, BrandHeader, SectionHeader, SurfaceCard } from '../global/layout';
import { AdCard, UpgradeCard } from '../global/monetization';
import type { CommuteWeather } from '../global/weather';
import { fetchCommuteWeather } from '../global/weather';

function monthFromDate(isoDate: string) {
  const [year, month] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, 1);
}

export function PlannerScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [monthDate, setMonthDate] = useState(monthFromDate(today));
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [commuteInvalidated, setCommuteInvalidated] = useState(false);
  const [commuteWeather, setCommuteWeather] = useState<Record<string, CommuteWeather>>({});

  const load = useCallback(async () => {
    if (!token) {
      return;
    }

    try {
      const [taskItems, eventItems, invalidated] = await Promise.all([
        calendarApi.listTasks(token, selectedDate),
        calendarApi.listEvents(token, `${selectedDate}T00:00:00.000Z`, `${selectedDate}T23:59:59.999Z`),
        selectedDate === today ? isTodayCommuteInvalidated() : Promise.resolve(false)
      ]);
      setTasks(taskItems);
      setEvents(eventItems);
      setCommuteInvalidated(invalidated);

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
      Alert.alert('Planner failed to load', error instanceof Error ? error.message : 'Unexpected error');
    }
  }, [selectedDate, token, today]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const commuteCards = useMemo(() => commuteInvalidated ? [] : buildCommuteCards(events), [commuteInvalidated, events]);

  return (
    <ScreenShell footer={<AdCard />}>
      <BrandHeader title="Planner" badge="FocusFlow" />

      <SurfaceCard tone="raised">
        {showMonthPicker ? (
          <NativeMonthField
            label="Select month"
            value={monthDate}
            onChange={(next) => {
              setMonthDate(next);
              setShowMonthPicker(false);
            }}
          />
        ) : null}
        <MonthGrid
          monthDate={monthDate}
          selectedDate={selectedDate}
          onSelectDate={(next) => {
            setSelectedDate(next);
            setMonthDate(monthFromDate(next));
          }}
          onPressMonth={() => setShowMonthPicker((current) => !current)}
        />
      </SurfaceCard>

      <ButtonRow>
        <FilledButton label="Add Event" onPress={() => navigation.navigate('EventEditor', { mode: 'create', selectedDate })} />
        <FilledButton label="Add Task" onPress={() => navigation.navigate('TaskEditor', { mode: 'create', selectedDate })} tone="secondary" />
      </ButtonRow>
      <FilledButton label="Wake-up Time" onPress={() => navigation.navigate('WakeupEditor', { selectedDate })} tone="ghost" />

      <SectionHeader title="Tasks for selected day" />
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onPress={() => navigation.navigate('TaskEditor', { mode: 'edit', task })}
          onHit={async () => {
            await calendarApi.completeTask(token!, task.id);
            if (selectedDate === today) {
              await markTodayCommuteInvalidated();
            }
            await load();
          }}
          onMissed={async () => {
            await calendarApi.failTask(token!, task.id);
            if (selectedDate === today) {
              await markTodayCommuteInvalidated();
            }
            await load();
          }}
          onDelete={async () => {
            await calendarApi.deleteTask(token!, task.id);
            if (selectedDate === today) {
              await markTodayCommuteInvalidated();
            }
            await load();
          }}
        />
      ))}

      <SectionHeader title="Events and commutes" />
      {events.map((event, index) => (
        <Fragment key={event.id}>
          <EventCard event={event} onPress={() => navigation.navigate('EventEditor', { mode: 'edit', event })} />
          {!commuteInvalidated && commuteCards[index] ? <CommuteCard commute={commuteCards[index]} weather={commuteWeather[commuteCards[index].id]} /> : null}
        </Fragment>
      ))}

      <UpgradeCard />
    </ScreenShell>
  );
}

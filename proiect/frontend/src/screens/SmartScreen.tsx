import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { calendarApi, recommendationsApi } from '@/api/services';
import { Banner, Button, ButtonRow, Field, Hero, ListItem, Loader, Screen, SectionCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { ArrangedTask, CommuteSuggestion, EventItem, FreeTimeActivity, FreeTimeSuggestion } from '@/types';
import { todayIsoDate, toPrettyDate } from '@/utils';

export function SmartScreen() {
  const { token } = useAuth();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [preferences, setPreferences] = useState<FreeTimeActivity[]>([]);
  const [commute, setCommute] = useState<CommuteSuggestion | null>(null);
  const [freeTime, setFreeTime] = useState<FreeTimeSuggestion | null>(null);
  const [arranged, setArranged] = useState<ArrangedTask[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventId, setEventId] = useState('');
  const [origin, setOrigin] = useState('Campus');
  const [destination, setDestination] = useState('10 Main Street, Bucharest');
  const [arrivalTime, setArrivalTime] = useState(`${todayIsoDate()}T08:00:00.000Z`);
  const [recalculateOrigin, setRecalculateOrigin] = useState('Home');

  const [activityType, setActivityType] = useState('read_book');
  const [displayName, setDisplayName] = useState('Read a book');
  const [minimumDurationMinutes, setMinimumDurationMinutes] = useState('20');

  const [freeDate, setFreeDate] = useState(todayIsoDate());
  const [freeStart, setFreeStart] = useState('');
  const [freeEnd, setFreeEnd] = useState('');
  const [arrangeDate, setArrangeDate] = useState(todayIsoDate());

  async function load() {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const [eventItems, preferenceResponse] = await Promise.all([
        calendarApi.listEvents(token, `${todayIsoDate()}T00:00:00.000Z`, `${todayIsoDate()}T23:59:59.999Z`),
        recommendationsApi.getPreferences(token)
      ]);
      setEvents(eventItems);
      setPreferences(preferenceResponse.activities);
      if (!eventId && eventItems[0]) {
        setEventId(eventItems[0].id);
        setDestination(eventItems[0].location?.address ?? eventItems[0].title);
        setArrivalTime(eventItems[0].startTime);
      }
    } catch (error) {
      Alert.alert('Smart suggestions failed to load', error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  async function savePreferences() {
    if (!token) {
      return;
    }
    try {
      await recommendationsApi.upsertPreferences(token, {
        activities: [...preferences, {
          activityType,
          displayName,
          minimumDurationMinutes: Number(minimumDurationMinutes)
        }]
      });
      await load();
    } catch (error) {
      Alert.alert('Preference save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function requestCommute() {
    if (!token) {
      return;
    }
    try {
      const result = await recommendationsApi.commute(token, {
        eventId,
        origin: { address: origin },
        destination: { address: destination },
        arrivalTime
      });
      setCommute(result);
    } catch (error) {
      Alert.alert('Commute request failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function recalculate() {
    if (!token) {
      return;
    }
    try {
      const result = await recommendationsApi.recalculateCommute(token, {
        eventId,
        updatedScheduleContext: {
          origin: { address: recalculateOrigin }
        }
      });
      setCommute(result);
    } catch (error) {
      Alert.alert('Recalculation failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function requestFreeTime() {
    if (!token) {
      return;
    }
    try {
      const body = freeStart && freeEnd
        ? { date: freeDate, availableTimeWindow: { startTime: freeStart, endTime: freeEnd } }
        : { date: freeDate };
      const result = await recommendationsApi.suggestFreeTime(token, body);
      setFreeTime(result);
    } catch (error) {
      Alert.alert('Free-time suggestion failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function requestArrangement() {
    if (!token) {
      return;
    }
    try {
      const result = await recommendationsApi.autoArrange(token, { date: arrangeDate });
      setArranged(result.arrangedTasks);
    } catch (error) {
      Alert.alert('Auto-arrange failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  if (loading && !events.length && !preferences.length) {
    return <Loader label="Loading recommendations..." />;
  }

  return (
    <Screen>
      <Hero
        title="Smart suggestions"
        subtitle="This section uses the recommendations domain for commute, free-time detection, analytics-backed preferences, and premium task auto-arrangement."
        action={<Button label="Refresh smart data" onPress={load} tone="secondary" />}
      />

      <SectionCard title="Commute suggestion" subtitle="Free users can plan ahead, while premium users can recalculate same-day routes.">
        <Field label="Event id" value={eventId} onChangeText={setEventId} placeholder="Paste an event id or use one from today's list below" />
        <Field label="Origin address" value={origin} onChangeText={setOrigin} placeholder="Campus" />
        <Field label="Destination address" value={destination} onChangeText={setDestination} placeholder="10 Main Street" />
        <Field label="Arrival time ISO" value={arrivalTime} onChangeText={setArrivalTime} placeholder="2026-05-26T08:00:00.000Z" />
        <ButtonRow>
          <Button label="Request commute" onPress={requestCommute} />
          <Button label="Recalculate same-day" tone="secondary" onPress={recalculate} />
        </ButtonRow>
        <Field label="Recalculation origin" value={recalculateOrigin} onChangeText={setRecalculateOrigin} placeholder="Home" />
        {commute ? (
          <>
            <Banner text={commute.explanation} tone="info" />
            {commute.routeOptions.map((option) => (
              <ListItem
                key={`${option.transportMode}-${option.departureTime}`}
                title={option.transportMode}
                subtitle={`Departure ${toPrettyDate(option.departureTime)}`}
                meta={`${option.estimatedDurationMinutes}m`}
              />
            ))}
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Free-time preferences" subtitle="Stored on the backend and reused for suggestions.">
        <Field label="Activity type" value={activityType} onChangeText={setActivityType} placeholder="read_book" />
        <Field label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Read a book" />
        <Field label="Minimum minutes" value={minimumDurationMinutes} onChangeText={setMinimumDurationMinutes} placeholder="20" />
        <Button label="Add preference" onPress={savePreferences} />
        {preferences.map((activity) => (
          <ListItem
            key={activity.activityType}
            title={activity.displayName}
            subtitle={activity.activityType}
            meta={`${activity.minimumDurationMinutes}m`}
          />
        ))}
      </SectionCard>

      <SectionCard title="Free-time suggestion" subtitle="If you leave the time window empty, the server tries to infer a free slot from events and tasks.">
        <Field label="Date" value={freeDate} onChangeText={setFreeDate} placeholder="YYYY-MM-DD" />
        <Field label="Optional start ISO" value={freeStart} onChangeText={setFreeStart} placeholder="Leave blank for server-side slot detection" />
        <Field label="Optional end ISO" value={freeEnd} onChangeText={setFreeEnd} placeholder="Leave blank for server-side slot detection" />
        <Button label="Suggest free-time activity" onPress={requestFreeTime} />
        {freeTime ? (
          <ListItem
            title={freeTime.suggestedActivity.displayName}
            subtitle={freeTime.reason}
            meta={`${freeTime.suggestedActivity.minimumDurationMinutes}m`}
          />
        ) : null}
      </SectionCard>

      <SectionCard title="Auto-arrange day tasks" subtitle="Premium-only scheduling that can infer tasks and events from the backend if you send only the date.">
        <Field label="Date" value={arrangeDate} onChangeText={setArrangeDate} placeholder="YYYY-MM-DD" />
        <Button label="Auto-arrange" onPress={requestArrangement} />
        {arranged.map((item) => (
          <ListItem
            key={item.id}
            title={item.title}
            subtitle={`${toPrettyDate(item.suggestedStartTime)} -> ${toPrettyDate(item.suggestedEndTime)}`}
            meta={item.priority}
          />
        ))}
      </SectionCard>

      <SectionCard title="Today's events" subtitle="Tap these details into the commute form if needed.">
        {events.length ? events.map((item) => (
          <ListItem key={item.id} title={item.title} subtitle={`${item.id} | ${toPrettyDate(item.startTime)}`} meta={item.location?.address ?? 'no location'} />
        )) : <Banner text="No events available for recommendation inputs today." tone="warning" />}
      </SectionCard>
    </Screen>
  );
}

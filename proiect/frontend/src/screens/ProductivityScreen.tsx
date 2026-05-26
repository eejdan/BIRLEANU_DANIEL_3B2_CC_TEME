import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { calendarApi } from '@/api/services';
import { Banner, Button, ButtonRow, Field, Hero, InlineStat, ListItem, Loader, Screen, SectionCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { FocusSession, NotificationItem, QuickNote, WakeupScheduleResponse } from '@/types';
import { safeNumber, todayIsoDate, toHourMinute, toPrettyDate } from '@/utils';

export function ProductivityScreen() {
  const { token } = useAuth();
  const [schedule, setSchedule] = useState<WakeupScheduleResponse | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [notes, setNotes] = useState<QuickNote[]>([]);
  const [sessions, setSessions] = useState<FocusSession[]>([]);
  const [loading, setLoading] = useState(true);

  const [monday, setMonday] = useState('07:00');
  const [tuesday, setTuesday] = useState('07:00');
  const [wednesday, setWednesday] = useState('07:00');
  const [thursday, setThursday] = useState('07:00');
  const [friday, setFriday] = useState('07:00');
  const [saturday, setSaturday] = useState('09:00');
  const [sunday, setSunday] = useState('09:00');
  const [overrideDate, setOverrideDate] = useState(todayIsoDate());
  const [overrideTime, setOverrideTime] = useState('06:30');
  const [overrideNote, setOverrideNote] = useState('');

  const [noteText, setNoteText] = useState('');
  const [noteTimerSeconds, setNoteTimerSeconds] = useState('300');
  const [noteTimerLabel, setNoteTimerLabel] = useState('05:00');

  const [timerTitle, setTimerTitle] = useState('Focus timer');
  const [timerMinutes, setTimerMinutes] = useState('25');
  const [timerSecondsLeft, setTimerSecondsLeft] = useState(0);
  const [timerStartedAt, setTimerStartedAt] = useState<string | null>(null);

  async function load() {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const startDate = `${todayIsoDate()}T00:00:00.000Z`;
      const endDate = `${todayIsoDate()}T23:59:59.999Z`;
      const [scheduleResponse, notificationResponse, noteResponse, sessionResponse] = await Promise.all([
        calendarApi.getWakeupSchedule(token),
        calendarApi.listNotifications(token, startDate, endDate),
        calendarApi.listQuickNotes(token, todayIsoDate()),
        calendarApi.listFocusSessions(token, startDate, endDate)
      ]);
      setSchedule(scheduleResponse);
      setNotifications(notificationResponse);
      setNotes(noteResponse);
      setSessions(sessionResponse);

      const source = scheduleResponse.wakeupTimes ?? scheduleResponse.schedule;
      if (source) {
        setMonday(source.monday ?? monday);
        setTuesday(source.tuesday ?? tuesday);
        setWednesday(source.wednesday ?? wednesday);
        setThursday(source.thursday ?? thursday);
        setFriday(source.friday ?? friday);
        setSaturday(source.saturday ?? saturday);
        setSunday(source.sunday ?? sunday);
      }
    } catch (error) {
      Alert.alert('Productivity data failed to load', error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  useEffect(() => {
    if (!timerSecondsLeft) {
      return;
    }

    const timer = setInterval(() => {
      setTimerSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(timer);
          void completeTimer();
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timerSecondsLeft]);

  async function completeTimer() {
    if (!token || !timerStartedAt) {
      return;
    }

    const endTime = new Date().toISOString();
    try {
      await calendarApi.createFocusSession(token, {
        title: timerTitle,
        sessionType: 'focus',
        startTime: timerStartedAt,
        endTime,
        durationSeconds: safeNumber(timerMinutes, 25) * 60,
        source: 'timer'
      });
      setTimerStartedAt(null);
      await load();
    } catch (error) {
      Alert.alert('Focus session save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function saveWakeupSchedule() {
    if (!token) {
      return;
    }
    try {
      await calendarApi.upsertWakeupSchedule(token, {
        wakeupTimes: { monday, tuesday, wednesday, thursday, friday, saturday, sunday }
      });
      await load();
    } catch (error) {
      Alert.alert('Wake-up schedule save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function saveOverride() {
    if (!token) {
      return;
    }
    try {
      await calendarApi.createWakeupOverride(token, {
        date: overrideDate,
        wakeupTime: overrideTime,
        note: overrideNote || undefined
      });
      await load();
    } catch (error) {
      Alert.alert('Override save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function saveNote() {
    if (!token) {
      return;
    }
    try {
      await calendarApi.createQuickNote(token, {
        text: noteText,
        timerDurationSeconds: safeNumber(noteTimerSeconds, 300),
        timerLabel: noteTimerLabel,
        date: `${todayIsoDate()}T00:00:00.000Z`
      });
      setNoteText('');
      await load();
    } catch (error) {
      Alert.alert('Quick note save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  function startTimer() {
    const seconds = safeNumber(timerMinutes, 25) * 60;
    setTimerStartedAt(new Date().toISOString());
    setTimerSecondsLeft(seconds);
  }

  if (loading && !schedule) {
    return <Loader label="Loading focus and routines..." />;
  }

  return (
    <Screen>
      <Hero
        title="Focus and routines"
        subtitle="This area covers quick notes, persisted focus sessions, wake-up schedules, overrides, notifications, and timer-driven productivity data."
        action={<Button label="Refresh" onPress={load} tone="secondary" />}
      />

      <SectionCard title="Focus timer" subtitle="When the countdown finishes, the app stores a focus session in `calendar.focussessions`.">
        <Field label="Session title" value={timerTitle} onChangeText={setTimerTitle} placeholder="Deep work block" />
        <Field label="Minutes" value={timerMinutes} onChangeText={setTimerMinutes} placeholder="25" />
        <ButtonRow>
          <InlineStat label="Remaining" value={timerSecondsLeft ? toHourMinute(timerSecondsLeft) : 'idle'} />
          <Button label="Start timer" onPress={startTimer} />
          <Button label="Stop" tone="ghost" onPress={() => { setTimerSecondsLeft(0); setTimerStartedAt(null); }} />
        </ButtonRow>
      </SectionCard>

      <SectionCard title="Quick notes" subtitle="Saved inside the calendar domain so notes stay tied to the day and timer context.">
        <Field label="Note" value={noteText} onChangeText={setNoteText} placeholder="Remember lab notes" multiline />
        <Field label="Timer seconds" value={noteTimerSeconds} onChangeText={setNoteTimerSeconds} placeholder="300" />
        <Field label="Timer label" value={noteTimerLabel} onChangeText={setNoteTimerLabel} placeholder="05:00" />
        <Button label="Save note" onPress={saveNote} />
        {notes.length ? notes.map((note) => (
          <ListItem key={note.id} title={note.text} subtitle={`Saved ${toPrettyDate(note.createdAt)}`} meta={note.timerLabel ?? `${note.timerDurationSeconds}s`} />
        )) : <Banner text="No quick notes stored for today." tone="warning" />}
      </SectionCard>

      <SectionCard title="Wake-up schedule" subtitle="Weekly defaults and manual overrides are handled by the calendar service.">
        <Field label="Monday" value={monday} onChangeText={setMonday} placeholder="07:00" />
        <Field label="Tuesday" value={tuesday} onChangeText={setTuesday} placeholder="07:00" />
        <Field label="Wednesday" value={wednesday} onChangeText={setWednesday} placeholder="07:00" />
        <Field label="Thursday" value={thursday} onChangeText={setThursday} placeholder="07:00" />
        <Field label="Friday" value={friday} onChangeText={setFriday} placeholder="07:00" />
        <Field label="Saturday" value={saturday} onChangeText={setSaturday} placeholder="09:00" />
        <Field label="Sunday" value={sunday} onChangeText={setSunday} placeholder="09:00" />
        <Button label="Save weekly schedule" onPress={saveWakeupSchedule} />
        <Field label="Override date" value={overrideDate} onChangeText={setOverrideDate} placeholder="YYYY-MM-DD" />
        <Field label="Override time" value={overrideTime} onChangeText={setOverrideTime} placeholder="06:30" />
        <Field label="Override note" value={overrideNote} onChangeText={setOverrideNote} placeholder="Exam day" />
        <Button label="Add override" onPress={saveOverride} tone="secondary" />
        {schedule?.overrides.map((override) => (
          <ListItem key={override.id} title={`${override.date} -> ${override.wakeUpTime}`} subtitle={override.note ?? 'No note'}>
            <Button label="Delete override" tone="ghost" onPress={() => calendarApi.deleteWakeupOverride(token!, override.id).then(load).catch((error) => Alert.alert('Delete failed', error.message))} />
          </ListItem>
        ))}
      </SectionCard>

      <SectionCard title="Notifications and alarms" subtitle="Includes event alarms, wake-up alarms, and schedule reminders.">
        {notifications.length ? notifications.map((notification) => (
          <ListItem key={notification.id} title={notification.title} subtitle={notification.message ?? notification.type} meta={toPrettyDate(notification.scheduledAt)}>
            <Button label="Dismiss" tone="ghost" onPress={() => calendarApi.dismissNotification(token!, notification.id).then(load).catch((error) => Alert.alert('Dismiss failed', error.message))} />
          </ListItem>
        )) : <Banner text="No notifications scheduled for today." tone="success" />}
      </SectionCard>

      <SectionCard title="Today's focus sessions" subtitle="These records also feed analytics and recommendation quality.">
        {sessions.length ? sessions.map((session) => (
          <ListItem key={session.id} title={session.title} subtitle={`${toPrettyDate(session.startTime)} -> ${toPrettyDate(session.endTime)}`} meta={toHourMinute(session.durationSeconds)} />
        )) : <Banner text="No focus sessions recorded yet today." tone="warning" />}
      </SectionCard>
    </Screen>
  );
}

import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { calendarApi } from '@/api/services';
import { Banner, Button, ButtonRow, Field, Hero, ListItem, Loader, Screen, SectionCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { EventItem, TaskItem } from '@/types';
import { plusDays, safeNumber, todayIsoDate, toPrettyDate } from '@/utils';

export function PlannerScreen() {
  const { token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(todayIsoDate());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [eventId, setEventId] = useState('');
  const [eventTitle, setEventTitle] = useState('');
  const [eventDescription, setEventDescription] = useState('');
  const [eventStart, setEventStart] = useState(`${todayIsoDate()}T09:00:00.000Z`);
  const [eventEnd, setEventEnd] = useState(`${todayIsoDate()}T10:00:00.000Z`);
  const [eventLocation, setEventLocation] = useState('');
  const [eventRecurrence, setEventRecurrence] = useState('none');
  const [eventAlarmEnabled, setEventAlarmEnabled] = useState('false');
  const [eventAlarmMinutes, setEventAlarmMinutes] = useState('15');

  const [taskId, setTaskId] = useState('');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskMinutes, setTaskMinutes] = useState('45');
  const [taskPriority, setTaskPriority] = useState('medium');

  async function load() {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const startDate = `${selectedDate}T00:00:00.000Z`;
      const endDate = `${plusDays(7)}T23:59:59.999Z`;
      const [eventItems, taskItems] = await Promise.all([
        calendarApi.listEvents(token, startDate, endDate),
        calendarApi.listTasks(token, selectedDate)
      ]);
      setEvents(eventItems);
      setTasks(taskItems);
    } catch (error) {
      Alert.alert('Planner load failed', error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token, selectedDate]);

  function fillEventForm(item: EventItem) {
    setEventId(item.id);
    setEventTitle(item.title);
    setEventDescription(item.description ?? '');
    setEventStart(item.startDate);
    setEventEnd(item.endDate);
    setEventLocation(item.location?.address ?? item.location?.label ?? '');
    setEventRecurrence(item.recurrence?.frequency ?? 'none');
    setEventAlarmEnabled(String(item.alarmEnabled));
    setEventAlarmMinutes(String(item.alarm?.minutesBefore ?? 15));
  }

  function fillTaskForm(item: TaskItem) {
    setTaskId(item.id);
    setTaskTitle(item.title);
    setTaskDescription(item.description ?? '');
    setTaskMinutes(String(item.estimatedMinutes ?? item.estimatedDurationMinutes ?? 45));
    setTaskPriority(item.priority);
  }

  async function saveEvent() {
    if (!token) {
      return;
    }

    const body = {
      title: eventTitle,
      description: eventDescription || undefined,
      startDate: eventStart,
      endDate: eventEnd,
      location: eventLocation ? { label: eventLocation, address: eventLocation } : undefined,
      recurrence: eventRecurrence !== 'none' ? { frequency: eventRecurrence, interval: 1 } : undefined,
      alarm: eventAlarmEnabled === 'true'
        ? { enabled: true, minutesBefore: safeNumber(eventAlarmMinutes, 15) }
        : { enabled: false }
    };

    try {
      if (eventId) {
        await calendarApi.updateEvent(token, eventId, body);
      } else {
        await calendarApi.createEvent(token, body);
      }
      setEventId('');
      setEventTitle('');
      setEventDescription('');
      await load();
    } catch (error) {
      Alert.alert('Event save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function saveTask() {
    if (!token) {
      return;
    }

    const body = {
      title: taskTitle,
      description: taskDescription || undefined,
      date: selectedDate,
      estimatedMinutes: safeNumber(taskMinutes, 45),
      priority: taskPriority
    };

    try {
      if (taskId) {
        await calendarApi.updateTask(token, taskId, body);
      } else {
        await calendarApi.createTask(token, body);
      }
      setTaskId('');
      setTaskTitle('');
      setTaskDescription('');
      await load();
    } catch (error) {
      Alert.alert('Task save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  if (loading && !events.length && !tasks.length) {
    return <Loader label="Loading planner..." />;
  }

  return (
    <Screen>
      <Hero
        title="Planner"
        subtitle="Events and tasks are backed by the calendar service, including recurring event expansion and the newer completion and failure states."
        action={<Button label="Refresh planner" onPress={load} tone="secondary" />}
      />

      <SectionCard title="Planning date" subtitle="Task queries are date-based, while event queries use an interval window.">
        <Field label="Selected date" value={selectedDate} onChangeText={setSelectedDate} placeholder="YYYY-MM-DD" />
      </SectionCard>

      <SectionCard title={eventId ? 'Edit event' : 'Create event'} subtitle="Supports location, recurrence, and event alarm settings.">
        <Field label="Title" value={eventTitle} onChangeText={setEventTitle} placeholder="Algorithms lecture" />
        <Field label="Description" value={eventDescription} onChangeText={setEventDescription} placeholder="Optional notes" multiline />
        <Field label="Start ISO" value={eventStart} onChangeText={setEventStart} placeholder="2026-05-26T09:00:00.000Z" />
        <Field label="End ISO" value={eventEnd} onChangeText={setEventEnd} placeholder="2026-05-26T10:00:00.000Z" />
        <Field label="Location" value={eventLocation} onChangeText={setEventLocation} placeholder="10 Main Street" />
        <Field label="Recurrence" value={eventRecurrence} onChangeText={setEventRecurrence} placeholder="none | daily | weekly | monthly | yearly" />
        <Field label="Alarm enabled" value={eventAlarmEnabled} onChangeText={setEventAlarmEnabled} placeholder="true or false" />
        <Field label="Alarm minutes before" value={eventAlarmMinutes} onChangeText={setEventAlarmMinutes} placeholder="15" />
        <ButtonRow>
          <Button label={eventId ? 'Update event' : 'Create event'} onPress={saveEvent} />
          <Button
            label="Clear"
            tone="ghost"
            onPress={() => {
              setEventId('');
              setEventTitle('');
              setEventDescription('');
            }}
          />
        </ButtonRow>
      </SectionCard>

      <SectionCard title="Upcoming events" subtitle="Occurrences returned here may be expanded from recurring rules by the backend.">
        {events.length ? events.map((item) => (
          <ListItem
            key={item.id}
            title={item.title}
            subtitle={`${toPrettyDate(item.startTime)} -> ${toPrettyDate(item.endTime)}`}
            meta={item.failedAt ? 'failed' : item.completedAt ? 'done' : item.recurrence?.frequency ?? 'single'}
          >
            {item.location?.address ? <Banner text={`Location: ${item.location.address}`} tone="info" /> : null}
            <ButtonRow>
              <Button label="Edit" tone="ghost" onPress={() => fillEventForm(item)} />
              <Button label="Done" onPress={() => calendarApi.completeEvent(token!, item.id).then(load).catch((error) => Alert.alert('Action failed', error.message))} />
              <Button label="Fail" tone="danger" onPress={() => calendarApi.failEvent(token!, item.id).then(load).catch((error) => Alert.alert('Action failed', error.message))} />
              <Button label="Delete" tone="ghost" onPress={() => calendarApi.deleteEvent(token!, item.id).then(load).catch((error) => Alert.alert('Delete failed', error.message))} />
            </ButtonRow>
          </ListItem>
        )) : <Banner text="No events in the current query window." tone="warning" />}
      </SectionCard>

      <SectionCard title={taskId ? 'Edit task' : 'Create task'} subtitle="Tasks support complete and fail states in addition to regular updates.">
        <Field label="Title" value={taskTitle} onChangeText={setTaskTitle} placeholder="Study cloud computing" />
        <Field label="Description" value={taskDescription} onChangeText={setTaskDescription} placeholder="Optional notes" multiline />
        <Field label="Estimated minutes" value={taskMinutes} onChangeText={setTaskMinutes} placeholder="45" />
        <Field label="Priority" value={taskPriority} onChangeText={setTaskPriority} placeholder="low | medium | high" />
        <ButtonRow>
          <Button label={taskId ? 'Update task' : 'Create task'} onPress={saveTask} />
          <Button
            label="Clear"
            tone="ghost"
            onPress={() => {
              setTaskId('');
              setTaskTitle('');
              setTaskDescription('');
            }}
          />
        </ButtonRow>
      </SectionCard>

      <SectionCard title="Tasks of the day" subtitle="The list reflects the selected date above.">
        {tasks.length ? tasks.map((item) => (
          <ListItem
            key={item.id}
            title={item.title}
            subtitle={`${item.estimatedMinutes ?? item.estimatedDurationMinutes ?? 0} minutes`}
            meta={item.failedAt ? 'failed' : item.status}
          >
            {item.description ? <Banner text={item.description} tone="info" /> : null}
            <ButtonRow>
              <Button label="Edit" tone="ghost" onPress={() => fillTaskForm(item)} />
              <Button label="Done" onPress={() => calendarApi.completeTask(token!, item.id).then(load).catch((error) => Alert.alert('Action failed', error.message))} />
              <Button label="Fail" tone="danger" onPress={() => calendarApi.failTask(token!, item.id).then(load).catch((error) => Alert.alert('Action failed', error.message))} />
              <Button label="Delete" tone="ghost" onPress={() => calendarApi.deleteTask(token!, item.id).then(load).catch((error) => Alert.alert('Delete failed', error.message))} />
            </ButtonRow>
          </ListItem>
        )) : <Banner text="No tasks stored for this date yet." tone="warning" />}
      </SectionCard>
    </Screen>
  );
}

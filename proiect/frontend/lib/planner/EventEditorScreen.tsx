import { useNavigation, useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { calendarApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import type { EventItem } from '@/types';
import { isTodayDate, markTodayCommuteInvalidated } from '../global/commute';
import { FilledButton, LabeledInput, NativeDateTimeField, ToggleRow } from '../global/controls';
import { ScreenShell, BrandHeader, SurfaceCard } from '../global/layout';

export function EventEditorScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode = route.params?.mode ?? 'create';
  const event = route.params?.event as EventItem | undefined;
  const selectedDate = route.params?.selectedDate as string | undefined;

  const initialStart = event?.startTime ?? `${selectedDate ?? new Date().toISOString().slice(0, 10)}T09:00:00.000Z`;
  const initialEnd = event?.endTime ?? `${selectedDate ?? new Date().toISOString().slice(0, 10)}T10:00:00.000Z`;

  const [title, setTitle] = useState(event?.title ?? '');
  const [description, setDescription] = useState(event?.description ?? '');
  const [startDate, setStartDate] = useState(initialStart);
  const [endDate, setEndDate] = useState(initialEnd);
  const [location, setLocation] = useState(event?.location?.address ?? event?.location?.label ?? '');
  const [alarmEnabled, setAlarmEnabled] = useState(event?.alarmEnabled ?? false);
  const [minutesBefore, setMinutesBefore] = useState(String(event?.alarm?.minutesBefore ?? 15));

  useEffect(() => {
    navigation.setOptions?.({ title: mode === 'edit' ? 'Edit Event' : 'Add Event' });
  }, [mode, navigation]);

  async function save() {
    if (!token) {
      return;
    }
    try {
      const payload = {
        title,
        description: description || undefined,
        startDate,
        endDate,
        location: location ? { address: location, label: location } : undefined,
        alarm: alarmEnabled ? { enabled: true, minutesBefore: Number(minutesBefore) } : { enabled: false }
      };

      if (mode === 'edit' && event) {
        await calendarApi.updateEvent(token, event.id, payload);
        if (isTodayDate(new Date(startDate).toISOString().slice(0, 10))) {
          await markTodayCommuteInvalidated();
        }
      } else {
        await calendarApi.createEvent(token, payload);
        if (isTodayDate(new Date(startDate).toISOString().slice(0, 10))) {
          await markTodayCommuteInvalidated();
        }
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Event save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  return (
    <ScreenShell>
      <BrandHeader title={mode === 'edit' ? 'Edit event' : 'Add event'} badge="FocusFlow" />
      <SurfaceCard tone="raised">
        <LabeledInput label="Title" value={title} onChangeText={setTitle} placeholder="Algorithms lecture" />
        <LabeledInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional notes" multiline />
        <NativeDateTimeField label="Start" value={startDate} onChange={setStartDate} />
        <NativeDateTimeField label="End" value={endDate} onChange={setEndDate} />
        <LabeledInput label="Location" value={location} onChangeText={setLocation} placeholder="10 Main Street, Bucharest" />
        <ToggleRow label="Alarm enabled" value={alarmEnabled} onValueChange={setAlarmEnabled} />
        {alarmEnabled ? <LabeledInput label="Minutes before" value={minutesBefore} onChangeText={setMinutesBefore} placeholder="15" /> : null}
        <FilledButton label={mode === 'edit' ? 'Save changes' : 'Create event'} onPress={save} />
        {mode === 'edit' && event ? (
          <FilledButton
            label="Delete event"
            tone="ghost"
            onPress={async () => {
              try {
                await calendarApi.deleteEvent(token!, event.id);
                if (isTodayDate(new Date(event.startTime).toISOString().slice(0, 10))) {
                  await markTodayCommuteInvalidated();
                }
                navigation.goBack();
              } catch (error) {
                Alert.alert('Delete failed', error instanceof Error ? error.message : 'Unexpected error');
              }
            }}
          />
        ) : null}
      </SurfaceCard>
    </ScreenShell>
  );
}

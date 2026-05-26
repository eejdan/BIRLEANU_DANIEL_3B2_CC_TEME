import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Text } from 'react-native';

import { calendarApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import type { WakeupScheduleResponse } from '@/types';
import { FilledButton, NativeTimeField, LabeledInput } from '../global/controls';
import { ScreenShell, BrandHeader, SurfaceCard } from '../global/layout';
import { theme } from '../theme';

export function WakeupEditorScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const selectedDate = route.params?.selectedDate as string;
  const [schedule, setSchedule] = useState<WakeupScheduleResponse | null>(null);
  const [time, setTime] = useState('07:00');
  const [note, setNote] = useState('');

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    const response = await calendarApi.getWakeupSchedule(token);
    setSchedule(response);
    const existing = response.overrides.find((item) => item.date === selectedDate);
    if (existing) {
      setTime(existing.wakeUpTime);
      setNote(existing.note ?? '');
    }
  }, [selectedDate, token]);

  useFocusEffect(useCallback(() => {
    load().catch((error) => {
      Alert.alert('Wake-up data failed to load', error instanceof Error ? error.message : 'Unexpected error');
    });
  }, [load]));

  const override = schedule?.overrides.find((item) => item.date === selectedDate);

  return (
    <ScreenShell>
      <BrandHeader title="Wake-up time" badge="FocusFlow" subtitle={`Override for ${selectedDate}`} />
      <SurfaceCard tone="raised">
        <NativeTimeField label="Wake-up time" value={time} onChange={setTime} />
        <LabeledInput label="Note" value={note} onChangeText={setNote} placeholder="Exam day" />
        <FilledButton
          label={override ? 'Update override' : 'Set override'}
          onPress={async () => {
            try {
              await calendarApi.createWakeupOverride(token!, {
                date: selectedDate,
                wakeupTime: time,
                note: note || undefined
              });
              navigation.goBack();
            } catch (error) {
              Alert.alert('Override save failed', error instanceof Error ? error.message : 'Unexpected error');
            }
          }}
        />
        {override ? (
          <FilledButton
            label="Reset to default"
            tone="ghost"
            onPress={async () => {
              try {
                await calendarApi.deleteWakeupOverride(token!, override.id);
                navigation.goBack();
              } catch (error) {
                Alert.alert('Reset failed', error instanceof Error ? error.message : 'Unexpected error');
              }
            }}
          />
        ) : (
          <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>
            No override exists for this day. Saving will keep the weekly default untouched for other dates.
          </Text>
        )}
      </SurfaceCard>
    </ScreenShell>
  );
}

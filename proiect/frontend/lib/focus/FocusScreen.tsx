import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Text, View } from 'react-native';

import { calendarApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import type { QuickNote } from '@/types';
import { FilledButton, LabeledInput } from '../global/controls';
import { ScreenShell, BrandHeader, SectionHeader, SurfaceCard } from '../global/layout';
import { AdCard, UpgradeCard } from '../global/monetization';
import { theme } from '../theme';

export function FocusScreen() {
  const { token, user } = useAuth();
  const [minutes, setMinutes] = useState('25');
  const [title, setTitle] = useState('Deep focus');
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [startedAt, setStartedAt] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState<QuickNote[]>([]);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    const today = new Date().toISOString().slice(0, 10);
    const response = await calendarApi.listQuickNotes(token, today);
    setNotes(response);
  }, [token]);

  useFocusEffect(useCallback(() => {
    load().catch((error) => Alert.alert('Focus data failed to load', error instanceof Error ? error.message : 'Unexpected error'));
  }, [load]));

  useEffect(() => {
    if (!secondsLeft) {
      return;
    }
    const id = setInterval(() => {
      setSecondsLeft((current) => {
        if (current <= 1) {
          clearInterval(id);
          return 0;
        }
        return current - 1;
      });
    }, 1000);

    return () => clearInterval(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (secondsLeft === 0 && startedAt && token) {
      const endTime = new Date().toISOString();
      calendarApi.createFocusSession(token, {
        title,
        sessionType: 'focus',
        startTime: startedAt,
        endTime,
        durationSeconds: Number(minutes) * 60,
        source: 'timer'
      }).finally(() => {
        setStartedAt(null);
      });
    }
  }, [secondsLeft, startedAt, title, token, minutes]);

  return (
    <ScreenShell footer={<AdCard />}>
      <BrandHeader title="Focus" badge="FocusFlow" subtitle="Minimal, modern, and built around the timer." />

      <SurfaceCard tone="high">
        <SectionHeader title="Focus timer" />
        <View style={{
          alignItems: 'center',
          justifyContent: 'center',
          paddingVertical: theme.spacing(3),
          borderRadius: 180,
          backgroundColor: theme.colors.surfaceHighest
        }}>
          <Text style={{ color: theme.colors.primary, fontSize: 46, fontWeight: '800' }}>
            {Math.floor(secondsLeft / 60).toString().padStart(2, '0')}:{(secondsLeft % 60).toString().padStart(2, '0')}
          </Text>
          <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>
            {secondsLeft ? 'In session' : 'Ready'}
          </Text>
        </View>
        <LabeledInput label="Session title" value={title} onChangeText={setTitle} placeholder="Deep work block" />
        <LabeledInput label="Minutes" value={minutes} onChangeText={setMinutes} placeholder="25" />
        <FilledButton label="Start focus session" onPress={() => {
          setStartedAt(new Date().toISOString());
          setSecondsLeft(Number(minutes) * 60);
        }} />
      </SurfaceCard>

      <SurfaceCard tone="raised">
        <SectionHeader title="Quick notes" />
        <LabeledInput label="Note" value={noteText} onChangeText={setNoteText} placeholder="Capture a thought before it disappears" multiline />
        <FilledButton
          label="Save quick note"
          tone="secondary"
          onPress={async () => {
            try {
              await calendarApi.createQuickNote(token!, {
                text: noteText,
                timerDurationSeconds: Number(minutes) * 60,
                timerLabel: `${minutes}:00`,
                date: `${new Date().toISOString().slice(0, 10)}T00:00:00.000Z`
              });
              setNoteText('');
              await load();
            } catch (error) {
              Alert.alert('Quick note failed', error instanceof Error ? error.message : 'Unexpected error');
            }
          }}
        />
        {notes.map((note) => (
          <SurfaceCard key={note.id} tone="surface">
            <Text style={{ color: theme.colors.text, fontSize: 16, fontWeight: '700' }}>{note.text}</Text>
            <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>{note.timerLabel ?? `${note.timerDurationSeconds}s`}</Text>
          </SurfaceCard>
        ))}
      </SurfaceCard>

      {user?.plan === 'free' ? <UpgradeCard /> : null}
    </ScreenShell>
  );
}

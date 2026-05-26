import { useNavigation, useRoute } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useState } from 'react';

import { calendarApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import type { TaskItem } from '@/types';
import { isTodayDate, markTodayCommuteInvalidated } from '../global/commute';
import { FilledButton, LabeledInput, NativeDateField } from '../global/controls';
import { ScreenShell, BrandHeader, SurfaceCard } from '../global/layout';

export function TaskEditorScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const mode = route.params?.mode ?? 'create';
  const task = route.params?.task as TaskItem | undefined;
  const selectedDate = route.params?.selectedDate as string | undefined;

  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [date, setDate] = useState(task?.date ?? selectedDate ?? new Date().toISOString().slice(0, 10));
  const [estimatedMinutes, setEstimatedMinutes] = useState(String(task?.estimatedMinutes ?? task?.estimatedDurationMinutes ?? 45));
  const [priority, setPriority] = useState(task?.priority ?? 'medium');

  async function save() {
    if (!token) {
      return;
    }
    try {
      const payload = {
        title,
        description: description || undefined,
        date,
        estimatedMinutes: Number(estimatedMinutes),
        priority
      };

      if (mode === 'edit' && task) {
        await calendarApi.updateTask(token, task.id, payload);
      } else {
        await calendarApi.createTask(token, payload);
      }

      if (isTodayDate(date)) {
        await markTodayCommuteInvalidated();
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Task save failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  return (
    <ScreenShell>
      <BrandHeader title={mode === 'edit' ? 'Edit task' : 'Add task'} badge="FocusFlow" />
      <SurfaceCard tone="raised">
        <LabeledInput label="Title" value={title} onChangeText={setTitle} placeholder="Study cloud computing" />
        <LabeledInput label="Description" value={description} onChangeText={setDescription} placeholder="Optional notes" multiline />
        <NativeDateField label="Date" value={date} onChange={setDate} />
        <LabeledInput label="Estimated minutes" value={estimatedMinutes} onChangeText={setEstimatedMinutes} placeholder="45" />
        <LabeledInput
          label="Priority"
          value={priority}
          onChangeText={(next) => setPriority((['low', 'medium', 'high'].includes(next) ? next : 'medium') as 'low' | 'medium' | 'high')}
          placeholder="low | medium | high"
        />
        <FilledButton label={mode === 'edit' ? 'Save changes' : 'Create task'} onPress={save} />
        {mode === 'edit' && task ? (
          <FilledButton
            label="Delete task"
            tone="ghost"
            onPress={async () => {
              try {
                await calendarApi.deleteTask(token!, task.id);
                if (isTodayDate(task.date)) {
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

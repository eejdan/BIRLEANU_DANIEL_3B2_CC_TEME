import React, { useEffect, useState } from 'react';
import { Linking, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

const priorities = [
  { key: 'low', label: 'Scazut' },
  { key: 'medium', label: 'Mediu' },
  { key: 'high', label: 'Important' },
  { key: 'urgent', label: 'Urgent' }
];

const mockMapLocations = [
  { name: 'Biblioteca Centrala', lat: 44.4414, lng: 26.0969 },
  { name: 'Campus Universitar', lat: 44.4359, lng: 26.1025 },
  { name: 'Hub de lucru', lat: 44.4268, lng: 26.1025 },
  { name: 'Sala Fitness', lat: 44.4512, lng: 26.0835 },
  { name: 'Parcul Herastrau', lat: 44.4709, lng: 26.0824 }
];

function mapsUrlForLocation(location) {
  return `https://www.google.com/maps/search/?api=1&query=${location.lat},${location.lng}`;
}

export function TaskEditorModal({
  visible,
  task,
  draftTask,
  labels,
  selectedDate,
  isPremium,
  error,
  onClose,
  onSave,
  onDelete
}) {
  const [form, setForm] = useState(emptyForm(selectedDate));

  useEffect(() => {
    setForm(task || draftTask ? normalizeTask(task || draftTask) : emptyForm(selectedDate));
  }, [task, draftTask, selectedDate, visible]);

  const update = (field, value) => setForm((current) => ({ ...current, [field]: value }));
  const activeLabel = form.newLabel.trim() || form.label;

  const selectMockLocation = () => {
    const location = mockMapLocations[Math.floor(Math.random() * mockMapLocations.length)];
    const locationUrl = mapsUrlForLocation(location);

    setForm((current) => ({
      ...current,
      location: location.name,
      locationUrl,
      locationCoords: { lat: location.lat, lng: location.lng }
    }));
    Linking.openURL(locationUrl);
  };

  const save = () => {
    if (!form.title.trim()) {
      return;
    }

    onSave({
      ...form,
      title: form.title.trim(),
      label: activeLabel || 'General',
      date: form.date || selectedDate,
      startTime: isPremium ? form.startTime : '',
      endTime: isPremium ? form.endTime : ''
    });
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>{task ? 'Editare task' : 'Task nou'}</Text>
              <Text style={styles.title}>{task ? task.title : draftTask?.title || 'Planifica un task'}</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Inchide task modal" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.close}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.form} showsVerticalScrollIndicator={false}>
            <Field label="Nume task">
              <TextInput
                value={form.title}
                onChangeText={(value) => update('title', value)}
                placeholder="Ex: Finalizare raport"
                placeholderTextColor="rgba(199,196,215,0.55)"
                style={styles.input}
              />
            </Field>

            <Field label="Zi calendar">
              <TextInput
                value={form.date}
                onChangeText={(value) => update('date', value)}
                placeholder="YYYY-MM-DD"
                placeholderTextColor="rgba(199,196,215,0.55)"
                style={styles.input}
              />
            </Field>

            <Field label="Interval programat">
              <View style={styles.timeRow}>
                <TextInput
                  editable={isPremium}
                  value={form.startTime}
                  onChangeText={(value) => update('startTime', value)}
                  placeholder="09:30"
                  placeholderTextColor="rgba(199,196,215,0.55)"
                  style={[styles.input, styles.timeInput, !isPremium && styles.disabledInput]}
                />
                <TextInput
                  editable={isPremium}
                  value={form.endTime}
                  onChangeText={(value) => update('endTime', value)}
                  placeholder="10:30"
                  placeholderTextColor="rgba(199,196,215,0.55)"
                  style={[styles.input, styles.timeInput, !isPremium && styles.disabledInput]}
                />
              </View>
              {!isPremium ? <Text style={styles.planNote}>Doar Premium poate programa taskuri pe ore si durata.</Text> : null}
            </Field>

            <Field label="Locatie">
              <View style={styles.locationBox}>
                <View style={styles.locationCopy}>
                  <Text style={styles.locationTitle}>{form.location || 'Nicio locatie selectata'}</Text>
                  <Text style={styles.locationText}>
                    {form.locationUrl || 'Backend-ul va primi aici un link mock catre Google Maps.'}
                  </Text>
                </View>
                <TouchableOpacity activeOpacity={0.86} style={styles.locationButton} onPress={selectMockLocation}>
                  <Text style={styles.locationButtonText}>{form.location ? 'Schimba' : 'Selecteaza'}</Text>
                </TouchableOpacity>
              </View>
            </Field>

            <Field label="Label existent">
              <View style={styles.chips}>
                {labels.map((label) => (
                  <TouchableOpacity
                    key={label}
                    activeOpacity={0.86}
                    onPress={() => update('label', label)}
                    style={[styles.chip, form.label === label && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, form.label === label && styles.chipTextActive]}>{label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>

            <Field label="Creeaza label nou">
              <TextInput
                value={form.newLabel}
                onChangeText={(value) => update('newLabel', value)}
                placeholder="Ex: Facultate"
                placeholderTextColor="rgba(199,196,215,0.55)"
                style={styles.input}
              />
            </Field>

            <Field label="Grad importanta">
              <View style={styles.chips}>
                {priorities.map((priority) => (
                  <TouchableOpacity
                    key={priority.key}
                    activeOpacity={0.86}
                    onPress={() => update('importance', priority.key)}
                    style={[
                      styles.priorityChip,
                      { borderColor: priorityColor(priority.key) },
                      form.importance === priority.key && { backgroundColor: priorityColor(priority.key) }
                    ]}
                  >
                    <Text
                      style={[
                        styles.priorityText,
                        form.importance === priority.key && styles.priorityTextActive
                      ]}
                    >
                      {priority.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Field>
          </ScrollView>

          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.actions}>
            {task ? (
              <TouchableOpacity activeOpacity={0.86} style={styles.deleteButton} onPress={() => onDelete(task.id)}>
                <Text style={styles.deleteText}>Sterge</Text>
              </TouchableOpacity>
            ) : null}
            <TouchableOpacity activeOpacity={0.86} style={styles.saveButton} onPress={save}>
              <Text style={styles.saveText}>{task ? 'Salveaza' : 'Creeaza task'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function Field({ label, children }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {children}
    </View>
  );
}

function emptyForm(date) {
  return {
    title: '',
    date,
    startTime: '',
    endTime: '',
    location: '',
    locationUrl: '',
    locationCoords: null,
    label: 'Focus',
    newLabel: '',
    importance: 'medium'
  };
}

function normalizeTask(task) {
  return {
    title: task.title || '',
    date: task.date || '',
    startTime: task.startTime || '',
    endTime: task.endTime || '',
    location: task.location || '',
    locationUrl: task.locationUrl || '',
    locationCoords: task.locationCoords || null,
    label: task.label || 'Focus',
    newLabel: '',
    importance: task.importance || 'medium',
    id: task.id
  };
}

export function priorityColor(priority) {
  return {
    low: colors.secondary,
    medium: colors.primary,
    high: colors.tertiary,
    urgent: colors.error
  }[priority] || colors.primary;
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
    padding: 14
  },
  sheet: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '92%',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: colors.surfaceRaised,
    padding: 18
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 16
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900'
  },
  closeButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  close: {
    color: colors.text,
    fontSize: 26
  },
  form: {
    gap: 13,
    paddingBottom: 10
  },
  field: {
    gap: 7
  },
  fieldLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  input: {
    minHeight: 46,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    backgroundColor: colors.background,
    color: colors.text,
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '600'
  },
  disabledInput: {
    opacity: 0.45
  },
  timeRow: {
    flexDirection: 'row',
    gap: 10
  },
  timeInput: {
    flex: 1
  },
  planNote: {
    color: colors.tertiary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '700'
  },
  locationBox: {
    minHeight: 76,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    backgroundColor: colors.background,
    padding: 10
  },
  locationCopy: {
    flex: 1,
    gap: 4
  },
  locationTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '800'
  },
  locationText: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600'
  },
  locationButton: {
    minHeight: 38,
    borderRadius: radii.sm,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  locationButtonText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '900'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  chipActive: {
    backgroundColor: colors.secondaryContainer,
    borderColor: colors.secondaryContainer
  },
  chipText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800'
  },
  chipTextActive: {
    color: colors.secondary
  },
  priorityChip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  priorityText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800'
  },
  priorityTextActive: {
    color: colors.onPrimary
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
    paddingTop: 12
  },
  errorBox: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.36)',
    backgroundColor: 'rgba(255,180,171,0.08)',
    padding: 10,
    marginTop: 8
  },
  errorText: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '800'
  },
  deleteButton: {
    flex: 1,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.error
  },
  deleteText: {
    color: colors.error,
    fontWeight: '900'
  },
  saveButton: {
    flex: 1.4,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.primary
  },
  saveText: {
    color: colors.onPrimary,
    fontWeight: '900'
  }
});

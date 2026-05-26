import DateTimePicker from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Platform, Pressable, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import type { PropsWithChildren } from 'react';

import { theme } from '../theme';

export function FilledButton({ label, onPress, tone = 'primary' }: { label: string; onPress: () => void; tone?: 'primary' | 'secondary' | 'ghost' | 'danger' }) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [
      styles.button,
      tone === 'primary' ? styles.buttonPrimary : null,
      tone === 'secondary' ? styles.buttonSecondary : null,
      tone === 'ghost' ? styles.buttonGhost : null,
      tone === 'danger' ? styles.buttonDanger : null,
      pressed ? styles.buttonPressed : null
    ]}>
      <Text style={[
        styles.buttonText,
        tone === 'ghost' ? styles.buttonTextGhost : null
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ButtonRow({ children }: PropsWithChildren) {
  return <View style={styles.buttonRow}>{children}</View>;
}

export function SegmentedSwitch({ value, onChange, options }: { value: string; onChange: (value: string) => void; options: Array<{ label: string; value: string }> }) {
  return (
    <View style={styles.segmented}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => onChange(option.value)}
            style={[styles.segment, active ? styles.segmentActive : null]}
          >
            <Text style={[styles.segmentText, active ? styles.segmentTextActive : null]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function LabeledInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  multiline = false
}: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.textMuted}
        secureTextEntry={secureTextEntry}
        multiline={multiline}
        style={[styles.input, multiline ? styles.inputMultiline : null]}
      />
    </View>
  );
}

export function ToggleRow({ label, value, onValueChange }: { label: string; value: boolean; onValueChange: (next: boolean) => void }) {
  return (
    <View style={styles.toggleRow}>
      <Text style={styles.toggleLabel}>{label}</Text>
      <Switch value={value} onValueChange={onValueChange} thumbColor={value ? theme.colors.primaryStrong : theme.colors.outline} />
    </View>
  );
}

function formatDateValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function formatTimeValue(date: Date) {
  return date.toISOString().slice(11, 16);
}

function formatDateTimeLocalValue(date: Date) {
  return `${formatDateValue(date)}T${formatTimeValue(date)}`;
}

function parseDateTime(input: string) {
  const date = new Date(input);
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function WebNativeInput({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (value: string) => void }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      {React.createElement('input', {
        value,
        type,
        onChange: (event: React.ChangeEvent<HTMLInputElement>) => onChange(event.target.value),
        style: {
          height: 48,
          borderRadius: 12,
          border: `1px solid ${theme.colors.outlineSubtle}`,
          background: theme.colors.surfaceHighest,
          color: theme.colors.text,
          padding: '0 14px',
          fontSize: 16,
          fontWeight: 600
        }
      })}
    </View>
  );
}

export function NativeDateField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const parsed = useMemo(() => parseDateTime(value || new Date().toISOString()), [value]);
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    return <WebNativeInput label={label} type="date" value={value.slice(0, 10)} onChange={onChange} />;
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.pickerButton} onPress={() => setOpen(true)}>
        <Text style={styles.pickerValue}>{formatDateValue(parsed)}</Text>
        <MaterialCommunityIcons name="calendar-month-outline" size={18} color={theme.colors.primary} />
      </Pressable>
      {open ? (
        <DateTimePicker
          value={parsed}
          mode="date"
          onChange={(_, next) => {
            setOpen(false);
            if (next) {
              onChange(formatDateValue(next));
            }
          }}
        />
      ) : null}
    </View>
  );
}

export function NativeTimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const base = parseDateTime(`2026-01-01T${value || '07:00'}:00`);
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    return <WebNativeInput label={label} type="time" value={value} onChange={onChange} />;
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.pickerButton} onPress={() => setOpen(true)}>
        <Text style={styles.pickerValue}>{formatTimeValue(base)}</Text>
        <MaterialCommunityIcons name="clock-outline" size={18} color={theme.colors.primary} />
      </Pressable>
      {open ? (
        <DateTimePicker
          value={base}
          mode="time"
          onChange={(_, next) => {
            setOpen(false);
            if (next) {
              onChange(formatTimeValue(next));
            }
          }}
        />
      ) : null}
    </View>
  );
}

export function NativeDateTimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  const parsed = useMemo(() => parseDateTime(value || new Date().toISOString()), [value]);
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <WebNativeInput
        label={label}
        type="datetime-local"
        value={value ? formatDateTimeLocalValue(parsed) : ''}
        onChange={(next) => onChange(new Date(next).toISOString())}
      />
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.pickerButton} onPress={() => setOpen(true)}>
        <Text style={styles.pickerValue}>{parsed.toLocaleString()}</Text>
        <MaterialCommunityIcons name="calendar-clock-outline" size={18} color={theme.colors.primary} />
      </Pressable>
      {open ? (
        <DateTimePicker
          value={parsed}
          mode="datetime"
          onChange={(_, next) => {
            setOpen(false);
            if (next) {
              onChange(next.toISOString());
            }
          }}
        />
      ) : null}
    </View>
  );
}

export function NativeMonthField({ label, value, onChange }: { label: string; value: Date; onChange: (value: Date) => void }) {
  const [open, setOpen] = useState(false);

  if (Platform.OS === 'web') {
    return (
      <WebNativeInput
        label={label}
        type="month"
        value={`${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, '0')}`}
        onChange={(next) => {
          const [year, month] = next.split('-').map(Number);
          onChange(new Date(year, month - 1, 1));
        }}
      />
    );
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable style={styles.pickerButton} onPress={() => setOpen(true)}>
        <Text style={styles.pickerValue}>
          {value.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
        <MaterialCommunityIcons name="calendar" size={18} color={theme.colors.primary} />
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value}
          mode="date"
          onChange={(_, next) => {
            setOpen(false);
            if (next) {
              onChange(new Date(next.getFullYear(), next.getMonth(), 1));
            }
          }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 46,
    flex: 1,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary
  },
  buttonSecondary: {
    backgroundColor: theme.colors.primaryStrong
  },
  buttonGhost: {
    backgroundColor: theme.colors.surfaceHighest,
    borderWidth: 1,
    borderColor: theme.colors.outlineSubtle
  },
  buttonDanger: {
    backgroundColor: theme.colors.error
  },
  buttonPressed: {
    opacity: 0.85
  },
  buttonText: {
    color: theme.colors.onPrimary,
    fontWeight: '800'
  },
  buttonTextGhost: {
    color: theme.colors.text
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing(1)
  },
  segmented: {
    flexDirection: 'row',
    gap: 8,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radii.pill,
    padding: 4,
    borderWidth: 1,
    borderColor: theme.colors.outlineSubtle
  },
  segment: {
    flex: 1,
    minHeight: 44,
    borderRadius: theme.radii.pill,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentActive: {
    backgroundColor: theme.colors.primary
  },
  segmentText: {
    color: theme.colors.textMuted,
    fontWeight: '700'
  },
  segmentTextActive: {
    color: theme.colors.onPrimary
  },
  field: {
    gap: 8
  },
  label: {
    color: theme.colors.textMuted,
    ...theme.typography.label
  },
  input: {
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outlineSubtle,
    backgroundColor: theme.colors.surfaceHighest,
    color: theme.colors.text,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 16
  },
  inputMultiline: {
    minHeight: 108,
    textAlignVertical: 'top'
  },
  toggleRow: {
    minHeight: 52,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceHighest,
    borderWidth: 1,
    borderColor: theme.colors.outlineSubtle,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  toggleLabel: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  pickerButton: {
    minHeight: 48,
    borderRadius: theme.radii.md,
    borderWidth: 1,
    borderColor: theme.colors.outlineSubtle,
    backgroundColor: theme.colors.surfaceHighest,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14
  },
  pickerValue: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700'
  }
});

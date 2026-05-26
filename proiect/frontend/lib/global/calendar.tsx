import { Pressable, StyleSheet, Text, View } from 'react-native';

import { theme } from '../theme';

function monthGridDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const startOffset = (first.getDay() + 6) % 7;
  const firstCell = new Date(year, month, 1 - startOffset);
  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(firstCell);
    date.setDate(firstCell.getDate() + index);
    return date;
  });
}

export function MonthGrid({
  monthDate,
  selectedDate,
  onSelectDate,
  onPressMonth
}: {
  monthDate: Date;
  selectedDate: string;
  onSelectDate: (value: string) => void;
  onPressMonth: () => void;
}) {
  const days = monthGridDays(monthDate);

  return (
    <View style={styles.wrapper}>
      <Pressable onPress={onPressMonth} style={styles.monthButton}>
        <Text style={styles.monthText}>
          {monthDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
        </Text>
      </Pressable>
      <View style={styles.weekdayRow}>
        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
          <Text key={day} style={styles.weekday}>{day}</Text>
        ))}
      </View>
      <View style={styles.grid}>
        {days.map((date) => {
          const iso = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())).toISOString().slice(0, 10);
          const selected = iso === selectedDate;
          const outside = date.getMonth() !== monthDate.getMonth();
          return (
            <Pressable
              key={iso}
              onPress={() => onSelectDate(iso)}
              style={[styles.dayCell, selected ? styles.daySelected : null]}
            >
              <Text style={[
                styles.dayText,
                outside ? styles.dayOutside : null,
                selected ? styles.dayTextSelected : null
              ]}>
                {date.getDate()}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: theme.spacing(1.5)
  },
  monthButton: {
    alignSelf: 'flex-start'
  },
  monthText: {
    color: theme.colors.primary,
    fontSize: 20,
    fontWeight: '800'
  },
  weekdayRow: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  weekday: {
    flex: 1,
    textAlign: 'center',
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '800'
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6
  },
  dayCell: {
    width: '13.4%',
    aspectRatio: 1,
    borderRadius: theme.radii.md,
    backgroundColor: theme.colors.surfaceHighest,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.colors.outlineSubtle
  },
  daySelected: {
    backgroundColor: theme.colors.primary
  },
  dayText: {
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: '700'
  },
  dayOutside: {
    color: theme.colors.outline
  },
  dayTextSelected: {
    color: theme.colors.onPrimary
  }
});

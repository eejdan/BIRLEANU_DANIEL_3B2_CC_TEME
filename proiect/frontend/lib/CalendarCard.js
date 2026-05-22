import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, typography } from './theme';

export function CalendarCard({
  calendar,
  onSelectDay,
  onPreviousMonth,
  onNextMonth
}) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.heading}>{calendar.monthLabel}</Text>
        <View style={styles.controls}>
          <TouchableOpacity accessibilityLabel="Luna precedenta" style={styles.controlButton} onPress={onPreviousMonth}>
            <Text style={styles.chevron}>‹</Text>
          </TouchableOpacity>
          <TouchableOpacity accessibilityLabel="Luna urmatoare" style={styles.controlButton} onPress={onNextMonth}>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.weekGrid}>
        {calendar.weekDays.map((day) => (
          <Text key={day} style={styles.weekDay}>{day}</Text>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {calendar.days.map((day, index) => (
          <TouchableOpacity
            key={`${day.value}-${index}-${day.date}`}
            activeOpacity={0.82}
            style={styles.daySlot}
            onPress={() => onSelectDay?.(day)}
          >
            <View style={[styles.dayCircle, day.selected && styles.selectedDay]}>
              <Text
                style={[
                  styles.dayText,
                  day.muted && styles.mutedDay,
                  day.selected && styles.selectedDayText
                ]}
              >
                {day.value}
              </Text>
            </View>
            {day.hasTasks ? <View style={[styles.taskDot, day.hasFailed && styles.failedDot]} /> : null}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 24,
    paddingVertical: 28
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 18
  },
  heading: {
    ...typography.sectionTitle,
    color: colors.text,
    flex: 1
  },
  controls: {
    flexDirection: 'row',
    gap: 10
  },
  controlButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm
  },
  chevron: {
    color: colors.text,
    fontSize: 38,
    lineHeight: 38,
    fontWeight: '800'
  },
  weekGrid: {
    flexDirection: 'row',
    marginBottom: 18
  },
  weekDay: {
    flex: 1,
    color: colors.outline,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800'
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    rowGap: 14
  },
  daySlot: {
    width: `${100 / 7}%`,
    alignItems: 'center',
    minHeight: 48
  },
  dayCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedDay: {
    backgroundColor: colors.primary
  },
  dayText: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '800'
  },
  mutedDay: {
    color: 'rgba(199,196,215,0.35)'
  },
  selectedDayText: {
    color: colors.onPrimary
  },
  taskDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.tertiary,
    marginTop: 2
  },
  failedDot: {
    backgroundColor: colors.error,
    width: 7,
    height: 7
  }
});

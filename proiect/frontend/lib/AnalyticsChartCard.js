import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

export function AnalyticsChartCard({ distribution }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{distribution.title}</Text>
        <View style={styles.pill}>
          <Text style={styles.pillText}>{distribution.period}</Text>
        </View>
      </View>
      <View style={styles.chart}>
        {distribution.days.map((day) => (
          <View key={day.label} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View style={[styles.routeFill, { height: `${safePercent(day.routePercent)}%` }]} />
              <View style={[styles.barFill, { height: `${safePercent(day.taskPercent)}%` }]} />
            </View>
            <Text style={styles.day}>{day.label}</Text>
          </View>
        ))}
      </View>
      <View style={styles.legend}>
        <View style={styles.legendItem}><View style={[styles.legendDot, styles.taskDot]} /><Text style={styles.legendText}>Taskuri</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, styles.routeDot]} /><Text style={styles.legendText}>Drum</Text></View>
      </View>
    </View>
  );
}

function safePercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

const styles = StyleSheet.create({
  card: {
    minHeight: 284,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900'
  },
  pill: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    backgroundColor: colors.surfaceRaised,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  pillText: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '700'
  },
  chart: {
    flex: 1,
    minHeight: 210,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 9,
    paddingTop: 22
  },
  barColumn: {
    flex: 1,
    height: 210,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 11
  },
  barTrack: {
    width: '100%',
    flex: 1,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderTopLeftRadius: 7,
    borderTopRightRadius: 7,
    backgroundColor: 'rgba(128,131,255,0.16)'
  },
  barFill: {
    width: '100%',
    backgroundColor: colors.primary
  },
  routeFill: {
    width: '100%',
    backgroundColor: colors.tertiary
  },
  day: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '800'
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginTop: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  taskDot: {
    backgroundColor: colors.primary
  },
  routeDot: {
    backgroundColor: colors.tertiary
  },
  legendText: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '800'
  }
});

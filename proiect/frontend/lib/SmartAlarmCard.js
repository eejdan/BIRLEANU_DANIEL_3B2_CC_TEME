import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

export function SmartAlarmCard({ alarm }) {
  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Text style={styles.alarmIcon}>◉</Text>
        <View style={[styles.toggle, alarm.enabled && styles.toggleOn]}>
          <View style={[styles.knob, alarm.enabled && styles.knobOn]} />
        </View>
      </View>
      <Text style={styles.title}>{alarm.title}</Text>
      <Text style={styles.description}>{alarm.description}</Text>
      <View style={styles.divider} />
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>{alarm.sleepStatusLabel}</Text>
        <Text style={styles.statusLabel}>{alarm.sleepQuality}% Calitate</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${alarm.sleepQuality}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: colors.surfaceHigh,
    padding: 20
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20
  },
  alarmIcon: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '900'
  },
  toggle: {
    width: 42,
    height: 22,
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.outlineSubtle,
    paddingHorizontal: 3
  },
  toggleOn: {
    backgroundColor: colors.primary
  },
  knob: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.text
  },
  knobOn: {
    alignSelf: 'flex-end'
  },
  title: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    marginBottom: 4
  },
  description: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500'
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.06)',
    marginVertical: 26
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 7
  },
  statusLabel: {
    color: colors.text,
    fontSize: 10,
    fontWeight: '700'
  },
  track: {
    height: 5,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: colors.surface
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary
  }
});

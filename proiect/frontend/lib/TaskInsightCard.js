import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, typography } from './theme';

export function TaskInsightCard({ insight }) {
  const activeTicks = Math.round((insight.progress / 100) * 24);

  return (
    <View style={styles.card}>
      <View style={styles.glow} />
      <View style={styles.progressWrap}>
        <View style={styles.progressTrack}>
          {Array.from({ length: 24 }, (_, index) => (
            <View
              key={index}
              style={[
                styles.progressTick,
                {
                  opacity: index < activeTicks ? 1 : 0.18,
                  transform: [{ rotate: `${index * 15}deg` }, { translateY: -58 }]
                }
              ]}
            />
          ))}
          <View style={styles.progressCore}>
            <Text style={styles.percent}>{insight.progress}%</Text>
            <Text style={styles.completed}>Completat</Text>
          </View>
        </View>
      </View>

      <View style={styles.copy}>
        <Text style={styles.title}>{insight.title}</Text>
        <Text style={styles.description}>{insight.description}</Text>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{insight.completed}/{insight.total}</Text>
            <Text style={styles.statLabel}>Azi</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{insight.failed}</Text>
            <Text style={styles.statLabel}>Ratate</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{insight.earlyCompleted}</Text>
            <Text style={styles.statLabel}>In avans</Text>
          </View>
        </View>
        <View style={styles.signalRow}>
          <Text style={styles.signalIcon}>↯</Text>
          <Text style={styles.signal}>{insight.signal}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 20,
    minHeight: 0
  },
  glow: {
    position: 'absolute',
    top: -46,
    right: -48,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(192,193,255,0.08)'
  },
  progressWrap: {
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 26
  },
  progressTrack: {
    width: 128,
    height: 128,
    borderRadius: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 9,
    borderColor: colors.surfaceHighest
  },
  progressTick: {
    position: 'absolute',
    width: 5,
    height: 14,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  progressCore: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(19,27,46,0.28)'
  },
  percent: {
    color: colors.primary,
    fontSize: 29,
    lineHeight: 34,
    fontWeight: '900'
  },
  completed: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800'
  },
  copy: {
    gap: 12
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text
  },
  description: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500'
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  statBox: {
    flexGrow: 1,
    flexBasis: 88,
    minHeight: 58,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(11,19,38,0.28)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 8
  },
  statValue: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: '900'
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3,
    textTransform: 'uppercase'
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6
  },
  signalIcon: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '900'
  },
  signal: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  }
});

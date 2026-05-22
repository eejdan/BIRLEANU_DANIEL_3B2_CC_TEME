import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function HomeAnalyticsCard({ analytics, onDetails }) {
  const hoursRow = analytics.rows.find((row) => row.id === 'hours') || analytics.rows[0];
  const tasksRow = analytics.rows.find((row) => row.id === 'tasks') || analytics.rows[1];
  const topMix = (analytics.labelMix || []).slice(0, 4);
  const score = safePercent(analytics.completionRate || hoursRow?.percent || 0);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>Astazi</Text>
          <Text style={styles.title}>Snapshot productivitate</Text>
        </View>
        <View style={styles.scoreRing}>
          <View style={[styles.scoreFill, { height: `${Math.max(8, score)}%` }]} />
          <Text style={styles.scoreText}>{score}%</Text>
        </View>
      </View>

      <View style={styles.metricRow}>
        <MetricPill label="Ore inchise" value={hoursRow?.value} tone="primary" />
        <MetricPill label="Taskuri" value={tasksRow?.value} tone="tertiary" />
        <MetricPill label="Streak" value={`${analytics.streak} zile`} tone="primary" />
      </View>

      <View style={styles.mixCard}>
        <View style={styles.mixHead}>
          <Text style={styles.mixTitle}>Timp planificat</Text>
          <Text style={styles.mixSub}>{analytics.periodLabel}</Text>
        </View>
        <View style={styles.mixBar}>
          {topMix.map((segment, index) => (
            <View
              key={`${segment.label}-${index}`}
              style={[
                styles.mixSegment,
                { backgroundColor: segment.color, flex: Math.max(safePercent(segment.percent), 5) }
              ]}
            />
          ))}
        </View>
        <View style={styles.legend}>
          {topMix.slice(0, 3).map((segment) => (
            <View key={segment.label} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendText}>{segment.label} {segment.percent}%</Text>
            </View>
          ))}
        </View>
      </View>

      {onDetails ? (
        <TouchableOpacity activeOpacity={0.86} style={styles.detailsButton} onPress={onDetails}>
          <Text style={styles.detailsText}>Vezi detalii</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

function safePercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function MetricPill({ label, value, tone }) {
  return (
    <View style={styles.metricPill}>
      <Text style={[styles.metricValue, tone === 'tertiary' && styles.tertiaryText]}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.surfaceRaised,
    padding: 16,
    gap: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 14
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 3
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900'
  },
  scoreRing: {
    width: 62,
    height: 62,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 31,
    borderWidth: 1,
    borderColor: 'rgba(192,193,255,0.3)',
    backgroundColor: colors.surface
  },
  scoreFill: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(192,193,255,0.22)'
  },
  scoreText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900'
  },
  metricRow: {
    flexDirection: 'row',
    gap: 8
  },
  metricPill: {
    flex: 1,
    minHeight: 58,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(11,19,38,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 10,
    justifyContent: 'center'
  },
  metricValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: '900'
  },
  tertiaryText: {
    color: colors.tertiary
  },
  metricLabel: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3
  },
  mixCard: {
    borderRadius: radii.sm,
    backgroundColor: 'rgba(11,19,38,0.22)',
    padding: 12,
    gap: 10
  },
  mixHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10
  },
  mixTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900'
  },
  mixSub: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '800'
  },
  mixBar: {
    height: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: colors.surface
  },
  mixSegment: {
    height: '100%'
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5
  },
  legendDot: {
    width: 7,
    height: 7,
    borderRadius: 4
  },
  legendText: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '800'
  },
  detailsButton: {
    minHeight: 38,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary
  },
  detailsText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '900'
  }
});

import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { AnalyticsMetricCard } from './AnalyticsMetricCard';
import { colors, radii } from './theme';

export function AnalyticsSummaryCards({ cards, completionMetric }) {
  return (
    <View style={styles.wrap}>
      {cards.map((card) => {
        if (card.id === 'tasks' && completionMetric) {
          return <AnalyticsMetricCard key={card.id} metric={completionMetric} variant="completion" />;
        }

        return (
          <View key={card.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.title}>{card.title}</Text>
              <Text style={[styles.value, card.tone === 'tertiary' && styles.tertiary]}>{card.value}</Text>
            </View>
            {card.type === 'pie' ? <PieSummary segments={card.segments} /> : <ProgressSummary card={card} />}
            <Text style={styles.detail}>{card.detail}</Text>
          </View>
        );
      })}
    </View>
  );
}

function safePercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function ProgressSummary({ card }) {
  if (card.type === 'streak') {
    return (
      <View style={styles.streakRow}>
        {Array.from({ length: 7 }, (_, index) => (
          <View
            key={index}
            style={[styles.streakDot, index < Math.ceil((safePercent(card.percent) / 100) * 7) && styles.streakDotActive]}
          />
        ))}
      </View>
    );
  }

  return (
    <View style={styles.track}>
      <View
        style={[
          styles.fill,
          card.tone === 'tertiary' && styles.tertiaryFill,
          { width: `${safePercent(card.percent)}%` }
        ]}
      />
    </View>
  );
}

function PieSummary({ segments = [] }) {
  return (
    <View style={styles.mixWrap}>
      <View style={styles.mixBar}>
        {segments.map((segment, index) => (
          <View
            key={`${segment.label}-${index}`}
            style={[styles.mixSegment, { backgroundColor: segment.color, flex: Math.max(safePercent(segment.percent), 3) }]}
          />
        ))}
      </View>
      <View style={styles.legend}>
        {segments.map((segment) => (
          <View key={segment.label} style={styles.legendRow}>
            <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
            <Text style={styles.legendText}>{segment.label}</Text>
            <Text style={styles.legendValue}>{segment.percent}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 12
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.09)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 16,
    gap: 12
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 17,
    lineHeight: 22,
    fontWeight: '900'
  },
  value: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900'
  },
  tertiary: {
    color: colors.tertiary
  },
  track: {
    height: 10,
    borderRadius: 5,
    overflow: 'hidden',
    backgroundColor: colors.surface
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary
  },
  tertiaryFill: {
    backgroundColor: colors.tertiary
  },
  detail: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600'
  },
  streakRow: {
    flexDirection: 'row',
    gap: 7
  },
  streakDot: {
    flex: 1,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.surfaceHighest
  },
  streakDotActive: {
    backgroundColor: colors.primary
  },
  mixWrap: {
    gap: 12
  },
  mixBar: {
    height: 18,
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 9,
    backgroundColor: colors.surface
  },
  mixSegment: {
    height: '100%'
  },
  legend: {
    gap: 6
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  legendText: {
    flex: 1,
    color: colors.text,
    fontSize: 12,
    fontWeight: '700'
  },
  legendValue: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '900'
  }
});

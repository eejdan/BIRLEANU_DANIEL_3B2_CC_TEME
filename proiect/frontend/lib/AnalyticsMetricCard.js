import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

export function AnalyticsMetricCard({ metric, variant }) {
  if (variant === 'completion') {
    return (
      <View style={styles.completionCard}>
        <View style={styles.smallRing}>
          <View style={styles.smallArc} />
          <Text style={styles.percent}>{metric.percent}%</Text>
        </View>
        <View style={styles.completionCopy}>
          <Text style={styles.label}>{metric.label}</Text>
          <Text style={styles.valueSmall}>{metric.value}</Text>
          <Text style={styles.success}>◉ {metric.status}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.commuteCard}>
      <View style={styles.metricTop}>
        <View style={styles.iconBox}>
          <Text style={styles.icon}>{metric.icon}</Text>
        </View>
        <Text style={styles.trend}>{metric.trend}</Text>
      </View>
      <Text style={styles.label}>{metric.label}</Text>
      <Text style={styles.value}>{metric.value}</Text>
      <Text style={styles.description}>{metric.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  commuteCard: {
    minHeight: 158,
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderLeftWidth: 4,
    borderColor: 'rgba(255,255,255,0.1)',
    borderLeftColor: colors.tertiary,
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 20
  },
  metricTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12
  },
  iconBox: {
    width: 46,
    height: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,183,131,0.12)'
  },
  icon: {
    color: colors.tertiary,
    fontSize: 23,
    fontWeight: '900'
  },
  trend: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700'
  },
  label: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  value: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 39,
    fontWeight: '900'
  },
  description: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '500'
  },
  completionCard: {
    minHeight: 116,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 22,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 20
  },
  smallRing: {
    width: 82,
    height: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 41,
    borderWidth: 6,
    borderColor: colors.surfaceHighest
  },
  smallArc: {
    position: 'absolute',
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 6,
    borderTopColor: '#34d399',
    borderRightColor: '#34d399',
    borderBottomColor: '#34d399',
    borderLeftColor: 'transparent',
    transform: [{ rotate: '20deg' }]
  },
  percent: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  completionCopy: {
    flex: 1
  },
  valueSmall: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '600'
  },
  success: {
    color: '#34d399',
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600'
  }
});

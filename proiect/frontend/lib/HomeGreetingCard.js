import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

export function HomeGreetingCard({ overview }) {
  return (
    <View style={styles.card}>
      <View>
        <Text style={styles.title}>{overview.greeting}</Text>
        <Text style={styles.subtitle}>{overview.subtitle}</Text>
      </View>
      <View style={styles.metrics}>
        {overview.metrics.map((metric) => (
          <View key={metric.id} style={styles.metric}>
            <View style={[styles.metricIcon, metric.tone === 'tertiary' && styles.metricIconTertiary]}>
              <Text style={[styles.iconText, metric.tone === 'tertiary' && styles.iconTextTertiary]}>
                {metric.icon}
              </Text>
            </View>
            <View>
              <Text style={styles.metricLabel}>{metric.label}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 274,
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: colors.surfaceRaised,
    padding: 22
  },
  title: {
    color: colors.text,
    fontSize: 25,
    lineHeight: 31,
    fontWeight: '900',
    marginBottom: 8
  },
  subtitle: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500'
  },
  metrics: {
    gap: 22,
    marginTop: 24
  },
  metric: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14
  },
  metricIcon: {
    width: 52,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: 'rgba(192,193,255,0.12)'
  },
  metricIconTertiary: {
    backgroundColor: 'rgba(255,183,131,0.12)'
  },
  iconText: {
    color: colors.primary,
    fontSize: 25,
    fontWeight: '900'
  },
  iconTextTertiary: {
    color: colors.tertiary
  },
  metricLabel: {
    color: colors.text,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  metricValue: {
    color: colors.text,
    fontSize: 21,
    lineHeight: 26,
    fontWeight: '900'
  }
});

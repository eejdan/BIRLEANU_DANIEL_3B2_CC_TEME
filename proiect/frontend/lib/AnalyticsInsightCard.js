import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function AnalyticsInsightCard({ insight, onDetails }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icon}>♢</Text>
        <Text style={styles.title}>{insight.title}</Text>
      </View>
      <Text style={styles.text}>{insight.text}</Text>
      <TouchableOpacity activeOpacity={0.86} style={styles.button} onPress={onDetails}>
        <Text style={styles.buttonText}>{insight.cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(192,193,255,0.1)',
    backgroundColor: 'rgba(128,131,255,0.12)',
    padding: 20
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16
  },
  icon: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900'
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900'
  },
  text: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: '500',
    marginBottom: 22
  },
  button: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.primary
  },
  buttonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '700'
  }
});

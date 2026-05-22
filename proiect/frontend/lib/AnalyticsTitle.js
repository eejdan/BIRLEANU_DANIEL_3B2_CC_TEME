import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export function AnalyticsTitle({ title, subtitle }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 4
  },
  title: {
    color: colors.text,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500'
  }
});

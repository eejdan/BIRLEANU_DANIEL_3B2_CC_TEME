import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

export function FocusTipCard({ tip }) {
  return (
    <View style={styles.card}>
      <Text style={styles.icon}>♢</Text>
      <Text style={styles.title}>{tip.title}</Text>
      <Text style={styles.text}>{tip.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(192,193,255,0.1)',
    backgroundColor: 'rgba(128,131,255,0.14)',
    padding: 20
  },
  icon: {
    color: colors.primary,
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 14
  },
  title: {
    color: colors.text,
    fontSize: 19,
    lineHeight: 24,
    fontWeight: '900',
    marginBottom: 8
  },
  text: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
    fontWeight: '500'
  }
});

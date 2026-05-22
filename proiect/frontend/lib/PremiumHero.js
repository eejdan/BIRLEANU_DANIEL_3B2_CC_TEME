import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from './theme';

export function PremiumHero({ hero }) {
  return (
    <View style={styles.hero}>
      <Text style={styles.title}>{hero.title}</Text>
      <Text style={styles.subtitle}>{hero.subtitle}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 10,
    paddingHorizontal: 12,
    marginBottom: 8
  },
  title: {
    color: colors.primary,
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
    textAlign: 'center'
  },
  subtitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    textAlign: 'center'
  }
});

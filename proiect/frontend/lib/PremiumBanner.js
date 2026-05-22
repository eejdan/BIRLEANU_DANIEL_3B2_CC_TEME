import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function PremiumBanner({ premium, onUpgrade }) {
  return (
    <View style={styles.banner}>
      <View style={styles.decorOne} />
      <View style={styles.decorTwo} />
      <View style={styles.pill}>
        <Text style={styles.pillText}>{premium.eyebrow}</Text>
      </View>
      <Text style={styles.title}>{premium.title}</Text>
      <Text style={styles.description}>{premium.description}</Text>
      <TouchableOpacity activeOpacity={0.86} style={styles.button} onPress={onUpgrade}>
        <Text style={styles.buttonText}>{premium.cta}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'relative',
    overflow: 'hidden',
    borderRadius: radii.lg,
    backgroundColor: colors.primaryStrong,
    padding: 20,
    minHeight: 248,
    justifyContent: 'space-between',
    shadowColor: colors.primaryStrong,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8
  },
  decorOne: {
    position: 'absolute',
    right: -48,
    bottom: -48,
    width: 148,
    height: 148,
    borderRadius: 74,
    backgroundColor: 'rgba(255,255,255,0.12)'
  },
  decorTwo: {
    position: 'absolute',
    right: -16,
    bottom: -10,
    width: 100,
    height: 100,
    backgroundColor: 'rgba(255,255,255,0.1)',
    transform: [{ rotate: '28deg' }]
  },
  pill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 13,
    paddingVertical: 8,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,255,255,0.2)',
    marginBottom: 6
  },
  pillText: {
    color: colors.onPrimaryContainer,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.onPrimaryContainer,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900',
    maxWidth: 280,
    marginBottom: 8
  },
  description: {
    color: 'rgba(13,0,150,0.72)',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
    maxWidth: 260,
    marginBottom: 18
  },
  button: {
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.onPrimaryContainer
  },
  buttonText: {
    color: colors.primaryStrong,
    fontSize: 14,
    fontWeight: '900'
  }
});

import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

const benefitImages = {
  'no-ads': 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80',
  'auto-organize': 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=900&q=80',
  'commute-live': 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=900&q=80',
  'advanced-stats': 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=900&q=80'
};

export function PremiumBenefitCard({ benefit }) {
  return (
    <View style={styles.card}>
      <Text style={[styles.icon, toneStyles[benefit.tone]]}>{benefit.icon}</Text>
      <Text style={styles.title}>{benefit.title}</Text>
      <Text style={styles.description}>{benefit.description}</Text>
      <BenefitVisual image={benefitImages[benefit.id]} />
    </View>
  );
}

function BenefitVisual({ image }) {
  return (
    <View style={styles.visual}>
      <Image source={{ uri: image }} style={styles.visualImage} />
    </View>
  );
}

const toneStyles = {
  primary: { color: colors.primary },
  tertiary: { color: colors.tertiary },
  secondary: { color: colors.secondary },
  error: { color: colors.error }
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 18
  },
  icon: {
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '800',
    marginBottom: 14
  },
  title: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 25,
    fontWeight: '900',
    marginBottom: 6
  },
  description: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '500'
  },
  visual: {
    height: 90,
    overflow: 'hidden',
    borderRadius: radii.sm,
    marginTop: 18,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)'
  },
  visualImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover'
  }
});

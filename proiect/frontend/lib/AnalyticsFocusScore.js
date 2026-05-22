import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

export function AnalyticsFocusScore({ focusScore }) {
  const activeTicks = Math.round((focusScore.progress / 100) * 28);

  return (
    <View style={styles.card}>
      <Text style={styles.bolt}>ϟ</Text>
      <Text style={styles.label}>{focusScore.label}</Text>
      <View style={styles.ring}>
        {Array.from({ length: 28 }, (_, index) => (
          <View
            key={index}
            style={[
              styles.tick,
              {
                opacity: index < activeTicks ? 1 : 0.16,
                transform: [{ rotate: `${index * 12.85}deg` }, { translateY: -72 }]
              }
            ]}
          />
        ))}
        <View style={styles.center}>
          <Text style={styles.score}>{focusScore.score}</Text>
          <Text style={styles.change}>⌁ {focusScore.change}</Text>
        </View>
      </View>
      <Text style={styles.description}>{focusScore.description}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    minHeight: 274,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 22
  },
  bolt: {
    position: 'absolute',
    top: 10,
    right: 44,
    color: colors.surfaceHighest,
    opacity: 0.55,
    fontSize: 116,
    lineHeight: 120,
    fontWeight: '300'
  },
  label: {
    color: colors.primary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 2,
    textTransform: 'uppercase'
  },
  ring: {
    width: 158,
    height: 158,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 79,
    borderWidth: 10,
    borderColor: colors.surfaceHighest,
    marginVertical: 10
  },
  tick: {
    position: 'absolute',
    width: 6,
    height: 16,
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  center: {
    alignItems: 'center'
  },
  score: {
    color: colors.text,
    fontSize: 43,
    lineHeight: 50,
    fontWeight: '900'
  },
  change: {
    color: '#34d399',
    fontSize: 12,
    fontWeight: '900'
  },
  description: {
    color: colors.text,
    maxWidth: 240,
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '500'
  }
});

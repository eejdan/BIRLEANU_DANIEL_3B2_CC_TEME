import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function QuickActions({ actions, timerRunning, timerLabel, onAction }) {
  return (
    <View style={styles.grid}>
      {actions.map((action) => (
        <TouchableOpacity
          key={action.id}
          activeOpacity={0.86}
          onPress={() => onAction?.(action.id)}
          style={[styles.button, action.id === 'timer' && timerRunning && styles.buttonActive]}
        >
          <Text style={styles.icon}>{action.icon}</Text>
          <Text style={styles.label}>
            {action.id === 'timer' && timerRunning ? 'Stop timer' : action.title}
          </Text>
          {action.id === 'timer' ? <Text style={styles.timer}>{timerLabel || '00:00'}</Text> : null}
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    gap: 12
  },
  button: {
    flex: 1,
    minHeight: 74,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: colors.surfaceRaised,
    gap: 8
  },
  buttonActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(128,131,255,0.16)'
  },
  icon: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900'
  },
  label: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700'
  },
  timer: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900'
  }
});

import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { colors, radii } from './theme';

export function FloatingActionButton({ rounded = false, onPress }) {
  return (
    <TouchableOpacity
      accessibilityLabel="Adauga"
      activeOpacity={0.86}
      style={[styles.fab, rounded && styles.roundFab]}
      onPress={onPress}
    >
      <Text style={styles.plus}>+</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    right: 22,
    bottom: 94,
    width: 52,
    height: 52,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    shadowColor: '#000',
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10
  },
  roundFab: {
    borderRadius: radii.pill
  },
  plus: {
    color: colors.onPrimary,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '500'
  }
});

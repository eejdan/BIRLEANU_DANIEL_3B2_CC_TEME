import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function BottomNav({ items, onSelect }) {
  return (
    <View style={styles.nav}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.key}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel={item.label}
          onPress={() => onSelect?.(item.key)}
          style={[styles.navItem, item.active && styles.navItemActive]}
        >
          <Text style={[styles.icon, item.active && styles.activeText]}>{item.icon}</Text>
          <Text style={[styles.label, item.active && styles.activeText]} numberOfLines={1}>
            {item.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 84,
    paddingHorizontal: 10,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: colors.surfaceRaised,
    borderTopWidth: 1,
    borderTopColor: colors.outlineSubtle
  },
  navItem: {
    minWidth: 62,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    paddingHorizontal: 9
  },
  navItemActive: {
    minWidth: 108,
    backgroundColor: colors.secondaryContainer
  },
  icon: {
    color: colors.mutedText,
    fontSize: 23,
    lineHeight: 25,
    fontWeight: '900'
  },
  label: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 14,
    fontWeight: '900'
  },
  activeText: {
    color: colors.secondary
  }
});

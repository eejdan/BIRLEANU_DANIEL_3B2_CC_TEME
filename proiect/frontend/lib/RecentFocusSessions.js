import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

export function RecentFocusSessions({ sessions }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.heading}>{sessions.title}</Text>
      <View style={styles.list}>
        {sessions.items.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={styles.left}>
              <View style={[styles.iconBox, item.tone === 'amber' && styles.iconAmber]}>
                <Text style={[styles.icon, item.tone === 'amber' && styles.iconAmberText]}>{item.icon}</Text>
              </View>
              <View style={styles.copy}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.subtitle}>{item.subtitle}</Text>
              </View>
            </View>
            <View style={styles.right}>
              <Text style={styles.duration}>{item.duration}</Text>
              <Text style={[styles.type, item.tone === 'amber' && styles.typeMuted]}>{item.type}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14
  },
  heading: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900'
  },
  list: {
    gap: 10
  },
  row: {
    minHeight: 65,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 12
  },
  left: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 13
  },
  iconBox: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 6,
    backgroundColor: 'rgba(59,130,246,0.12)'
  },
  iconAmber: {
    backgroundColor: 'rgba(245,158,11,0.12)'
  },
  icon: {
    color: '#60a5fa',
    fontSize: 15,
    fontWeight: '900'
  },
  iconAmberText: {
    color: '#fbbf24'
  },
  copy: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 19,
    fontWeight: '600'
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500'
  },
  right: {
    alignItems: 'flex-end'
  },
  duration: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '600'
  },
  type: {
    color: '#34d399',
    fontSize: 11,
    fontWeight: '500'
  },
  typeMuted: {
    color: colors.mutedText
  }
});

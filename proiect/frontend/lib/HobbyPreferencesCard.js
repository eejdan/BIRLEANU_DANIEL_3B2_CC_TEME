import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function HobbyPreferencesCard({ groups, selected = [], onToggle }) {
  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>Preferinte timp liber</Text>
        <Text style={styles.count}>{selected.length} alese</Text>
      </View>
      <Text style={styles.title}>Hobby-uri pentru recomandari Premium</Text>
      <Text style={styles.description}>
        Bifeaza ce iti place, iar calendarul poate propune taskuri de relaxare in intervalele libere.
      </Text>

      <View style={styles.groups}>
        {groups.map((group) => (
          <View key={group.id} style={styles.group}>
            <Text style={styles.groupTitle}>{group.title}</Text>
            <View style={styles.chips}>
              {group.items.map((item) => {
                const active = selected.includes(item.id);

                return (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.86}
                    onPress={() => onToggle?.(item.id)}
                    style={[styles.chip, active && styles.chipActive]}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.78)',
    padding: 18,
    gap: 12
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  count: {
    color: colors.tertiary,
    fontSize: 11,
    fontWeight: '900'
  },
  title: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 23,
    fontWeight: '900'
  },
  description: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600'
  },
  groups: {
    gap: 14
  },
  group: {
    gap: 8
  },
  groupTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900'
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8
  },
  chip: {
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    backgroundColor: 'rgba(11,19,38,0.24)',
    paddingHorizontal: 11,
    paddingVertical: 7
  },
  chipActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192,193,255,0.14)'
  },
  chipText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '800'
  },
  chipTextActive: {
    color: colors.primary
  }
});

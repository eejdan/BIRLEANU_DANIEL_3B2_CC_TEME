import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, typography } from './theme';

export function SuggestionCard({
  suggestion,
  hobbySuggestion,
  planRules,
  isPremium,
  missedTasks = [],
  onDeleteMissed,
  onRescheduleMissed,
  onScheduleSuggestion
}) {
  const visibleSuggestion = isPremium ? hobbySuggestion : null;

  return (
    <View style={styles.card}>
      {visibleSuggestion ? (
        <>
          <Text style={styles.sparkle}>*</Text>
          <Text style={styles.message}>
            Hey, ai un interval liber de {visibleSuggestion.durationMinutes} minute perfect pentru {visibleSuggestion.hobbyLabel}. Ai vrea sa programezi o sesiune de {visibleSuggestion.actionTitle.toLowerCase()}?
          </Text>

          <View style={styles.slotBox}>
            <Text style={styles.slotTime}>{visibleSuggestion.timeLabel}</Text>
          </View>

          <TouchableOpacity style={styles.cta} activeOpacity={0.82} onPress={() => onScheduleSuggestion?.(visibleSuggestion)}>
            <Text style={styles.ctaText}>{visibleSuggestion.cta}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <>
          <Text style={styles.label}>Taskuri ratate</Text>
          <Text style={styles.message}>Lista taskurilor pe care le poti sterge sau reprograma.</Text>
        </>
      )}

      {missedTasks.length ? (
        <View style={styles.missedBox}>
          <Text style={styles.missedTitle}>Taskuri ratate de reprogramat</Text>
          {missedTasks.slice(0, 3).map((task) => (
            <View key={task.id} style={styles.missedItem}>
              <Text style={styles.missedTaskTitle}>{task.title}</Text>
              <Text style={styles.missedTaskText}>
                Sugestie: muta-l in primul interval liber sau imparte-l intr-un bloc scurt de focus.
              </Text>
              <View style={styles.missedActions}>
                <TouchableOpacity activeOpacity={0.84} style={styles.missedDelete} onPress={() => onDeleteMissed?.(task.id)}>
                  <Text style={styles.missedDeleteText}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity activeOpacity={0.84} style={styles.missedReschedule} onPress={() => onRescheduleMissed?.(task)}>
                  <Text style={styles.missedRescheduleText}>Reprogrameaza</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {missedTasks.length > 3 ? <Text style={styles.moreMissed}>+{missedTasks.length - 3} taskuri ratate</Text> : null}
        </View>
      ) : !isPremium ? (
        <View style={styles.missedBox}>
          <Text style={styles.missedTitle}>Nu ai taskuri ratate</Text>
          <Text style={styles.missedTaskText}>Cand un task este marcat Failed, il vei putea reprograma aici.</Text>
        </View>
      ) : null}

      {isPremium && (
        <View style={styles.planBox}>
          <Text style={styles.planTitle}>Premium activ</Text>
          <Text style={styles.planText}>{planRules.transit}</Text>
          <Text style={styles.planText}>{planRules.tasks}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: 'rgba(128,131,255,0.2)',
    borderColor: 'rgba(128,131,255,0.35)',
    borderWidth: 1,
    borderRadius: radii.lg,
    padding: 28
  },
  sparkle: {
    position: 'absolute',
    right: 26,
    top: 18,
    color: colors.primary,
    opacity: 0.24,
    fontSize: 48
  },
  label: {
    ...typography.label,
    color: colors.primaryStrong,
    marginBottom: 14
  },
  message: {
    ...typography.body,
    color: colors.text,
    marginBottom: 14
  },
  slotBox: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(192,193,255,0.24)',
    backgroundColor: 'rgba(192,193,255,0.08)',
    padding: 14,
    marginBottom: 16
  },
  slotTime: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 27,
    fontWeight: '900'
  },
  cta: {
    height: 52,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginBottom: 16
  },
  ctaText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  missedBox: {
    gap: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.24)',
    backgroundColor: 'rgba(255,180,171,0.08)',
    padding: 14,
    marginBottom: 16
  },
  missedTitle: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  missedItem: {
    gap: 6
  },
  missedTaskTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900'
  },
  missedTaskText: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600'
  },
  moreMissed: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '900'
  },
  missedActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 2
  },
  missedDelete: {
    minHeight: 32,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,180,171,0.36)',
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center'
  },
  missedReschedule: {
    minHeight: 32,
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  missedDeleteText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '900'
  },
  missedRescheduleText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: '900'
  },
  planBox: {
    gap: 6,
    padding: 14,
    borderRadius: radii.sm,
    backgroundColor: 'rgba(11,19,38,0.28)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  planTitle: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  planText: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600'
  },
  adBanner: {
    minHeight: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    marginTop: 14,
    backgroundColor: colors.ad,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)'
  },
  adText: {
    color: colors.outline,
    fontSize: 12,
    fontWeight: '800'
  }
});

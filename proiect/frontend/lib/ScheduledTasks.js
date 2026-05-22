import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';
import { priorityColor } from './TaskEditorModal';

export function ScheduledTasks({ title, mode, tasks, isPremium, onModeChange, onEdit, onDone, onDelete, onCreate }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.subtitle}>{mode === 'week' ? 'Vizualizare pe saptamana' : 'Vizualizare pe zi'}</Text>
        </View>
        <TouchableOpacity activeOpacity={0.86} style={styles.addButton} onPress={onCreate}>
          <Text style={styles.addText}>+ Task</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.segmented}>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => onModeChange?.('day')}
          style={[styles.segment, mode === 'day' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, mode === 'day' && styles.segmentTextActive]}>Zi</Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.86}
          onPress={() => onModeChange?.('week')}
          style={[styles.segment, mode === 'week' && styles.segmentActive]}
        >
          <Text style={[styles.segmentText, mode === 'week' && styles.segmentTextActive]}>Saptamana</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <View style={styles.freeNotice}>
          <Text style={styles.freeNoticeText}>Free: taskurile pot fi planificate pe zile. Orele si durata sunt Premium.</Text>
        </View>
      )}

      <View style={styles.list}>
        {tasks.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Nu exista taskuri programate aici.</Text>
          </View>
        ) : (
          tasks.map((task) => (
            <ScheduledTaskRow
              key={task.id}
              task={task}
              onEdit={onEdit}
              onDone={onDone}
              onDelete={onDelete}
            />
          ))
        )}
      </View>
    </View>
  );
}

function ScheduledTaskRow({ task, onEdit, onDone, onDelete }) {
  const done = Boolean(task.completedAt);
  const failed = Boolean(task.failedAt);

  return (
    <View style={[
      styles.row,
      done && styles.doneRow,
      failed && styles.failedRow,
      { borderLeftColor: done ? colors.outline : failed ? colors.error : priorityColor(task.importance) }
    ]}>
      <View style={styles.rowTop}>
        <View style={styles.label}>
          <Text style={styles.labelText}>{task.label}</Text>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            activeOpacity={done ? 1 : 0.8}
            disabled={done}
            onPress={() => onEdit?.(task)}
            style={[styles.actionButton, done && styles.disabledButton]}
          >
            <Text style={[styles.editText, done && styles.disabledText]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity activeOpacity={0.8} onPress={() => onDone?.(task.id)} style={[styles.actionButton, done && styles.doneButton]}>
            <Text style={[styles.doneText, done && styles.doneTextActive]}>{done ? 'Activeaza' : 'Done'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={done ? 1 : 0.8}
            disabled={done}
            onPress={() => onDelete?.(task.id)}
            style={[styles.actionButton, done && styles.disabledButton]}
          >
            <Text style={[styles.deleteText, done && styles.disabledText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.taskTitle, done && styles.completedTitle]}>{task.title}</Text>
      <View style={styles.metaRow}>
        {task.startTime && task.endTime ? <Text style={styles.meta}>{task.startTime} - {task.endTime}</Text> : null}
        <Text style={styles.meta}>{task.date}</Text>
        {task.location ? <Text style={styles.meta}>{task.location}</Text> : null}
        {task.completedAt ? <Text style={styles.meta}>Finalizat {task.completedAt}</Text> : null}
        {task.failedAt ? <Text style={styles.failedMeta}>Ratat {task.failedAt}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 14
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12
  },
  title: {
    color: colors.text,
    fontSize: 23,
    lineHeight: 29,
    fontWeight: '900'
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700'
  },
  addButton: {
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  addText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: '900'
  },
  segmented: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)'
  },
  segment: {
    flex: 1,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill
  },
  segmentActive: {
    backgroundColor: colors.secondaryContainer
  },
  segmentText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '900'
  },
  segmentTextActive: {
    color: colors.secondary
  },
  freeNotice: {
    borderRadius: radii.sm,
    backgroundColor: 'rgba(255,183,131,0.12)',
    padding: 12
  },
  freeNoticeText: {
    color: colors.tertiary,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700'
  },
  list: {
    gap: 12
  },
  empty: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,41,59,0.6)',
    padding: 16
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '700'
  },
  row: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderLeftWidth: 5,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 14,
    gap: 9
  },
  doneRow: {
    opacity: 0.66
  },
  failedRow: {
    borderColor: 'rgba(255,180,171,0.34)',
    backgroundColor: 'rgba(255,180,171,0.08)'
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12
  },
  label: {
    borderRadius: 5,
    backgroundColor: 'rgba(192,193,255,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  labelText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  actionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
    maxWidth: 190
  },
  actionButton: {
    minHeight: 30,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  doneButton: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192,193,255,0.12)'
  },
  disabledButton: {
    opacity: 0.42
  },
  editText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900'
  },
  doneText: {
    color: colors.tertiary,
    fontSize: 12,
    fontWeight: '900'
  },
  doneTextActive: {
    color: colors.primary
  },
  deleteText: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '900'
  },
  disabledText: {
    color: colors.outline
  },
  taskTitle: {
    color: colors.text,
    fontSize: 17,
    lineHeight: 23,
    fontWeight: '900'
  },
  completedTitle: {
    color: colors.mutedText,
    textDecorationLine: 'line-through'
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  meta: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700'
  },
  failedMeta: {
    color: colors.error,
    fontSize: 12,
    fontWeight: '900'
  }
});

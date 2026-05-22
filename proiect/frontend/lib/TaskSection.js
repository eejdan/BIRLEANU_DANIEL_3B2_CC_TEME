import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function TaskSection({ section, onEditTask, onDoneTask, onDeleteTask, onAction }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.headerLeft}>
          <View style={[styles.accentBar, accentStyles[section.accent]]} />
          <Text style={styles.sectionTitle}>{section.title}</Text>
          {section.count ? (
            <View style={styles.countBadge}>
              <Text style={styles.countText}>{section.count}</Text>
            </View>
          ) : null}
        </View>
        {section.action ? (
          <TouchableOpacity activeOpacity={0.86} onPress={() => onAction?.(section)} style={styles.actionButton}>
            <Text style={styles.action}>{section.action}</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.taskList}>
        {section.tasks.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Nu exista taskuri reale in aceasta sectiune.</Text>
          </View>
        ) : section.tasks.map((task) => {
          if (section.layout === 'compact') {
            return <CompactTaskCard key={task.id} task={task} />;
          }
          if (section.layout === 'plain') {
            return <PlainTaskCard key={task.id} task={task} />;
          }
          return (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDone={onDoneTask}
              onDelete={onDeleteTask}
            />
          );
        })}
      </View>
    </View>
  );
}

function TaskCard({ task, onEdit, onDone, onDelete }) {
  const done = task.priority === 'done';

  return (
    <TouchableOpacity
      activeOpacity={0.86}
      style={[
        styles.taskCard,
        priorityStyles[task.priority],
        done && styles.doneCard
      ]}
    >
      <View style={styles.cardTop}>
        <View style={[styles.taskLabel, labelStyles[task.priority]]}>
          <Text style={[styles.taskLabelText, labelTextStyles[task.priority]]}>{task.label}</Text>
        </View>
        <View style={styles.actionGroup}>
          <TouchableOpacity
            disabled={done}
            activeOpacity={done ? 1 : 0.8}
            onPress={() => onEdit?.(task)}
            style={[styles.actionPill, done && styles.disabledPill]}
          >
            <Text style={[styles.editPillText, done && styles.disabledPillText]}>Edit</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onDone?.(task.id)} style={[styles.actionPill, done && styles.donePill]}>
            <Text style={[styles.donePillText, done && styles.donePillTextActive]}>{done ? 'Activeaza' : 'Done'}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={done}
            activeOpacity={done ? 1 : 0.8}
            onPress={() => onDelete?.(task.id)}
            style={[styles.actionPill, done && styles.disabledPill]}
          >
            <Text style={[styles.deletePillText, done && styles.disabledPillText]}>Delete</Text>
          </TouchableOpacity>
        </View>
      </View>
      <Text style={[styles.taskTitle, done && styles.doneText]}>{task.title}</Text>
      <View style={styles.metaRow}>
        {task.time ? <Text style={styles.meta}>◷ {task.time}</Text> : null}
        {task.subtasks ? <Text style={styles.meta}>▣ {task.subtasks}</Text> : null}
        {task.completedAt ? <Text style={[styles.meta, styles.doneText]}>↺ {task.completedAt}</Text> : null}
      </View>
    </TouchableOpacity>
  );
}

function CompactTaskCard({ task }) {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.compactCard}>
      <View style={styles.compactIcon}>
        <Text style={styles.compactIconText}>{task.icon}</Text>
      </View>
      <View style={styles.compactCopy}>
        <Text style={styles.compactTitle}>{task.title}</Text>
        <Text style={styles.compactSubtitle}>{task.subtitle}</Text>
      </View>
      <AvatarGroup people={task.people} />
    </TouchableOpacity>
  );
}

function PlainTaskCard({ task }) {
  return (
    <TouchableOpacity activeOpacity={0.86} style={styles.plainCard}>
      <Text style={styles.drag}>⠿</Text>
      <View style={styles.plainCopy}>
        <Text style={styles.plainTitle}>{task.title}</Text>
        <Text style={styles.plainSubtitle}>{task.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
}

function AvatarGroup({ people = [] }) {
  return (
    <View style={styles.avatarRow}>
      {people.map((person, index) => (
        <View key={`${person}-${index}`} style={[styles.avatar, { marginLeft: index === 0 ? 0 : -9 }]}>
          <Text style={styles.avatarText}>{person}</Text>
        </View>
      ))}
    </View>
  );
}

const accentStyles = {
  primary: { backgroundColor: colors.primary },
  tertiary: { backgroundColor: colors.tertiary },
  outline: { backgroundColor: colors.outline }
};

const priorityStyles = {
  focus: { borderLeftColor: colors.primary, borderColor: colors.primary },
  urgent: { borderLeftColor: colors.error, borderColor: colors.error },
  done: { borderLeftColor: colors.outline, borderColor: colors.outline }
};

const labelStyles = {
  focus: { backgroundColor: 'rgba(192,193,255,0.1)' },
  urgent: { backgroundColor: 'rgba(255,180,171,0.1)' },
  done: { backgroundColor: 'rgba(144,143,160,0.1)' }
};

const labelTextStyles = {
  focus: { color: colors.primary },
  urgent: { color: colors.error },
  done: { color: colors.outline }
};

const styles = StyleSheet.create({
  section: {
    gap: 14
  },
  sectionHeader: {
    minHeight: 34,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 8
  },
  accentBar: {
    width: 8,
    height: 22,
    borderRadius: 4
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900'
  },
  countBadge: {
    minWidth: 22,
    height: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 5,
    backgroundColor: colors.surfaceHigh,
    marginLeft: 6
  },
  countText: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '900'
  },
  action: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '900'
  },
  actionButton: {
    minHeight: 32,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  taskList: {
    gap: 14
  },
  emptyCard: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 16
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '700'
  },
  taskCard: {
    minHeight: 108,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderLeftWidth: 4,
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 16,
    gap: 11
  },
  doneCard: {
    opacity: 0.62
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  taskLabel: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4
  },
  taskLabelText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 1,
    textTransform: 'uppercase'
  },
  actionGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 6,
    maxWidth: 190
  },
  actionPill: {
    minHeight: 30,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    paddingHorizontal: 9,
    alignItems: 'center',
    justifyContent: 'center'
  },
  donePill: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192,193,255,0.12)'
  },
  disabledPill: {
    opacity: 0.42
  },
  editPillText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900'
  },
  donePillText: {
    color: colors.tertiary,
    fontSize: 11,
    fontWeight: '900'
  },
  donePillTextActive: {
    color: colors.primary
  },
  deletePillText: {
    color: colors.error,
    fontSize: 11,
    fontWeight: '900'
  },
  disabledPillText: {
    color: colors.outline
  },
  taskTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '900'
  },
  doneText: {
    textDecorationLine: 'line-through'
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14
  },
  meta: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700'
  },
  compactCard: {
    minHeight: 72,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 14
  },
  compactIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest
  },
  compactIconText: {
    color: colors.tertiary,
    fontSize: 18,
    fontWeight: '900'
  },
  compactCopy: {
    flex: 1
  },
  compactTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '900'
  },
  compactSubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600'
  },
  avatarRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest,
    borderWidth: 2,
    borderColor: colors.background
  },
  avatarText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '900'
  },
  plainCard: {
    minHeight: 70,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 16
  },
  drag: {
    color: colors.mutedText,
    fontSize: 20,
    fontWeight: '900'
  },
  plainCopy: {
    flex: 1
  },
  plainTitle: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: '600'
  },
  plainSubtitle: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
    marginTop: 2
  }
});

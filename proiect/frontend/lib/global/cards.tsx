import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { EventItem, TaskItem } from '@/types';
import type { CommuteCardData } from './commute';
import { SurfaceCard } from './layout';
import { FilledButton, ButtonRow } from './controls';
import { theme } from '../theme';

export function TaskCard({
  task,
  onPress,
  onHit,
  onMissed,
  onDelete
}: {
  task: TaskItem;
  onPress?: () => void;
  onHit?: () => void;
  onMissed?: () => void;
  onDelete?: () => void;
}) {
  return (
    <Pressable onPress={onPress}>
      <SurfaceCard tone="raised">
        <View style={styles.topRow}>
          <View style={styles.copy}>
            <Text style={styles.title}>{task.title}</Text>
            <Text style={styles.meta}>
              {task.estimatedMinutes ?? task.estimatedDurationMinutes ?? 0} min • {task.priority}
            </Text>
          </View>
          <StatusPill
            label={task.failedAt ? 'Missed' : task.status === 'completed' ? 'Hit' : 'Open'}
            tone={task.failedAt ? 'error' : task.status === 'completed' ? 'success' : 'muted'}
          />
        </View>
        {task.description ? <Text style={styles.description}>{task.description}</Text> : null}
        {(onHit || onMissed || onDelete) ? (
          <ButtonRow>
            {onHit ? <FilledButton label="Hit" onPress={onHit} /> : null}
            {onMissed ? <FilledButton label="Missed" onPress={onMissed} tone="secondary" /> : null}
            {onDelete ? <FilledButton label="Delete" onPress={onDelete} tone="ghost" /> : null}
          </ButtonRow>
        ) : null}
      </SurfaceCard>
    </Pressable>
  );
}

export function EventCard({ event, onPress }: { event: EventItem; onPress?: () => void }) {
  const time = `${new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  return (
    <Pressable onPress={onPress}>
      <SurfaceCard tone="high">
        <View style={styles.topRow}>
          <View style={styles.copy}>
            <Text style={styles.title}>{event.title}</Text>
            <Text style={styles.meta}>{time}</Text>
          </View>
          <StatusPill
            label={event.failedAt ? 'Missed' : event.completedAt ? 'Done' : 'Planned'}
            tone={event.failedAt ? 'error' : event.completedAt ? 'success' : 'muted'}
          />
        </View>
        {event.location?.address || event.location?.label ? (
          <View style={styles.inline}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color={theme.colors.primary} />
            <Text style={styles.description}>{event.location.address ?? event.location.label}</Text>
          </View>
        ) : null}
      </SurfaceCard>
    </Pressable>
  );
}

export function CommuteCard({ commute }: { commute: CommuteCardData }) {
  return (
    <SurfaceCard tone="surface">
      <View style={styles.topRow}>
        <Text style={styles.title}>Commute</Text>
        <MaterialCommunityIcons name="car-outline" size={18} color={theme.colors.tertiary} />
      </View>
      <Text style={styles.description}>Can walk: {commute.canWalk == null ? 'Unknown' : commute.canWalk ? 'Yes' : 'No'}</Text>
      <Text style={styles.description}>Walking time: {commute.walkingMinutes == null ? '-' : `${commute.walkingMinutes} min`}</Text>
      <Text style={styles.description}>Driving time: {commute.drivingMinutes == null ? '-' : `${commute.drivingMinutes} min`}</Text>
    </SurfaceCard>
  );
}

export function StatusPill({ label, tone }: { label: string; tone: 'success' | 'error' | 'muted' }) {
  return (
    <View style={[
      styles.pill,
      tone === 'success' ? styles.pillSuccess : null,
      tone === 'error' ? styles.pillError : null,
      tone === 'muted' ? styles.pillMuted : null
    ]}>
      <Text style={[
        styles.pillText,
        tone === 'muted' ? styles.pillTextMuted : null
      ]}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing(1)
  },
  copy: {
    flex: 1,
    gap: 4
  },
  title: {
    color: theme.colors.text,
    fontSize: 17,
    fontWeight: '800'
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 13,
    fontWeight: '700'
  },
  description: {
    color: theme.colors.textMuted,
    ...theme.typography.body
  },
  inline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  pill: {
    borderRadius: theme.radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start'
  },
  pillSuccess: {
    backgroundColor: 'rgba(46, 199, 166, 0.18)'
  },
  pillError: {
    backgroundColor: 'rgba(255, 180, 171, 0.18)'
  },
  pillMuted: {
    backgroundColor: theme.colors.surfaceHighest
  },
  pillText: {
    fontSize: 11,
    fontWeight: '800',
    color: theme.colors.text
  },
  pillTextMuted: {
    color: theme.colors.textMuted
  }
});

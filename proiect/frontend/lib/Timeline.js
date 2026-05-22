import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii, typography } from './theme';

export function Timeline({ entries }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>Cronologie Zilnică</Text>
        <View style={styles.segmented}>
          <View style={styles.segmentActive}>
            <Text style={styles.segmentActiveText}>Zi</Text>
          </View>
          <View style={styles.segment}>
            <Text style={styles.segmentText}>Săpt</Text>
          </View>
        </View>
      </View>

      <View style={styles.timelineBody}>
        <View style={styles.verticalLine} />
        {entries.map((entry) => (
          <TimelineEntry key={entry.id} entry={entry} />
        ))}
      </View>
    </View>
  );
}

function TimelineEntry({ entry }) {
  const isTransit = entry.type === 'transit';

  return (
    <View style={styles.entryRow}>
      <View style={[styles.dot, dotStyleByType[entry.type]]} />
      <View style={styles.entryContent}>
        <Text style={styles.time}>{entry.time}</Text>
        {isTransit ? (
          <View style={styles.transitContent}>
            <Text style={styles.transitTitle}>{entry.title}</Text>
            <Text style={styles.transitDescription}>{entry.description}</Text>
          </View>
        ) : (
          <View style={[styles.eventCard, cardStyleByType[entry.type]]}>
            <View style={styles.eventHeader}>
              <Text style={[styles.eventTitle, entry.type === 'focus' && styles.focusTitle]}>
                {entry.title}
              </Text>
              {entry.type === 'focus' && <Text style={styles.timer}>⏱</Text>}
            </View>
            <Text style={styles.description}>{entry.description}</Text>
            {entry.category && <Text style={styles.badge}>{entry.category}</Text>}
            {entry.people && (
              <View style={styles.peopleRow}>
                {entry.people.map((person, index) => (
                  <View key={`${person}-${index}`} style={[styles.avatar, { marginLeft: index === 0 ? 0 : -8 }]}>
                    <Text style={styles.avatarText}>{person}</Text>
                  </View>
                ))}
              </View>
            )}
            {(entry.location || entry.link) && (
              <View style={styles.metaRow}>
                {entry.location && <Text style={styles.meta}>⌖ {entry.location}</Text>}
                {entry.link && <Text style={styles.meta}>↗ {entry.link}</Text>}
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const dotStyleByType = {
  personal: { backgroundColor: colors.tertiary },
  transit: { backgroundColor: colors.outlineSubtle },
  focus: { backgroundColor: colors.primary },
  meeting: { backgroundColor: colors.secondary }
};

const cardStyleByType = {
  personal: {},
  focus: {
    backgroundColor: 'rgba(128,131,255,0.14)',
    borderColor: 'rgba(192,193,255,0.24)'
  },
  meeting: {
    borderColor: colors.secondary,
    borderLeftWidth: 5
  }
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceRaised,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    paddingHorizontal: 26,
    paddingTop: 10,
    paddingBottom: 8
  },
  headerRow: {
    minHeight: 60,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    gap: 12,
    marginBottom: 18
  },
  title: {
    ...typography.sectionTitle,
    color: colors.text,
    flex: 1
  },
  segmented: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    padding: 4
  },
  segmentActive: {
    minWidth: 52,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill,
    backgroundColor: colors.secondaryContainer
  },
  segment: {
    minWidth: 58,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center'
  },
  segmentActiveText: {
    color: colors.secondary,
    fontSize: 13,
    fontWeight: '900'
  },
  segmentText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '900'
  },
  timelineBody: {
    position: 'relative',
    paddingLeft: 34,
    gap: 28
  },
  verticalLine: {
    position: 'absolute',
    left: 8,
    top: 7,
    bottom: 0,
    width: 2,
    backgroundColor: 'rgba(144,143,160,0.22)'
  },
  entryRow: {
    position: 'relative',
    minHeight: 72
  },
  dot: {
    position: 'absolute',
    left: -32,
    top: 5,
    width: 11,
    height: 11,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.surfaceRaised
  },
  entryContent: {
    gap: 14
  },
  time: {
    color: colors.outline,
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 0.4
  },
  eventCard: {
    backgroundColor: 'rgba(34,42,61,0.72)',
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    padding: 20,
    gap: 10
  },
  eventHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12
  },
  eventTitle: {
    flex: 1,
    color: colors.text,
    fontSize: 21,
    lineHeight: 27,
    fontWeight: '900'
  },
  focusTitle: {
    color: colors.primary
  },
  timer: {
    color: colors.primary,
    fontSize: 25
  },
  description: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '700'
  },
  badge: {
    alignSelf: 'flex-start',
    overflow: 'hidden',
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 5,
    color: colors.tertiary,
    backgroundColor: 'rgba(255,183,131,0.2)',
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  transitContent: {
    borderLeftWidth: 4,
    borderLeftColor: 'rgba(144,143,160,0.24)',
    paddingLeft: 18,
    paddingVertical: 7
  },
  transitTitle: {
    color: colors.mutedText,
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 4
  },
  transitDescription: {
    color: 'rgba(199,196,215,0.72)',
    fontSize: 15,
    fontStyle: 'italic',
    fontWeight: '600'
  },
  peopleRow: {
    flexDirection: 'row',
    marginTop: 8
  },
  avatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest,
    borderWidth: 2,
    borderColor: colors.surfaceRaised
  },
  avatarText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900'
  },
  metaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 6
  },
  meta: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700'
  }
});

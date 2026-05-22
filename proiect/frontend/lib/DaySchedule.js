import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

const DEFAULT_HOUR_HEIGHT = 112;
const QUIET_HOUR_HEIGHT = 42;
const BUSY_HOUR_HEIGHT = 132;
const MIN_ITEM_HEIGHT = 54;
const MIN_ROUTE_HEIGHT = 38;
const ITEM_GAP = 8;

export function DaySchedule({ schedule, isPremium = false, onDone, onFail }) {
  const timedItems = schedule.items
    .filter((item) => item.startTime)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const untimedItems = schedule.items.filter((item) => !item.startTime);
  const firstHour = timedItems.length
    ? Math.max(6, Math.floor(timeToMinutes(timedItems[0].startTime) / 60) - 1)
    : 8;
  const lastHour = timedItems.length
    ? Math.min(23, Math.ceil(timeToMinutes(timedItems[timedItems.length - 1].endTime || timedItems[timedItems.length - 1].startTime) / 60) + 1)
    : 18;
  const timelineScale = buildTimelineScale(timedItems, firstHour, lastHour);
  const laidOutItems = layoutTimedItems(timedItems, timelineScale);
  const timelineHeight = Math.max(
    220,
    timelineScale.totalHeight + 24,
    laidOutItems.reduce((max, item) => Math.max(max, item.top + item.itemHeight + 24), 0)
  );

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.title}>{schedule.title}</Text>
        <View style={styles.actionRow}>
          <Text style={styles.plus}>+</Text>
          <Text style={styles.action}>{schedule.action}</Text>
        </View>
      </View>

      {!isPremium ? (
        <View style={styles.freeList}>
          {schedule.items.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Nu ai taskuri reale programate azi.</Text>
            </View>
          ) : (
            schedule.items.map((item, index) => (
              <FreeScheduleItem key={item.id} item={item} index={index} onDone={onDone} onFail={onFail} />
            ))
          )}
        </View>
      ) : (
        <>
          <View style={[styles.timeline, { height: timelineHeight }]}>
            <View style={styles.line} />
            {timelineScale.hours.map((hour) => (
              <View key={hour.hour} style={[styles.hourRow, { top: hour.top }]}>
                <Text style={styles.hourLabel}>{`${hour.hour}`.padStart(2, '0')}:00</Text>
                <View style={styles.hourRule} />
              </View>
            ))}
            {timedItems.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Nu ai taskuri programate pe ore azi.</Text>
              </View>
            ) : (
              laidOutItems.map(({ item, top, itemHeight, compact, joinedPrevious, joinedNext }) => (
                <ScheduleItem
                  key={item.id}
                  item={item}
                  top={top}
                  itemHeight={itemHeight}
                  compact={compact}
                  joinedPrevious={joinedPrevious}
                  joinedNext={joinedNext}
                  onDone={onDone}
                  onFail={onFail}
                />
              ))
            )}
          </View>
          {untimedItems.length ? (
            <View style={styles.unscheduledBlock}>
              <Text style={styles.unscheduledTitle}>Fara ora</Text>
              {untimedItems.map((item, index) => (
                <FreeScheduleItem key={item.id} item={item} index={index} onDone={onDone} onFail={onFail} />
              ))}
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

function FreeScheduleItem({ item, index, onDone, onFail }) {
  const done = Boolean(item.completedAt);
  const failed = Boolean(item.failedAt);

  return (
    <View style={[styles.freeCard, done && styles.completedCard, failed && styles.failedCard]}>
      <View style={styles.freeIndex}>
        <Text style={styles.freeIndexText}>{index + 1}</Text>
      </View>
      <View style={styles.freeCopy}>
        <Text style={[styles.itemTitle, done && styles.completedTitle]}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
        {item.completedAt ? <Text style={styles.status}>Finalizat {item.completedAt}</Text> : null}
        {item.failedAt ? <Text style={styles.failedStatus}>Ratat {item.failedAt}</Text> : null}
        <HomeActions item={item} onDone={onDone} onFail={onFail} />
      </View>
    </View>
  );
}

function ScheduleItem({ item, top, itemHeight, compact, joinedPrevious, joinedNext, onDone, onFail }) {
  const isRoute = item.type === 'route';
  const isWalkRoute = item.travelMode === 'walk';
  const focus = item.tone === 'focus';
  const done = Boolean(item.completedAt);
  const failed = Boolean(item.failedAt);
  const meta = failed ? `Ratat ${item.failedAt}` : done ? `Finalizat ${item.completedAt}` : item.status;

  return (
    <View style={[styles.itemWrap, { top, minHeight: itemHeight }]}>
      <View style={[styles.dot, isRoute && styles.routeDot, isWalkRoute && styles.walkDot, item.isTight && styles.tightDot, dotStyles[item.tone]]} />
      <View style={[
        styles.card,
        { minHeight: itemHeight },
        isRoute && styles.routeCard,
        isWalkRoute && styles.walkRouteCard,
        joinedPrevious && styles.joinedPreviousCard,
        joinedNext && styles.joinedNextCard,
        item.isTight && styles.tightRouteCard,
        compact && styles.compactedCard,
        focus && styles.focusCard,
        done && styles.completedCard,
        failed && styles.failedCard
      ]}>
        <View style={styles.premiumTop}>
          <Text style={[styles.time, toneTextStyles[item.tone]]}>{item.time}</Text>
          <Text style={[styles.itemTitle, styles.premiumTitle, focus && styles.focusText, done && styles.completedTitle]} numberOfLines={1}>
            {item.title}
          </Text>
        </View>
        {meta && itemHeight >= 48 ? <Text style={failed || item.isTight ? styles.failedStatus : styles.status} numberOfLines={1}>{meta}</Text> : null}
        {item.travelWarning ? (
          <View style={styles.travelWarning}>
            <Text style={styles.travelWarningIcon}>!</Text>
            <Text style={styles.travelWarningText} numberOfLines={2}>
              Nu ai timp suficient sa ajungi la acest task. Drumul dureaza {item.travelWarning.requiredMinutes} min, ai doar {item.travelWarning.availableMinutes}.
            </Text>
          </View>
        ) : null}
        {item.status ? (
          <View style={styles.statusRow}>
            <Text style={styles.lock}>▢</Text>
            <Text style={failed ? styles.failedStatus : styles.status}>{item.status}</Text>
          </View>
        ) : null}
        {!isRoute && itemHeight >= 54 ? <HomeActions item={item} onDone={onDone} onFail={onFail} /> : null}
      </View>
    </View>
  );
}

function HomeActions({ item, onDone, onFail }) {
  const done = Boolean(item.completedAt);
  const failed = Boolean(item.failedAt);

  return (
    <View style={styles.homeActions}>
      <Text onPress={() => onDone?.(item.id)} style={[styles.homeAction, done && styles.homeActionActive]}>
        {done ? 'Activeaza' : 'Done'}
      </Text>
      <Text
        onPress={done || failed ? undefined : () => onFail?.(item.id)}
        style={[styles.homeAction, styles.failAction, (done || failed) && styles.homeActionDisabled]}
      >
        Failed
      </Text>
    </View>
  );
}

function timeToMinutes(time) {
  const [hours = '0', minutes = '0'] = `${time}`.split(':');
  return Number(hours) * 60 + Number(minutes);
}

function getItemHeight(item, timelineScale) {
  if (item.type === 'route') {
    const duration = item.durationMinutes || Math.max(6, timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
    return Math.max(MIN_ROUTE_HEIGHT, timelineScale.durationHeight(item.startTime, item.endTime, duration));
  }
  if (!item.endTime) return MIN_ITEM_HEIGHT;
  const duration = Math.max(30, timeToMinutes(item.endTime) - timeToMinutes(item.startTime));
  const warningHeight = item.travelWarning ? 34 : 0;
  return Math.max(MIN_ITEM_HEIGHT + warningHeight, timelineScale.durationHeight(item.startTime, item.endTime, duration) + warningHeight);
}

function layoutTimedItems(items, timelineScale) {
  let bottom = 0;
  const laidOut = items.map((item, index) => {
    const previous = items[index - 1];
    const joinedPrevious = Boolean(previous && shouldAttachToPrevious(previous, item));
    const gap = joinedPrevious ? 0 : ITEM_GAP;
    const rawTop = timelineScale.position(item.startTime);
    const itemHeight = getItemHeight(item, timelineScale);
    const compact = rawTop < bottom + gap;
    const top = compact ? bottom + gap : rawTop;
    bottom = top + itemHeight;
    return { item, top, itemHeight, compact, joinedPrevious };
  });

  return laidOut.map((entry, index) => ({
    ...entry,
    joinedNext: Boolean(items[index + 1] && shouldAttachToPrevious(entry.item, items[index + 1]))
  }));
}

function shouldAttachToPrevious(previous, item) {
  if (previous.type !== 'route') return false;
  if (previous.endTime !== item.startTime) return false;
  return true;
}

function buildTimelineScale(items, firstHour, lastHour) {
  const hours = Array.from({ length: lastHour - firstHour + 1 }, (_, index) => firstHour + index);
  const hourHeights = hours.slice(0, -1).map((hour) => {
    const hourStart = hour * 60;
    const hourEnd = hourStart + 60;
    const hourItems = items.filter((item) => {
      const start = timeToMinutes(item.startTime);
      const end = timeToMinutes(item.endTime || item.startTime) || start + 30;
      return start < hourEnd && end > hourStart;
    });
    if (!hourItems.length) return QUIET_HOUR_HEIGHT;

    const routeCount = hourItems.filter((item) => item.type === 'route').length;
    const taskCount = hourItems.length - routeCount;
    const required = taskCount * (MIN_ITEM_HEIGHT + ITEM_GAP) + routeCount * (MIN_ROUTE_HEIGHT + ITEM_GAP) + 18;
    return Math.max(DEFAULT_HOUR_HEIGHT, Math.min(BUSY_HOUR_HEIGHT, required));
  });

  const hourTops = hours.reduce((acc, hour, index) => {
    acc[hour] = index === 0 ? 0 : acc[hours[index - 1]] + hourHeights[index - 1];
    return acc;
  }, {});
  const totalHeight = hourHeights.reduce((sum, height) => sum + height, 0);

  const heightForMinute = (minuteValue) => {
    const clamped = Math.max(firstHour * 60, Math.min(lastHour * 60, minuteValue));
    const hour = Math.min(lastHour - 1, Math.floor(clamped / 60));
    const hourHeight = hourHeights[Math.max(0, hour - firstHour)] || QUIET_HOUR_HEIGHT;
    return hourTops[hour] + ((clamped - hour * 60) / 60) * hourHeight;
  };

  return {
    totalHeight,
    hours: hours.map((hour) => ({ hour, top: hourTops[hour] || totalHeight })),
    position: (time) => heightForMinute(timeToMinutes(time)),
    durationHeight: (startTime, endTime, fallbackMinutes) => {
      const start = heightForMinute(timeToMinutes(startTime));
      const end = endTime ? heightForMinute(timeToMinutes(endTime)) : start + fallbackMinutes;
      return Math.max(0, end - start);
    }
  };
}

const dotStyles = {
  primary: { backgroundColor: colors.primary },
  muted: { backgroundColor: colors.outlineSubtle },
  tertiary: { backgroundColor: colors.tertiary },
  warning: { backgroundColor: colors.error },
  walk: { backgroundColor: '#34d399' },
  focus: { backgroundColor: colors.primaryStrong }
};

const toneTextStyles = {
  primary: { color: colors.primary, backgroundColor: 'rgba(192,193,255,0.12)' },
  muted: { color: colors.mutedText, backgroundColor: colors.surfaceRaised },
  tertiary: { color: colors.tertiary, backgroundColor: 'rgba(255,183,131,0.15)' },
  warning: { color: colors.error, backgroundColor: 'rgba(255,180,171,0.12)' },
  walk: { color: '#34d399', backgroundColor: 'rgba(52,211,153,0.12)' },
  focus: { color: colors.primary, backgroundColor: 'rgba(192,193,255,0.16)' }
};

const styles = StyleSheet.create({
  wrap: {
    gap: 14
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 14,
    marginTop: 6
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 21,
    lineHeight: 25,
    fontWeight: '900'
  },
  actionRow: {
    maxWidth: 120,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  plus: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: '900'
  },
  action: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '600'
  },
  freeList: {
    gap: 12
  },
  timeline: {
    position: 'relative',
    paddingLeft: 58
  },
  line: {
    position: 'absolute',
    left: 47,
    top: 8,
    bottom: 5,
    width: 1,
    backgroundColor: 'rgba(144,143,160,0.24)'
  },
  hourRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  hourLabel: {
    width: 42,
    color: 'rgba(144,143,160,0.72)',
    fontSize: 10,
    fontWeight: '900'
  },
  hourRule: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(144,143,160,0.11)'
  },
  itemWrap: {
    position: 'absolute',
    left: 58,
    right: 0
  },
  dot: {
    position: 'absolute',
    left: -14,
    top: 7,
    width: 7,
    height: 7,
    borderRadius: 4
  },
  routeDot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: colors.outline
  },
  tightDot: {
    backgroundColor: colors.error
  },
  walkDot: {
    backgroundColor: '#34d399'
  },
  card: {
    flex: 1,
    minHeight: 92,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 10,
    gap: 6
  },
  routeCard: {
    minHeight: 64,
    borderStyle: 'solid',
    borderColor: 'rgba(144,143,160,0.3)',
    backgroundColor: 'rgba(19,27,46,0.86)'
  },
  tightRouteCard: {
    borderColor: 'rgba(255,180,171,0.5)',
    backgroundColor: 'rgba(255,180,171,0.08)'
  },
  walkRouteCard: {
    borderColor: 'rgba(52,211,153,0.44)',
    backgroundColor: 'rgba(52,211,153,0.08)'
  },
  joinedPreviousCard: {
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderTopColor: 'rgba(255,255,255,0.04)'
  },
  joinedNextCard: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderBottomColor: 'rgba(255,255,255,0.04)'
  },
  compactedCard: {
    borderColor: 'rgba(192,193,255,0.22)'
  },
  freeCard: {
    minHeight: 84,
    flexDirection: 'row',
    gap: 12,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: 'rgba(30,41,59,0.72)',
    padding: 14
  },
  freeIndex: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceHighest
  },
  freeIndexText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '900'
  },
  freeCopy: {
    flex: 1,
    gap: 5
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
  focusCard: {
    borderColor: 'rgba(192,193,255,0.32)',
    backgroundColor: 'rgba(128,131,255,0.12)'
  },
  completedCard: {
    opacity: 0.68
  },
  failedCard: {
    borderColor: 'rgba(255,180,171,0.4)',
    backgroundColor: 'rgba(255,180,171,0.08)'
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  premiumTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  time: {
    overflow: 'hidden',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '700'
  },
  itemIcon: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '900'
  },
  itemTitle: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 21,
    fontWeight: '900',
    marginBottom: 5
  },
  premiumTitle: {
    flex: 1,
    fontSize: 14,
    lineHeight: 18,
    marginBottom: 0
  },
  focusText: {
    color: colors.primary
  },
  description: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '500'
  },
  statusRow: {
    display: 'none',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginTop: 16
  },
  lock: {
    color: colors.primary,
    fontSize: 11
  },
  status: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase'
  },
  failedStatus: {
    color: colors.error,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  travelWarning: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    borderRadius: 6,
    backgroundColor: 'rgba(250,204,21,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  travelWarningIcon: {
    color: '#facc15',
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '900'
  },
  travelWarningText: {
    flex: 1,
    color: '#facc15',
    fontSize: 10,
    lineHeight: 15,
    fontWeight: '800'
  },
  completedTitle: {
    color: colors.mutedText,
    textDecorationLine: 'line-through'
  },
  homeActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2
  },
  homeAction: {
    overflow: 'hidden',
    minHeight: 26,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    color: colors.primary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '900'
  },
  homeActionActive: {
    borderColor: colors.primary,
    backgroundColor: 'rgba(192,193,255,0.12)'
  },
  failAction: {
    color: colors.error
  },
  homeActionDisabled: {
    color: colors.outline,
    opacity: 0.52
  },
  unscheduledBlock: {
    gap: 10
  },
  unscheduledTitle: {
    color: colors.outline,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase'
  }
});

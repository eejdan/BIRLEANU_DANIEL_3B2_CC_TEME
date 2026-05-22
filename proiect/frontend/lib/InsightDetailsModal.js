import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function InsightDetailsModal({ visible, period, data, onPeriodChange, onClose }) {
  const maxValue = Math.max(1, ...data.map((item) => item.done + item.failed));

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Insight detaliat</Text>
              <Text style={styles.title}>Productivitate pe ore</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.close}>x</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.segmented}>
            {[
              { key: 'week', label: 'Saptamana' },
              { key: 'month', label: 'Luna' }
            ].map((item) => (
              <TouchableOpacity
                key={item.key}
                activeOpacity={0.86}
                onPress={() => onPeriodChange?.(item.key)}
                style={[styles.segment, period === item.key && styles.segmentActive]}
              >
                <Text style={[styles.segmentText, period === item.key && styles.segmentTextActive]}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.chart}>
            {data.map((item) => (
              <View key={item.hour} style={styles.column}>
                <View style={styles.barTrack}>
                  <View style={[styles.failedBar, { height: `${(item.failed / maxValue) * 100}%` }]} />
                  <View style={[styles.doneBar, { height: `${(item.done / maxValue) * 100}%` }]} />
                </View>
                <Text style={styles.hour}>{item.hour}</Text>
              </View>
            ))}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}><View style={[styles.legendDot, styles.doneDot]} /><Text style={styles.legendText}>Done</Text></View>
            <View style={styles.legendItem}><View style={[styles.legendDot, styles.failedDot]} /><Text style={styles.legendText}>Failed</Text></View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(4,8,18,0.72)',
    padding: 16
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: colors.surfaceRaised,
    padding: 18,
    gap: 16
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  title: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900'
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center'
  },
  close: {
    color: colors.text,
    fontSize: 18,
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
    minHeight: 36,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center'
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
  chart: {
    minHeight: 220,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: 8
  },
  barTrack: {
    width: '100%',
    height: 190,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    backgroundColor: colors.surface
  },
  doneBar: {
    width: '100%',
    backgroundColor: colors.primary
  },
  failedBar: {
    width: '100%',
    backgroundColor: colors.error
  },
  hour: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '800'
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6
  },
  legendDot: {
    width: 9,
    height: 9,
    borderRadius: 5
  },
  doneDot: {
    backgroundColor: colors.primary
  },
  failedDot: {
    backgroundColor: colors.error
  },
  legendText: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '800'
  }
});

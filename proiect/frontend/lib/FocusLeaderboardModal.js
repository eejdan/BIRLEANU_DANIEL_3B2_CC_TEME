import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii } from './theme';

export function FocusLeaderboardModal({ visible, entries = [], currentUserEmail, periodLabel, onClose }) {
  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View>
              <Text style={styles.eyebrow}>Premium leaderboard</Text>
              <Text style={styles.title}>Top 10 Focus Score</Text>
              <Text style={styles.subtitle}>Media lunii {periodLabel}</Text>
            </View>
            <TouchableOpacity accessibilityLabel="Inchide clasament" onPress={onClose} style={styles.closeButton}>
              <Text style={styles.close}>x</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.list}>
            {entries.slice(0, 10).map((entry, index) => {
              const active = entry.email === currentUserEmail;

              return (
                <View key={entry.email} style={[styles.row, active && styles.activeRow]}>
                  <Text style={[styles.rank, active && styles.activeText]}>{index + 1}</Text>
                  <View style={styles.copy}>
                    <Text style={[styles.name, active && styles.activeText]}>{entry.name}</Text>
                    <Text style={styles.meta}>{entry.completed}/{entry.total} taskuri inchise</Text>
                  </View>
                  <Text style={[styles.score, active && styles.activeScore]}>{entry.averageFocusScore}</Text>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.62)',
    padding: 16
  },
  card: {
    width: '100%',
    maxWidth: 390,
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(192,193,255,0.28)',
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
  subtitle: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 3
  },
  closeButton: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center'
  },
  close: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '900'
  },
  list: {
    gap: 8
  },
  row: {
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(11,19,38,0.26)',
    padding: 10
  },
  activeRow: {
    borderColor: 'rgba(192,193,255,0.42)',
    backgroundColor: 'rgba(192,193,255,0.12)'
  },
  rank: {
    width: 24,
    color: colors.outline,
    fontSize: 13,
    fontWeight: '900'
  },
  copy: {
    flex: 1
  },
  name: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '900'
  },
  meta: {
    color: colors.mutedText,
    fontSize: 11,
    marginTop: 2,
    fontWeight: '700'
  },
  score: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: '900'
  },
  activeText: {
    color: colors.primary
  },
  activeScore: {
    color: colors.tertiary
  }
});

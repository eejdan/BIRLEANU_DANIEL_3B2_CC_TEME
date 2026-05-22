import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors, radii, typography } from './theme';

export function AppHeader({
  title,
  initials,
  showLeaderboard = false,
  showClose = false,
  hideAvatar = false,
  onAvatarPress,
  onClosePress,
  onLeaderboardPress
}) {
  return (
    <View style={styles.header}>
      <View style={styles.brand}>
        <Text style={styles.brandIcon}>⦿</Text>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.actions}>
        {showLeaderboard ? (
          <TouchableOpacity accessibilityLabel="Clasament focus" style={styles.iconButton} onPress={onLeaderboardPress}>
            <Text style={styles.notification}>♧</Text>
          </TouchableOpacity>
        ) : null}
        {showClose ? (
          <TouchableOpacity accessibilityLabel="Inchide" style={styles.iconButton} onPress={onClosePress}>
            <Text style={styles.close}>x</Text>
          </TouchableOpacity>
        ) : null}
        {initials && !hideAvatar ? (
          <TouchableOpacity activeOpacity={0.84} accessibilityLabel="Profil" onPress={onAvatarPress} style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 64,
    paddingHorizontal: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background
  },
  brand: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10
  },
  brandIcon: {
    color: colors.primary,
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900'
  },
  title: {
    ...typography.title,
    color: colors.primary
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  iconButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 21
  },
  notification: {
    color: colors.mutedText,
    fontSize: 24,
    fontWeight: '700'
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryStrong
  },
  avatarText: {
    color: colors.onPrimaryContainer,
    fontSize: 11,
    fontWeight: '900'
  },
  close: {
    color: colors.text,
    fontSize: 24,
    lineHeight: 28,
    fontWeight: '700'
  }
});

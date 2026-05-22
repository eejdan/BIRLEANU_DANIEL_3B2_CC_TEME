import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { colors, radii } from './theme';

function profilePhotoFor(user) {
  return 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=240&q=80';
}

export function ProfileAccountCard({ user, csvPreview }) {
  const isPremium = user.subscription === 'premium';

  return (
    <View style={[styles.card, isPremium && styles.premiumCard]}>
      <View style={styles.profileTop}>
        <View style={styles.photoWrap}>
          <Image source={{ uri: profilePhotoFor(user) }} style={styles.photo} />
          <View style={[styles.planDot, isPremium && styles.planDotPremium]} />
        </View>
        <View style={styles.identity}>
          <View style={[styles.badge, isPremium && styles.premiumBadge]}>
            <Text style={[styles.badgeText, isPremium && styles.premiumBadgeText]}>
              {isPremium ? 'Premium' : 'Free'}
            </Text>
          </View>
          <Text style={styles.label}>Cont activ</Text>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{isPremium ? 'Auto' : 'Manual'}</Text>
          <Text style={styles.statLabel}>Planificare</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{isPremium ? '0' : 'Ads'}</Text>
          <Text style={styles.statLabel}>Intreruperi</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{isPremium ? 'Live' : '1x'}</Text>
          <Text style={styles.statLabel}>Tranzit</Text>
        </View>
      </View>

      <View style={styles.rules}>
        <Text style={styles.rule}>{isPremium ? 'Fara reclame in aplicatie.' : 'Versiunea free include reclame.'}</Text>
        <Text style={styles.rule}>
          {isPremium
            ? 'Taskurile pot avea ora, durata estimata si programare automata.'
            : 'Taskurile raman pe zile, fara programare automata pe ore.'}
        </Text>
        <Text style={styles.rule}>
          {isPremium
            ? 'Tranzitul se poate recalcula in timpul zilei.'
            : 'Tranzitul se calculeaza o data dimineata.'}
        </Text>
      </View>

      <View style={styles.csvBox}>
        <Text style={styles.csvLabel}>CSV mock activ</Text>
        <Text style={styles.csvText} numberOfLines={2}>{csvPreview}</Text>
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
    gap: 16
  },
  premiumCard: {
    borderColor: 'rgba(192,193,255,0.45)',
    backgroundColor: 'rgba(128,131,255,0.12)'
  },
  profileTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16
  },
  photoWrap: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: colors.surfaceHighest
  },
  photo: {
    width: '100%',
    height: '100%',
    borderRadius: 43
  },
  planDot: {
    position: 'absolute',
    right: 2,
    bottom: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 3,
    borderColor: colors.surfaceRaised,
    backgroundColor: colors.tertiary
  },
  planDotPremium: {
    backgroundColor: colors.primary
  },
  identity: {
    flex: 1,
    gap: 4
  },
  label: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  name: {
    color: colors.text,
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '900'
  },
  email: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '600'
  },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: radii.pill,
    backgroundColor: colors.secondaryContainer,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  premiumBadge: {
    backgroundColor: colors.primary
  },
  badgeText: {
    color: colors.secondary,
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase'
  },
  premiumBadgeText: {
    color: colors.onPrimary
  },
  rules: {
    gap: 8,
    marginBottom: 0
  },
  statsRow: {
    flexDirection: 'row',
    gap: 8
  },
  statBox: {
    flex: 1,
    minHeight: 62,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.07)',
    backgroundColor: 'rgba(11,19,38,0.32)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6
  },
  statValue: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '900'
  },
  statLabel: {
    color: colors.mutedText,
    fontSize: 10,
    fontWeight: '800',
    marginTop: 3
  },
  rule: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    fontWeight: '600'
  },
  csvBox: {
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    backgroundColor: 'rgba(11,19,38,0.35)',
    padding: 12
  },
  csvLabel: {
    color: colors.outline,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 5
  },
  csvText: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '600'
  }
});

import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { PropsWithChildren, ReactNode } from 'react';

import { theme } from '../theme';

export function ScreenShell({ children, footer }: PropsWithChildren<{ footer?: ReactNode }>) {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        {children}
        {footer}
      </ScrollView>
    </SafeAreaView>
  );
}

export function BrandHeader({ title, subtitle, badge = 'FocusFlow' }: { title: string; subtitle?: string; badge?: string }) {
  return (
    <View style={styles.brandBlock}>
      <Text style={styles.badge}>{badge}</Text>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

export function SectionHeader({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {action}
    </View>
  );
}

export function SurfaceCard({ children, tone = 'raised' }: PropsWithChildren<{ tone?: 'surface' | 'raised' | 'high' | 'ad' }>) {
  return (
    <View style={[
      styles.card,
      tone === 'surface' ? styles.surface : null,
      tone === 'raised' ? styles.raised : null,
      tone === 'high' ? styles.high : null,
      tone === 'ad' ? styles.ad : null
    ]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  scroll: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  content: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(5)
  },
  brandBlock: {
    gap: 6,
    paddingTop: theme.spacing(1)
  },
  badge: {
    color: theme.colors.primary,
    ...theme.typography.label
  },
  title: {
    color: theme.colors.text,
    ...theme.typography.title
  },
  subtitle: {
    color: theme.colors.textMuted,
    ...theme.typography.body
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing(1)
  },
  sectionTitle: {
    color: theme.colors.text,
    ...theme.typography.sectionTitle
  },
  card: {
    borderRadius: theme.radii.xl,
    borderWidth: 1,
    borderColor: theme.colors.outlineSubtle,
    padding: theme.spacing(2),
    gap: theme.spacing(1.5)
  },
  surface: {
    backgroundColor: theme.colors.surface
  },
  raised: {
    backgroundColor: theme.colors.surfaceRaised
  },
  high: {
    backgroundColor: theme.colors.surfaceHigh
  },
  ad: {
    backgroundColor: theme.colors.adBackground
  }
});

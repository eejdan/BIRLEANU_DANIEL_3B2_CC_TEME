import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import type { PropsWithChildren, ReactNode } from 'react';

import { theme } from '@/theme';

export function Screen({ children }: PropsWithChildren) {
  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.screenContent}>
      {children}
    </ScrollView>
  );
}

export function Hero({ title, subtitle, action }: { title: string; subtitle: string; action?: ReactNode }) {
  return (
    <View style={styles.hero}>
      <View style={styles.heroBadge}>
        <Text style={styles.heroBadgeText}>FOCUSFLOW</Text>
      </View>
      <Text style={styles.heroTitle}>{title}</Text>
      <Text style={styles.heroSubtitle}>{subtitle}</Text>
      {action ? <View style={styles.heroAction}>{action}</View> : null}
    </View>
  );
}

export function SectionCard({ title, subtitle, children, tone = 'default' }: PropsWithChildren<{ title: string; subtitle?: string; tone?: 'default' | 'soft' | 'accent' }>) {
  return (
    <View style={[
      styles.card,
      tone === 'soft' ? styles.cardSoft : null,
      tone === 'accent' ? styles.cardAccent : null
    ]}>
      <Text style={styles.cardTitle}>{title}</Text>
      {subtitle ? <Text style={styles.cardSubtitle}>{subtitle}</Text> : null}
      <View style={styles.cardBody}>{children}</View>
    </View>
  );
}

export function Field({ label, value, onChangeText, placeholder, multiline = false }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; multiline?: boolean }) {
  return (
    <View style={styles.field}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, multiline ? styles.inputMultiline : null]}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={theme.colors.muted}
        onChangeText={onChangeText}
        multiline={multiline}
      />
    </View>
  );
}

export function Button({ label, onPress, tone = 'primary', disabled = false }: { label: string; onPress: () => void; tone?: 'primary' | 'secondary' | 'ghost' | 'danger'; disabled?: boolean }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        tone === 'primary' ? styles.buttonPrimary : null,
        tone === 'secondary' ? styles.buttonSecondary : null,
        tone === 'ghost' ? styles.buttonGhost : null,
        tone === 'danger' ? styles.buttonDanger : null,
        pressed && !disabled ? styles.buttonPressed : null,
        disabled ? styles.buttonDisabled : null
      ]}
    >
      <Text style={[
        styles.buttonLabel,
        tone === 'ghost' ? styles.buttonLabelGhost : null
      ]}>
        {label}
      </Text>
    </Pressable>
  );
}

export function ButtonRow({ children }: PropsWithChildren) {
  return <View style={styles.buttonRow}>{children}</View>;
}

export function InlineStat({ label, value, tone = 'default' }: { label: string; value: string; tone?: 'default' | 'success' | 'warning' | 'danger' }) {
  return (
    <View style={[
      styles.stat,
      tone === 'success' ? styles.statSuccess : null,
      tone === 'warning' ? styles.statWarning : null,
      tone === 'danger' ? styles.statDanger : null
    ]}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

export function Banner({ text, tone = 'info' }: { text: string; tone?: 'info' | 'warning' | 'success' | 'danger' }) {
  return (
    <View style={[
      styles.banner,
      tone === 'warning' ? styles.bannerWarning : null,
      tone === 'success' ? styles.bannerSuccess : null,
      tone === 'danger' ? styles.bannerDanger : null
    ]}>
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  );
}

export function ListItem({ title, subtitle, meta, children }: PropsWithChildren<{ title: string; subtitle?: string; meta?: string }>) {
  return (
    <View style={styles.listItem}>
      <View style={styles.listItemTop}>
        <View style={styles.listItemCopy}>
          <Text style={styles.listItemTitle}>{title}</Text>
          {subtitle ? <Text style={styles.listItemSubtitle}>{subtitle}</Text> : null}
        </View>
        {meta ? <Text style={styles.listItemMeta}>{meta}</Text> : null}
      </View>
      {children ? <View style={styles.listItemActions}>{children}</View> : null}
    </View>
  );
}

export function Loader({ label = 'Loading...' }: { label?: string }) {
  return (
    <View style={styles.loader}>
      <ActivityIndicator color={theme.colors.primary} />
      <Text style={styles.loaderText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: theme.colors.background
  },
  screenContent: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
    paddingBottom: theme.spacing(5)
  },
  hero: {
    backgroundColor: theme.colors.text,
    borderRadius: theme.radius.lg,
    padding: theme.spacing(3),
    gap: theme.spacing(1)
  },
  heroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999
  },
  heroBadgeText: {
    color: theme.colors.canvas,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1
  },
  heroTitle: {
    color: theme.colors.canvas,
    fontSize: 30,
    fontWeight: '800'
  },
  heroSubtitle: {
    color: '#e5d8c7',
    fontSize: 15,
    lineHeight: 22
  },
  heroAction: {
    marginTop: theme.spacing(1)
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing(2),
    gap: theme.spacing(1)
  },
  cardSoft: {
    backgroundColor: theme.colors.cardAlt
  },
  cardAccent: {
    backgroundColor: '#efe8d8'
  },
  cardTitle: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '700'
  },
  cardSubtitle: {
    color: theme.colors.muted,
    fontSize: 14,
    lineHeight: 20
  },
  cardBody: {
    gap: theme.spacing(1.5)
  },
  field: {
    gap: 6
  },
  fieldLabel: {
    color: theme.colors.text,
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4
  },
  input: {
    backgroundColor: theme.colors.canvas,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: theme.colors.text
  },
  inputMultiline: {
    minHeight: 96,
    textAlignVertical: 'top'
  },
  button: {
    minHeight: 44,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    flexGrow: 1
  },
  buttonPrimary: {
    backgroundColor: theme.colors.primary
  },
  buttonSecondary: {
    backgroundColor: theme.colors.secondary
  },
  buttonGhost: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.canvas
  },
  buttonDanger: {
    backgroundColor: theme.colors.danger
  },
  buttonPressed: {
    opacity: 0.85
  },
  buttonDisabled: {
    opacity: 0.5
  },
  buttonLabel: {
    color: theme.colors.canvas,
    fontWeight: '700'
  },
  buttonLabelGhost: {
    color: theme.colors.text
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  stat: {
    borderRadius: theme.radius.sm,
    padding: theme.spacing(1.5),
    backgroundColor: theme.colors.primarySoft,
    gap: 4
  },
  statSuccess: {
    backgroundColor: theme.colors.successSoft
  },
  statWarning: {
    backgroundColor: theme.colors.warningSoft
  },
  statDanger: {
    backgroundColor: theme.colors.dangerSoft
  },
  statLabel: {
    color: theme.colors.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  statValue: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  banner: {
    backgroundColor: theme.colors.primarySoft,
    borderRadius: theme.radius.sm,
    padding: theme.spacing(1.5)
  },
  bannerWarning: {
    backgroundColor: theme.colors.warningSoft
  },
  bannerSuccess: {
    backgroundColor: theme.colors.successSoft
  },
  bannerDanger: {
    backgroundColor: theme.colors.dangerSoft
  },
  bannerText: {
    color: theme.colors.text,
    lineHeight: 20
  },
  listItem: {
    borderRadius: theme.radius.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.canvas,
    padding: theme.spacing(1.5),
    gap: theme.spacing(1)
  },
  listItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing(1)
  },
  listItemCopy: {
    flex: 1,
    gap: 2
  },
  listItemTitle: {
    color: theme.colors.text,
    fontSize: 16,
    fontWeight: '700'
  },
  listItemSubtitle: {
    color: theme.colors.muted,
    fontSize: 13,
    lineHeight: 18
  },
  listItemMeta: {
    color: theme.colors.accent,
    fontSize: 12,
    fontWeight: '700'
  },
  listItemActions: {
    gap: 8
  },
  loader: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: theme.spacing(2)
  },
  loaderText: {
    color: theme.colors.muted
  }
});

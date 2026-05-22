import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { colors, radii } from './theme';

export function AuthScreen({ data, mode, error, onModeChange, onSubmit }) {
  const content = mode === 'login' ? data.login : data.signup;
  const nextMode = mode === 'login' ? 'signup' : 'login';
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const updateField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = () => {
    onSubmit(form);
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <Text style={styles.brandIcon}>⦿</Text>
          <Text style={styles.brand}>{data.brand.title}</Text>
        </View>

        <View style={styles.hero}>
          <Text style={styles.heroTitle}>{content.title}</Text>
          <Text style={styles.heroSubtitle}>{content.subtitle}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.eyebrow}>{content.eyebrow}</Text>
          <Text style={styles.cardTitle}>{data.brand.subtitle}</Text>

          <View style={styles.modeSwitch}>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => onModeChange('login')}
              style={[styles.modeButton, mode === 'login' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, mode === 'login' && styles.modeTextActive]}>Login</Text>
            </TouchableOpacity>
            <TouchableOpacity
              activeOpacity={0.86}
              onPress={() => onModeChange('signup')}
              style={[styles.modeButton, mode === 'signup' && styles.modeButtonActive]}
            >
              <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            {mode === 'signup' ? (
              <AuthInput
                placeholder={content.namePlaceholder}
                textContentType="name"
                value={form.name}
                onChangeText={(value) => updateField('name', value)}
              />
            ) : null}
            <AuthInput
              placeholder={content.emailPlaceholder}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => updateField('email', value)}
            />
            <AuthInput
              placeholder={content.passwordPlaceholder}
              secureTextEntry
              textContentType={mode === 'signup' ? 'newPassword' : 'password'}
              value={form.password}
              onChangeText={(value) => updateField('password', value)}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <TouchableOpacity activeOpacity={0.86} style={styles.primaryButton} onPress={submit}>
            <Text style={styles.primaryButtonText}>{content.cta}</Text>
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.78} style={styles.switchLine} onPress={() => onModeChange(nextMode)}>
            <Text style={styles.switchText}>{content.switchText}</Text>
            <Text style={styles.switchAction}>{content.switchAction}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.highlights}>
          {data.highlights.map((highlight) => (
            <View key={highlight} style={styles.highlightRow}>
              <Text style={styles.check}>✓</Text>
              <Text style={styles.highlightText}>{highlight}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AuthInput(props) {
  return (
    <TextInput
      {...props}
      autoCapitalize="none"
      placeholderTextColor="rgba(199,196,215,0.58)"
      style={styles.input}
    />
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1
  },
  content: {
    minHeight: '100%',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingVertical: 28,
    gap: 22
  },
  brandRow: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  brandIcon: {
    color: colors.primary,
    fontSize: 28,
    lineHeight: 32,
    fontWeight: '900'
  },
  brand: {
    color: colors.primary,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900'
  },
  hero: {
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 8
  },
  heroTitle: {
    color: colors.text,
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    textAlign: 'center'
  },
  heroSubtitle: {
    color: colors.mutedText,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '500',
    textAlign: 'center'
  },
  card: {
    borderRadius: radii.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(30,41,59,0.78)',
    padding: 20
  },
  eyebrow: {
    color: colors.primary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '900',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 8
  },
  cardTitle: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21,
    fontWeight: '600',
    marginBottom: 18
  },
  modeSwitch: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    marginBottom: 18
  },
  modeButton: {
    flex: 1,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.pill
  },
  modeButtonActive: {
    backgroundColor: colors.secondaryContainer
  },
  modeText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '900'
  },
  modeTextActive: {
    color: colors.secondary
  },
  form: {
    gap: 12
  },
  input: {
    height: 50,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.outlineSubtle,
    backgroundColor: colors.surface,
    color: colors.text,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600'
  },
  error: {
    color: colors.error,
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
    marginTop: 12
  },
  primaryButton: {
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radii.sm,
    backgroundColor: colors.primary,
    marginTop: 18
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: '900'
  },
  switchLine: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16
  },
  switchText: {
    color: colors.mutedText,
    fontSize: 13,
    fontWeight: '600'
  },
  switchAction: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: '900'
  },
  highlights: {
    gap: 10,
    paddingHorizontal: 8
  },
  highlightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  check: {
    color: '#34d399',
    fontSize: 13,
    fontWeight: '900'
  },
  highlightText: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600'
  }
});

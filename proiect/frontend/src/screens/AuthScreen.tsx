import { useState } from 'react';
import { Alert, View } from 'react-native';

import { Button, Field, Hero, Screen, SectionCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit() {
    try {
      setBusy(true);
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (error) {
      Alert.alert('Authentication failed', error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Screen>
      <Hero
        title="One place for planning, focus, and daily execution."
        subtitle="This mobile client matches the live backend domains: calendar, recommendations, billing, and advertising, with the newer quick notes, focus sessions, analytics, leaderboard, and fail-state features included."
      />

      <SectionCard
        title={mode === 'login' ? 'Sign In' : 'Create account'}
        subtitle="Use the same JWT-backed flow implemented in the authentication service."
      >
        {mode === 'register' ? (
          <Field label="Name" value={name} onChangeText={setName} placeholder="Daniel" />
        ) : null}
        <Field label="Email" value={email} onChangeText={setEmail} placeholder="user@example.com" />
        <Field label="Password" value={password} onChangeText={setPassword} placeholder="Minimum 8 characters" />
        <Button label={busy ? 'Working...' : mode === 'login' ? 'Log In' : 'Register'} onPress={submit} disabled={busy} />
        <View style={{ gap: 10 }}>
          <Button
            label={mode === 'login' ? 'Need an account? Switch to register' : 'Already registered? Switch to login'}
            tone="ghost"
            onPress={() => setMode((current) => current === 'login' ? 'register' : 'login')}
          />
        </View>
      </SectionCard>
    </Screen>
  );
}

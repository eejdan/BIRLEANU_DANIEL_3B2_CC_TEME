import { useState } from 'react';
import { Alert } from 'react-native';

import { useAuth } from '@/context/AuthContext';
import { BrandHeader, ScreenShell, SurfaceCard } from '../global/layout';
import { FilledButton, LabeledInput, SegmentedSwitch } from '../global/controls';

export function AuthScreen() {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit() {
    try {
      if (mode === 'login') {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (error) {
      Alert.alert('Authentication failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  return (
    <ScreenShell>
      <BrandHeader title="Plan your day. Protect your focus." subtitle="A dark, consumer-ready workspace for routines, tasks, events, and smart scheduling." />
      <SurfaceCard tone="raised">
        <SegmentedSwitch
          value={mode}
          onChange={(next) => setMode(next as 'login' | 'signup')}
          options={[
            { label: 'Login', value: 'login' },
            { label: 'Signup', value: 'signup' }
          ]}
        />
        {mode === 'signup' ? (
          <LabeledInput label="Name" value={name} onChangeText={setName} placeholder="Daniel" />
        ) : null}
        <LabeledInput label="Email" value={email} onChangeText={setEmail} placeholder="user@example.com" />
        <LabeledInput label="Password" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry />
        <FilledButton label={mode === 'login' ? 'Continue to FocusFlow' : 'Create account'} onPress={handleSubmit} />
      </SurfaceCard>
    </ScreenShell>
  );
}

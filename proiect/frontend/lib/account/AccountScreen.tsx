import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Linking, Text } from 'react-native';

import { billingApi, recommendationsApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import type { AnalyticsSummary, SubscriptionResponse } from '@/types';
import { FilledButton } from '../global/controls';
import { ScreenShell, BrandHeader, SectionHeader, SurfaceCard } from '../global/layout';
import { theme } from '../theme';

export function AccountScreen() {
  const { token, user, logout } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const [subscriptionResponse, analyticsResponse] = await Promise.all([
        billingApi.getSubscription(token),
        recommendationsApi.getAnalyticsSummary(token, 'week')
      ]);
      setSubscription(subscriptionResponse);
      setAnalytics(analyticsResponse);
    } catch (error) {
      Alert.alert('Account failed to load', error instanceof Error ? error.message : 'Unexpected error');
    }
  }, [token]);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  return (
    <ScreenShell>
      <BrandHeader title="Account" badge="FocusFlow" subtitle="Profile, billing, and progress without the ad slot." />

      <SurfaceCard tone="raised">
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>{user?.name}</Text>
        <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>{user?.email}</Text>
        <Text style={{ color: theme.colors.primary, ...theme.typography.body }}>Plan: {user?.plan}</Text>
      </SurfaceCard>

      <SectionHeader title="Subscription" />
      <SurfaceCard tone="high">
        <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>{subscription?.status ?? 'free'}</Text>
        <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>Plan: {subscription?.plan ?? 'none'}</Text>
        <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>Renewal: {subscription?.renewalDate ?? '-'}</Text>
        <FilledButton
          label="Upgrade yearly"
          onPress={async () => {
            try {
              const session = await billingApi.createCheckoutSession(token!, 'yearly');
              await Linking.openURL(session.checkoutUrl);
            } catch (error) {
              Alert.alert('Upgrade failed', error instanceof Error ? error.message : 'Unexpected error');
            }
          }}
        />
        {subscription?.status === 'active' ? (
          <FilledButton
            label="Cancel subscription"
            tone="ghost"
            onPress={async () => {
              try {
                await billingApi.cancelSubscription(token!);
                await load();
              } catch (error) {
                Alert.alert('Cancellation failed', error instanceof Error ? error.message : 'Unexpected error');
              }
            }}
          />
        ) : null}
      </SurfaceCard>

      <SectionHeader title="Weekly insight" />
      {analytics ? (
        <SurfaceCard tone="surface">
          <Text style={{ color: theme.colors.text, fontSize: 18, fontWeight: '800' }}>Focus score {analytics.focusScore.score}%</Text>
          <Text style={{ color: theme.colors.textMuted, ...theme.typography.body }}>{analytics.insight.text}</Text>
        </SurfaceCard>
      ) : null}

      <FilledButton label="Log out" tone="ghost" onPress={logout} />
    </ScreenShell>
  );
}

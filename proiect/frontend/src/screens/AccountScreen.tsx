import { useEffect, useState } from 'react';
import { Alert, Linking } from 'react-native';

import { advertisingApi, billingApi, recommendationsApi } from '@/api/services';
import { Banner, Button, ButtonRow, Hero, InlineStat, ListItem, Loader, Screen, SectionCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { AdEligibilityResponse, AdResponse, AnalyticsPeriod, AnalyticsSummary, LeaderboardEntry, SubscriptionResponse } from '@/types';

export function AccountScreen() {
  const { token, user, logout, refreshUser } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [premiumAccess, setPremiumAccess] = useState<boolean | null>(null);
  const [eligibility, setEligibility] = useState<AdEligibilityResponse | null>(null);
  const [ad, setAd] = useState<AdResponse | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [period, setPeriod] = useState<AnalyticsPeriod>('week');
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const [sub, premium, adEligibility, summary, board] = await Promise.all([
        billingApi.getSubscription(token),
        billingApi.getPremiumAccess(token),
        advertisingApi.getEligibility(token),
        recommendationsApi.getAnalyticsSummary(token, period),
        recommendationsApi.getLeaderboard(token, period)
      ]);
      setSubscription(sub);
      setPremiumAccess(premium.premiumAccess);
      setEligibility(adEligibility);
      setAnalytics(summary);
      setLeaderboard(board);

      if (adEligibility.shouldShowAds) {
        const nextAd = await advertisingApi.getAd(token);
        setAd(nextAd);
      } else {
        setAd(null);
      }

      await refreshUser();
    } catch (error) {
      Alert.alert('Account data failed to load', error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token, period]);

  async function startCheckout(selectedPlan: 'monthly' | 'yearly') {
    if (!token) {
      return;
    }
    try {
      const session = await billingApi.createCheckoutSession(token, selectedPlan);
      await Linking.openURL(session.checkoutUrl);
    } catch (error) {
      Alert.alert('Checkout failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function cancelSubscription() {
    if (!token) {
      return;
    }
    try {
      await billingApi.cancelSubscription(token);
      await load();
    } catch (error) {
      Alert.alert('Cancellation failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  async function openAd() {
    if (!token || !ad?.targetUrl) {
      return;
    }
    try {
      await advertisingApi.recordClick(token, {
        adId: ad.adId,
        timestamp: new Date().toISOString(),
        placement: ad.placement
      });
      await Linking.openURL(ad.targetUrl);
    } catch (error) {
      Alert.alert('Ad open failed', error instanceof Error ? error.message : 'Unexpected error');
    }
  }

  if (loading && !subscription) {
    return <Loader label="Loading account..." />;
  }

  return (
    <Screen>
      <Hero
        title="Account and insights"
        subtitle="Profile, premium flows, ad handling, analytics summary, and leaderboard all live here so the app covers every domain in the platform."
        action={<Button label="Refresh account" onPress={load} tone="secondary" />}
      />

      <SectionCard title="Profile" subtitle="User identity comes from `/auth/me` and is persisted locally with the JWT.">
        <ButtonRow>
          <InlineStat label="Name" value={user?.name ?? '-'} />
          <InlineStat label="Plan" value={user?.plan ?? '-'} />
          <InlineStat label="Premium access" value={premiumAccess ? 'yes' : 'no'} />
        </ButtonRow>
      </SectionCard>

      <SectionCard title="Billing" subtitle="Checkout and cancellation call the billing service directly.">
        <ButtonRow>
          <InlineStat label="Status" value={subscription?.status ?? '-'} />
          <InlineStat label="Plan" value={subscription?.plan ?? '-'} />
          <InlineStat label="Renewal" value={subscription?.renewalDate ?? '-'} />
        </ButtonRow>
        <ButtonRow>
          <Button label="Upgrade monthly" onPress={() => startCheckout('monthly')} />
          <Button label="Upgrade yearly" tone="secondary" onPress={() => startCheckout('yearly')} />
        </ButtonRow>
        <Button label="Cancel subscription" tone="danger" onPress={cancelSubscription} />
      </SectionCard>

      <SectionCard title="Ads" subtitle="Free users can fetch ad content and report impressions/clicks; premium users see ads hidden.">
        {eligibility ? <Banner text={eligibility.reason} tone={eligibility.shouldShowAds ? 'warning' : 'success'} /> : null}
        {ad ? (
          <ListItem title={ad.title} subtitle={ad.targetUrl ?? 'No target URL'} meta={ad.placement}>
            <Button label="Open ad target" onPress={openAd} />
          </ListItem>
        ) : <Banner text="No ad rendered for this account state." tone="info" />}
      </SectionCard>

      <SectionCard title="Analytics summary" subtitle="This data is produced server-side from events, tasks, commute signals, and focus sessions.">
        <ButtonRow>
          <Button label="Week" tone={period === 'week' ? 'primary' : 'ghost'} onPress={() => setPeriod('week')} />
          <Button label="Month" tone={period === 'month' ? 'primary' : 'ghost'} onPress={() => setPeriod('month')} />
        </ButtonRow>
        {analytics ? (
          <>
            <ButtonRow>
              <InlineStat label="Focus score" value={`${analytics.focusScore.score}%`} />
              <InlineStat label="Focus minutes" value={`${analytics.focusMinutes}m`} />
              <InlineStat label="Commute" value={`${analytics.commuteMinutes}m`} />
            </ButtonRow>
            {analytics.preview.rows.map((row) => (
              <ListItem key={row.id} title={row.label} subtitle={row.detail} meta={row.value} />
            ))}
            <Banner text={analytics.insight.text} tone="info" />
          </>
        ) : null}
      </SectionCard>

      <SectionCard title="Leaderboard" subtitle="Ranked focus and productivity standings from the recommendations service.">
        {leaderboard.map((entry, index) => (
          <ListItem
            key={`${entry.email}-${index}`}
            title={`${index + 1}. ${entry.name}`}
            subtitle={`${entry.completed}/${entry.total} objectives`}
            meta={`${entry.averageFocusScore}%`}
          />
        ))}
      </SectionCard>

      <SectionCard title="Session" subtitle="Use client logout to clear the stored JWT and profile cache.">
        <Button label="Log out" tone="ghost" onPress={logout} />
      </SectionCard>
    </Screen>
  );
}

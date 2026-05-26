import { useEffect, useState } from 'react';
import { Alert } from 'react-native';

import { advertisingApi, billingApi, recommendationsApi } from '@/api/services';
import { Banner, Button, ButtonRow, Hero, InlineStat, ListItem, Loader, Screen, SectionCard } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import type { AdEligibilityResponse, AdResponse, AnalyticsSummary, LeaderboardEntry, SubscriptionResponse } from '@/types';

export function DashboardScreen() {
  const { token, user, refreshUser } = useAuth();
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [subscription, setSubscription] = useState<SubscriptionResponse | null>(null);
  const [eligibility, setEligibility] = useState<AdEligibilityResponse | null>(null);
  const [ad, setAd] = useState<AdResponse | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    if (!token) {
      return;
    }

    try {
      setLoading(true);
      const [summary, board, sub, adEligibility] = await Promise.all([
        recommendationsApi.getAnalyticsSummary(token, 'week'),
        recommendationsApi.getLeaderboard(token, 'week'),
        billingApi.getSubscription(token),
        advertisingApi.getEligibility(token)
      ]);

      setAnalytics(summary);
      setLeaderboard(board);
      setSubscription(sub);
      setEligibility(adEligibility);

      if (adEligibility.shouldShowAds) {
        const nextAd = await advertisingApi.getAd(token);
        setAd(nextAd);
        await advertisingApi.recordImpression(token, {
          adId: nextAd.adId,
          timestamp: new Date().toISOString(),
          placement: nextAd.placement
        });
      } else {
        setAd(null);
      }

      await refreshUser();
    } catch (error) {
      Alert.alert('Dashboard failed to load', error instanceof Error ? error.message : 'Unexpected error');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [token]);

  if (loading && !analytics) {
    return <Loader label="Loading dashboard..." />;
  }

  return (
    <Screen>
      <Hero
        title={`Welcome back, ${user?.name ?? 'planner'}.`}
        subtitle="This overview is powered by backend analytics, server-side focus-session data, subscription status, and ad eligibility, not just frontend estimates."
        action={<Button label="Refresh overview" onPress={load} tone="secondary" />}
      />

      {analytics ? (
        <SectionCard title="Weekly pulse" subtitle={analytics.focusScore.description}>
          <ButtonRow>
            <InlineStat label="Focus score" value={`${analytics.focusScore.score}%`} />
            <InlineStat label="Completed" value={`${analytics.completed}/${analytics.total}`} tone="success" />
            <InlineStat label="Failed" value={`${analytics.failed}`} tone={analytics.failed ? 'danger' : 'default'} />
          </ButtonRow>
          {analytics.summaryCards.map((card) => (
            <ListItem key={card.id} title={card.title} subtitle={card.detail} meta={card.value} />
          ))}
          <Banner text={analytics.insight.text} tone="info" />
        </SectionCard>
      ) : null}

      <SectionCard title="Leaderboard" subtitle="Ranked by the backend-generated average focus score.">
        {leaderboard.slice(0, 5).map((entry, index) => (
          <ListItem
            key={`${entry.email}-${index}`}
            title={`${index + 1}. ${entry.name}`}
            subtitle={`${entry.completed}/${entry.total} completed`}
            meta={`${entry.averageFocusScore}%`}
          />
        ))}
      </SectionCard>

      <SectionCard title="Plan and monetization" subtitle="Billing and advertising are fetched from their own services.">
        <ButtonRow>
          <InlineStat label="Account plan" value={user?.plan ?? '-'} />
          <InlineStat label="Subscription" value={subscription?.status ?? '-'} tone={subscription?.status === 'active' ? 'success' : 'warning'} />
          <InlineStat label="Ads" value={eligibility?.shouldShowAds ? 'enabled' : 'hidden'} />
        </ButtonRow>
        {eligibility ? <Banner text={eligibility.reason} tone={eligibility.shouldShowAds ? 'warning' : 'success'} /> : null}
        {ad ? (
          <ListItem title={ad.title} subtitle={ad.targetUrl ?? 'No target URL'} meta={ad.placement}>
            <Button label="Refresh ad slot" onPress={load} tone="ghost" />
          </ListItem>
        ) : null}
      </SectionCard>
    </Screen>
  );
}

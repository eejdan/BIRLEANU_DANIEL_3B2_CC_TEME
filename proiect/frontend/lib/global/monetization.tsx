import { useEffect, useState } from 'react';
import { Alert, Linking, StyleSheet, Text, View } from 'react-native';

import { advertisingApi, billingApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';
import type { AdResponse } from '@/types';
import { FilledButton } from './controls';
import { SurfaceCard } from './layout';
import { theme } from '../theme';

export function UpgradeCard() {
  const { token, user } = useAuth();
  const [checkoutBusy, setCheckoutBusy] = useState(false);

  if (!token || user?.plan === 'premium') {
    return null;
  }

  return (
    <SurfaceCard tone="high">
      <Text style={styles.title}>Upgrade to Premium</Text>
      <Text style={styles.copy}>
        Unlock auto-arranged day plans and keep your workspace free of ads.
      </Text>
      <FilledButton
        label={checkoutBusy ? 'Opening...' : 'Upgrade'}
        onPress={async () => {
          try {
            setCheckoutBusy(true);
            const session = await billingApi.createCheckoutSession(token, 'monthly');
            await Linking.openURL(session.checkoutUrl);
          } catch (error) {
            Alert.alert('Upgrade failed', error instanceof Error ? error.message : 'Unexpected error');
          } finally {
            setCheckoutBusy(false);
          }
        }}
      />
    </SurfaceCard>
  );
}

export function AdCard() {
  const { token } = useAuth();
  const [ad, setAd] = useState<AdResponse | null>(null);

  useEffect(() => {
    async function loadAd() {
      if (!token) {
        return;
      }

      try {
        const eligibility = await advertisingApi.getEligibility(token);
        if (!eligibility.shouldShowAds) {
          setAd(null);
          return;
        }

        const nextAd = await advertisingApi.getAd(token);
        setAd(nextAd);
        await advertisingApi.recordImpression(token, {
          adId: nextAd.adId,
          timestamp: new Date().toISOString(),
          placement: nextAd.placement
        });
      } catch {
        setAd(null);
      }
    }

    loadAd();
  }, [token]);

  if (!ad) {
    return null;
  }

  return (
    <SurfaceCard tone="ad">
      <Text style={styles.adLabel}>Sponsored</Text>
      <Text style={styles.title}>{ad.title}</Text>
      <Text style={styles.copy}>{ad.targetUrl}</Text>
      <FilledButton
        label="Open"
        tone="secondary"
        onPress={async () => {
          if (!token || !ad.targetUrl) {
            return;
          }
          try {
            await advertisingApi.recordClick(token, {
              adId: ad.adId,
              timestamp: new Date().toISOString(),
              placement: ad.placement
            });
            await Linking.openURL(ad.targetUrl);
          } catch {
            // Ignore ad open failures in the UI.
          }
        }}
      />
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  adLabel: {
    color: theme.colors.secondary,
    ...theme.typography.label
  },
  title: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800'
  },
  copy: {
    color: theme.colors.textMuted,
    ...theme.typography.body
  }
});

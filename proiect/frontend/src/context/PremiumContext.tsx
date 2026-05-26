import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { PropsWithChildren } from 'react';

import { billingApi } from '@/api/services';
import { useAuth } from '@/context/AuthContext';

interface PremiumState {
  premiumAccess: boolean;
  loading: boolean;
  refreshPremium: () => Promise<void>;
}

const PremiumContext = createContext<PremiumState | undefined>(undefined);

export function PremiumProvider({ children }: PropsWithChildren) {
  const { token } = useAuth();
  const [premiumAccess, setPremiumAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  async function refreshPremium() {
    if (!token) {
      setPremiumAccess(false);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await billingApi.getPremiumAccess(token);
      setPremiumAccess(response.premiumAccess);
    } catch {
      setPremiumAccess(false);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refreshPremium();
  }, [token]);

  const value = useMemo(() => ({
    premiumAccess,
    loading,
    refreshPremium
  }), [loading, premiumAccess]);

  return (
    <PremiumContext.Provider value={value}>
      {children}
    </PremiumContext.Provider>
  );
}

export function usePremium() {
  const context = useContext(PremiumContext);
  if (!context) {
    throw new Error('usePremium must be used inside PremiumProvider');
  }
  return context;
}

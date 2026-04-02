/**
 * useABTest — React hook for A/B test variant assignment + conversion tracking
 *
 * Usage:
 *   const { variant, trackConversion } = useABTest('hero_cta')
 */
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useKidsMode } from '../context/KidsModeContext';
import { useRealTime } from '../context/RealTimeContext';
import { getVariant, AB_TESTS } from '../lib/abtest';

const API = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3001' : '/api');

export function useABTest(testId) {
  const { user } = useAuth();
  const { kidsMode } = useKidsMode();
  const { serverUp } = useRealTime();
  const [variant, setVariant] = useState('control');

  useEffect(() => {
    const v = getVariant(testId, { userId: user?.id, kidsMode });
    setVariant(v);

    // Only record impression when backend is reachable
    if (!serverUp) return;
    fetch(`${API}/api/abtest/impression`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testId, variantId: v, userId: user?.id || null }),
    }).catch(() => {});
  }, [testId, user?.id, kidsMode, serverUp]);

  const trackConversion = useCallback(
    (goal = 'click') => {
      if (!serverUp) return;
      fetch(`${API}/api/abtest/conversion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testId, variantId: variant, userId: user?.id || null, goal }),
      }).catch(() => {});
    },
    [testId, variant, user?.id, serverUp]
  );

  const test = AB_TESTS[testId];
  const variantDef = test?.variants.find((v) => v.id === variant);

  return { variant, label: variantDef?.label || '', trackConversion };
}

/**
 * src/lib/featureFlags.js
 * Simple feature flag system for early access / beta features.
 *
 * Family plan users get early access to features listed in EARLY_ACCESS_FLAGS.
 * Usage:
 *   import { useFeatureFlag } from '../lib/featureFlags';
 *   const canAccess = useFeatureFlag('bible_ai_coach');
 */

import { useAds } from '../context/AdsContext';

// Features currently in early access (Family plan only until GA)
export const EARLY_ACCESS_FLAGS = {
  bible_ai_coach:       { label: 'Bible AI Coach',        desc: 'Personalized AI-powered Bible study coach', ga: false },
  family_challenges:    { label: 'Family Challenges',     desc: 'Weekly faith challenges for the whole family', ga: false },
  voice_prayer:         { label: 'Voice Prayer Mode',     desc: 'Speak your prayers aloud with AI transcription', ga: false },
  bible_memory_league:  { label: 'Memory League Season 2', desc: 'Competitive scripture memory with seasons', ga: false },
};

/**
 * Hook — returns true if the current user can access the given feature flag.
 * Family users: always yes.
 * Pro users: only if the flag is marked ga:true (generally available).
 * Free users: never.
 */
export function useFeatureFlag(flagId) {
  const { isFamilyUser, isProUser } = useAds();
  const flag = EARLY_ACCESS_FLAGS[flagId];
  if (!flag) return true; // unknown flag = unrestricted
  if (isFamilyUser) return true;
  if (isProUser && flag.ga) return true;
  return false;
}

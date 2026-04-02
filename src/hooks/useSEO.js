import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { setPageMeta, PAGE_META } from '../lib/seo';

const ROUTE_MAP = {
  '/': PAGE_META.home,
  '/play': PAGE_META.play,
  '/explore': PAGE_META.explore,
  '/ai': PAGE_META.ai,
  '/grow': PAGE_META.grow,
  '/community': PAGE_META.community,
  '/parents': PAGE_META.parents,
  '/bible': PAGE_META.bible,
  '/explore/bible': PAGE_META.bible,
  '/play/trivia': PAGE_META.trivia,
  '/trivia': PAGE_META.trivia,
  '/podcast': PAGE_META.podcast,
  '/community/leaderboard': PAGE_META.leaderboard,
  '/leaderboard': PAGE_META.leaderboard,
};

/**
 * Auto-sets page meta based on current route.
 * Call in App.jsx or individual pages.
 * @param {object} [override] - Optional meta override for specific pages
 */
export function useSEO(override = null) {
  const location = useLocation();

  useEffect(() => {
    if (override) {
      setPageMeta(override);
      return;
    }

    // Find best matching route
    const path = location.pathname;
    let meta = ROUTE_MAP[path];

    // Try prefix match for nested routes
    if (!meta) {
      const prefix = Object.keys(ROUTE_MAP)
        .filter((k) => path.startsWith(k) && k !== '/')
        .sort((a, b) => b.length - a.length)[0];
      if (prefix) meta = ROUTE_MAP[prefix];
    }

    if (meta) setPageMeta({ ...meta, url: window.location.href });
  }, [location.pathname, override]);
}

export default useSEO;

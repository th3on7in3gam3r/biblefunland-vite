const CACHE_PREFIX = 'bfl_cache:';

function now() {
  return Date.now();
}

function makeKey(key) {
  return `${CACHE_PREFIX}${key}`;
}

export function getCache(key) {
  try {
    const raw = localStorage.getItem(makeKey(key));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.expires && parsed.expires < now()) {
      localStorage.removeItem(makeKey(key));
      return null;
    }
    return parsed.value;
  } catch (error) {
    console.warn('[cache] getCache failed', key, error);
    return null;
  }
}

export function setCache(key, value, ttlMillis = 1000 * 60 * 60 * 6) {
  try {
    const payload = { value, expires: now() + ttlMillis };
    localStorage.setItem(makeKey(key), JSON.stringify(payload));
  } catch (error) {
    console.warn('[cache] setCache failed', key, error);
  }
}

export function clearCache(key) {
  try {
    localStorage.removeItem(makeKey(key));
  } catch (error) {
    console.warn('[cache] clearCache failed', key, error);
  }
}

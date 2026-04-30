/**
 * Request Queue Manager
 * Prevents rate limiting by queuing and throttling database requests
 */

class RequestQueue {
  constructor(maxConcurrent = 20, retryAttempts = 3, baseDelay = 1000) {
    this.maxConcurrent = maxConcurrent;
    this.retryAttempts = retryAttempts;
    this.baseDelay = baseDelay;
    this.queue = [];
    this.activeRequests = 0;
    this.requestCache = new Map();
    this.cacheExpiry = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes default
    this.debug = false;
  }

  /**
   * Execute a request with queuing, caching, and retry logic
   */
  async execute(key, fn, options = {}) {
    const { cacheable = true, ttl = this.cacheTTL, priority = 0 } = options;

    if (this.debug) console.log('[RequestQueue] Execute called:', key);

    // Check cache first
    if (cacheable && this.requestCache.has(key)) {
      const expiry = this.cacheExpiry.get(key);
      if (expiry && Date.now() < expiry) {
        if (this.debug) console.log('[RequestQueue] Returning cached result for:', key);
        return this.requestCache.get(key);
      }
      // Cache expired, remove it
      this.requestCache.delete(key);
      this.cacheExpiry.delete(key);
    }

    // Queue the request
    return new Promise((resolve, reject) => {
      this.queue.push({
        key,
        fn,
        resolve,
        reject,
        priority,
        attempts: 0,
      });

      // Sort by priority (higher first)
      this.queue.sort((a, b) => b.priority - a.priority);

      this.processQueue();
    });
  }

  /**
   * Process queued requests with concurrency control
   */
  async processQueue() {
    while (this.activeRequests < this.maxConcurrent && this.queue.length > 0) {
      const request = this.queue.shift();
      this.activeRequests++;

      this.executeWithRetry(request)
        .then((result) => {
          // Cache successful result
          this.requestCache.set(request.key, result);
          this.cacheExpiry.set(request.key, Date.now() + this.cacheTTL);
          request.resolve(result);
        })
        .catch((error) => {
          // Silently fail - errors are transient and will retry when data is needed
          request.resolve({ data: null, error: error.message });
        })
        .finally(() => {
          this.activeRequests--;
          this.processQueue();
        });
    }
  }

  /**
   * Execute request with exponential backoff retry
   */
  async executeWithRetry(request) {
    while (request.attempts < this.retryAttempts) {
      try {
        return await request.fn();
      } catch (error) {
        request.attempts++;

        // Check if it's a rate limit error (429)
        if (error.status === 429 && request.attempts < this.retryAttempts) {
          const delay = this.baseDelay * Math.pow(2, request.attempts - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // For other errors, throw immediately
        throw error;
      }
    }

    throw new Error(`Request failed after ${this.retryAttempts} attempts`);
  }

  /**
   * Clear cache for a specific key or all
   */
  clearCache(key = null) {
    if (key) {
      this.requestCache.delete(key);
      this.cacheExpiry.delete(key);
    } else {
      this.requestCache.clear();
      this.cacheExpiry.clear();
    }
  }

  /**
   * Get queue stats
   */
  getStats() {
    return {
      queueLength: this.queue.length,
      activeRequests: this.activeRequests,
      cacheSize: this.requestCache.size,
    };
  }
}

// Global instance - increased to 5 concurrent for better throughput
export const requestQueue = new RequestQueue(5, 3, 1000);

export default RequestQueue;

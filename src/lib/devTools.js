/**
 * Developer tools for offline testing and debugging
 * Provides console commands for simulating offline mode, inspecting cache, etc.
 */

import { getAllQueueEntries, getQueueStats } from './syncQueueManager';
import { getAllFromStore, STORES } from './indexedDB';

let offlineSimulation = false;

/**
 * Initialize developer tools
 * Attaches console commands to window object (development only)
 */
export function initializeDevTools() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }

  console.log('🛠️ Developer tools initialized. Available commands:');
  console.log('  - window.simulateOffline(true/false)');
  console.log('  - window.debugCache()');
  console.log('  - window.debugCacheMetadata()');
  console.log('  - window.debugStaticAssets()');
  console.log('  - window.debugCoreContent()');
  console.log('  - window.debugSyncQueue()');
  console.log('  - window.resetOfflineState()');
  console.log('  - window.triggerSync()');
  console.log('  - window.getCacheStatus()');

  // Simulate offline mode
  window.simulateOffline = function (simulate) {
    offlineSimulation = simulate;
    if (simulate) {
      console.log('📴 Offline mode simulated');
      // Override navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      // Dispatch offline event
      window.dispatchEvent(new Event('offline'));
    } else {
      console.log('🟢 Online mode restored');
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
      // Dispatch online event
      window.dispatchEvent(new Event('online'));
    }
  };

  // Debug cache contents
  window.debugCache = async function () {
    try {
      const cacheNames = await caches.keys();
      console.log('📦 Available caches:', cacheNames);

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        console.log(`\n📦 Cache: ${cacheName} (${requests.length} entries)`);
        requests.forEach((request, index) => {
          console.log(`  ${index + 1}. ${request.url}`);
        });
      }
    } catch (error) {
      console.error('❌ Error debugging cache:', error);
    }
  };

  // Debug cache metadata with TTL information
  window.debugCacheMetadata = async function () {
    try {
      const db = await new Promise((resolve, reject) => {
        const request = indexedDB.open('biblefunland-offline', 7);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
      });

      const transaction = db.transaction(['cache_metadata'], 'readonly');
      const store = transaction.objectStore('cache_metadata');
      const request = store.getAll();

      request.onerror = () => console.error('❌ Error reading metadata:', request.error);
      request.onsuccess = () => {
        const metadata = request.result;
        const now = Date.now();

        console.log(`📝 Cache Metadata (${metadata.length} entries):`);
        console.log('─'.repeat(80));

        metadata.forEach((entry, index) => {
          const timeRemaining = entry.expiresAt - now;
          const isExpired = timeRemaining < 0;
          const status = isExpired ? '⏳ EXPIRED' : '✅ VALID';
          const timeStr = isExpired
            ? `${Math.abs(Math.round(timeRemaining / 1000))}s ago`
            : `${Math.round(timeRemaining / 1000)}s remaining`;

          console.log(`\n${index + 1}. ${entry.url}`);
          console.log(`   Status: ${status} (${timeStr})`);
          console.log(`   Strategy: ${entry.strategy}`);
          console.log(`   TTL: ${(entry.ttl / 1000 / 60 / 60).toFixed(1)} hours`);
          console.log(`   Created: ${new Date(entry.createdAt).toLocaleString()}`);
          console.log(`   Expires: ${new Date(entry.expiresAt).toLocaleString()}`);
          console.log(`   Hits: ${entry.hitCount}`);
          console.log(`   Last Access: ${new Date(entry.lastAccessTime).toLocaleString()}`);
        });

        console.log('\n' + '─'.repeat(80));
        const validCount = metadata.filter((e) => e.expiresAt > now).length;
        console.log(`Summary: ${validCount}/${metadata.length} entries valid`);
      };
    } catch (error) {
      console.error('❌ Error debugging cache metadata:', error);
    }
  };

  // Debug static assets cache
  window.debugStaticAssets = async function () {
    try {
      const cache = await caches.open('biblefunland-static-v1');
      const requests = await cache.keys();
      const now = Date.now();

      console.log(`📦 Static Assets Cache (${requests.length} entries):`);
      console.log('─'.repeat(80));

      let totalSize = 0;
      let validCount = 0;
      let expiredCount = 0;

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const response = await cache.match(request);
        const blob = await response.blob();
        const size = blob.size;

        // Get metadata
        const db = await new Promise((resolve, reject) => {
          const dbRequest = indexedDB.open('biblefunland-offline', 7);
          dbRequest.onerror = () => reject(dbRequest.error);
          dbRequest.onsuccess = () => resolve(dbRequest.result);
        });

        const transaction = db.transaction(['cache_metadata'], 'readonly');
        const store = transaction.objectStore('cache_metadata');
        const metaRequest = store.get(request.url);

        const metadata = await new Promise((resolve) => {
          metaRequest.onsuccess = () => resolve(metaRequest.result);
        });

        const isExpired = metadata && metadata.expiresAt < now;
        const status = isExpired ? '⏳ EXPIRED' : '✅ VALID';
        const timeRemaining = metadata ? metadata.expiresAt - now : 0;
        const timeStr = isExpired
          ? `${Math.abs(Math.round(timeRemaining / 1000))}s ago`
          : `${Math.round(timeRemaining / 1000)}s remaining`;

        if (isExpired) expiredCount++;
        else validCount++;

        totalSize += size;

        console.log(`\n${i + 1}. ${request.url}`);
        console.log(`   Status: ${status} (${timeStr})`);
        console.log(`   Size: ${(size / 1024).toFixed(2)} KB`);
        if (metadata) {
          console.log(`   Hits: ${metadata.hitCount}`);
          console.log(`   Last Access: ${new Date(metadata.lastAccessTime).toLocaleString()}`);
        }
      }

      console.log('\n' + '─'.repeat(80));
      console.log(`Summary:`);
      console.log(`  Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Valid: ${validCount}/${requests.length}`);
      console.log(`  Expired: ${expiredCount}/${requests.length}`);
    } catch (error) {
      console.error('❌ Error debugging static assets:', error);
    }
  };

  // Debug core content cache
  window.debugCoreContent = async function () {
    try {
      const cache = await caches.open('biblefunland-kids-content-v1');
      const requests = await cache.keys();
      const now = Date.now();

      console.log(`📚 Core Content Cache (${requests.length} entries):`);
      console.log('─'.repeat(80));

      let totalSize = 0;
      let validCount = 0;
      let expiredCount = 0;

      for (let i = 0; i < requests.length; i++) {
        const request = requests[i];
        const response = await cache.match(request);
        const blob = await response.blob();
        const size = blob.size;

        // Get metadata
        const db = await new Promise((resolve, reject) => {
          const dbRequest = indexedDB.open('biblefunland-offline', 7);
          dbRequest.onerror = () => reject(dbRequest.error);
          dbRequest.onsuccess = () => resolve(dbRequest.result);
        });

        const transaction = db.transaction(['cache_metadata'], 'readonly');
        const store = transaction.objectStore('cache_metadata');
        const metaRequest = store.get(request.url);

        const metadata = await new Promise((resolve) => {
          metaRequest.onsuccess = () => resolve(metaRequest.result);
        });

        const isExpired = metadata && metadata.expiresAt < now;
        const status = isExpired ? '⏳ EXPIRED' : '✅ VALID';
        const timeRemaining = metadata ? metadata.expiresAt - now : 0;
        const timeStr = isExpired
          ? `${Math.abs(Math.round(timeRemaining / 1000))}s ago`
          : `${Math.round(timeRemaining / 1000)}s remaining`;

        if (isExpired) expiredCount++;
        else validCount++;

        totalSize += size;

        console.log(`\n${i + 1}. ${request.url}`);
        console.log(`   Status: ${status} (${timeStr})`);
        console.log(`   Size: ${(size / 1024).toFixed(2)} KB`);
        if (metadata) {
          console.log(`   Hits: ${metadata.hitCount}`);
          console.log(`   Last Access: ${new Date(metadata.lastAccessTime).toLocaleString()}`);
        }
      }

      console.log('\n' + '─'.repeat(80));
      console.log(`Summary:`);
      console.log(`  Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Valid: ${validCount}/${requests.length}`);
      console.log(`  Expired: ${expiredCount}/${requests.length}`);
      console.log(`  TTL: 7 days`);
    } catch (error) {
      console.error('❌ Error debugging core content:', error);
    }
  };

  // Debug sync queue
  window.debugSyncQueue = async function () {
    try {
      const entries = await getAllQueueEntries();
      const stats = await getQueueStats();

      console.log('📋 Sync Queue Statistics:', stats);
      console.log(`\n📋 Sync Queue Entries (${entries.length} total):`);

      entries.forEach((entry, index) => {
        console.log(`\n  ${index + 1}. ${entry.actionType} (${entry.status})`);
        console.log(`     ID: ${entry.id}`);
        console.log(`     User: ${entry.userId}`);
        console.log(`     Timestamp: ${new Date(entry.timestamp).toLocaleString()}`);
        console.log(`     Retries: ${entry.retryCount}/${5}`);
        if (entry.errorMessage) {
          console.log(`     Error: ${entry.errorMessage}`);
        }
      });
    } catch (error) {
      console.error('❌ Error debugging sync queue:', error);
    }
  };

  // Reset offline state
  window.resetOfflineState = async function () {
    try {
      const { clearAllOfflineData } = await import('./indexedDB');
      const { clearQueue } = await import('./syncQueueManager');

      await clearAllOfflineData();
      await clearQueue();

      // Clear all caches
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));

      console.log('✅ Offline state reset');
    } catch (error) {
      console.error('❌ Error resetting offline state:', error);
    }
  };

  // Manually trigger sync
  window.triggerSync = async function () {
    try {
      console.log('🔄 Triggering manual sync...');
      // This would need to be called from a component with access to OfflineContext
      console.log('⚠️ Manual sync requires component context. Use from a component instead.');
    } catch (error) {
      console.error('❌ Error triggering sync:', error);
    }
  };

  // Get cache status
  window.getCacheStatus = async function () {
    try {
      const cacheNames = await caches.keys();
      let totalSize = 0;
      let totalCount = 0;

      const cacheStatus = {};

      for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();
        let cacheSize = 0;

        for (const request of requests) {
          const response = await cache.match(request);
          if (response) {
            const blob = await response.blob();
            cacheSize += blob.size;
          }
        }

        cacheStatus[cacheName] = {
          size: cacheSize,
          count: requests.length,
          sizeInMB: (cacheSize / 1024 / 1024).toFixed(2),
        };

        totalSize += cacheSize;
        totalCount += requests.length;
      }

      console.log('📊 Cache Status:');
      console.log(`  Total Size: ${(totalSize / 1024 / 1024).toFixed(2)} MB`);
      console.log(`  Total Entries: ${totalCount}`);
      console.log('\n  By Cache:');
      Object.entries(cacheStatus).forEach(([name, status]) => {
        console.log(`    ${name}: ${status.sizeInMB} MB (${status.count} entries)`);
      });

      // Get sync queue stats
      const stats = await getQueueStats();
      console.log('\n  Sync Queue:');
      console.log(`    Total: ${stats.total}`);
      console.log(`    Pending: ${stats.pending}`);
      console.log(`    Failed: ${stats.failed}`);
      console.log(`    Syncing: ${stats.syncing}`);
    } catch (error) {
      console.error('❌ Error getting cache status:', error);
    }
  };

  // Log Service Worker status
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        console.log('✅ Service Worker is active');
        console.log(`   Scope: ${registration.scope}`);
      })
      .catch(() => {
        console.warn('⚠️ Service Worker not active');
      });
  }
}

/**
 * Log cache operations (called from Service Worker)
 * @param {string} operation - Operation type (put, match, delete)
 * @param {string} url - URL being cached
 * @param {string} cacheName - Cache name
 */
export function logCacheOperation(operation, url, cacheName) {
  if (process.env.NODE_ENV === 'development') {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`[${timestamp}] [SW] ${operation.toUpperCase()} ${url} (${cacheName})`);
  }
}

/**
 * Check if offline simulation is active
 * @returns {boolean} True if offline simulation is active
 */
export function isOfflineSimulated() {
  return offlineSimulation;
}

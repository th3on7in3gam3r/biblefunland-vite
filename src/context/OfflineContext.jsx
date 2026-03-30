import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from '@clerk/clerk-react';
import { getPendingActionCount, clearQueue, syncQueue } from '../lib/syncQueueManager';
import { clearAllOfflineData } from '../lib/indexedDB';

const OfflineContext = createContext();

/**
 * OfflineContext Provider - Manages offline state and sync queue operations
 * Provides connectivity status, sync queue operations, and cache management
 */
export function OfflineProvider({ children }) {
  const { userId } = useAuth();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [wasOffline, setWasOffline] = useState(false);
  const [syncQueueCount, setSyncQueueCount] = useState(0);
  const [syncInProgress, setSyncInProgress] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(null);

  // Update sync queue count
  const updateSyncQueueCount = useCallback(async () => {
    if (userId) {
      try {
        const count = await getPendingActionCount(userId);
        setSyncQueueCount(count);
      } catch (error) {
        console.error('❌ Error updating sync queue count:', error);
      }
    }
  }, [userId]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🟢 Back online');
      setIsOnline(true);
      setWasOffline(true);
      // Trigger sync when coming back online
      triggerSync();
    };

    const handleOffline = () => {
      console.log('🔴 Gone offline');
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update sync queue count when online status changes or userId changes
  useEffect(() => {
    updateSyncQueueCount();
  }, [isOnline, userId, updateSyncQueueCount]);

  // Trigger sync when coming back online
  const triggerSync = useCallback(async () => {
    if (!isOnline || !userId || syncInProgress) {
      return;
    }

    try {
      setSyncInProgress(true);
      console.log('🔄 Starting sync...');

      // Call the sync endpoint
      const response = await fetch('/api/sync-queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          actions: await getPendingActions(userId),
        }),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Sync completed:', result);
        setLastSyncTime(Date.now());
        await updateSyncQueueCount();
      } else {
        console.error('❌ Sync failed:', response.statusText);
      }
    } catch (error) {
      console.error('❌ Error during sync:', error);
    } finally {
      setSyncInProgress(false);
    }
  }, [isOnline, userId, syncInProgress]);

  // Get pending actions for sync
  const getPendingActions = useCallback(async (uid) => {
    try {
      const { getPendingActions: getPending } = await import('../lib/syncQueueManager');
      const actions = await getPending(uid);
      return actions;
    } catch (error) {
      console.error('❌ Error getting pending actions:', error);
      return [];
    }
  }, []);

  // Clear all offline data
  const clearOfflineData = useCallback(async () => {
    try {
      await clearAllOfflineData();
      await clearQueue();
      setSyncQueueCount(0);
      console.log('✅ Offline data cleared');
    } catch (error) {
      console.error('❌ Error clearing offline data:', error);
      throw error;
    }
  }, []);

  const value = {
    isOnline,
    wasOffline,
    syncQueueCount,
    syncInProgress,
    lastSyncTime,
    clearOfflineData,
    triggerSync,
    updateSyncQueueCount,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
}

/**
 * Hook to use OfflineContext
 * @returns {Object} Offline context value
 */
export function useOffline() {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within OfflineProvider');
  }
  return context;
}

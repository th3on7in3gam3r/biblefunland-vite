/**
 * Sync Queue Manager - Manages offline action queue in IndexedDB
 * Handles adding, retrieving, updating, and syncing offline actions
 */

import {
  getDB,
  addToStore,
  updateInStore,
  deleteFromStore,
  getFromStore,
  getAllFromStore,
  getFromStoreByIndex,
  STORES,
} from './indexedDB';
import { encryptSyncQueueEntry, decryptSyncQueueEntry, deriveEncryptionKey } from './encryption';

const MAX_RETRIES = 5;
const RETRY_DELAY = 30000; // 30 seconds

/**
 * Generate a simple UUID v4
 * @returns {string} UUID string
 */
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Add an action to the sync queue
 * @param {string} userId - User ID
 * @param {string} actionType - Type of action (prayer, note, progress, quiz_result)
 * @param {Object} payload - Action payload
 * @returns {Promise<string>} Queue entry ID
 */
export async function addToQueue(userId, actionType, payload) {
  try {
    const queueEntry = {
      id: generateUUID(),
      userId,
      actionType,
      timestamp: Date.now(),
      payload,
      status: 'pending',
      retryCount: 0,
      lastRetryTime: null,
      errorMessage: null,
      encrypted: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // Encrypt the payload
    const encryptionKey = await deriveEncryptionKey(userId);
    const encryptedEntry = await encryptSyncQueueEntry(queueEntry, encryptionKey);

    // Add to IndexedDB
    const id = await addToStore(STORES.SYNC_QUEUE, encryptedEntry);
    console.log(`✅ Action added to sync queue: ${actionType} (${id})`);

    return id;
  } catch (error) {
    console.error('❌ Error adding to sync queue:', error);
    throw error;
  }
}

/**
 * Get all pending actions from the sync queue
 * @param {string} userId - User ID (optional, if provided filters by user)
 * @returns {Promise<Array>} Array of pending queue entries
 */
export async function getPendingActions(userId = null) {
  try {
    let actions = await getFromStoreByIndex(STORES.SYNC_QUEUE, 'status', 'pending');

    if (userId) {
      actions = actions.filter((action) => action.userId === userId);
    }

    // Decrypt payloads
    const decryptedActions = await Promise.all(
      actions.map(async (action) => {
        try {
          const encryptionKey = await deriveEncryptionKey(action.userId);
          return await decryptSyncQueueEntry(action, encryptionKey);
        } catch (error) {
          console.error('❌ Error decrypting action:', error);
          return action;
        }
      })
    );

    return decryptedActions;
  } catch (error) {
    console.error('❌ Error getting pending actions:', error);
    throw error;
  }
}

/**
 * Get all failed actions from the sync queue
 * @param {string} userId - User ID (optional)
 * @returns {Promise<Array>} Array of failed queue entries
 */
export async function getFailedActions(userId = null) {
  try {
    let actions = await getFromStoreByIndex(STORES.SYNC_QUEUE, 'status', 'failed');

    if (userId) {
      actions = actions.filter((action) => action.userId === userId);
    }

    // Decrypt payloads
    const decryptedActions = await Promise.all(
      actions.map(async (action) => {
        try {
          const encryptionKey = await deriveEncryptionKey(action.userId);
          return await decryptSyncQueueEntry(action, encryptionKey);
        } catch (error) {
          console.error('❌ Error decrypting action:', error);
          return action;
        }
      })
    );

    return decryptedActions;
  } catch (error) {
    console.error('❌ Error getting failed actions:', error);
    throw error;
  }
}

/**
 * Get all actions from the sync queue
 * @returns {Promise<Array>} Array of all queue entries
 */
export async function getAllQueueEntries() {
  try {
    const entries = await getAllFromStore(STORES.SYNC_QUEUE);

    // Decrypt payloads
    const decryptedEntries = await Promise.all(
      entries.map(async (entry) => {
        try {
          const encryptionKey = await deriveEncryptionKey(entry.userId);
          return await decryptSyncQueueEntry(entry, encryptionKey);
        } catch (error) {
          console.error('❌ Error decrypting entry:', error);
          return entry;
        }
      })
    );

    return decryptedEntries;
  } catch (error) {
    console.error('❌ Error getting all queue entries:', error);
    throw error;
  }
}

/**
 * Update a queue entry status
 * @param {string} queueId - Queue entry ID
 * @param {string} status - New status (pending, syncing, failed, completed)
 * @param {string} errorMessage - Error message (optional)
 * @returns {Promise<void>}
 */
export async function updateQueueEntryStatus(queueId, status, errorMessage = null) {
  try {
    const entry = await getFromStore(STORES.SYNC_QUEUE, queueId);
    if (!entry) {
      throw new Error(`Queue entry not found: ${queueId}`);
    }

    const updatedEntry = {
      ...entry,
      status,
      errorMessage,
      updatedAt: Date.now(),
    };

    if (status === 'failed') {
      updatedEntry.retryCount = (entry.retryCount || 0) + 1;
      updatedEntry.lastRetryTime = Date.now();
    }

    await updateInStore(STORES.SYNC_QUEUE, updatedEntry);
    console.log(`✅ Queue entry updated: ${queueId} -> ${status}`);
  } catch (error) {
    console.error('❌ Error updating queue entry status:', error);
    throw error;
  }
}

/**
 * Remove a queue entry
 * @param {string} queueId - Queue entry ID
 * @returns {Promise<void>}
 */
export async function removeFromQueue(queueId) {
  try {
    await deleteFromStore(STORES.SYNC_QUEUE, queueId);
    console.log(`✅ Queue entry removed: ${queueId}`);
  } catch (error) {
    console.error('❌ Error removing from queue:', error);
    throw error;
  }
}

/**
 * Clear all queue entries
 * @returns {Promise<void>}
 */
export async function clearQueue() {
  try {
    const entries = await getAllFromStore(STORES.SYNC_QUEUE);
    await Promise.all(entries.map((entry) => removeFromQueue(entry.id)));
    console.log('✅ Sync queue cleared');
  } catch (error) {
    console.error('❌ Error clearing queue:', error);
    throw error;
  }
}

/**
 * Get count of pending actions
 * @param {string} userId - User ID (optional)
 * @returns {Promise<number>} Count of pending actions
 */
export async function getPendingActionCount(userId = null) {
  try {
    const actions = await getPendingActions(userId);
    return actions.length;
  } catch (error) {
    console.error('❌ Error getting pending action count:', error);
    return 0;
  }
}

/**
 * Sync queue entries to server
 * @param {string} userId - User ID
 * @param {Function} syncEndpoint - Function to call server sync endpoint
 * @returns {Promise<Object>} Sync result with synced and failed actions
 */
export async function syncQueue(userId, syncEndpoint) {
  try {
    const pendingActions = await getPendingActions(userId);

    if (pendingActions.length === 0) {
      console.log('✅ No pending actions to sync');
      return { synced: [], failed: [] };
    }

    console.log(`🔄 Syncing ${pendingActions.length} pending actions...`);

    // Update all to syncing status
    await Promise.all(pendingActions.map((action) => updateQueueEntryStatus(action.id, 'syncing')));

    // Call sync endpoint
    const result = await syncEndpoint(pendingActions);

    // Process results
    const synced = [];
    const failed = [];

    for (const action of result.synced || []) {
      await removeFromQueue(action.id);
      synced.push(action);
    }

    for (const action of result.failed || []) {
      const entry = await getFromStore(STORES.SYNC_QUEUE, action.id);

      if (entry.retryCount >= MAX_RETRIES) {
        await updateQueueEntryStatus(action.id, 'failed', action.error);
      } else {
        await updateQueueEntryStatus(action.id, 'pending', action.error);
        // Schedule retry
        scheduleRetry(action.id, userId, syncEndpoint);
      }

      failed.push(action);
    }

    console.log(`✅ Sync complete: ${synced.length} synced, ${failed.length} failed`);
    return { synced, failed };
  } catch (error) {
    console.error('❌ Error syncing queue:', error);
    throw error;
  }
}

/**
 * Schedule a retry for a failed action
 * @param {string} queueId - Queue entry ID
 * @param {string} userId - User ID
 * @param {Function} syncEndpoint - Sync endpoint function
 */
function scheduleRetry(queueId, userId, syncEndpoint) {
  setTimeout(async () => {
    try {
      const entry = await getFromStore(STORES.SYNC_QUEUE, queueId);
      if (entry && entry.status === 'pending' && entry.retryCount < MAX_RETRIES) {
        console.log(`🔄 Retrying action: ${queueId}`);
        await syncQueue(userId, syncEndpoint);
      }
    } catch (error) {
      console.error('❌ Error during retry:', error);
    }
  }, RETRY_DELAY);
}

/**
 * Get queue statistics
 * @returns {Promise<Object>} Queue statistics
 */
export async function getQueueStats() {
  try {
    const allEntries = await getAllFromStore(STORES.SYNC_QUEUE);
    const pending = allEntries.filter((e) => e.status === 'pending').length;
    const failed = allEntries.filter((e) => e.status === 'failed').length;
    const syncing = allEntries.filter((e) => e.status === 'syncing').length;

    return {
      total: allEntries.length,
      pending,
      failed,
      syncing,
      completed: allEntries.filter((e) => e.status === 'completed').length,
    };
  } catch (error) {
    console.error('❌ Error getting queue stats:', error);
    return { total: 0, pending: 0, failed: 0, syncing: 0, completed: 0 };
  }
}

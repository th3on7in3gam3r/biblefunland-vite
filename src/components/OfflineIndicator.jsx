import React, { useState, useEffect } from 'react';
import { useOffline } from '../context/OfflineContext';
import styles from './OfflineIndicator.module.css';

/**
 * OfflineIndicator Component - Displays offline status and sync queue information
 * Shows banner when offline with sync queue count and "Learn More" link
 */
export default function OfflineIndicator() {
  const { isOnline, syncQueueCount, syncInProgress } = useOffline();
  const [showBanner, setShowBanner] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);

  // Show/hide banner based on online status
  useEffect(() => {
    if (!isOnline) {
      setShowBanner(true);
      setFadeOut(false);
    } else if (showBanner) {
      // Fade out when coming back online
      setFadeOut(true);
      const timer = setTimeout(() => {
        setShowBanner(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, showBanner]);

  if (!showBanner) {
    return null;
  }

  return (
    <div className={`${styles.banner} ${fadeOut ? styles.fadeOut : ''}`}>
      <div className={styles.content}>
        <div className={styles.left}>
          <span className={styles.icon}>📴</span>
          <div className={styles.text}>
            <p className={styles.title}>You're offline</p>
            <p className={styles.subtitle}>Some features may be limited</p>
          </div>
        </div>

        <div className={styles.right}>
          {syncQueueCount > 0 && (
            <div className={styles.syncStatus}>
              {syncInProgress ? (
                <>
                  <span className={styles.spinner}></span>
                  <span>Syncing...</span>
                </>
              ) : (
                <>
                  <span className={styles.badge}>{syncQueueCount}</span>
                  <span>action{syncQueueCount !== 1 ? 's' : ''} pending</span>
                </>
              )}
            </div>
          )}

          <a href="/offline-help" className={styles.learnMore}>
            Learn More
          </a>
        </div>
      </div>
    </div>
  );
}

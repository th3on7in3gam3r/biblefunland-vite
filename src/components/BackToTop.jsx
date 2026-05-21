import { useState, useEffect, useCallback } from 'react';
import styles from './BackToTop.module.css';

const SCROLL_THRESHOLD = 400;
const BOTTOM_OFFSET = 120;

export default function BackToTop() {
  const [visible, setVisible] = useState(false);

  const updateVisibility = useCallback(() => {
    const { scrollY, innerHeight } = window;
    const docHeight = document.documentElement.scrollHeight;
    const canScroll = docHeight > innerHeight + 80;
    const nearBottom = scrollY + innerHeight >= docHeight - BOTTOM_OFFSET;
    const scrolledDown = scrollY > SCROLL_THRESHOLD;

    setVisible(canScroll && (nearBottom || scrolledDown));
  }, []);

  useEffect(() => {
    updateVisibility();
    window.addEventListener('scroll', updateVisibility, { passive: true });
    window.addEventListener('resize', updateVisibility, { passive: true });
    return () => {
      window.removeEventListener('scroll', updateVisibility);
      window.removeEventListener('resize', updateVisibility);
    };
  }, [updateVisibility]);

  function scrollToTop() {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }

  return (
    <button
      type="button"
      className={`${styles.btn} ${visible ? styles.visible : ''}`}
      onClick={scrollToTop}
      aria-label="Back to top"
      title="Back to top"
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
    >
      <span className={styles.icon} aria-hidden="true">
        ↑
      </span>
    </button>
  );
}

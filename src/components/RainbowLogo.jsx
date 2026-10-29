import styles from './RainbowLogo.module.css';

// "BibleFunLand" wordmark with a small rainbow over the "i".
export default function RainbowLogo({ size = 'md', className = '' }) {
  return (
    <span className={`${styles.logo} ${styles[size] || ''} ${className}`}>
      <span>B</span>
      <span className={styles.iWrap}>
        <span className={styles.rainbow} aria-hidden="true">
          <span className={styles.arcOuter} />
          <span className={styles.arcMid} />
          <span className={styles.arcInner} />
        </span>
        i
      </span>
      <span>ble</span>
      <span className={styles.fun}>Fun</span>
      <span>Land</span>
    </span>
  );
}

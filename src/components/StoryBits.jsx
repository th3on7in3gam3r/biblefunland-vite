import StoryIcon from './StoryIcon';
import styles from '../pages/Home.module.css';

// Shared storybook building blocks (icon chip, heading sparkles).
export function Chip({ icon, tone, size = 'md', filled }) {
  return (
    <span className={`${styles.chip} ${styles[`chip_${tone}`]} ${styles[`chip_${size}`]}`}>
      <StoryIcon name={icon} filled={filled} />
    </span>
  );
}

export function Sparkles() {
  return (
    <>
      <StoryIcon name="star" filled className={`${styles.sparkle} ${styles.sparkleLeft}`} />
      <StoryIcon name="star" filled className={`${styles.sparkle} ${styles.sparkleRight}`} />
    </>
  );
}

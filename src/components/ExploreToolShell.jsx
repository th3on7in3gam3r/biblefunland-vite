import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import styles from './ExploreToolShell.module.css';

export default function ExploreToolShell({
  icon,
  title,
  subtitle,
  gradient = 'linear-gradient(135deg,#064E3B,#065F46,#1E1B4B)',
  children,
  maxWidth = 1100,
}) {
  return (
    <div className={styles.shell}>
      <header className={styles.hero} style={{ background: gradient }}>
        <div className={styles.heroInner} style={{ maxWidth }}>
          <Link to="/explore" className={styles.back}>
            ← Explore Hub
          </Link>
          <div className={styles.titleRow}>
            {icon && <span className={styles.icon}>{icon}</span>}
            <div>
              <h1 className={styles.title}>{title}</h1>
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
        </div>
      </header>
      <div className={styles.content} style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}

ExploreToolShell.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  gradient: PropTypes.string,
  children: PropTypes.node,
  maxWidth: PropTypes.number,
};

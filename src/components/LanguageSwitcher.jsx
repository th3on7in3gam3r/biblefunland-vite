import { useState } from 'react';
import { useLanguage, LANGUAGES } from '../i18n/LanguageContext';
import styles from './LanguageSwitcher.module.css';

export default function LanguageSwitcher() {
  const { lang, changeLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const current = LANGUAGES.find((l) => l.code === lang) || LANGUAGES[0];

  return (
    <div className={styles.wrap}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        title="Change language"
        aria-label="Change language"
      >
        <span>{current.flag}</span>
        <span className={styles.code}>{current.code.toUpperCase()}</span>
        <span className={`${styles.arrow} ${open ? styles.arrowOpen : ''}`}>▾</span>
      </button>

      {open && (
        <>
          <div className={styles.backdrop} onClick={() => setOpen(false)} />
          <div className={styles.dropdown}>
            {LANGUAGES.map((l) => (
              <button
                key={l.code}
                className={`${styles.option} ${l.code === lang ? styles.active : ''}`}
                onClick={() => {
                  changeLanguage(l.code);
                  setOpen(false);
                }}
              >
                <span className={styles.flag}>{l.flag}</span>
                <span className={styles.label}>{l.label}</span>
                {l.code === lang && <span className={styles.check}>✓</span>}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

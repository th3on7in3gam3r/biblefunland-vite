import { useState, useEffect } from 'react'
import { useBedtimeMode } from '../context/BedtimeModeContext'
import { useAuth } from '../context/AuthContext'
import styles from './BedtimeSettings.module.css'

export default function BedtimeSettings() {
  const { bedtimeSettings, updateBedtimeSettings, isBedtime } = useBedtimeMode()
  const { user } = useAuth()
  const [localSettings, setLocalSettings] = useState(bedtimeSettings)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setLocalSettings(bedtimeSettings)
  }, [bedtimeSettings])

  const handleChange = (key, value) => {
    setLocalSettings(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = () => {
    updateBedtimeSettings(localSettings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleReset = () => {
    const defaults = {
      enabled: false,
      bedtime: '20:00',
      wakeTime: '07:00',
      autoEnable: true,
      calmContent: true,
      dimUI: true,
      quietSounds: true,
      showBedtimeStory: true,
    }
    setLocalSettings(defaults)
    updateBedtimeSettings(defaults)
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.card}>
          <h1 className={styles.title}>🌙 Bedtime Settings</h1>
          <p className={styles.subtitle}>Please sign in to customize your bedtime experience.</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🌙 Bedtime Settings</h1>
          <p className={styles.subtitle}>
            Customize your sleep and focus mode for peaceful devotionals
          </p>
        </div>
        {isBedtime && (
          <div className={styles.badge}>
            <span className={styles.badgeIcon}>🌙</span>
            <span>Bedtime Active</span>
          </div>
        )}
      </div>

      <div className={styles.grid}>
        {/* Schedule Settings */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>⏰ Schedule</h2>
          <p className={styles.cardDesc}>Set when bedtime mode should automatically activate</p>

          <div className={styles.setting}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.enabled}
                onChange={e => handleChange('enabled', e.target.checked)}
              />
              <span className={styles.toggleSlider} />
              <span className={styles.toggleLabel}>Enable Bedtime Mode</span>
            </label>
          </div>

          <div className={styles.setting}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.autoEnable}
                onChange={e => handleChange('autoEnable', e.target.checked)}
                disabled={!localSettings.enabled}
              />
              <span className={styles.toggleSlider} />
              <span className={styles.toggleLabel}>Auto-enable by schedule</span>
            </label>
          </div>

          <div className={styles.timeInputs}>
            <div className={styles.timeGroup}>
              <label className={styles.timeLabel}>Bedtime</label>
              <input
                type="time"
                value={localSettings.bedtime}
                onChange={e => handleChange('bedtime', e.target.value)}
                disabled={!localSettings.enabled || !localSettings.autoEnable}
                className={styles.timeInput}
              />
            </div>
            <div className={styles.timeGroup}>
              <label className={styles.timeLabel}>Wake Time</label>
              <input
                type="time"
                value={localSettings.wakeTime}
                onChange={e => handleChange('wakeTime', e.target.value)}
                disabled={!localSettings.enabled || !localSettings.autoEnable}
                className={styles.timeInput}
              />
            </div>
          </div>
        </div>

        {/* Visual Settings */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>🎨 Visual Experience</h2>
          <p className={styles.cardDesc}>Adjust how the app looks during bedtime</p>

          <div className={styles.setting}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.dimUI}
                onChange={e => handleChange('dimUI', e.target.checked)}
              />
              <span className={styles.toggleSlider} />
              <span className={styles.toggleLabel}>Dim UI (70% brightness)</span>
            </label>
          </div>

          <div className={styles.setting}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.calmContent}
                onChange={e => handleChange('calmContent', e.target.checked)}
              />
              <span className={styles.toggleSlider} />
              <span className={styles.toggleLabel}>Calm color palette</span>
            </label>
          </div>
        </div>

        {/* Content Settings */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>📖 Content</h2>
          <p className={styles.cardDesc}>Choose what appears in sleep mode</p>

          <div className={styles.setting}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.showBedtimeStory}
                onChange={e => handleChange('showBedtimeStory', e.target.checked)}
              />
              <span className={styles.toggleSlider} />
              <span className={styles.toggleLabel}>Show bedtime stories</span>
            </label>
          </div>

          <div className={styles.setting}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                checked={localSettings.quietSounds}
                onChange={e => handleChange('quietSounds', e.target.checked)}
              />
              <span className={styles.toggleSlider} />
              <span className={styles.toggleLabel}>Enable ambient sounds</span>
            </label>
          </div>
        </div>

        {/* Preview */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>👁️ Preview</h2>
          <p className={styles.cardDesc}>See how your settings will look</p>

          <div className={styles.preview}>
            <div className={styles.previewScreen}>
              <div className={styles.previewContent}>
                <div className={styles.previewIcon}>🌙</div>
                <div className={styles.previewText}>
                  "In peace I will lie down and sleep"
                </div>
                <div className={styles.previewRef}>Psalm 4:8</div>
              </div>
            </div>
            <div className={styles.previewInfo}>
              <div className={styles.previewInfoItem}>
                <span className={styles.previewInfoLabel}>Brightness:</span>
                <span className={styles.previewInfoValue}>
                  {localSettings.dimUI ? '70%' : '100%'}
                </span>
              </div>
              <div className={styles.previewInfoItem}>
                <span className={styles.previewInfoLabel}>Color Mode:</span>
                <span className={styles.previewInfoValue}>
                  {localSettings.calmContent ? 'Calm' : 'Normal'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button onClick={handleReset} className={styles.btnSecondary}>
          Reset to Defaults
        </button>
        <button onClick={handleSave} className={styles.btnPrimary}>
          {saved ? '✓ Saved!' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

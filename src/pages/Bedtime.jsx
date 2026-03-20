import { useState, useEffect } from 'react'
import { useBedtimeMode } from '../context/BedtimeModeContext'
import styles from './Bedtime.module.css'

export default function Bedtime() {
  const { 
    bedtimeMode, 
    bedtimeSettings, 
    isBedtime, 
    toggleBedtimeMode, 
    updateBedtimeSettings, 
    getBedtimeStory, 
    getCalmingActivities 
  } = useBedtimeMode()
  
  const [activeTab, setActiveTab] = useState('story')
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [showSettings, setShowSettings] = useState(false)
  
  const bedtimeStory = getBedtimeStory()
  const calmingActivities = getCalmingActivities()
  
  useEffect(() => {
    // Auto-enable bedtime mode if it's bedtime time
    if (isBedtime && !bedtimeMode) {
      toggleBedtimeMode()
    }
  }, [isBedtime, bedtimeMode, toggleBedtimeMode])

  const formatTime = (time) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleActivityStart = (activity) => {
    setSelectedActivity(activity)
    setActiveTab('activity')
  }

  const handleSettingsSave = (newSettings) => {
    updateBedtimeSettings(newSettings)
    setShowSettings(false)
  }

  return (
    <div className={`${styles.bedtimeContainer} ${bedtimeMode ? styles.bedtimeActive : ''}`}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>
            <span className={styles.moonIcon}>🌙</span>
            Bedtime Mode
          </h1>
          <p className={styles.subtitle}>
            {bedtimeMode ? 'Sweet dreams and peaceful rest' : 'Prepare for a peaceful night'}
          </p>
        </div>
        
        {/* Status Toggle */}
        <div className={styles.statusSection}>
          <div className={`${styles.statusBadge} ${isBedtime ? styles.active : ''}`}>
            <span className={styles.statusDot}></span>
            {isBedtime ? 'Bedtime Time' : 'Not Bedtime Yet'}
          </div>
          <button 
            className={`${styles.toggleButton} ${bedtimeMode ? styles.active : ''}`}
            onClick={toggleBedtimeMode}
          >
            {bedtimeMode ? '🌙 On' : '🌙 Off'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Tab Navigation */}
        <div className={styles.tabNavigation}>
          <button
            className={`${styles.tabButton} ${activeTab === 'story' ? styles.active : ''}`}
            onClick={() => setActiveTab('story')}
          >
            📖 Bedtime Story
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'activities' ? styles.active : ''}`}
            onClick={() => setActiveTab('activities')}
          >
            🎯 Calming Activities
          </button>
          <button
            className={`${styles.tabButton} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            ⚙️ Settings
          </button>
        </div>

        {/* Tab Content */}
        <div className={styles.tabContent}>
          {/* Story Tab */}
          {activeTab === 'story' && (
            <div className={styles.storySection}>
              <div className={styles.storyCard}>
                <div className={styles.storyHeader}>
                  <h2 className={styles.storyTitle}>{bedtimeStory.title}</h2>
                  <p className={styles.storyVerse}>{bedtimeStory.verse}</p>
                </div>
                
                <div className={styles.storyContent}>
                  <p className={styles.storyText}>{bedtimeStory.content}</p>
                  
                  <div className={styles.storyMoral}>
                    <h3>Moral of the Story</h3>
                    <p>{bedtimeStory.moral}</p>
                  </div>
                  
                  <div className={styles.storyPrayer}>
                    <h3>Bedtime Prayer</h3>
                    <p className={styles.prayerText}>"{bedtimeStory.prayer}"</p>
                    <button className={styles.prayerButton}>
                      🙏 Say Prayer Together
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <div className={styles.activitiesSection}>
              <div className={styles.activitiesGrid}>
                {calmingActivities.map((activity) => (
                  <div 
                    key={activity.id}
                    className={styles.activityCard}
                    onClick={() => handleActivityStart(activity)}
                  >
                    <div className={styles.activityIcon}>{activity.icon}</div>
                    <h3 className={styles.activityTitle}>{activity.title}</h3>
                    <p className={styles.activityDuration}>{activity.duration}</p>
                    <div className={styles.activityType}>{activity.type}</div>
                  </div>
                ))}
              </div>
              
              {selectedActivity && (
                <div className={styles.activeActivity}>
                  <div className={styles.activityHeader}>
                    <span className={styles.activityIconLarge}>{selectedActivity.icon}</span>
                    <div>
                      <h3>{selectedActivity.title}</h3>
                      <p>{selectedActivity.duration}</p>
                    </div>
                    <button 
                      className={styles.closeButton}
                      onClick={() => setSelectedActivity(null)}
                    >
                      ✕
                    </button>
                  </div>
                  
                  <div className={styles.activityContent}>
                    {selectedActivity.type === 'prayer' && (
                      <div className={styles.prayerContent}>
                        <p>Let's bow our heads and talk to God...</p>
                        <div className={styles.prayerSteps}>
                          <div className={styles.prayerStep}>
                            <span>1</span>
                            <p>Thank God for your day</p>
                          </div>
                          <div className={styles.prayerStep}>
                            <span>2</span>
                            <p>Ask for forgiveness for any mistakes</p>
                          </div>
                          <div className={styles.prayerStep}>
                            <span>3</span>
                            <p>Pray for family and friends</p>
                          </div>
                          <div className={styles.prayerStep}>
                            <span>4</span>
                            <p>Ask God for peaceful sleep</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedActivity.type === 'reflection' && (
                      <div className={styles.reflectionContent}>
                        <p>What are you thankful for today?</p>
                        <div className={styles.gratitudeList}>
                          <div className={styles.gratitudeItem}>
                            <span>👨‍👩‍👧‍👦</span>
                            <p>Family</p>
                          </div>
                          <div className={styles.gratitudeItem}>
                            <span>🏠</span>
                            <p>Home</p>
                          </div>
                          <div className={styles.gratitudeItem}>
                            <span>🍎</span>
                            <p>Food</p>
                          </div>
                          <div className={styles.gratitudeItem}>
                            <span>❤️</span>
                            <p>God's love</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedActivity.type === 'music' && (
                      <div className={styles.musicContent}>
                        <p>Listen to peaceful worship music</p>
                        <div className={styles.musicPlayer}>
                          <div className={styles.musicControls}>
                            <button className={styles.playButton}>▶️</button>
                            <div className={styles.musicInfo}>
                              <p>Peaceful Worship</p>
                              <p>Calming instrumental music</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedActivity.type === 'story' && (
                      <div className={styles.storyContent}>
                        <p>Read another Bible story</p>
                        <div className={styles.storyOptions}>
                          <button className={styles.storyOption}>
                            🦁 Daniel and the Lions
                          </button>
                          <button className={styles.storyOption}>
                            🐑 Noah's Ark
                          </button>
                          <button className={styles.storyOption}>
                            👶 Baby Moses
                          </button>
                        </div>
                      </div>
                    )}
                    
                    {selectedActivity.type === 'meditation' && (
                      <div className={styles.meditationContent}>
                        <p>Let's practice peaceful breathing</p>
                        <div className={styles.breathingExercise}>
                          <div className={styles.breathingCircle}></div>
                          <p className={styles.breathingInstruction}>
                            Breathe in... and out slowly
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className={styles.settingsSection}>
              <div className={styles.settingsCard}>
                <h3>Bedtime Schedule</h3>
                
                <div className={styles.settingGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={bedtimeSettings.enabled}
                      onChange={(e) => updateBedtimeSettings({ enabled: e.target.checked })}
                    />
                    Enable bedtime mode
                  </label>
                </div>

                <div className={styles.timeSettings}>
                  <div className={styles.timeInput}>
                    <label>Bedtime</label>
                    <input
                      type="time"
                      value={bedtimeSettings.bedtime}
                      onChange={(e) => updateBedtimeSettings({ bedtime: e.target.value })}
                    />
                    <span>{formatTime(bedtimeSettings.bedtime)}</span>
                  </div>
                  
                  <div className={styles.timeInput}>
                    <label>Wake time</label>
                    <input
                      type="time"
                      value={bedtimeSettings.wakeTime}
                      onChange={(e) => updateBedtimeSettings({ wakeTime: e.target.value })}
                    />
                    <span>{formatTime(bedtimeSettings.wakeTime)}</span>
                  </div>
                </div>

                <div className={styles.settingGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={bedtimeSettings.autoEnable}
                      onChange={(e) => updateBedtimeSettings({ autoEnable: e.target.checked })}
                    />
                    Auto-enable at bedtime
                  </label>
                </div>

                <div className={styles.settingGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={bedtimeSettings.dimUI}
                      onChange={(e) => updateBedtimeSettings({ dimUI: e.target.checked })}
                    />
                    Dim the screen
                  </label>
                </div>

                <div className={styles.settingGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={bedtimeSettings.calmContent}
                      onChange={(e) => updateBedtimeSettings({ calmContent: e.target.checked })}
                    />
                    Show calm content
                  </label>
                </div>

                <div className={styles.settingGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={bedtimeSettings.quietSounds}
                      onChange={(e) => updateBedtimeSettings({ quietSounds: e.target.checked })}
                    />
                    Quiet sounds only
                  </label>
                </div>

                <div className={styles.settingGroup}>
                  <label>
                    <input
                      type="checkbox"
                      checked={bedtimeSettings.showBedtimeStory}
                      onChange={(e) => updateBedtimeSettings({ showBedtimeStory: e.target.checked })}
                    />
                    Show bedtime story
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p>Good night, sleep tight, may God bless you tonight 🌙</p>
      </div>
    </div>
  )
}

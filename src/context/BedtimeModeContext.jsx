import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useChildSwitcher } from './ChildSwitcherContext';

const BedtimeModeContext = createContext(null);

export function BedtimeModeProvider({ children }) {
  const auth = useAuth();
  const childSwitcher = useChildSwitcher();

  // Safety check for context availability
  const profile = auth?.profile;
  const isChildSession = childSwitcher?.isChildSession || false;
  const activeChild = childSwitcher?.activeChild;
  const [bedtimeMode, setBedtimeMode] = useState(false);
  const [manualOverride, setManualOverride] = useState(false);
  const [bedtimeSettings, setBedtimeSettings] = useState({
    enabled: false,
    bedtime: '20:00', // 8:00 PM default
    wakeTime: '07:00', // 7:00 AM default
    autoEnable: true,
    calmContent: true,
    dimUI: true,
    quietSounds: true,
    showBedtimeStory: true,
  });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Every minute

    return () => clearInterval(timer);
  }, []);

  // Check if it's bedtime
  const isBedtime = () => {
    if (!bedtimeSettings.enabled) return false;

    const now = currentTime;
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTimeInMinutes = currentHour * 60 + currentMinute;

    const [bedtimeHour, bedtimeMinute] = bedtimeSettings.bedtime.split(':').map(Number);
    const [wakeHour, wakeMinute] = bedtimeSettings.wakeTime.split(':').map(Number);
    const bedtimeInMinutes = bedtimeHour * 60 + bedtimeMinute;
    const wakeTimeInMinutes = wakeHour * 60 + wakeMinute;

    // Handle overnight bedtime (e.g., 9 PM to 7 AM)
    if (bedtimeInMinutes > wakeTimeInMinutes) {
      // Bedtime is after midnight (e.g., 9 PM = 21:00, wake time = 7 AM = 7:00)
      return currentTimeInMinutes >= bedtimeInMinutes || currentTimeInMinutes < wakeTimeInMinutes;
    } else {
      // Same day bedtime (e.g., 7 PM to 9 PM)
      return currentTimeInMinutes >= bedtimeInMinutes && currentTimeInMinutes < wakeTimeInMinutes;
    }
  };

  // Auto-enable bedtime mode — never override a manual toggle
  useEffect(() => {
    if (manualOverride) return; // user manually set it, don't touch it
    if (bedtimeSettings.autoEnable && isBedtime()) {
      if (!bedtimeMode) {
        setBedtimeMode(true);
        applyBedtimeMode(true);
      }
    } else if (bedtimeMode && bedtimeSettings.autoEnable && !isBedtime()) {
      setBedtimeMode(false);
      applyBedtimeMode(false);
    }
  }, [currentTime, bedtimeSettings, manualOverride]);

  // Apply bedtime mode UI changes
  const applyBedtimeMode = (enable) => {
    const root = document.documentElement;

    if (enable) {
      // Dim the UI
      if (bedtimeSettings.dimUI) {
        root.style.setProperty('--bedtime-brightness', '0.7');
        root.style.setProperty('--bedtime-contrast', '0.8');
        document.body.style.filter = 'brightness(0.7) contrast(0.8)';
        document.body.style.transition = 'filter 1s ease-in-out';
      }

      // Add bedtime class for styling
      document.body.setAttribute('data-bedtime', 'true');

      // Enable calm content mode
      if (bedtimeSettings.calmContent) {
        root.style.setProperty('--bedtime-primary', '#4A5568');
        root.style.setProperty('--bedtime-secondary', '#718096');
        root.style.setProperty('--bedtime-accent', '#9F7AEA');
      }

      // Reduce animations
      root.style.setProperty('--bedtime-animation-speed', '0.5x');
    } else {
      // Restore normal UI
      document.body.style.filter = '';
      document.body.removeAttribute('data-bedtime');
      root.style.removeProperty('--bedtime-brightness');
      root.style.removeProperty('--bedtime-contrast');
      root.style.removeProperty('--bedtime-primary');
      root.style.removeProperty('--bedtime-secondary');
      root.style.removeProperty('--bedtime-accent');
      root.style.removeProperty('--bedtime-animation-speed');
    }
  };

  // Manual toggle for bedtime mode
  const toggleBedtimeMode = () => {
    const newMode = !bedtimeMode;
    setManualOverride(true); // prevent auto-reset from overriding manual choice
    setBedtimeMode(newMode);
    applyBedtimeMode(newMode);
  };

  // Update bedtime settings
  const updateBedtimeSettings = (newSettings) => {
    setBedtimeSettings((prev) => ({ ...prev, ...newSettings }));

    // Save to localStorage for persistence
    const userId = isChildSession && activeChild ? activeChild.id : profile?.id;
    if (userId) {
      localStorage.setItem(
        `bedtime_settings_${userId}`,
        JSON.stringify({ ...bedtimeSettings, ...newSettings })
      );
    }
  };

  // Load bedtime settings from localStorage
  useEffect(() => {
    const userId = isChildSession && activeChild ? activeChild.id : profile?.id;
    if (userId) {
      const saved = localStorage.getItem(`bedtime_settings_${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setBedtimeSettings(parsed);
        } catch (error) {
          console.error('Error loading bedtime settings:', error);
        }
      }
    }
  }, [profile?.id, isChildSession, activeChild?.id]);

  // Get bedtime story based on current time and child preferences
  const getBedtimeStory = () => {
    const stories = [
      {
        title: "Daniel in the Lions' Den",
        verse: 'Daniel 6:22',
        moral: 'God protects us when we trust in Him',
        content:
          'Daniel was a faithful man who prayed to God every day. When wicked men convinced the king to throw Daniel into a den of hungry lions, God sent an angel to protect him all night long.',
        prayer:
          'Dear God, thank you for protecting us like you protected Daniel. Help us to be brave and faithful always. Amen.',
      },
      {
        title: 'David and the Sheep',
        verse: 'Psalm 23:1',
        moral: 'The Lord is our shepherd who cares for us',
        content:
          "When David was just a young boy, he took care of his father's sheep. He learned that God is like a good shepherd who always watches over His children, just like David watched over his sheep.",
        prayer:
          'Thank you Lord for being our good shepherd. Help us to trust you and follow you always. Amen.',
      },
      {
        title: 'Baby Moses in the Basket',
        verse: 'Exodus 2:10',
        moral: 'God has a special plan for each of us',
        content:
          "When baby Moses was in danger, his mother made a special basket and placed him in the river. God guided the basket to the princess who would care for Moses and help him fulfill God's special plan.",
        prayer:
          'Dear God, thank you for having a special plan for each of us. Help us to trust your plan every day. Amen.',
      },
    ];

    // Rotate stories based on date
    const today = new Date();
    const storyIndex = today.getDate() % stories.length;
    return stories[storyIndex];
  };

  // Get calming activities for bedtime
  const getCalmingActivities = () => {
    return [
      { id: 1, title: 'Evening Prayer', icon: '🙏', duration: '5 minutes', type: 'prayer' },
      { id: 2, title: 'Gratitude Journal', icon: '📔', duration: '10 minutes', type: 'reflection' },
      { id: 3, title: 'Calm Worship Music', icon: '🎵', duration: '15 minutes', type: 'music' },
      { id: 4, title: 'Bible Story Time', icon: '📖', duration: '10 minutes', type: 'story' },
      { id: 5, title: 'Peaceful Breathing', icon: '🫁', duration: '5 minutes', type: 'meditation' },
    ];
  };

  return (
    <BedtimeModeContext.Provider
      value={{
        bedtimeMode,
        bedtimeSettings,
        currentTime,
        isBedtime: isBedtime(),
        toggleBedtimeMode,
        updateBedtimeSettings,
        getBedtimeStory,
        getCalmingActivities,
      }}
    >
      {children}
    </BedtimeModeContext.Provider>
  );
}

export const useBedtimeMode = () => {
  const ctx = useContext(BedtimeModeContext);
  if (!ctx) throw new Error('useBedtimeMode must be inside BedtimeModeProvider');
  return ctx;
};

// Bedtime Mode Toggle Component
export function BedtimeModeToggle() {
  const { bedtimeMode, toggleBedtimeMode } = useBedtimeMode();

  return (
    <button
      onClick={toggleBedtimeMode}
      title={bedtimeMode ? 'Exit Bedtime Mode' : 'Enter Bedtime Mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 100,
        border: `2px solid ${bedtimeMode ? '#9F7AEA' : 'var(--border)'}`,
        background: bedtimeMode ? 'rgba(159, 122, 234, 0.15)' : 'transparent',
        color: bedtimeMode ? '#9F7AEA' : 'var(--ink3)',
        cursor: 'pointer',
        fontFamily: 'Poppins,sans-serif',
        fontSize: '.72rem',
        fontWeight: 700,
        transition: 'all .2s',
      }}
    >
      🌙 {bedtimeMode ? 'Bedtime ON' : 'Bedtime'}
    </button>
  );
}

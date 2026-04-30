import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);
  const [reminders, setReminders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('bfl_reminders') || '[]');
    } catch {
      return [];
    }
  });

  // Save reminders to localStorage
  useEffect(() => {
    localStorage.setItem('bfl_reminders', JSON.stringify(reminders));
  }, [reminders]);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const notif = { ...notification, id };
    setNotifications((prev) => [...prev, notif]);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, notification.duration || 5000);

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const addReminder = useCallback((reminder) => {
    const newReminder = {
      id: Date.now(),
      type: reminder.type, // 'devotion', 'streak', 'activity', 'study'
      title: reminder.title,
      description: reminder.description,
      time: reminder.time, // HH:MM format
      enabled: reminder.enabled !== false,
      days: reminder.days || ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      createdAt: new Date().toISOString(),
    };
    setReminders((prev) => [...prev, newReminder]);
    return newReminder.id;
  }, []);

  const updateReminder = useCallback((id, updates) => {
    setReminders((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  }, []);

  const removeReminder = useCallback((id) => {
    setReminders((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const clearReminders = useCallback(() => {
    setReminders([]);
  }, []);

  // Check if a reminder should trigger
  const shouldTriggerReminder = useCallback((reminder) => {
    if (!reminder.enabled) return false;

    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

    return currentTime === reminder.time && reminder.days.includes(dayName);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        reminders,
        addReminder,
        updateReminder,
        removeReminder,
        clearReminders,
        shouldTriggerReminder,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotification = () => {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotification must be used inside NotificationProvider');
  return ctx;
};

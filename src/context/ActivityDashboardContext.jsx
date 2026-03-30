import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useChildSwitcher } from './ChildSwitcherContext';
import * as db from '../lib/db';
import { requestQueue } from '../lib/requestQueue';

const ActivityDashboardContext = createContext(null);

export function ActivityDashboardProvider({ children }) {
  const { user, profile } = useAuth();
  const { activeChild, isChildSession } = useChildSwitcher();
  const [realTimeData, setRealTimeData] = useState({
    activities: [],
    stats: {},
    trends: [],
    alerts: [],
  });
  const [loading, setLoading] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Get current user ID for monitoring
  const getCurrentUserId = () => {
    if (isChildSession && activeChild) {
      return activeChild.id;
    }
    return user?.id;
  };

  // Get children to monitor (for parents)
  const getChildrenToMonitor = async () => {
    if (profile?.role === 'Parent' && user?.id) {
      const { data } = await db.getChildProfiles(user.id);
      return data || [];
    }
    return [];
  };

  // Load real-time activity data
  const loadRealTimeData = async () => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      const [activitiesResult, statsResult] = await Promise.all([
        loadRecentActivities(userId),
        loadActivityStats(userId),
      ]);

      const alerts = await generateAlerts(activitiesResult.activities, statsResult.stats);
      const trends = await calculateTrends(activitiesResult.activities);

      setRealTimeData({
        activities: activitiesResult.activities,
        stats: statsResult.stats,
        trends,
        alerts,
      });
      setLastUpdate(new Date());
    } catch (error) {
      console.error('Error loading real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load recent activities
  const loadRecentActivities = async (userId) => {
    const result = await requestQueue.execute(
      `recent-activities:${userId}`,
      () => db.getChildActivity(userId, 50),
      { priority: 2, cacheable: true, ttl: 2 * 60 * 1000 }
    );

    return {
      activities: result?.data || [],
    };
  };

  // Load activity statistics
  const loadActivityStats = async (userId) => {
    // Use request queue with staggered priority
    const weekStatsPromise = requestQueue.execute(
      `activity-stats-week:${userId}`,
      () => db.getChildActivityStats(userId, 7),
      { priority: 1, cacheable: true, ttl: 2 * 60 * 1000 }
    );

    const dayStatsPromise = requestQueue.execute(
      `activity-stats-day:${userId}`,
      () => db.getChildActivityStats(userId, 1),
      { priority: 2, cacheable: true, ttl: 60 * 1000 }
    );

    const [weekStatsResult, dayStatsResult] = await Promise.all([
      weekStatsPromise,
      dayStatsPromise,
    ]);

    const weekStats = weekStatsResult?.data || [];
    const dayStats = dayStatsResult?.data || [];

    const stats = {
      today: {
        totalActivities: dayStats?.length || 0,
        totalTime: dayStats?.reduce((sum, act) => sum + (act.duration || 0), 0) || 0,
        uniqueTypes: [...new Set(dayStats?.map((act) => act.activity_type))].length,
      },
      week: {
        totalActivities: weekStats?.length || 0,
        totalTime: weekStats?.reduce((sum, act) => sum + (act.duration || 0), 0) || 0,
        averageDaily: Math.round((weekStats?.length || 0) / 7),
        mostActiveDay: getMostActiveDay(weekStats || []),
        favoriteActivities: getFavoriteActivities(weekStats || []),
      },
      streaks: {
        current: await getCurrentStreak(userId),
        longest: await getLongestStreak(userId),
      },
    };

    return { stats };
  };

  // Get most active day of the week
  const getMostActiveDay = (activities) => {
    const dayCounts = activities.reduce((acc, activity) => {
      const day = new Date(activity.completed_at).toLocaleDateString('en', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dayCounts).reduce((a, b) => (a[1] > b[1] ? a : b), ['', 0])[0];
  };

  // Get favorite activities
  const getFavoriteActivities = (activities) => {
    const typeCounts = activities.reduce((acc, activity) => {
      acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(typeCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));
  };

  // Get current streak
  const getCurrentStreak = async (userId) => {
    try {
      const result = await requestQueue.execute(
        `streak-current:${userId}`,
        () => db.getStreak(userId),
        { priority: 3, cacheable: true, ttl: 10 * 60 * 1000 }
      );
      return result?.data?.current_streak || 0;
    } catch {
      return 0;
    }
  };

  // Get longest streak
  const getLongestStreak = async (userId) => {
    try {
      const result = await requestQueue.execute(
        `streak-longest:${userId}`,
        () => db.getStreak(userId),
        { priority: 3, cacheable: true, ttl: 10 * 60 * 1000 }
      );
      return result?.data?.longest_streak || 0;
    } catch {
      return 0;
    }
  };

  // Calculate trends
  const calculateTrends = (activities) => {
    const last7Days = activities.filter((act) => {
      const actDate = new Date(act.completed_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return actDate >= weekAgo;
    });

    const dailyActivity = last7Days.reduce((acc, activity) => {
      const date = activity.completed_at.split('T')[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    // Generate trend data for the last 7 days
    const trends = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      trends.push({
        date: dateStr,
        count: dailyActivity[dateStr] || 0,
        dayName: date.toLocaleDateString('en', { weekday: 'short' }),
      });
    }

    return trends;
  };

  // Generate alerts based on activity data
  const generateAlerts = async (activities, stats) => {
    const alerts = [];

    // Low activity alert
    if (stats.today?.totalActivities === 0 && new Date().getHours() > 14) {
      alerts.push({
        type: 'warning',
        title: 'Low Activity Today',
        message: 'No activities completed yet today. Try some trivia or reading!',
        priority: 'medium',
      });
    }

    // Screen time alert
    if (stats.today?.totalTime > 120) {
      // More than 2 hours
      alerts.push({
        type: 'info',
        title: 'Great Screen Time!',
        message: `${stats.today.totalTime} minutes of learning today!`,
        priority: 'low',
      });
    }

    // Streak milestone
    if (stats.streaks?.current > 0 && stats.streaks.current % 7 === 0) {
      alerts.push({
        type: 'success',
        title: 'Streak Milestone! 🔥',
        message: `${stats.streaks.current} day streak - amazing consistency!`,
        priority: 'high',
      });
    }

    // New activity type discovered
    const recentTypes = activities.slice(0, 5).map((act) => act.activity_type);
    const olderTypes = activities.slice(5).map((act) => act.activity_type);
    const newType = recentTypes.find((type) => !olderTypes.includes(type));
    if (newType) {
      alerts.push({
        type: 'success',
        title: 'New Activity!',
        message: `Tryed ${newType} for the first time!`,
        priority: 'low',
      });
    }

    return alerts;
  };

  // Track a new activity in real-time
  const trackActivity = async (activityType, activityData = null, duration = 0) => {
    try {
      const userId = getCurrentUserId();
      if (!userId) return;

      await db.addChildActivity(userId, activityType, activityData, duration);

      // Refresh real-time data
      if (autoRefresh) {
        await loadRealTimeData();
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  };

  // Auto-refresh data every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadRealTimeData();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, getCurrentUserId()]);

  // Initial data load
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      loadRealTimeData();
    }
  }, [getCurrentUserId()]);

  return (
    <ActivityDashboardContext.Provider
      value={{
        realTimeData,
        loading,
        lastUpdate,
        autoRefresh,
        setAutoRefresh,
        loadRealTimeData,
        trackActivity,
        getCurrentUserId,
      }}
    >
      {children}
    </ActivityDashboardContext.Provider>
  );
}

export const useActivityDashboard = () => {
  const ctx = useContext(ActivityDashboardContext);
  if (!ctx) throw new Error('useActivityDashboard must be inside ActivityDashboardProvider');
  return ctx;
};

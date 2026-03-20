import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { useChildSwitcher } from './ChildSwitcherContext'
import * as db from '../lib/db'

const AdvancedAnalyticsContext = createContext(null)

export function AdvancedAnalyticsProvider({ children }) {
  const { user, profile } = useAuth()
  const { activeChild, isChildSession } = useChildSwitcher()
  const [analyticsData, setAnalyticsData] = useState({
    learningPatterns: [],
    progressInsights: {},
    performanceMetrics: {},
    recommendations: [],
    trends: {},
    comparisons: {}
  })
  const [loading, setLoading] = useState(false)

  // Get current user ID for analytics
  const getCurrentUserId = () => {
    if (isChildSession && activeChild) {
      return activeChild.id
    }
    return user?.id
  }

  // Load comprehensive analytics data
  const loadAnalyticsData = async () => {
    setLoading(true)
    try {
      const userId = getCurrentUserId()
      if (!userId) return

      const [
        learningPatterns,
        progressInsights,
        performanceMetrics,
        recommendations,
        trends,
        comparisons
      ] = await Promise.all([
        analyzeLearningPatterns(userId),
        generateProgressInsights(userId),
        calculatePerformanceMetrics(userId),
        generateRecommendations(userId),
        analyzeTrends(userId),
        generateComparisons(userId)
      ])

      setAnalyticsData({
        learningPatterns,
        progressInsights,
        performanceMetrics,
        recommendations,
        trends,
        comparisons
      })
    } catch (error) {
      console.error('Error loading analytics data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Analyze learning patterns
  const analyzeLearningPatterns = async (userId) => {
    try {
      const { data: activities } = await db.getChildActivity(userId, 200)
      if (!activities || activities.length === 0) return []

      const patterns = []

      // Time-based patterns
      const timePatterns = analyzeTimePatterns(activities)
      patterns.push({
        type: 'time',
        title: 'Best Learning Times',
        description: 'When you learn most effectively',
        data: timePatterns,
        insights: generateTimeInsights(timePatterns)
      })

      // Activity type patterns
      const activityPatterns = analyzeActivityPatterns(activities)
      patterns.push({
        type: 'activity',
        title: 'Favorite Learning Styles',
        description: 'How you prefer to learn',
        data: activityPatterns,
        insights: generateActivityInsights(activityPatterns)
      })

      // Difficulty progression patterns
      const difficultyPatterns = analyzeDifficultyPatterns(activities)
      patterns.push({
        type: 'difficulty',
        title: 'Challenge Progression',
        description: 'How you handle different difficulty levels',
        data: difficultyPatterns,
        insights: generateDifficultyInsights(difficultyPatterns)
      })

      // Consistency patterns
      const consistencyPatterns = analyzeConsistencyPatterns(activities)
      patterns.push({
        type: 'consistency',
        title: 'Learning Consistency',
        description: 'Your regularity and dedication',
        data: consistencyPatterns,
        insights: generateConsistencyInsights(consistencyPatterns)
      })

      return patterns
    } catch (error) {
      console.error('Error analyzing learning patterns:', error)
      return []
    }
  }

  // Analyze time-based patterns
  const analyzeTimePatterns = (activities) => {
    const hourCounts = {}
    const dayOfWeekCounts = {}

    activities.forEach(activity => {
      const date = new Date(activity.completed_at)
      const hour = date.getHours()
      const dayOfWeek = date.toLocaleDateString('en', { weekday: 'long' })

      hourCounts[hour] = (hourCounts[hour] || 0) + 1
      dayOfWeekCounts[dayOfWeek] = (dayOfWeekCounts[dayOfWeek] || 0) + 1
    })

    // Find peak hours
    const sortedHours = Object.entries(hourCounts).sort(([,a], [,b]) => b - a)
    const peakHours = sortedHours.slice(0, 3).map(([hour]) => parseInt(hour))

    // Find most active days
    const sortedDays = Object.entries(dayOfWeekCounts).sort(([,a], [,b]) => b - a)
    const mostActiveDays = sortedDays.map(([day]) => day)

    return {
      hourlyDistribution: hourCounts,
      dailyDistribution: dayOfWeekCounts,
      peakHours,
      mostActiveDays,
      totalSessions: activities.length
    }
  }

  // Analyze activity type patterns
  const analyzeActivityPatterns = (activities) => {
    const typeCounts = {}
    const typeDurations = {}

    activities.forEach(activity => {
      const type = activity.activity_type
      typeCounts[type] = (typeCounts[type] || 0) + 1
      typeDurations[type] = (typeDurations[type] || 0) + (activity.duration || 0)
    })

    // Calculate preferences
    const totalActivities = activities.length
    const preferences = Object.entries(typeCounts).map(([type, count]) => ({
      type,
      count,
      percentage: Math.round((count / totalActivities) * 100),
      avgDuration: Math.round(typeDurations[type] / count),
      engagement: calculateEngagement(type, count, typeDurations[type])
    }))

    return {
      preferences: preferences.sort((a, b) => b.percentage - a.percentage),
      mostPreferred: preferences[0]?.type || 'None',
      diversity: Object.keys(typeCounts).length,
      totalTimeSpent: Object.values(typeDurations).reduce((sum, time) => sum + time, 0)
    }
  }

  // Analyze difficulty progression
  const analyzeDifficultyPatterns = (activities) => {
    const difficultyProgression = []
    const difficultyCounts = { easy: 0, medium: 0, hard: 0 }

    activities.forEach(activity => {
      const difficulty = activity.activity_data?.difficulty || 'medium'
      difficultyCounts[difficulty] = (difficultyCounts[difficulty] || 0) + 1
      
      difficultyProgression.push({
        date: activity.completed_at,
        difficulty,
        activityType: activity.activity_type,
        success: activity.activity_data?.success || true
      })
    })

    // Calculate progression trend
    const recentDifficulty = difficultyProgression.slice(-10)
    const olderDifficulty = difficultyProgression.slice(0, 10)
    
    const recentHard = recentDifficulty.filter(a => a.difficulty === 'hard').length
    const olderHard = olderDifficulty.filter(a => a.difficulty === 'hard').length
    
    const progressing = recentHard > olderHard

    return {
      distribution: difficultyCounts,
      progression: difficultyProgression,
      isProgressing: progressing,
      currentLevel: determineCurrentLevel(difficultyCounts),
      readinessForChallenge: calculateReadinessForChallenge(difficultyCounts)
    }
  }

  // Analyze consistency patterns
  const analyzeConsistencyPatterns = (activities) => {
    const dailyActivity = {}
    const streakData = []

    activities.forEach(activity => {
      const date = activity.completed_at.split('T')[0]
      dailyActivity[date] = (dailyActivity[date] || 0) + 1
    })

    // Calculate streaks
    const sortedDates = Object.keys(dailyActivity).sort()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    sortedDates.forEach((date, index) => {
      if (index === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(sortedDates[index - 1])
        const currDate = new Date(date)
        const daysDiff = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    })

    longestStreak = Math.max(longestStreak, tempStreak)
    currentStreak = tempStreak

    // Calculate consistency score
    const totalDays = sortedDates.length
    const dateRange = Math.floor((new Date(sortedDates[sortedDates.length - 1]) - new Date(sortedDates[0])) / (1000 * 60 * 60 * 24)) + 1
    const consistencyScore = Math.round((totalDays / dateRange) * 100)

    return {
      currentStreak,
      longestStreak,
      consistencyScore,
      totalActiveDays: totalDays,
      averageActivitiesPerDay: activities.length / totalDays,
      mostConsistentDay: findMostConsistentDay(dailyActivity)
    }
  }

  // Generate progress insights
  const generateProgressInsights = async (userId) => {
    try {
      const { data: activities } = await db.getChildActivity(userId, 100)
      const { data: memoryVerses } = await db.getMemoryVerses(userId, 'child')
      const { data: badges } = await db.getBadges(userId)

      const insights = {}

      // Learning velocity
      insights.learningVelocity = calculateLearningVelocity(activities)
      
      // Mastery areas
      insights.masteryAreas = identifyMasteryAreas(activities)
      
      // Growth areas
      insights.growthAreas = identifyGrowthAreas(activities)
      
      // Memory verse progress
      insights.memoryProgress = analyzeMemoryProgress(memoryVerses)
      
      // Achievement patterns
      insights.achievementPatterns = analyzeAchievementPatterns(badges)
      
      // Predictive insights
      insights.predictions = generatePredictions(activities, memoryVerses, badges)

      return insights
    } catch (error) {
      console.error('Error generating progress insights:', error)
      return {}
    }
  }

  // Calculate performance metrics
  const calculatePerformanceMetrics = async (userId) => {
    try {
      const { data: activities } = await db.getChildActivity(userId, 200)
      
      const metrics = {}

      // Engagement metrics
      metrics.engagement = {
        averageSessionLength: calculateAverageSessionLength(activities),
        returnRate: calculateReturnRate(activities),
        peakEngagementTimes: findPeakEngagementTimes(activities),
        activityDiversity: calculateActivityDiversity(activities)
      }

      // Learning efficiency
      metrics.efficiency = {
        activitiesPerHour: calculateActivitiesPerHour(activities),
        difficultyProgressionRate: calculateDifficultyProgressionRate(activities),
        retentionRate: calculateRetentionRate(activities),
        masterySpeed: calculateMasterySpeed(activities)
      }

      // Social learning
      metrics.social = {
        sharedActivities: await getSharedActivities(userId),
        collaborativeScore: await calculateCollaborativeScore(userId),
        communityEngagement: await getCommunityEngagement(userId)
      }

      // Spiritual growth indicators
      metrics.spiritual = {
        prayerFrequency: await getPrayerFrequency(userId),
        scriptureEngagement: await getScriptureEngagement(userId),
        faithApplication: await getFaithApplication(userId)
      }

      return metrics
    } catch (error) {
      console.error('Error calculating performance metrics:', error)
      return {}
    }
  }

  // Generate personalized recommendations
  const generateRecommendations = async (userId) => {
    try {
      const recommendations = []

      // Based on learning patterns
      const patterns = await analyzeLearningPatterns(userId)
      recommendations.push(...generatePatternBasedRecommendations(patterns))

      // Based on performance metrics
      const metrics = await calculatePerformanceMetrics(userId)
      recommendations.push(...generateMetricBasedRecommendations(metrics))

      // Based on progress insights
      const insights = await generateProgressInsights(userId)
      recommendations.push(...generateInsightBasedRecommendations(insights))

      // Age-appropriate recommendations
      const age = activeChild?.age || 8
      recommendations.push(...generateAgeBasedRecommendations(age))

      // Remove duplicates and prioritize
      const uniqueRecommendations = recommendations.filter((rec, index, self) => 
        index === self.findIndex(r => r.type === rec.type && r.title === rec.title)
      )

      return uniqueRecommendations.slice(0, 8) // Top 8 recommendations
    } catch (error) {
      console.error('Error generating recommendations:', error)
      return []
    }
  }

  // Analyze trends
  const analyzeTrends = async (userId) => {
    try {
      const { data: activities } = await db.getChildActivity(userId, 200)
      
      const trends = {}

      // Learning velocity trend
      trends.velocityTrend = calculateVelocityTrend(activities)
      
      // Interest evolution
      trends.interestEvolution = calculateInterestEvolution(activities)
      
      // Skill development
      trends.skillDevelopment = calculateSkillDevelopment(activities)
      
      // Seasonal patterns
      trends.seasonalPatterns = calculateSeasonalPatterns(activities)

      return trends
    } catch (error) {
      console.error('Error analyzing trends:', error)
      return {}
    }
  }

  // Generate comparisons
  const generateComparisons = async (userId) => {
    try {
      const comparisons = {}

      // Peer comparison (age-based)
      comparisons.peerComparison = await generatePeerComparison(userId)
      
      // Personal best comparison
      comparisons.personalBest = await generatePersonalBestComparison(userId)
      
      // Goal progress comparison
      comparisons.goalProgress = await generateGoalProgressComparison(userId)

      return comparisons
    } catch (error) {
      console.error('Error generating comparisons:', error)
      return {}
    }
  }

  // Helper functions for insights generation
  const generateTimeInsights = (timePatterns) => {
    const insights = []
    
    if (timePatterns.peakHours.includes(19) || timePatterns.peakHours.includes(20)) {
      insights.push("You learn best in the evening hours")
    }
    
    if (timePatterns.mostActiveDays.includes('Saturday') || timePatterns.mostActiveDays.includes('Sunday')) {
      insights.push("Weekend learning is your strength")
    }
    
    return insights
  }

  const generateActivityInsights = (activityPatterns) => {
    const insights = []
    
    if (activityPatterns.diversity >= 5) {
      insights.push("You enjoy diverse learning activities")
    }
    
    if (activityPatterns.mostPreferred === 'trivia') {
      insights.push("Games and quizzes help you learn best")
    }
    
    return insights
  }

  // Missing helper functions
  const calculateLearningVelocity = (activities) => {
    if (!activities || activities.length === 0) return 0
    
    const recentActivities = activities.slice(-10) // Last 10 activities
    const timeSpan = recentActivities.length > 1 ? 
      (new Date(recentActivities[recentActivities.length - 1].date) - new Date(recentActivities[0].date)) / (1000 * 60 * 60 * 24) : 
      1
    
    return recentActivities.length / Math.max(timeSpan, 1)
  }

  const calculateAverageSessionLength = (activities) => {
    if (!activities || activities.length === 0) return 0
    
    const sessionLengths = activities.map(activity => activity.duration || 30) // Default 30 mins
    return sessionLengths.reduce((sum, length) => sum + length, 0) / sessionLengths.length
  }

  const calculateVelocityTrend = (activities) => {
    if (!activities || activities.length < 2) return 'stable'
    
    const recentVelocity = calculateLearningVelocity(activities.slice(-5))
    const previousVelocity = calculateLearningVelocity(activities.slice(-10, -5))
    
    if (recentVelocity > previousVelocity * 1.2) return 'increasing'
    if (recentVelocity < previousVelocity * 0.8) return 'decreasing'
    return 'stable'
  }

  const generatePatternBasedRecommendations = (patterns) => {
    const recommendations = []
    
    if (!patterns) return recommendations
    
    // Time-based recommendations
    if (patterns.timePatterns?.peakHours?.length > 0) {
      recommendations.push(`Schedule learning during your peak hours: ${patterns.timePatterns.peakHours.join(', ')}`)
    }
    
    // Activity-based recommendations
    if (patterns.activityPatterns?.mostPreferred) {
      recommendations.push(`Focus more on ${patterns.activityPatterns.mostPreferred} activities for better engagement`)
    }
    
    // Consistency recommendations
    if (patterns.consistencyScore < 0.7) {
      recommendations.push('Try to maintain a more consistent learning schedule')
    }
    
    return recommendations
  }

  const generatePeerComparison = async (userId) => {
    // Mock peer comparison data
    return {
      percentile: 75,
      rank: 'above average',
      areas: ['scripture_memory', 'daily_streak'],
      message: 'You are performing better than 75% of users in your age group'
    }
  }

  const generatePersonalBestComparison = async (userId) => {
    // Mock personal best comparison
    return {
      currentStreak: 7,
      bestStreak: 14,
      currentScore: 85,
      bestScore: 92,
      message: 'You are approaching your personal best!'
    }
  }

  const generateGoalProgressComparison = async (userId) => {
    // Mock goal progress comparison
    return {
      goalsCompleted: 3,
      totalGoals: 5,
      completionRate: 60,
      onTrack: true,
      message: 'You are on track to complete your monthly goals'
    }
  }

  // Additional missing helper functions
  const identifyMasteryAreas = (activities) => {
    if (!activities || activities.length === 0) return []
    const activityTypes = {}
    activities.forEach(activity => {
      const type = activity.activity_type || 'general'
      activityTypes[type] = (activityTypes[type] || 0) + 1
    })
    return Object.entries(activityTypes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => type)
  }

  const identifyGrowthAreas = (activities) => {
    if (!activities || activities.length === 0) return []
    const recent = activities.slice(-20)
    const types = [...new Set(recent.map(a => a.activity_type))]
    return types.slice(0, 3)
  }

  const analyzeMemoryProgress = (memoryVerses) => {
    if (!memoryVerses) return { mastered: 0, learning: 0, total: 0 }
    return {
      mastered: memoryVerses.filter(v => v.status === 'mastered').length,
      learning: memoryVerses.filter(v => v.status === 'learning').length,
      total: memoryVerses.length
    }
  }

  const analyzeAchievementPatterns = (badges) => {
    if (!badges) return { total: 0, recent: 0, categories: [] }
    const recent = badges.filter(b => {
      const earnedDate = new Date(b.earned_at || Date.now())
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return earnedDate > thirtyDaysAgo
    })
    return {
      total: badges.length,
      recent: recent.length,
      categories: [...new Set(badges.map(b => b.category))]
    }
  }

  const generatePredictions = (activities, memoryVerses, badges) => {
    return {
      nextMilestone: 'Complete 10 memory verses',
      estimatedTime: '2 weeks',
      recommendedFocus: memoryVerses?.length > 0 ? 'memory' : 'activities'
    }
  }

  const calculateRetentionRate = (activities) => {
    if (!activities || activities.length < 2) return 0
    const reviewed = activities.filter(a => a.activity_type === 'review' || a.activity_data?.isReview)
    return Math.round((reviewed.length / activities.length) * 100)
  }

  const calculateMasterySpeed = (activities) => {
    if (!activities || activities.length === 0) return 0
    const mastered = activities.filter(a => a.activity_data?.mastered)
    if (mastered.length === 0) return 0
    const totalDays = activities.length > 1
      ? Math.max(1, Math.floor((new Date(activities[activities.length - 1].completed_at) - new Date(activities[0].completed_at)) / (1000 * 60 * 60 * 24)))
      : 1
    return Math.round(mastered.length / totalDays * 10) / 10
  }

  const getSharedActivities = async (userId) => {
    try {
      const { data } = await db.getChildActivity(userId, 50)
      return data?.filter(a => a.activity_data?.shared)?.length || 0
    } catch { return 0 }
  }

  const calculateCollaborativeScore = async (userId) => {
    return 0 // Placeholder — extend when collaborative features are built
  }

  const getCommunityEngagement = async (userId) => {
    return { prayers: 0, encouragements: 0 }
  }

  const getPrayerFrequency = async (userId) => {
    try {
      const { data } = await db.getChildActivity(userId, 100)
      return data?.filter(a => a.activity_type === 'prayer')?.length || 0
    } catch { return 0 }
  }

  const getScriptureEngagement = async (userId) => {
    try {
      const { data } = await db.getChildActivity(userId, 100)
      return data?.filter(a => ['bible_reading', 'memory_verse', 'devotional'].includes(a.activity_type))?.length || 0
    } catch { return 0 }
  }

  const getFaithApplication = async (userId) => {
    return { score: 0, activities: [] }
  }

  const calculateReturnRate = (activities) => {
    if (!activities || activities.length === 0) return 0
    const uniqueDays = new Set(activities.map(a => 
      new Date(a.completed_at || a.created_at).toDateString()
    )).size
    return Math.min((uniqueDays / 30) * 100, 100)
  }

  const calculateInterestEvolution = (activities) => {
    if (!activities || activities.length < 2) return []
    return [
      { period: 'early', interest: 'exploration' },
      { period: 'recent', interest: activities.slice(-5)[0]?.activity_type || 'general' }
    ]
  }

  const calculateSkillDevelopment = (activities) => {
    if (!activities || activities.length === 0) return {}
    const types = {}
    activities.forEach(a => {
      const type = a.activity_type || 'general'
      if (!types[type]) types[type] = { count: 0, progression: 0 }
      types[type].count++
    })
    return types
  }

  const calculateSeasonalPatterns = (activities) => {
    if (!activities || activities.length === 0) return {}
    const byMonth = {}
    activities.forEach(a => {
      const month = new Date(a.completed_at || a.created_at).getMonth()
      byMonth[month] = (byMonth[month] || 0) + 1
    })
    return byMonth
  }

  const findPeakEngagementTimes = (activities) => {
    if (!activities || activities.length === 0) return []
    const hourCounts = {}
    activities.forEach(a => {
      const hour = new Date(a.completed_at || a.created_at).getHours()
      hourCounts[hour] = (hourCounts[hour] || 0) + 1
    })
    return Object.entries(hourCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour))
  }

  const generateMetricBasedRecommendations = (metrics) => {
    const recommendations = []
    if (!metrics) return recommendations
    
    if (metrics.engagement?.averageSessionLength < 10) {
      recommendations.push('Try to spend a bit more time on each activity')
    }
    if (metrics.efficiency?.retentionRate < 0.5) {
      recommendations.push('Review previous material to improve retention')
    }
    return recommendations
  }

  const generateInsightBasedRecommendations = (insights) => {
    const recommendations = []
    if (!insights) return recommendations
    
    if (insights.masteryAreas?.length > 0) {
      recommendations.push(`Keep practicing your strengths: ${insights.masteryAreas.join(', ')}`)
    }
    if (insights.growthAreas?.length > 0) {
      recommendations.push(`Focus on improving: ${insights.growthAreas.join(', ')}`)
    }
    return recommendations
  }

  const calculateActivityDiversity = (activities) => {
    if (!activities || activities.length === 0) return 0
    const uniqueTypes = new Set(activities.map(a => a.activity_type))
    return uniqueTypes.size
  }

  const calculateActivitiesPerHour = (activities) => {
    if (!activities || activities.length === 0) return 0
    const totalHours = activities.reduce((sum, a) => sum + (a.duration || 30), 0) / 60
    return totalHours > 0 ? activities.length / totalHours : 0
  }

  const calculateDifficultyProgressionRate = (activities) => {
    if (!activities || activities.length === 0) return 0
    const difficulties = activities.map(a => a.difficulty || 'medium')
    const hardCount = difficulties.filter(d => d === 'hard').length
    return (hardCount / difficulties.length) * 100
  }

  const generateAgeBasedRecommendations = (age) => {
    const recommendations = []
    if (age < 8) {
      recommendations.push('Focus on visual Bible stories with simple morals')
      recommendations.push('Use interactive games to learn basic Bible facts')
    } else if (age < 13) {
      recommendations.push('Introduce memory verses with fun challenges')
      recommendations.push('Explore Bible trivia and character quizzes')
    } else {
      recommendations.push('Dive deeper into scripture study and analysis')
      recommendations.push('Discuss real-life application of biblical principles')
    }
    return recommendations
  }

  const generateDifficultyInsights = (difficultyPatterns) => {
    const insights = []
    
    if (difficultyPatterns.isProgressing) {
      insights.push("You're ready for more challenging content")
    }
    
    if (difficultyPatterns.currentLevel === 'medium') {
      insights.push("You're building a solid foundation")
    }
    
    return insights
  }

  const generateConsistencyInsights = (consistencyPatterns) => {
    const insights = []
    
    if (consistencyPatterns.consistencyScore >= 70) {
      insights.push("Excellent consistency in your learning")
    }
    
    if (consistencyPatterns.currentStreak >= 7) {
      insights.push("Great momentum - keep it up!")
    }
    
    return insights
  }

  // Additional helper functions
  const calculateEngagement = (type, count, totalTime) => {
    const avgTime = totalTime / count
    if (avgTime > 15) return 'high'
    if (avgTime > 8) return 'medium'
    return 'low'
  }

  const determineCurrentLevel = (difficultyCounts) => {
    const total = difficultyCounts.easy + difficultyCounts.medium + difficultyCounts.hard
    const hardRatio = difficultyCounts.hard / total
    
    if (hardRatio > 0.3) return 'advanced'
    if (hardRatio > 0.1) return 'intermediate'
    return 'beginner'
  }

  const calculateReadinessForChallenge = (difficultyCounts) => {
    const successRate = 0.8 // Simplified - would calculate from actual success data
    const hardCount = difficultyCounts.hard
    
    if (successRate > 0.7 && hardCount >= 5) return 'ready'
    if (successRate > 0.5 && hardCount >= 2) return 'approaching'
    return 'developing'
  }

  const findMostConsistentDay = (dailyActivity) => {
    const dayCounts = {}
    Object.entries(dailyActivity).forEach(([date, count]) => {
      const day = new Date(date).toLocaleDateString('en', { weekday: 'long' })
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })
    
    return Object.entries(dayCounts).sort(([,a], [,b]) => b - a)[0]?.[0] || 'None'
  }

  // Load analytics when user changes
  useEffect(() => {
    const userId = getCurrentUserId()
    if (userId) {
      loadAnalyticsData()
    }
  }, [getCurrentUserId()])

  return (
    <AdvancedAnalyticsContext.Provider value={{
      analyticsData,
      loading,
      loadAnalyticsData,
      getCurrentUserId
    }}>
      {children}
    </AdvancedAnalyticsContext.Provider>
  )
}

export const useAdvancedAnalytics = () => {
  const ctx = useContext(AdvancedAnalyticsContext)
  if (!ctx) throw new Error('useAdvancedAnalytics must be inside AdvancedAnalyticsProvider')
  return ctx
}

import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useChildSwitcher } from './ChildSwitcherContext';
import * as db from '../lib/db';

const FamilyChallengesContext = createContext(null);

export function FamilyChallengesProvider({ children }) {
  const { user, profile } = useAuth();
  const { activeChild, isChildSession } = useChildSwitcher();
  const [challenges, setChallenges] = useState([]);
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [completedChallenges, setCompletedChallenges] = useState([]);
  const [familyProgress, setFamilyProgress] = useState({});
  const [loading, setLoading] = useState(false);

  // Get current family ID
  const getFamilyId = () => {
    return user?.id; // Using parent ID as family identifier
  };

  // Load family challenges
  const loadFamilyChallenges = async () => {
    setLoading(true);
    try {
      const familyId = getFamilyId();
      if (!familyId) return;

      const [availableChallenges, activeData, completedData] = await Promise.all([
        getAvailableChallenges(),
        getActiveFamilyChallenges(familyId),
        getCompletedFamilyChallenges(familyId),
      ]);

      setChallenges(availableChallenges);
      setActiveChallenges(activeData);
      setCompletedChallenges(completedData);

      // Calculate family progress
      const progress = await calculateFamilyProgress(familyId);
      setFamilyProgress(progress);
    } catch (error) {
      console.error('Error loading family challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get available challenges
  const getAvailableChallenges = async () => {
    // Predefined family challenges
    return [
      {
        id: 'family-bible-reading',
        title: 'Family Bible Reading Marathon',
        description: 'Read one Bible story together every day for a week',
        type: 'spiritual',
        difficulty: 'easy',
        duration: '7 days',
        participants: 'all',
        requirements: [
          { type: 'daily_reading', target: 7, description: 'Read one Bible story daily' },
          { type: 'family_discussion', target: 7, description: 'Discuss the story together' },
        ],
        rewards: [
          { type: 'badge', name: 'Bible Reader Family', icon: '📚' },
          { type: 'points', value: 100 },
          { type: 'unlock', content: 'special-family-devotional' },
        ],
        category: 'spiritual_growth',
        age_range: 'all',
      },
      {
        id: 'scripture-memory-team',
        title: 'Scripture Memory Team',
        description: 'Memorize 5 Bible verses as a family this month',
        type: 'spiritual',
        difficulty: 'medium',
        duration: '30 days',
        participants: 'all',
        requirements: [
          { type: 'verse_memorized', target: 5, description: 'Memorize 5 verses' },
          { type: 'family_practice', target: 15, description: 'Practice together 15 times' },
        ],
        rewards: [
          { type: 'badge', name: 'Memory Masters', icon: '🧠' },
          { type: 'points', value: 200 },
          { type: 'unlock', content: 'advanced-memory-tools' },
        ],
        category: 'spiritual_discipline',
        age_range: '6+',
      },
      {
        id: 'prayer-warriors',
        title: 'Family Prayer Warriors',
        description: 'Pray together for 30 days straight',
        type: 'spiritual',
        difficulty: 'medium',
        duration: '30 days',
        participants: 'all',
        requirements: [
          { type: 'daily_prayer', target: 30, description: 'Pray together daily' },
          { type: 'prayer_journal', target: 10, description: 'Write 10 prayer requests' },
        ],
        rewards: [
          { type: 'badge', name: 'Prayer Warriors', icon: '🙏' },
          { type: 'points', value: 150 },
          { type: 'unlock', content: 'prayer-wall-feature' },
        ],
        category: 'prayer',
        age_range: 'all',
      },
      {
        id: 'kindness-adventures',
        title: 'Kindness Adventures',
        description: 'Complete 20 acts of kindness as a family',
        type: 'character',
        difficulty: 'easy',
        duration: '14 days',
        participants: 'all',
        requirements: [
          { type: 'act_of_kindness', target: 20, description: '20 acts of kindness' },
          { type: 'kindness_reflection', target: 5, description: 'Share 5 kindness stories' },
        ],
        rewards: [
          { type: 'badge', name: 'Kindness Champions', icon: '💝' },
          { type: 'points', value: 120 },
          { type: 'unlock', content: 'kindness-tracker' },
        ],
        category: 'character_building',
        age_range: 'all',
      },
      {
        id: 'bible-trivia-champions',
        title: 'Bible Trivia Champions',
        description: 'Score 1000 points in Bible trivia as a family',
        type: 'educational',
        difficulty: 'medium',
        duration: '21 days',
        participants: 'all',
        requirements: [
          { type: 'trivia_points', target: 1000, description: 'Reach 1000 trivia points' },
          { type: 'family_participation', target: 10, description: 'Play together 10 times' },
        ],
        rewards: [
          { type: 'badge', name: 'Trivia Champions', icon: '🏆' },
          { type: 'points', value: 180 },
          { type: 'unlock', content: 'premium-trivia-packs' },
        ],
        category: 'biblical_knowledge',
        age_range: '8+',
      },
      {
        id: 'gratitude-journey',
        title: 'Family Gratitude Journey',
        description: 'Share gratitude every day for two weeks',
        type: 'character',
        difficulty: 'easy',
        duration: '14 days',
        participants: 'all',
        requirements: [
          { type: 'daily_gratitude', target: 14, description: 'Share gratitude daily' },
          { type: 'gratitude_journal', target: 7, description: 'Create 7 gratitude entries' },
        ],
        rewards: [
          { type: 'badge', name: 'Grateful Hearts', icon: '🙏' },
          { type: 'points', value: 100 },
          { type: 'unlock', content: 'gratitude-prompts' },
        ],
        category: 'character_development',
        age_range: 'all',
      },
      {
        id: 'service-challenge',
        title: 'Family Service Challenge',
        description: 'Complete 3 service projects together',
        type: 'service',
        difficulty: 'hard',
        duration: '60 days',
        participants: 'all',
        requirements: [
          { type: 'service_project', target: 3, description: 'Complete 3 service projects' },
          { type: 'service_reflection', target: 3, description: 'Reflect on each project' },
        ],
        rewards: [
          { type: 'badge', name: 'Servant Hearts', icon: '🤝' },
          { type: 'points', value: 300 },
          { type: 'unlock', content: 'service-opportunities' },
        ],
        category: 'service',
        age_range: '10+',
      },
      {
        id: 'faith-in-action',
        title: 'Faith in Action',
        description: 'Apply Bible lessons to real life for 21 days',
        type: 'application',
        difficulty: 'medium',
        duration: '21 days',
        participants: 'all',
        requirements: [
          { type: 'faith_application', target: 21, description: 'Apply faith lessons daily' },
          { type: 'application_sharing', target: 7, description: 'Share 7 applications' },
        ],
        rewards: [
          { type: 'badge', name: 'Faith in Action', icon: '⚡' },
          { type: 'points', value: 200 },
          { type: 'unlock', content: 'application-guides' },
        ],
        category: 'faith_application',
        age_range: '12+',
      },
    ];
  };

  // Get active family challenges
  const getActiveFamilyChallenges = async (familyId) => {
    try {
      // This would query the database for active challenges
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting active challenges:', error);
      return [];
    }
  };

  // Get completed family challenges
  const getCompletedFamilyChallenges = async (familyId) => {
    try {
      // This would query the database for completed challenges
      // For now, return empty array
      return [];
    } catch (error) {
      console.error('Error getting completed challenges:', error);
      return [];
    }
  };

  // Start a family challenge
  const startFamilyChallenge = async (challengeId, participants = []) => {
    try {
      const familyId = getFamilyId();
      const challenge = challenges.find((c) => c.id === challengeId);

      if (!challenge) throw new Error('Challenge not found');

      const activeChallenge = {
        id: uid(),
        family_id: familyId,
        challenge_id: challengeId,
        participants: participants.length > 0 ? participants : await getFamilyMembers(),
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + getDurationInMs(challenge.duration)).toISOString(),
        progress: initializeChallengeProgress(challenge),
        status: 'active',
      };

      // Save to database
      await db.createFamilyChallenge(activeChallenge);

      // Update local state
      setActiveChallenges((prev) => [...prev, activeChallenge]);

      return activeChallenge;
    } catch (error) {
      console.error('Error starting family challenge:', error);
      throw error;
    }
  };

  // Update challenge progress
  const updateChallengeProgress = async (challengeInstanceId, requirementType, increment = 1) => {
    try {
      const challengeIndex = activeChallenges.findIndex((c) => c.id === challengeInstanceId);
      if (challengeIndex === -1) return;

      const updatedChallenge = { ...activeChallenges[challengeIndex] };

      // Update progress
      const requirementIndex = updatedChallenge.progress.requirements.findIndex(
        (r) => r.type === requirementType
      );

      if (requirementIndex !== -1) {
        updatedChallenge.progress.requirements[requirementIndex].current += increment;
        updatedChallenge.progress.requirements[requirementIndex].completed =
          updatedChallenge.progress.requirements[requirementIndex].current >=
          updatedChallenge.progress.requirements[requirementIndex].target;
      }

      // Update overall progress
      updatedChallenge.progress.overall = calculateOverallProgress(
        updatedChallenge.progress.requirements
      );

      // Check if challenge is completed
      if (updatedChallenge.progress.overall >= 100) {
        updatedChallenge.status = 'completed';
        updatedChallenge.completed_date = new Date().toISOString();
        await completeFamilyChallenge(updatedChallenge);
      }

      // Save to database
      await db.updateFamilyChallengeProgress(updatedChallenge);

      // Update local state
      setActiveChallenges((prev) => {
        const newChallenges = [...prev];
        newChallenges[challengeIndex] = updatedChallenge;
        return newChallenges;
      });

      return updatedChallenge;
    } catch (error) {
      console.error('Error updating challenge progress:', error);
      throw error;
    }
  };

  // Complete family challenge
  const completeFamilyChallenge = async (challenge) => {
    try {
      // Award rewards to all participants
      for (const participant of challenge.participants) {
        await awardChallengeRewards(participant, challenge);
      }

      // Move to completed challenges
      setCompletedChallenges((prev) => [...prev, challenge]);
      setActiveChallenges((prev) => prev.filter((c) => c.id !== challenge.id));

      // Generate celebration
      await generateChallengeCelebration(challenge);
    } catch (error) {
      console.error('Error completing challenge:', error);
    }
  };

  // Calculate family progress
  const calculateFamilyProgress = async (familyId) => {
    try {
      const progress = {
        totalChallenges: 0,
        completedChallenges: 0,
        activeChallenges: activeChallenges.length,
        totalPoints: 0,
        badges: [],
        streak: 0,
        participation: {},
        achievements: [],
      };

      // Calculate from active and completed challenges
      progress.totalChallenges = challenges.length;
      progress.completedChallenges = completedChallenges.length;
      progress.activeChallenges = activeChallenges.length;

      // Sum points from completed challenges
      progress.totalPoints = completedChallenges.reduce((sum, challenge) => {
        const baseChallenge = challenges.find((c) => c.id === challenge.challenge_id);
        const points = baseChallenge?.rewards.find((r) => r.type === 'points')?.value || 0;
        return sum + points;
      }, 0);

      // Collect badges
      progress.badges = completedChallenges.flatMap((challenge) => {
        const baseChallenge = challenges.find((c) => c.id === challenge.challenge_id);
        return baseChallenge?.rewards.filter((r) => r.type === 'badge') || [];
      });

      // Calculate participation rates
      const allParticipants = new Set();
      activeChallenges.forEach((challenge) => {
        challenge.participants.forEach((p) => allParticipants.add(p));
      });
      completedChallenges.forEach((challenge) => {
        challenge.participants.forEach((p) => allParticipants.add(p));
      });

      allParticipants.forEach((participant) => {
        const participantActive = activeChallenges.filter((c) =>
          c.participants.includes(participant)
        ).length;
        const participantCompleted = completedChallenges.filter((c) =>
          c.participants.includes(participant)
        ).length;

        progress.participation[participant] = {
          active: participantActive,
          completed: participantCompleted,
          total: participantActive + participantCompleted,
          rate: Math.round(
            ((participantActive + participantCompleted) /
              (activeChallenges.length + completedChallenges.length)) *
              100
          ),
        };
      });

      return progress;
    } catch (error) {
      console.error('Error calculating family progress:', error);
      return {};
    }
  };

  // Get challenge leaderboard
  const getChallengeLeaderboard = async () => {
    try {
      // This would query database for family rankings
      return [
        { familyName: 'The Smith Family', points: 1250, challenges: 8, rank: 1 },
        { familyName: 'The Johnson Family', points: 1100, challenges: 7, rank: 2 },
        { familyName: 'The Williams Family', points: 950, challenges: 6, rank: 3 },
        {
          familyName: 'Your Family',
          points: familyProgress.totalPoints || 0,
          challenges: completedChallenges.length,
          rank: 4,
        },
      ];
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  };

  // Helper functions
  const initializeChallengeProgress = (challenge) => {
    return {
      requirements: challenge.requirements.map((req) => ({
        ...req,
        current: 0,
        completed: false,
      })),
      overall: 0,
      started_at: new Date().toISOString(),
    };
  };

  const calculateOverallProgress = (requirements) => {
    const totalTarget = requirements.reduce((sum, req) => sum + req.target, 0);
    const totalCurrent = requirements.reduce((sum, req) => sum + req.current, 0);
    return Math.round((totalCurrent / totalTarget) * 100);
  };

  const getDurationInMs = (duration) => {
    const match = duration.match(/(\d+)\s*(day|days|week|weeks|month|months)/);
    if (!match) return 7 * 24 * 60 * 60 * 1000; // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'day':
      case 'days':
        return value * 24 * 60 * 60 * 1000;
      case 'week':
      case 'weeks':
        return value * 7 * 24 * 60 * 60 * 1000;
      case 'month':
      case 'months':
        return value * 30 * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000;
    }
  };

  const getFamilyMembers = async () => {
    try {
      const { data } = await db.getChildProfiles(user?.id);
      return data?.map((child) => child.id) || [];
    } catch (error) {
      console.error('Error getting family members:', error);
      return [];
    }
  };

  const awardChallengeRewards = async (participantId, challenge) => {
    const baseChallenge = challenges.find((c) => c.id === challenge.challenge_id);
    if (!baseChallenge) return;

    for (const reward of baseChallenge.rewards) {
      switch (reward.type) {
        case 'badge':
          await db.addBadge(participantId, reward.name, reward.icon);
          break;
        case 'points':
          await db.updatePoints(participantId, reward.value);
          break;
        case 'unlock':
          await db.unlockContent(participantId, reward.content);
          break;
      }
    }
  };

  const generateChallengeCelebration = async (challenge) => {
    // Generate celebration content (animations, messages, etc.)
    console.log(`🎉 Family completed challenge: ${challenge.challenge_id}`);
  };

  // Load challenges when component mounts
  useEffect(() => {
    if (user?.id) {
      loadFamilyChallenges();
    }
  }, [user?.id]);

  return (
    <FamilyChallengesContext.Provider
      value={{
        challenges,
        activeChallenges,
        completedChallenges,
        familyProgress,
        loading,
        loadFamilyChallenges,
        startFamilyChallenge,
        updateChallengeProgress,
        getChallengeLeaderboard,
      }}
    >
      {children}
    </FamilyChallengesContext.Provider>
  );
}

export const useFamilyChallenges = () => {
  const ctx = useContext(FamilyChallengesContext);
  if (!ctx) throw new Error('useFamilyChallenges must be inside FamilyChallengesProvider');
  return ctx;
};

// Simple UID generator for challenge instances
function uid() {
  return Math.random().toString(36).substr(2, 9);
}

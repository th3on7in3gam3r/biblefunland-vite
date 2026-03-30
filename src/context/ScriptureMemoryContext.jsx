import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import { useChildSwitcher } from './ChildSwitcherContext';
import * as db from '../lib/db';
import { requestQueue } from '../lib/requestQueue';

const ScriptureMemoryContext = createContext(null);

export function ScriptureMemoryProvider({ children }) {
  const { user, profile } = useAuth();
  const { activeChild, isChildSession } = useChildSwitcher();
  const [memoryVerses, setMemoryVerses] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get the current user ID (parent or child)
  const getCurrentUserId = () => {
    if (isChildSession && activeChild) {
      return activeChild.id;
    }
    return user?.id;
  };

  // Get the user type for database queries
  const getUserType = () => {
    return isChildSession ? 'child' : 'parent';
  };

  // Load memory verses for current user
  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      loadMemoryVerses(userId);
    }
  }, [getCurrentUserId()]);

  const loadMemoryVerses = async (userId) => {
    setLoading(true);
    try {
      const result = await requestQueue.execute(
        `memory-verses:${userId}`,
        () => db.getMemoryVerses(userId, getUserType()),
        { priority: 4, cacheable: true, ttl: 10 * 60 * 1000 }
      );
      setMemoryVerses(result?.data || []);
    } catch (error) {
      console.error('Error loading memory verses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add a new memory verse
  const addMemoryVerse = async (verseData) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      const newVerse = {
        reference: verseData.reference,
        text: verseData.text,
        category: verseData.category || 'general',
        difficulty: verseData.difficulty || 'medium',
        assigned_by: user?.id,
        assigned_to: userId,
        user_type: getUserType(),
        status: 'assigned',
        assigned_date: new Date().toISOString().split('T')[0],
      };

      await db.addMemoryVerse(newVerse);
      await loadMemoryVerses(userId);

      // Track activity
      if (isChildSession && activeChild) {
        await db.addChildActivity(activeChild.id, 'verse_assigned', {
          verse_reference: verseData.reference,
          assigned_by_parent: user?.id,
        });
      }

      return newVerse;
    } catch (error) {
      console.error('Error adding memory verse:', error);
      throw error;
    }
  };

  // Mark verse as memorized
  const markVerseMemorized = async (verseId) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      await db.updateMemoryVerse(verseId, {
        status: 'memorized',
        memorized_date: new Date().toISOString().split('T')[0],
      });

      await loadMemoryVerses(userId);

      // Track activity
      if (isChildSession && activeChild) {
        const verse = memoryVerses.find((v) => v.id === verseId);
        if (verse) {
          await db.addChildActivity(activeChild.id, 'verse_memorized', {
            verse_reference: verse.reference,
            difficulty: verse.difficulty,
          });
        }
      }
    } catch (error) {
      console.error('Error marking verse memorized:', error);
      throw error;
    }
  };

  // Update verse progress
  const updateVerseProgress = async (verseId, progress) => {
    const userId = getCurrentUserId();
    if (!userId) return;

    try {
      await db.updateMemoryVerse(verseId, {
        progress: Math.min(100, Math.max(0, progress)),
        last_practiced: new Date().toISOString().split('T')[0],
      });

      await loadMemoryVerses(userId);
    } catch (error) {
      console.error('Error updating verse progress:', error);
      throw error;
    }
  };

  // Get memory statistics
  const getMemoryStats = () => {
    const assigned = memoryVerses.filter((v) => v.status === 'assigned').length;
    const practicing = memoryVerses.filter((v) => v.status === 'practicing').length;
    const memorized = memoryVerses.filter((v) => v.status === 'memorized').length;

    const byDifficulty = {
      easy: memoryVerses.filter((v) => v.difficulty === 'easy' && v.status === 'memorized').length,
      medium: memoryVerses.filter((v) => v.difficulty === 'medium' && v.status === 'memorized')
        .length,
      hard: memoryVerses.filter((v) => v.difficulty === 'hard' && v.status === 'memorized').length,
    };

    const byCategory = memoryVerses.reduce((acc, verse) => {
      if (!acc[verse.category]) acc[verse.category] = { total: 0, memorized: 0 };
      acc[verse.category].total++;
      if (verse.status === 'memorized') acc[verse.category].memorized++;
      return acc;
    }, {});

    return { assigned, practicing, memorized, byDifficulty, byCategory };
  };

  return (
    <ScriptureMemoryContext.Provider
      value={{
        memoryVerses,
        loading,
        addMemoryVerse,
        markVerseMemorized,
        updateVerseProgress,
        getMemoryStats,
        isChildSession,
        activeChild,
      }}
    >
      {children}
    </ScriptureMemoryContext.Provider>
  );
}

export const useScriptureMemory = () => {
  const ctx = useContext(ScriptureMemoryContext);
  if (!ctx) throw new Error('useScriptureMemory must be inside ScriptureMemoryProvider');
  return ctx;
};

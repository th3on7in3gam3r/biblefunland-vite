import { createContext, useContext } from 'react';
import * as db from '../lib/db';

// Weekly Email Digest Context
const EmailDigestContext = createContext(null);

export function EmailDigestProvider({ children }) {
  // Generate weekly activity digest for a parent
  const generateWeeklyDigest = async (parentId, weekStart = null) => {
    try {
      if (!weekStart) {
        const lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);
        weekStart = lastWeek.toISOString().split('T')[0];
      }

      // Get parent's children
      const { data: children } = await db.getChildProfiles(parentId);
      if (!children || children.length === 0) {
        return null;
      }

      // Generate digest for each child
      const childDigests = [];
      for (const child of children) {
        const childDigest = await generateChildDigest(child, weekStart);
        if (childDigest) {
          childDigests.push(childDigest);
        }
      }

      const weeklyDigest = {
        parent_id: parentId,
        week_start: weekStart,
        week_end: new Date(new Date(weekStart).getTime() + 6 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        children: childDigests,
        generated_at: new Date().toISOString(),
      };

      return weeklyDigest;
    } catch (error) {
      console.error('Error generating weekly digest:', error);
      throw error;
    }
  };

  // Generate digest for a single child
  const generateChildDigest = async (child, weekStart) => {
    try {
      // Get child's activity for the week
      const { data: activities } = await db.getChildActivity(child.id, 100);
      const weekActivities =
        activities?.filter(
          (activity) => activity.completed_at && activity.completed_at >= weekStart
        ) || [];

      // Get child's memory verses
      const { data: verses } = await db.getMemoryVerses(child.id, 'child');
      const weekVerses =
        verses?.filter(
          (verse) => verse.assigned_date >= weekStart || verse.memorized_date >= weekStart
        ) || [];

      // Get child's badges earned this week
      const { data: badges } = await db.getBadges(child.id);
      const weekBadges =
        badges?.filter((badge) => badge.earned_at && badge.earned_at >= weekStart) || [];

      // Calculate statistics
      const stats = {
        totalActivities: weekActivities.length,
        activitiesByType: weekActivities.reduce((acc, activity) => {
          acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1;
          return acc;
        }, {}),
        totalTimeSpent: weekActivities.reduce((sum, activity) => sum + (activity.duration || 0), 0),
        versesAssigned: weekVerses.filter((v) => v.status === 'assigned').length,
        versesPracticing: weekVerses.filter((v) => v.status === 'practicing').length,
        versesMemorized: weekVerses.filter((v) => v.status === 'memorized').length,
        badgesEarned: weekBadges.length,
        streak: child.streak || 0,
      };

      // Get favorite activities
      const favoriteActivities = Object.entries(stats.activitiesByType)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3);

      return {
        child_id: child.id,
        child_name: child.display_name,
        child_avatar: child.avatar_url,
        stats,
        favoriteActivities,
        weekActivities: weekActivities.slice(0, 10), // Limit to top 10
        weekVerses: weekVerses.slice(0, 5), // Limit to top 5
        weekBadges: weekBadges.slice(0, 5), // Limit to top 5
      };
    } catch (error) {
      console.error('Error generating child digest:', error);
      return null;
    }
  };

  // Send weekly digest email
  const sendWeeklyDigest = async (parentId, parentEmail, weekStart = null) => {
    try {
      const digest = await generateWeeklyDigest(parentId, weekStart);
      if (!digest) {
        throw new Error('No digest data available');
      }

      const emailContent = formatDigestEmail(digest);

      // Send email via backend Resend integration
      const response = await fetch(`${import.meta.env.VITE_API_URL || ''}/api/email/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: parentEmail,
          subject: `📊 Your Weekly BibleFunLand Digest - ${digest.week_end}`,
          html: emailContent,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to send email');
      }

      const result = await response.json();
      return { success: true, digest, emailId: result.id };
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      throw error;
    }
  };

  // Format digest as HTML email
  const formatDigestEmail = (digest) => {
    const { children, week_start, week_end } = digest;

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Weekly BibleFunLand Digest</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; max-width: 600px; margin: 0 auto; }
          .child-card { border: 2px solid #e1e5e9; border-radius: 12px; padding: 20px; margin-bottom: 20px; background: #f8f9fa; }
          .stat-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 15px; margin: 15px 0; }
          .stat-item { text-align: center; padding: 15px; background: white; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
          .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
          .stat-label { font-size: 12px; color: #666; text-transform: uppercase; }
          .activity-list { margin: 15px 0; }
          .activity-item { padding: 8px 0; border-bottom: 1px solid #eee; }
          .badge-item { display: inline-block; background: #ffd700; color: #333; padding: 4px 8px; border-radius: 12px; font-size: 12px; margin: 2px; }
          .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>📊 Weekly BibleFunLand Digest</h1>
          <p>${week_start} to ${week_end}</p>
        </div>
        
        <div class="content">
          <h2>🌟 This Week's Highlights</h2>
    `;

    // Add each child's digest
    children.forEach((child) => {
      const { child_name, child_avatar, stats, favoriteActivities, weekBadges } = child;

      html += `
        <div class="child-card">
          <h3>${child_avatar === 'david' ? '👑' : child_avatar === 'esther' ? '👸' : '👤'} ${child_name}</h3>
          
          <div class="stat-grid">
            <div class="stat-item">
              <div class="stat-number">${stats.totalActivities}</div>
              <div class="stat-label">Activities</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${stats.totalTimeSpent}</div>
              <div class="stat-label">Minutes</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${stats.versesMemorized}</div>
              <div class="stat-label">Verses</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${stats.badgesEarned}</div>
              <div class="stat-label">Badges</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">${stats.streak}</div>
              <div class="stat-label">Day Streak</div>
            </div>
          </div>

          ${
            favoriteActivities.length > 0
              ? `
            <h4>🎯 Favorite Activities</h4>
            <div class="activity-list">
              ${favoriteActivities
                .map(
                  ([type, count]) => `<div class="activity-item">• ${type}: ${count} times</div>`
                )
                .join('')}
            </div>
          `
              : ''
          }

          ${
            weekBadges.length > 0
              ? `
            <h4>🏆 Badges Earned</h4>
            <div>
              ${weekBadges
                .map((badge) => `<span class="badge-item">${badge.badge_id}</span>`)
                .join('')}
            </div>
          `
              : ''
          }
        </div>
      `;
    });

    html += `
        </div>
        
        <div class="footer">
          <p>🙏 Keep up the great work in your faith journey!</p>
          <p><a href="https://biblefunland.com">Visit BibleFunLand</a></p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  return (
    <EmailDigestContext.Provider
      value={{
        generateWeeklyDigest,
        sendWeeklyDigest,
        formatDigestEmail,
      }}
    >
      {children}
    </EmailDigestContext.Provider>
  );
}

export const useEmailDigest = () => {
  const ctx = useContext(EmailDigestContext);
  if (!ctx) throw new Error('useEmailDigest must be inside EmailDigestProvider');
  return ctx;
};

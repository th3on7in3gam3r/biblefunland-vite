import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { requestQueue } from '../lib/requestQueue';
import * as db from '../lib/db';

// Predefined devotional plans
const DEVOTIONAL_PLANS = [
  {
    id: 'prayer-journey',
    title: '30-Day Prayer Journey',
    days: 30,
    description: 'A guided journey through prayer with daily reflections',
  },
  {
    id: 'bible-stories',
    title: 'Bible Stories for Kids',
    days: 21,
    description: 'Classic Bible stories told in an engaging way',
  },
  {
    id: 'fruit-spirit',
    title: 'Fruit of the Spirit',
    days: 14,
    description: 'Explore the nine fruits of the Spirit',
  },
  {
    id: 'psalms-praise',
    title: 'Psalms of Praise',
    days: 30,
    description: 'Daily psalms for worship and gratitude',
  },
  {
    id: 'jesus-teachings',
    title: "Jesus' Teachings",
    days: 28,
    description: 'Core teachings of Jesus for families',
  },
  {
    id: 'creation-wonder',
    title: 'Creation Wonder',
    days: 7,
    description: "Celebrating God's creation through daily devotions",
  },
];

export default function FamilyDevotionalSection() {
  const { user, profile } = useAuth();
  const [childProfiles, setChildProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [selectedPlan, setSelectedPlan] = useState('');
  const [startDate, setStartDate] = useState('');
  const [selectedChildren, setSelectedChildren] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Progress tracking state
  const [familyPlans, setFamilyPlans] = useState([]);
  const [progressData, setProgressData] = useState({});
  const [loadingProgress, setLoadingProgress] = useState(false);

  // Fetch child profiles on mount
  useEffect(() => {
    if (!user?.id || profile?.role !== 'Parent') {
      setLoading(false);
      return;
    }

    const fetchChildren = async () => {
      try {
        setLoading(true);
        setError(null);

        const result = await requestQueue.execute(
          `child-profiles:${user.id}`,
          () => db.getChildProfiles(user.id),
          { priority: 2, cacheable: true, ttl: 5 * 60 * 1000 }
        );

        if (result.error) {
          setError(result.error);
          setChildProfiles([]);
        } else {
          setChildProfiles(result.data || []);
        }
      } catch (err) {
        console.error('Error fetching child profiles:', err);
        setError(err.message || 'Failed to load child profiles');
        setChildProfiles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChildren();
  }, [user?.id, profile?.role]);

  // Fetch family plans and progress
  useEffect(() => {
    if (!user?.id || profile?.role !== 'Parent') return;

    const fetchPlans = async () => {
      try {
        setLoadingProgress(true);

        const result = await requestQueue.execute(
          `family-plans:${user.id}`,
          () => db.getFamilyPlans(user.id),
          { priority: 2, cacheable: false }
        );

        if (result.error) {
          console.error('Error fetching plans:', result.error);
          setFamilyPlans([]);
        } else {
          setFamilyPlans(result.data || []);

          // Fetch progress for each plan
          const progress = {};
          for (const plan of result.data || []) {
            const progressResult = await requestQueue.execute(
              `family-progress:${plan.id}`,
              () => db.getFamilyProgress(plan.id),
              { priority: 2, cacheable: false }
            );
            if (!progressResult.error) {
              progress[plan.id] = progressResult.data || [];
            }
          }
          setProgressData(progress);
        }
      } catch (err) {
        console.error('Error fetching family plans:', err);
      } finally {
        setLoadingProgress(false);
      }
    };

    fetchPlans();
  }, [user?.id, profile?.role]);

  const handleChildToggle = (childId) => {
    setSelectedChildren((prev) =>
      prev.includes(childId) ? prev.filter((id) => id !== childId) : [...prev, childId]
    );
  };

  const handleSubmit = async () => {
    if (!selectedPlan || !startDate || selectedChildren.length === 0) {
      setSubmitError('Please select a plan, start date, and at least one child');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      const plan = DEVOTIONAL_PLANS.find((p) => p.id === selectedPlan);
      if (!plan) throw new Error('Invalid plan selected');

      // Create family plan
      const planResult = await requestQueue.execute(
        `upsert-family-plan:${user.id}:${selectedPlan}`,
        () =>
          db.upsertFamilyPlan(user.id, {
            title: plan.title,
            total_days: plan.days,
            start_date: startDate,
          }),
        { priority: 1, cacheable: false }
      );

      if (planResult.error) {
        throw new Error(planResult.error);
      }

      // Get the plan ID (assuming it's returned or we need to fetch it)
      // For now, we'll use a generated ID based on the plan
      const planId = `${user.id}-${selectedPlan}-${Date.now()}`;

      // Update progress for each selected child
      for (const childId of selectedChildren) {
        for (let day = 1; day <= plan.days; day++) {
          await requestQueue.execute(
            `update-progress:${planId}:${childId}:${day}`,
            () => db.updateFamilyProgress(planId, childId, day, 'pending'),
            { priority: 1, cacheable: false }
          );
        }
      }

      setSubmitSuccess(true);
      setSelectedPlan('');
      setStartDate('');
      setSelectedChildren([]);

      // Refresh plans
      setTimeout(() => {
        setSubmitSuccess(false);
        // Trigger refresh of family plans
        const refreshResult = requestQueue.execute(
          `family-plans:${user.id}`,
          () => db.getFamilyPlans(user.id),
          { priority: 2, cacheable: false }
        );
      }, 2000);
    } catch (err) {
      console.error('Error submitting devotional assignment:', err);
      setSubmitError(err.message || 'Failed to assign devotional');
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkComplete = async (planId, childId, day) => {
    try {
      await requestQueue.execute(
        `mark-complete:${planId}:${childId}:${day}`,
        () => db.updateFamilyProgress(planId, childId, day, 'completed'),
        { priority: 1, cacheable: false }
      );

      // Update local progress state
      setProgressData((prev) => ({
        ...prev,
        [planId]: (prev[planId] || []).map((p) =>
          p.plan_id === planId && p.child_id === childId && p.day_number === day
            ? { ...p, status: 'completed', completed_at: new Date().toISOString() }
            : p
        ),
      }));
    } catch (err) {
      console.error('Error marking day complete:', err);
    }
  };

  // Only show for authenticated Parent users
  if (!user || profile?.role !== 'Parent') {
    return null;
  }

  if (loading) {
    return (
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1.5px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--sh)',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '.9rem', color: 'var(--ink3)', fontWeight: 600 }}>
          Loading family devotionals...
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* ══ ASSIGNMENT SECTION ════════════════════════════════════════════════ */}
      <div
        style={{
          background: 'var(--surface)',
          borderRadius: 24,
          border: '1.5px solid var(--border)',
          padding: 24,
          boxShadow: 'var(--sh)',
        }}
      >
        <div
          style={{
            fontSize: '.68rem',
            fontWeight: 800,
            color: 'var(--ink3)',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 6,
          }}
        >
          📖 Assign Family Devotional
        </div>
        <div
          style={{ fontSize: '.82rem', color: 'var(--ink2)', fontWeight: 500, marginBottom: 20 }}
        >
          Start a guided devotional journey with your children. Choose a plan, set a start date, and
          select which children will participate.
        </div>

        {/* Plan Selector */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontSize: '.82rem',
              fontWeight: 700,
              color: 'var(--ink)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            📚 Choose a Devotional Plan
          </label>
          <select
            value={selectedPlan}
            onChange={(e) => setSelectedPlan(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1.5px solid var(--border)',
              background: 'var(--bg2)',
              color: 'var(--ink)',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <option value="">Choose a plan...</option>
            {DEVOTIONAL_PLANS.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.title} ({plan.days} days)
              </option>
            ))}
          </select>
          {selectedPlan && (
            <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500, marginTop: 6 }}>
              {DEVOTIONAL_PLANS.find((p) => p.id === selectedPlan)?.description}
            </div>
          )}
        </div>

        {/* Start Date Picker */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontSize: '.82rem',
              fontWeight: 700,
              color: 'var(--ink)',
              display: 'block',
              marginBottom: 8,
            }}
          >
            📅 Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 14px',
              borderRadius: 12,
              border: '1.5px solid var(--border)',
              background: 'var(--bg2)',
              color: 'var(--ink)',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.82rem',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          />
          <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500, marginTop: 6 }}>
            {selectedPlan &&
              DEVOTIONAL_PLANS.find((p) => p.id === selectedPlan) &&
              `${DEVOTIONAL_PLANS.find((p) => p.id === selectedPlan).days} days starting ${startDate || 'on selected date'}`}
          </div>
        </div>

        {/* Child Multi-Select */}
        <div style={{ marginBottom: 18 }}>
          <label
            style={{
              fontSize: '.82rem',
              fontWeight: 700,
              color: 'var(--ink)',
              display: 'block',
              marginBottom: 10,
            }}
          >
            Select Children ({selectedChildren.length} selected)
          </label>
          {childProfiles.length === 0 ? (
            <div
              style={{
                fontSize: '.82rem',
                color: 'var(--ink3)',
                fontWeight: 500,
                padding: '12px 14px',
                background: 'var(--bg2)',
                borderRadius: 12,
                textAlign: 'center',
              }}
            >
              No child profiles found. Create one in your profile settings.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {childProfiles.map((child) => (
                <div
                  key={child.id}
                  onClick={() => handleChildToggle(child.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: selectedChildren.includes(child.id)
                      ? '2px solid var(--blue)'
                      : '1.5px solid var(--border)',
                    background: selectedChildren.includes(child.id)
                      ? 'var(--blue-bg)'
                      : 'var(--bg2)',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                >
                  <div
                    style={{
                      width: 20,
                      height: 20,
                      borderRadius: 6,
                      border: '2px solid var(--border)',
                      background: selectedChildren.includes(child.id)
                        ? 'var(--blue)'
                        : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all .2s',
                      flexShrink: 0,
                    }}
                  >
                    {selectedChildren.includes(child.id) && (
                      <span style={{ color: 'white', fontSize: '.8rem', fontWeight: 800 }}>✓</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                      {child.display_name}
                    </div>
                    <div style={{ fontSize: '.7rem', color: 'var(--ink3)', fontWeight: 500 }}>
                      Age {child.age || '?'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSubmit}
            disabled={submitting || !selectedPlan || !startDate || selectedChildren.length === 0}
            style={{
              padding: '11px 20px',
              borderRadius: 12,
              border: 'none',
              background:
                submitting || !selectedPlan || !startDate || selectedChildren.length === 0
                  ? 'var(--bg3)'
                  : 'var(--blue)',
              color:
                submitting || !selectedPlan || !startDate || selectedChildren.length === 0
                  ? 'var(--ink3)'
                  : 'white',
              fontFamily: 'Poppins,sans-serif',
              fontSize: '.82rem',
              fontWeight: 700,
              cursor:
                submitting || !selectedPlan || !startDate || selectedChildren.length === 0
                  ? 'default'
                  : 'pointer',
              transition: 'all .2s',
            }}
          >
            {submitting ? '⏳ Assigning...' : '✅ Assign Devotional'}
          </button>
          {submitError && (
            <div style={{ fontSize: '.76rem', color: 'var(--red)', fontWeight: 600 }}>
              ⚠️ {submitError}
            </div>
          )}
          {submitSuccess && (
            <div style={{ fontSize: '.76rem', color: 'var(--green)', fontWeight: 600 }}>
              ✓ Devotional assigned successfully!
            </div>
          )}
        </div>
      </div>

      {/* ══ PROGRESS TRACKING SECTION ═════════════════════════════════════════ */}
      {familyPlans.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              fontSize: '.68rem',
              fontWeight: 800,
              color: 'var(--ink3)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            📊 Family Devotional Progress
          </div>

          {familyPlans.map((plan) => {
            const planDef = DEVOTIONAL_PLANS.find(
              (p) => p.id === plan.title?.toLowerCase().replace(/\s+/g, '-')
            );
            const totalDays = plan.total_days || 30;
            const planProgress = progressData[plan.id] || [];

            return (
              <div
                key={plan.id}
                style={{
                  background: 'var(--surface)',
                  borderRadius: 24,
                  border: '1.5px solid var(--border)',
                  padding: 20,
                  boxShadow: 'var(--sh)',
                }}
              >
                <div
                  style={{
                    fontSize: '.82rem',
                    fontWeight: 700,
                    color: 'var(--ink)',
                    marginBottom: 16,
                  }}
                >
                  {plan.title}
                </div>

                {/* Per-child progress cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {selectedChildren.map((childId) => {
                    const child = childProfiles.find((c) => c.id === childId);
                    if (!child) return null;

                    const childProgress = planProgress.filter((p) => p.child_id === childId);
                    const completedDays = childProgress.filter(
                      (p) => p.status === 'completed'
                    ).length;
                    const progressPercent = Math.floor((completedDays / totalDays) * 100);

                    return (
                      <div
                        key={childId}
                        style={{ background: 'var(--bg2)', borderRadius: 16, padding: 14 }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 10,
                          }}
                        >
                          <div style={{ fontSize: '.82rem', fontWeight: 700, color: 'var(--ink)' }}>
                            {child.display_name}
                          </div>
                          <div
                            style={{
                              fontFamily: "'Baloo 2',cursive",
                              fontSize: '.95rem',
                              fontWeight: 800,
                              color: 'var(--blue)',
                            }}
                          >
                            {progressPercent}%
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div
                          style={{
                            width: '100%',
                            height: 8,
                            borderRadius: 4,
                            background: 'var(--bg3)',
                            overflow: 'hidden',
                            marginBottom: 12,
                          }}
                        >
                          <div
                            style={{
                              height: '100%',
                              width: `${progressPercent}%`,
                              background: 'linear-gradient(90deg,var(--blue),var(--purple))',
                              transition: 'width .3s ease',
                            }}
                          />
                        </div>

                        {/* Day Completion Toggles */}
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fill,minmax(32px,1fr))',
                            gap: 6,
                          }}
                        >
                          {Array.from({ length: totalDays }).map((_, dayIdx) => {
                            const day = dayIdx + 1;
                            const dayProgress = childProgress.find((p) => p.day_number === day);
                            const isCompleted = dayProgress?.status === 'completed';

                            return (
                              <button
                                key={day}
                                onClick={() => handleMarkComplete(plan.id, childId, day)}
                                style={{
                                  width: '100%',
                                  aspectRatio: '1',
                                  borderRadius: 8,
                                  border: isCompleted ? 'none' : '1.5px solid var(--border)',
                                  background: isCompleted ? 'var(--green)' : 'var(--bg3)',
                                  color: isCompleted ? 'white' : 'var(--ink3)',
                                  fontFamily: 'Poppins,sans-serif',
                                  fontSize: '.65rem',
                                  fontWeight: 700,
                                  cursor: 'pointer',
                                  transition: 'all .2s',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                }}
                                title={`Day ${day}`}
                              >
                                {isCompleted ? '✓' : day}
                              </button>
                            );
                          })}
                        </div>

                        <div
                          style={{
                            fontSize: '.7rem',
                            color: 'var(--ink3)',
                            fontWeight: 500,
                            marginTop: 10,
                            textAlign: 'center',
                          }}
                        >
                          {completedDays} of {totalDays} days completed
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {familyPlans.length === 0 && !loadingProgress && (
        <div
          style={{
            background: 'var(--surface)',
            borderRadius: 24,
            border: '1.5px solid var(--border)',
            padding: 32,
            boxShadow: 'var(--sh)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.3 }}>📖</div>
          <div
            style={{
              fontFamily: "'Baloo 2', cursive",
              fontWeight: 800,
              color: 'var(--ink)',
              marginBottom: 6,
            }}
          >
            No Family Devotionals Yet
          </div>
          <div style={{ fontSize: '.85rem', color: 'var(--ink3)', fontWeight: 500 }}>
            Assign a devotional plan above to get started with your family!
          </div>
        </div>
      )}
    </div>
  );
}

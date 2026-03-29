import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { requestQueue } from '../lib/requestQueue'

export default function AggregatedProgressSection() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [aggregatedStats, setAggregatedStats] = useState(null)
  const [studentCount, setStudentCount] = useState(0)

  useEffect(() => {
    if (!user?.id) return

    const fetchAggregatedProgress = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all classrooms for this teacher
        const classroomsRes = await requestQueue.execute(
          `teacher-classrooms:${user.id}`,
          async () => {
            const response = await fetch(`/api/classrooms?teacherId=${user.id}`)
            if (!response.ok) throw new Error('Failed to fetch classrooms')
            return response.json()
          },
          { priority: 2, cacheable: true, ttl: 5 * 60 * 1000 }
        )

        const classrooms = classroomsRes?.data || []
        if (classrooms.length === 0) {
          setAggregatedStats(null)
          setStudentCount(0)
          setLoading(false)
          return
        }

        // Collect all student IDs from all classrooms
        const allStudentIds = new Set()
        for (const classroom of classrooms) {
          const classroomRes = await requestQueue.execute(
            `classroom-students:${classroom.id}`,
            async () => {
              const response = await fetch(`/api/classrooms/${classroom.id}/students`)
              if (!response.ok) throw new Error('Failed to fetch students')
              return response.json()
            },
            { priority: 2, cacheable: true, ttl: 5 * 60 * 1000 }
          )

          const students = classroomRes?.data?.students || []
          students.forEach(student => {
            if (student.id) allStudentIds.add(student.id)
          })
        }

        if (allStudentIds.size === 0) {
          setAggregatedStats(null)
          setStudentCount(0)
          setLoading(false)
          return
        }

        // Fetch progress for each student
        const progressPromises = Array.from(allStudentIds).map(studentId =>
          requestQueue.execute(
            `student-progress:${studentId}`,
            async () => {
              const response = await fetch(`/api/progress/${studentId}?period=7d`)
              if (!response.ok) return null
              return response.json()
            },
            { priority: 3, cacheable: true, ttl: 5 * 60 * 1000 }
          )
        )

        const progressResults = await Promise.all(progressPromises)
        const validResults = progressResults.filter(r => r?.data)

        if (validResults.length === 0) {
          setAggregatedStats(null)
          setStudentCount(allStudentIds.size)
          setLoading(false)
          return
        }

        // Calculate averages
        const avgStreak = Math.round(
          validResults.reduce((sum, r) => sum + (r.data.streak || 0), 0) / validResults.length
        )
        const avgDaysRead = Math.round(
          validResults.reduce((sum, r) => sum + (r.data.totalDaysRead || 0), 0) / validResults.length
        )
        const avgBadges = Math.round(
          validResults.reduce((sum, r) => sum + (r.data.badgesEarned || 0), 0) / validResults.length
        )
        const avgQuizzes = Math.round(
          validResults.reduce((sum, r) => sum + (r.data.quizzesCompleted || 0), 0) / validResults.length
        )
        const avgAccuracy = Math.round(
          validResults.reduce((sum, r) => sum + (r.data.quizAccuracy || 0), 0) / validResults.length
        )
        const totalQuizzes = validResults.reduce((sum, r) => sum + (r.data.quizzesCompleted || 0), 0)

        setAggregatedStats({
          avgStreak,
          avgDaysRead,
          avgBadges,
          avgQuizzes,
          avgAccuracy,
          totalQuizzes,
        })
        setStudentCount(allStudentIds.size)
      } catch (err) {
        console.error('Error fetching aggregated progress:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchAggregatedProgress()
  }, [user?.id])

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink3)' }}>
        Loading aggregated progress...
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--red)' }}>
        Error loading progress data: {error}
      </div>
    )
  }

  if (!aggregatedStats) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: 'var(--ink3)' }}>
        No student progress data available yet.
      </div>
    )
  }

  const statCardStyle = {
    background: 'var(--surface)',
    border: '1.5px solid var(--border)',
    borderRadius: 12,
    padding: '16px',
    textAlign: 'center',
    flex: 1,
    minWidth: 120,
  }

  const statValueStyle = {
    fontSize: '1.8rem',
    fontWeight: 800,
    color: 'var(--blue)',
    marginBottom: 4,
    fontFamily: "'Baloo 2', cursive",
  }

  const statLabelStyle = {
    fontSize: '.8rem',
    color: 'var(--ink2)',
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <div
        style={{
          background: 'linear-gradient(135deg,rgba(99,102,241,.1),rgba(139,92,246,.08))',
          border: '1.5px solid rgba(99,102,241,.2)',
          borderRadius: 16,
          padding: '20px',
          marginBottom: 20,
        }}
      >
        <div
          style={{
            fontFamily: "'Baloo 2', cursive",
            fontSize: '1.3rem',
            fontWeight: 800,
            color: 'var(--ink)',
            marginBottom: 8,
          }}
        >
          📊 Aggregated Progress
        </div>
        <div style={{ fontSize: '.85rem', color: 'var(--ink2)', fontWeight: 500 }}>
          Anonymized averages across {studentCount} student{studentCount !== 1 ? 's' : ''} — no names or identifying information
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 12,
        }}
      >
        <div style={statCardStyle}>
          <div style={statValueStyle}>{aggregatedStats.avgStreak}</div>
          <div style={statLabelStyle}>Avg Streak</div>
        </div>

        <div style={statCardStyle}>
          <div style={statValueStyle}>{aggregatedStats.avgDaysRead}</div>
          <div style={statLabelStyle}>Avg Days Read</div>
        </div>

        <div style={statCardStyle}>
          <div style={statValueStyle}>{aggregatedStats.avgBadges}</div>
          <div style={statLabelStyle}>Avg Badges</div>
        </div>

        <div style={statCardStyle}>
          <div style={statValueStyle}>{aggregatedStats.avgQuizzes}</div>
          <div style={statLabelStyle}>Avg Quizzes</div>
        </div>

        <div style={statCardStyle}>
          <div style={statValueStyle}>{aggregatedStats.avgAccuracy}%</div>
          <div style={statLabelStyle}>Avg Accuracy</div>
        </div>

        <div style={statCardStyle}>
          <div style={statValueStyle}>{aggregatedStats.totalQuizzes}</div>
          <div style={statLabelStyle}>Total Quizzes</div>
        </div>
      </div>
    </div>
  )
}

import { createContext, useContext, useEffect, useState } from 'react'
import { getStreak, upsertStreak } from '../lib/db'
import { useAuth } from './AuthContext'

const StreakContext = createContext(null)

function todayStr() {
  return new Date().toISOString().split('T')[0]
}

function getLocalState() {
  try {
    return JSON.parse(localStorage.getItem('bfl_streak') ?? '{}')
  } catch {
    return {}
  }
}

function setLocalState(data) {
  localStorage.setItem('bfl_streak', JSON.stringify(data))
}

export function StreakProvider({ children }) {
  const { user } = useAuth()
  const [streak, setStreak] = useState(0)
  const [readDays, setReadDays] = useState([])
  const [checkedToday, setCheckedToday] = useState(false)
  const [checkinCount, setCheckinCount] = useState(0)

  // Load from Turso (if logged in) or localStorage
  useEffect(() => {
    if (user) {
      getStreak(user.id).then(({ data }) => {
        if (data) {
          setStreak(data.streak ?? 0)
          setReadDays(data.read_days ? data.read_days.split(',') : [])
          setCheckinCount(data.checkin_count ?? 0)
          setCheckedToday(data.last_checkin === todayStr())
        }
      }).catch(() => {})
    } else {
      const s = getLocalState()
      setStreak(s.streak ?? 0)
      setReadDays(s.readDays ?? [])
      setCheckinCount(s.checkinCount ?? 0)
      setCheckedToday(s.lastCheckin === todayStr())
    }
  }, [user])

  const checkIn = async () => {
    if (checkedToday) return
    const today = todayStr()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

    const local = getLocalState()
    const isConsecutive = local.lastCheckin === yesterdayStr
    const newStreak = isConsecutive ? (local.streak ?? 0) + 1 : 1
    const newReadDays = [...(local.readDays ?? []), today].filter((d, i, arr) => arr.indexOf(d) === i)
    const newCheckinCount = (local.checkinCount ?? 0) + 1

    const stateUpdate = {
      streak: newStreak,
      lastCheckin: today,
      readDays: newReadDays,
      checkinCount: newCheckinCount,
    }

    setStreak(newStreak)
    setReadDays(newReadDays)
    setCheckinCount(newCheckinCount)
    setCheckedToday(true)
    setLocalState(stateUpdate)

    if (user) {
      await upsertStreak(user.id, {
        streak: newStreak,
        last_checkin: today,
        read_days: newReadDays.join(','),
        checkin_count: newCheckinCount,
      }).catch(() => {})
    }

    return newStreak
  }

  const toggleDay = async (dateStr) => {
    const isRead = readDays.includes(dateStr)
    const newReadDays = isRead
      ? readDays.filter(d => d !== dateStr)
      : [...readDays, dateStr]
    setReadDays(newReadDays)
    const updated = { ...getLocalState(), readDays: newReadDays }
    setLocalState(updated)
    if (user) await upsertStreak(user.id, { read_days: newReadDays.join(',') }).catch(() => {})
  }

  return (
    <StreakContext.Provider value={{
      streak, readDays, checkedToday,
      checkinCount, checkIn, toggleDay,
    }}>
      {children}
    </StreakContext.Provider>
  )
}

export const useStreak = () => useContext(StreakContext)

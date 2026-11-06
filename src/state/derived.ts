import { useMemo } from 'react'
import { usePlan, useRecordings, useSessions, useSettings, useSongs } from '../data/hooks'
import { monthKey } from '../lib/dates'
import { planIndex } from '../logic/plan'
import { computeStreaks, daysThisWeek } from '../logic/streaks'
import { plateauedSongs } from '../logic/reviews'
import { useToday } from './useToday'

/** Shared data + derived values used across screens. `ready` is false until IndexedDB has loaded. */
export function useAppData() {
  const today = useToday()
  const settings = useSettings()
  const sessions = useSessions()
  const songs = useSongs()
  const plan = usePlan()
  const recordings = useRecordings()

  return useMemo(() => {
    const ready = !!(settings && sessions && songs && plan && recordings)
    const practiced = (sessions ?? []).map((s) => s.date)
    const idx = planIndex(today)
    return {
      ready,
      today,
      settings,
      sessions: sessions ?? [],
      songs: songs ?? [],
      plan: plan ?? [],
      recordings: recordings ?? [],
      planIdx: idx,
      month: plan?.[idx],
      prevMonth: idx > 0 ? plan?.[idx - 1] : undefined,
      todaySession: sessions?.find((s) => s.date === today),
      streak: computeStreaks(practiced, today),
      weekDays: daysThisWeek(practiced, today),
      canPlayCount: (songs ?? []).filter((s) => s.status === 'canPlay' || s.status === 'polished').length,
      plateaued: plateauedSongs(songs ?? [], today),
      recordedThisMonth: (recordings ?? []).some((r) => r.monthKey === monthKey(today)),
    }
  }, [today, settings, sessions, songs, plan, recordings])
}

export type AppData = ReturnType<typeof useAppData>

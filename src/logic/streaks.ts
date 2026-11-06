import { addDays, eachDay, weekStart, type DateKey } from '../lib/dates'

export interface StreakInfo {
  current: number
  longest: number
  /** Missed days covered by the weekly free streak freeze. */
  frozen: Set<DateKey>
  /** Whether this week's freeze has already been spent. */
  freezeUsedThisWeek: boolean
}

/**
 * Streaks reward showing up: any logged session (including a 5-minute bad-day
 * session) counts. Each Monday–Sunday week gets one free freeze that covers one
 * missed day without resetting the streak (it doesn't add to the count either).
 * Today never breaks a streak — it's still pending until the day ends.
 */
export function computeStreaks(practiced: Iterable<DateKey>, today: DateKey): StreakInfo {
  const days = new Set(practiced)
  const frozen = new Set<DateKey>()
  const sorted = [...days].filter((d) => d <= today).sort()
  if (sorted.length === 0) return { current: 0, longest: 0, frozen, freezeUsedThisWeek: false }

  const freezeWeeks = new Set<DateKey>()
  let run = 0
  let longest = 0
  for (const d of eachDay(sorted[0], today)) {
    if (days.has(d)) {
      run++
      longest = Math.max(longest, run)
    } else if (d === today) {
      // pending
    } else if (run > 0 && !freezeWeeks.has(weekStart(d))) {
      freezeWeeks.add(weekStart(d))
      frozen.add(d)
    } else {
      run = 0
    }
  }
  return { current: run, longest, frozen, freezeUsedThisWeek: freezeWeeks.has(weekStart(today)) }
}

/** Days practiced in the Monday–Sunday week containing `today`. */
export function daysThisWeek(practiced: Iterable<DateKey>, today: DateKey): number {
  const start = weekStart(today)
  const end = addDays(start, 6)
  let n = 0
  for (const d of new Set(practiced)) if (d >= start && d <= end) n++
  return n
}

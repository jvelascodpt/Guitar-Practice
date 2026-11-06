import { addDays, type DateKey } from '../lib/dates'
import type { Session } from '../data/types'

export const EASE_DAYS = 3

/**
 * If the hand/forearm was rated "sore" on two calendar days in a row, technique
 * time is halved for the next 3 days. Returns the last eased day, or null.
 */
export function painEaseUntil(sessions: Session[], today: DateKey): DateKey | null {
  const sore = new Set(sessions.filter((s) => s.pain === 'sore').map((s) => s.date))
  let until: DateKey | null = null
  for (const d of sore) {
    if (!sore.has(addDays(d, -1))) continue
    const start = addDays(d, 1)
    const end = addDays(d, EASE_DAYS)
    if (today >= start && today <= end && (!until || end > until)) until = end
  }
  return until
}

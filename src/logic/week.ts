import { addDays, diffDays, weekStart, type DateKey } from '../lib/dates'

export type DayState = 'done' | 'frozen' | 'today' | 'missed' | 'future'

export interface WeekView {
  days: { key: DateKey; label: string; state: DayState }[]
  count: number
  target: number
  message: string
  /** The goal was reached by today's session. */
  hitToday: boolean
}

const LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

/** Encouraging line for the weekly bar. Never shames a missed day. */
export function weekMessage(count: number, target: number, practicedToday: boolean, daysLeft: number): string {
  if (count > target) return `Goal smashed: ${count} days this week. 🔥`
  if (count === target) return 'Weekly goal hit! 🎸 Anything extra is a bonus.'
  const need = target - count
  const plural = need === 1 ? 'day' : 'days'
  if (count === 0) return practicedToday ? `${need} more ${plural} to hit your goal.` : 'New week. One short session gets the bar moving.'
  if (need > daysLeft) return 'Goal’s out of reach this week, but every day still grows your streak.'
  if (need === 1) return practicedToday ? 'Just 1 more day and the week is yours.' : 'One more day hits your goal. Today could be it.'
  return practicedToday ? `Today’s in. ${need} more ${plural} to hit your goal.` : `${need} more ${plural} to hit your goal.`
}

export function weekView(practiced: Set<DateKey>, frozen: Set<DateKey>, today: DateKey, target: number): WeekView {
  const start = weekStart(today)
  const days = LABELS.map((label, i) => {
    const key = addDays(start, i)
    const state: DayState = practiced.has(key)
      ? 'done'
      : frozen.has(key)
        ? 'frozen'
        : key === today
          ? 'today'
          : key < today
            ? 'missed'
            : 'future'
    return { key, label, state }
  })
  const count = days.filter((d) => d.state === 'done').length
  const practicedToday = practiced.has(today)
  const daysLeft = diffDays(today, addDays(start, 6)) + (practicedToday ? 0 : 1)
  return {
    days,
    count,
    target,
    message: weekMessage(count, target, practicedToday, daysLeft),
    hitToday: practicedToday && count === target,
  }
}

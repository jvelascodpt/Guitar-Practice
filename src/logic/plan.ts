import { monthKey, type DateKey } from '../lib/dates'

export const PLAN_START: string = '2026-11'
export const PLAN_MONTHS = 12

/** Unclamped month offset from the plan start (Nov 2026 = 0). */
export function planOffset(k: DateKey): number {
  const [y, m] = monthKey(k).split('-').map(Number)
  const [sy, sm] = PLAN_START.split('-').map(Number)
  return (y - sy) * 12 + (m - sm)
}

export function planIndex(k: DateKey): number {
  return Math.min(PLAN_MONTHS - 1, Math.max(0, planOffset(k)))
}

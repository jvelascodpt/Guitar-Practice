import { useSyncExternalStore } from 'react'
import type { DateKey } from '../lib/dates'
import type { SessionItem } from '../logic/session'
import type { SessionMode } from '../data/types'
import type { ReviewResult } from '../logic/reviews'

/**
 * The in-progress practice session (timer state). Kept outside React and
 * persisted to localStorage so switching tabs, locking the phone or reloading
 * doesn't lose it. Times are computed from timestamps, not tick counts.
 */
export interface ActiveSession {
  date: DateKey
  mode: SessionMode
  items: SessionItem[]
  current: number
  completed: Record<string, true | ReviewResult>
  /** ms accumulated before the current run segment */
  totalMs: number
  itemMs: number
  runningSince: number | null
  capHit: boolean
}

const KEY = 'gy.activeSession'
let state: ActiveSession | null = load()
const listeners = new Set<() => void>()

function load(): ActiveSession | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as ActiveSession) : null
  } catch {
    return null
  }
}

function set(next: ActiveSession | null) {
  state = next
  try {
    if (next) localStorage.setItem(KEY, JSON.stringify(next))
    else localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable */
  }
  listeners.forEach((l) => l())
}

export const getActive = () => state
export function useActive() {
  return useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => state,
  )
}

const live = (s: ActiveSession, now = Date.now()) => (s.runningSince ? now - s.runningSince : 0)
export const elapsedTotal = (s: ActiveSession, now = Date.now()) => s.totalMs + live(s, now)
export const elapsedItem = (s: ActiveSession, now = Date.now()) => s.itemMs + live(s, now)

export function start(date: DateKey, mode: SessionMode, items: SessionItem[]) {
  set({ date, mode, items, current: 0, completed: {}, totalMs: 0, itemMs: 0, runningSince: Date.now(), capHit: false })
}

export function resume() {
  if (state && !state.runningSince) set({ ...state, runningSince: Date.now() })
}

export function pause(extra: Partial<ActiveSession> = {}) {
  if (!state) return
  const now = Date.now()
  set({ ...state, totalMs: elapsedTotal(state, now), itemMs: elapsedItem(state, now), runningSince: null, ...extra })
}

/** Move to item `index`, folding elapsed time into the total. */
export function goTo(index: number) {
  if (!state) return
  const now = Date.now()
  set({
    ...state,
    current: Math.max(0, Math.min(state.items.length, index)),
    totalMs: elapsedTotal(state, now),
    itemMs: 0,
    runningSince: state.runningSince ? now : null,
  })
}

export function mark(itemId: string, value: true | ReviewResult | null) {
  if (!state) return
  const completed = { ...state.completed }
  if (value === null) delete completed[itemId]
  else completed[itemId] = value
  set({ ...state, completed })
}

export function clear() {
  set(null)
}

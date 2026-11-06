import type { DateKey, MonthKey } from '../lib/dates'

/**
 * Domain types. Every stored record has a string/number `id` and an `updatedAt`
 * (ms epoch) so a sync adapter (e.g. Supabase) can do last-write-wins merges.
 */

export type SongStatus = 'queued' | 'learning' | 'canPlay' | 'polished'
export const SONG_STATUSES: SongStatus[] = ['queued', 'learning', 'canPlay', 'polished']
export const STATUS_LABEL: Record<SongStatus, string> = {
  queued: 'Queued',
  learning: 'Learning',
  canPlay: 'Can play',
  polished: 'Polished',
}

export interface ReviewState {
  /** Index into REVIEW_INTERVALS (2d, 1w, 2w, 1mo). */
  stage: number
  due: DateKey
  lastReviewed?: DateKey
}

export interface Song {
  id: string
  title: string
  artist: string
  difficulty: 1 | 2 | 3 | 4 | 5
  status: SongStatus
  chords: string[]
  techniques: string[]
  link: string
  notes: string
  /** Free tags; seeded songs carry "placeholder". */
  tags: string[]
  tier: 'easy' | 'stretch'
  /** Plan month index (0 = Nov 2026) when the song becomes eligible to start. */
  targetMonth: number
  /** Sort order within the library / learning queue. */
  order: number
  learningSince?: DateKey
  rhythmOnly?: boolean
  nudgeSnoozedUntil?: DateKey
  review?: ReviewState
  createdAt: number
  updatedAt: number
}

export type PainRating = 'fine' | 'tight' | 'sore'
export type SessionMode = 'full' | 'badDay'

export interface Session {
  /** One session per day: id = `s-${date}`. */
  id: string
  date: DateKey
  mode: SessionMode
  plannedMinutes: number
  minutes: number
  completedItems: string[]
  pain?: PainRating
  updatedAt: number
}

export interface Skill {
  name: string
  detail?: string
  bpm?: number
  /** Speed-ladder: bpm rises this much per practice day this month, up to bpmMax. */
  bpmStep?: number
  bpmMax?: number
}

export interface PlanWeek {
  label: string
  done: boolean
}

export interface PlanMonth {
  /** 0 = Nov 2026 … 11 = Oct 2027 */
  id: number
  monthKey: MonthKey
  title: string
  focus: string
  goal: string
  skills: Skill[]
  weeks: PlanWeek[]
  dangerZone: boolean
  dangerNote?: string
  /** Song-block activity when no songs are ready yet. */
  songFallback: string
  goalMet: boolean
  notes: string
  updatedAt: number
}

export interface Recording {
  id: string
  monthKey: MonthKey
  date: DateKey
  note: string
  audio?: Blob
  audioName?: string
  audioType?: string
  updatedAt: number
}

export type Theme = 'dark' | 'light' | 'system'

export interface Settings {
  id: 'settings'
  onboarded: boolean
  /** Habit anchor, e.g. "after coffee". */
  anchor: string
  reminderTime: string // "HH:MM"
  remindersEnabled: boolean
  sessionCapMinutes: number
  weeklyTargetDays: number
  theme: Theme
  lastReminderDate?: DateKey
  updatedAt: number
}

/** Tombstones so a future sync adapter can propagate deletes. */
export interface Deletion {
  id: string // `${table}:${recordId}`
  table: string
  recordId: string
  deletedAt: number
}

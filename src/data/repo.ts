import { db } from './db'
import type { PainRating, PlanMonth, Recording, Session, Settings, Song, SongStatus } from './types'
import { defaultSettings } from './seed'
import { nextReview, statusChangePatch, type ReviewResult } from '../logic/reviews'
import type { DateKey } from '../lib/dates'
import type { SessionItem } from '../logic/session'

/**
 * All reads and writes go through here so storage details stay out of the UI
 * and a sync layer can hook in later. Every write stamps `updatedAt`.
 */
const now = () => Date.now()
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`)

async function tombstone(table: string, recordId: string) {
  await db.deletions.put({ id: `${table}:${recordId}`, table, recordId, deletedAt: now() })
}

// ---- settings ----
export async function getSettings(): Promise<Settings> {
  return (await db.settings.get('settings')) ?? defaultSettings()
}
export async function updateSettings(patch: Partial<Settings>) {
  const cur = await getSettings()
  await db.settings.put({ ...cur, ...patch, id: 'settings', updatedAt: now() })
}

// ---- sessions ----
export const listSessions = () => db.sessions.orderBy('date').toArray()

export interface CompleteSessionInput {
  date: DateKey
  mode: Session['mode']
  plannedMinutes: number
  minutes: number
  items: SessionItem[]
  completed: Record<string, true | ReviewResult>
}

/** Marks the day done and applies song effects (spaced reviews, starting new songs). */
export async function completeSession(input: CompleteSessionInput) {
  await db.transaction('rw', db.sessions, db.songs, async () => {
    const existing = await db.sessions.get(`s-${input.date}`)
    await db.sessions.put({
      id: `s-${input.date}`,
      date: input.date,
      mode: input.mode,
      plannedMinutes: input.plannedMinutes,
      minutes: Math.max(existing?.minutes ?? 0, input.minutes),
      completedItems: [...new Set([...(existing?.completedItems ?? []), ...Object.keys(input.completed)])],
      pain: existing?.pain,
      updatedAt: now(),
    })
    for (const item of input.items) {
      const done = input.completed[item.id]
      if (!done || !item.songId) continue
      const song = await db.songs.get(item.songId)
      if (!song) continue
      if (item.kind === 'song-start' && song.status === 'queued') {
        await db.songs.put({ ...song, ...statusChangePatch(song, 'learning', input.date), updatedAt: now() })
      } else if (item.review && song.review && song.review.lastReviewed !== input.date) {
        const result: ReviewResult = done === 'shaky' ? 'shaky' : 'solid'
        await db.songs.put({ ...song, review: nextReview(song.review, result, input.date), updatedAt: now() })
      }
    }
  })
}

export async function setSessionPain(date: DateKey, pain: PainRating | undefined) {
  const s = await db.sessions.get(`s-${date}`)
  if (s) await db.sessions.put({ ...s, pain, updatedAt: now() })
}

export async function deleteSession(date: DateKey) {
  await db.sessions.delete(`s-${date}`)
  await tombstone('sessions', `s-${date}`)
}

// ---- songs ----
export const listSongs = () => db.songs.orderBy('order').toArray()

export type SongDraft = Omit<Song, 'id' | 'createdAt' | 'updatedAt' | 'order'> & { order?: number }

export async function addSong(draft: SongDraft, today: DateKey) {
  const last = await db.songs.orderBy('order').last()
  const base: Song = { ...draft, id: uid(), order: draft.order ?? (last?.order ?? 0) + 1, createdAt: now(), updatedAt: now(), status: 'queued' }
  await db.songs.add({ ...base, ...statusChangePatch(base, draft.status, today) })
}

export async function updateSong(id: string, patch: Partial<Song>, today: DateKey) {
  const song = await db.songs.get(id)
  if (!song) return
  const statusPatch = patch.status && patch.status !== song.status ? statusChangePatch(song, patch.status, today) : {}
  await db.songs.put({ ...song, ...patch, ...statusPatch, id, updatedAt: now() })
}

export async function setSongStatus(id: string, status: SongStatus, today: DateKey) {
  await updateSong(id, { status }, today)
}

export async function deleteSong(id: string) {
  await db.songs.delete(id)
  await tombstone('songs', id)
}

// ---- plan ----
export const listPlan = () => db.plan.orderBy('id').toArray()
export async function updatePlanMonth(id: number, patch: Partial<PlanMonth>) {
  const m = await db.plan.get(id)
  if (m) await db.plan.put({ ...m, ...patch, id, updatedAt: now() })
}

// ---- recordings ----
export const listRecordings = () => db.recordings.orderBy('date').toArray()
export async function addRecording(r: Omit<Recording, 'id' | 'updatedAt'>) {
  await db.recordings.add({ ...r, id: uid(), updatedAt: now() })
}
export async function updateRecording(id: string, patch: Partial<Recording>) {
  const r = await db.recordings.get(id)
  if (r) await db.recordings.put({ ...r, ...patch, id, updatedAt: now() })
}
export async function deleteRecording(id: string) {
  await db.recordings.delete(id)
  await tombstone('recordings', id)
}

import { monthKey, type DateKey } from '../lib/dates'
import { WARMUPS } from '../data/seed'
import type { PlanMonth, Session, SessionMode, Skill, Song } from '../data/types'
import { dueReviews } from './reviews'
import { painEaseUntil } from './pain'

export type ItemKind = 'warmup' | 'skill-new' | 'skill-mix' | 'song-start' | 'song-learn' | 'song-review' | 'song-extra' | 'daily-win'

export interface SessionItem {
  id: string
  kind: ItemKind
  section: 'Warm-up' | 'Skill of the month' | 'Songs'
  label: string
  detail?: string
  minutes: number
  bpm?: number
  songId?: string
  /** Song items that ask for a solid/shaky rating (spaced retrieval). */
  review?: boolean
}

export interface BuiltSession {
  mode: SessionMode
  items: SessionItem[]
  totalMinutes: number
  dangerZone: boolean
  painEaseUntil: DateKey | null
  newSkill?: string
  /** Practice day number within this plan month (0-based). */
  dayIndex: number
}

export interface BuildInput {
  today: DateKey
  plan: PlanMonth
  prevPlan?: PlanMonth
  sessions: Session[]
  songs: Song[]
  mode: SessionMode
}

const NEW_SKILL_DAYS = 3
const MAX_LEARNING = 2

function skillBpm(skill: Skill, dayIndex: number): number | undefined {
  if (!skill.bpm) return undefined
  if (!skill.bpmStep) return skill.bpm
  return Math.min(skill.bpmMax ?? Infinity, skill.bpm + skill.bpmStep * dayIndex)
}

/** Split `total` minutes into slices of 2–3 min. */
function slices(total: number, maxCount: number): number[] {
  if (total < 2 || maxCount <= 0) return []
  const count = Math.min(maxCount, Math.max(1, Math.round(total / 2.5)))
  const base = Math.floor(total / count)
  const out = Array(count).fill(Math.min(3, base))
  let left = total - out.reduce((a, b) => a + b, 0)
  for (let i = 0; i < count && left > 0; i++) {
    if (out[i] < 3) {
      out[i]++
      left--
    }
  }
  return out
}

function playableRotation(songs: Song[], dayIndex: number): Song[] {
  const playable = songs
    .filter((s) => s.status === 'canPlay' || s.status === 'polished')
    .sort((a, b) => (a.review?.lastReviewed ?? '').localeCompare(b.review?.lastReviewed ?? '') || a.order - b.order)
  if (playable.length === 0) return []
  const k = dayIndex % playable.length
  return [...playable.slice(k), ...playable.slice(0, k)]
}

/**
 * Builds today's pre-made session (zero decisions). Deterministic for a given
 * day: it depends only on data from before today plus current song statuses.
 *
 * Full (~25 min): 5 warm-up · 10 skill of the month · 10 songs, ending on a song
 * you can already play. Danger-zone months shorten technique and add a song
 * slot. Two sore days in a row halve technique time for 3 days.
 * Bad day (5 min): 1 min warm-up + 4 min of something you can already play.
 */
export function buildSession(input: BuildInput): BuiltSession {
  const { today, plan, prevPlan, sessions, songs, mode } = input
  const mk = monthKey(today)
  const dayIndex = new Set(sessions.filter((s) => s.date < today && monthKey(s.date) === mk).map((s) => s.date)).size
  const easeUntil = painEaseUntil(sessions, today)
  const danger = plan.dangerZone
  const items: SessionItem[] = []

  // Skill introduction schedule: one new skill every `spacing` practice days.
  const skills = plan.skills
  const spacing = Math.max(NEW_SKILL_DAYS, Math.floor(18 / Math.max(1, skills.length)))
  const introduced = Math.min(skills.length, Math.floor(dayIndex / spacing) + 1)
  const newestIdx = introduced - 1
  const isNewPhase = dayIndex - newestIdx * spacing < NEW_SKILL_DAYS
  const newSkill = isNewPhase ? skills[newestIdx] : undefined

  // ---- Daily win (always last) ----
  const due = dueReviews(songs, today)
  const rotation = playableRotation(songs, dayIndex)
  const winSong = due[0] ?? rotation[0]
  const fallbackWin = (prevPlan?.skills.at(-1) ?? skills[0])?.name ?? 'your best chord change'
  const dailyWin = (minutes: number): SessionItem =>
    winSong
      ? {
          id: `win-${winSong.id}`,
          kind: 'daily-win',
          section: 'Songs',
          label: winSong.title,
          detail: 'Daily win: a song you can already play. Enjoy it.',
          minutes,
          songId: winSong.id,
          review: true,
        }
      : {
          id: 'win-fallback',
          kind: 'daily-win',
          section: 'Songs',
          label: 'Daily win: play what you know',
          detail: `${fallbackWin}, slowly, just for fun. No new stuff.`,
          minutes,
        }

  if (mode === 'badDay') {
    items.push({ id: 'warm-hands', kind: 'warmup', section: 'Warm-up', label: 'Gentle hand & forearm warm-up', minutes: 1 })
    items.push(dailyWin(4))
    return { mode, items, totalMinutes: 5, dangerZone: danger, painEaseUntil: easeUntil, dayIndex }
  }

  // ---- Warm-up: 5 min ----
  const pool = WARMUPS.filter((w) => w.from <= plan.id)
  const w = pool[dayIndex % pool.length]
  items.push({
    id: 'warm-hands',
    kind: 'warmup',
    section: 'Warm-up',
    label: 'Gentle hand & forearm warm-up',
    detail: 'Open/close hands, easy wrist circles. Nothing should hurt.',
    minutes: 1,
  })
  items.push({ id: `warm-${pool.indexOf(w)}`, kind: 'warmup', section: 'Warm-up', label: w.name, minutes: 4, bpm: w.bpm })

  // ---- Skill of the month: 10 min (6 in danger zones), halved when easing pain ----
  let technique = danger ? 6 : 10
  if (easeUntil) technique = Math.max(3, Math.round(technique / 2))
  let newMin = 0
  if (newSkill) {
    newMin = danger ? 3 : 4
    if (easeUntil) newMin = Math.min(newMin, technique)
    items.push({
      id: `skill-${plan.id}-${newestIdx}`,
      kind: 'skill-new',
      section: 'Skill of the month',
      label: newSkill.name,
      detail: newSkill.detail ?? 'New this week: focused, slow, accurate reps.',
      minutes: newMin,
      bpm: skillBpm(newSkill, dayIndex),
    })
  }
  const mixPool: { skill: Skill; key: string }[] = skills
    .slice(0, introduced)
    .map((skill, i) => ({ skill, key: `skill-${plan.id}-${i}` }))
    .filter((_, i) => !(newSkill && i === newestIdx))
  const remaining = technique - newMin
  let mixSlices = slices(remaining, Infinity)
  if (mixPool.length < mixSlices.length && prevPlan) {
    for (const [i, skill] of prevPlan.skills.entries()) mixPool.push({ skill, key: `skill-${prevPlan.id}-${i}` })
  }
  mixSlices = mixSlices.slice(0, mixPool.length)
  const leftover = remaining - mixSlices.reduce((a, b) => a + b, 0)
  if (newSkill && leftover > 0) {
    // Start of the plan: not enough earlier material to interleave yet, so the
    // new block stretches (max 5 min) and the session is simply a bit shorter.
    items[items.length - 1].minutes += Math.min(5 - newMin, leftover)
  }
  const start = mixPool.length ? (dayIndex * mixSlices.length) % mixPool.length : 0
  mixSlices.forEach((min, j) => {
    const { skill, key } = mixPool[(start + j) % mixPool.length]
    items.push({
      id: `${key}-mix`,
      kind: 'skill-mix',
      section: 'Skill of the month',
      label: skill.name,
      detail: 'Mixed practice: a short slice, then move on.',
      minutes: min,
      bpm: skillBpm(skill, dayIndex),
    })
  })

  // ---- Songs: 10 min (+4 extra slot in danger zones), daily win last ----
  const learning = songs.filter((s) => s.status === 'learning').sort((a, b) => a.order - b.order)
  const nextQueued = songs
    .filter((s) => s.status === 'queued' && s.targetMonth <= plan.id)
    .sort((a, b) => a.order - b.order)[0]
  const extraReview = due.find((s) => s.id !== winSong?.id)
  const learnMin = extraReview ? 3 : 5

  if (learning.length > 0) {
    const song = learning[dayIndex % learning.length]
    items.push({
      id: `learn-${song.id}`,
      kind: 'song-learn',
      section: 'Songs',
      label: song.title,
      detail: song.rhythmOnly ? 'Rhythm part only — that still counts.' : 'Learning: work the hardest bar slowly, then play through.',
      minutes: learnMin,
      songId: song.id,
    })
  } else if (nextQueued && learning.length < MAX_LEARNING) {
    items.push({
      id: `start-${nextQueued.id}`,
      kind: 'song-start',
      section: 'Songs',
      label: `Start: ${nextQueued.title}`,
      detail: 'New song. Listen once, then learn the first section. Checking this moves it to “learning”.',
      minutes: learnMin,
      songId: nextQueued.id,
    })
  } else {
    items.push({ id: 'learn-fallback', kind: 'song-learn', section: 'Songs', label: 'Strum-along', detail: plan.songFallback, minutes: learnMin })
  }
  if (extraReview) {
    items.push({
      id: `review-${extraReview.id}`,
      kind: 'song-review',
      section: 'Songs',
      label: extraReview.title,
      detail: 'Review: play it once from memory.',
      minutes: 2,
      songId: extraReview.id,
      review: true,
    })
  }
  if (danger) {
    const extra = rotation.find((s) => s.id !== winSong?.id && s.id !== extraReview?.id)
    items.push(
      extra
        ? { id: `extra-${extra.id}`, kind: 'song-extra', section: 'Songs', label: extra.title, detail: 'Extra song slot: playing what you know keeps a hard month fun.', minutes: 4, songId: extra.id, review: !!extra.review }
        : { id: 'extra-fallback', kind: 'song-extra', section: 'Songs', label: 'Extra song slot', detail: plan.songFallback, minutes: 4 },
    )
  }
  items.push(dailyWin(5))

  const totalMinutes = items.reduce((a, b) => a + b.minutes, 0)
  return { mode, items, totalMinutes, dangerZone: danger, painEaseUntil: easeUntil, newSkill: newSkill?.name, dayIndex }
}

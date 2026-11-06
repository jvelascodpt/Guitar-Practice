import { describe, expect, it } from 'vitest'
import { addDays, weekStart } from '../lib/dates'
import { seedPlan, seedSongs } from '../data/seed'
import type { Session, Song } from '../data/types'
import { computeStreaks } from './streaks'
import { nextReview, plateauedSongs, statusChangePatch } from './reviews'
import { painEaseUntil } from './pain'
import { buildSession } from './session'
import { planIndex } from './plan'

const sess = (date: string, extra: Partial<Session> = {}): Session => ({
  id: `s-${date}`, date, mode: 'full', plannedMinutes: 25, minutes: 25, completedItems: [], updatedAt: 0, ...extra,
})

describe('dates & plan', () => {
  it('week starts Monday', () => {
    expect(weekStart('2026-11-08')).toBe('2026-11-02') // Sunday → Monday
    expect(weekStart('2026-11-02')).toBe('2026-11-02')
  })
  it('plan index', () => {
    expect(planIndex('2026-11-06')).toBe(0)
    expect(planIndex('2027-04-15')).toBe(5)
    expect(planIndex('2028-01-01')).toBe(11)
  })
})

describe('streaks', () => {
  it('counts consecutive days, today pending', () => {
    const r = computeStreaks(['2026-11-02', '2026-11-03', '2026-11-04'], '2026-11-05')
    expect(r.current).toBe(3)
  })
  it('one freeze per week covers one missed day', () => {
    // Mon, Tue practiced, Wed missed (frozen), Thu practiced
    const r = computeStreaks(['2026-11-02', '2026-11-03', '2026-11-05'], '2026-11-05')
    expect(r.current).toBe(3)
    expect(r.frozen.has('2026-11-04')).toBe(true)
    expect(r.freezeUsedThisWeek).toBe(true)
  })
  it('second miss in the same week resets', () => {
    const r = computeStreaks(['2026-11-02', '2026-11-04', '2026-11-06'], '2026-11-06')
    expect(r.current).toBe(1)
    expect(r.longest).toBe(2)
  })
  it('freeze refreshes the next week', () => {
    // miss Wed 4th (week 1) and Tue 10th (week 2)
    const days = ['2026-11-02', '2026-11-03', '2026-11-05', '2026-11-06', '2026-11-07', '2026-11-08', '2026-11-09', '2026-11-11']
    expect(computeStreaks(days, '2026-11-11').current).toBe(8)
  })
})

describe('spaced retrieval', () => {
  const song = seedSongs()[0]
  it('can play schedules first review in 2 days', () => {
    expect(statusChangePatch(song, 'canPlay', '2026-12-01').review).toEqual({ stage: 0, due: '2026-12-03' })
  })
  it('solid on time advances; overdue repeats; shaky steps back', () => {
    expect(nextReview({ stage: 0, due: '2026-12-03' }, 'solid', '2026-12-03')).toMatchObject({ stage: 1, due: '2026-12-10' })
    expect(nextReview({ stage: 1, due: '2026-12-10' }, 'solid', '2026-12-14')).toMatchObject({ stage: 1, due: '2026-12-21' })
    expect(nextReview({ stage: 2, due: '2026-12-10' }, 'shaky', '2026-12-10')).toMatchObject({ stage: 1, due: '2026-12-17' })
    expect(nextReview({ stage: 3, due: '2026-12-10' }, 'solid', '2026-12-10')).toMatchObject({ stage: 3, due: '2027-01-09' })
  })
  it('plateau after 4 weeks learning', () => {
    const s: Song = { ...song, status: 'learning', learningSince: '2026-12-01' }
    expect(plateauedSongs([s], '2026-12-28')).toHaveLength(0)
    expect(plateauedSongs([s], '2026-12-29')).toHaveLength(1)
    expect(plateauedSongs([{ ...s, nudgeSnoozedUntil: '2027-01-05' }], '2026-12-29')).toHaveLength(0)
  })
})

describe('pain', () => {
  it('two sore days in a row → 3 eased days', () => {
    const s = [sess('2026-11-10', { pain: 'sore' }), sess('2026-11-11', { pain: 'sore' })]
    expect(painEaseUntil(s, '2026-11-11')).toBeNull()
    expect(painEaseUntil(s, '2026-11-12')).toBe('2026-11-14')
    expect(painEaseUntil(s, '2026-11-15')).toBeNull()
  })
})

describe('session builder', () => {
  const plan = seedPlan()
  const songs = seedSongs()
  const sum = (x: { minutes: number }[]) => x.reduce((a, b) => a + b.minutes, 0)

  it('first day: blocked new skill, ends on daily win', () => {
    const b = buildSession({ today: '2026-11-06', plan: plan[0], sessions: [], songs, mode: 'full' })
    expect(b.items[0].kind).toBe('warmup')
    expect(b.items.find((i) => i.kind === 'skill-new')?.label).toBe('Tuning + pick grip')
    expect(b.items.at(-1)!.kind).toBe('daily-win')
    expect(b.totalMinutes).toBeLessThanOrEqual(25)
  })

  it('after 3 days the skill rotates into 2–3 min slices', () => {
    const sessions = ['2026-11-02', '2026-11-03', '2026-11-04'].map((d) => sess(d))
    const b = buildSession({ today: '2026-11-05', plan: plan[0], sessions, songs, mode: 'full' })
    expect(b.dayIndex).toBe(3)
    const mix = b.items.filter((i) => i.kind === 'skill-mix')
    expect(b.items.find((i) => i.kind === 'skill-new')?.label).toBe('Clean single notes')
    expect(mix.every((i) => i.minutes >= 2 && i.minutes <= 3)).toBe(true)
    // only one earlier skill exists yet, so week 1 runs a little short
    expect(sum(b.items.filter((i) => i.section === 'Skill of the month'))).toBe(8)
  })

  it('interleaving: day with no new skill is all slices', () => {
    const sessions = Array.from({ length: 20 }, (_, i) => sess(addDays('2026-11-01', i)))
    const b = buildSession({ today: '2026-11-22', plan: plan[0], sessions, songs, mode: 'full' })
    expect(b.newSkill).toBeUndefined()
    expect(b.items.filter((i) => i.kind === 'skill-mix').length).toBe(4)
  })

  it('danger zone: shorter technique, extra song slot, still ~25 min', () => {
    const playable = songs.map((s, i) => (i < 3 ? { ...s, status: 'canPlay' as const, review: { stage: 2, due: '2027-05-01' } } : s))
    const b = buildSession({ today: '2027-04-10', plan: plan[5], prevPlan: plan[4], sessions: [], songs: playable, mode: 'full' })
    expect(b.dangerZone).toBe(true)
    expect(sum(b.items.filter((i) => i.section === 'Skill of the month'))).toBe(6)
    expect(b.items.some((i) => i.kind === 'song-extra')).toBe(true)
    expect(b.items.find((i) => i.kind === 'skill-new')!.minutes).toBeLessThanOrEqual(5)
    expect(b.items.at(-1)!.kind).toBe('daily-win')
    expect(b.totalMinutes).toBe(25)
  })

  it('due review becomes the daily win', () => {
    const s2 = songs.map((s, i) => (i === 1 ? { ...s, status: 'canPlay' as const, review: { stage: 0, due: '2026-12-10' } } : s))
    const b = buildSession({ today: '2026-12-12', plan: plan[1], prevPlan: plan[0], sessions: [], songs: s2, mode: 'full' })
    expect(b.items.at(-1)).toMatchObject({ kind: 'daily-win', songId: s2[1].id, review: true })
  })

  it('December auto-offers the first queued song', () => {
    const b = buildSession({ today: '2026-12-02', plan: plan[1], prevPlan: plan[0], sessions: [], songs, mode: 'full' })
    expect(b.items.find((i) => i.kind === 'song-start')?.songId).toBe(songs[0].id)
  })

  it('November does not offer songs targeted for later', () => {
    const b = buildSession({ today: '2026-11-06', plan: plan[0], sessions: [], songs, mode: 'full' })
    expect(b.items.some((i) => i.kind === 'song-start')).toBe(false)
  })

  it('sore twice → technique halved', () => {
    const sessions = [sess('2026-11-10', { pain: 'sore' }), sess('2026-11-11', { pain: 'sore' })]
    const b = buildSession({ today: '2026-11-12', plan: plan[0], sessions, songs, mode: 'full' })
    expect(b.painEaseUntil).toBe('2026-11-14')
    expect(sum(b.items.filter((i) => i.section === 'Skill of the month'))).toBeLessThanOrEqual(5)
  })

  it('bad day is 5 minutes and ends on a win', () => {
    const b = buildSession({ today: '2026-11-06', plan: plan[0], sessions: [], songs, mode: 'badDay' })
    expect(b.totalMinutes).toBe(5)
    expect(b.items.at(-1)!.kind).toBe('daily-win')
  })

  it('every plan month builds a sane session at various days', () => {
    for (const m of plan) {
      for (let n = 0; n < 26; n += 1) {
        const sessions = Array.from({ length: n }, (_, i) => sess(`${m.monthKey}-${String(i + 1).padStart(2, '0')}`))
        const today = `${m.monthKey}-28`
        const b = buildSession({ today, plan: m, prevPlan: plan[m.id - 1], sessions, songs, mode: 'full' })
        expect(b.totalMinutes).toBeGreaterThanOrEqual(15)
        expect(b.totalMinutes).toBeLessThanOrEqual(26)
        expect(b.items.at(-1)!.kind).toBe('daily-win')
        expect(new Set(b.items.map((i) => i.id)).size).toBe(b.items.length)
      }
    }
  })
})

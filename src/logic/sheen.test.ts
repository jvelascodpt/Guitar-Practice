import { describe, expect, it } from 'vitest'
import { sheenLines } from './sheen'
import { sheenLook, describeLook } from '../components/Sheen'

const base = { hour: 9, doneToday: false, sessionMinutes: 25, weekMessage: '3 more days to hit your goal.', recordPrompt: false, look: 'x' }

describe('Sheen', () => {
  it('opens with the session when not done, and a rest line when done', () => {
    expect(sheenLines({ ...base, firstItem: 'Gentle hand & forearm warm-up', anchor: 'after coffee' })[0]).toMatch(/Morning!.*25 minutes.*First up: Gentle hand.*after coffee/)
    expect(sheenLines({ ...base, doneToday: true, hour: 20 })[0]).toMatch(/^Evening!.*Session done/)
  })
  it('surfaces the first song, pain easing and reviews', () => {
    const l = sheenLines({ ...base, startSong: 'Cult of Personality (main riff)', painEaseUntil: '2026-11-10', reviewSong: 'Heroes' })
    expect(l.some((x) => x.includes('Cult of Personality'))).toBe(true)
    expect(l.some((x) => /sore/.test(x))).toBe(true)
    expect(l.some((x) => x.includes('Heroes is due'))).toBe(true)
  })
  it('daily look is stable within a day and varies across days', () => {
    expect(sheenLook('2026-11-07')).toEqual(sheenLook('2026-11-07'))
    const week = ['01', '02', '03', '04', '05', '06', '07'].map((d) => describeLook(sheenLook(`2026-11-${d}`)))
    expect(new Set(week).size).toBeGreaterThanOrEqual(6)
  })
})

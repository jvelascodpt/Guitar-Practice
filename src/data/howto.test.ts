import { describe, expect, it } from 'vitest'
import { HOWTO } from './howto'
import { seedPlan, WARMUPS } from './seed'

describe('how-to content', () => {
  const names = ['Gentle hand & forearm warm-up', ...WARMUPS.map((w) => w.name), ...seedPlan().flatMap((m) => m.skills.map((s) => s.name))]

  it('covers every warm-up and every skill in the plan', () => {
    const missing = names.filter((n) => !HOWTO[n])
    expect(missing).toEqual([])
  })

  it('every entry has steps, and a lesson or search', () => {
    for (const [name, h] of Object.entries(HOWTO)) {
      expect(h.steps.length, name).toBeGreaterThanOrEqual(2)
      if (name !== 'Gentle hand & forearm warm-up') expect(!!(h.lesson || h.search), name).toBe(true)
      if (h.lesson) expect(h.lesson.url, name).toMatch(/^https:\/\//)
    }
  })

  it('string tabs are aligned (all string lines the same length)', () => {
    for (const [name, h] of Object.entries(HOWTO)) {
      const lines = (h.tab ?? '').split('\n').filter((l) => /^[eBGDAE]\|/.test(l)).map((l) => l.replace(/\|\s.*$/, '|'))
      if (lines.length > 1) expect(new Set(lines.map((l) => l.length)).size, `${name}\n${h.tab}`).toBe(1)
    }
  })

  it('generated tabs read correctly', () => {
    expect(HOWTO['Spider exercise across 3 strings'].tab).toBe(
      ['e|-----------------|', 'B|-----------------|', 'G|-----------------|', 'D|-----------2---4-|', 'A|---2---4-1---3---|', 'E|-1---3-----------|'].join('\n'),
    )
  })
})

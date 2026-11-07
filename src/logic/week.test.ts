import { describe, expect, it } from 'vitest'
import { weekMessage, weekView } from './week'

describe('weekly progress', () => {
  it('marks each day of the Mon–Sun week', () => {
    // Thu 2026-11-05: Mon+Tue practiced, Wed frozen, Thu not yet
    const v = weekView(new Set(['2026-11-02', '2026-11-03']), new Set(['2026-11-04']), '2026-11-05', 5)
    expect(v.days.map((d) => d.state)).toEqual(['done', 'done', 'frozen', 'today', 'future', 'future', 'future'])
    expect(v.count).toBe(2)
    expect(v.message).toBe('3 more days to hit your goal.')
  })
  it('celebrates when today’s session hits the goal', () => {
    const v = weekView(new Set(['2026-11-02', '2026-11-03', '2026-11-04', '2026-11-05', '2026-11-06']), new Set(), '2026-11-06', 5)
    expect(v.hitToday).toBe(true)
    expect(v.message).toMatch(/goal hit/i)
  })
  it('messages stay encouraging', () => {
    expect(weekMessage(0, 5, false, 7)).toMatch(/New week/)
    expect(weekMessage(4, 5, false, 2)).toMatch(/One more day/)
    expect(weekMessage(4, 5, true, 1)).toMatch(/Just 1 more day/)
    expect(weekMessage(2, 5, false, 1)).toMatch(/out of reach.*streak/)
    expect(weekMessage(6, 5, true, 0)).toMatch(/smashed/)
  })
})

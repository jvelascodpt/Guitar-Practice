import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import * as repo from './repo'
import { exportAll, importAll } from './backup'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('repo', () => {
  it('seeds plan, placeholder songs and settings', async () => {
    expect(await db.plan.count()).toBe(12)
    const songs = await repo.listSongs()
    expect(songs).toHaveLength(10)
    expect(songs.every((s) => s.tags.includes('placeholder'))).toBe(true)
    expect(songs.filter((s) => s.tier === 'stretch')).toHaveLength(3)
    expect((await repo.getSettings()).onboarded).toBe(false)
  })

  it('completing a session starts a song and reviews a playable one', async () => {
    const [a, b] = await repo.listSongs()
    await repo.setSongStatus(b.id, 'canPlay', '2026-12-01')
    await repo.completeSession({
      date: '2026-12-03', mode: 'full', plannedMinutes: 25, minutes: 24,
      items: [
        { id: 'start', kind: 'song-start', section: 'Songs', label: '', minutes: 5, songId: a.id },
        { id: 'win', kind: 'daily-win', section: 'Songs', label: '', minutes: 5, songId: b.id, review: true },
      ],
      completed: { start: true, win: 'solid' },
    })
    const after = await repo.listSongs()
    expect(after[0]).toMatchObject({ status: 'learning', learningSince: '2026-12-03' })
    expect(after[1].review).toMatchObject({ stage: 1, due: '2026-12-10' })
    expect(await db.sessions.get('s-2026-12-03')).toMatchObject({ minutes: 24 })
  })

  it('backup round-trips', async () => {
    await repo.updateSettings({ anchor: 'after work' })
    const backup = JSON.parse(JSON.stringify(await exportAll()))
    await db.songs.clear()
    await importAll(backup)
    expect(await db.songs.count()).toBe(10)
    expect((await repo.getSettings()).anchor).toBe('after work')
    await expect(importAll({ app: 'other' })).rejects.toThrow()
  })
})

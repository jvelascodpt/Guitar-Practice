import 'fake-indexeddb/auto'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from './db'
import * as repo from './repo'
import { exportAll, importAll } from './backup'
import Dexie from 'dexie'
import { GuitarDB } from './db'

beforeEach(async () => {
  await db.delete()
  await db.open()
})

describe('repo', () => {
  it('seeds plan, song library and settings', async () => {
    expect(await db.plan.count()).toBe(12)
    const songs = await repo.listSongs()
    expect(songs).toHaveLength(14)
    expect(songs.some((s) => s.tags.includes('placeholder'))).toBe(false)
    expect(songs.filter((s) => s.tier === 'stretch')).toHaveLength(4)
    // ordered to match the plan
    const months = songs.map((s) => s.targetMonth)
    expect([...months].sort((a, b) => a - b)).toEqual(months)
    expect((await repo.getSettings()).onboarded).toBe(false)
    expect((await repo.getSettings()).theme).toBe('stage')
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
    expect(await db.songs.count()).toBe(14)
    expect((await repo.getSettings()).anchor).toBe('after work')
    await expect(importAll({ app: 'other' })).rejects.toThrow()
  })
})

describe('v2 migration', () => {
  it('replaces untouched placeholders, keeps ones the user changed', async () => {
    const name = 'migrate-test'
    await Dexie.delete(name)
    const v1 = new Dexie(name)
    v1.version(1).stores({ settings: 'id', sessions: 'id, date, updatedAt', songs: 'id, status, difficulty, order, updatedAt', plan: 'id, monthKey, updatedAt', recordings: 'id, monthKey, date, updatedAt', deletions: 'id, table, deletedAt' })
    const old = (i: number, extra = {}) => ({ id: `seed-song-${i}`, title: `Old ${i}`, status: 'queued', order: i, tags: ['placeholder'], createdAt: 1, updatedAt: 1, ...extra })
    await v1.table('settings').add({ id: 'settings', onboarded: true, theme: 'dark', updatedAt: 1 })
    await v1.table('songs').bulkAdd([old(1), old(2, { status: 'learning', updatedAt: 5 }), old(3, { updatedAt: 9 }), { ...old(4), id: 'mine', tags: [] }])
    v1.close()

    const db2 = new GuitarDB(name)
    const songs = await db2.songs.orderBy('order').toArray()
    const ids = songs.map((s) => s.id)
    expect(ids).not.toContain('seed-song-1')
    expect(ids).toEqual(expect.arrayContaining(['seed-song-2', 'seed-song-3', 'mine']))
    expect(songs.filter((s) => s.id.startsWith('seed-v2-'))).toHaveLength(14)
    expect(songs.find((s) => s.id === 'seed-v2-1')!.order).toBeGreaterThan(4)
    expect(await db2.deletions.get('songs:seed-song-1')).toBeTruthy()
    expect((await db2.settings.get('settings'))!.theme).toBe('stage')
    db2.close()
  })
})

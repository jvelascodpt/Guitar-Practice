import Dexie, { type EntityTable } from 'dexie'
import type { Deletion, PlanMonth, Recording, Session, Settings, Song } from './types'
import { defaultSettings, seedPlan, seedSongs } from './seed'

export class GuitarDB extends Dexie {
  settings!: EntityTable<Settings, 'id'>
  sessions!: EntityTable<Session, 'id'>
  songs!: EntityTable<Song, 'id'>
  plan!: EntityTable<PlanMonth, 'id'>
  recordings!: EntityTable<Recording, 'id'>
  deletions!: EntityTable<Deletion, 'id'>

  constructor(name = 'guitar-year') {
    super(name)
    this.version(1).stores({
      settings: 'id',
      sessions: 'id, date, updatedAt',
      songs: 'id, status, difficulty, order, updatedAt',
      plan: 'id, monthKey, updatedAt',
      recordings: 'id, monthKey, date, updatedAt',
      deletions: 'id, table, deletedAt',
    })
    // v2: swap the original placeholder songs for the user's library. Placeholders
    // the user has touched (status changed or edited) are kept.
    this.version(2)
      .stores({})
      .upgrade(async (tx) => {
        const songs = tx.table<Song, string>('songs')
        const now = Date.now()
        const stale = await songs.filter((s) => s.id.startsWith('seed-song-') && s.status === 'queued' && s.updatedAt === s.createdAt).toArray()
        await songs.bulkDelete(stale.map((s) => s.id))
        await tx.table('deletions').bulkPut(stale.map((s) => ({ id: `songs:${s.id}`, table: 'songs', recordId: s.id, deletedAt: now })))
        const maxOrder = (await songs.toArray()).reduce((m, s) => Math.max(m, s.order), 0)
        await songs.bulkAdd(seedSongs(now, maxOrder + 1))
      })
    // v3: the wood "Spruce" theme replaces the old dark default (explicit
    // light/system choices are kept).
    this.version(3)
      .stores({})
      .upgrade(async (tx) => {
        await tx
          .table<Settings, string>('settings')
          .toCollection()
          .modify((st) => {
            if (st.theme === 'dark') st.theme = 'spruce'
          })
      })
    // v4: switch to the Stage theme (the user asked for it app-wide); other
    // explicit choices are kept.
    this.version(4)
      .stores({})
      .upgrade(async (tx) => {
        await tx
          .table<Settings, string>('settings')
          .toCollection()
          .modify((st) => {
            if (st.theme === 'spruce') st.theme = 'stage'
          })
      })
    this.on('populate', (tx) => {
      const now = Date.now()
      tx.table('settings').add(defaultSettings(now))
      tx.table('plan').bulkAdd(seedPlan(now))
      tx.table('songs').bulkAdd(seedSongs(now))
    })
  }
}

/** Synced tables, in dependency order. */
export const SYNC_TABLES = ['settings', 'plan', 'songs', 'sessions', 'recordings'] as const
export type SyncTable = (typeof SYNC_TABLES)[number]

export const db = new GuitarDB()

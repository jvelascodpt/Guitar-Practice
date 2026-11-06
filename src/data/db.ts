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

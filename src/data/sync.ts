import type { SyncTable } from './db'

/**
 * Seam for a future remote sync (e.g. Supabase). The app stays local-first:
 * Dexie is the source of truth the UI reads from; an adapter would push local
 * rows with `updatedAt > lastPushedAt` (plus `deletions` tombstones) and pull
 * remote rows changed since `lastPulledAt`, merging last-write-wins on
 * `updatedAt`. No UI code needs to change — live queries re-render on writes.
 *
 * Not implemented yet. Note: Recording audio blobs would go to object storage,
 * not the row.
 */
export interface SyncChange {
  table: SyncTable
  row: { id: string | number; updatedAt: number } & Record<string, unknown>
}

export interface SyncAdapter {
  push(changes: SyncChange[], deletions: { table: SyncTable; recordId: string }[]): Promise<void>
  pull(since: number): Promise<{ changes: SyncChange[]; deletions: { table: SyncTable; recordId: string }[]; now: number }>
}

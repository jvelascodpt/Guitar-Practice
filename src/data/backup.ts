import { db } from './db'
import type { PlanMonth, Recording, Session, Settings, Song } from './types'

const APP = 'guitar-year'
const VERSION = 1

type SerializedRecording = Omit<Recording, 'audio'> & { audio?: string }

export interface Backup {
  app: typeof APP
  version: number
  exportedAt: string
  settings: Settings[]
  sessions: Session[]
  songs: Song[]
  plan: PlanMonth[]
  recordings: SerializedRecording[]
}

const blobToDataUrl = (b: Blob) =>
  new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(r.result as string)
    r.onerror = () => rej(r.error)
    r.readAsDataURL(b)
  })

const dataUrlToBlob = async (u: string) => (await fetch(u)).blob()

export async function exportAll(includeAudio = true): Promise<Backup> {
  const recordings = await db.recordings.toArray()
  return {
    app: APP,
    version: VERSION,
    exportedAt: new Date().toISOString(),
    settings: await db.settings.toArray(),
    sessions: await db.sessions.toArray(),
    songs: await db.songs.toArray(),
    plan: await db.plan.toArray(),
    recordings: await Promise.all(
      recordings.map(async ({ audio, ...r }) => ({ ...r, audio: includeAudio && audio ? await blobToDataUrl(audio) : undefined })),
    ),
  }
}

export function downloadJson(data: unknown, filename: string) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(data)], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export function validateBackup(x: unknown): asserts x is Backup {
  const b = x as Partial<Backup>
  if (!b || b.app !== APP) throw new Error('This file isn’t a Guitar Year backup.')
  if (typeof b.version !== 'number' || b.version > VERSION) throw new Error('This backup is from a newer version of the app.')
  for (const k of ['settings', 'sessions', 'songs', 'plan', 'recordings'] as const)
    if (!Array.isArray(b[k])) throw new Error(`Backup is missing “${k}”.`)
}

/** Replaces all local data with the backup. */
export async function importAll(raw: unknown) {
  validateBackup(raw)
  const recordings: Recording[] = await Promise.all(
    raw.recordings.map(async ({ audio, ...r }) => ({ ...r, audio: audio ? await dataUrlToBlob(audio) : undefined })),
  )
  await db.transaction('rw', [db.settings, db.sessions, db.songs, db.plan, db.recordings, db.deletions], async () => {
    await Promise.all([db.settings.clear(), db.sessions.clear(), db.songs.clear(), db.plan.clear(), db.recordings.clear(), db.deletions.clear()])
    await db.settings.bulkPut(raw.settings)
    await db.sessions.bulkPut(raw.sessions)
    await db.songs.bulkPut(raw.songs)
    await db.plan.bulkPut(raw.plan)
    await db.recordings.bulkPut(recordings)
  })
}

import { useState } from 'react'
import type { AppData } from '../state/derived'
import { SONG_STATUSES, STATUS_LABEL, type Song, type SongStatus } from '../data/types'
import * as repo from '../data/repo'
import { Banner, Button, Card, Chip, Sheet, cx, field } from '../components/ui'
import { addDays as addDaysKey, addMonths, diffDays, monthLabel, shortDate, type DateKey } from '../lib/dates'
import { PLAN_START } from '../logic/plan'
import { REVIEW_INTERVALS } from '../logic/reviews'

const STATUS_TONE: Record<SongStatus, string> = {
  queued: 'text-muted border-line',
  learning: 'text-accent border-accent/50',
  canPlay: 'text-good border-good/50',
  polished: 'text-ink border-ink/40',
}

export function Songs({ data }: { data: AppData }) {
  const { songs, today, canPlayCount, plateaued } = data
  const [status, setStatus] = useState<SongStatus | 'all'>('all')
  const [diff, setDiff] = useState<number | 'all'>('all')
  const [editing, setEditing] = useState<Song | 'new' | null>(null)

  const shown = songs.filter((s) => (status === 'all' || s.status === status) && (diff === 'all' || s.difficulty === diff))
  const placeholders = songs.filter((s) => s.tags.includes('placeholder')).length

  return (
    <div className="pt-2">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold">Songs</h1>
          <p className="text-sm text-muted">
            <b className="text-good">{canPlayCount}</b> I can play · {songs.length} total
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => setEditing('new')}>
          + Add song
        </Button>
      </div>

      <div className="space-y-2 mt-3">
        {plateaued.map((s) => (
          <PlateauNudge key={s.id} song={s} today={today} songs={songs} />
        ))}
        {placeholders > 0 && (
          <Banner>
            {placeholders} song{placeholders === 1 ? ' is a' : 's are'} <b>placeholder{placeholders === 1 ? '' : 's'}</b>, to be replaced once you pick your music.
          </Banner>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto mt-4 pb-1 -mx-4 px-4">
        <Chip active={status === 'all'} onClick={() => setStatus('all')}>
          All
        </Chip>
        {SONG_STATUSES.map((s) => (
          <Chip key={s} active={status === s} onClick={() => setStatus(s)}>
            {STATUS_LABEL[s]} · {songs.filter((x) => x.status === s).length}
          </Chip>
        ))}
      </div>
      <div className="flex gap-2 overflow-x-auto mt-2 pb-1 -mx-4 px-4 items-center">
        <span className="text-xs text-muted shrink-0">Difficulty</span>
        <Chip active={diff === 'all'} onClick={() => setDiff('all')}>
          Any
        </Chip>
        {[1, 2, 3, 4, 5].map((d) => (
          <Chip key={d} active={diff === d} onClick={() => setDiff(d)}>
            {d}
          </Chip>
        ))}
      </div>

      <ul className="space-y-2 mt-3">
        {shown.map((s) => (
          <li key={s.id}>
            <SongRow song={s} today={today} onEdit={() => setEditing(s)} />
          </li>
        ))}
        {shown.length === 0 && <p className="text-sm text-muted py-6 text-center">No songs match these filters.</p>}
      </ul>

      <Sheet open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add song' : 'Edit song'}>
        {editing !== null && <SongForm song={editing === 'new' ? undefined : editing} today={today} onDone={() => setEditing(null)} />}
      </Sheet>
    </div>
  )
}

function Dots({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`difficulty ${n} of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <span key={i} className={cx('h-1.5 w-1.5 rounded-full', i <= n ? 'bg-ink' : 'bg-line')} />
      ))}
    </span>
  )
}

function reviewText(s: Song, today: DateKey) {
  if (!s.review) return null
  const d = diffDays(today, s.review.due)
  if (d <= 0) return 'review due — it’s in today’s session'
  return `next review ${d === 1 ? 'tomorrow' : shortDate(s.review.due)} · ${REVIEW_INTERVALS[s.review.stage]}-day step`
}

function SongRow({ song: s, today, onEdit }: { song: Song; today: DateKey; onEdit: () => void }) {
  const nextStatus = SONG_STATUSES[SONG_STATUSES.indexOf(s.status) + 1]
  return (
    <Card className="p-3.5">
      <div className="flex items-start gap-3">
        <button className="flex-1 min-w-0 text-left" onClick={onEdit}>
          <div className="flex items-center gap-2">
            <span className="font-semibold truncate">{s.title}</span>
            {s.tier === 'stretch' && <span className="text-[10px] font-bold uppercase text-accent shrink-0">stretch</span>}
          </div>
          <div className="text-sm text-muted truncate">{s.artist}</div>
          <div className="flex items-center gap-2 mt-1.5 text-xs text-muted flex-wrap">
            <Dots n={s.difficulty} />
            {s.chords.length > 0 && <span className="truncate">{s.chords.join(' ')}</span>}
            {s.tags.includes('placeholder') && <span className="rounded border border-line px-1">placeholder</span>}
            {s.rhythmOnly && <span className="rounded border border-line px-1">rhythm only</span>}
            {s.status === 'queued' && <span>from {monthLabel(addMonths(PLAN_START, s.targetMonth), false)}</span>}
          </div>
          {reviewText(s, today) && <div className="text-xs text-good mt-1">{reviewText(s, today)}</div>}
        </button>
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          <span className={cx('rounded-full border px-2 py-0.5 text-xs font-semibold', STATUS_TONE[s.status])}>{STATUS_LABEL[s.status]}</span>
          {nextStatus && (
            <button className="text-xs text-accent font-medium" onClick={() => repo.setSongStatus(s.id, nextStatus, today)}>
              → {STATUS_LABEL[nextStatus]}
            </button>
          )}
        </div>
      </div>
    </Card>
  )
}

function PlateauNudge({ song, today, songs }: { song: Song; today: DateKey; songs: Song[] }) {
  const weeks = Math.floor(diffDays(song.learningSince!, today) / 7)
  const nextQueued = songs.filter((s) => s.status === 'queued').sort((a, b) => a.order - b.order)[0]
  const snooze = () => repo.updateSong(song.id, { nudgeSnoozedUntil: addDaysKey(today, 14) }, today)
  return (
    <Banner tone="warn">
      <p>
        <b>{song.title}</b> has been in “learning” for {weeks} weeks. Plateaus are normal; a change of angle usually helps.
      </p>
      <div className="flex flex-wrap gap-2 mt-2">
        {!song.rhythmOnly && (
          <Button size="sm" onClick={() => repo.updateSong(song.id, { rhythmOnly: true, nudgeSnoozedUntil: addDaysKey(today, 21) }, today)}>
            Rhythm part only
          </Button>
        )}
        <Button
          size="sm"
          onClick={async () => {
            await repo.updateSong(song.id, { status: 'queued', order: Math.max(...songs.map((s) => s.order)) + 1 }, today)
            if (nextQueued && nextQueued.id !== song.id) await repo.setSongStatus(nextQueued.id, 'learning', today)
          }}
        >
          Swap{nextQueued ? ` for ${nextQueued.title}` : ''}
        </Button>
        <Button size="sm" variant="ghost" onClick={snooze}>
          Keep going
        </Button>
      </div>
    </Banner>
  )
}

const splitList = (v: string) =>
  v
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

function SongForm({ song, today, onDone }: { song?: Song; today: DateKey; onDone: () => void }) {
  const [f, setF] = useState({
    title: song?.title ?? '',
    artist: song?.artist ?? '',
    difficulty: song?.difficulty ?? 2,
    status: song?.status ?? ('queued' as SongStatus),
    chords: song?.chords.join(', ') ?? '',
    techniques: song?.techniques.join(', ') ?? '',
    link: song?.link ?? '',
    notes: song?.notes ?? '',
    tags: song?.tags.join(', ') ?? '',
    tier: song?.tier ?? ('easy' as Song['tier']),
    targetMonth: song?.targetMonth ?? 0,
    rhythmOnly: song?.rhythmOnly ?? false,
  })
  const [confirmDelete, setConfirmDelete] = useState(false)
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((x) => ({ ...x, [k]: v }))

  async function save() {
    const payload = {
      title: f.title.trim(),
      artist: f.artist.trim(),
      difficulty: f.difficulty as Song['difficulty'],
      status: f.status,
      chords: splitList(f.chords),
      techniques: splitList(f.techniques),
      link: f.link.trim(),
      notes: f.notes,
      tags: splitList(f.tags),
      tier: f.tier,
      targetMonth: f.targetMonth,
      rhythmOnly: f.rhythmOnly,
    }
    if (song) await repo.updateSong(song.id, payload, today)
    else await repo.addSong(payload, today)
    onDone()
  }

  const label = 'block text-xs font-semibold uppercase tracking-wider text-muted mb-1 mt-3'
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        void save()
      }}
    >
      <label className={label} htmlFor="t">Title</label>
      <input id="t" className={field} value={f.title} onChange={(e) => set('title', e.target.value)} required />
      <label className={label} htmlFor="a">Artist</label>
      <input id="a" className={field} value={f.artist} onChange={(e) => set('artist', e.target.value)} />

      <span className={label}>Status</span>
      <div className="flex flex-wrap gap-2">
        {SONG_STATUSES.map((s) => (
          <Chip key={s} active={f.status === s} onClick={() => set('status', s)}>
            {STATUS_LABEL[s]}
          </Chip>
        ))}
      </div>

      <span className={label}>Difficulty</span>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((d) => (
          <Chip key={d} active={f.difficulty === d} onClick={() => set('difficulty', d as Song['difficulty'])}>
            {d}
          </Chip>
        ))}
        <span className="w-2" />
        {(['easy', 'stretch'] as const).map((t) => (
          <Chip key={t} active={f.tier === t} onClick={() => set('tier', t)}>
            {t}
          </Chip>
        ))}
      </div>

      <label className={label} htmlFor="c">Chords (comma-separated)</label>
      <input id="c" className={field} value={f.chords} onChange={(e) => set('chords', e.target.value)} placeholder="G, C, D, Em" />
      <label className={label} htmlFor="tq">Techniques</label>
      <input id="tq" className={field} value={f.techniques} onChange={(e) => set('techniques', e.target.value)} placeholder="Palm muting, riff" />
      <label className={label} htmlFor="l">Tab / video link</label>
      <div className="flex gap-2">
        <input id="l" className={field} type="url" value={f.link} onChange={(e) => set('link', e.target.value)} placeholder="https://" />
        {f.link && (
          <a href={f.link} target="_blank" rel="noreferrer" className="shrink-0 rounded-xl bg-surface-2 border border-line px-3 grid place-items-center text-sm text-accent">
            Open
          </a>
        )}
      </div>

      <label className={label} htmlFor="m">Starts in plan month</label>
      <select id="m" className={field} value={f.targetMonth} onChange={(e) => set('targetMonth', Number(e.target.value))}>
        {Array.from({ length: 12 }, (_, i) => (
          <option key={i} value={i}>
            Month {i + 1} · {monthLabel(addMonths(PLAN_START, i))}
          </option>
        ))}
      </select>

      <label className={label} htmlFor="n">Notes</label>
      <textarea id="n" className={field} rows={3} value={f.notes} onChange={(e) => set('notes', e.target.value)} />
      <label className={label} htmlFor="tg">Tags</label>
      <input id="tg" className={field} value={f.tags} onChange={(e) => set('tags', e.target.value)} placeholder="placeholder" />
      <label className="flex items-center gap-2 mt-3 text-sm">
        <input type="checkbox" className="h-5 w-5 accent-[var(--accent)]" checked={f.rhythmOnly} onChange={(e) => set('rhythmOnly', e.target.checked)} />
        Rhythm part only (for now)
      </label>

      <div className="flex gap-2 mt-6">
        {song &&
          (confirmDelete ? (
            <Button
              type="button"
              variant="danger"
              onClick={async () => {
                await repo.deleteSong(song.id)
                onDone()
              }}
            >
              Really delete
            </Button>
          ) : (
            <Button type="button" variant="ghost" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          ))}
        <Button type="submit" variant="primary" className="ml-auto px-8" disabled={!f.title.trim()}>
          Save
        </Button>
      </div>
    </form>
  )
}

import { useState } from 'react'
import { howTo, youtubeSearch } from '../data/howto'
import type { Song } from '../data/types'
import type { SessionItem } from '../logic/session'
import { cx } from './ui'
import { SongListen } from './SongListen'

/** Whether a session item has anything to show in a how-to panel. */
export function hasHowTo(item: SessionItem, song?: Song) {
  return !!(howTo(item.label) || song?.link || song?.notes)
}

const linkBtn = 'flex items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-semibold text-center'

/** Steps, tab and lesson links for one warm-up/skill, or the chart link for a song. */
export function HowToPanel({ item, song }: { item: SessionItem; song?: Song }) {
  const h = howTo(item.label)
  if (!h && song) {
    return (
      <div className="space-y-2 text-sm">
        {song.notes && <p className="text-muted">{song.notes}</p>}
        {song.link && (
          <a href={song.link} target="_blank" rel="noreferrer" className={cx(linkBtn, 'bg-accent text-accent-ink')}>
            Open chords / tab / lesson ↗
          </a>
        )}
        <SongListen song={song} />
      </div>
    )
  }
  if (!h) return null
  const search = youtubeSearch(h.search ?? `${item.label} guitar lesson beginner`)
  return (
    <div className="space-y-3 text-sm text-left">
      <ol className="list-decimal pl-5 space-y-1.5 marker:text-muted">
        {h.steps.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      {h.tab && <pre className="overflow-x-auto rounded-lg bg-bg border border-line p-3 font-mono text-[12px] leading-snug text-ink">{h.tab}</pre>}
      <div className="grid gap-2">
        {h.lesson ? (
          <>
            <a href={h.lesson.url} target="_blank" rel="noreferrer" className={cx(linkBtn, 'bg-accent text-accent-ink')}>
              ▶ Watch: {h.lesson.label} ↗
            </a>
            <a href={search} target="_blank" rel="noreferrer" className={cx(linkBtn, 'bg-surface-2 border border-line text-ink')}>
              More videos on YouTube ↗
            </a>
          </>
        ) : (
          h.search && (
            <a href={search} target="_blank" rel="noreferrer" className={cx(linkBtn, 'bg-surface-2 border border-line text-ink')}>
              ▶ Find a lesson on YouTube ↗
            </a>
          )
        )}
      </div>
    </div>
  )
}

const OPEN_KEY = 'gy.howToOpen'
const readOpen = () => {
  try {
    return localStorage.getItem(OPEN_KEY) === '1'
  } catch {
    return false
  }
}

/** Collapsible "How to do this" for the current item; remembers whether you keep it open. */
export function HowToToggle({ item, song }: { item: SessionItem; song?: Song }) {
  const [open, setOpen] = useState(readOpen)
  if (!hasHowTo(item, song)) return null
  const toggle = () => {
    setOpen(!open)
    try {
      localStorage.setItem(OPEN_KEY, open ? '0' : '1')
    } catch {
      /* storage unavailable */
    }
  }
  return (
    <div className="mt-3">
      <button type="button" onClick={toggle} aria-expanded={open} className="text-sm font-semibold text-accent">
        {open ? 'Hide how-to ▴' : song && !howTo(item.label) ? 'Song notes & chords ▾' : 'How to do this ▾'}
      </button>
      {open && (
        <div className="mt-3 rounded-xl bg-surface-2 p-3">
          <HowToPanel item={item} song={song} />
        </div>
      )}
    </div>
  )
}

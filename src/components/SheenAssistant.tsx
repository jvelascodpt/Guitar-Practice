import { useEffect, useState, type ReactNode } from 'react'
import { SheenFigure, sheenLook } from './Sheen'
import { usePlayer } from '../audio/guitar'
import type { Song } from '../data/types'
import { cx } from './ui'

/** Sheen in the Today header (top right) with his speech bubble underneath. Tap him for the next tip. */
export function SheenHeader({ today, lines, songs, children }: { today: string; lines: string[]; songs: Song[]; children: ReactNode }) {
  const look = sheenLook(today)
  const player = usePlayer()
  const playing = !!player.songId
  const [i, setI] = useState(0)
  const first = lines[0]
  useEffect(() => setI(0), [first])
  const song = playing ? songs.find((s) => s.id === player.songId) : undefined
  const chord = song ? song.chords[player.chord] : undefined

  return (
    <>
      <header className="pt-2 flex items-start gap-2">
        <div className="flex-1 min-w-0">{children}</div>
        <button
          type="button"
          onClick={() => setI((n) => (n + 1) % lines.length)}
          className="-mt-1 -mr-2 w-[112px] shrink-0"
          aria-label="Sheen the Shredder: tap for the next tip"
        >
          <SheenFigure look={look} playing={playing} className="w-full h-auto drop-shadow-[0_6px_14px_rgba(0,0,0,.45)]" />
        </button>
      </header>
      <div className="relative -mt-2">
        {/* tail pointing up at Sheen */}
        <span className="absolute -top-1.5 right-12 h-3 w-3 rotate-45 bg-surface border-l border-t border-line" aria-hidden />
        <div className="gy-card rounded-2xl bg-surface border border-line px-3.5 py-2.5 text-sm shadow-[var(--card-shadow,none)]" aria-live="polite">
          <span className="font-display text-base text-accent mr-1.5">Sheen:</span>
          {playing && song ? (
            <span>
              Shredding <b>{song.title}</b> for you! Now playing <span className="font-display text-lg text-accent">{chord}</span> 🎸
            </span>
          ) : (
            <span>{lines[i]}</span>
          )}
          {!playing && <span className="block text-[11px] text-muted mt-1">Tap me for another tip ({i + 1}/{lines.length})</span>}
        </div>
      </div>
    </>
  )
}

/** Mini Sheen that pops up in the corner on other tabs while chords play. */
export function SheenFloating({ today, songs }: { today: string; songs: Song[] }) {
  const player = usePlayer()
  if (!player.songId) return null
  const song = songs.find((s) => s.id === player.songId)
  const chord = song?.chords[player.chord]
  return (
    <div className={cx('fixed right-3 z-40 flex items-end gap-1 pointer-events-none')} style={{ bottom: 'calc(env(safe-area-inset-bottom) + 76px)' }}>
      {chord && (
        <span className="mb-16 rounded-xl bg-surface gy-card border border-line px-2.5 py-1 font-display text-xl text-accent shadow-[var(--card-shadow,none)]">{chord}</span>
      )}
      <SheenFigure look={sheenLook(today)} playing className="w-[92px] h-auto drop-shadow-[0_6px_14px_rgba(0,0,0,.5)]" />
    </div>
  )
}

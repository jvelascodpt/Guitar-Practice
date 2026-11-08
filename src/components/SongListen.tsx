import { useEffect } from 'react'
import type { Song } from '../data/types'
import { capoOf, soundingName, voicingFor } from '../audio/chords'
import { getPlayingSongId, playChords, stopChords, usePlayer } from '../audio/guitar'
import { cx } from './ui'
import { ChordDiagram } from './ChordDiagram'

export const coverSearch = (s: Song) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(`${s.title} ${s.artist.split(/ ft\.| &/)[0]} electric guitar cover`)}`

/** "▶ Hear the chords" (synth electric guitar) + "Electric guitar cover ↗". */
export function SongListen({ song, compact }: { song: Song; compact?: boolean }) {
  const player = usePlayer()
  const playing = player.songId === song.id
  const playable = song.chords.filter((c) => voicingFor(c))
  const capo = capoOf([...song.techniques, song.notes])

  // Stop if this control goes away while its song is playing.
  useEffect(() => () => {
    if (getPlayingSongId() === song.id) stopChords()
  }, [song.id])

  const btn = 'inline-flex items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-sm font-semibold whitespace-nowrap'
  return (
    <div className={cx('space-y-2', compact ? 'mt-2.5' : '')}>
      <div className={cx('grid gap-2', playable.length > 0 ? 'grid-cols-2' : 'grid-cols-1')}>
        {playable.length > 0 && (
          <button
            type="button"
            onClick={() => (playing ? stopChords() : playChords(song.id, playable, capo))}
            aria-pressed={playing}
            className={cx(btn, playing ? 'bg-accent text-accent-ink' : 'bg-surface-2 border border-line text-ink')}
          >
            {playing ? '■ Stop' : '▶ Hear chords'}
          </button>
        )}
        <a href={coverSearch(song)} target="_blank" rel="noreferrer" className={cx(btn, 'bg-surface-2 border border-line text-ink')}>
          Electric cover ↗
        </a>
      </div>
      {playing && (
        <div className="rounded-xl bg-surface-2 border border-line p-3 flex items-center justify-between gap-2" aria-live="polite">
          <ChordDiagram name={playable[Math.max(0, player.chord)]} capo={capo} />
          {playable.length > 1 && (
            <div className="text-right text-xs text-muted shrink-0">
              Next
              <div className="font-display text-xl text-ink">{playable[(Math.max(0, player.chord) + 1) % playable.length]}</div>
            </div>
          )}
        </div>
      )}
      {playing && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {playable.map((c, i) => (
            <span key={`${c}-${i}`} className={cx('rounded-md px-2 py-1 font-semibold tabular', i === player.chord ? 'bg-accent text-accent-ink' : 'bg-surface-2 text-muted')}>
              {c}
            </span>
          ))}
          {capo > 0 && <span className="text-muted ml-1">capo {capo}: sounds like {playable.map((c) => soundingName(c, capo)).join(' ')}</span>}
        </div>
      )}
    </div>
  )
}

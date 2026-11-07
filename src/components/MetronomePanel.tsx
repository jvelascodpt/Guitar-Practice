import { useEffect, useState } from 'react'
import { metronome } from '../audio/metronome'
import { cx } from './ui'

/** Compact metronome. `suggestedBpm` re-targets the tempo when the session item changes. */
export function MetronomePanel({ suggestedBpm }: { suggestedBpm?: number }) {
  const [bpm, setBpm] = useState(metronome.bpm)
  const [on, setOn] = useState(metronome.running)
  const [beat, setBeat] = useState(-1)

  useEffect(() => metronome.onBeat(setBeat), [])
  useEffect(() => {
    if (suggestedBpm) {
      metronome.bpm = suggestedBpm
      setBpm(suggestedBpm)
    }
  }, [suggestedBpm])

  const change = (d: number) => {
    const v = Math.min(220, Math.max(30, bpm + d))
    metronome.bpm = v
    setBpm(v)
  }
  const toggle = () => {
    if (metronome.running) metronome.stop()
    else metronome.start()
    setOn(metronome.running)
    setBeat(-1)
  }

  return (
    <div className="gy-card rounded-2xl bg-surface border border-line p-3 shadow-[var(--card-shadow,none)]">
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          aria-pressed={on}
          className={cx('h-12 w-12 shrink-0 rounded-full grid place-items-center text-lg font-bold', on ? 'bg-accent text-accent-ink' : 'bg-surface-2 border border-line')}
          aria-label={on ? 'Stop metronome' : 'Start metronome'}
        >
          {on ? '■' : '▶'}
        </button>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tabular">{bpm}</span>
            <span className="text-xs text-muted">bpm</span>
          </div>
          <div className="flex gap-1.5 mt-1" aria-hidden>
            {[0, 1, 2, 3].map((i) => (
              <span key={i} className={cx('h-1.5 flex-1 rounded-full', on && beat === i ? (i === 0 ? 'bg-accent' : 'bg-ink') : 'bg-surface-2')} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-1">
          {[-5, 5, -1, 1].map((d) => (
            <button key={d} onClick={() => change(d)} className="rounded-lg bg-surface-2 border border-line px-2 py-1 text-xs font-semibold tabular min-w-10">
              {d > 0 ? `+${d}` : d}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

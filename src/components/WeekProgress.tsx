import { useEffect, useState } from 'react'
import type { WeekView } from '../logic/week'
import { Card, cx } from './ui'

const HATCH = 'bg-[repeating-linear-gradient(45deg,var(--muted)_0_2px,transparent_2px_6px)]'

/** Weekly target as day bubbles + a segmented bar that fills toward the goal. */
export function WeekProgress({ view }: { view: WeekView }) {
  const { days, count, target, message, hitToday } = view
  const bonus = Math.max(0, count - target)
  const weekKey = `gy.celebrated.${days[0].key}`
  const [burst, setBurst] = useState(false)

  // Confetti once, the first time you see the goal hit this week.
  useEffect(() => {
    if (!hitToday) return
    try {
      if (localStorage.getItem(weekKey)) return
      localStorage.setItem(weekKey, '1')
    } catch {
      /* storage unavailable: still celebrate */
    }
    setBurst(true)
    const t = window.setTimeout(() => setBurst(false), 2000)
    return () => clearTimeout(t)
  }, [hitToday, weekKey])

  return (
    <Card className={cx('relative overflow-hidden', count >= target && 'ring-2 ring-accent/70')}>
      <div className="flex items-baseline justify-between">
        <h2 className="font-bold">This week</h2>
        <span className="text-sm text-muted tabular">
          <b className="text-ink">{count}</b> of {target} days{bonus > 0 && <span className="text-accent font-semibold"> +{bonus} bonus</span>}
        </span>
      </div>

      <ol className="grid grid-cols-7 gap-1.5 mt-3" aria-label="Days practised this week">
        {days.map((d) => (
          <li key={d.key} className="flex flex-col items-center gap-1">
            <span
              aria-label={`${d.label}: ${d.state === 'done' ? 'practised' : d.state === 'frozen' ? 'streak freeze' : d.state === 'today' ? 'today, not yet' : d.state === 'missed' ? 'rest day' : 'upcoming'}`}
              className={cx(
                'h-9 w-9 rounded-full grid place-items-center text-sm font-bold transition',
                d.state === 'done' && 'bg-accent text-accent-ink shadow-[0_0_12px_-2px_var(--accent)]',
                d.state === 'frozen' && cx('border border-line', HATCH),
                d.state === 'today' && 'border-2 border-accent animate-pulse',
                d.state === 'missed' && 'bg-surface-2',
                d.state === 'future' && 'border border-line opacity-60',
              )}
            >
              {d.state === 'done' ? '✓' : ''}
            </span>
            <span className={cx('text-[11px] font-semibold', d.state === 'today' ? 'text-accent' : 'text-muted')}>{d.label}</span>
          </li>
        ))}
      </ol>

      <div className="flex gap-1 mt-4" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(count, target)}>
        {Array.from({ length: target }, (_, i) => (
          <span key={i} className="h-3 flex-1 rounded-full bg-surface-2 overflow-hidden">
            <span className={cx('block h-full rounded-full bg-accent transition-[width] duration-700 ease-out', i < count ? 'w-full' : 'w-0')} style={{ transitionDelay: `${i * 90}ms` }} />
          </span>
        ))}
        <span className={cx('ml-1 text-sm leading-3', count >= target ? 'opacity-100' : 'opacity-40 grayscale')} aria-hidden>
          🎸
        </span>
      </div>

      <p className={cx('text-sm mt-3', count >= target ? 'font-semibold text-accent' : 'text-ink')}>{message}</p>

      {burst && (
        <div className="pointer-events-none absolute inset-0" aria-hidden>
          {Array.from({ length: 34 }, (_, i) => {
            const angle = (i / 34) * Math.PI * 2
            const dist = 110 + (i % 6) * 24
            return (
              <span
                key={i}
                className="absolute left-1/2 top-1/2 h-3 w-2 rounded-sm"
                style={{
                  background: ['var(--accent)', 'var(--good)', 'var(--warn)', 'var(--ink)'][i % 4],
                  ['--dx' as string]: `${Math.cos(angle) * dist}px`,
                  ['--dy' as string]: `${Math.sin(angle) * dist - 20}px`,
                  ['--rot' as string]: `${i * 47}deg`,
                  animation: `gy-confetti 1.6s cubic-bezier(.2,.7,.3,1) ${(i % 3) * 40}ms both`,
                }}
              />
            )
          })}
        </div>
      )}
    </Card>
  )
}

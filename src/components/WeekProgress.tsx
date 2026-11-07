import { useEffect, useState } from 'react'
import type { WeekView } from '../logic/week'
import { Card, cx } from './ui'

const HATCH = 'bg-[repeating-linear-gradient(45deg,var(--muted)_0_2px,transparent_2px_6px)]'

/** The five classic fret-button colours: green, red, yellow, blue, orange. */
export const FRET = ['#22c55e', '#ef4444', '#facc15', '#3b82f6', '#f97316']
const fret = (i: number) => FRET[i % FRET.length]
/** Glossy lit button: a highlight up-left, full colour, darker rim. */
const lit = (c: string) => `radial-gradient(circle at 35% 30%, rgba(255,255,255,.85) 0 7%, ${c} 32%, color-mix(in srgb, ${c} 70%, black) 100%)`
const FRET_RING = `linear-gradient(90deg, ${FRET.join(', ')})`

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

  const goal = count >= target
  return (
    <div className={cx('rounded-[18px]', goal && 'p-[2px] shadow-[0_0_22px_-6px_rgba(250,204,21,.7)]')} style={goal ? { background: FRET_RING } : undefined}>
      {/* Solid layer so the coloured border doesn't tint the see-through card. */}
      <div className={goal ? "rounded-2xl bg-bg" : undefined}>
        <Card className="relative overflow-hidden">
          <div className="flex items-baseline justify-between">
            <h2 className="font-bold">This week</h2>
            <span className="text-sm text-muted tabular">
              <b className="text-ink">{count}</b> of {target} days{bonus > 0 && <span className="text-accent font-semibold"> +{bonus} bonus</span>}
            </span>
          </div>

          <ol className="grid grid-cols-7 gap-1.5 mt-3" aria-label="Days practised this week">
            {days.map((d, i) => {
              const c = fret(i)
              return (
                <li key={d.key} className="flex flex-col items-center gap-1">
                  <span
                    aria-label={`${d.label}: ${d.state === 'done' ? 'practised' : d.state === 'frozen' ? 'streak freeze' : d.state === 'today' ? 'today, not yet' : d.state === 'missed' ? 'rest day' : 'upcoming'}`}
                    className={cx(
                      'h-9 w-9 rounded-full grid place-items-center text-sm font-black transition',
                      d.state === 'frozen' && HATCH,
                      d.state === 'today' && 'animate-pulse',
                      d.state === 'future' && 'opacity-55',
                    )}
                    style={
                      d.state === 'done'
                        ? { background: lit(c), boxShadow: `0 0 14px -1px ${c}, inset 0 -2px 3px rgba(0,0,0,.35)`, color: '#1b1205' }
                        : {
                            border: `${d.state === 'today' ? 3 : 2}px solid ${d.state === 'today' ? c : `color-mix(in srgb, ${c} 55%, transparent)`}`,
                            background: d.state === 'frozen' ? undefined : 'radial-gradient(circle at 50% 40%, rgba(255,255,255,.06), rgba(0,0,0,.25))',
                          }
                    }
                  >
                    {d.state === 'done' ? '✓' : ''}
                  </span>
                  <span className="text-[11px] font-semibold" style={{ color: d.state === 'today' ? c : undefined }}>
                    <span className={d.state === 'today' ? '' : 'text-muted'}>{d.label}</span>
                  </span>
                </li>
              )
            })}
          </ol>

          <div className="flex gap-1 mt-4" role="progressbar" aria-valuemin={0} aria-valuemax={target} aria-valuenow={Math.min(count, target)}>
            {Array.from({ length: target }, (_, i) => (
              <span key={i} className="h-3 flex-1 rounded-full overflow-hidden" style={{ background: `color-mix(in srgb, ${fret(i)} 18%, transparent)` }}>
                <span
                  className={cx('block h-full rounded-full transition-[width] duration-700 ease-out', i < count ? 'w-full' : 'w-0')}
                  style={{
                    background: `linear-gradient(180deg, color-mix(in srgb, ${fret(i)} 70%, white), ${fret(i)} 45%)`,
                    boxShadow: `0 0 8px -1px ${fret(i)}`,
                    transitionDelay: `${i * 90}ms`,
                  }}
                />
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
                      background: FRET[i % FRET.length],
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
      </div>
    </div>
  )
}

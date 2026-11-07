import { useMemo, useState } from 'react'
import type { AppData } from '../state/derived'
import { BarChart, type Bar } from '../components/BarChart'
import { Card, SectionTitle, Stat, cx } from '../components/ui'
import { addDays, addMonths, daysInMonth, fromKey, monthKey, monthLabel, shortDate, weekStart, type DateKey } from '../lib/dates'
import { PLAN_MONTHS, PLAN_START } from '../logic/plan'
import type { Session } from '../data/types'

export function Stats({ data }: { data: AppData }) {
  const { sessions, today, streak, weekDays, settings } = data
  const byDate = useMemo(() => new Map(sessions.map((s) => [s.date, s])), [sessions])
  const target = settings?.weeklyTargetDays ?? 5

  const weeks: Bar[] = useMemo(() => {
    const thisWeek = weekStart(today)
    return Array.from({ length: 12 }, (_, i) => {
      const start = addDays(thisWeek, (i - 11) * 7)
      let min = 0
      let days = 0
      for (let d = 0; d < 7; d++) {
        const s = byDate.get(addDays(start, d))
        if (s) {
          min += s.minutes
          days++
        }
      }
      return { key: start, label: `${Number(start.slice(5, 7))}/${Number(start.slice(8))}`, value: min, detail: `Week of ${shortDate(start)}: ${min} min · ${days} day${days === 1 ? '' : 's'}` }
    })
  }, [byDate, today])

  const months: Bar[] = useMemo(
    () =>
      Array.from({ length: PLAN_MONTHS }, (_, i) => {
        const m = addMonths(PLAN_START, i)
        const n = sessions.filter((s) => monthKey(s.date) === m).length
        return { key: m, label: monthLabel(m, false)[0], value: n, detail: `${monthLabel(m)}: ${n} day${n === 1 ? '' : 's'} practiced` }
      }),
    [sessions],
  )
  const monthTarget = Math.round((target * 30.4) / 7)
  const totalMin = sessions.reduce((a, s) => a + s.minutes, 0)

  return (
    <div className="pt-2">
      <h1 className="gy-title text-4xl">Streaks & stats</h1>
      <p className="text-sm text-muted">Streaks reward showing up. A 5-minute day counts the same as a full one.</p>

      <div className="grid grid-cols-2 gap-2 mt-4">
        <Stat label="current streak (days)" value={streak.current} />
        <Stat label="longest streak (days)" value={streak.longest} />
        <Stat label={`days this week (target ${target})`} value={`${weekDays}/${target}`} />
        <Stat label="streak freeze" value={streak.freezeUsedThisWeek ? 'Used' : 'Ready'} sub="1 free missed day per week" />
      </div>

      <SectionTitle>Practice calendar</SectionTitle>
      <Card>
        <Heatmap byDate={byDate} frozen={streak.frozen} today={today} />
      </Card>

      <SectionTitle right={<span className="text-xs text-muted tabular">{totalMin} min total</span>}>Minutes per week</SectionTitle>
      <Card>
        <BarChart bars={weeks} unit="min" highlightKey={weekStart(today)} />
      </Card>

      <SectionTitle>Days practiced per month</SectionTitle>
      <Card>
        <BarChart bars={months} unit="days" target={monthTarget} targetLabel={`target ≈${monthTarget}`} highlightKey={monthKey(today)} />
      </Card>
    </div>
  )
}

function level(s: Session | undefined): number {
  if (!s) return 0
  if (s.minutes < 10) return 1
  if (s.minutes < 20) return 2
  return 3
}
const LEVEL_CLASS = ['bg-surface-2', 'bg-accent/35', 'bg-accent/65', 'bg-accent']

function Heatmap({ byDate, frozen, today }: { byDate: Map<DateKey, Session>; frozen: Set<DateKey>; today: DateKey }) {
  const [sel, setSel] = useState<DateKey | null>(null)
  const s = sel ? byDate.get(sel) : undefined
  return (
    <div>
      <div className="h-5 text-sm" aria-live="polite">
        {sel ? (
          <b>
            {shortDate(sel)}: {s ? `${s.minutes} min${s.mode === 'badDay' ? ' (5-min day)' : ''}${s.pain ? ` · hand ${s.pain}` : ''}` : frozen.has(sel) ? 'streak freeze' : 'no session'}
          </b>
        ) : (
          <span className="text-muted">Tap a day for details</span>
        )}
      </div>
      <div className="grid grid-cols-3 gap-x-3 gap-y-4 mt-3">
        {Array.from({ length: PLAN_MONTHS }, (_, i) => {
          const m = addMonths(PLAN_START, i)
          const first = `${m}-01`
          const offset = (fromKey(first).getDay() + 6) % 7
          return (
            <div key={m}>
              <div className="text-[11px] font-semibold text-muted mb-1">{monthLabel(m, i === 0 || m.endsWith('-01'))}</div>
              <div className="grid grid-cols-7 gap-[2px]">
                {Array.from({ length: offset }, (_, j) => (
                  <span key={`o${j}`} />
                ))}
                {Array.from({ length: daysInMonth(m) }, (_, d) => {
                  const k = addDays(first, d)
                  const lv = level(byDate.get(k))
                  return (
                    <button
                      key={k}
                      onClick={() => setSel(k)}
                      aria-label={`${shortDate(k)}${lv ? ' practiced' : frozen.has(k) ? ' frozen' : ''}`}
                      className={cx(
                        'aspect-square rounded-[2px]',
                        k > today ? 'bg-surface-2/40' : LEVEL_CLASS[lv],
                        frozen.has(k) && 'bg-[repeating-linear-gradient(45deg,var(--muted)_0_1.5px,transparent_1.5px_4px)]',
                        k === today && 'ring-1 ring-ink',
                        sel === k && 'ring-2 ring-accent',
                      )}
                    />
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex items-center gap-1.5 mt-4 text-[11px] text-muted">
        <span>Less</span>
        {LEVEL_CLASS.map((c) => (
          <span key={c} className={cx('h-3 w-3 rounded-[2px]', c)} />
        ))}
        <span>More</span>
        <span className="ml-auto flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[2px] bg-[repeating-linear-gradient(45deg,var(--muted)_0_1.5px,transparent_1.5px_4px)]" />
          freeze
        </span>
      </div>
    </div>
  )
}

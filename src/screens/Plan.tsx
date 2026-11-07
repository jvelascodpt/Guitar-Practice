import { useEffect, useRef, useState } from 'react'
import type { AppData } from '../state/derived'
import type { PlanMonth } from '../data/types'
import * as repo from '../data/repo'
import { Card, cx, field } from '../components/ui'
import { monthLabel } from '../lib/dates'

export function Plan({ data }: { data: AppData }) {
  const { plan, planIdx, recordings } = data
  const currentRef = useRef<HTMLDivElement>(null)
  useEffect(() => currentRef.current?.scrollIntoView({ block: 'start' }), [])

  return (
    <div className="pt-2 space-y-3">
      <h1 className="gy-title text-4xl">The plan</h1>
      <Card className="text-sm text-muted">
        <b className="text-ink">Every month:</b> record one clip, keep the song list current, and back off intensity for a few days if the fretting
        hand or forearm hurts.
      </Card>
      {plan.map((m) => (
        <div key={m.id} ref={m.id === planIdx ? currentRef : undefined} className="scroll-mt-4">
          <MonthCard m={m} state={m.id < planIdx ? 'past' : m.id === planIdx ? 'current' : 'future'} recorded={recordings.some((r) => r.monthKey === m.monthKey)} />
        </div>
      ))}
    </div>
  )
}

function MonthCard({ m, state, recorded }: { m: PlanMonth; state: 'past' | 'current' | 'future'; recorded: boolean }) {
  const [open, setOpen] = useState(state === 'current')
  const done = m.weeks.filter((w) => w.done).length
  const toggleWeek = (i: number) => repo.updatePlanMonth(m.id, { weeks: m.weeks.map((w, j) => (j === i ? { ...w, done: !w.done } : w)) })

  return (
    <Card className={cx(state === 'current' && 'border-accent', state === 'future' && 'opacity-80')}>
      <button className="w-full text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider">
          <span className={state === 'current' ? 'text-accent' : 'text-muted'}>
            Month {m.id + 1} · {monthLabel(m.monthKey)}
          </span>
          {state === 'current' && <span className="rounded-full bg-accent text-accent-ink px-2 py-0.5 text-[10px]">now</span>}
          {m.dangerZone && <span className="rounded-full border border-warn/50 text-warn px-2 py-0.5 text-[10px]">tough month</span>}
          <span className="ml-auto text-muted tabular normal-case tracking-normal">
            {m.goalMet ? '✓ goal' : `${done}/${m.weeks.length}`}
          </span>
        </div>
        <h2 className="font-display text-2xl mt-1">{m.title}</h2>
        {!open && <p className="text-sm text-muted line-clamp-1">{m.goal}</p>}
      </button>

      {open && (
        <div className="mt-2 space-y-4">
          <p className="text-sm text-muted">{m.focus}</p>

          <div className="rounded-xl bg-surface-2 p-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted">Goal</div>
            <p className="font-medium mt-0.5">{m.goal}</p>
            <label className="flex items-center gap-2 mt-2 text-sm">
              <input
                type="checkbox"
                className="h-5 w-5 accent-[var(--good)]"
                checked={m.goalMet}
                onChange={(e) => repo.updatePlanMonth(m.id, { goalMet: e.target.checked })}
              />
              Goal met
            </label>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Weekly checkpoints</div>
            <ul className="space-y-1">
              {m.weeks.map((w, i) => (
                <li key={i}>
                  <label className="flex items-start gap-3 rounded-xl px-3 py-2.5 bg-surface-2">
                    <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--good)]" checked={w.done} onChange={() => toggleWeek(i)} />
                    <span className={cx('text-[15px]', w.done && 'text-muted line-through')}>
                      <span className="text-muted text-xs mr-1.5">W{i + 1}</span>
                      {w.label}
                    </span>
                  </label>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">Skills in rotation</div>
            <ol className="text-sm space-y-0.5 list-decimal list-inside text-ink/90">
              {m.skills.map((s) => (
                <li key={s.name}>
                  {s.name}
                  {s.bpm ? <span className="text-muted"> · {s.bpm}{s.bpmMax ? `→${s.bpmMax}` : ''} bpm</span> : null}
                </li>
              ))}
            </ol>
            <p className="text-xs text-muted mt-1">Today’s session introduces these one at a time and mixes them in automatically.</p>
          </div>

          {m.dangerNote && <p className="text-sm rounded-xl border border-warn/40 bg-warn/10 p-3">{m.dangerNote}</p>}

          <div className="flex items-center gap-2 text-sm">
            <span className={recorded ? 'text-good' : 'text-muted'}>{recorded ? '✓ Monthly clip recorded' : '○ Monthly clip not recorded yet'}</span>
          </div>

          <textarea
            className={`${field} text-sm`}
            rows={2}
            placeholder="Notes for this month (e.g. 1-minute change counts)"
            defaultValue={m.notes}
            onBlur={(e) => e.target.value !== m.notes && repo.updatePlanMonth(m.id, { notes: e.target.value })}
          />
        </div>
      )}
    </Card>
  )
}

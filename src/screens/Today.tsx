import { useEffect, useMemo, useState } from 'react'
import type { AppData } from '../state/derived'
import { buildSession, type BuiltSession, type SessionItem } from '../logic/session'
import * as repo from '../data/repo'
import * as active from '../state/activeSession'
import { useActive, elapsedItem, elapsedTotal, type ActiveSession } from '../state/activeSession'
import { chime, metronome } from '../audio/metronome'
import { MetronomePanel } from '../components/MetronomePanel'
import { HowToPanel, HowToToggle, hasHowTo } from '../components/HowTo'
import { Banner, Button, Card, Stat, cx, fmtClock } from '../components/ui'
import { fromKey, monthKey, shortDate } from '../lib/dates'
import type { PainRating, SessionMode, Song } from '../data/types'
import type { Tab } from '../App'

const DOW = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function Today({ data, go }: { data: AppData; go: (t: Tab) => void }) {
  const { today, month, prevMonth, sessions, songs, settings, todaySession, streak, weekDays, canPlayCount } = data
  const [mode, setMode] = useState<SessionMode>('full')
  const run = useActive()

  // A session left running from a previous day is discarded.
  useEffect(() => {
    if (run && run.date !== today) active.clear()
  }, [run, today])

  const built = useMemo(
    () => (month ? buildSession({ today, plan: month, prevPlan: prevMonth, sessions, songs, mode }) : null),
    [today, month, prevMonth, sessions, songs, mode],
  )
  if (!month || !built || !settings) return null

  const running = run && run.date === today ? run : null

  async function finish() {
    const a = active.getActive()
    const items = a?.items ?? built!.items
    const completed: ActiveSession['completed'] = a ? a.completed : Object.fromEntries(items.map((i) => [i.id, true as const]))
    const minutes = a ? Math.max(1, Math.round(elapsedTotal(a) / 60000)) : built!.totalMinutes
    await repo.completeSession({ date: today, mode: a?.mode ?? mode, plannedMinutes: items.reduce((s, i) => s + i.minutes, 0), minutes, items, completed })
    metronome.stop()
    active.clear()
  }

  return (
    <div className="space-y-4">
      <header className="pt-2">
        <p className="text-sm text-muted">
          {DOW[fromKey(today).getDay()]}, {shortDate(today)}
        </p>
        <h1 className="text-2xl font-bold mt-0.5">{todaySession ? 'Done for today' : 'Today’s session'}</h1>
        <button onClick={() => go('plan')} className="mt-1 text-sm text-accent font-medium">
          Month {month.id + 1}: {month.title} →
        </button>
      </header>

      <div className="grid grid-cols-3 gap-2">
        <Stat label="day streak" value={streak.current} sub={streak.freezeUsedThisWeek ? 'freeze used this week' : 'freeze ready'} />
        <Stat label="this week" value={`${weekDays}/${settings.weeklyTargetDays}`} sub="days practiced" />
        <button onClick={() => go('songs')} className="text-left">
          <Stat label="songs I can play" value={canPlayCount} sub="library →" />
        </button>
      </div>

      <Nudges data={data} built={built} go={go} />

      {todaySession && !running ? (
        <DoneCard data={data} />
      ) : running ? (
        <Running run={running} capMinutes={settings.sessionCapMinutes} onFinish={finish} songs={songs} />
      ) : (
        <Preview today={today} built={built} songs={songs} mode={mode} setMode={setMode} anchor={settings.anchor} onFinish={finish} />
      )}
    </div>
  )
}

function Nudges({ data, built, go }: { data: AppData; built: BuiltSession; go: (t: Tab) => void }) {
  const { month, plateaued, recordedThisMonth, today, todaySession } = data
  const dayOfMonth = Number(today.slice(8))
  return (
    <>
      {built.painEaseUntil && (
        <Banner tone="warn">
          <b>Easy days.</b> Your hand was sore two days running, so technique time is halved through {shortDate(built.painEaseUntil)}.
        </Banner>
      )}
      {month?.dangerZone && !todaySession && (
        <Banner tone="info">
          <b>Tough month, shorter blocks.</b> {month.dangerNote}
        </Banner>
      )}
      {plateaued.length > 0 && (
        <Banner tone="info">
          <b>{plateaued[0].title}</b> has been in “learning” for 4+ weeks. Try rhythm-only, or swap it for something else?{' '}
          <button className="text-accent font-semibold" onClick={() => go('songs')}>
            Decide →
          </button>
        </Banner>
      )}
      {!recordedThisMonth && dayOfMonth >= 20 && (
        <Banner tone="good">
          <b>Monthly clip.</b> Record a minute of playing for {monthKey(today) === month?.monthKey ? 'this month' : 'the log'} so you can hear your progress.{' '}
          <button className="text-accent font-semibold" onClick={() => go('more')}>
            Record →
          </button>
        </Banner>
      )}
    </>
  )
}

const SECTIONS: SessionItem['section'][] = ['Warm-up', 'Skill of the month', 'Songs']

function ItemList({ items, run, onJump, songs }: { items: SessionItem[]; run?: ActiveSession; onJump?: (i: number) => void; songs: Song[] }) {
  const [expanded, setExpanded] = useState<string | null>(null)
  const songOf = (it: SessionItem) => (it.songId ? songs.find((s) => s.id === it.songId) : undefined)
  return (
    <div className="space-y-4">
      {SECTIONS.map((sec) => {
        const rows = items.map((it, i) => ({ it, i })).filter(({ it }) => it.section === sec)
        if (!rows.length) return null
        return (
          <div key={sec}>
            <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-muted mb-1.5">
              <span>{sec}</span>
              <span className="tabular">{rows.reduce((s, r) => s + r.it.minutes, 0)} min</span>
            </div>
            <ul className="space-y-1">
              {rows.map(({ it, i }) => {
                const done = run?.completed[it.id]
                const current = run?.current === i
                const song = songOf(it)
                const canExpand = !run && hasHowTo(it, song)
                const isOpen = expanded === it.id
                return (
                  <li key={it.id}>
                    <div
                      className={cx(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 border',
                        current ? 'border-accent bg-accent/10' : 'border-transparent bg-surface-2',
                      )}
                    >
                      {run ? (
                        <button
                          aria-label={done ? `Mark ${it.label} not done` : `Mark ${it.label} done`}
                          onClick={() => active.mark(it.id, done ? null : true)}
                          className={cx('h-6 w-6 shrink-0 rounded-full border-2 grid place-items-center text-xs font-bold', done ? 'bg-good border-good text-bg' : 'border-line')}
                        >
                          {done ? '✓' : ''}
                        </button>
                      ) : (
                        <span className="h-6 w-6 shrink-0 rounded-full border-2 border-line" aria-hidden />
                      )}
                      <button
                        className="flex-1 min-w-0 text-left"
                        onClick={() => (run ? onJump?.(i) : canExpand && setExpanded(isOpen ? null : it.id))}
                        disabled={run ? !onJump : !canExpand}
                        aria-expanded={canExpand ? isOpen : undefined}
                      >
                        <div className={cx('text-[15px] font-medium truncate', done && 'text-muted line-through')}>
                          {it.label}
                          {it.kind === 'skill-new' && <span className="ml-2 text-[10px] font-bold uppercase text-accent align-middle">new</span>}
                        </div>
                        {it.kind === 'daily-win' && <div className="text-xs text-good">Daily win</div>}
                        {it.kind === 'song-review' && <div className="text-xs text-muted">Review</div>}
                      </button>
                      <span className="text-sm text-muted tabular shrink-0">
                        {it.minutes}′{it.bpm ? ` · ${it.bpm}` : ''}
                        {canExpand && <span className="ml-1.5 text-accent">{isOpen ? '▴' : 'ⓘ'}</span>}
                      </span>
                    </div>
                    {isOpen && (
                      <div className="mt-1 rounded-xl bg-surface-2 p-3">
                        <HowToPanel item={it} song={song} />
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
        )
      })}
    </div>
  )
}

function Preview({
  today,
  built,
  songs,
  mode,
  setMode,
  anchor,
  onFinish,
}: {
  today: string
  built: BuiltSession
  songs: Song[]
  mode: SessionMode
  setMode: (m: SessionMode) => void
  anchor: string
  onFinish: () => void
}) {
  const [confirming, setConfirming] = useState(false)
  return (
    <Card>
      <div className="flex items-baseline justify-between mb-3">
        <h2 className="font-bold text-lg">{mode === 'badDay' ? '5-minute session' : `${built.totalMinutes} minutes`}</h2>
        {anchor && <span className="text-xs text-muted truncate ml-3">cue: {anchor}</span>}
      </div>
      {mode === 'badDay' && (
        <p className="text-sm text-muted mb-3">Rough day? Five minutes still counts for your streak. Showing up is the whole point.</p>
      )}
      <ItemList items={built.items} songs={songs} />
      <p className="text-xs text-muted mt-3">Tap any item marked ⓘ to see how to do it.</p>
      <div className="mt-5 space-y-2">
        <Button variant="primary" size="lg" onClick={() => active.start(today, mode, built.items)}>
          Start
        </Button>
        <div className="flex gap-2">
          <Button className="flex-1" onClick={() => setMode(mode === 'full' ? 'badDay' : 'full')}>
            {mode === 'full' ? '5-min version' : 'Full session'}
          </Button>
          {confirming ? (
            <Button className="flex-1" variant="primary" onClick={onFinish}>
              Yes, mark done ✓
            </Button>
          ) : (
            <Button className="flex-1" onClick={() => setConfirming(true)}>
              Already played
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}

function Running({ run, capMinutes, onFinish, songs }: { run: ActiveSession; capMinutes: number; onFinish: () => void; songs: Song[] }) {
  const [, setNow] = useState(0)
  const item = run.items[run.current]
  const finished = run.current >= run.items.length
  const planned = run.items.reduce((s, i) => s + i.minutes, 0)

  // Tick: auto-advance items, enforce the gentle cap.
  useEffect(() => {
    if (!run.runningSince) return
    const id = window.setInterval(() => {
      setNow(Date.now())
      const a = active.getActive()
      if (!a?.runningSince) return
      if (!a.capHit && elapsedTotal(a) >= capMinutes * 60_000) {
        chime()
        metronome.stop()
        active.pause({ capHit: true })
        return
      }
      const cur = a.items[a.current]
      if (cur && elapsedItem(a) >= cur.minutes * 60_000) {
        chime()
        if (!a.completed[cur.id]) active.mark(cur.id, true)
        if (a.current >= a.items.length - 1) {
          metronome.stop()
          active.pause()
        }
        active.goTo(a.current + 1)
      }
    }, 500)
    return () => clearInterval(id)
  }, [run.runningSince, capMinutes])

  // Keep the screen awake while the timer runs.
  useEffect(() => {
    if (!run.runningSince || !('wakeLock' in navigator)) return
    let lock: WakeLockSentinel | null = null
    navigator.wakeLock.request('screen').then((l) => (lock = l), () => {})
    return () => void lock?.release()
  }, [run.runningSince])

  const next = (value: true | 'solid' | 'shaky' = true) => {
    if (item) active.mark(item.id, value)
    if (run.current >= run.items.length - 1) {
      metronome.stop()
      active.pause()
    }
    active.goTo(run.current + 1)
  }

  const itemMs = item ? elapsedItem(run) : 0
  const remaining = item ? item.minutes * 60_000 - itemMs : 0
  const pct = item ? Math.min(100, (itemMs / (item.minutes * 60_000)) * 100) : 100

  return (
    <div className="space-y-3">
      {run.capHit && !run.runningSince && !finished && (
        <Card className="border-accent">
          <p className="font-bold text-lg">That’s enough for today.</p>
          <p className="text-sm text-muted mt-1">
            You hit {capMinutes} minutes. Short daily sessions beat marathons, and your hands recover better. Rest is part of practice.
          </p>
          <div className="flex gap-2 mt-3">
            <Button variant="primary" className="flex-1" onClick={onFinish}>
              Mark day done
            </Button>
            <Button className="flex-1" onClick={active.resume}>
              Finish this item
            </Button>
          </div>
        </Card>
      )}

      {finished ? (
        <Card className="border-good text-center">
          <p className="text-3xl">🎸</p>
          <p className="font-bold text-lg mt-1">Session complete</p>
          <p className="text-sm text-muted">Ended on a win. {fmtClock(elapsedTotal(run))} played.</p>
          <Button variant="primary" size="lg" className="mt-4" onClick={onFinish}>
            Mark today done ✓
          </Button>
        </Card>
      ) : (
        item && (
          <Card>
            <div className="flex justify-between text-xs text-muted">
              <span className="uppercase tracking-wider font-semibold">{item.section}</span>
              <span className="tabular">
                {fmtClock(elapsedTotal(run))} / {planned}:00
              </span>
            </div>
            <h2 className="text-xl font-bold mt-2">{item.label}</h2>
            {item.detail && <p className="text-sm text-muted mt-1">{item.detail}</p>}
            <HowToToggle key={item.id} item={item} song={item.songId ? songs.find((s) => s.id === item.songId) : undefined} />
            <div className="text-5xl font-bold tabular text-center my-5">{fmtClock(remaining)}</div>
            <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full bg-accent transition-[width] duration-500" style={{ width: `${pct}%` }} />
            </div>
            {item.review ? (
              <div className="mt-4">
                <p className="text-xs text-muted mb-2 text-center">How did it go? (sets when it comes back)</p>
                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => (run.runningSince ? active.pause() : active.resume())}>{run.runningSince ? 'Pause' : 'Resume'}</Button>
                  <Button variant="primary" onClick={() => next('solid')}>
                    Solid
                  </Button>
                  <Button onClick={() => next('shaky')}>Shaky</Button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 mt-4">
                <Button onClick={() => (run.runningSince ? active.pause() : active.resume())}>{run.runningSince ? 'Pause' : 'Resume'}</Button>
                <Button variant="primary" onClick={() => next()}>
                  {run.current >= run.items.length - 1 ? 'Finish' : 'Done → next'}
                </Button>
              </div>
            )}
          </Card>
        )
      )}

      {!finished && <MetronomePanel suggestedBpm={item?.bpm} />}

      <Card>
        <ItemList items={run.items} run={run} onJump={(i) => active.goTo(i)} songs={songs} />
        <div className="flex gap-2 mt-4">
          <Button variant="ghost" size="sm" onClick={() => (metronome.stop(), active.clear())}>
            Cancel session
          </Button>
          {!finished && (
            <Button size="sm" className="ml-auto" onClick={onFinish}>
              Mark day done now
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}

const PAIN: { v: PainRating; label: string; tone: string }[] = [
  { v: 'fine', label: 'Fine', tone: 'border-good/50' },
  { v: 'tight', label: 'Tight', tone: 'border-warn/50' },
  { v: 'sore', label: 'Sore', tone: 'border-bad/50' },
]

function DoneCard({ data }: { data: AppData }) {
  const s = data.todaySession!
  const [skipped, setSkipped] = useState(false)
  return (
    <Card className="border-good">
      <div className="flex items-center gap-3">
        <span className="h-12 w-12 rounded-full bg-good text-bg grid place-items-center text-2xl font-bold">✓</span>
        <div>
          <p className="font-bold text-lg">{s.mode === 'badDay' ? 'Showed up. That counts.' : 'Nice work.'}</p>
          <p className="text-sm text-muted">
            {s.minutes} min logged · streak {data.streak.current} day{data.streak.current === 1 ? '' : 's'}
          </p>
        </div>
      </div>
      {!s.pain && !skipped ? (
        <div className="mt-4">
          <p className="text-sm font-medium mb-2">How did your hand / forearm feel?</p>
          <div className="grid grid-cols-4 gap-2">
            {PAIN.map((p) => (
              <button key={p.v} onClick={() => repo.setSessionPain(s.date, p.v)} className={cx('rounded-xl border-2 bg-surface-2 py-2.5 text-sm font-semibold', p.tone)}>
                {p.label}
              </button>
            ))}
            <button onClick={() => setSkipped(true)} className="rounded-xl bg-surface-2 border border-line py-2.5 text-sm text-muted">
              Skip
            </button>
          </div>
        </div>
      ) : (
        s.pain && (
          <p className="text-sm text-muted mt-3">
            Hand/forearm: <b className="text-ink">{s.pain}</b>
            {s.pain === 'sore' && ' — if it’s sore again tomorrow, technique time is halved for 3 days.'}{' '}
            <button className="text-accent" onClick={() => repo.setSessionPain(s.date, undefined)}>
              change
            </button>
          </p>
        )
      )}
      <p className="text-sm text-muted mt-4 border-t border-line pt-3">That’s enough for today. See you tomorrow{data.settings?.anchor ? `, ${data.settings.anchor}` : ''}.</p>
    </Card>
  )
}

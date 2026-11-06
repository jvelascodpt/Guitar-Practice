import { useState } from 'react'
import { Button, Chip, field } from '../components/ui'
import * as repo from '../data/repo'
import { notificationsSupported, requestPermission } from '../reminders'

const ANCHORS = ['after coffee', 'after work', 'before dinner', 'after dinner', 'after the gym']

/** Habit anchoring: pick a trigger and a reminder time, then go. */
export function Onboarding() {
  const [anchor, setAnchor] = useState('after coffee')
  const [time, setTime] = useState('19:00')
  const [target, setTarget] = useState(5)
  const [remind, setRemind] = useState(notificationsSupported())

  async function finish() {
    let enabled = false
    if (remind) enabled = (await requestPermission()) === 'granted'
    await repo.updateSettings({ anchor: anchor.trim(), reminderTime: time, weeklyTargetDays: target, remindersEnabled: enabled, onboarded: true })
  }

  return (
    <div className="min-h-dvh max-w-lg mx-auto px-5 py-10 safe-top">
      <p className="text-accent font-semibold text-sm">Guitar Year</p>
      <h1 className="text-3xl font-bold mt-1 leading-tight">25 minutes a day. One year. Let’s make it automatic.</h1>
      <p className="text-muted mt-3">
        Every day you open the app, a session is already built for you. You press start. That’s the only decision.
      </p>

      <h2 className="font-semibold mt-8">When will you play?</h2>
      <p className="text-sm text-muted">Tie it to something you already do every day.</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {ANCHORS.map((a) => (
          <Chip key={a} active={anchor === a} onClick={() => setAnchor(a)}>
            {a}
          </Chip>
        ))}
      </div>
      <input className={`${field} mt-3`} value={anchor} onChange={(e) => setAnchor(e.target.value)} placeholder="e.g. after my morning coffee" aria-label="Habit cue" />

      <h2 className="font-semibold mt-8">Reminder time</h2>
      <div className="flex items-center gap-3 mt-2">
        <input type="time" className={`${field} w-36`} value={time} onChange={(e) => setTime(e.target.value)} aria-label="Reminder time" />
        {notificationsSupported() && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={remind} onChange={(e) => setRemind(e.target.checked)} className="h-5 w-5 accent-[var(--accent)]" />
            Send a notification
          </label>
        )}
      </div>

      <h2 className="font-semibold mt-8">Weekly target</h2>
      <p className="text-sm text-muted">Counted in days, not minutes.</p>
      <div className="flex gap-2 mt-3">
        {[5, 6].map((n) => (
          <Chip key={n} active={target === n} onClick={() => setTarget(n)}>
            {n} days / week
          </Chip>
        ))}
      </div>

      <Button variant="primary" size="lg" className="mt-10" onClick={finish} disabled={!anchor.trim()}>
        Start my year
      </Button>
      <p className="text-xs text-muted mt-3 text-center">You can change all of this later under More.</p>
    </div>
  )
}

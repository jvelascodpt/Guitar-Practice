import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { AppData } from '../state/derived'
import type { Recording, Settings, Theme } from '../data/types'
import * as repo from '../data/repo'
import { downloadJson, exportAll, importAll } from '../data/backup'
import { Banner, Button, Card, Chip, SectionTitle, field } from '../components/ui'
import { addMonths, monthKey, monthLabel, shortDate } from '../lib/dates'
import { PLAN_START } from '../logic/plan'
import { INTRO_CREDIT } from '../components/IntroClip'
import { notificationsSupported, reminderText, requestPermission, showReminder } from '../reminders'

export function More({ data }: { data: AppData }) {
  return (
    <div className="pt-2">
      <h1 className="text-2xl font-bold">More</h1>
      <Recordings data={data} />
      {data.settings && <SettingsPanel settings={data.settings} />}
      <Backup />
    </div>
  )
}

// ---------------- Recordings ----------------

function AudioPlayer({ blob }: { blob: Blob }) {
  const url = useMemo(() => URL.createObjectURL(blob), [blob])
  useEffect(() => () => URL.revokeObjectURL(url), [url])
  return <audio controls src={url} className="w-full mt-2 h-10" preload="metadata" />
}

function Recordings({ data }: { data: AppData }) {
  const { recordings, today } = data
  const thisMonth = monthKey(today)
  const lastMonth = addMonths(thisMonth, -1)
  const byMonth = useMemo(() => {
    const m = new Map<string, Recording[]>()
    for (const r of recordings) m.set(r.monthKey, [...(m.get(r.monthKey) ?? []), r])
    return m
  }, [recordings])
  const [adding, setAdding] = useState(false)
  const first = recordings[0]
  const current = byMonth.get(thisMonth)?.at(-1)
  const previous = byMonth.get(lastMonth)?.at(-1)

  return (
    <>
      <SectionTitle>Monthly recordings</SectionTitle>
      <Card>
        <p className="text-sm text-muted">One clip a month. Same song or improv each time makes progress easy to hear.</p>
        {!current && !adding && (
          <Button variant="primary" className="mt-3 w-full" onClick={() => setAdding(true)}>
            Add {monthLabel(thisMonth)} clip
          </Button>
        )}
        {adding && <RecordingForm monthKey={thisMonth} date={today} onDone={() => setAdding(false)} />}

        {(current || previous) && (
          <div className="mt-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted mb-2">Compare to last month</div>
            <div className="grid gap-3">
              {[previous, current].map((r, i) => (
                <div key={i} className="rounded-xl bg-surface-2 p-3">
                  <div className="text-sm font-semibold">{monthLabel(i === 0 ? lastMonth : thisMonth)}</div>
                  {r ? (
                    <>
                      {r.note && <p className="text-sm text-muted mt-0.5">{r.note}</p>}
                      {r.audio ? <AudioPlayer blob={r.audio} /> : <p className="text-xs text-muted mt-1">No audio attached.</p>}
                    </>
                  ) : (
                    <p className="text-xs text-muted mt-1">No clip.</p>
                  )}
                </div>
              ))}
            </div>
            {first && first.monthKey !== thisMonth && first.monthKey !== lastMonth && (
              <p className="text-xs text-muted mt-2">Your first clip ({monthLabel(first.monthKey)}) is in the log below. Worth a listen.</p>
            )}
          </div>
        )}
      </Card>

      {recordings.length > 0 && (
        <ul className="space-y-2 mt-2">
          {[...recordings].reverse().map((r) => (
            <li key={r.id}>
              <RecordingRow r={r} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}

function RecordingRow({ r }: { r: Recording }) {
  const [editing, setEditing] = useState(false)
  if (editing) return <Card><RecordingForm existing={r} monthKey={r.monthKey} date={r.date} onDone={() => setEditing(false)} /></Card>
  return (
    <Card className="p-3.5">
      <div className="flex items-baseline justify-between">
        <span className="font-semibold">{monthLabel(r.monthKey)}</span>
        <button className="text-xs text-accent" onClick={() => setEditing(true)}>
          Edit
        </button>
      </div>
      <div className="text-xs text-muted">
        {shortDate(r.date)}
        {r.audioName ? ` · ${r.audioName}` : ''}
      </div>
      {r.note && <p className="text-sm mt-1">{r.note}</p>}
      {r.audio && <AudioPlayer blob={r.audio} />}
    </Card>
  )
}

function RecordingForm({ existing, monthKey: mk, date, onDone }: { existing?: Recording; monthKey: string; date: string; onDone: () => void }) {
  const [note, setNote] = useState(existing?.note ?? '')
  const [file, setFile] = useState<File | null>(null)
  const [month, setMonth] = useState(mk)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const months = Array.from({ length: 12 }, (_, i) => addMonths(PLAN_START, i))

  async function save() {
    const audio = file ? { audio: file as Blob, audioName: file.name, audioType: file.type } : {}
    if (existing) await repo.updateRecording(existing.id, { note, monthKey: month, ...audio })
    else await repo.addRecording({ monthKey: month, date, note, ...audio })
    onDone()
  }

  return (
    <div className="mt-3 space-y-2">
      <select className={field} value={month} onChange={(e) => setMonth(e.target.value)} aria-label="Month">
        {(months.includes(mk) ? months : [mk, ...months]).map((m) => (
          <option key={m} value={m}>
            {monthLabel(m)}
          </option>
        ))}
      </select>
      <textarea className={field} rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder="What did you play? How did it feel?" />
      <label className="block text-sm">
        <span className="text-muted">Audio file (optional{existing?.audio ? ', replaces current' : ''})</span>
        <input type="file" accept="audio/*" className="block w-full mt-1 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-surface-2 file:px-3 file:py-2 file:text-ink" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
      </label>
      <div className="flex gap-2 pt-1">
        {existing &&
          (confirmDelete ? (
            <Button variant="danger" onClick={() => repo.deleteRecording(existing.id).then(onDone)}>
              Really delete
            </Button>
          ) : (
            <Button variant="ghost" onClick={() => setConfirmDelete(true)}>
              Delete
            </Button>
          ))}
        <Button variant="ghost" className="ml-auto" onClick={onDone}>
          Cancel
        </Button>
        <Button variant="primary" onClick={save}>
          Save
        </Button>
      </div>
    </div>
  )
}

// ---------------- Settings & reminder ----------------

function SettingsPanel({ settings }: { settings: Settings }) {
  const [anchor, setAnchor] = useState(settings.anchor)
  const [msg, setMsg] = useState('')
  const supported = notificationsSupported()
  const permission = supported ? Notification.permission : 'unsupported'

  async function toggleReminders(on: boolean) {
    if (on) {
      const p = await requestPermission()
      if (p !== 'granted') {
        setMsg(p === 'unsupported' ? 'This browser doesn’t support notifications.' : 'Notifications are blocked. Allow them in your browser/site settings.')
        return
      }
    }
    setMsg('')
    await repo.updateSettings({ remindersEnabled: on })
  }

  const preview = reminderText(settings.anchor)
  return (
    <>
      <SectionTitle>Habit & reminder</SectionTitle>
      <Card className="space-y-4">
        <div>
          <label className="text-sm font-medium" htmlFor="anchor">
            Your cue
          </label>
          <input
            id="anchor"
            className={`${field} mt-1`}
            value={anchor}
            onChange={(e) => setAnchor(e.target.value)}
            onBlur={() => anchor.trim() && anchor !== settings.anchor && repo.updateSettings({ anchor: anchor.trim() })}
          />
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium" htmlFor="rt">
            Reminder time
          </label>
          <input id="rt" type="time" className={`${field} w-32 ml-auto`} value={settings.reminderTime} onChange={(e) => repo.updateSettings({ reminderTime: e.target.value, lastReminderDate: undefined })} />
        </div>
        <label className="flex items-center gap-3 text-sm font-medium">
          Daily notification
          <input type="checkbox" className="ml-auto h-6 w-6 accent-[var(--accent)]" checked={settings.remindersEnabled && permission === 'granted'} onChange={(e) => toggleReminders(e.target.checked)} disabled={!supported} />
        </label>
        {msg && <Banner tone="warn">{msg}</Banner>}
        <div className="rounded-xl bg-surface-2 p-3 text-sm">
          <div className="font-semibold">{preview.title}</div>
          <div className="text-muted">{preview.body}</div>
        </div>
        <p className="text-xs text-muted">
          {supported
            ? 'Browsers only fire this while the app is open or recently used. If you open the app after your reminder time on a day you haven’t played, it reminds you then. On iPhone, add the app to your Home Screen first.'
            : 'Notifications aren’t supported in this browser.'}
        </p>
        {settings.remindersEnabled && permission === 'granted' && (
          <Button size="sm" onClick={() => showReminder(settings)}>
            Send a test notification
          </Button>
        )}
      </Card>

      <SectionTitle>Practice settings</SectionTitle>
      <Card className="space-y-4">
        <Row label="Weekly target (days)">
          {[4, 5, 6, 7].map((n) => (
            <Chip key={n} active={settings.weeklyTargetDays === n} onClick={() => repo.updateSettings({ weeklyTargetDays: n })}>
              {n}
            </Chip>
          ))}
        </Row>
        <Row label="Session cap (min)">
          {[20, 25, 30, 40].map((n) => (
            <Chip key={n} active={settings.sessionCapMinutes === n} onClick={() => repo.updateSettings({ sessionCapMinutes: n })}>
              {n}
            </Chip>
          ))}
        </Row>
        <Row label="Intro clip on launch">
          {[true, false].map((on) => (
            <Chip key={String(on)} active={(settings.introClip !== false) === on} onClick={() => repo.updateSettings({ introClip: on })}>
              {on ? 'On' : 'Off'}
            </Chip>
          ))}
        </Row>
        <Row label="Theme">
          {(['dark', 'light', 'system'] as Theme[]).map((t) => (
            <Chip key={t} active={settings.theme === t} onClick={() => repo.updateSettings({ theme: t })}>
              {t}
            </Chip>
          ))}
        </Row>
      </Card>
    </>
  )
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-sm font-medium mb-2">{label}</div>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  )
}

// ---------------- Backup ----------------

function Backup() {
  const [msg, setMsg] = useState<{ tone: 'good' | 'warn'; text: string } | null>(null)
  const [pending, setPending] = useState<unknown>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function doExport(withAudio: boolean) {
    const data = await exportAll(withAudio)
    downloadJson(data, `guitar-year-backup-${new Date().toISOString().slice(0, 10)}.json`)
    setMsg({ tone: 'good', text: 'Backup downloaded.' })
  }

  async function pick(file: File) {
    try {
      setPending(JSON.parse(await file.text()))
      setMsg(null)
    } catch {
      setMsg({ tone: 'warn', text: 'Couldn’t read that file as JSON.' })
    }
  }

  async function confirmImport() {
    try {
      await importAll(pending)
      setMsg({ tone: 'good', text: 'Backup restored.' })
    } catch (e) {
      setMsg({ tone: 'warn', text: (e as Error).message })
    }
    setPending(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  return (
    <>
      <SectionTitle>Backup</SectionTitle>
      <Card className="space-y-3">
        <p className="text-sm text-muted">Everything lives on this device. Export a JSON backup now and then, and before switching phones.</p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="primary" onClick={() => doExport(true)}>
            Export all
          </Button>
          <Button onClick={() => doExport(false)}>Export without audio</Button>
        </div>
        <input ref={fileRef} type="file" accept="application/json,.json" className="hidden" onChange={(e) => e.target.files?.[0] && pick(e.target.files[0])} />
        <Button className="w-full" onClick={() => fileRef.current?.click()}>
          Import from file…
        </Button>
        {pending !== null && (
          <Banner tone="warn">
            Importing <b>replaces all data</b> on this device with the backup.
            <div className="flex gap-2 mt-2">
              <Button size="sm" variant="danger" onClick={confirmImport}>
                Replace my data
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                Cancel
              </Button>
            </div>
          </Banner>
        )}
        {msg && <Banner tone={msg.tone}>{msg.text}</Banner>}
      </Card>
      <p className="text-center text-xs text-muted mt-8">Guitar Year · local-first, works offline</p>
      <p className="text-center text-[11px] text-muted mt-1 px-4">
        Intro clip:{' '}
        <a className="underline" href={INTRO_CREDIT.source} target="_blank" rel="noreferrer">
          “{INTRO_CREDIT.title}”
        </a>{' '}
        by {INTRO_CREDIT.author},{' '}
        <a className="underline" href={INTRO_CREDIT.licenseUrl} target="_blank" rel="noreferrer">
          {INTRO_CREDIT.license}
        </a>
        , via Wikimedia Commons. Trimmed to 3 s, cropped, audio removed.
      </p>
    </>
  )
}

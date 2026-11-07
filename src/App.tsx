import { useCallback, useEffect, useState } from 'react'
import { useAppData } from './state/derived'
import { Today } from './screens/Today'
import { Onboarding } from './screens/Onboarding'
import { Stats } from './screens/Stats'
import { Plan } from './screens/Plan'
import { Songs } from './screens/Songs'
import { More } from './screens/More'
import { armReminder } from './reminders'
import { cx } from './components/ui'
import { StageBackdrop } from './components/StageBackdrop'
import { fret } from './lib/fret'
import { FretboardIntro, introEvents } from './components/FretboardIntro'
import { getActive } from './state/activeSession'
import { consumeUpdateReload } from './state/updateReload'

/** Coming back after this long counts as "opening the app" (iOS resumes home-screen apps instead of relaunching). */
const REOPEN_AFTER_MS = 5 * 60_000


export type Tab = 'today' | 'stats' | 'plan' | 'songs' | 'more'
const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'today', label: 'Today', icon: 'M5 12l4 4 10-10' },
  { id: 'stats', label: 'Streaks', icon: 'M4 20V10M10 20V4M16 20v-7M22 20H2' },
  { id: 'plan', label: 'Plan', icon: 'M4 5h16v15H4zM4 10h16M9 3v4M15 3v4' },
  { id: 'songs', label: 'Songs', icon: 'M9 18V5l11-2v13M9 18a3 3 0 11-6 0 3 3 0 016 0zm11-2a3 3 0 11-6 0 3 3 0 016 0z' },
  { id: 'more', label: 'More', icon: 'M5 12h.01M12 12h.01M19 12h.01' },
]

const readHash = (): Tab => {
  const h = location.hash.slice(1) as Tab
  return TABS.some((t) => t.id === h) ? h : 'today'
}

export default function App() {
  const data = useAppData()
  const [tab, setTab] = useState<Tab>(readHash)
  // Intro animation: shows on launch, and again when you come back after a while
  // (never while a practice timer is running). `intro` doubles as a remount key.
  const [intro, setIntro] = useState(() => ({ show: !consumeUpdateReload(), run: 1 }))
  const endIntro = useCallback(() => setIntro((i) => ({ ...i, show: false })), [])
  useEffect(() => {
    let hiddenAt = 0
    const onVis = () => {
      if (document.visibilityState === 'hidden') hiddenAt = Date.now()
      else if (hiddenAt && Date.now() - hiddenAt >= REOPEN_AFTER_MS && !getActive()?.runningSince) setIntro((i) => ({ show: true, run: i.run + 1 }))
    }
    const replay = () => setIntro((i) => ({ show: true, run: i.run + 1 }))
    document.addEventListener('visibilitychange', onVis)
    introEvents.addEventListener('replay', replay)
    return () => {
      document.removeEventListener('visibilitychange', onVis)
      introEvents.removeEventListener('replay', replay)
    }
  }, [])
  const { settings, todaySession } = data

  useEffect(() => {
    const onHash = () => setTab(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (!settings) return
    document.documentElement.dataset.theme = settings.theme
    // Match the phone's status bar to the theme background.
    const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', bg)
  }, [settings])

  useEffect(() => (settings ? armReminder(settings, !!todaySession) : undefined), [settings, todaySession, data.today])

  const go = (t: Tab) => {
    location.hash = t
    window.scrollTo(0, 0)
  }

  if (!data.ready) return <div className="min-h-dvh" />
  if (!settings!.onboarded)
    return (
      <>
        {settings!.theme === 'stage' && <StageBackdrop />}
        <Onboarding />
      </>
    )

  return (
    <div className="min-h-dvh max-w-lg mx-auto">
      {settings!.theme === 'stage' && <StageBackdrop />}
      {intro.show && settings!.introClip !== false && <FretboardIntro key={intro.run} onDone={endIntro} />}
      <main className="px-4 pb-28 safe-top">
        {tab === 'today' && <Today data={data} go={go} />}
        {tab === 'stats' && <Stats data={data} />}
        {tab === 'plan' && <Plan data={data} />}
        {tab === 'songs' && <Songs data={data} />}
        {tab === 'more' && <More data={data} />}
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-bg/95 backdrop-blur border-t border-line safe-bottom">
        <div className="max-w-lg mx-auto grid grid-cols-5">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              style={{ ['--tab' as string]: fret(i) }}
              className={cx('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium', tab === t.id ? 'text-accent tab-active' : 'text-muted')}
            >
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}

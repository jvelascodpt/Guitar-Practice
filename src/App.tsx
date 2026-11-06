import { useEffect, useState } from 'react'
import { useAppData } from './state/derived'
import { Today } from './screens/Today'
import { Onboarding } from './screens/Onboarding'
import { Stats } from './screens/Stats'
import { Plan } from './screens/Plan'
import { armReminder } from './reminders'
import { cx } from './components/ui'

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
  const { settings, todaySession } = data

  useEffect(() => {
    const onHash = () => setTab(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    if (settings) document.documentElement.dataset.theme = settings.theme
  }, [settings])

  useEffect(() => (settings ? armReminder(settings, !!todaySession) : undefined), [settings, todaySession, data.today])

  const go = (t: Tab) => {
    location.hash = t
    window.scrollTo(0, 0)
  }

  if (!data.ready) return <div className="min-h-dvh" />
  if (!settings!.onboarded) return <Onboarding />

  return (
    <div className="min-h-dvh max-w-lg mx-auto">
      <main className="px-4 pb-28 safe-top">
        {tab === 'today' && <Today data={data} go={go} />}
        {tab === 'stats' && <Stats data={data} />}
        {tab === 'plan' && <Plan data={data} />}
        {(tab === 'songs' || tab === 'more') && <p className="pt-6 text-muted">Coming next.</p>}
      </main>
      <nav className="fixed bottom-0 inset-x-0 z-40 bg-bg/95 backdrop-blur border-t border-line safe-bottom">
        <div className="max-w-lg mx-auto grid grid-cols-5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => go(t.id)}
              aria-current={tab === t.id ? 'page' : undefined}
              className={cx('flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium', tab === t.id ? 'text-accent' : 'text-muted')}
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

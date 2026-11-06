import type { Settings } from './data/types'
import { todayKey } from './lib/dates'
import { updateSettings } from './data/repo'

/**
 * Daily reminder via the Web Notifications API. Browsers can't wake a PWA at an
 * exact time without a push server, so this fires while the app is open (or
 * backgrounded but alive), and catches up when you open the app after the
 * reminder time on a day you haven't practiced. One reminder per day max.
 */
export const notificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window

export async function requestPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!notificationsSupported()) return 'unsupported'
  return Notification.permission === 'default' ? Notification.requestPermission() : Notification.permission
}

export function reminderText(anchor: string) {
  const cue = anchor.trim()
  return {
    title: cue ? `${cue[0].toUpperCase()}${cue.slice(1)}: guitar time 🎸` : 'Guitar time 🎸',
    body: 'Today’s session is ready. Just press start. A rough day? 5 minutes still counts.',
  }
}

export async function showReminder(settings: Settings) {
  if (!notificationsSupported() || Notification.permission !== 'granted') return
  const { title, body } = reminderText(settings.anchor)
  const icon = `${import.meta.env.BASE_URL}pwa-192.png`
  const opts: NotificationOptions = { body, icon, badge: icon, tag: 'daily-reminder' }
  const reg = await navigator.serviceWorker?.getRegistration()
  if (reg) await reg.showNotification(title, opts)
  else new Notification(title, opts)
  await updateSettings({ lastReminderDate: todayKey() })
}

function reminderAt(time: string, base = new Date()): Date {
  const [h, m] = time.split(':').map(Number)
  const d = new Date(base)
  d.setHours(h, m, 0, 0)
  return d
}

/** (Re)arms today's reminder. Returns a cleanup function. */
export function armReminder(settings: Settings, practicedToday: boolean): () => void {
  if (!settings.remindersEnabled || practicedToday || settings.lastReminderDate === todayKey()) return () => {}
  const due = reminderAt(settings.reminderTime).getTime() - Date.now()
  if (due <= 0) {
    void showReminder(settings)
    return () => {}
  }
  const id = window.setTimeout(() => void showReminder(settings), Math.min(due, 2 ** 31 - 1))
  return () => clearTimeout(id)
}

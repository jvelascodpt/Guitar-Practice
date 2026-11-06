import { useEffect, useState } from 'react'
import { todayKey } from '../lib/dates'

/** Today's DateKey; rolls over at midnight and when the app comes back to the foreground. */
export function useToday() {
  const [today, setToday] = useState(todayKey())
  useEffect(() => {
    const check = () => setToday(todayKey())
    const id = window.setInterval(check, 60_000)
    document.addEventListener('visibilitychange', check)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', check)
    }
  }, [])
  return today
}

/** Local-calendar date helpers. A DateKey is "YYYY-MM-DD" in the user's local time zone. */
export type DateKey = string
export type MonthKey = string // "YYYY-MM"

const pad = (n: number) => String(n).padStart(2, '0')

export function toKey(d: Date): DateKey {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromKey(k: DateKey): Date {
  const [y, m, d] = k.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function todayKey(now: Date = new Date()): DateKey {
  return toKey(now)
}

function utc(k: DateKey): number {
  const [y, m, d] = k.split('-').map(Number)
  return Date.UTC(y, m - 1, d)
}

export function addDays(k: DateKey, n: number): DateKey {
  const d = new Date(utc(k) + n * 86_400_000)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`
}

/** Whole days from a to b (b - a). */
export function diffDays(a: DateKey, b: DateKey): number {
  return Math.round((utc(b) - utc(a)) / 86_400_000)
}

/** Monday of the week containing k. */
export function weekStart(k: DateKey): DateKey {
  const dow = new Date(utc(k)).getUTCDay() // 0 = Sunday
  return addDays(k, -((dow + 6) % 7))
}

export function monthKey(k: DateKey): MonthKey {
  return k.slice(0, 7)
}

export function addMonths(m: MonthKey, n: number): MonthKey {
  const [y, mo] = m.split('-').map(Number)
  const total = y * 12 + (mo - 1) + n
  return `${Math.floor(total / 12)}-${pad((total % 12) + 1)}`
}

export function daysInMonth(m: MonthKey): number {
  const [y, mo] = m.split('-').map(Number)
  return new Date(y, mo, 0).getDate()
}

export function eachDay(from: DateKey, to: DateKey): DateKey[] {
  const out: DateKey[] = []
  for (let k = from; k <= to; k = addDays(k, 1)) out.push(k)
  return out
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function monthLabel(m: MonthKey, withYear = true): string {
  const [y, mo] = m.split('-').map(Number)
  return withYear ? `${MONTHS[mo - 1]} ${y}` : MONTHS[mo - 1]
}

export function shortDate(k: DateKey): string {
  const [, mo, d] = k.split('-').map(Number)
  return `${MONTHS[mo - 1]} ${d}`
}

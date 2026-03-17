import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isYesterday, isTomorrow, isPast, parseISO, startOfWeek, addDays } from 'date-fns'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function fmtDateLabel(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d)) return 'Today'
  if (isYesterday(d)) return 'Yesterday'
  if (isTomorrow(d)) return 'Tomorrow'
  return format(d, 'EEEE, MMMM d, yyyy')
}

export function fmtDateFull(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE, MMMM d, yyyy')
}

export function fmtDateShort(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy')
}

export function fmtTime(hours: number, minutes: number): string {
  const h = Math.floor(hours) || 0
  const m = Math.floor(minutes) || 0
  if (h === 0 && m === 0) return '—'
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  return parts.join(' ')
}

export function totalMinutes(tasks: Array<{ hours: number; minutes: number }>): number {
  return tasks.reduce((sum, t) => sum + (t.hours || 0) * 60 + (t.minutes || 0), 0)
}

export function minsToHM(mins: number): string {
  if (mins === 0) return '0m'
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const parts: string[] = []
  if (h > 0) parts.push(`${h}h`)
  if (m > 0) parts.push(`${m}m`)
  return parts.join(' ')
}

export function isOverdue(due: string): boolean {
  if (!due) return false
  const d = parseISO(due)
  return isPast(d) && !isToday(d)
}

export function shiftDate(dateStr: string, delta: number): string {
  const d = parseISO(dateStr)
  d.setDate(d.getDate() + delta)
  return format(d, 'yyyy-MM-dd')
}

/** Returns the 7 days (Mon–Sun) of the week containing dateStr */
export function getWeekDays(dateStr: string): string[] {
  const d = parseISO(dateStr)
  const monday = startOfWeek(d, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) =>
    format(addDays(monday, i), 'yyyy-MM-dd'),
  )
}

export function fmtWeekRange(dateStr: string): string {
  const days = getWeekDays(dateStr)
  const start = parseISO(days[0])
  const end = parseISO(days[6])
  if (format(start, 'MMM') === format(end, 'MMM')) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`
  }
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
}

export function fmtDayShort(dateStr: string): string {
  return format(parseISO(dateStr), 'EEE, MMM d')
}

export function fmtDayName(dateStr: string): string {
  return format(parseISO(dateStr), 'EEEE')
}

/** Truncates a URL for display: shows hostname + up to 28 chars of path */
export function truncateUrl(url: string): string {
  try {
    const u = new URL(url)
    const host = u.hostname.replace(/^www\./, '')
    const path = u.pathname === '/' ? '' : u.pathname
    const full = host + path
    return full.length > 38 ? full.slice(0, 36) + '…' : full
  } catch {
    return url.length > 38 ? url.slice(0, 36) + '…' : url
  }
}

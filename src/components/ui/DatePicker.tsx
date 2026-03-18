import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar, CalendarPlus } from 'lucide-react'
import {
  format, parseISO, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, addDays, isSameMonth,
  isSameDay, addMonths, subMonths,
} from 'date-fns'

interface DatePickerProps {
  value: string           // YYYY-MM-DD
  onChange: (date: string) => void
  label?: string          // text shown on the trigger button
}

interface MoveDatePickerProps {
  currentDate?: string    // YYYY-MM-DD — pre-selects this date in the calendar
  onMove: (date: string) => void
}

interface CalendarGridProps {
  viewMonth: Date
  setViewMonth: React.Dispatch<React.SetStateAction<Date>>
  selectedDate: Date | null
  onSelect: (day: Date) => void
  focusedDay: Date | null
  setFocusedDay: React.Dispatch<React.SetStateAction<Date | null>>
  label?: string
}

/** Builds the Mon–Sun calendar grid covering the given month */
function buildCalendarDays(viewMonth: Date): Date[] {
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
  const days: Date[] = []
  let cur = gridStart
  while (cur <= gridEnd) {
    days.push(cur)
    cur = addDays(cur, 1)
  }
  return days
}

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

/**
 * Shared calendar grid used by both DatePicker and MoveDatePicker.
 * Supports full keyboard navigation: arrow keys, Page Up/Down, Home/End, Enter/Space.
 */
function CalendarGrid({ viewMonth, setViewMonth, selectedDate, onSelect, focusedDay, setFocusedDay, label }: CalendarGridProps) {
  const days = buildCalendarDays(viewMonth)
  const today = new Date()
  const dayRefs = useRef<Map<string, HTMLButtonElement>>(new Map())

  // Focus the button matching focusedDay whenever it changes or the month changes
  useEffect(() => {
    if (!focusedDay) return
    const key = format(focusedDay, 'yyyy-MM-dd')
    const raf = requestAnimationFrame(() => {
      dayRefs.current.get(key)?.focus()
    })
    return () => cancelAnimationFrame(raf)
  }, [focusedDay, viewMonth])

  function handleDayKeyDown(e: React.KeyboardEvent, day: Date) {
    let next: Date | null = null
    switch (e.key) {
      case 'ArrowRight': next = addDays(day, 1); break
      case 'ArrowLeft':  next = addDays(day, -1); break
      case 'ArrowDown':  next = addDays(day, 7); break
      case 'ArrowUp':    next = addDays(day, -7); break
      case 'PageDown':   next = addMonths(day, 1); break
      case 'PageUp':     next = subMonths(day, 1); break
      case 'Home':       next = startOfWeek(day, { weekStartsOn: 1 }); break
      case 'End':        next = endOfWeek(day, { weekStartsOn: 1 }); break
      case 'Enter':
      case ' ':
        e.preventDefault()
        onSelect(day)
        return
    }
    if (next) {
      e.preventDefault()
      if (!isSameMonth(next, viewMonth)) setViewMonth(next)
      setFocusedDay(next)
    }
  }

  return (
    <>
      {label && (
        <div style={{
          fontSize: 10.5, fontWeight: 700, color: 'var(--c-text4)',
          textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12,
        }}>
          {label}
        </div>
      )}

      {/* Month header */}
      <div className="datepicker-header">
        <button
          className="datepicker-nav"
          onClick={() => setViewMonth(m => subMonths(m, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft size={14} />
        </button>
        <span className="datepicker-month-label" aria-live="polite" aria-atomic="true">
          {format(viewMonth, 'MMMM yyyy')}
        </span>
        <button
          className="datepicker-nav"
          onClick={() => setViewMonth(m => addMonths(m, 1))}
          aria-label="Next month"
        >
          <ChevronRight size={14} />
        </button>
      </div>

      {/* Weekday labels — decorative, screen readers use aria-label on each day button */}
      <div className="datepicker-weekdays" aria-hidden="true">
        {WEEKDAYS.map((d) => (
          <div key={d} className="datepicker-weekday">{d}</div>
        ))}
      </div>

      {/* Day grid */}
      <div
        className="datepicker-days"
        role="grid"
        aria-label={format(viewMonth, 'MMMM yyyy')}
      >
        {days.map((day) => {
          const isCurrentMonth = isSameMonth(day, viewMonth)
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
          const isToday = isSameDay(day, today)
          const key = format(day, 'yyyy-MM-dd')
          const isFocused = focusedDay ? isSameDay(day, focusedDay) : false

          return (
            <button
              key={day.toISOString()}
              ref={el => { if (el) dayRefs.current.set(key, el); else dayRefs.current.delete(key) }}
              role="gridcell"
              className={[
                'datepicker-day',
                !isCurrentMonth ? 'other-month' : '',
                isSelected ? 'selected' : '',
                isToday && !isSelected ? 'today' : '',
              ].filter(Boolean).join(' ')}
              onClick={() => onSelect(day)}
              onKeyDown={e => handleDayKeyDown(e, day)}
              tabIndex={isFocused ? 0 : -1}
              aria-label={format(day, 'MMMM d, yyyy')}
              aria-selected={isSelected}
              aria-current={isToday ? 'date' : undefined}
            >
              {format(day, 'd')}
            </button>
          )
        })}
      </div>
    </>
  )
}

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    value ? parseISO(value) : new Date(),
  )
  const [focusedDay, setFocusedDay] = useState<Date | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)

  // Sync viewMonth when value changes externally
  useEffect(() => {
    if (value) setViewMonth(parseISO(value))
  }, [value])

  // Seed focused day when opening; clear when closing
  useEffect(() => {
    if (open) {
      setFocusedDay(value ? parseISO(value) : new Date())
    } else {
      setFocusedDay(null)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open])

  function selectDate(date: Date) {
    onChange(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  function goToday() {
    const today = new Date()
    setViewMonth(today)
    onChange(format(today, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const selectedDate = value ? parseISO(value) : null

  return (
    <div className="datepicker-wrap" ref={wrapRef}>
      {/* Trigger */}
      <button
        className="datepicker-trigger"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        title="Pick a date"
      >
        <Calendar size={13} color="#6366f1" />
        {label ?? (value ?? 'Pick date')}
      </button>

      {/* Popup */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="datepicker-popup"
            role="dialog"
            aria-modal="true"
            aria-label="Date picker"
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <CalendarGrid
              viewMonth={viewMonth}
              setViewMonth={setViewMonth}
              selectedDate={selectedDate}
              onSelect={selectDate}
              focusedDay={focusedDay}
              setFocusedDay={setFocusedDay}
            />

            <div className="datepicker-footer">
              <button className="datepicker-today-btn" onClick={goToday}>
                Jump to Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/**
 * An icon-only calendar picker used to move a task/reminder/goal to any date.
 * Uses position:fixed for the popup so it escapes overflow:hidden parents.
 * Position is recalculated on scroll and resize so it always tracks the button.
 */
export function MoveDatePicker({ currentDate, onMove }: MoveDatePickerProps) {
  const [open, setOpen] = useState(false)
  const [popupPos, setPopupPos] = useState({ top: 0, right: 0 })
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    currentDate ? parseISO(currentDate) : new Date(),
  )
  const [focusedDay, setFocusedDay] = useState<Date | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (currentDate) setViewMonth(parseISO(currentDate))
  }, [currentDate])

  // Seed focused day when opening; clear when closing
  useEffect(() => {
    if (open) {
      setFocusedDay(currentDate ? parseISO(currentDate) : new Date())
    } else {
      setFocusedDay(null)
    }
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // Recalculate popup position relative to the trigger button.
  // Opens below the button when there is enough space, otherwise above.
  const calcPos = useCallback(() => {
    if (!btnRef.current) return
    const rect = btnRef.current.getBoundingClientRect()
    const popupHeight = 340
    const margin = 8
    const top = window.innerHeight - rect.bottom >= popupHeight + margin
      ? rect.bottom + margin
      : Math.max(margin, rect.top - popupHeight - margin)
    setPopupPos({ top, right: Math.max(margin, window.innerWidth - rect.right) })
  }, [])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [open])

  // Close on Escape
  useEffect(() => {
    if (!open) return
    function handle(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open])

  // Keep position in sync with scroll and resize while open
  useEffect(() => {
    if (!open) return
    window.addEventListener('scroll', calcPos, true)
    window.addEventListener('resize', calcPos)
    return () => {
      window.removeEventListener('scroll', calcPos, true)
      window.removeEventListener('resize', calcPos)
    }
  }, [open, calcPos])

  function handleOpen() {
    calcPos()
    setOpen(o => !o)
  }

  function selectDate(date: Date) {
    onMove(format(date, 'yyyy-MM-dd'))
    setOpen(false)
  }

  const selectedDate = currentDate ? parseISO(currentDate) : null

  return (
    <div className="datepicker-wrap" ref={wrapRef}>
      <button
        ref={btnRef}
        className="move-btn"
        onClick={handleOpen}
        title="Move to date"
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label="Move to a different date"
        style={open ? { opacity: 1 } : undefined}
      >
        <CalendarPlus size={12} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="datepicker-popup"
            role="dialog"
            aria-modal="true"
            aria-label="Move to date"
            style={{
              position: 'fixed',
              top: popupPos.top,
              right: popupPos.right,
              left: 'auto',
              transform: 'none',
            }}
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            <CalendarGrid
              viewMonth={viewMonth}
              setViewMonth={setViewMonth}
              selectedDate={selectedDate}
              onSelect={selectDate}
              focusedDay={focusedDay}
              setFocusedDay={setFocusedDay}
              label="Move to date"
            />

            <div className="datepicker-footer">
              <button className="datepicker-today-btn" onClick={() => selectDate(new Date())}>
                Jump to Today
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

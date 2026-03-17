import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
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

const WEEKDAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export function DatePicker({ value, onChange, label }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const [viewMonth, setViewMonth] = useState<Date>(() =>
    value ? parseISO(value) : new Date(),
  )
  const wrapRef = useRef<HTMLDivElement>(null)

  // Sync viewMonth when value changes externally
  useEffect(() => {
    if (value) setViewMonth(parseISO(value))
  }, [value])

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handle(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
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
    setOpen(false)         // ← always close immediately
  }

  function goToday() {
    const today = new Date()
    setViewMonth(today)
    onChange(format(today, 'yyyy-MM-dd'))
    setOpen(false)
  }

  // Build calendar grid: Mon-Sun weeks covering the full month
  function buildDays(): Date[] {
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

  const days = buildDays()
  const selectedDate = value ? parseISO(value) : null
  const today = new Date()

  return (
    <div className="datepicker-wrap" ref={wrapRef}>
      {/* Trigger */}
      <button
        className="datepicker-trigger"
        onClick={() => setOpen((o) => !o)}
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
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
          >
            {/* Month header */}
            <div className="datepicker-header">
              <button
                className="datepicker-nav"
                onClick={() => setViewMonth((m) => subMonths(m, 1))}
              >
                <ChevronLeft size={14} />
              </button>
              <span className="datepicker-month-label">
                {format(viewMonth, 'MMMM yyyy')}
              </span>
              <button
                className="datepicker-nav"
                onClick={() => setViewMonth((m) => addMonths(m, 1))}
              >
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Weekday labels */}
            <div className="datepicker-weekdays">
              {WEEKDAYS.map((d) => (
                <div key={d} className="datepicker-weekday">{d}</div>
              ))}
            </div>

            {/* Day grid */}
            <div className="datepicker-days">
              {days.map((day) => {
                const isCurrentMonth = isSameMonth(day, viewMonth)
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                const isToday = isSameDay(day, today)

                return (
                  <button
                    key={day.toISOString()}
                    className={[
                      'datepicker-day',
                      !isCurrentMonth ? 'other-month' : '',
                      isSelected ? 'selected' : '',
                      isToday && !isSelected ? 'today' : '',
                    ].filter(Boolean).join(' ')}
                    onClick={() => selectDate(day)}
                  >
                    {format(day, 'd')}
                  </button>
                )
              })}
            </div>

            {/* Footer */}
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

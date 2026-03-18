import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, ChevronLeft, ChevronRight, Calendar,
  Clock, Link2, Trash2, Timer, ExternalLink,
  Building2, Pencil, Check, X, CalendarDays, LayoutList,
} from 'lucide-react'
import { DatePicker, MoveDatePicker } from './ui/DatePicker'
import { useAppStore } from '../store'
import {
  todayStr, fmtDateLabel, fmtTime,
  totalMinutes, minsToHM, shiftDate,
  getWeekDays, fmtWeekRange, fmtDayShort, fmtDayName,
  truncateUrl,
} from '../lib/utils'
import { type Task } from '../store'

type ViewMode = 'day' | 'week'

interface EditState {
  name: string
  hours: string
  minutes: string
  link: string
  customer: string
}

function CustomerChip({ name }: { name: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11.5, color: 'var(--c-accent-fg)',
      background: 'rgba(var(--c-accent-rgb),0.08)', border: '1px solid rgba(var(--c-accent-rgb),0.15)',
      borderRadius: 6, padding: '2px 7px', fontWeight: 500, whiteSpace: 'nowrap',
    }}>
      <Building2 size={11} />{name}
    </span>
  )
}

function TaskRow({
  task,
  index,
  onDelete,
  onSave,
  onToggleDone,
  onMoveTo,
}: {
  task: Task
  index: number
  onDelete: () => void
  onSave: (updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  onToggleDone: () => void
  onMoveTo: (date: string) => void
}) {
  const [editing, setEditing] = useState(false)
  const [edit, setEdit] = useState<EditState>({
    name: task.name,
    hours: String(task.hours || ''),
    minutes: String(task.minutes || ''),
    link: task.link,
    customer: task.customer,
  })

  function startEdit() {
    setEdit({ name: task.name, hours: String(task.hours || ''), minutes: String(task.minutes || ''), link: task.link, customer: task.customer })
    setEditing(true)
  }

  function save() {
    if (!edit.name.trim()) return
    onSave({
      name: edit.name.trim(),
      hours: parseFloat(edit.hours) || 0,
      minutes: parseFloat(edit.minutes) || 0,
      link: edit.link.trim(),
      customer: edit.customer.trim(),
    })
    setEditing(false)
  }

  function cancel() { setEditing(false) }

  function onKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') save()
    if (e.key === 'Escape') cancel()
  }

  if (editing) {
    return (
      <motion.tr
        key={task.id + '-edit'}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ background: 'rgba(var(--c-accent-rgb),0.04)', borderBottom: '1px solid rgba(var(--c-accent-rgb),0.12)' }}
      >
        <td style={{ color: 'var(--c-text4)', fontFamily: 'monospace', fontSize: 11, padding: '10px 16px' }}>{index + 1}</td>
        <td style={{ padding: '8px 8px 8px 16px' }}>
          <input className="edit-row-input" value={edit.name}
            onChange={e => setEdit(s => ({ ...s, name: e.target.value }))}
            onKeyDown={onKey} autoFocus placeholder="Task name" />
        </td>
        <td style={{ padding: '8px' }}>
          <input className="edit-row-input" value={edit.customer}
            onChange={e => setEdit(s => ({ ...s, customer: e.target.value }))}
            onKeyDown={onKey} placeholder="Customer" style={{ width: 110 }} />
        </td>
        <td style={{ padding: '8px', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <input className="edit-row-input" type="number" value={edit.hours}
              onChange={e => setEdit(s => ({ ...s, hours: e.target.value }))}
              onKeyDown={onKey} placeholder="h" min={0} max={24} style={{ width: 52 }} />
            <input className="edit-row-input" type="number" value={edit.minutes}
              onChange={e => setEdit(s => ({ ...s, minutes: e.target.value }))}
              onKeyDown={onKey} placeholder="m" min={0} max={59} style={{ width: 52 }} />
          </div>
        </td>
        <td style={{ padding: '8px' }}>
          <input className="edit-row-input" type="url" value={edit.link}
            onChange={e => setEdit(s => ({ ...s, link: e.target.value }))}
            onKeyDown={onKey} placeholder="https://..." style={{ minWidth: 140 }} />
        </td>
        <td style={{ padding: '8px 16px 8px 8px' }}>
          <div style={{ display: 'flex', gap: 4 }}>
            <button onClick={save} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'rgba(var(--c-emerald-rgb),0.15)', color: 'var(--c-emerald)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Check size={13} />
            </button>
            <button onClick={cancel} style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'rgba(var(--c-text4-rgb),0.1)', color: 'var(--c-text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <X size={13} />
            </button>
          </div>
        </td>
      </motion.tr>
    )
  }

  return (
    <motion.tr
      key={task.id}
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
      className="task-row"
      style={task.done ? { opacity: 0.55 } : undefined}
    >
      <td style={{ color: 'var(--c-text4)', fontFamily: 'monospace', fontSize: 11 }}>{index + 1}</td>
      <td style={{ fontWeight: 500 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            className={`check-circle${task.done ? ' checked' : ''}`}
            onClick={onToggleDone}
            style={{ marginTop: 0, flexShrink: 0 }}
            title={task.done ? 'Mark incomplete' : 'Mark complete'}
          >
            {task.done && <Check size={10} color="#021c12" />}
          </button>
          <span style={{ textDecoration: task.done ? 'line-through' : 'none', color: task.done ? 'var(--c-text4)' : undefined }}>
            {task.name}
          </span>
        </div>
      </td>
      <td>{task.customer ? <CustomerChip name={task.customer} /> : <span style={{ color: 'var(--c-text5)' }}>—</span>}</td>
      <td>
        <span className="time-chip"><Clock size={11} />{fmtTime(task.hours, task.minutes)}</span>
      </td>
      <td>
        {task.link ? (
          <a href={task.link} target="_blank" rel="noopener noreferrer" className="ext-link" title={task.link}>
            <ExternalLink size={11} />{truncateUrl(task.link)}
          </a>
        ) : <span style={{ color: 'var(--c-text5)' }}>—</span>}
      </td>
      <td>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="delete-btn" onClick={startEdit} title="Edit">
            <Pencil size={12} />
          </button>
          <MoveDatePicker currentDate={task.date} onMove={onMoveTo} />
          <button className="delete-btn" onClick={onDelete} title="Delete">
            <Trash2 size={12} />
          </button>
        </div>
      </td>
    </motion.tr>
  )
}

function DayTable({ tasks, onDelete, onSave, onToggleDone, onMoveTo }: {
  tasks: Task[]
  onDelete: (id: string) => void
  onSave: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  onToggleDone: (id: string) => void
  onMoveTo: (id: string, date: string) => void
}) {
  const total = totalMinutes(tasks)

  if (tasks.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon"><Calendar size={22} color="#1e2a3a" /></div>
        <p style={{ fontSize: 13, color: 'var(--c-text4)' }}>No tasks logged for this day</p>
        <p style={{ fontSize: 11, color: 'var(--c-text5)' }}>Add one above to get started</p>
      </div>
    )
  }

  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: 36 }}>#</th>
            <th>Task</th>
            <th>Customer</th>
            <th style={{ whiteSpace: 'nowrap' }}>Time</th>
            <th>Link</th>
            <th style={{ width: 68 }}></th>
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {tasks.map((task, i) => (
              <TaskRow
                key={task.id}
                task={task}
                index={i}
                onDelete={() => onDelete(task.id)}
                onSave={(updates) => onSave(task.id, updates)}
                onToggleDone={() => onToggleDone(task.id)}
                onMoveTo={(date) => onMoveTo(task.id, date)}
              />
            ))}
          </AnimatePresence>
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td style={{ fontWeight: 700, color: 'var(--c-text3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total</td>
            <td></td>
            <td><span className="time-chip time-chip-total"><Clock size={11} />{minsToHM(total)}</span></td>
            <td></td>
            <td></td>
          </tr>
        </tfoot>
      </table>
    </div>
  )
}

function WeekView({ anchorDate, tasks, onNavigateDay, onDelete, onSave, onToggleDone, onMoveTo }: {
  anchorDate: string
  tasks: Task[]
  onNavigateDay: (d: string) => void
  onDelete: (id: string) => void
  onSave: (id: string, updates: Partial<Omit<Task, 'id' | 'createdAt'>>) => void
  onToggleDone: (id: string) => void
  onMoveTo: (id: string, date: string) => void
}) {
  const days = getWeekDays(anchorDate)
  const today = todayStr()
  const [expanded, setExpanded] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {}
    days.forEach(d => { init[d] = true })
    return init
  })

  function toggle(d: string) {
    setExpanded(s => ({ ...s, [d]: !s[d] }))
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {days.map((d) => {
        const dayTasks = tasks.filter(t => t.date === d).sort((a, b) => a.createdAt - b.createdAt)
        const dayTotal = totalMinutes(dayTasks)
        const isToday = d === today
        const open = expanded[d]

        return (
          <div key={d} className="week-day-section">
            {/* Day header — clicking navigates to day view */}
            <div
              className={`week-day-header${isToday ? ' today' : ''}`}
              onClick={() => onNavigateDay(d)}
              title={`Switch to day view for ${fmtDayShort(d)}`}
            >
              <span className={`week-day-name${isToday ? ' today-label' : ' other-label'}`}>
                {fmtDayName(d)}{isToday && ' · Today'}
              </span>
              <span className="week-day-date">{fmtDayShort(d)}</span>
              <div className="week-day-meta">
                {dayTasks.length > 0 && (
                  <>
                    <span style={{ fontSize: 11, color: 'var(--c-text4)' }}>
                      {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''}
                    </span>
                    <span className="time-chip" style={{ fontSize: 11 }}>
                      <Clock size={10} />{minsToHM(dayTotal)}
                    </span>
                  </>
                )}
                {dayTasks.length === 0 && (
                  <span style={{ fontSize: 11, color: 'var(--c-text5)' }}>No tasks</span>
                )}
                {/* expand/collapse */}
                <button
                  onClick={e => { e.stopPropagation(); toggle(d) }}
                  style={{ marginLeft: 4, width: 22, height: 22, borderRadius: 5, border: 'none', background: 'transparent', color: 'var(--c-text4)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, transition: 'transform 0.15s' }}
                  title={open ? 'Collapse' : 'Expand'}
                >
                  {open ? '▲' : '▼'}
                </button>
              </div>
            </div>

            {/* Day tasks */}
            <AnimatePresence initial={false}>
              {open && dayTasks.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{ overflowX: 'auto' }}>
                    <table className="data-table" style={{ fontSize: 12 }}>
                      <thead>
                        <tr>
                          <th style={{ width: 32 }}>#</th>
                          <th>Task</th>
                          <th>Customer</th>
                          <th>Time</th>
                          <th>Link</th>
                          <th style={{ width: 68 }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        <AnimatePresence initial={false}>
                          {dayTasks.map((task, i) => (
                            <TaskRow
                              key={task.id}
                              task={task}
                              index={i}
                              onDelete={() => onDelete(task.id)}
                              onSave={(updates) => onSave(task.id, updates)}
                              onToggleDone={() => onToggleDone(task.id)}
                              onMoveTo={(date) => onMoveTo(task.id, date)}
                            />
                          ))}
                        </AnimatePresence>
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}

export function DailyLog() {
  const [date, setDate] = useState(todayStr())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [name, setName] = useState('')
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [link, setLink] = useState('')
  const [customer, setCustomer] = useState('')
  const [error, setError] = useState('')

  const { tasks, addTask, updateTask, deleteTask, toggleTask, moveTaskToDate } = useAppStore()

  const dayTasks = tasks
    .filter((t) => t.date === date)
    .sort((a, b) => a.createdAt - b.createdAt)
  const total = totalMinutes(dayTasks)
  const isToday = date === todayStr()

  // Week stats
  const weekDays = getWeekDays(date)
  const weekTasks = tasks.filter(t => weekDays.includes(t.date))
  const weekTotal = totalMinutes(weekTasks)

  function handleAdd() {
    if (!name.trim()) { setError('Task name is required'); return }
    setError('')
    addTask({
      date,
      name: name.trim(),
      hours: parseFloat(hours) || 0,
      minutes: parseFloat(minutes) || 0,
      link: link.trim(),
      customer: customer.trim(),
    })
    setName('')
    setHours('')
    setMinutes('')
    setLink('')
    setCustomer('')
  }

  function handleNavigateDay(d: string) {
    setDate(d)
    setViewMode('day')
  }

  const shiftAmount = viewMode === 'week' ? 7 : 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Date nav + view toggle ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>

        {/* Arrow + custom date picker */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 3,
          background: 'var(--c-surface)', border: '1px solid #171f30',
          borderRadius: 10, padding: '4px 6px',
        }}>
          <button
            onClick={() => setDate(shiftDate(date, -shiftAmount))}
            style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--c-text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronLeft size={15} />
          </button>

          <DatePicker
            value={date}
            onChange={(d) => setDate(d)}
            label={viewMode === 'week' ? fmtWeekRange(date) : fmtDateLabel(date)}
          />

          <button
            onClick={() => setDate(shiftDate(date, shiftAmount))}
            style={{ width: 28, height: 28, borderRadius: 7, border: 'none', background: 'transparent', color: 'var(--c-text3)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onMouseEnter={e => (e.currentTarget.style.background = 'var(--c-surface3)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
          >
            <ChevronRight size={15} />
          </button>
        </div>

        {!isToday && (
          <button className="btn btn-ghost btn-sm" onClick={() => setDate(todayStr())}>
            <Calendar size={12} /> Today
          </button>
        )}

        {/* Day / Week toggle */}
        <div className="view-toggle">
          <button
            className={`view-toggle-btn${viewMode === 'day' ? ' active' : ''}`}
            onClick={() => setViewMode('day')}
          >
            <LayoutList size={13} /> Day
          </button>
          <button
            className={`view-toggle-btn${viewMode === 'week' ? ' active' : ''}`}
            onClick={() => setViewMode('week')}
          >
            <CalendarDays size={13} /> Week
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      {(() => {
        const stats = viewMode === 'day'
          ? [
              { label: 'Tasks', value: String(dayTasks.length), color: 'var(--c-accent)', bg: 'rgba(var(--c-accent-rgb),0.1)', icon: <Timer size={16} style={{ color: 'var(--c-accent)' }} /> },
              { label: 'Time Logged', value: minsToHM(total), color: 'var(--c-emerald)', bg: 'rgba(var(--c-emerald-rgb),0.1)', icon: <Clock size={16} style={{ color: 'var(--c-emerald)' }} /> },
              { label: 'Date', value: fmtDateLabel(date), color: 'var(--c-amber)', bg: 'rgba(251,191,36,0.1)', icon: <Calendar size={16} style={{ color: 'var(--c-amber)' }} /> },
            ]
          : [
              { label: 'Week Tasks', value: String(weekTasks.length), color: 'var(--c-accent)', bg: 'rgba(var(--c-accent-rgb),0.1)', icon: <Timer size={16} style={{ color: 'var(--c-accent)' }} /> },
              { label: 'Week Time', value: minsToHM(weekTotal), color: 'var(--c-emerald)', bg: 'rgba(var(--c-emerald-rgb),0.1)', icon: <Clock size={16} style={{ color: 'var(--c-emerald)' }} /> },
              { label: 'Active Days', value: String(weekDays.filter(d => tasks.some(t => t.date === d)).length), color: 'var(--c-amber)', bg: 'rgba(251,191,36,0.1)', icon: <CalendarDays size={16} style={{ color: 'var(--c-amber)' }} /> },
            ]
        return (
          <div className="stat-grid">
            {stats.map((s, i) => (
              <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
                <div className="stat-icon" style={{ background: s.bg }}>{s.icon}</div>
                <div>
                  <div className="stat-label">{s.label}</div>
                  <div className="stat-value" style={{ color: s.color, fontSize: s.value.length > 7 ? 14 : 20 }}>{s.value}</div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      })()}

      {/* ── Add task form ── */}
      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Plus size={15} style={{ color: 'var(--c-accent)' }} />
            Log a Task
            {viewMode === 'week' && (
              <span style={{ fontSize: 11, color: 'var(--c-text4)', fontWeight: 400 }}>
                — adding to <span style={{ color: 'var(--c-accent-fg)' }}>{fmtDateLabel(date)}</span>
              </span>
            )}
          </span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-grid-3">
            <div>
              <label className="field-label">Task Description</label>
              <div className="field-input-icon">
                <span className="icon"><Timer size={13} /></span>
                <input className="field-input" type="text" placeholder="What did you work on?"
                  value={name} onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <div>
              <label className="field-label">Hours</label>
              <input className="field-input" type="number" placeholder="0" min={0} max={24} step={0.5}
                value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Minutes</label>
              <input className="field-input" type="number" placeholder="0" min={0} max={59} step={5}
                value={minutes} onChange={(e) => setMinutes(e.target.value)} />
            </div>
          </div>
          <div className="form-grid-3">
            <div>
              <label className="field-label">Customer (optional)</label>
              <div className="field-input-icon">
                <span className="icon"><Building2 size={13} /></span>
                <input className="field-input" type="text" placeholder="e.g. Acme Corp"
                  value={customer} onChange={(e) => setCustomer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <div>
              <label className="field-label">Link (optional)</label>
              <div className="field-input-icon">
                <span className="icon"><Link2 size={13} /></span>
                <input className="field-input" type="url" placeholder="https://..."
                  value={link} onChange={(e) => setLink(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4 }}>
              {error && <p style={{ fontSize: 11, color: 'var(--c-rose)' }}>{error}</p>}
              <button className="btn btn-primary btn-md" onClick={handleAdd}>
                <Plus size={14} /> Add Task
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Day or Week view ── */}
      <AnimatePresence mode="wait">
        {viewMode === 'day' ? (
          <motion.div
            key="day"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="card">
              <div className="card-header">
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)' }}>
                  {isToday ? "Today's Log" : fmtDateLabel(date)}
                </span>
                {dayTasks.length > 0 && (
                  <span style={{ fontSize: 11, color: 'var(--c-text3)', background: 'var(--c-surface2)', border: '1px solid #171f30', borderRadius: 7, padding: '3px 8px' }}>
                    {dayTasks.length} task{dayTasks.length !== 1 ? 's' : ''} · {minsToHM(total)}
                  </span>
                )}
              </div>
              <DayTable
                tasks={dayTasks}
                onDelete={deleteTask}
                onSave={(id, updates) => updateTask(id, updates)}
                onToggleDone={toggleTask}
                onMoveTo={(id, date) => moveTaskToDate(id, date)}
              />
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="week"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)' }}>
                Week of {fmtWeekRange(date)}
              </span>
              <span style={{ fontSize: 11, color: 'var(--c-text4)' }}>
                Click a day to switch to day view
              </span>
            </div>
            <WeekView
              anchorDate={date}
              tasks={tasks}
              onNavigateDay={handleNavigateDay}
              onDelete={deleteTask}
              onSave={(id, updates) => updateTask(id, updates)}
              onToggleDone={toggleTask}
              onMoveTo={(id, date) => moveTaskToDate(id, date)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

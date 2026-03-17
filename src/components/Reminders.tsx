import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Bell, CheckCircle2, Trash2,
  AlertCircle, Calendar, ExternalLink, Circle,
  Link2, Building2,
} from 'lucide-react'
import { useAppStore, type Priority } from '../store'
import { todayStr, fmtDateShort, isOverdue } from '../lib/utils'

type Filter = 'all' | 'active' | 'done' | 'high' | 'overdue'

const priorityMeta: Record<Priority, { label: string; cls: string }> = {
  high:   { label: 'High',   cls: 'badge badge-rose' },
  medium: { label: 'Medium', cls: 'badge badge-amber' },
  low:    { label: 'Low',    cls: 'badge badge-gray' },
}

export function Reminders() {
  const [text, setText] = useState('')
  const [due, setDue] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [link, setLink] = useState('')
  const [customer, setCustomer] = useState('')
  const [filter, setFilter] = useState<Filter>('active')
  const [error, setError] = useState('')

  const { reminders, addReminder, toggleReminder, deleteReminder } = useAppStore()

  const total = reminders.length
  const done = reminders.filter((r) => r.done).length
  const overdue = reminders.filter((r) => !r.done && isOverdue(r.due)).length
  const active = total - done

  function handleAdd() {
    if (!text.trim()) { setError('Please enter a reminder'); return }
    setError('')
    addReminder({ text: text.trim(), due, priority, link: link.trim(), customer: customer.trim(), done: false })
    setText(''); setDue(''); setPriority('medium'); setLink(''); setCustomer('')
  }

  const filtered = reminders.filter((r) => {
    if (filter === 'active') return !r.done
    if (filter === 'done') return r.done
    if (filter === 'high') return r.priority === 'high' && !r.done
    if (filter === 'overdue') return !r.done && isOverdue(r.due)
    return true
  })

  const filters: { key: Filter; label: string; count?: number }[] = [
    { key: 'all',     label: 'All',          count: total },
    { key: 'active',  label: 'Active',        count: active },
    { key: 'done',    label: 'Completed',     count: done },
    { key: 'high',    label: 'High Priority' },
    { key: 'overdue', label: 'Overdue',       count: overdue },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Stats ── */}
      <div className="stat-grid">
        {[
          { label: 'Total',     value: total,   varColor: 'var(--c-accent-fg)',  varBg: 'rgba(var(--c-accent-rgb),0.1)',  icon: <Bell       size={16} style={{ color: 'var(--c-accent-fg)' }} /> },
          { label: 'Active',    value: active,  varColor: 'var(--c-amber)',      varBg: 'rgba(var(--c-amber-rgb),0.1)',   icon: <Circle     size={16} style={{ color: 'var(--c-amber)' }} /> },
          { label: 'Completed', value: done,    varColor: 'var(--c-emerald)',    varBg: 'rgba(var(--c-emerald-rgb),0.1)', icon: <CheckCircle2 size={16} style={{ color: 'var(--c-emerald)' }} /> },
          { label: 'Overdue',   value: overdue, varColor: overdue > 0 ? 'var(--c-rose)' : 'var(--c-text4)', varBg: overdue > 0 ? 'rgba(var(--c-rose-rgb),0.1)' : 'var(--c-surface3)', icon: <AlertCircle size={16} style={{ color: overdue > 0 ? 'var(--c-rose)' : 'var(--c-text4)' }} /> },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="stat-card">
            <div className="stat-icon" style={{ background: s.varBg }}>{s.icon}</div>
            <div>
              <div className="stat-label">{s.label}</div>
              <div className="stat-value" style={{ color: s.varColor }}>{s.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* ── Add form ── */}
      <div className="card">
        <div className="card-header">
          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--c-text2)', display: 'flex', alignItems: 'center', gap: 7 }}>
            <Plus size={15} style={{ color: 'var(--c-accent)' }} /> Add Reminder
          </span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-grid-3">
            <div>
              <label className="field-label">Task / Reminder</label>
              <div className="field-input-icon">
                <span className="icon"><Bell size={13} /></span>
                <input className="field-input" type="text" placeholder="What do you need to take care of?"
                  value={text} onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <div>
              <label className="field-label">Due Date</label>
              <input className="field-input" type="date" value={due}
                min={todayStr()} onChange={(e) => setDue(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Priority</label>
              <select className="field-input" value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)} style={{ cursor: 'pointer' }}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
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
                  value={link} onChange={(e) => setLink(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4 }}>
              {error && <p style={{ fontSize: 11, color: 'var(--c-rose)' }}>{error}</p>}
              <button className="btn btn-primary btn-md" onClick={handleAdd}>
                <Plus size={14} /> Add
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button key={f.key} className={`filter-pill${filter === f.key ? ' active' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
            {f.count !== undefined && (
              <span className="filter-count">{f.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── List ── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Bell size={22} style={{ color: 'var(--c-border3)' }} /></div>
          <p style={{ fontSize: 13, color: 'var(--c-text4)' }}>Nothing here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <AnimatePresence initial={false}>
            {filtered.map((r) => {
              const od = !r.done && isOverdue(r.due)
              return (
                <motion.div
                  key={r.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.18 }}
                  className={`reminder-item${r.done ? ' done' : ''}${od ? ' overdue overdue-pulse' : ''}`}
                >
                  <button className={`check-circle${r.done ? ' checked' : ''}`} onClick={() => toggleReminder(r.id)} style={{ marginTop: 1 }}>
                    {r.done && <CheckCircle2 size={12} color="#021c12" />}
                  </button>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{
                      fontSize: 13.5,
                      color: r.done ? 'var(--c-text4)' : 'var(--c-text)',
                      textDecoration: r.done ? 'line-through' : 'none',
                      lineHeight: 1.5,
                    }}>{r.text}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 7, flexWrap: 'wrap' }}>
                      <span className={priorityMeta[r.priority].cls}>{priorityMeta[r.priority].label}</span>
                      {r.customer && (
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 11, color: 'var(--c-accent-fg)',
                          background: 'rgba(var(--c-accent-rgb),0.08)',
                          border: '1px solid rgba(var(--c-accent-rgb),0.15)',
                          borderRadius: 6, padding: '2px 7px', fontWeight: 500,
                        }}>
                          <Building2 size={10} />{r.customer}
                        </span>
                      )}
                      {r.due && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: od ? 'var(--c-rose)' : 'var(--c-text4)', fontWeight: od ? 600 : 400 }}>
                          <Calendar size={11} />{od ? 'Overdue · ' : 'Due: '}{fmtDateShort(r.due)}
                        </span>
                      )}
                      {r.link && (
                        <a href={r.link} target="_blank" rel="noopener noreferrer" className="ext-link">
                          <ExternalLink size={11} />Link
                        </a>
                      )}
                    </div>
                  </div>

                  <button className="delete-btn" onClick={() => deleteReminder(r.id)}><Trash2 size={13} /></button>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

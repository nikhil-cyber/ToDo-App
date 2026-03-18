import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Target, CheckCircle2, Trash2, RotateCcw, StickyNote, Calendar } from 'lucide-react'
import { useAppStore, type BucketCategory } from '../store'
import { fmtDateShort } from '../lib/utils'
import { MoveDatePicker } from './ui/DatePicker'

type Filter = 'all' | BucketCategory | 'done'

const catMeta: Record<BucketCategory, { cls: string; symbol: string }> = {
  personal: { cls: 'badge badge-violet',  symbol: '✦' },
  career:   { cls: 'badge badge-emerald', symbol: '◆' },
  travel:   { cls: 'badge badge-sky',     symbol: '◉' },
  health:   { cls: 'badge badge-rose',    symbol: '◈' },
  learning: { cls: 'badge badge-amber',   symbol: '◇' },
  finance:  { cls: 'badge badge-emerald', symbol: '◎' },
  other:    { cls: 'badge badge-gray',    symbol: '○' },
}

export function BucketList() {
  const [title, setTitle] = useState('')
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const [category, setCategory] = useState<BucketCategory>('personal')
  const [notes, setNotes] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [error, setError] = useState('')

  const { bucket, addBucketItem, toggleBucket, deleteBucket, updateBucketTargetDate } = useAppStore()

  const total = bucket.length
  const done = bucket.filter((b) => b.done).length

  function handleAdd() {
    if (!title.trim()) { setError('Please enter a goal'); return }
    setError('')
    addBucketItem({ title: title.trim(), year, category, notes: notes.trim(), done: false })
    setTitle(''); setNotes('')
    setYear(String(new Date().getFullYear())); setCategory('personal')
  }

  const filtered = bucket.filter((b) => {
    if (filter === 'done') return b.done
    if (filter !== 'all') return b.category === filter && !b.done
    return true
  })

  const filters: { key: Filter; label: string }[] = [
    { key: 'all',      label: 'All' },
    { key: 'personal', label: 'Personal' },
    { key: 'career',   label: 'Career' },
    { key: 'travel',   label: 'Travel' },
    { key: 'health',   label: 'Health' },
    { key: 'learning', label: 'Learning' },
    { key: 'finance',  label: 'Finance' },
    { key: 'done',     label: 'Achieved' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* ── Stats ── */}
      <div className="stat-grid">
        {[
          { label: 'Total Goals', value: total,       varColor: 'var(--c-accent-fg)',  varBg: 'rgba(var(--c-accent-rgb),0.1)',  icon: <Target       size={16} style={{ color: 'var(--c-accent-fg)' }} /> },
          { label: 'Achieved',    value: done,         varColor: 'var(--c-emerald)',    varBg: 'rgba(var(--c-emerald-rgb),0.1)', icon: <CheckCircle2 size={16} style={{ color: 'var(--c-emerald)' }} /> },
          { label: 'Remaining',   value: total - done, varColor: 'var(--c-amber)',      varBg: 'rgba(var(--c-amber-rgb),0.1)',   icon: <Target       size={16} style={{ color: 'var(--c-amber)' }} /> },
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
            <Plus size={15} style={{ color: 'var(--c-emerald)' }} /> Add a Goal
          </span>
        </div>
        <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="form-grid-3">
            <div>
              <label className="field-label">Goal / Dream</label>
              <div className="field-input-icon">
                <span className="icon"><Target size={13} /></span>
                <input className="field-input" type="text" placeholder="Something you want to achieve..."
                  value={title} onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAdd()} />
              </div>
            </div>
            <div>
              <label className="field-label">Target Year</label>
              <input className="field-input" type="number" placeholder={String(new Date().getFullYear())}
                min={2024} max={2060} value={year} onChange={(e) => setYear(e.target.value)} />
            </div>
            <div>
              <label className="field-label">Category</label>
              <select className="field-input" value={category}
                onChange={(e) => setCategory(e.target.value as BucketCategory)} style={{ cursor: 'pointer' }}>
                <option value="personal">Personal</option>
                <option value="career">Career</option>
                <option value="travel">Travel</option>
                <option value="health">Health</option>
                <option value="learning">Learning</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
          <div className="form-grid-2">
            <div>
              <label className="field-label">Notes (optional)</label>
              <div className="field-input-icon">
                <span className="icon"><StickyNote size={13} /></span>
                <input className="field-input" type="text" placeholder="Milestones, context, or details..."
                  value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 4 }}>
              {error && <p style={{ fontSize: 11, color: 'var(--c-rose)' }}>{error}</p>}
              <button className="btn btn-success btn-md" onClick={handleAdd}>
                <Plus size={14} /> Add Goal
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button key={f.key} className={`filter-pill${filter === f.key ? ' active-green' : ''}`} onClick={() => setFilter(f.key)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon"><Target size={22} style={{ color: 'var(--c-border3)' }} /></div>
          <p style={{ fontSize: 13, color: 'var(--c-text4)' }}>No goals yet</p>
          <p style={{ fontSize: 11, color: 'var(--c-text5)' }}>Dream big, add one above</p>
        </div>
      ) : (
        <div className="bucket-grid">
          <AnimatePresence initial={false}>
            {filtered.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.93 }}
                transition={{ delay: i * 0.03, duration: 0.22 }}
                className={`bucket-card${item.done ? ' done' : ''}`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <span className={catMeta[item.category].cls} style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <span>{catMeta[item.category].symbol}</span>
                    {item.category}
                  </span>
                  <span className="year-badge">{item.year}</span>
                </div>

                <p style={{
                  fontSize: 13.5, fontWeight: 600,
                  color: item.done ? 'var(--c-text4)' : 'var(--c-text)',
                  lineHeight: 1.5, textDecoration: item.done ? 'line-through' : 'none', flex: 1,
                }}>{item.title}</p>

                {item.notes && (
                  <p style={{ fontSize: 11.5, color: 'var(--c-text4)', lineHeight: 1.5, borderTop: '1px solid var(--c-border)', paddingTop: 10 }}>
                    {item.notes}
                  </p>
                )}

                {item.targetDate && !item.done && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--c-text4)' }}>
                    <Calendar size={11} />
                    <span>Target: {fmtDateShort(item.targetDate)}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--c-border)', paddingTop: 12, marginTop: 4 }}>
                  <button className="btn btn-ghost btn-sm" onClick={() => toggleBucket(item.id)}>
                    {item.done ? <><RotateCcw size={11} />Undo</> : <><CheckCircle2 size={11} />Mark Done</>}
                  </button>
                  <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                    {!item.done && (
                      <MoveDatePicker
                        currentDate={item.targetDate}
                        onMove={(date) => updateBucketTargetDate(item.id, date)}
                      />
                    )}
                    <button className="delete-btn" style={{ opacity: 1 }} onClick={() => deleteBucket(item.id)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  )
}

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Bell, Target, Zap, Sun, Moon } from 'lucide-react'
import { DailyLog } from './components/DailyLog'
import { Reminders } from './components/Reminders'
import { BucketList } from './components/BucketList'
import { useAppStore } from './store'
import { todayStr } from './lib/utils'
import { useTheme } from './lib/theme'

type Tab = 'daily' | 'reminders' | 'bucket'

export default function App() {
  const [tab, setTab] = useState<Tab>('daily')
  const { theme, toggle } = useTheme()
  const { tasks, reminders, bucket } = useAppStore()

  const today = todayStr()
  const todayTasks = tasks.filter((t) => t.date === today).length
  const activeReminders = reminders.filter((r) => !r.done).length
  const overdueCount = reminders.filter((r) => !r.done && r.due && r.due < today).length
  const activeGoals = bucket.filter((b) => !b.done).length

  return (
    <div className="app-bg">
      <div className="blob-1" />
      <div className="blob-2" />

      {/* ── Header ── */}
      <header className="app-header">
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          {/* Logo + title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 30, height: 30, borderRadius: 9, flexShrink: 0,
              background: 'linear-gradient(135deg, #5b5fef, #6366f1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 10px rgba(99,102,241,0.35)',
            }}>
              <Zap size={14} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontWeight: 700, fontSize: 15, color: 'var(--c-text)', letterSpacing: '-0.3px' }}>
              Daily Planner
            </span>
          </div>

          {/* Right side: summary + theme toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 11, color: 'var(--c-text4)', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span>{todayTasks} today</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span style={{ color: overdueCount > 0 ? 'var(--c-rose)' : 'var(--c-text4)' }}>
                {activeReminders} reminder{activeReminders !== 1 ? 's' : ''}
                {overdueCount > 0 ? ` (${overdueCount} overdue)` : ''}
              </span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>{activeGoals} goal{activeGoals !== 1 ? 's' : ''}</span>
            </span>

            {/* Theme toggle */}
            <button
              className="theme-toggle"
              onClick={toggle}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={theme}
                  initial={{ rotate: -30, opacity: 0, scale: 0.7 }}
                  animate={{ rotate: 0, opacity: 1, scale: 1 }}
                  exit={{ rotate: 30, opacity: 0, scale: 0.7 }}
                  transition={{ duration: 0.18 }}
                  style={{ display: 'flex' }}
                >
                  {theme === 'dark'
                    ? <Sun size={15} />
                    : <Moon size={15} />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <nav className="app-tabs">
        <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 16px', display: 'flex', overflowX: 'auto' }}>
          {([
            { key: 'daily' as Tab, label: 'Daily Log', icon: <CalendarDays size={15} />, badge: 0 },
            { key: 'reminders' as Tab, label: 'Reminders', icon: <Bell size={15} />, badge: overdueCount },
            { key: 'bucket' as Tab, label: 'Bucket List', icon: <Target size={15} />, badge: 0 },
          ]).map((t) => (
            <button
              key={t.key}
              className={`tab-nav-btn${tab === t.key ? ' active' : ''}`}
              onClick={() => setTab(t.key)}
            >
              <span style={{ opacity: tab === t.key ? 1 : 0.5 }}>{t.icon}</span>
              {t.label}
              {t.badge > 0 && <span className="notif-dot">{t.badge}</span>}
            </button>
          ))}
        </div>
      </nav>

      {/* ── Page content ── */}
      <main style={{ position: 'relative', zIndex: 1 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
          >
            <div className="app-container">
              {tab === 'daily' && <DailyLog />}
              {tab === 'reminders' && <Reminders />}
              {tab === 'bucket' && <BucketList />}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>

      <footer style={{ textAlign: 'center', padding: '16px', fontSize: 11, color: 'var(--c-text5)', borderTop: '1px solid var(--c-border)', position: 'relative', zIndex: 1 }}>
        All data saved locally in your browser · Daily Planner
      </footer>
    </div>
  )
}

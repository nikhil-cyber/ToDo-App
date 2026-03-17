import { motion } from 'framer-motion'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  accent?: 'violet' | 'emerald' | 'rose' | 'amber'
  icon?: React.ReactNode
  index?: number
}

const accentMap = {
  violet: 'text-indigo-400',
  emerald: 'text-emerald-400',
  rose: 'text-rose-400',
  amber: 'text-amber-400',
}

export function StatCard({ label, value, sub, accent = 'violet', icon, index = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="bg-[#0d1117] border border-slate-800/80 rounded-2xl p-4 flex items-center gap-3 min-w-0"
    >
      {icon && (
        <div className={cn('shrink-0 opacity-70', accentMap[accent])}>
          {icon}
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-600 mb-0.5">{label}</p>
        <p className={cn('text-xl font-bold font-display leading-none', accentMap[accent])}>
          {value}
          {sub && <span className="text-xs text-slate-500 font-normal ml-1">{sub}</span>}
        </p>
      </div>
    </motion.div>
  )
}

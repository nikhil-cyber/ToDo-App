import { cn } from '../../lib/utils'

type Variant = 'violet' | 'emerald' | 'rose' | 'amber' | 'sky' | 'gray'

const styles: Record<Variant, string> = {
  violet: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/25',
  emerald: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25',
  rose: 'bg-rose-500/15 text-rose-300 border-rose-500/25',
  amber: 'bg-amber-500/15 text-amber-300 border-amber-500/25',
  sky: 'bg-sky-500/15 text-sky-300 border-sky-500/25',
  gray: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
}

interface BadgeProps {
  variant?: Variant
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'gray', children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide border',
        styles[variant],
        className,
      )}
    >
      {children}
    </span>
  )
}

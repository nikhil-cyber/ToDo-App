import { cn } from '../../lib/utils'
import { motion } from 'framer-motion'

type Variant = 'primary' | 'success' | 'ghost' | 'danger' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const variantStyles: Record<Variant, string> = {
  primary:
    'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 border border-indigo-500/40',
  success:
    'bg-emerald-500/90 hover:bg-emerald-400 text-slate-900 shadow-lg shadow-emerald-500/20 border border-emerald-400/40',
  ghost:
    'bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-slate-200 border border-slate-700/50 hover:border-slate-600',
  danger:
    'bg-transparent hover:bg-rose-500/15 text-slate-500 hover:text-rose-400 border border-slate-700/50 hover:border-rose-500/40',
  outline:
    'bg-transparent hover:bg-slate-800/40 text-slate-300 border border-slate-600/60 hover:border-slate-500',
}

const sizeStyles: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs rounded-lg',
  md: 'px-4 py-2 text-sm rounded-xl',
  lg: 'px-6 py-2.5 text-sm rounded-xl',
}

interface ButtonProps {
  variant?: Variant
  size?: Size
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export function Button({ variant = 'primary', size = 'md', className, children, onClick, disabled, type = 'button' }: ButtonProps) {
  return (
    <motion.button
      type={type}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-semibold cursor-pointer transition-all duration-150 flex items-center gap-1.5 whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
    >
      {children}
    </motion.button>
  )
}

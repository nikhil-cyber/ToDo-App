import { cn } from '../../lib/utils'
import { forwardRef } from 'react'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, icon, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-slate-200 placeholder-slate-600',
              'focus:outline-none focus:border-indigo-500/60 focus:bg-slate-900/80 focus:ring-1 focus:ring-indigo-500/30',
              'transition-all duration-150',
              icon && 'pl-9',
              className,
            )}
            {...props}
          />
        </div>
      </div>
    )
  },
)

Input.displayName = 'Input'

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  children: React.ReactNode
}

export function Select({ label, children, className, ...props }: SelectProps) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="text-xs font-semibold uppercase tracking-widest text-slate-500">
          {label}
        </label>
      )}
      <select
        className={cn(
          'w-full bg-slate-900/60 border border-slate-700/60 rounded-xl px-3 py-2.5 text-sm text-slate-200',
          'focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/30',
          'transition-all duration-150 cursor-pointer',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </div>
  )
}

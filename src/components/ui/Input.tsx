import { forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
  rightElement?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, rightElement, className, id, ...rest }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-')
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-sm font-medium text-slate-300">{label}</label>
        )}
        <div className="relative flex items-center">
          {leftIcon && <span className="absolute left-3 text-slate-500 pointer-events-none">{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={clsx(
              'w-full bg-surface-800 border rounded-xl px-3 py-2 text-sm text-slate-100',
              'placeholder:text-slate-500 transition-colors duration-150',
              'border-surface-600 hover:border-surface-500',
              'focus:outline-none focus:border-accent-500 focus:ring-1 focus:ring-accent-500/50',
              error && 'border-danger-500',
              leftIcon && 'pl-10',
              rightElement && 'pr-10',
              className
            )}
            {...rest}
          />
          {rightElement && <span className="absolute right-2 flex items-center">{rightElement}</span>}
        </div>
        {error && <p className="text-xs text-danger-400">{error}</p>}
      </div>
    )
  }
)
Input.displayName = 'Input'

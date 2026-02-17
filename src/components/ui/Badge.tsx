import { clsx } from 'clsx'

type Color = 'default' | 'accent' | 'success' | 'warning' | 'danger'

interface BadgeProps { children: React.ReactNode; color?: Color; className?: string }

const colorMap: Record<Color, string> = {
  default: 'bg-surface-700 text-slate-300',
  accent: 'bg-accent-600/20 text-accent-400 border border-accent-500/30',
  success: 'bg-success-500/20 text-success-400 border border-success-500/30',
  warning: 'bg-warning-500/20 text-warning-400 border border-warning-500/30',
  danger: 'bg-danger-500/20 text-danger-400 border border-danger-500/30',
}

export function Badge({ children, color = 'default', className }: BadgeProps) {
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium', colorMap[color], className)}>
      {children}
    </span>
  )
}

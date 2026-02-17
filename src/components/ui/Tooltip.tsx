import * as React from 'react'
import { clsx } from 'clsx'

interface TooltipProps {
  content: string
  children: React.ReactElement
  side?: 'top' | 'bottom' | 'left' | 'right'
}

export function Tooltip({ content, children, side = 'top' }: TooltipProps) {
  const [visible, setVisible] = React.useState(false)
  const pos: Record<string, string> = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  }
  return (
    <span className="relative inline-flex"
      onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)} onBlur={() => setVisible(false)}>
      {children}
      {visible && (
        <span role="tooltip" className={clsx('absolute z-50 pointer-events-none whitespace-nowrap bg-surface-700 text-slate-200 text-xs px-2 py-1 rounded-lg shadow-lg border border-surface-600', pos[side])}>
          {content}
        </span>
      )}
    </span>
  )
}

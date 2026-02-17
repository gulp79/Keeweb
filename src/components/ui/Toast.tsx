import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useToastStore } from '@/hooks/useToast'
import type { ToastType } from '@/types'

const iconMap: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle size={16} className="text-success-400" />,
  error: <XCircle size={16} className="text-danger-400" />,
  warning: <AlertTriangle size={16} className="text-warning-400" />,
  info: <Info size={16} className="text-accent-400" />,
}

const borderMap: Record<ToastType, string> = {
  success: 'border-success-500/30',
  error: 'border-danger-500/30',
  warning: 'border-warning-500/30',
  info: 'border-accent-500/30',
}

export function ToastContainer() {
  const { toasts, remove } = useToastStore()
  return (
    <div aria-live="polite" aria-label="Notifications" className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={clsx('glass flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl animate-slide-in-up max-w-sm', borderMap[toast.type])}
          role="alert"
        >
          {iconMap[toast.type]}
          <span className="text-sm text-slate-200 flex-1">{toast.message}</span>
          <button onClick={() => remove(toast.id)} className="text-slate-500 hover:text-slate-300 transition-colors" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}

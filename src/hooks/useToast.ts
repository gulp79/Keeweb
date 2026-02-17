import { create } from 'zustand'
import type { Toast, ToastType } from '@/types'

interface ToastStore {
  toasts: Toast[]
  add: (type: ToastType, message: string, duration?: number) => void
  remove: (id: string) => void
}

export const useToastStore = create<ToastStore>()(set => ({
  toasts: [],
  add: (type, message, duration = 4000) => {
    const id = crypto.randomUUID()
    set(s => ({ toasts: [...s.toasts, { id, type, message, duration }] }))
    if (duration > 0) setTimeout(() => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })), duration)
  },
  remove: id => set(s => ({ toasts: s.toasts.filter(t => t.id !== id) })),
}))

export function useToast() {
  const { add } = useToastStore()
  return {
    success: (msg: string) => add('success', msg),
    error: (msg: string) => add('error', msg),
    warning: (msg: string) => add('warning', msg),
    info: (msg: string) => add('info', msg),
  }
}

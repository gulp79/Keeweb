import { useEffect, useRef } from 'react'
import { useDbStore } from '@/features/db/dbStore'
import { useSettingsStore } from '@/features/settings/settingsStore'

export function useAutoLock() {
  const { autoLockMinutes } = useSettingsStore()
  const { databases, lockDatabase } = useDbStore()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const resetTimer = () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      if (autoLockMinutes <= 0) return
      timerRef.current = setTimeout(() => {
        Object.keys(databases).forEach(id => lockDatabase(id))
      }, autoLockMinutes * 60 * 1000)
    }

    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'] as const
    events.forEach(e => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [autoLockMinutes, databases, lockDatabase])
}

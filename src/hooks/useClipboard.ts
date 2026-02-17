import { useCallback, useRef } from 'react'
import { useSettingsStore } from '@/features/settings/settingsStore'
import { useToast } from './useToast'

export function useClipboard() {
  const { clipboardClearSeconds } = useSettingsStore()
  const toast = useToast()
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const copy = useCallback(async (text: string, label = 'Value') => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
      if (timerRef.current) clearTimeout(timerRef.current)
      if (clipboardClearSeconds > 0) {
        timerRef.current = setTimeout(async () => {
          try {
            const current = await navigator.clipboard.readText()
            if (current === text) {
              await navigator.clipboard.writeText('')
              toast.info('Clipboard cleared')
            }
          } catch { /* permission denied - ignore */ }
        }, clipboardClearSeconds * 1000)
      }
    } catch {
      toast.error('Failed to copy to clipboard')
    }
  }, [clipboardClearSeconds, toast])

  return { copy }
}

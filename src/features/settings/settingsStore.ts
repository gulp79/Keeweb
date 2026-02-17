import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { AppSettings } from '@/types'

interface SettingsStore extends AppSettings {
  update: (partial: Partial<AppSettings>) => void
  reset: () => void
}

const defaults: AppSettings = {
  theme: 'dark',
  language: 'en',
  autoLockMinutes: 5,
  clipboardClearSeconds: 30,
  defaultKdf: 'argon2id',
  argon2Memory: 65536,
  argon2Iterations: 3,
  argon2Parallelism: 4,
  showPasswords: false,
  rememberLastFile: false,
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    immer(set => ({
      ...defaults,
      update: (partial: Partial<AppSettings>) =>
        set(state => { Object.assign(state, partial) }),
      reset: () => set(() => ({ ...defaults })),
    })),
    { name: 'kpw-settings' }
  )
)

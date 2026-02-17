import en from './locales/en.json'
import it from './locales/it.json'
import { useSettingsStore } from '@/features/settings/settingsStore'

type TranslationKey = keyof typeof en

const translations: Record<string, typeof en> = { en, it: it as typeof en }

export function useI18n() {
  const { language } = useSettingsStore()
  const t = translations[language] ?? en
  return {
    t: (key: TranslationKey, vars?: Record<string, string>): string => {
      let str: string = t[key] ?? en[key] ?? key
      if (vars) Object.entries(vars).forEach(([k, v]) => { str = str.replace(`{{${k}}}`, v) })
      return str
    },
  }
}

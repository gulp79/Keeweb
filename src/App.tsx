import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import UnlockPage from './routes/UnlockPage'
import DatabasePage from './routes/DatabasePage'
import SettingsPage from './routes/SettingsPage'
import { useSettingsStore } from './features/settings/settingsStore'
import { ToastContainer } from './components/ui/Toast'
import { useAutoLock } from './hooks/useAutoLock'

export default function App() {
  const { theme } = useSettingsStore()
  useAutoLock()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <div className="min-h-screen bg-surface-950 text-slate-100">
      <Routes>
        <Route path="/" element={<Navigate to="/unlock" replace />} />
        <Route path="/unlock" element={<UnlockPage />} />
        <Route path="/db/:id" element={<DatabasePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
      <ToastContainer />
    </div>
  )
}

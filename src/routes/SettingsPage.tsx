import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Sun, Shield, Key } from 'lucide-react'
import { useSettingsStore } from '@/features/settings/settingsStore'
import { Button } from '@/components/ui/Button'

export default function SettingsPage() {
  const navigate = useNavigate()
  const settings = useSettingsStore()

  return (
    <div className="min-h-screen bg-surface-950">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}><ArrowLeft size={16} /></Button>
          <h1 className="text-xl font-bold text-slate-100">Settings</h1>
        </div>

        <div className="space-y-6">
          <Section title="Appearance" icon={<Sun size={18} />}>
            <Row label="Theme">
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as const).map(t => (
                  <Btn key={t} active={settings.theme === t} onClick={() => settings.update({ theme: t })}>{t}</Btn>
                ))}
              </div>
            </Row>
            <Row label="Language">
              <div className="flex gap-2">
                {(['en', 'it'] as const).map(l => (
                  <Btn key={l} active={settings.language === l} onClick={() => settings.update({ language: l })}>{l.toUpperCase()}</Btn>
                ))}
              </div>
            </Row>
          </Section>

          <Section title="Security" icon={<Shield size={18} />}>
            <Row label="Auto-lock after (minutes, 0 = off)">
              <NumberInput value={settings.autoLockMinutes} min={0} max={120} onChange={v => settings.update({ autoLockMinutes: v })} />
            </Row>
            <Row label="Clipboard clear delay (seconds, 0 = off)">
              <NumberInput value={settings.clipboardClearSeconds} min={0} max={300} onChange={v => settings.update({ clipboardClearSeconds: v })} />
            </Row>
          </Section>

          <Section title="Key Derivation" icon={<Key size={18} />}>
            <Row label="Default KDF">
              <div className="flex gap-2">
                {(['argon2id', 'argon2d', 'aes'] as const).map(k => (
                  <Btn key={k} active={settings.defaultKdf === k} onClick={() => settings.update({ defaultKdf: k })}>{k}</Btn>
                ))}
              </div>
            </Row>
            <Row label="Argon2 Memory (KiB)">
              <NumberInput value={settings.argon2Memory} min={8192} max={1048576} step={4096} onChange={v => settings.update({ argon2Memory: v })} />
            </Row>
            <Row label="Argon2 Iterations">
              <NumberInput value={settings.argon2Iterations} min={1} max={20} onChange={v => settings.update({ argon2Iterations: v })} />
            </Row>
          </Section>

          <Button variant="danger" onClick={() => settings.reset()}>Reset to Defaults</Button>
        </div>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-surface-700">
        <span className="text-accent-400">{icon}</span>
        <h2 className="font-semibold text-slate-200">{title}</h2>
      </div>
      <div className="divide-y divide-surface-700/50">{children}</div>
    </div>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-slate-300">{label}</span>
      {children}
    </div>
  )
}

function Btn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-lg text-sm font-medium capitalize transition-all ${active ? 'bg-accent-600 text-white' : 'bg-surface-700 text-slate-300 hover:bg-surface-600'}`}>
      {children}
    </button>
  )
}

function NumberInput({ value, min, max, step = 1, onChange }: { value: number; min: number; max: number; step?: number; onChange: (v: number) => void }) {
  return (
    <input type="number" value={value} min={min} max={max} step={step}
      onChange={e => onChange(Number(e.target.value))}
      className="w-28 bg-surface-800 border border-surface-600 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-accent-500" />
  )
}

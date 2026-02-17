import { useState, useCallback } from 'react'
import { RefreshCw, Copy, Zap } from 'lucide-react'
import { clsx } from 'clsx'
import { generatePassword, estimateEntropy } from '@/features/crypto/passwordGenerator'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useClipboard } from '@/hooks/useClipboard'
import type { GeneratorOptions } from '@/types'

const defaults: GeneratorOptions = {
  length: 20, uppercase: true, lowercase: true, digits: true, symbols: true,
  excludeLookalikes: true, pronounceable: false, customChars: '',
}

interface GeneratorPanelProps { isOpen: boolean; onClose: () => void; onUse?: (password: string) => void }

export function GeneratorPanel({ isOpen, onClose, onUse }: GeneratorPanelProps) {
  const [opts, setOpts] = useState<GeneratorOptions>(defaults)
  const [password, setPassword] = useState(() => generatePassword(defaults))
  const { copy } = useClipboard()

  const regenerate = useCallback((newOpts: GeneratorOptions) => setPassword(generatePassword(newOpts)), [])

  const setOpt = <K extends keyof GeneratorOptions>(k: K, v: GeneratorOptions[K]) => {
    const next = { ...opts, [k]: v }
    setOpts(next)
    regenerate(next)
  }

  const entropy = estimateEntropy(password)
  const strengthLabel = entropy < 40 ? 'Weak' : entropy < 60 ? 'Fair' : entropy < 80 ? 'Strong' : 'Very Strong'
  const strengthColor = entropy < 40 ? 'bg-danger-500' : entropy < 60 ? 'bg-warning-400' : 'bg-success-400'
  const strengthPct = Math.min(100, (entropy / 100) * 100)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Password Generator" size="md">
      <div className="space-y-4">
        <div className="glass rounded-xl p-3 flex items-center gap-2">
          <code className="flex-1 font-mono text-sm text-accent-400 break-all select-all">{password}</code>
          <Button variant="ghost" size="sm" onClick={() => regenerate(opts)} aria-label="Regenerate"><RefreshCw size={14} /></Button>
          <Button variant="ghost" size="sm" onClick={() => void copy(password, 'Password')} aria-label="Copy"><Copy size={14} /></Button>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-400">Strength</span>
            <span className="text-slate-300">{strengthLabel} ({Math.round(entropy)} bits)</span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-700">
            <div className={clsx('h-full rounded-full transition-all', strengthColor)} style={{ width: `${strengthPct}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Length</span>
            <span className="text-sm text-accent-400 font-mono">{opts.length}</span>
          </div>
          <input type="range" min={8} max={64} value={opts.length}
            onChange={e => setOpt('length', Number(e.target.value))}
            className="w-full accent-accent-500" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {([
            ['uppercase', 'Uppercase (A-Z)'],
            ['lowercase', 'Lowercase (a-z)'],
            ['digits', 'Digits (0-9)'],
            ['symbols', 'Symbols (!@#…)'],
            ['excludeLookalikes', 'Exclude lookalikes'],
            ['pronounceable', 'Pronounceable'],
          ] as [keyof GeneratorOptions, string][]).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 cursor-pointer group">
              <input type="checkbox" checked={Boolean(opts[key])} onChange={e => setOpt(key, e.target.checked as GeneratorOptions[typeof key])}
                className="w-4 h-4 rounded accent-accent-500" />
              <span className="text-sm text-slate-300 group-hover:text-slate-100 transition-colors">{label}</span>
            </label>
          ))}
        </div>

        <div className="flex gap-2 pt-2">
          {onUse && (
            <Button className="flex-1" leftIcon={<Zap size={14} />} onClick={() => { onUse(password); onClose() }}>Use Password</Button>
          )}
          <Button variant="secondary" onClick={onClose}>Close</Button>
        </div>
      </div>
    </Modal>
  )
}

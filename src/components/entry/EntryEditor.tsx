import { useState, useEffect } from 'react'
import { Eye, EyeOff, Copy, ExternalLink, Plus, Trash2, X, Paperclip } from 'lucide-react'
import { clsx } from 'clsx'
import { useDbStore, selectActiveDb } from '@/features/db/dbStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useClipboard } from '@/hooks/useClipboard'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { KdbxEntry } from '@/types'

type Tab = 'general' | 'advanced' | 'attachments' | 'history'

export function EntryEditor() {
  const db = useDbStore(selectActiveDb)
  const { selectedEntryId, upsertEntry, markDirty } = useDbStore()
  const entry = selectedEntryId ? db?.entries[selectedEntryId] : null
  const [tab, setTab] = useState<Tab>('general')
  const [showPassword, setShowPassword] = useState(false)
  const [localEntry, setLocalEntry] = useState<KdbxEntry | null>(null)
  const { copy } = useClipboard()

  useEffect(() => {
    setLocalEntry(entry ? structuredClone(entry) : null)
    setShowPassword(false)
    setTab('general')
  }, [selectedEntryId])

  if (!entry || !localEntry || !db) {
    return (
      <div className="flex items-center justify-center h-full bg-surface-900/30">
        <p className="text-sm text-slate-600">Select an entry to view details</p>
      </div>
    )
  }

  const setField = (key: string, value: string) =>
    setLocalEntry(prev => prev ? { ...prev, fields: { ...prev.fields, [key]: { ...prev.fields[key], value } } } : prev)

  const handleSave = () => {
    if (!localEntry) return
    const updated: KdbxEntry = {
      ...localEntry,
      times: { ...localEntry.times, lastModTime: new Date() },
      history: [...(localEntry.history ?? []), { lastModTime: entry.times.lastModTime, fields: entry.fields }],
    }
    upsertEntry(db.id, updated)
    markDirty(db.id)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'general', label: 'General' },
    { id: 'advanced', label: 'Custom Fields' },
    { id: 'attachments', label: `Attachments${localEntry.attachments.length ? ` (${localEntry.attachments.length})` : ''}` },
    { id: 'history', label: `History${localEntry.history.length ? ` (${localEntry.history.length})` : ''}` },
  ]

  return (
    <div className="flex flex-col h-full bg-surface-900">
      <div className="flex border-b border-surface-700 px-4 flex-shrink-0">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={clsx('px-4 py-3 text-sm font-medium border-b-2 -mb-px transition-colors',
              tab === t.id ? 'border-accent-500 text-accent-400' : 'border-transparent text-slate-400 hover:text-slate-200')}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin p-4">
        {tab === 'general' && (
          <div className="space-y-4">
            <Input label="Title" value={localEntry.fields['Title']?.value ?? ''} onChange={e => setField('Title', e.target.value)} />
            <div className="flex gap-2 items-end">
              <div className="flex-1"><Input label="Username" value={localEntry.fields['UserName']?.value ?? ''} onChange={e => setField('UserName', e.target.value)} /></div>
              <Button variant="ghost" size="sm" onClick={() => void copy(localEntry.fields['UserName']?.value ?? '', 'Username')} aria-label="Copy username"><Copy size={15} /></Button>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <Input label="Password" type={showPassword ? 'text' : 'password'} value={localEntry.fields['Password']?.value ?? ''} onChange={e => setField('Password', e.target.value)}
                  rightElement={<button type="button" onClick={() => setShowPassword(p => !p)} className="p-1 text-slate-400 hover:text-slate-200 transition-colors" aria-label="Toggle password">
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>} />
              </div>
              <Button variant="ghost" size="sm" onClick={() => void copy(localEntry.fields['Password']?.value ?? '', 'Password')} aria-label="Copy password"><Copy size={15} /></Button>
            </div>
            <div className="flex gap-2 items-end">
              <div className="flex-1"><Input label="URL" type="url" value={localEntry.fields['URL']?.value ?? ''} onChange={e => setField('URL', e.target.value)} /></div>
              {localEntry.fields['URL']?.value && (
                <Button variant="ghost" size="sm" onClick={() => window.open(localEntry.fields['URL'].value, '_blank', 'noopener,noreferrer')} aria-label="Open URL"><ExternalLink size={15} /></Button>
              )}
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-slate-300">Notes</label>
              </div>
              <textarea value={localEntry.fields['Notes']?.value ?? ''} onChange={e => setField('Notes', e.target.value)}
                rows={5} placeholder="Notes (Markdown supported)"
                className="w-full bg-surface-800 border border-surface-600 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 resize-y focus:outline-none focus:border-accent-500 font-mono" />
            </div>
          </div>
        )}

        {tab === 'advanced' && (
          <div className="space-y-3">
            {Object.entries(localEntry.fields)
              .filter(([k]) => !['Title','UserName','Password','URL','Notes'].includes(k))
              .map(([key, field]) => (
                <div key={key} className="flex gap-2 items-end">
                  <div className="flex-1"><Input label="Key" value={key} readOnly /></div>
                  <div className="flex-1"><Input label="Value" value={field.value}
                    onChange={e => setLocalEntry(prev => prev ? { ...prev, fields: { ...prev.fields, [key]: { ...field, value: e.target.value } } } : prev)} /></div>
                  <Button variant="danger" size="sm" onClick={() => {
                    const { [key]: _, ...rest } = localEntry.fields
                    setLocalEntry({ ...localEntry, fields: rest })
                  }} aria-label="Remove"><Trash2 size={14} /></Button>
                </div>
              ))}
            <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={() => {
              const k = `Field ${Object.keys(localEntry.fields).length + 1}`
              setLocalEntry({ ...localEntry, fields: { ...localEntry.fields, [k]: { value: '', protected: false } } })
            }}>Add Field</Button>
          </div>
        )}

        {tab === 'attachments' && (
          <div className="space-y-3">
            {localEntry.attachments.length === 0
              ? <p className="text-sm text-slate-500 text-center py-8">No attachments</p>
              : localEntry.attachments.map(att => (
                <div key={att.id} className="flex items-center gap-3 glass rounded-xl p-3">
                  <Paperclip size={15} className="text-slate-400 flex-shrink-0" />
                  <span className="flex-1 text-sm text-slate-200 truncate">{att.name}</span>
                  <span className="text-xs text-slate-500">{(att.data.byteLength / 1024).toFixed(1)} KB</span>
                  <Button variant="ghost" size="sm" onClick={() => {
                    const blob = new Blob([att.data])
                    const url = URL.createObjectURL(blob)
                    const a = document.createElement('a'); a.href = url; a.download = att.name
                    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url)
                  }}>Download</Button>
                  <Button variant="danger" size="sm" onClick={() => setLocalEntry({ ...localEntry, attachments: localEntry.attachments.filter(a => a.id !== att.id) })} aria-label="Remove"><X size={14} /></Button>
                </div>
              ))}
            <Button variant="secondary" size="sm" leftIcon={<Plus size={14} />} onClick={() => {
              const input = document.createElement('input'); input.type = 'file'; input.multiple = true
              input.onchange = async () => {
                const files = Array.from(input.files ?? [])
                const newAtts = await Promise.all(files.map(async f => ({ id: crypto.randomUUID(), name: f.name, data: await f.arrayBuffer() })))
                setLocalEntry(prev => prev ? { ...prev, attachments: [...prev.attachments, ...newAtts] } : prev)
              }
              input.click()
            }}>Add Attachment</Button>
          </div>
        )}

        {tab === 'history' && (
          <div className="space-y-3">
            {localEntry.history.length === 0
              ? <p className="text-sm text-slate-500 text-center py-8">No history</p>
              : [...localEntry.history].reverse().map((snap, i) => (
                <div key={i} className="glass rounded-xl p-3">
                  <p className="text-xs text-slate-500 mb-1">{snap.lastModTime.toLocaleString()}</p>
                  <p className="text-sm text-slate-300">{snap.fields['Title']?.value ?? 'Untitled'}</p>
                </div>
              ))}
          </div>
        )}
      </div>

      <div className="flex-shrink-0 px-4 py-3 border-t border-surface-700 flex gap-2 justify-end">
        <Button variant="secondary" size="sm" onClick={() => setLocalEntry(structuredClone(entry))}>Discard</Button>
        <Button size="sm" onClick={handleSave}>Save Entry</Button>
      </div>
    </div>
  )
}

import { useRef, useEffect } from 'react'
import { Search, Key, Lock, Save, Wand2 } from 'lucide-react'
import { useDbStore, selectActiveDb } from '@/features/db/dbStore'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Tooltip } from '@/components/ui/Tooltip'
import { useToast } from '@/hooks/useToast'
import { saveDatabase } from '@/features/crypto/kdbxAdapter'
import { localStorageProvider } from '@/features/storage/localStorageProvider'
import { useNavigate } from 'react-router-dom'

interface TopBarProps { onOpenGenerator: () => void }

export function TopBar({ onOpenGenerator }: TopBarProps) {
  const db = useDbStore(selectActiveDb)
  const { setSearchQuery, searchQuery, lockDatabase } = useDbStore()
  const toast = useToast()
  const searchRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') { e.preventDefault(); searchRef.current?.focus() }
      if ((e.ctrlKey || e.metaKey) && e.key === 's') { e.preventDefault(); void handleSave() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const handleSave = async () => {
    if (!db?.raw) return
    try {
      const buffer = await saveDatabase(db.raw)
      await localStorageProvider.saveFile(buffer, `${db.name}.kdbx`, db.fileHandle)
      toast.success('Database saved')
    } catch { toast.error('Failed to save database') }
  }

  const handleLock = () => {
    if (db) { lockDatabase(db.id); navigate('/unlock') }
  }

  return (
    <header className="h-14 flex items-center gap-3 px-4 bg-surface-900 border-b border-surface-700 flex-shrink-0">
      <div className="flex items-center gap-2 mr-2">
        <Key size={20} className="text-accent-400" />
        <span className="font-semibold text-slate-200 truncate max-w-[160px]">{db?.name ?? 'KeePass Web'}</span>
        {db?.isDirty && <span className="w-2 h-2 rounded-full bg-warning-400 flex-shrink-0" title="Unsaved changes" />}
      </div>
      <div className="flex-1 max-w-md">
        <Input ref={searchRef} placeholder="Search entries… (Ctrl+F)" leftIcon={<Search size={15} />}
          value={searchQuery} onChange={e => setSearchQuery(e.target.value)} aria-label="Search entries" />
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Tooltip content="Password Generator">
          <Button variant="ghost" size="sm" onClick={onOpenGenerator} aria-label="Password generator"><Wand2 size={16} /></Button>
        </Tooltip>
        <Tooltip content="Save (Ctrl+S)">
          <Button variant="secondary" size="sm" onClick={() => void handleSave()} disabled={!db?.isDirty}>
            <Save size={15} /> Save
          </Button>
        </Tooltip>
        <Tooltip content="Lock Database">
          <Button variant="ghost" size="sm" onClick={handleLock} aria-label="Lock database"><Lock size={16} /></Button>
        </Tooltip>
      </div>
    </header>
  )
}

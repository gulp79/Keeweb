import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useDbStore, selectActiveDb } from '@/features/db/dbStore'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { EntryList } from '@/components/entry/EntryList'
import { EntryEditor } from '@/components/entry/EntryEditor'
import { GeneratorPanel } from '@/components/generator/GeneratorPanel'
import { Button } from '@/components/ui/Button'
import { Plus } from 'lucide-react'
import type { KdbxEntry } from '@/types'

export default function DatabasePage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { setActiveDb, upsertEntry, markDirty, selectedGroupId, setSelectedEntry } = useDbStore()
  const db = useDbStore(selectActiveDb)
  const [generatorOpen, setGeneratorOpen] = useState(false)

  useEffect(() => { if (id) setActiveDb(id) }, [id, setActiveDb])

  useEffect(() => {
    if (!db || db.isLocked) navigate('/unlock')
  }, [db, navigate])

  const handleNewEntry = useCallback(() => {
    if (!db || !selectedGroupId) return
    const newEntry: KdbxEntry = {
      id: crypto.randomUUID(),
      groupId: selectedGroupId,
      iconId: 0,
      tags: [],
      times: { creationTime: new Date(), lastModTime: new Date(), lastAccessTime: new Date(), expires: false },
      fields: {
        Title: { value: 'New Entry', protected: false },
        UserName: { value: '', protected: false },
        Password: { value: '', protected: true },
        URL: { value: '', protected: false },
        Notes: { value: '', protected: false },
      },
      attachments: [],
      history: [],
    }
    upsertEntry(db.id, newEntry)
    markDirty(db.id)
    setSelectedEntry(newEntry.id)
  }, [db, selectedGroupId, upsertEntry, markDirty, setSelectedEntry])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') { e.preventDefault(); handleNewEntry() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleNewEntry])

  if (!db || db.isLocked) return null

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopBar onOpenGenerator={() => setGeneratorOpen(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="w-80 flex-shrink-0 border-r border-surface-700 flex flex-col overflow-hidden bg-surface-900/50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-surface-700 flex-shrink-0">
            <span className="text-sm font-medium text-slate-400">Entries</span>
            <Button size="sm" variant="ghost" onClick={handleNewEntry} disabled={!selectedGroupId} aria-label="New entry (Ctrl+N)">
              <Plus size={16} />
            </Button>
          </div>
          <EntryList />
        </div>
        <div className="flex-1 overflow-hidden">
          <EntryEditor />
        </div>
      </div>
      <GeneratorPanel isOpen={generatorOpen} onClose={() => setGeneratorOpen(false)} />
    </div>
  )
}

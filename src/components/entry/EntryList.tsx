import { useMemo } from 'react'
import { Globe, User } from 'lucide-react'
import { clsx } from 'clsx'
import { useDbStore, selectActiveDb, selectActiveEntries } from '@/features/db/dbStore'
import { useFuzzySearch } from '@/hooks/useFuzzySearch'
import { Badge } from '@/components/ui/Badge'
import { formatDistanceToNow } from 'date-fns'
import type { KdbxEntry } from '@/types'

export function EntryList() {
  const db = useDbStore(selectActiveDb)
  const { searchQuery, selectedEntryId, setSelectedEntry } = useDbStore()
  const allEntries = useDbStore(selectActiveEntries)
  const filteredEntries = useFuzzySearch(allEntries, searchQuery)

  if (!db) return null

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="px-4 py-2.5 border-b border-surface-700 flex-shrink-0">
        <span className="text-xs text-slate-500">{filteredEntries.length} {filteredEntries.length === 1 ? 'entry' : 'entries'}</span>
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {filteredEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-center p-8">
            <p className="text-sm text-slate-500">{searchQuery ? 'No results for your search' : 'No entries here'}</p>
          </div>
        ) : (
          filteredEntries.map(entry => (
            <EntryRow key={entry.id} entry={entry} isSelected={selectedEntryId === entry.id} onSelect={() => setSelectedEntry(entry.id)} />
          ))
        )}
      </div>
    </div>
  )
}

function EntryRow({ entry, isSelected, onSelect }: { entry: KdbxEntry; isSelected: boolean; onSelect: () => void }) {
  const title = entry.fields['Title']?.value ?? 'Untitled'
  const username = entry.fields['UserName']?.value ?? ''
  const url = entry.fields['URL']?.value ?? ''
  const favicon = useMemo(() => {
    try { if (url) return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}&sz=32` } catch { /* invalid URL */ }
    return null
  }, [url])

  return (
    <button onClick={onSelect}
      className={clsx('w-full flex items-center gap-3 px-4 py-3 text-left transition-colors border-b border-surface-800 hover:bg-surface-800/60',
        isSelected && 'bg-accent-600/10 border-l-2 border-l-accent-500')}
      aria-pressed={isSelected}>
      <div className="w-8 h-8 rounded-lg bg-surface-700 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {favicon
          ? <img src={favicon} alt="" className="w-4 h-4" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
          : <Globe size={15} className="text-slate-500" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-medium text-slate-100 truncate">{title}</span>
          {entry.tags.slice(0, 2).map(tag => <Badge key={tag} color="accent" className="hidden sm:inline-flex">{tag}</Badge>)}
        </div>
        {username && (
          <div className="flex items-center gap-1 mt-0.5">
            <User size={11} className="text-slate-600" />
            <span className="text-xs text-slate-500 truncate">{username}</span>
          </div>
        )}
      </div>
      <span className="flex-shrink-0 text-xs text-slate-600">{formatDistanceToNow(entry.times.lastModTime, { addSuffix: true })}</span>
    </button>
  )
}

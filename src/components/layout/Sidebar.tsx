import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder, FolderOpen, Settings } from 'lucide-react'
import { clsx } from 'clsx'
import { useDbStore, selectActiveDb } from '@/features/db/dbStore'
import type { KdbxGroup } from '@/types'

export function Sidebar() {
  const db = useDbStore(selectActiveDb)
  const { setSelectedGroup, selectedGroupId } = useDbStore()

  if (!db || db.isLocked) return null

  return (
    <aside className="w-64 flex-shrink-0 bg-surface-900 border-r border-surface-700 flex flex-col h-full overflow-hidden">
      <div className="px-3 py-4 flex-1 overflow-y-auto scrollbar-thin">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Groups</h2>
        <GroupTree groupId={db.rootGroupId} groups={db.groups} selectedGroupId={selectedGroupId} onSelect={setSelectedGroup} depth={0} />
      </div>
      <div className="p-3 border-t border-surface-700 flex-shrink-0">
        <a href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-slate-200 hover:bg-surface-700/60 transition-colors">
          <Settings size={15} /> Settings
        </a>
      </div>
    </aside>
  )
}

interface GroupTreeProps {
  groupId: string
  groups: Record<string, KdbxGroup>
  selectedGroupId: string | null
  onSelect: (id: string) => void
  depth: number
}

function GroupTree({ groupId, groups, selectedGroupId, onSelect, depth }: GroupTreeProps) {
  const group = groups[groupId]
  const [expanded, setExpanded] = useState(true)
  if (!group) return null
  const hasChildren = group.children.length > 0

  return (
    <div>
      <button
        onClick={() => { onSelect(groupId); if (hasChildren) setExpanded(e => !e) }}
        className={clsx(
          'w-full flex items-center gap-2 py-1.5 rounded-lg text-sm transition-colors hover:bg-surface-700/70',
          selectedGroupId === groupId && 'bg-accent-600/20 text-accent-400'
        )}
        style={{ paddingLeft: `${8 + depth * 16}px`, paddingRight: '8px' }}
        aria-expanded={hasChildren ? expanded : undefined}
      >
        {hasChildren
          ? expanded ? <ChevronDown size={13} className="flex-shrink-0 text-slate-500" /> : <ChevronRight size={13} className="flex-shrink-0 text-slate-500" />
          : <span className="w-[13px]" />}
        {expanded ? <FolderOpen size={14} className="flex-shrink-0 text-accent-400" /> : <Folder size={14} className="flex-shrink-0 text-slate-500" />}
        <span className="truncate flex-1 text-left">{group.name}</span>
        <span className="text-xs text-slate-600 flex-shrink-0">{group.entries.length}</span>
      </button>
      {expanded && hasChildren && group.children.map(childId => (
        <GroupTree key={childId} groupId={childId} groups={groups} selectedGroupId={selectedGroupId} onSelect={onSelect} depth={depth + 1} />
      ))}
    </div>
  )
}

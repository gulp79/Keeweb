import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import type { DatabaseState, KdbxEntry, KdbxGroup } from '@/types'

interface DbStore {
  databases: Record<string, DatabaseState>
  activeDbId: string | null
  selectedGroupId: string | null
  selectedEntryId: string | null
  searchQuery: string
  addDatabase: (db: DatabaseState) => void
  removeDatabase: (id: string) => void
  setActiveDb: (id: string | null) => void
  setSelectedGroup: (id: string | null) => void
  setSelectedEntry: (id: string | null) => void
  setSearchQuery: (q: string) => void
  markDirty: (dbId: string) => void
  upsertGroup: (dbId: string, group: KdbxGroup) => void
  deleteGroup: (dbId: string, groupId: string) => void
  upsertEntry: (dbId: string, entry: KdbxEntry) => void
  deleteEntry: (dbId: string, entryId: string) => void
  lockDatabase: (dbId: string) => void
  unlockDatabase: (dbId: string, db: DatabaseState) => void
}

export const useDbStore = create<DbStore>()(
  immer(set => ({
    databases: {},
    activeDbId: null,
    selectedGroupId: null,
    selectedEntryId: null,
    searchQuery: '',

    addDatabase: db =>
      set(state => { state.databases[db.id] = db }),

    removeDatabase: id =>
      set(state => {
        delete state.databases[id]
        if (state.activeDbId === id) {
          const remaining = Object.keys(state.databases)
          state.activeDbId = remaining[0] ?? null
        }
      }),

    setActiveDb: id => set(state => { state.activeDbId = id }),
    setSelectedGroup: id => set(state => { state.selectedGroupId = id }),
    setSelectedEntry: id => set(state => { state.selectedEntryId = id }),
    setSearchQuery: q => set(state => { state.searchQuery = q }),

    markDirty: dbId =>
      set(state => { if (state.databases[dbId]) state.databases[dbId].isDirty = true }),

    upsertGroup: (dbId, group) =>
      set(state => { if (state.databases[dbId]) state.databases[dbId].groups[group.id] = group }),

    deleteGroup: (dbId, groupId) =>
      set(state => { if (state.databases[dbId]) delete state.databases[dbId].groups[groupId] }),

    upsertEntry: (dbId, entry) =>
      set(state => {
        if (!state.databases[dbId]) return
        state.databases[dbId].entries[entry.id] = entry
        const group = state.databases[dbId].groups[entry.groupId]
        if (group && !group.entries.includes(entry.id)) {
          group.entries.push(entry.id)
        }
      }),

    deleteEntry: (dbId, entryId) =>
      set(state => { if (state.databases[dbId]) delete state.databases[dbId].entries[entryId] }),

    lockDatabase: dbId =>
      set(state => {
        if (state.databases[dbId]) {
          state.databases[dbId].isLocked = true
          state.databases[dbId].raw = undefined
          state.databases[dbId].groups = {}
          state.databases[dbId].entries = {}
        }
      }),

    unlockDatabase: (dbId, db) =>
      set(state => { state.databases[dbId] = db }),
  }))
)

export const selectActiveDb = (s: DbStore) =>
  s.activeDbId ? s.databases[s.activeDbId] : null

export const selectActiveEntries = (s: DbStore): KdbxEntry[] => {
  const db = selectActiveDb(s)
  if (!db) return []
  if (s.searchQuery) return Object.values(db.entries)
  if (!s.selectedGroupId) return []
  return (db.groups[s.selectedGroupId]?.entries ?? [])
    .map(id => db.entries[id])
    .filter((e): e is KdbxEntry => Boolean(e))
}

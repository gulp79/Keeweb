import { describe, it, expect, beforeEach } from 'vitest'
import { useDbStore } from '@/features/db/dbStore'
import type { DatabaseState } from '@/types'

const makeDb = (id: string): DatabaseState => ({
  id, name: 'Test DB', isLocked: false, isDirty: false,
  groups: { root: { id: 'root', name: 'Root', notes: '', iconId: 0, parentId: null, children: [], entries: [], isExpanded: true, times: { creationTime: new Date(), lastModTime: new Date(), lastAccessTime: new Date(), expires: false } } },
  entries: {}, rootGroupId: 'root',
})

describe('dbStore', () => {
  beforeEach(() => {
    useDbStore.setState({ databases: {}, activeDbId: null, selectedGroupId: null, selectedEntryId: null, searchQuery: '' })
  })

  it('adds a database', () => {
    useDbStore.getState().addDatabase(makeDb('db1'))
    expect(useDbStore.getState().databases['db1']).toBeDefined()
  })

  it('removes a database', () => {
    useDbStore.getState().addDatabase(makeDb('db1'))
    useDbStore.getState().removeDatabase('db1')
    expect(useDbStore.getState().databases['db1']).toBeUndefined()
  })

  it('locks a database and clears sensitive data', () => {
    useDbStore.getState().addDatabase(makeDb('db1'))
    useDbStore.getState().lockDatabase('db1')
    const db = useDbStore.getState().databases['db1']
    expect(db.isLocked).toBe(true)
    expect(Object.keys(db.groups)).toHaveLength(0)
    expect(db.raw).toBeUndefined()
  })

  it('marks database as dirty', () => {
    useDbStore.getState().addDatabase(makeDb('db1'))
    useDbStore.getState().markDirty('db1')
    expect(useDbStore.getState().databases['db1'].isDirty).toBe(true)
  })

  it('sets active db and selected group', () => {
    useDbStore.getState().addDatabase(makeDb('db1'))
    useDbStore.getState().setActiveDb('db1')
    useDbStore.getState().setSelectedGroup('root')
    expect(useDbStore.getState().activeDbId).toBe('db1')
    expect(useDbStore.getState().selectedGroupId).toBe('root')
  })
})

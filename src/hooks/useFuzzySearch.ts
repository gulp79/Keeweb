import { useMemo } from 'react'
import Fuse from 'fuse.js'
import type { KdbxEntry } from '@/types'

export function useFuzzySearch(entries: KdbxEntry[], query: string): KdbxEntry[] {
  const fuse = useMemo(
    () => new Fuse(entries, {
      keys: [
        { name: 'fields.Title.value', weight: 2 },
        { name: 'fields.UserName.value', weight: 1.5 },
        { name: 'fields.URL.value', weight: 1 },
        { name: 'fields.Notes.value', weight: 0.5 },
        { name: 'tags', weight: 0.8 },
      ],
      threshold: 0.35,
      includeScore: true,
    }),
    [entries]
  )
  return useMemo(() => {
    if (!query.trim()) return entries
    return fuse.search(query).map(r => r.item)
  }, [fuse, query, entries])
}

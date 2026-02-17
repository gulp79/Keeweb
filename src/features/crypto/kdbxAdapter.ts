/**
 * kdbxweb adapter — all crypto stays 100% client-side.
 * Uses kdbxweb for KDBX read/write, argon2-browser for Argon2 KDF,
 * and WebCrypto for randomness.
 */
import * as kdbxweb from 'kdbxweb'
import type { DatabaseState, KdbxEntry, KdbxField, KdbxGroup, KdbxAttachment } from '@/types'

// Inject Argon2 into kdbxweb
// eslint-disable-next-line @typescript-eslint/no-explicit-any
;(kdbxweb.CryptoEngine as any).argon2 = async (
  password: ArrayBuffer,
  salt: ArrayBuffer,
  memory: number,
  iterations: number,
  length: number,
  parallelism: number,
  type: number,
  _version: number
): Promise<ArrayBuffer> => {
  const argon2 = await import('argon2-browser')
  const result = await argon2.hash({
    pass: new Uint8Array(password),
    salt: new Uint8Array(salt),
    mem: memory,
    time: iterations,
    hashLen: length,
    parallelism,
    type: type as 0 | 1 | 2,
  })
  return result.hash.buffer as ArrayBuffer
}

function buildCredentials(password: string, keyFileBuffer?: ArrayBuffer): kdbxweb.Credentials {
  const pwdProtected = kdbxweb.ProtectedValue.fromString(password)
  if (keyFileBuffer) return new kdbxweb.Credentials(pwdProtected, keyFileBuffer)
  return new kdbxweb.Credentials(pwdProtected)
}

export async function openDatabase(
  buffer: ArrayBuffer,
  password: string,
  keyFileBuffer?: ArrayBuffer
): Promise<DatabaseState> {
  const credentials = buildCredentials(password, keyFileBuffer)
  const db = await kdbxweb.Kdbx.load(buffer, credentials)
  return kdbxToState(db)
}

export async function createDatabase(
  name: string,
  password: string,
  keyFileBuffer?: ArrayBuffer
): Promise<{ state: DatabaseState; buffer: ArrayBuffer }> {
  const credentials = buildCredentials(password, keyFileBuffer)
  const db = kdbxweb.Kdbx.create(credentials, name)
  db.upgrade()
  const state = kdbxToState(db)
  const buf = await db.save()
  return { state, buffer: buf as ArrayBuffer }
}

export async function saveDatabase(rawDb: unknown): Promise<ArrayBuffer> {
  const db = rawDb as kdbxweb.Kdbx
  const buf = await db.save()
  return buf as ArrayBuffer
}

function generateHexId(): string {
  const bytes = new Uint8Array(16)
  crypto.getRandomValues(bytes)
  return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('')
}

function kdbxToState(db: kdbxweb.Kdbx): DatabaseState {
  const id = generateHexId()
  const groups: Record<string, KdbxGroup> = {}
  const entries: Record<string, KdbxEntry> = {}

  function processGroup(kdbxGroup: kdbxweb.KdbxGroup, parentId: string | null): string {
    const groupId = kdbxGroup.uuid.toString()
    const childGroupIds: string[] = []
    const entryIds: string[] = []

    for (const child of kdbxGroup.groups) {
      childGroupIds.push(processGroup(child, groupId))
    }
    for (const kEntry of kdbxGroup.entries) {
      const entryId = kEntry.uuid.toString()
      entryIds.push(entryId)
      entries[entryId] = kdbxEntryToState(kEntry, groupId)
    }

    groups[groupId] = {
      id: groupId,
      name: kdbxGroup.name ?? 'Group',
      notes: kdbxGroup.notes ?? '',
      iconId: kdbxGroup.icon ?? 0,
      parentId,
      children: childGroupIds,
      entries: entryIds,
      isExpanded: true,
      times: {
        creationTime: kdbxGroup.times.creationTime ?? new Date(),
        lastModTime: kdbxGroup.times.lastModTime ?? new Date(),
        lastAccessTime: kdbxGroup.times.lastAccessTime ?? new Date(),
        expiryTime: kdbxGroup.times.expiryTime,
        expires: kdbxGroup.times.expires ?? false,
      },
    }
    return groupId
  }

  const rootGroupId = processGroup(db.getDefaultGroup(), null)
  return {
    id,
    name: db.meta.name ?? 'Database',
    isLocked: false,
    isDirty: false,
    groups,
    entries,
    rootGroupId,
    recycleBinGroupId: db.meta.recycleBinUuid?.toString(),
    raw: db,
  }
}

function kdbxEntryToState(kEntry: kdbxweb.KdbxEntry, groupId: string): KdbxEntry {
  const fields: Record<string, KdbxField> = {}
  kEntry.fields.forEach((value, key) => {
    fields[key] = {
      value: value instanceof kdbxweb.ProtectedValue ? value.getText() : (value ?? ''),
      protected: value instanceof kdbxweb.ProtectedValue,
    }
  })

  const attachments: KdbxAttachment[] = []
  kEntry.binaries.forEach((ref, name) => {
    if (ref && 'value' in ref && ref.value instanceof ArrayBuffer) {
      attachments.push({ id: generateHexId(), name, data: ref.value })
    }
  })

  return {
    id: kEntry.uuid.toString(),
    groupId,
    iconId: kEntry.icon ?? 0,
    foregroundColor: kEntry.fgColor,
    backgroundColor: kEntry.bgColor,
    tags: kEntry.tags ?? [],
    times: {
      creationTime: kEntry.times.creationTime ?? new Date(),
      lastModTime: kEntry.times.lastModTime ?? new Date(),
      lastAccessTime: kEntry.times.lastAccessTime ?? new Date(),
      expiryTime: kEntry.times.expiryTime,
      expires: kEntry.times.expires ?? false,
    },
    fields,
    attachments,
    history: [],
  }
}

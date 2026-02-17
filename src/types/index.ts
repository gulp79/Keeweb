export interface KdbxGroup {
  id: string
  name: string
  notes: string
  iconId: number
  parentId: string | null
  children: string[]
  entries: string[]
  isExpanded: boolean
  times: KdbxTimes
}

export interface KdbxEntry {
  id: string
  groupId: string
  iconId: number
  foregroundColor?: string
  backgroundColor?: string
  tags: string[]
  times: KdbxTimes
  fields: Record<string, KdbxField>
  attachments: KdbxAttachment[]
  history: KdbxEntrySnapshot[]
  autoType?: KdbxAutoType
}

export interface KdbxField {
  value: string
  protected: boolean
}

export interface KdbxAttachment {
  id: string
  name: string
  data: ArrayBuffer
}

export interface KdbxTimes {
  creationTime: Date
  lastModTime: Date
  lastAccessTime: Date
  expiryTime?: Date
  expires: boolean
}

export interface KdbxEntrySnapshot {
  lastModTime: Date
  fields: Record<string, KdbxField>
}

export interface KdbxAutoType {
  enabled: boolean
  sequence: string
}

export interface DatabaseState {
  id: string
  name: string
  filePath?: string
  fileHandle?: FileSystemFileHandle
  isLocked: boolean
  isDirty: boolean
  groups: Record<string, KdbxGroup>
  entries: Record<string, KdbxEntry>
  rootGroupId: string
  recycleBinGroupId?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw?: any
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system'
  language: 'en' | 'it'
  autoLockMinutes: number
  clipboardClearSeconds: number
  defaultKdf: 'argon2d' | 'argon2id' | 'aes'
  argon2Memory: number
  argon2Iterations: number
  argon2Parallelism: number
  showPasswords: boolean
  rememberLastFile: boolean
}

export interface GeneratorOptions {
  length: number
  uppercase: boolean
  lowercase: boolean
  digits: boolean
  symbols: boolean
  excludeLookalikes: boolean
  pronounceable: boolean
  customChars: string
}

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

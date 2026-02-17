export interface StorageProvider {
  id: string
  name: string
  canRead: () => boolean
  openFile: () => Promise<{ buffer: ArrayBuffer; name: string; handle?: FileSystemFileHandle } | null>
  saveFile: (buffer: ArrayBuffer, name: string, handle?: FileSystemFileHandle) => Promise<FileSystemFileHandle | undefined>
}

export const localStorageProvider: StorageProvider = {
  id: 'local',
  name: 'Local File',
  canRead: () => true,

  async openFile() {
    if ('showOpenFilePicker' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const [handle] = await (window as any).showOpenFilePicker({
          types: [{ description: 'KeePass Database', accept: { 'application/octet-stream': ['.kdbx'] } }],
          multiple: false,
        })
        const file = await handle.getFile()
        return { buffer: await file.arrayBuffer(), name: file.name, handle }
      } catch (err) {
        if ((err as Error).name === 'AbortError') return null
        throw err
      }
    }
    return new Promise(resolve => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.kdbx'
      input.onchange = async () => {
        const file = input.files?.[0]
        if (!file) { resolve(null); return }
        resolve({ buffer: await file.arrayBuffer(), name: file.name })
      }
      input.onclick = () => { setTimeout(() => { if (!input.files?.length) resolve(null) }, 60000) }
      input.click()
    })
  },

  async saveFile(buffer, name, handle) {
    if (handle) {
      try {
        const writable = await handle.createWritable()
        await writable.write(buffer)
        await writable.close()
        return handle
      } catch { /* fall through */ }
    }
    if ('showSaveFilePicker' in window) {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const newHandle = await (window as any).showSaveFilePicker({
          suggestedName: name,
          types: [{ description: 'KeePass Database', accept: { 'application/octet-stream': ['.kdbx'] } }],
        })
        const writable = await newHandle.createWritable()
        await writable.write(buffer)
        await writable.close()
        return newHandle
      } catch (err) {
        if ((err as Error).name === 'AbortError') return undefined
        throw err
      }
    }
    const blob = new Blob([buffer], { type: 'application/octet-stream' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = name
    document.body.appendChild(a); a.click()
    document.body.removeChild(a); URL.revokeObjectURL(url)
    return undefined
  },
}

// Stubs for future providers
export const webdavProvider: StorageProvider = {
  id: 'webdav', name: 'WebDAV', canRead: () => false,
  openFile: () => Promise.reject(new Error('WebDAV not yet implemented')),
  saveFile: () => Promise.reject(new Error('WebDAV not yet implemented')),
}

export const dropboxProvider: StorageProvider = {
  id: 'dropbox', name: 'Dropbox', canRead: () => false,
  openFile: () => Promise.reject(new Error('Dropbox not yet implemented')),
  saveFile: () => Promise.reject(new Error('Dropbox not yet implemented')),
}

export const googleDriveProvider: StorageProvider = {
  id: 'google-drive', name: 'Google Drive', canRead: () => false,
  openFile: () => Promise.reject(new Error('Google Drive not yet implemented')),
  saveFile: () => Promise.reject(new Error('Google Drive not yet implemented')),
}

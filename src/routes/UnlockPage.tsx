import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { KeyRound, FolderOpen, Plus, Eye, EyeOff, Upload, Key } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/hooks/useToast'
import { useDbStore } from '@/features/db/dbStore'
import { openDatabase, createDatabase } from '@/features/crypto/kdbxAdapter'
import { localStorageProvider } from '@/features/storage/localStorageProvider'

export default function UnlockPage() {
  const navigate = useNavigate()
  const { addDatabase, setActiveDb, setSelectedGroup } = useDbStore()
  const toast = useToast()
  const [mode, setMode] = useState<'open' | 'create'>('open')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [dbName, setDbName] = useState('My Passwords')
  const [keyFileBuffer, setKeyFileBuffer] = useState<ArrayBuffer | null>(null)
  const [keyFileName, setKeyFileName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [fileBuffer, setFileBuffer] = useState<ArrayBuffer | null>(null)
  const [fileName, setFileName] = useState('')
  const [fileHandle, setFileHandle] = useState<FileSystemFileHandle | undefined>()

  const handleOpenFile = async () => {
    const result = await localStorageProvider.openFile()
    if (!result) return
    setFileBuffer(result.buffer)
    setFileName(result.name)
    setFileHandle(result.handle)
  }

  const handleKeyFile = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.onchange = async () => {
      const file = input.files?.[0]
      if (!file) return
      setKeyFileBuffer(await file.arrayBuffer())
      setKeyFileName(file.name)
    }
    input.click()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      if (mode === 'open') {
        if (!fileBuffer) { toast.error('Please select a database file'); setIsLoading(false); return }
        const state = await openDatabase(fileBuffer, password, keyFileBuffer ?? undefined)
        state.filePath = fileName
        state.fileHandle = fileHandle
        addDatabase(state)
        setActiveDb(state.id)
        setSelectedGroup(state.rootGroupId)
        navigate(`/db/${state.id}`)
      } else {
        if (!password) { toast.error('Please enter a master password'); setIsLoading(false); return }
        const { state } = await createDatabase(dbName, password, keyFileBuffer ?? undefined)
        addDatabase(state)
        setActiveDb(state.id)
        setSelectedGroup(state.rootGroupId)
        navigate(`/db/${state.id}`)
      }
    } catch (err) {
      console.error(err)
      toast.error(mode === 'open' ? 'Wrong password or invalid file' : 'Failed to create database')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-accent-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-accent-600/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-accent-600/20 rounded-2xl mb-4 border border-accent-500/30">
            <KeyRound size={32} className="text-accent-400" />
          </div>
          <h1 className="text-2xl font-bold text-slate-100">KeePass Web</h1>
          <p className="text-sm text-slate-400 mt-1">Secure, offline-first password manager</p>
        </div>

        <div className="glass rounded-2xl p-1 flex mb-6">
          {(['open', 'create'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${mode === m ? 'bg-accent-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}>
              {m === 'open' ? <><FolderOpen size={14} className="inline mr-1.5" />Open Database</> : <><Plus size={14} className="inline mr-1.5" />New Database</>}
            </button>
          ))}
        </div>

        <div className="glass-heavy rounded-2xl p-6 shadow-2xl">
          <form onSubmit={e => void handleSubmit(e)} className="space-y-4">
            {mode === 'create' && (
              <Input label="Database Name" value={dbName} onChange={e => setDbName(e.target.value)} placeholder="My Passwords" required />
            )}

            {mode === 'open' && (
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1.5 block">Database File</label>
                {fileBuffer ? (
                  <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Key size={15} className="text-accent-400" />
                      <span className="text-sm text-slate-200 truncate">{fileName}</span>
                    </div>
                    <button type="button" onClick={() => { setFileBuffer(null); setFileName('') }} className="text-xs text-slate-500 hover:text-slate-300">Change</button>
                  </div>
                ) : (
                  <Button type="button" variant="secondary" onClick={() => void handleOpenFile()} className="w-full" leftIcon={<Upload size={15} />}>
                    Browse for .kdbx file
                  </Button>
                )}
              </div>
            )}

            <Input label="Master Password" type={showPassword ? 'text' : 'password'}
              value={password} onChange={e => setPassword(e.target.value)}
              placeholder="Enter master password" required
              autoComplete={mode === 'create' ? 'new-password' : 'current-password'}
              rightElement={
                <button type="button" onClick={() => setShowPassword(p => !p)} className="p-1 text-slate-400 hover:text-slate-200 transition-colors" aria-label="Toggle password">
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              } />

            <div>
              <label className="text-sm font-medium text-slate-300 mb-1.5 block">
                Key File <span className="text-slate-500 font-normal">(optional)</span>
              </label>
              {keyFileName ? (
                <div className="glass rounded-xl px-4 py-3 flex items-center justify-between">
                  <span className="text-sm text-slate-200">{keyFileName}</span>
                  <button type="button" onClick={() => { setKeyFileBuffer(null); setKeyFileName('') }} className="text-xs text-slate-500 hover:text-slate-300">Remove</button>
                </div>
              ) : (
                <Button type="button" variant="ghost" size="sm" onClick={handleKeyFile} leftIcon={<Key size={14} />}>Select key file</Button>
              )}
            </div>

            <Button type="submit" isLoading={isLoading} className="w-full mt-2" size="lg">
              {mode === 'open' ? (isLoading ? 'Opening…' : 'Open Database') : (isLoading ? 'Creating…' : 'Create Database')}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">All encryption happens locally in your browser. No data is ever sent to a server.</p>
      </div>
    </div>
  )
}

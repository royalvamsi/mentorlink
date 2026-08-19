import { useState, useEffect, type FormEvent, type DragEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/authService'
import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const CATEGORY_LABELS: Record<string, string> = {
  RESOURCE: 'Resource',
  ASSIGNMENT: 'Assignment',
  NOTES: 'Notes',
  OTHER: 'Other',
}

const FILE_ICONS: Record<string, string> = {
  'application/pdf': '📄',
  'text/plain': '📝',
  'image/png': '🖼️',
  'image/jpeg': '🖼️',
  'image/gif': '🖼️',
  'image/webp': '🖼️',
  'application/zip': '🗜️',
}
function getIcon(mime: string) { return FILE_ICONS[mime] ?? '📁' }
function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}
function fmt(d: string) { return new Date(d).toLocaleDateString([], { dateStyle: 'medium' }) }

interface FileRecord {
  _id: string
  originalName: string
  mimeType: string
  size: number
  category: string
  description?: string
  downloadCount: number
  createdAt: string
  uploaderId: { _id: string; name: string; role: string }
}

export default function FilesPage() {
  const { user, logout } = useAuth()
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [dragging, setDragging] = useState(false)

  // Upload form
  const [showUpload, setShowUpload] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [category, setCategory] = useState<string>('OTHER')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  async function refresh() {
    setLoading(true)
    try {
      const res = await api.get<{ status: string; data: FileRecord[] }>('/api/files')
      setFiles(res.data.data)
    } catch { setError('Failed to load files') }
    finally { setLoading(false) }
  }

  useEffect(() => { refresh() }, [])

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault(); setDragging(false)
    if (e.dataTransfer.files.length > 0) { setSelectedFile(e.dataTransfer.files[0]); setShowUpload(true) }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true); setError(''); setSuccess('')
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('category', category)
    if (description) formData.append('description', description)
    try {
      const token = localStorage.getItem('ml_token')
      await axios.post(`${API_BASE}/api/files/upload`, formData, {
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('File uploaded successfully!'); setShowUpload(false); setSelectedFile(null); setDescription('')
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Upload failed')
    } finally { setUploading(false) }
  }

  async function handleDelete(id: string) {
    setError(''); setSuccess('')
    try { await api.delete(`/api/files/${id}`); setSuccess('File deleted'); await refresh() }
    catch (err) { if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed') }
  }

  function handleDownload(id: string) {
    const token = localStorage.getItem('ml_token')
    window.open(`${API_BASE}/api/files/download/${id}?token=${token}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link to="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span className="font-bold text-white">MentorLink</span>
        </Link>
        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-3 text-sm text-slate-400">
            <Link to="/dashboard" className="hover:text-white">Dashboard</Link>
            <Link to="/mentorships" className="hover:text-white">Mentorships</Link>
          </nav>
          <button onClick={logout} className="text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white transition">Sign out</button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">File Sharing</h1>
            <p className="text-sm text-slate-400 mt-1">Share resources, notes, and assignments with your mentorship network</p>
          </div>
          <button onClick={() => setShowUpload(true)} className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition">Upload File</button>
        </div>

        {error && <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        {success && <div className="mb-4 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">{success}</div>}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
              <h2 className="font-bold text-white mb-4">Upload File</h2>
              <form onSubmit={handleUpload} className="space-y-4">
                <div
                  onDragOver={e => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition cursor-pointer ${dragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-slate-600'}`}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input id="fileInput" type="file" className="hidden" onChange={e => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]) }} />
                  {selectedFile ? (
                    <div className="text-indigo-300 font-medium">{getIcon(selectedFile.type)} {selectedFile.name} <span className="text-slate-400 text-xs">({fmtSize(selectedFile.size)})</span></div>
                  ) : (
                    <>
                      <div className="text-3xl mb-2">📂</div>
                      <p className="text-slate-400 text-sm">Drag & drop or click to choose a file</p>
                      <p className="text-slate-500 text-xs mt-1">Max 10 MB · PDF, Word, Excel, Images, ZIP</p>
                    </>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1.5">Description (optional)</label>
                  <input value={description} onChange={e => setDescription(e.target.value)} maxLength={500}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="What is this file about?" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => { setShowUpload(false); setSelectedFile(null) }} className="flex-1 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:text-white text-sm transition">Cancel</button>
                  <button type="submit" disabled={uploading || !selectedFile} className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold disabled:opacity-50 transition">
                    {uploading ? 'Uploading…' : 'Upload'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" /></div>
        ) : files.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <div className="text-5xl mb-3">📂</div>
            <p className="font-medium text-slate-400">No files shared yet</p>
            <p className="text-sm mt-1">Upload your first file to share with your mentorship network</p>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map(file => (
              <div key={file._id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center gap-4">
                <div className="text-3xl shrink-0">{getIcon(file.mimeType)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-white text-sm truncate">{file.originalName}</span>
                    <span className="px-1.5 py-0.5 text-xs rounded bg-slate-700 text-slate-300 shrink-0">{CATEGORY_LABELS[file.category]}</span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center gap-3">
                    <span>{fmtSize(file.size)}</span>
                    <span>·</span>
                    <span>by {file.uploaderId.name}</span>
                    <span>·</span>
                    <span>{fmt(file.createdAt)}</span>
                    <span>·</span>
                    <span>{file.downloadCount} download{file.downloadCount !== 1 ? 's' : ''}</span>
                  </div>
                  {file.description && <p className="text-xs text-slate-500 mt-1 truncate">{file.description}</p>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleDownload(file._id)} className="px-3 py-1.5 text-xs rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white transition">Download</button>
                  {file.uploaderId._id === user?.id && (
                    <button onClick={() => handleDelete(file._id)} className="px-3 py-1.5 text-xs rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition">Delete</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

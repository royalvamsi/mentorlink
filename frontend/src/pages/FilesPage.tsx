import { useState, useEffect, type FormEvent, type DragEvent } from 'react'
import { useAuth } from '../context/AuthContext'
import { api } from '../services/authService'
import { Navbar } from '../components/Navbar'
import axios from 'axios'
import {
  FolderOpen,
  UploadCloud,
  FileText,
  FileCode,
  FileSpreadsheet,
  FileArchive,
  Image,
  Download,
  Trash2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:5000'

const CATEGORY_LABELS: Record<string, string> = {
  RESOURCE:   'Resource',
  ASSIGNMENT: 'Assignment',
  NOTES:      'Notes',
  OTHER:      'Other',
}

const CATEGORY_COLORS: Record<string, string> = {
  RESOURCE:   'bg-indigo-50 text-indigo-700 border-indigo-200',
  ASSIGNMENT: 'bg-amber-50 text-amber-800 border-amber-200',
  NOTES:      'bg-emerald-50 text-emerald-700 border-emerald-200',
  OTHER:      'bg-slate-100 text-slate-700 border-slate-200',
}

function getFileIcon(mime: string) {
  if (mime.includes('pdf') || mime.includes('text')) return <FileText className="w-5 h-5 text-rose-600" />
  if (mime.includes('image')) return <Image className="w-5 h-5 text-teal-600" />
  if (mime.includes('zip') || mime.includes('rar') || mime.includes('tar')) return <FileArchive className="w-5 h-5 text-amber-600" />
  if (mime.includes('sheet') || mime.includes('excel') || mime.includes('csv')) return <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
  if (mime.includes('javascript') || mime.includes('typescript') || mime.includes('json') || mime.includes('python')) return <FileCode className="w-5 h-5 text-indigo-600" />
  return <FileText className="w-5 h-5 text-indigo-600" />
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString([], { dateStyle: 'medium' })
}

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
  const { user } = useAuth()
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
    } catch {
      setError('Failed to load shared library files')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refresh()
  }, [])

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    if (e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0])
      setShowUpload(true)
    }
  }

  async function handleUpload(e: FormEvent) {
    e.preventDefault()
    if (!selectedFile) return
    setUploading(true)
    setError('')
    setSuccess('')
    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('category', category)
    if (description) formData.append('description', description)
    try {
      const token = localStorage.getItem('ml_token')
      await axios.post(`${API_BASE}/api/files/upload`, formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Resource uploaded to campus hub successfully!')
      setShowUpload(false)
      setSelectedFile(null)
      setDescription('')
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  async function handleDelete(id: string) {
    setError('')
    setSuccess('')
    try {
      await api.delete(`/api/files/${id}`)
      setSuccess('File removed from library')
      await refresh()
    } catch (err) {
      if (axios.isAxiosError(err)) setError(err.response?.data?.message ?? 'Failed to delete file')
    }
  }

  function handleDownload(id: string) {
    const token = localStorage.getItem('ml_token')
    window.open(`${API_BASE}/api/files/download/${id}?token=${token}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
                <FolderOpen className="w-4 h-4" />
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Shared Campus Resources</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Resource Library</h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">Access curated study guides, resume templates, and workshop slides.</p>
          </div>

          <button
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Resource</span>
          </button>
        </div>

        {error && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl">
              <h2 className="text-lg font-extrabold text-slate-900 mb-1">Share Resource</h2>
              <p className="text-xs text-slate-500 mb-5">Upload documents, study cheatsheets, or sample projects.</p>

              <form onSubmit={handleUpload} className="space-y-4">
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center transition cursor-pointer ${
                    dragging ? 'border-indigo-500 bg-indigo-50/50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50'
                  }`}
                  onClick={() => document.getElementById('fileInput')?.click()}
                >
                  <input
                    id="fileInput"
                    type="file"
                    className="hidden"
                    onChange={(e) => { if (e.target.files?.[0]) setSelectedFile(e.target.files[0]) }}
                  />
                  {selectedFile ? (
                    <div className="text-indigo-600 font-bold text-xs flex items-center justify-center gap-2">
                      <FileText className="w-4 h-4" />
                      <span>{selectedFile.name}</span>
                      <span className="text-slate-400 text-[10px]">({fmtSize(selectedFile.size)})</span>
                    </div>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-indigo-500 mx-auto mb-2" />
                      <p className="text-slate-700 font-bold text-xs">Drag & drop or browse from computer</p>
                      <p className="text-slate-400 text-[10px] mt-1">PDF, DOCX, ZIP, PNG, Code (Max 10 MB)</p>
                    </>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Resource Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Description (Optional)</label>
                  <input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    maxLength={500}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="E.g., Comprehensive DSA cheatsheet covering graphs and DP..."
                  />
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowUpload(false); setSelectedFile(null) }}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold disabled:opacity-50 transition shadow-xs"
                  >
                    {uploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl border border-slate-200/80">
            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white border border-slate-200/80 rounded-3xl max-w-lg mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
              <FolderOpen className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-800 text-base mb-1">No shared files yet</p>
            <p className="text-xs text-slate-500 mb-5">
              Upload documents, study guides, or resume formats to share with mentees and fellow students.
            </p>
            <button
              onClick={() => setShowUpload(true)}
              className="px-5 py-2.5 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition"
            >
              Upload First Resource
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {files.map((file) => (
              <div
                key={file._id}
                className="bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-4 sm:p-5 shadow-xs flex items-center gap-4 hover:shadow-md transition"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                  {getFileIcon(file.mimeType)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      {file.originalName}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border uppercase tracking-wider ${CATEGORY_COLORS[file.category] ?? 'bg-slate-100 text-slate-700'}`}>
                      {CATEGORY_LABELS[file.category]}
                    </span>
                  </div>

                  <div className="text-xs text-slate-400 flex items-center gap-2 sm:gap-3 flex-wrap">
                    <span>{fmtSize(file.size)}</span>
                    <span>·</span>
                    <span className="text-slate-600 font-medium">{file.uploaderId?.name}</span>
                    <span>·</span>
                    <span>{fmt(file.createdAt)}</span>
                    <span>·</span>
                    <span>{file.downloadCount} download{file.downloadCount !== 1 ? 's' : ''}</span>
                  </div>

                  {file.description && (
                    <p className="text-xs text-slate-500 mt-1 truncate">
                      {file.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleDownload(file._id)}
                    className="inline-flex items-center gap-1 px-3.5 py-2 text-xs font-bold rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 transition"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </button>
                  {file.uploaderId?._id === user?.id && (
                    <button
                      onClick={() => handleDelete(file._id)}
                      className="p-2 text-xs rounded-xl border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                      title="Delete file"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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


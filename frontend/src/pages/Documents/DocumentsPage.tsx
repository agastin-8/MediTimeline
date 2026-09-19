import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FileText, Search, Eye, CheckCircle,
  Clock, AlertCircle, XCircle, Upload, Brain
} from 'lucide-react'
import { DEMO_DOCUMENTS } from '@/data/demoPatient'
import { documentService } from '@/services'
import { usePatientStore } from '@/store/patientStore'

const statusConfig = {
  verified:   { badge: 'badge-normal', icon: CheckCircle,  label: 'Verified'    },
  extracted:  { badge: 'badge-teal',   icon: Brain,        label: 'Extracted'   },
  processing: { badge: 'badge-low',    icon: Clock,        label: 'Processing'  },
  uploaded:   { badge: 'badge-blue',   icon: Clock,        label: 'Uploaded'    },
  failed:     { badge: 'badge-high',   icon: XCircle,      label: 'Failed'      },
  pending:    { badge: 'badge-orange', icon: AlertCircle,  label: 'Pending'     },
}

const docTypeLabel: Record<string, string> = {
  blood_report: '🩸 Blood Report',
  prescription: '💊 Prescription',
  mri_report: '🔬 MRI Report',
  discharge_summary: '🏥 Discharge Summary',
  lab_report: '🧪 Lab Report',
  consultation: '👨‍⚕️ Consultation',
}

export default function DocumentsPage() {
  const navigate = useNavigate()
  const { currentPatient } = usePatientStore()
  const [documents, setDocuments] = useState(DEMO_DOCUMENTS)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await documentService.list(currentPatient?.id || 1)
        if (res.data?.length) setDocuments(res.data)
      } catch {}
    }
    load()
  }, [currentPatient])

  const filtered = documents.filter(d => {
    const matchesSearch = !search ||
      d.original_filename?.toLowerCase().includes(search.toLowerCase()) ||
      d.doctor?.toLowerCase().includes(search.toLowerCase()) ||
      d.hospital?.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || d.status === filter
    return matchesSearch && matchesFilter
  })

  const formatSize = (bytes: number) => {
    if (!bytes) return '—'
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Document Library</h1>
          <p className="text-slate-400 text-sm mt-1">{documents.length} medical documents</p>
        </div>
        <button onClick={() => navigate('/upload')} className="btn-primary">
          <Upload size={16} />
          Upload New
        </button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search documents, doctors, hospitals..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'verified', 'processing', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all ${
                filter === f ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'text-slate-400 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total', value: documents.length, color: 'teal' },
          { label: 'Verified', value: documents.filter(d => d.status === 'verified').length, color: 'green' },
          { label: 'Processing', value: documents.filter(d => d.status === 'processing' || d.status === 'uploaded').length, color: 'yellow' },
          { label: 'Failed', value: documents.filter(d => d.status === 'failed').length, color: 'red' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <div className={`text-2xl font-display font-black text-${color}-400`}>{value}</div>
            <div className="text-slate-500 text-xs mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((doc, i) => {
          const sc = statusConfig[doc.status as keyof typeof statusConfig] || statusConfig.uploaded
          const StatusIcon = sc.icon
          return (
            <motion.div
              key={doc.id}
              className="glass-card rounded-2xl p-5 hover:border-teal-500/25 transition-all"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center">
                  <FileText size={22} className="text-teal-400" />
                </div>
                <span className={`badge ${sc.badge}`}>
                  <StatusIcon size={10} />
                  {sc.label}
                </span>
              </div>

              <h3 className="text-white font-semibold text-sm mb-1 truncate">
                {docTypeLabel[doc.document_type] || doc.document_type || 'Medical Document'}
              </h3>
              <p className="text-slate-500 text-xs mb-3 truncate">{doc.original_filename}</p>

              <div className="space-y-1.5 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-slate-600">Date</span>
                  <span className="text-slate-400">{doc.document_date || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Hospital</span>
                  <span className="text-slate-400 truncate max-w-[60%] text-right">{doc.hospital?.split(',')[0] || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Doctor</span>
                  <span className="text-slate-400 truncate max-w-[60%] text-right">{doc.doctor || '—'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Size</span>
                  <span className="text-slate-400">{formatSize(doc.file_size)}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/verify/${doc.id}`)}
                  className="btn-ghost text-xs py-1.5 flex-1 justify-center"
                >
                  <Eye size={12} /> View
                </button>
                <button
                  onClick={() => navigate('/timeline')}
                  className="btn-secondary text-xs py-1.5 flex-1 justify-center"
                >
                  Timeline
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <FileText size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">No documents found.</p>
          <button onClick={() => navigate('/upload')} className="btn-primary mt-4">
            <Upload size={16} /> Upload your first document
          </button>
        </div>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  FileText, Activity, FlaskConical, Pill,
  Stethoscope, Building2, Upload, Clock, TrendingUp,
  TrendingDown, ArrowRight, CheckCircle, AlertTriangle, Brain,
  Edit3, Check, X
} from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'
import { useAuthStore } from '@/store/authStore'
import { patientService } from '@/services'
import { DEMO_PATIENT, DEMO_TIMELINE, DEMO_LABS, DEMO_DOCUMENTS } from '@/data/demoPatient'
import { LineChart, Line, ResponsiveContainer, Tooltip } from 'recharts'

// Animated counter
function AnimatedCounter({ end, duration = 1500 }: { end: number; duration?: number }) {
  const [count, setCount] = useState(0)
  useEffect(() => {
    let start = 0
    const step = end / (duration / 16)
    const timer = setInterval(() => {
      start += step
      if (start >= end) { setCount(end); clearInterval(timer) }
      else setCount(Math.floor(start))
    }, 16)
    return () => clearInterval(timer)
  }, [end])
  return <span>{count}</span>
}

const stats = [
  { label: 'Total Documents', key: 'documents', icon: FileText, color: 'teal', trend: '+2 this month' },
  { label: 'Timeline Events', key: 'timeline_events', icon: Activity, color: 'blue', trend: '+1 this week' },
  { label: 'Lab Results', key: 'lab_results', icon: FlaskConical, color: 'emerald', trend: 'Updated Jun 2026' },
  { label: 'Medications', key: 'medications', icon: Pill, color: 'purple', trend: '2 active' },
  { label: 'Diagnoses', key: 'diagnoses', icon: Stethoscope, color: 'orange', trend: '1 chronic' },
]

const iconColors: Record<string, string> = {
  teal: 'text-teal-400 bg-teal-500/15',
  blue: 'text-blue-400 bg-blue-500/15',
  emerald: 'text-emerald-400 bg-emerald-500/15',
  purple: 'text-purple-400 bg-purple-500/15',
  orange: 'text-orange-400 bg-orange-500/15',
}

// Mini trend data
const hba1cTrend = [{ v: 7.8 }, { v: 7.8 }, { v: 7.3 }, { v: 6.9 }]
const hemoglobinTrend = [{ v: 11.2 }, { v: 11.2 }, { v: 12.4 }, { v: 13.1 }]

const eventTypeConfig: Record<string, { color: string; label: string }> = {
  lab: { color: '#14b8a6', label: 'Lab' },
  medicine: { color: '#3b82f6', label: 'Medicine' },
  visit: { color: '#8b5cf6', label: 'Visit' },
  diagnosis: { color: '#ef4444', label: 'Diagnosis' },
  procedure: { color: '#f59e0b', label: 'Procedure' },
  admission: { color: '#06b6d4', label: 'Admission' },
  discharge: { color: '#10b981', label: 'Discharge' },
}

const docTypeLabel: Record<string, string> = {
  blood_report: 'Blood Report',
  prescription: 'Prescription',
  mri_report: 'MRI Report',
  discharge_summary: 'Discharge Summary',
  lab_report: 'Lab Report',
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentPatient, setCurrentPatient, updatePatientName } = usePatientStore()
  const patient = currentPatient || DEMO_PATIENT
  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState('')
  const [savingName, setSavingName] = useState(false)

  const handleSavePatientName = async () => {
    if (!editNameValue.trim()) return
    const newName = editNameValue.trim()
    setSavingName(true)
    updatePatientName(newName)
    if (patient?.id) {
      try {
        await patientService.update(patient.id, { name: newName })
      } catch (err) {
        console.error("Error updating patient name:", err)
      }
    }
    setSavingName(false)
    setIsEditingName(false)
  }

  useEffect(() => {
    if (!currentPatient) {
      setCurrentPatient(DEMO_PATIENT as any)
    }
  }, [])

  const patientStats = (patient as any).stats || DEMO_PATIENT.stats

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <motion.h1
            className="text-2xl font-display font-bold text-white"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
            <span className="gradient-text">{user?.name?.split(' ')[0] || 'Doctor'}</span> 👋
          </motion.h1>
          <p className="text-slate-400 text-sm mt-1">
            Viewing records for <span className="text-white font-medium">{patient.name}</span>
          </p>
        </div>
        <motion.button
          onClick={() => navigate('/upload')}
          className="btn-primary"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload size={16} />
          Upload Document
        </motion.button>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
      >
        {stats.map(({ label, key, icon: Icon, color, trend }) => (
          <motion.div
            key={key}
            className="stat-card"
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
            whileHover={{ scale: 1.03 }}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${iconColors[color]}`}>
              <Icon size={20} />
            </div>
            <div className="text-3xl font-display font-black text-white mb-1">
              <AnimatedCounter end={patientStats[key] || 0} />
            </div>
            <div className="text-slate-400 text-sm font-medium">{label}</div>
            <div className="text-xs text-teal-500 mt-1">{trend}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Patient Overview */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-teal-400" />
            Patient Overview
          </h2>

          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
              {patient.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              {isEditingName ? (
                <div className="flex items-center gap-1.5 mb-1">
                  <input
                    type="text"
                    value={editNameValue}
                    onChange={(e) => setEditNameValue(e.target.value)}
                    className="input-field text-xs py-1 px-2.5 w-40"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePatientName()
                      if (e.key === 'Escape') setIsEditingName(false)
                    }}
                  />
                  <button
                    onClick={handleSavePatientName}
                    disabled={savingName}
                    className="p-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-white transition-colors"
                    title="Save name"
                  >
                    <Check size={13} />
                  </button>
                  <button
                    onClick={() => setIsEditingName(false)}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors"
                    title="Cancel"
                  >
                    <X size={13} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="text-white font-bold text-lg truncate">{patient.name}</h3>
                  <button
                    onClick={() => {
                      setEditNameValue(patient.name)
                      setIsEditingName(true)
                    }}
                    className="p-1 text-slate-400 hover:text-teal-400 rounded-lg hover:bg-slate-800 transition-colors flex-shrink-0"
                    title="Edit patient name"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
              <p className="text-slate-400 text-sm">
                {patient.gender} · DOB: {patient.date_of_birth}
              </p>
              <span className="badge badge-teal mt-1">{patient.blood_group}</span>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            {[
              { label: 'Phone', value: (patient as any).phone },
              { label: 'Hospital', value: 'Apollo Hospitals, Chennai' },
              { label: 'Primary Doctor', value: 'Dr. Meena Krishnan' },
              { label: 'Last Visit', value: 'Jun 10, 2026' },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b border-slate-800/50">
                <span className="text-slate-500">{label}</span>
                <span className="text-slate-300 font-medium text-right max-w-[55%] truncate">{value}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => navigate('/timeline')}
            className="btn-secondary w-full mt-4 justify-center text-sm"
          >
            View Full Timeline <ArrowRight size={14} />
          </button>
        </motion.div>

        {/* Recent Documents */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold text-lg flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400" />
              Recent Documents
            </h2>
            <button onClick={() => navigate('/documents')} className="text-teal-400 text-xs hover:text-teal-300">
              View all
            </button>
          </div>

          <div className="space-y-3">
            {DEMO_DOCUMENTS.slice(0, 4).map((doc, i) => (
              <motion.div
                key={doc.id}
                className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-colors cursor-pointer"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
                onClick={() => navigate('/documents')}
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-teal-400" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="text-white text-sm font-medium truncate">{docTypeLabel[doc.document_type] || doc.document_type}</p>
                  <p className="text-slate-500 text-xs">{doc.document_date} · {doc.hospital.split(',')[0]}</p>
                </div>
                <span className="badge badge-teal text-xs flex-shrink-0">Verified</span>
              </motion.div>
            ))}
          </div>

          <button
            onClick={() => navigate('/upload')}
            className="btn-primary w-full mt-4 justify-center text-sm"
          >
            <Upload size={14} />
            Upload New Document
          </button>
        </motion.div>

        {/* Medical Summary */}
        <motion.div
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            Medical Summary
          </h2>

          <div className="space-y-3 mb-4">
            <div className="p-3 rounded-xl bg-orange-500/8 border border-orange-500/20">
              <div className="flex items-center gap-2 mb-1">
                <AlertTriangle size={14} className="text-orange-400" />
                <span className="text-orange-400 text-xs font-semibold">Active Conditions</span>
              </div>
              <p className="text-slate-300 text-sm">Type 2 Diabetes Mellitus · Lumbar Spondylosis</p>
            </div>
            <div className="p-3 rounded-xl bg-teal-500/8 border border-teal-500/20">
              <div className="flex items-center gap-2 mb-1">
                <Pill size={14} className="text-teal-400" />
                <span className="text-teal-400 text-xs font-semibold">Current Medications</span>
              </div>
              <p className="text-slate-300 text-sm">Metformin 500mg · Glipizide 5mg</p>
            </div>
            <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/20">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle size={14} className="text-green-400" />
                <span className="text-green-400 text-xs font-semibold">Recent Improvement</span>
              </div>
              <p className="text-slate-300 text-sm">HbA1c: 7.8% → 6.9% · Hb normalized</p>
            </div>
          </div>

          {/* Mini Lab Trend Charts */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-500 text-xs mb-1">HbA1c</p>
              <div className="flex items-end gap-1">
                <span className="text-white text-lg font-bold">6.9</span>
                <span className="text-slate-500 text-xs">%</span>
                <TrendingDown size={14} className="text-green-400 mb-0.5" />
              </div>
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={hba1cTrend}>
                  <Line type="monotone" dataKey="v" stroke="#10b981" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-slate-800/50 rounded-xl p-3">
              <p className="text-slate-500 text-xs mb-1">Hemoglobin</p>
              <div className="flex items-end gap-1">
                <span className="text-white text-lg font-bold">13.1</span>
                <span className="text-slate-500 text-xs">g/dL</span>
                <TrendingUp size={14} className="text-teal-400 mb-0.5" />
              </div>
              <ResponsiveContainer width="100%" height={30}>
                <LineChart data={hemoglobinTrend}>
                  <Line type="monotone" dataKey="v" stroke="#14b8a6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Timeline Preview */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-white font-bold text-lg flex items-center gap-2">
            <Clock size={18} className="text-teal-400" />
            Recent Timeline Events
          </h2>
          <button onClick={() => navigate('/timeline')} className="text-teal-400 text-sm hover:text-teal-300 flex items-center gap-1">
            Full Timeline <ArrowRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {DEMO_TIMELINE.slice(0, 6).map((event, i) => {
            const cfg = eventTypeConfig[event.event_type] || { color: '#14b8a6', label: event.event_type }
            return (
              <motion.div
                key={event.id}
                className="p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800/70 transition-all cursor-pointer border-l-2"
                style={{ borderLeftColor: cfg.color }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.05 }}
                onClick={() => navigate('/timeline')}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: cfg.color }}>
                    {cfg.label}
                  </span>
                  <span className="text-slate-500 text-xs">{event.event_date}</span>
                </div>
                <p className="text-white text-sm font-semibold mb-1">{event.title}</p>
                <p className="text-slate-400 text-xs line-clamp-2">{event.description}</p>
                <p className="text-slate-600 text-xs mt-2">{event.hospital?.split(',')[0]}</p>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* AI Search Quick Access */}
      <motion.div
        className="glass-card rounded-2xl p-6 bg-gradient-to-r from-teal-500/5 to-blue-500/5 border-teal-500/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        onClick={() => navigate('/search')}
        whileHover={{ scale: 1.01, cursor: 'pointer' }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/20 flex items-center justify-center flex-shrink-0">
            <Brain size={24} className="text-teal-400" />
          </div>
          <div className="flex-1">
            <h3 className="text-white font-bold mb-1">AI Medical Search</h3>
            <p className="text-slate-400 text-sm">Ask anything about {patient.name}'s records. "Show previous blood tests" or "List all medications"</p>
          </div>
          <ArrowRight size={20} className="text-teal-400 flex-shrink-0" />
        </div>
      </motion.div>
    </div>
  )
}

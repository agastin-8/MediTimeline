import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Stethoscope, AlertTriangle, CheckCircle, Activity, Calendar, User } from 'lucide-react'
import { DEMO_DIAGNOSES } from '@/data/demoPatient'
import { usePatientStore } from '@/store/patientStore'
import { medicalService } from '@/services'

const severityConfig = {
  mild:     { badge: 'badge-teal',   color: '#14b8a6' },
  moderate: { badge: 'badge-low',    color: '#f59e0b' },
  severe:   { badge: 'badge-high',   color: '#ef4444' },
  critical: { badge: 'badge-high',   color: '#dc2626' },
}

const statusConfig = {
  active:   { badge: 'badge-high',   icon: Activity,      label: 'Active'   },
  chronic:  { badge: 'badge-orange', icon: AlertTriangle, label: 'Chronic'  },
  resolved: { badge: 'badge-normal', icon: CheckCircle,   label: 'Resolved' },
}

export default function DiagnosesPage() {
  const { currentPatient } = usePatientStore()
  const [diagnoses, setDiagnoses] = useState(DEMO_DIAGNOSES)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await medicalService.getDiagnoses(currentPatient?.id || 1)
        if (res.data?.length) setDiagnoses(res.data)
      } catch {}
    }
    load()
  }, [currentPatient])

  const filtered = filter === 'all' ? diagnoses : diagnoses.filter(d => d.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Diagnoses</h1>
        <p className="text-slate-400 text-sm mt-1">
          {diagnoses.filter(d => d.status === 'active' || d.status === 'chronic').length} active conditions · {diagnoses.filter(d => d.status === 'resolved').length} resolved
        </p>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'chronic', 'resolved'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-all ${
              filter === f ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'text-slate-400 border border-slate-700 hover:border-slate-500'
            }`}
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
      </div>

      {/* Timeline of diagnoses */}
      <div className="relative">
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gradient-to-b from-red-500/30 to-transparent" />

        <div className="space-y-4">
          {filtered.map((diag, i) => {
            const sev = severityConfig[diag.severity as keyof typeof severityConfig] || severityConfig.mild
            const stat = statusConfig[diag.status as keyof typeof statusConfig] || statusConfig.active
            const StatIcon = stat.icon

            return (
              <motion.div
                key={diag.id}
                className="relative pl-16"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                {/* Dot */}
                <div
                  className="absolute left-5 top-5 w-6 h-6 rounded-full border-2 flex items-center justify-center bg-slate-900"
                  style={{ borderColor: sev.color }}
                >
                  <Stethoscope size={10} style={{ color: sev.color }} />
                </div>

                <div className="glass-card rounded-2xl p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="text-white font-bold text-lg">{diag.condition}</h3>
                      {diag.icd_code && (
                        <span className="text-slate-500 text-xs">ICD-10: {diag.icd_code}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className={`badge ${sev.badge}`}>{diag.severity}</span>
                      <span className={`badge ${stat.badge}`}>
                        <StatIcon size={10} /> {stat.label}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                    <div>
                      <p className="text-slate-500 text-xs">First Seen</p>
                      <p className="text-slate-300">{diag.first_seen}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Last Seen</p>
                      <p className="text-slate-300">{diag.last_seen}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Diagnosed By</p>
                      <p className="text-slate-300">{diag.diagnosed_by}</p>
                    </div>
                    <div>
                      <p className="text-slate-500 text-xs">Hospital</p>
                      <p className="text-slate-300">{diag.hospital?.split(',')[0]}</p>
                    </div>
                  </div>

                  {diag.notes && (
                    <p className="text-slate-400 text-sm bg-slate-800/40 rounded-xl p-3">{diag.notes}</p>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

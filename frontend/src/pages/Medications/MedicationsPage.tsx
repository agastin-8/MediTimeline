import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Pill, CheckCircle, Clock, XCircle, Calendar, User, Building2 } from 'lucide-react'
import { DEMO_MEDICATIONS } from '@/data/demoPatient'
import { usePatientStore } from '@/store/patientStore'
import { medicalService } from '@/services'

const statusConfig = {
  active:    { icon: CheckCircle, color: 'text-green-400',  bg: 'bg-green-500/15',  badge: 'badge-normal', label: 'Active'    },
  completed: { icon: Clock,       color: 'text-slate-400',  bg: 'bg-slate-500/15',  badge: 'badge-teal',   label: 'Completed' },
  stopped:   { icon: XCircle,     color: 'text-red-400',    bg: 'bg-red-500/15',    badge: 'badge-high',   label: 'Stopped'   },
}

const pillColors = ['from-teal-500/20 to-teal-600/10', 'from-blue-500/20 to-blue-600/10', 'from-purple-500/20 to-purple-600/10', 'from-emerald-500/20 to-emerald-600/10', 'from-orange-500/20 to-orange-600/10']

export default function MedicationsPage() {
  const { currentPatient } = usePatientStore()
  const [medications, setMedications] = useState(DEMO_MEDICATIONS)
  const [filter, setFilter] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await medicalService.getMedications(currentPatient?.id || 1)
        if (res.data?.length) setMedications(res.data)
      } catch {}
    }
    load()
  }, [currentPatient])

  const filtered = filter === 'all' ? medications : medications.filter(m => m.status === filter)
  const active = medications.filter(m => m.status === 'active')
  const completed = medications.filter(m => m.status === 'completed')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Medications</h1>
          <p className="text-slate-400 text-sm mt-1">
            {active.length} active · {completed.length} completed
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Medicines', value: medications.length, color: 'teal' },
          { label: 'Currently Active', value: active.length, color: 'green' },
          { label: 'Completed', value: completed.length, color: 'blue' },
          { label: 'Doctors', value: new Set(medications.map(m => m.prescribed_by)).size, color: 'purple' },
        ].map(({ label, value, color }) => (
          <div key={label} className="stat-card text-center">
            <div className={`text-3xl font-display font-black text-${color}-400 mb-1`}>{value}</div>
            <div className="text-slate-400 text-sm">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {['all', 'active', 'completed', 'stopped'].map(f => (
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

      {/* Medication cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((med, i) => {
          const sc = statusConfig[med.status as keyof typeof statusConfig] || statusConfig.active
          const StatusIcon = sc.icon
          return (
            <motion.div
              key={med.id}
              className={`rounded-2xl p-5 bg-gradient-to-br ${pillColors[i % pillColors.length]} border border-slate-700/30`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.07 }}
              whileHover={{ scale: 1.02, borderColor: 'rgba(20,184,166,0.3)' }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center">
                  <Pill size={20} className="text-teal-400" />
                </div>
                <span className={`badge ${sc.badge}`}>
                  <StatusIcon size={10} />
                  {sc.label}
                </span>
              </div>

              <h3 className="text-white font-bold text-lg mb-1">{med.name}</h3>

              <div className="space-y-2 text-sm">
                {med.dosage && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dosage</span>
                    <span className="text-slate-300 font-medium">{med.dosage}</span>
                  </div>
                )}
                {med.frequency && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Frequency</span>
                    <span className="text-slate-300">{med.frequency}</span>
                  </div>
                )}
                {med.duration && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Duration</span>
                    <span className="text-slate-300">{med.duration}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-1.5">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <User size={11} />
                  <span>{med.prescribed_by}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <Calendar size={11} />
                  <span>{med.prescribed_date}</span>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

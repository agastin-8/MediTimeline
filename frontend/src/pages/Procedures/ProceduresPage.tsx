import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Scissors, Scan, LogIn, LogOut, Syringe, Calendar, User, Building2 } from 'lucide-react'
import { usePatientStore } from '@/store/patientStore'
import { medicalService } from '@/services'

const DEMO_PROCEDURES = [
  { id: 1, procedure_name: "MRI Lumbar Spine", procedure_type: "scan", procedure_date: "2025-07-20", performed_by: "Dr. Arjun Patel", hospital: "Fortis Hospital, Chennai", outcome: "L4-L5 disc narrowing, mild spondylosis" },
  { id: 2, procedure_name: "MRI Brain with Contrast", procedure_type: "scan", procedure_date: "2025-07-20", performed_by: "Dr. Arjun Patel", hospital: "Fortis Hospital, Chennai", outcome: "Normal study. No pathology detected." },
  { id: 3, procedure_name: "IV Fluid Resuscitation", procedure_type: "injection", procedure_date: "2024-11-27", performed_by: "Dr. Suresh Babu", hospital: "GGH Chennai", admission_date: "2024-11-27", discharge_date: "2024-11-30", outcome: "Adequate hydration achieved in 24 hours" },
]

const typeConfig: Record<string, { icon: any; color: string; label: string }> = {
  scan:      { icon: Scan,    color: '#3b82f6', label: 'Scan'      },
  surgery:   { icon: Scissors, color: '#ef4444', label: 'Surgery'  },
  injection: { icon: Syringe, color: '#14b8a6', label: 'Injection' },
  admission: { icon: LogIn,   color: '#06b6d4', label: 'Admission' },
  discharge: { icon: LogOut,  color: '#10b981', label: 'Discharge' },
  other:     { icon: Scissors, color: '#8b5cf6', label: 'Procedure'},
}

export default function ProceduresPage() {
  const { currentPatient } = usePatientStore()
  const [procedures, setProcedures] = useState(DEMO_PROCEDURES)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await medicalService.getProcedures(currentPatient?.id || 1)
        if (res.data?.length) setProcedures(res.data)
      } catch {}
    }
    load()
  }, [currentPatient])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Procedures & Hospital Visits</h1>
        <p className="text-slate-400 text-sm mt-1">{procedures.length} recorded procedures</p>
      </div>

      <div className="space-y-4">
        {procedures.map((proc, i) => {
          const cfg = typeConfig[proc.procedure_type] || typeConfig.other
          const Icon = cfg.icon
          return (
            <motion.div
              key={proc.id}
              className="glass-card rounded-2xl p-5"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              style={{ borderLeft: `3px solid ${cfg.color}` }}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${cfg.color}20` }}>
                  <Icon size={22} style={{ color: cfg.color }} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-white font-bold text-lg">{proc.procedure_name}</h3>
                    <span className="badge badge-teal capitalize">{cfg.label}</span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                    <div className="flex items-center gap-2 text-slate-400">
                      <Calendar size={12} />
                      <span>{proc.procedure_date}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <User size={12} />
                      <span>{proc.performed_by}</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <Building2 size={12} />
                      <span>{proc.hospital?.split(',')[0]}</span>
                    </div>
                  </div>

                  {proc.admission_date && (
                    <div className="flex gap-4 mb-3">
                      <div className="px-3 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-xs">
                        <span className="text-cyan-400">Admitted:</span> <span className="text-white">{proc.admission_date}</span>
                      </div>
                      {proc.discharge_date && (
                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs">
                          <span className="text-emerald-400">Discharged:</span> <span className="text-white">{proc.discharge_date}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {proc.outcome && (
                    <p className="text-slate-400 text-sm bg-slate-800/40 rounded-xl p-3">
                      <span className="text-slate-500 font-medium">Findings: </span>{proc.outcome}
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

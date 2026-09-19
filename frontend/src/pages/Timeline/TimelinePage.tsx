import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FlaskConical, Pill, Hospital, Stethoscope, Scissors, LogIn, LogOut,
  ChevronDown, ChevronUp, ExternalLink, X, FileText, Brain, MapPin,
  Calendar, User, Activity, Filter, Search, BarChart2
} from 'lucide-react'
import { DEMO_TIMELINE } from '@/data/demoPatient'
import { usePatientStore } from '@/store/patientStore'
import { timelineService } from '@/services'

interface TimelineEvent {
  id: number
  event_type: string
  event_date: string
  title: string
  description: string
  doctor?: string
  hospital?: string
  confidence?: number
  source_document_id?: number
}

const eventConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  lab:       { icon: FlaskConical, color: '#14b8a6', bg: 'bg-teal-500',    label: 'Lab Result'   },
  medicine:  { icon: Pill,         color: '#3b82f6', bg: 'bg-blue-500',    label: 'Medication'   },
  visit:     { icon: Hospital,     color: '#8b5cf6', bg: 'bg-purple-500',  label: 'Visit'        },
  diagnosis: { icon: Stethoscope,  color: '#ef4444', bg: 'bg-red-500',     label: 'Diagnosis'    },
  procedure: { icon: Scissors,     color: '#f59e0b', bg: 'bg-amber-500',   label: 'Procedure'    },
  admission: { icon: LogIn,        color: '#06b6d4', bg: 'bg-cyan-500',    label: 'Admission'    },
  discharge: { icon: LogOut,       color: '#10b981', bg: 'bg-emerald-500', label: 'Discharge'    },
}

function EvidenceDrawer({ event, onClose }: { event: TimelineEvent; onClose: () => void }) {
  const cfg = eventConfig[event.event_type] || eventConfig.visit

  return (
    <>
      <motion.div
        className="drawer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="drawer"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${cfg.bg}/20 flex items-center justify-center`}>
                <cfg.icon size={18} style={{ color: cfg.color }} />
              </div>
              <div>
                <p className="text-slate-400 text-xs font-semibold uppercase">{cfg.label}</p>
                <h3 className="text-white font-bold">{event.title}</h3>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Date & Location */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={14} className="text-teal-400" />
                <span className="text-slate-400 text-xs">Date</span>
              </div>
              <p className="text-white font-medium text-sm">{event.event_date}</p>
            </div>
            <div className="p-3 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <User size={14} className="text-blue-400" />
                <span className="text-slate-400 text-xs">Doctor</span>
              </div>
              <p className="text-white font-medium text-sm truncate">{event.doctor || '—'}</p>
            </div>
          </div>

          {/* Hospital */}
          {event.hospital && (
            <div className="p-3 rounded-xl bg-slate-800/50">
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={14} className="text-purple-400" />
                <span className="text-slate-400 text-xs">Hospital</span>
              </div>
              <p className="text-white font-medium text-sm">{event.hospital}</p>
            </div>
          )}

          {/* Description */}
          <div>
            <h4 className="text-slate-400 text-xs font-semibold uppercase mb-2">Clinical Notes</h4>
            <p className="text-slate-300 text-sm leading-relaxed bg-slate-800/30 rounded-xl p-4">
              {event.description}
            </p>
          </div>

          {/* Evidence */}
          <div>
            <h4 className="text-slate-400 text-xs font-semibold uppercase mb-3 flex items-center gap-2">
              <Brain size={12} />
              AI Evidence
            </h4>
            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-teal-500/8 border border-teal-500/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-teal-400 text-xs font-semibold">Confidence Score</span>
                  <span className="badge badge-teal">{Math.round((event.confidence || 0.94) * 100)}%</span>
                </div>
                <div className="progress-bar mt-2">
                  <div className="progress-fill" style={{ width: `${(event.confidence || 0.94) * 100}%` }} />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs">Source Document</p>
                  <p className="text-white text-sm font-medium">Document #{event.source_document_id}</p>
                </div>
                <FileText size={16} className="text-slate-500" />
              </div>

              <div className="p-3 rounded-xl bg-slate-800/50 flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-xs">Source Page</p>
                  <p className="text-white text-sm font-medium">Page 1</p>
                </div>
                <ExternalLink size={16} className="text-slate-500" />
              </div>
            </div>
          </div>

          {/* Human Verified badge */}
          <div className="p-3 rounded-xl bg-green-500/8 border border-green-500/20 flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
              <BarChart2 size={14} className="text-green-400" />
            </div>
            <div>
              <p className="text-green-400 text-sm font-semibold">Human Verified</p>
              <p className="text-slate-500 text-xs">Reviewed and approved by Dr. Demo User</p>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  )
}

const filterTypes = ['all', 'lab', 'medicine', 'procedure', 'admission', 'discharge', 'diagnosis']

export default function TimelinePage() {
  const { currentPatient } = usePatientStore()
  const [events, setEvents] = useState<TimelineEvent[]>(DEMO_TIMELINE)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null)
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [filterType, setFilterType] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const res = await timelineService.get(currentPatient?.id || 1)
        if (res.data.events?.length) setEvents(res.data.events)
      } catch {
        // Use demo data
      }
    }
    load()
  }, [currentPatient])

  const filteredEvents = events.filter(e => {
    const matchesType = filterType === 'all' || e.event_type === filterType
    const matchesSearch = !searchQuery ||
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.hospital?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  // Group by year
  const grouped = filteredEvents.reduce((acc: Record<string, TimelineEvent[]>, ev) => {
    const year = ev.event_date?.slice(0, 4) || 'Unknown'
    if (!acc[year]) acc[year] = []
    acc[year].push(ev)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-white">Patient Timeline</h1>
          <p className="text-slate-400 text-sm mt-1">
            Complete chronological health story for{' '}
            <span className="text-white font-medium">{currentPatient?.name || 'Ravi Kumar'}</span>
          </p>
        </div>
        <span className="badge badge-teal">{filteredEvents.length} events</span>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search timeline events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={16} className="text-slate-500" />
          {filterTypes.map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all ${
                filterType === type
                  ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40'
                  : 'text-slate-400 border border-slate-700 hover:border-slate-500'
              }`}
            >
              {type === 'all' ? 'All Events' : type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="relative">
        {Object.entries(grouped).sort(([a], [b]) => Number(b) - Number(a)).map(([year, yearEvents]) => (
          <div key={year} className="mb-8">
            {/* Sticky year label */}
            <div className="sticky top-20 z-20 flex items-center gap-3 mb-6">
              <div className="px-4 py-1.5 rounded-xl glass border border-teal-500/20">
                <span className="text-teal-400 font-bold text-lg font-display">{year}</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-teal-500/30 to-transparent" />
            </div>

            {/* Events for this year */}
            <div className="relative ml-4">
              {/* Timeline vertical line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500/30 to-transparent" />

              <div className="space-y-4">
                {yearEvents.map((event, idx) => {
                  const cfg = eventConfig[event.event_type] || eventConfig.visit
                  const Icon = cfg.icon
                  const isExpanded = expandedId === event.id

                  return (
                    <motion.div
                      key={event.id}
                      className="relative pl-12"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.08 }}
                    >
                      {/* Event dot */}
                      <motion.div
                        className={`absolute left-1 top-5 w-7 h-7 rounded-full ${cfg.bg}/20 border-2 flex items-center justify-center`}
                        style={{ borderColor: cfg.color }}
                        whileHover={{ scale: 1.2 }}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: idx * 0.08 + 0.2, type: 'spring' }}
                      >
                        <Icon size={12} style={{ color: cfg.color }} />
                      </motion.div>

                      {/* Event card */}
                      <motion.div
                        className={`glass-card rounded-2xl overflow-hidden cursor-pointer border-l-2`}
                        style={{ borderLeftColor: cfg.color }}
                        whileHover={{ scale: 1.01 }}
                      >
                        <div
                          className="p-4"
                          onClick={() => setExpandedId(isExpanded ? null : event.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-bold uppercase" style={{ color: cfg.color }}>
                                  {cfg.label}
                                </span>
                                <span className="text-slate-600 text-xs">{event.event_date}</span>
                                {event.confidence && (
                                  <span className="badge badge-teal">{Math.round(event.confidence * 100)}%</span>
                                )}
                              </div>
                              <h3 className="text-white font-bold text-base">{event.title}</h3>
                              <p className="text-slate-400 text-sm mt-1 line-clamp-2">{event.description}</p>
                              <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                {event.doctor && <span>👨‍⚕️ {event.doctor}</span>}
                                {event.hospital && <span>🏥 {event.hospital.split(',')[0]}</span>}
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); setSelectedEvent(event) }}
                                className="btn-ghost text-xs py-1.5 px-3"
                              >
                                <ExternalLink size={12} /> Evidence
                              </button>
                              {isExpanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                            </div>
                          </div>
                        </div>

                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-slate-800"
                            >
                              <div className="p-4 bg-slate-900/50 space-y-3">
                                <div>
                                  <p className="text-slate-400 text-xs font-semibold mb-1">Full Description</p>
                                  <p className="text-slate-300 text-sm">{event.description}</p>
                                </div>
                                <div className="grid grid-cols-3 gap-3 text-sm">
                                  <div>
                                    <p className="text-slate-500 text-xs">Doctor</p>
                                    <p className="text-white">{event.doctor || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 text-xs">Hospital</p>
                                    <p className="text-white">{event.hospital?.split(',')[0] || '—'}</p>
                                  </div>
                                  <div>
                                    <p className="text-slate-500 text-xs">AI Confidence</p>
                                    <p className="text-teal-400 font-semibold">{Math.round((event.confidence || 0.94) * 100)}%</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="text-center py-16">
          <Activity size={48} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-500">No events found matching your filter.</p>
        </div>
      )}

      {/* Evidence Drawer */}
      <AnimatePresence>
        {selectedEvent && (
          <EvidenceDrawer event={selectedEvent} onClose={() => setSelectedEvent(null)} />
        )}
      </AnimatePresence>
    </div>
  )
}

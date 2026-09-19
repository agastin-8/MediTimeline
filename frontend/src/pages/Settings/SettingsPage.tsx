import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Moon, Sun, Bell, User, Shield, Download, Globe, ChevronRight, Heart, Edit3, Check, X } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePatientStore } from '@/store/patientStore'
import { patientService } from '@/services'

export default function SettingsPage() {
  const { user } = useAuthStore()
  const { currentPatient, updatePatientName } = usePatientStore()
  const [darkMode, setDarkMode] = useState(true)
  const [language, setLanguage] = useState('en')
  const [editingPatientName, setEditingPatientName] = useState(false)
  const [patientNameInput, setPatientNameInput] = useState('')
  const [patientSaveSuccess, setPatientSaveSuccess] = useState(false)
  const [notifications, setNotifications] = useState({
    newDocuments: true,
    aiComplete: true,
    weeklyReport: false,
  })

  const handleSavePatientName = async () => {
    if (!patientNameInput.trim()) return
    const newName = patientNameInput.trim()
    updatePatientName(newName)
    if (currentPatient?.id) {
      try {
        await patientService.update(currentPatient.id, { name: newName })
      } catch (err) {
        console.error(err)
      }
    }
    setEditingPatientName(false)
    setPatientSaveSuccess(true)
    setTimeout(() => setPatientSaveSuccess(false), 2500)
  }

  const toggleDark = () => {
    setDarkMode(!darkMode)
    document.documentElement.classList.toggle('dark')
  }

  const sections = [
    {
      title: 'Appearance',
      icon: Moon,
      items: [
        {
          label: 'Dark Mode',
          desc: 'Use dark theme',
          control: (
            <button
              onClick={toggleDark}
              className={`w-12 h-6 rounded-full transition-colors relative ${darkMode ? 'bg-teal-500' : 'bg-slate-600'}`}
            >
              <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          )
        },
        {
          label: 'Language',
          desc: 'Interface language',
          control: (
            <div className="flex gap-2">
              {[{ code: 'en', label: '🇬🇧 English' }, { code: 'ta', label: '🇮🇳 Tamil' }].map(l => (
                <button
                  key={l.code}
                  onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    language === l.code ? 'bg-teal-500/20 text-teal-400 border border-teal-500/40' : 'text-slate-400 border border-slate-700'
                  }`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          )
        }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: Object.entries(notifications).map(([key, value]) => ({
        label: key === 'newDocuments' ? 'New Documents' : key === 'aiComplete' ? 'AI Extraction Complete' : 'Weekly Report',
        desc: key === 'newDocuments' ? 'When new documents are uploaded' : key === 'aiComplete' ? 'When AI finishes processing' : 'Weekly health summary',
        control: (
          <button
            onClick={() => setNotifications(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }))}
            className={`w-12 h-6 rounded-full transition-colors relative ${value ? 'bg-teal-500' : 'bg-slate-600'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${value ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        )
      }))
    }
  ]

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-display font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-1">Manage your account and preferences</p>
      </div>

      {/* Profile */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <User size={18} className="text-teal-400" />
          Profile
        </h2>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
            {user?.name?.charAt(0) || 'D'}
          </div>
          <div>
            <p className="text-white font-bold text-lg">{user?.name || 'Demo User'}</p>
            <p className="text-slate-400 text-sm">{user?.email}</p>
            <span className="badge badge-teal capitalize">{user?.role || 'doctor'}</span>
          </div>
        </div>
      </motion.div>

      {/* Active Patient Profile */}
      {currentPatient && (
        <motion.div
          className="glass-card rounded-2xl p-6 border border-teal-500/20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-bold flex items-center gap-2">
              <Heart size={18} className="text-teal-400" />
              Active Patient Details
            </h2>
            {patientSaveSuccess && (
              <span className="text-xs text-teal-400 font-medium">Saved successfully!</span>
            )}
          </div>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center text-teal-300 text-2xl font-bold">
              {currentPatient.name?.charAt(0) || 'P'}
            </div>
            <div className="flex-1">
              {editingPatientName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={patientNameInput}
                    onChange={(e) => setPatientNameInput(e.target.value)}
                    className="input-field text-sm py-1.5 px-3 w-64"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePatientName()
                      if (e.key === 'Escape') setEditingPatientName(false)
                    }}
                  />
                  <button
                    onClick={handleSavePatientName}
                    className="btn-primary text-xs py-1.5 px-3"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingPatientName(false)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="text-white font-bold text-lg">{currentPatient.name}</p>
                  <button
                    onClick={() => {
                      setPatientNameInput(currentPatient.name)
                      setEditingPatientName(true)
                    }}
                    className="p-1 text-slate-400 hover:text-teal-400 rounded-lg hover:bg-slate-800 transition-colors"
                    title="Edit patient name"
                  >
                    <Edit3 size={14} />
                  </button>
                </div>
              )}
              <p className="text-slate-400 text-sm">
                {currentPatient.blood_group || 'Unknown blood group'} · {currentPatient.gender || 'Patient'}
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Settings sections */}
      {sections.map((section, si) => (
        <motion.div
          key={section.title}
          className="glass-card rounded-2xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: (si + 1) * 0.1 }}
        >
          <h2 className="text-white font-bold mb-4 flex items-center gap-2">
            <section.icon size={18} className="text-teal-400" />
            {section.title}
          </h2>
          <div className="space-y-4">
            {section.items.map((item, ii) => (
              <div key={ii} className="flex items-center justify-between py-3 border-b border-slate-800 last:border-0">
                <div>
                  <p className="text-white text-sm font-medium">{item.label}</p>
                  <p className="text-slate-500 text-xs">{item.desc}</p>
                </div>
                {item.control}
              </div>
            ))}
          </div>
        </motion.div>
      ))}

      {/* Export */}
      <motion.div
        className="glass-card rounded-2xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <h2 className="text-white font-bold mb-4 flex items-center gap-2">
          <Download size={18} className="text-teal-400" />
          Export & Privacy
        </h2>
        <div className="space-y-3">
          <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <Download size={16} className="text-teal-400" />
              <div className="text-left">
                <p className="text-white text-sm font-medium">Export Patient Timeline</p>
                <p className="text-slate-500 text-xs">Download as PDF report</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-500" />
          </button>
          <button className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 transition-colors">
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-blue-400" />
              <div className="text-left">
                <p className="text-white text-sm font-medium">Privacy Settings</p>
                <p className="text-slate-500 text-xs">Manage data sharing preferences</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-slate-500" />
          </button>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <div className="p-4 rounded-xl border border-slate-700 text-xs text-slate-500 text-center">
        ⚕️ MediTimeline AI organizes medical documents and does not provide medical diagnosis, treatment recommendations, or clinical advice. Built for HE-05.
      </div>
    </div>
  )
}

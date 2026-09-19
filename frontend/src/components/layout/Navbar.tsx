import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, ChevronDown, Upload, User, Menu, Edit3, Check, X, Plus, CheckCircle2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePatientStore, type Patient } from '@/store/patientStore'
import { patientService } from '@/services'

interface NavbarProps {
  onMenuToggle: () => void
}

export default function Navbar({ onMenuToggle }: NavbarProps) {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { currentPatient, patients, setCurrentPatient, updatePatientName, setPatients } = usePatientStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [editingCurrentName, setEditingCurrentName] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPatientName, setNewPatientName] = useState('')
  const [newPatientDob, setNewPatientDob] = useState('')
  const [newPatientGender, setNewPatientGender] = useState('Male')
  const [newPatientBlood, setNewPatientBlood] = useState('B+')
  const [isSaving, setIsSaving] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fetch patients list on mount or when dropdown opens
  useEffect(() => {
    patientService.list()
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setPatients(res.data)
        }
      })
      .catch(() => {
        // Fallback or offline
      })
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
        setEditingCurrentName(false)
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  const handleStartEditName = (e: React.MouseEvent) => {
    e.stopPropagation()
    setNameInput(currentPatient?.name || '')
    setEditingCurrentName(true)
  }

  const handleSaveName = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!nameInput.trim()) return
    const newName = nameInput.trim()
    setIsSaving(true)
    try {
      if (currentPatient?.id) {
        await patientService.update(currentPatient.id, { name: newName })
      }
      updatePatientName(newName)
      setEditingCurrentName(false)
    } catch {
      // Local fallback
      updatePatientName(newName)
      setEditingCurrentName(false)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSelectPatient = (p: Patient) => {
    setCurrentPatient(p)
    setDropdownOpen(false)
    setEditingCurrentName(false)
  }

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPatientName.trim()) return
    setIsSaving(true)
    try {
      const res = await patientService.create({
        name: newPatientName.trim(),
        date_of_birth: newPatientDob || '1990-01-01',
        gender: newPatientGender,
        blood_group: newPatientBlood
      })
      const created: Patient = {
        id: res.data.id || Date.now(),
        name: newPatientName.trim(),
        date_of_birth: newPatientDob || '1990-01-01',
        gender: newPatientGender,
        blood_group: newPatientBlood,
        phone: null,
        email: null
      }
      setCurrentPatient(created)
      setPatients([...patients, created])
      setShowAddModal(false)
      setNewPatientName('')
      setDropdownOpen(false)
    } catch {
      const created: Patient = {
        id: Date.now(),
        name: newPatientName.trim(),
        date_of_birth: newPatientDob || '1990-01-01',
        gender: newPatientGender,
        blood_group: newPatientBlood,
        phone: null,
        email: null
      }
      setCurrentPatient(created)
      setPatients([...patients, created])
      setShowAddModal(false)
      setNewPatientName('')
      setDropdownOpen(false)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <header className="h-16 glass border-b border-slate-800/50 flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Left: Menu + Search */}
      <div className="flex items-center gap-4">
        <button onClick={onMenuToggle} className="md:hidden text-slate-400 hover:text-white">
          <Menu size={20} />
        </button>

        <div className="relative hidden md:block">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search records, documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 w-72 h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchQuery) {
                navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
                setSearchQuery('')
              }
            }}
          />
        </div>
      </div>

      {/* Right: Upload + Notifications + Patient Switcher + User */}
      <div className="flex items-center gap-3">
        <motion.button
          onClick={() => navigate('/upload')}
          className="btn-primary text-xs py-2 px-3 hidden sm:flex"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Upload size={14} />
          Upload
        </motion.button>

        <button className="relative w-9 h-9 rounded-xl glass flex items-center justify-center hover:border-teal-500/30 transition-colors">
          <Bell size={16} className="text-slate-400" />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-teal-500" />
        </button>

        {/* Patient Switcher & Name Editor Dropdown */}
        {currentPatient && (
          <div className="relative" ref={dropdownRef}>
            <div
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl glass cursor-pointer border transition-all ${
                dropdownOpen ? 'border-teal-500/50 bg-teal-500/10' : 'hover:border-teal-500/30'
              }`}
              title="Click to switch or rename patient"
            >
              <div className="w-6 h-6 rounded-full bg-teal-500/20 flex items-center justify-center">
                <User size={12} className="text-teal-400" />
              </div>
              <span className="text-white text-sm font-medium max-w-[140px] truncate">
                {currentPatient.name}
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-400 transition-transform ${dropdownOpen ? 'rotate-180 text-teal-400' : ''}`}
              />
            </div>

            {/* Dropdown Menu */}
            <AnimatePresence>
              {dropdownOpen && (
                <motion.div
                  className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl p-4 z-50 border border-teal-500/20 space-y-4"
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Current Active Patient Info & Edit */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-teal-400 uppercase tracking-wider">
                        Active Patient
                      </span>
                      {!editingCurrentName && (
                        <button
                          onClick={handleStartEditName}
                          className="flex items-center gap-1 text-xs text-slate-400 hover:text-teal-300 py-0.5 px-2 rounded-lg hover:bg-teal-500/10 transition-colors"
                          title="Rename active patient"
                        >
                          <Edit3 size={12} /> Edit Name
                        </button>
                      )}
                    </div>

                    {editingCurrentName ? (
                      <div className="space-y-2 p-2.5 rounded-xl bg-slate-800/70 border border-teal-500/30">
                        <label className="text-[11px] text-slate-400">Change Patient Name</label>
                        <input
                          type="text"
                          value={nameInput}
                          onChange={(e) => setNameInput(e.target.value)}
                          className="input-field text-xs py-1.5 w-full"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveName(e as any)
                            if (e.key === 'Escape') setEditingCurrentName(false)
                          }}
                        />
                        <div className="flex justify-end gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              setEditingCurrentName(false)
                            }}
                            className="px-2.5 py-1 text-xs rounded-lg text-slate-400 hover:bg-slate-700"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveName}
                            disabled={isSaving}
                            className="btn-primary text-xs py-1 px-3"
                          >
                            {isSaving ? 'Saving...' : 'Save Name'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-teal-500/10 border border-teal-500/20">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold text-sm">
                            {currentPatient.name?.charAt(0) || 'P'}
                          </div>
                          <div>
                            <p className="text-white text-sm font-semibold truncate max-w-[150px]">
                              {currentPatient.name}
                            </p>
                            <p className="text-slate-400 text-xs">
                              {currentPatient.blood_group || 'Unknown'} · {currentPatient.gender || 'Patient'}
                            </p>
                          </div>
                        </div>
                        <CheckCircle2 size={16} className="text-teal-400 flex-shrink-0" />
                      </div>
                    )}
                  </div>

                  {/* Switch to Other Patient */}
                  {patients.length > 1 && (
                    <div>
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">
                        Switch Patient
                      </span>
                      <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                        {patients
                          .filter((p) => p.id !== currentPatient.id)
                          .map((p) => (
                            <button
                              key={p.id}
                              onClick={() => handleSelectPatient(p)}
                              className="w-full flex items-center justify-between p-2 rounded-xl text-left hover:bg-slate-800/60 transition-colors group"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-xs text-slate-300">
                                  {p.name?.charAt(0)}
                                </div>
                                <span className="text-slate-200 text-xs font-medium group-hover:text-teal-300 truncate max-w-[160px]">
                                  {p.name}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-500 group-hover:text-slate-400">
                                Select
                              </span>
                            </button>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Add New Patient Button */}
                  <div className="pt-2 border-t border-slate-800">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowAddModal(true)
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-dashed border-teal-500/40 text-teal-400 hover:bg-teal-500/10 text-xs font-medium transition-colors"
                    >
                      <Plus size={13} />
                      Add New Patient
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* User Avatar */}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center cursor-pointer">
          <span className="text-white text-sm font-bold">
            {user?.name?.charAt(0).toUpperCase() || 'D'}
          </span>
        </div>
      </div>

      {/* Add New Patient Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-md border border-teal-500/30"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg flex items-center gap-2">
                  <User size={18} className="text-teal-400" />
                  Add New Patient
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreatePatient} className="space-y-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={newPatientName}
                    onChange={(e) => setNewPatientName(e.target.value)}
                    className="input-field w-full text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={newPatientDob}
                      onChange={(e) => setNewPatientDob(e.target.value)}
                      className="input-field w-full text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Blood Group</label>
                    <select
                      value={newPatientBlood}
                      onChange={(e) => setNewPatientBlood(e.target.value)}
                      className="input-field w-full text-sm"
                    >
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                        <option key={bg} value={bg} className="bg-slate-900 text-white">
                          {bg}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs text-slate-400 block mb-1">Gender</label>
                  <select
                    value={newPatientGender}
                    onChange={(e) => setNewPatientGender(e.target.value)}
                    className="input-field w-full text-sm"
                  >
                    <option value="Male" className="bg-slate-900 text-white">Male</option>
                    <option value="Female" className="bg-slate-900 text-white">Female</option>
                    <option value="Other" className="bg-slate-900 text-white">Other</option>
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="btn-secondary text-sm py-2 px-4"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="btn-primary text-sm py-2 px-5"
                  >
                    {isSaving ? 'Creating...' : 'Create & Switch'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  )
}

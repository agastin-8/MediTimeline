import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, LayoutDashboard, Clock, FileText, FlaskConical,
  Pill, Stethoscope, Scissors, Search, Settings, ChevronLeft,
  ChevronRight, LogOut, User, Heart
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { usePatientStore } from '@/store/patientStore'

const navItems = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/timeline', icon: Clock, label: 'Patient Timeline' },
  { path: '/documents', icon: FileText, label: 'Documents' },
  { path: '/labs', icon: FlaskConical, label: 'Lab Results' },
  { path: '/medications', icon: Pill, label: 'Medications' },
  { path: '/diagnoses', icon: Stethoscope, label: 'Diagnoses' },
  { path: '/procedures', icon: Scissors, label: 'Procedures' },
  { path: '/search', icon: Search, label: 'AI Search' },
  { path: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const { currentPatient } = usePatientStore()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <motion.aside
      className="sidebar"
      animate={{ width: collapsed ? 64 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* Logo */}
      <div className="p-4 border-b border-teal-500/10">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center flex-shrink-0 glow-teal">
            <Activity size={18} className="text-white" />
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="text-white font-display font-bold text-lg whitespace-nowrap"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                MediTimeline <span className="text-teal-400">AI</span>
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Patient Card */}
      <AnimatePresence>
        {!collapsed && currentPatient && (
          <motion.div
            className="mx-3 my-3 p-3 rounded-xl bg-teal-500/8 border border-teal-500/15"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <p className="text-slate-500 text-xs mb-1">Current Patient</p>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-teal-500/20 flex items-center justify-center">
                <User size={14} className="text-teal-400" />
              </div>
              <div>
                <p className="text-white text-sm font-semibold truncate">{currentPatient.name}</p>
                <p className="text-slate-500 text-xs">{currentPatient.blood_group} · {currentPatient.gender}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? label : undefined}
          >
            <Icon size={18} className="flex-shrink-0" />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  className="whitespace-nowrap overflow-hidden"
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-slate-800 space-y-2">
        {/* User info */}
        <AnimatePresence>
          {!collapsed && user && (
            <motion.div
              className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="w-8 h-8 rounded-full bg-teal-500/20 flex items-center justify-center flex-shrink-0">
                <Heart size={14} className="text-teal-400" />
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-white text-sm font-medium truncate">{user.name}</p>
                <p className="text-slate-500 text-xs capitalize">{user.role}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="nav-item w-full hover:text-red-400 hover:bg-red-500/10"
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut size={18} className="flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
              >
                Sign Out
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-teal-500 text-white flex items-center justify-center hover:bg-teal-400 transition-colors shadow-lg"
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </motion.aside>
  )
}

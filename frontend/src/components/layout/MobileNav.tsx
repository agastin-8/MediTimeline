import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Clock, Upload, Search, FileText } from 'lucide-react'

const mobileNav = [
  { path: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { path: '/timeline', icon: Clock, label: 'Timeline' },
  { path: '/upload', icon: Upload, label: 'Upload' },
  { path: '/search', icon: Search, label: 'AI Search' },
  { path: '/documents', icon: FileText, label: 'Docs' },
]

export default function MobileNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:hidden glass border-t border-slate-800/50">
      <div className="flex items-center justify-around py-2">
        {mobileNav.map(({ path, icon: Icon, label }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 py-2 px-4 rounded-xl transition-all ${
                isActive ? 'text-teal-400' : 'text-slate-500'
              }`
            }
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}

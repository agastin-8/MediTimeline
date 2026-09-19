import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Activity, Mail, Lock, User, Stethoscope, UserCheck, AlertCircle } from 'lucide-react'
import { authService } from '@/services'
import { useAuthStore } from '@/store/authStore'

const roles = [
  { value: 'doctor', label: 'Doctor', icon: Stethoscope, desc: 'Manage patient records' },
  { value: 'patient', label: 'Patient', icon: UserCheck, desc: 'View your own records' },
]

export default function RegisterPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [selectedRole, setSelectedRole] = useState('doctor')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: { name: '', email: '', password: '', confirmPassword: '' }
  })

  const password = watch('password')

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')
    try {
      const res = await authService.register(data.name, data.email, data.password, selectedRole)
      setAuth(res.data.user, res.data.access_token)
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="blob-1" />
      <div className="blob-3" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center glow-teal">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-white font-display font-bold text-2xl">
              MediTimeline <span className="gradient-text">AI</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Create account</h1>
          <p className="text-slate-400 mt-2">Join MediTimeline AI</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {/* Role Selection */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {roles.map((role) => (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelectedRole(role.value)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedRole === role.value
                    ? 'border-teal-500 bg-teal-500/10'
                    : 'border-slate-700 hover:border-slate-500'
                }`}
              >
                <role.icon size={20} className={selectedRole === role.value ? 'text-teal-400' : 'text-slate-400'} />
                <p className={`font-semibold text-sm mt-2 ${selectedRole === role.value ? 'text-teal-400' : 'text-slate-300'}`}>{role.label}</p>
                <p className="text-slate-500 text-xs">{role.desc}</p>
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-name"
                  className="input-field pl-10"
                  placeholder="Dr. Arjun Sharma"
                  {...register('name', { required: 'Name is required' })}
                />
              </div>
              {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="doctor@hospital.com"
                  {...register('email', { required: 'Email required' })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-password"
                  type="password"
                  className="input-field pl-10"
                  placeholder="Min. 6 characters"
                  {...register('password', { required: true, minLength: 6 })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Confirm Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="register-confirm-password"
                  type="password"
                  className="input-field pl-10"
                  placeholder="Confirm password"
                  {...register('confirmPassword', {
                    required: true,
                    validate: (val) => val === password || 'Passwords do not match'
                  })}
                />
              </div>
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                <AlertCircle size={14} />
                {error}
              </div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              {loading ? 'Creating account...' : 'Create Account'}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

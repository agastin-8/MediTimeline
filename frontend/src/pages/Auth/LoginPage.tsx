import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import { Activity, Mail, Lock, Eye, EyeOff, Sparkles, ArrowRight, AlertCircle } from 'lucide-react'
import { authService } from '@/services'
import { useAuthStore } from '@/store/authStore'
import { usePatientStore } from '@/store/patientStore'

export default function LoginPage() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const { setCurrentPatient } = usePatientStore()
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: { email: '', password: '' }
  })

  const onSubmit = async (data: any) => {
    setLoading(true)
    setError('')
    try {
      const res = await authService.login(data.email, data.password)
      setAuth(res.data.user, res.data.access_token)
      navigate('/dashboard')
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Login failed. Check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handleDemoLogin = async () => {
    setDemoLoading(true)
    setError('')
    try {
      const res = await authService.demoLogin()
      setAuth(res.data.user, res.data.access_token)
      // Pre-set demo patient
      setCurrentPatient({ id: 1, name: 'Ravi Kumar', date_of_birth: '1978-06-15', gender: 'Male', blood_group: 'B+', phone: '+91 98765 43210', email: 'ravi.kumar@email.com' })
      navigate('/dashboard')
    } catch (e: any) {
      // If backend not running, use demo mode
      setAuth({ id: 1, name: 'Dr. Demo User', email: 'demo@meditimeline.ai', role: 'doctor' }, 'demo-token')
      setCurrentPatient({ id: 1, name: 'Ravi Kumar', date_of_birth: '1978-06-15', gender: 'Male', blood_group: 'B+', phone: '+91 98765 43210', email: 'ravi.kumar@email.com' })
      navigate('/dashboard')
    } finally {
      setDemoLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 relative overflow-hidden">
      <div className="blob-1" />
      <div className="blob-2" />
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />

      <motion.div
        className="relative z-10 w-full max-w-md"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center glow-teal">
              <Activity size={20} className="text-white" />
            </div>
            <span className="text-white font-display font-bold text-2xl">
              MediTimeline <span className="gradient-text">AI</span>
            </span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-white">Welcome back</h1>
          <p className="text-slate-400 mt-2">Sign in to your account</p>
        </div>

        <div className="glass-card rounded-3xl p-8">
          {/* Demo Login Button */}
          <motion.button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-gradient-to-r from-teal-500/20 to-blue-500/20 border border-teal-500/30 text-teal-400 font-semibold text-sm hover:from-teal-500/30 hover:to-blue-500/30 transition-all mb-6"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {demoLoading ? (
              <div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles size={16} />
            )}
            Explore Demo — Ravi Kumar's Records
            <ArrowRight size={14} />
          </motion.button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-700" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#0f172a] text-slate-500">or sign in with your account</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Email</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-email"
                  type="email"
                  className="input-field pl-10"
                  placeholder="doctor@hospital.com"
                  {...register('email', { required: 'Email is required' })}
                />
              </div>
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pl-10 pr-10"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
              >
                <AlertCircle size={14} />
                {error}
              </motion.div>
            )}

            <motion.button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 justify-center"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : null}
              {loading ? 'Signing in...' : 'Sign In'}
            </motion.button>
          </form>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-teal-400 hover:text-teal-300 font-medium">
              Register
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

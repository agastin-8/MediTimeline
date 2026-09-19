import { motion, useScroll, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { 
  Activity, Brain, FileText, Shield, Search, 
  Upload, ChevronRight, CheckCircle, Zap, Lock,
  BarChart2, Clock, Users, ArrowRight, Sparkles, Heart
} from 'lucide-react'
import { useRef } from 'react'

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' as const } }
}

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } }
}

// ECG SVG Path animation
const ECGLine = () => (
  <svg className="w-full" height="60" viewBox="0 0 600 60" fill="none">
    <motion.path
      d="M0 30 L80 30 L100 10 L110 50 L120 5 L135 55 L150 30 L230 30 L250 10 L260 50 L270 5 L285 55 L300 30 L380 30 L400 10 L410 50 L420 5 L435 55 L450 30 L600 30"
      stroke="#14b8a6"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity: [0, 1, 1, 0.3] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    />
  </svg>
)

// Floating document card
const FloatingCard = ({ icon: Icon, title, subtitle, className, delay }: any) => (
  <motion.div
    className={`glass-card rounded-2xl p-4 w-52 ${className}`}
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay, duration: 0.6 }}
    whileHover={{ scale: 1.05 }}
    style={{ animation: `float ${6 + delay}s ease-in-out infinite` }}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-teal-500/20">
        <Icon size={20} className="text-teal-400" />
      </div>
      <div>
        <p className="text-white text-sm font-semibold">{title}</p>
        <p className="text-slate-400 text-xs">{subtitle}</p>
      </div>
    </div>
    <div className="mt-3 space-y-1">
      {[80, 65, 90].map((w, i) => (
        <div key={i} className="h-1.5 rounded bg-teal-500/20" style={{ width: `${w}%` }} />
      ))}
    </div>
  </motion.div>
)

const features = [
  {
    icon: Brain,
    title: "Gemini AI Extraction",
    desc: "Powered by Google Gemini, extracting diagnoses, medicines, lab results, and procedures from any medical document.",
    color: "teal"
  },
  {
    icon: Clock,
    title: "Chronological Timeline",
    desc: "All verified events automatically arranged into a beautiful, searchable patient health timeline.",
    color: "blue"
  },
  {
    icon: CheckCircle,
    title: "Human Verification",
    desc: "Every AI-extracted field requires doctor approval before entering the record. Zero fabrication.",
    color: "emerald"
  },
  {
    icon: Search,
    title: "Conversational AI Search",
    desc: "Ask natural language questions about any patient's records. Responses are 100% grounded in uploaded documents.",
    color: "purple"
  },
  {
    icon: BarChart2,
    title: "Lab Trend Analytics",
    desc: "Track Hemoglobin, Blood Sugar, HbA1c, Cholesterol trends over time with interactive charts.",
    color: "orange"
  },
  {
    icon: Shield,
    title: "Evidence-Linked Records",
    desc: "Every data point links back to the source document with confidence scores and page references.",
    color: "red"
  }
]

const steps = [
  { num: "01", title: "Upload Documents", desc: "Drag and drop PDFs, scans, MRI reports, discharge summaries — any format.", icon: Upload },
  { num: "02", title: "AI Extracts Data", desc: "Gemini reads the document and extracts structured medical entities.", icon: Brain },
  { num: "03", title: "Doctor Verifies", desc: "Review each extracted field. Accept, edit or reject. Only verified data enters records.", icon: CheckCircle },
  { num: "04", title: "Timeline Generates", desc: "Approved events instantly populate the chronological patient health story.", icon: Activity },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const y = useTransform(scrollYProgress, [0, 1], [0, -80])

  return (
    <div className="min-h-screen bg-[#020617] overflow-x-hidden">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center glow-teal">
              <Activity size={18} className="text-white" />
            </div>
            <span className="text-white font-display font-bold text-xl">
              MediTimeline <span className="gradient-text">AI</span>
            </span>
          </motion.div>

          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <button onClick={() => navigate('/login')} className="btn-ghost text-sm">
              Sign In
            </button>
            <button onClick={() => navigate('/demo-login')} className="btn-primary text-sm">
              <Sparkles size={14} />
              Try Demo
            </button>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated blobs */}
        <div className="blob-1" />
        <div className="blob-2" />
        <div className="blob-3" />

        {/* Grid */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        <motion.div className="relative z-10 text-center px-6 max-w-5xl mx-auto" style={{ y }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8"
          >
            <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-teal-400 text-sm font-medium">HE-05 · Medical Document Intelligence</span>
          </motion.div>

          <motion.h1
            className="text-6xl md:text-8xl font-display font-black text-white mb-6 leading-none tracking-tight"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            Medi<span className="gradient-text text-glow">Timeline</span>
            <br />
            <span className="text-5xl md:text-7xl text-slate-300">AI</span>
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-slate-300 mb-4 max-w-3xl mx-auto font-light"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            Turn scattered medical records into one{' '}
            <span className="text-teal-400 font-medium">intelligent patient story</span>.
          </motion.p>

          <motion.p
            className="text-slate-500 mb-10 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            AI extracts. Doctors verify. Records never fabricated. Evidence always linked.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
          >
            <button
              onClick={() => navigate('/demo-login')}
              className="btn-primary text-base px-8 py-4"
            >
              <Zap size={18} />
              Explore Demo
              <ArrowRight size={16} />
            </button>
            <button
              onClick={() => navigate('/register')}
              className="btn-secondary text-base px-8 py-4"
            >
              <Upload size={18} />
              Upload Medical Records
            </button>
          </motion.div>

          {/* ECG Line */}
          <motion.div
            className="mt-16 opacity-60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1.2 }}
          >
            <ECGLine />
          </motion.div>

          {/* Stats */}
          <motion.div
            className="mt-8 flex flex-wrap gap-8 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4 }}
          >
            {[
              { label: "AI Confidence", value: "94%" },
              { label: "Document Types", value: "10+" },
              { label: "Fields Extracted", value: "12+" },
              { label: "Evidence Linked", value: "100%" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="text-2xl font-bold text-teal-400">{s.value}</div>
                <div className="text-slate-500 text-sm">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* Floating document cards */}
        <div className="absolute left-8 top-1/3 hidden xl:block">
          <FloatingCard icon={FileText} title="Blood Report" subtitle="CBC · Mar 2025" delay={0.5} className="" />
        </div>
        <div className="absolute right-8 top-1/4 hidden xl:block">
          <FloatingCard icon={Activity} title="MRI Scan" subtitle="Lumbar · Jul 2025" delay={1} className="" />
        </div>
        <div className="absolute right-20 bottom-1/3 hidden xl:block">
          <FloatingCard icon={Heart} title="Discharge Summary" subtitle="GGH · Nov 2024" delay={1.5} className="" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-6 relative">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="badge badge-teal mb-4">Features</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              Everything your clinic needs
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From OCR to AI extraction to human verification — a complete pipeline for medical record intelligence.
            </p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={stagger}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((f, i) => (
              <motion.div key={i} variants={fadeUp} className="glass-card rounded-2xl p-6 group">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-teal-500/15 group-hover:bg-teal-500/25 transition-colors`}>
                  <f.icon size={24} className="text-teal-400" />
                </div>
                <h3 className="text-white font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-slate-900/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="badge badge-blue mb-4">How It Works</span>
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
              4 steps to a complete patient story
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="glass-card rounded-2xl p-6 h-full">
                  <div className="text-5xl font-black text-teal-500/20 font-display mb-4">{step.num}</div>
                  <div className="w-10 h-10 rounded-xl bg-teal-500/15 flex items-center justify-center mb-4">
                    <step.icon size={20} className="text-teal-400" />
                  </div>
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm">{step.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 z-10 text-slate-600">
                    <ChevronRight size={24} />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Pipeline Visual */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-12"
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <span className="badge badge-purple mb-4">AI Pipeline</span>
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              The extraction pipeline
            </h2>
            <p className="text-slate-400">From raw document to verified medical record in seconds.</p>
          </motion.div>

          <motion.div
            className="glass-card rounded-3xl p-8"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="flex flex-wrap items-center justify-center gap-3">
              {[
                "📄 Upload", "🔍 OCR", "📝 Extract Text",
                "🤖 Gemini AI", "📊 JSON Output",
                "👨‍⚕️ Human Review", "✅ Approve", "🗃️ Save to Timeline"
              ].map((stage, i) => (
                <div key={i} className="flex items-center gap-3">
                  <motion.div
                    className="px-4 py-2 rounded-xl bg-slate-800/80 border border-teal-500/20 text-sm text-slate-300 font-medium whitespace-nowrap"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    whileHover={{ borderColor: '#14b8a6', color: '#14b8a6' }}
                  >
                    {stage}
                  </motion.div>
                  {i < 7 && <ArrowRight size={14} className="text-teal-500/40" />}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent to-slate-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            <div className="w-16 h-16 rounded-2xl bg-teal-500/15 flex items-center justify-center mx-auto mb-6">
              <Lock size={32} className="text-teal-400" />
            </div>
            <span className="badge badge-teal mb-4">Security & Ethics</span>
            <h2 className="text-4xl font-display font-bold text-white mb-4">
              Medical AI you can trust
            </h2>
            <div className="grid md:grid-cols-3 gap-6 mt-10 text-left">
              {[
                { icon: Shield, title: "No Fabrication", desc: "AI only extracts what's in the document. Null for any missing field." },
                { icon: CheckCircle, title: "Human in the Loop", desc: "Every extraction must be verified by a doctor before entering records." },
                { icon: Lock, title: "Evidence Linked", desc: "Every fact links to source document, page number, and confidence score." },
              ].map((item, i) => (
                <div key={i} className="glass-card rounded-2xl p-5">
                  <item.icon size={22} className="text-teal-400 mb-3" />
                  <h4 className="text-white font-bold mb-2">{item.title}</h4>
                  <p className="text-slate-400 text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-slate-500 text-sm border border-slate-800 rounded-xl p-4 max-w-2xl mx-auto">
              ⚕️ <strong className="text-slate-400">Medical Disclaimer:</strong> MediTimeline AI organizes and summarizes medical documents. It does not provide medical diagnosis, treatment recommendations, or clinical advice.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Demo CTA */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="glass-card rounded-3xl p-12 text-center relative overflow-hidden"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-blue-500/5" />
            <div className="relative z-10">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/20 flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} className="text-teal-400" />
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
                Try the Live Demo
              </h2>
              <p className="text-slate-400 mb-8 max-w-xl mx-auto">
                Explore Ravi Kumar's complete medical timeline — 5 documents, fully processed, evidence-linked, searchable.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => navigate('/demo-login')}
                  className="btn-primary text-lg px-10 py-4"
                >
                  <Zap size={20} />
                  Load Demo Patient
                  <ArrowRight size={16} />
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="btn-secondary text-lg px-10 py-4"
                >
                  <Users size={18} />
                  Create Account
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 py-8 px-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Activity size={16} className="text-teal-500" />
          <span className="text-teal-500 font-bold">MediTimeline AI</span>
        </div>
        <p className="text-slate-600 text-sm">
          Built for HE-05 · Medical Document Intelligence & Patient Timeline · National Hackathon 2026
        </p>
      </footer>
    </div>
  )
}

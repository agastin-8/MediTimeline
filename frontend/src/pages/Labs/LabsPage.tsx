import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Area, AreaChart,
  BarChart, Bar
} from 'recharts'
import {
  FlaskConical, TrendingUp, TrendingDown, Filter, Plus, Edit2,
  Trash2, RotateCcw, Check, X, Sparkles, BarChart2, LineChart as LineIcon
} from 'lucide-react'
import { DEMO_LABS } from '@/data/demoPatient'
import { usePatientStore } from '@/store/patientStore'
import { medicalService } from '@/services'

interface LabItem {
  id: number | string
  test_name: string
  value: string | number
  unit: string
  reference_range?: string
  status: 'normal' | 'high' | 'low' | string
  test_date: string
  lab_name?: string
}

const DEFAULT_TEST_CONFIG: Record<string, { color: string; normalMin?: number; normalMax: number; unit: string }> = {
  'Hemoglobin':            { color: '#14b8a6', normalMin: 13.0, normalMax: 17.0, unit: 'g/dL' },
  'Blood Sugar (Fasting)': { color: '#3b82f6', normalMin: 70,   normalMax: 110,  unit: 'mg/dL' },
  'HbA1c':                { color: '#ef4444', normalMax: 5.7,                  unit: '%' },
  'Total Cholesterol':     { color: '#f59e0b', normalMax: 200,                  unit: 'mg/dL' },
  'Creatinine':            { color: '#8b5cf6', normalMin: 0.7,  normalMax: 1.2,  unit: 'mg/dL' },
  'Serum Potassium':       { color: '#10b981', normalMin: 3.5,  normalMax: 5.0,  unit: 'mEq/L' },
  'Platelet Count':        { color: '#06b6d4', normalMin: 150,  normalMax: 450,  unit: 'x10^3/uL' },
  'TSH':                   { color: '#ec4899', normalMin: 0.4,  normalMax: 4.0,  unit: 'mIU/L' },
}

const PALETTE = ['#14b8a6', '#3b82f6', '#ef4444', '#f59e0b', '#8b5cf6', '#10b981', '#06b6d4', '#ec4899', '#f97316']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null
  const d = payload[0]
  return (
    <div className="glass-card rounded-xl p-3 text-sm shadow-xl border border-slate-700/80">
      <p className="text-slate-400 mb-1 text-xs">{label}</p>
      <p className="text-white font-bold text-base">{d.value} {d.payload?.unit}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`inline-block w-2 h-2 rounded-full ${
          d.payload?.status === 'normal' ? 'bg-emerald-400' :
          d.payload?.status === 'high' ? 'bg-rose-400' : 'bg-amber-400'
        }`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${
          d.payload?.status === 'normal' ? 'text-emerald-400' :
          d.payload?.status === 'high' ? 'text-rose-400' : 'text-amber-400'
        }`}>
          {d.payload?.status}
        </span>
      </div>
      {d.payload?.lab_name && (
        <p className="text-slate-500 text-xs mt-1 border-t border-slate-700/50 pt-1">
          {d.payload.lab_name}
        </p>
      )}
    </div>
  )
}

export default function LabsPage() {
  const { currentPatient } = usePatientStore()
  const [labs, setLabs] = useState<LabItem[]>(DEMO_LABS)
  const [selectedTest, setSelectedTest] = useState('HbA1c')
  const [dateFilter, setDateFilter] = useState<'30d' | '6m' | '1y' | 'all'>('all')
  const [chartType, setChartType] = useState<'area' | 'bar'>('area')

  // Modal / Add / Edit states
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<LabItem | null>(null)
  
  // Form State for new / edit item
  const [formData, setFormData] = useState({
    test_name: 'HbA1c',
    custom_test_name: '',
    value: '7.2',
    unit: '%',
    reference_range: '< 5.7 %',
    status: 'high',
    test_date: new Date().toISOString().slice(0, 10),
    lab_name: 'Apollo Diagnostics'
  })

  // Load labs from backend or fallback to demo
  useEffect(() => {
    const load = async () => {
      try {
        const res = await medicalService.getLabs(currentPatient?.id || 1)
        if (res.data?.length) {
          setLabs(res.data)
        }
      } catch {
        // use initial demo labs
      }
    }
    load()
  }, [currentPatient])

  // Get all unique test names present in data
  const testNames = useMemo(() => {
    const names = Array.from(new Set(labs.map(l => l.test_name)))
    return names.length > 0 ? names : Object.keys(DEFAULT_TEST_CONFIG)
  }, [labs])

  // Auto-fallback if selected test has no entries
  useEffect(() => {
    if (testNames.length > 0 && !testNames.includes(selectedTest)) {
      setSelectedTest(testNames[0])
    }
  }, [testNames, selectedTest])

  // Get configuration (colors, normal limits, unit) dynamically
  const config = useMemo(() => {
    if (DEFAULT_TEST_CONFIG[selectedTest]) {
      return DEFAULT_TEST_CONFIG[selectedTest]
    }
    const sample = labs.find(l => l.test_name === selectedTest)
    const idx = Math.abs(selectedTest.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % PALETTE.length
    return {
      color: PALETTE[idx],
      normalMax: 100,
      unit: sample?.unit || ''
    }
  }, [selectedTest, labs])

  // Filter and process chart data dynamically based on dateFilter
  const chartData = useMemo(() => {
    const now = new Date()
    let cutoff = new Date(0) // all time

    if (dateFilter === '30d') {
      cutoff = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
    } else if (dateFilter === '6m') {
      cutoff = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000)
    } else if (dateFilter === '1y') {
      cutoff = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
    }

    return labs
      .filter(l => l.test_name === selectedTest)
      .filter(l => {
        if (dateFilter === 'all') return true
        const d = new Date(l.test_date)
        return !isNaN(d.getTime()) && d >= cutoff
      })
      .sort((a, b) => (a.test_date || '').localeCompare(b.test_date || ''))
      .map(l => ({
        id: l.id,
        date: l.test_date || '',
        value: parseFloat(String(l.value)) || 0,
        status: l.status,
        unit: l.unit,
        lab_name: l.lab_name,
        reference_range: l.reference_range
      }))
  }, [labs, selectedTest, dateFilter])

  // Metric summaries
  const latestItem = chartData[chartData.length - 1]
  const latestValue = latestItem?.value
  const prevValue = chartData[chartData.length - 2]?.value
  const trend = latestValue !== undefined && prevValue !== undefined ? latestValue - prevValue : 0

  const stats = useMemo(() => {
    if (chartData.length === 0) return { min: 0, max: 0, avg: 0 }
    const values = chartData.map(d => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const avg = values.reduce((a, b) => a + b, 0) / values.length
    return { min, max, avg: parseFloat(avg.toFixed(1)) }
  }, [chartData])

  // Handlers for Add / Edit / Delete
  const handleOpenAdd = () => {
    setEditingItem(null)
    setFormData({
      test_name: selectedTest || 'HbA1c',
      custom_test_name: '',
      value: '7.5',
      unit: config.unit || '%',
      reference_range: DEFAULT_TEST_CONFIG[selectedTest] ? `< ${DEFAULT_TEST_CONFIG[selectedTest].normalMax}` : '',
      status: 'normal',
      test_date: new Date().toISOString().slice(0, 10),
      lab_name: 'Apollo Diagnostics'
    })
    setIsAddOpen(true)
  }

  const handleOpenEdit = (item: LabItem) => {
    setEditingItem(item)
    setFormData({
      test_name: item.test_name,
      custom_test_name: '',
      value: String(item.value),
      unit: item.unit,
      reference_range: item.reference_range || '',
      status: item.status,
      test_date: item.test_date,
      lab_name: item.lab_name || 'Apollo Diagnostics'
    })
    setIsAddOpen(true)
  }

  const handleSaveLab = async (e: React.FormEvent) => {
    e.preventDefault()
    const finalTestName = formData.test_name === 'OTHER' ? (formData.custom_test_name || 'Custom Test') : formData.test_name

    // Auto calculate status if normal limits exist
    let calculatedStatus = formData.status
    const numVal = parseFloat(formData.value)
    const testCfg = DEFAULT_TEST_CONFIG[finalTestName]
    if (testCfg && !isNaN(numVal)) {
      if (testCfg.normalMax && numVal > testCfg.normalMax) {
        calculatedStatus = 'high'
      } else if (testCfg.normalMin && numVal < testCfg.normalMin) {
        calculatedStatus = 'low'
      } else {
        calculatedStatus = 'normal'
      }
    }

    if (editingItem) {
      // Update existing item
      const updatedList = labs.map(l => {
        if (l.id === editingItem.id) {
          return {
            ...l,
            test_name: finalTestName,
            value: formData.value,
            unit: formData.unit,
            reference_range: formData.reference_range,
            status: calculatedStatus,
            test_date: formData.test_date,
            lab_name: formData.lab_name
          }
        }
        return l
      })
      setLabs(updatedList)

      // Sync with backend if numeric ID
      if (typeof editingItem.id === 'number') {
        try {
          await medicalService.updateLab(editingItem.id, {
            value: formData.value,
            unit: formData.unit,
            reference_range: formData.reference_range,
            status: calculatedStatus,
            test_date: formData.test_date,
            lab_name: formData.lab_name
          })
        } catch {}
      }
    } else {
      // Add new item
      const newItem: LabItem = {
        id: Date.now(),
        test_name: finalTestName,
        value: formData.value,
        unit: formData.unit,
        reference_range: formData.reference_range,
        status: calculatedStatus,
        test_date: formData.test_date,
        lab_name: formData.lab_name
      }
      setLabs([newItem, ...labs])
      setSelectedTest(finalTestName)

      // Sync with backend
      try {
        await medicalService.createLab({
          patient_id: currentPatient?.id || 1,
          test_name: finalTestName,
          value: formData.value,
          unit: formData.unit,
          reference_range: formData.reference_range,
          status: calculatedStatus,
          test_date: formData.test_date,
          lab_name: formData.lab_name
        })
      } catch {}
    }

    setIsAddOpen(false)
  }

  const handleDeleteLab = async (id: number | string) => {
    setLabs(labs.filter(l => l.id !== id))
    if (typeof id === 'number') {
      try {
        await medicalService.deleteLab(id)
      } catch {}
    }
  }

  const handleResetDemo = () => {
    setLabs(DEMO_LABS)
    setSelectedTest('HbA1c')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-white">Lab Results & Analytics</h1>
            <span className="bg-teal-500/20 text-teal-400 text-xs px-2.5 py-0.5 rounded-full border border-teal-500/30 flex items-center gap-1">
              <Sparkles size={12} /> Live Interactive
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Tracking <span className="text-teal-400 font-semibold">{labs.length}</span> lab records across{' '}
            <span className="text-teal-400 font-semibold">{testNames.length}</span> tests for{' '}
            <span className="text-white font-medium">{currentPatient?.name || 'Ravi Kumar'}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={handleResetDemo}
            className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-all flex items-center gap-1.5"
            title="Reset data back to initial demo state"
          >
            <RotateCcw size={14} /> Reset Demo
          </button>
          <motion.button
            onClick={handleOpenAdd}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-teal-500 to-emerald-600 text-white shadow-lg shadow-teal-500/20 hover:from-teal-400 hover:to-emerald-500 transition-all flex items-center gap-1.5"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            <Plus size={16} /> Add / Change Lab Data
          </motion.button>
        </div>
      </div>

      {/* Date Filter & Chart Type Toggle */}
      <div className="flex items-center justify-between gap-4 flex-wrap bg-slate-900/60 p-3 rounded-2xl border border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter size={15} className="text-slate-400 ml-1" />
          <span className="text-xs font-semibold text-slate-400 mr-1">Time Range:</span>
          {(['30d', '6m', '1y', 'all'] as const).map(f => (
            <button
              key={f}
              onClick={() => setDateFilter(f)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                dateFilter === f
                  ? 'bg-teal-500 text-white shadow-md shadow-teal-500/20'
                  : 'text-slate-400 bg-slate-800/50 hover:bg-slate-800 hover:text-white'
              }`}
            >
              {f === 'all' ? 'All Time' : f === '30d' ? '30 Days' : f === '6m' ? '6 Months' : '1 Year'}
            </button>
          ))}
        </div>

        {/* Chart Style Toggle */}
        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
          <button
            onClick={() => setChartType('area')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              chartType === 'area' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Area Trend Chart"
          >
            <LineIcon size={14} /> Area
          </button>
          <button
            onClick={() => setChartType('bar')}
            className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
              chartType === 'bar' ? 'bg-teal-500 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
            title="Bar Chart View"
          >
            <BarChart2 size={14} /> Bars
          </button>
        </div>
      </div>

      {/* Test Selector Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {testNames.map(test => {
          const cfg = DEFAULT_TEST_CONFIG[test] || { color: '#14b8a6', unit: '' }
          const testLabs = labs.filter(l => l.test_name === test).sort((a, b) => (b.test_date || '').localeCompare(a.test_date || ''))
          const latest = testLabs[0]
          const isSelected = selectedTest === test

          return (
            <motion.button
              key={test}
              onClick={() => setSelectedTest(test)}
              className={`p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between ${
                isSelected
                  ? 'border-teal-500/80 bg-teal-950/30 ring-2 ring-teal-500/30 shadow-lg shadow-teal-500/10'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {isSelected && (
                <div
                  className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-400 to-emerald-500"
                />
              )}
              <div>
                <p className="text-slate-400 text-xs font-medium truncate mb-1" title={test}>{test}</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-white font-bold text-xl font-display">{latest?.value || '—'}</span>
                  <span className="text-slate-500 text-xs">{latest?.unit || cfg.unit}</span>
                </div>
              </div>

              <div className="mt-2.5 flex items-center justify-between">
                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                  latest?.status === 'normal' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                  latest?.status === 'high' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                  'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {latest?.status || 'recorded'}
                </span>
                <span className="text-[10px] text-slate-500">{testLabs.length} pts</span>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Main Dynamic Chart Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={selectedTest + '-' + dateFilter + '-' + chartType}
          className="glass-card rounded-2xl p-6 relative overflow-hidden border border-slate-800"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
        >
          {/* Header of the Selected Chart */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-white font-bold text-2xl font-display">{selectedTest}</h2>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                  {chartData.length} data point{chartData.length !== 1 ? 's' : ''} in view
                </span>
              </div>
              
              <div className="flex items-center gap-3 mt-2">
                <span className="text-4xl font-display font-black text-white">
                  {latestValue !== undefined ? latestValue : 'No data'}
                </span>
                <span className="text-slate-400 font-medium">{config?.unit}</span>
                {trend !== 0 && (
                  <span className={`flex items-center gap-1 text-sm font-bold px-2.5 py-0.5 rounded-full ${
                    (trend < 0 && selectedTest !== 'Hemoglobin') || (trend > 0 && selectedTest === 'Hemoglobin')
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : 'bg-rose-500/20 text-rose-400'
                  }`}>
                    {trend > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    {trend > 0 ? '+' : ''}{trend.toFixed(1)} change
                  </span>
                )}
              </div>

              {config && (
                <p className="text-slate-400 text-xs mt-1.5 flex items-center gap-1">
                  <span>Reference Range:</span>
                  <span className="text-teal-400 font-semibold">
                    {config.normalMin ? `${config.normalMin} – ` : '< '}{config.normalMax} {config.unit}
                  </span>
                </p>
              )}
            </div>

            {/* Quick Summary Stats (Min, Max, Avg) */}
            <div className="flex items-center gap-3 bg-slate-900/80 p-3 rounded-2xl border border-slate-800">
              <div className="text-center px-2">
                <p className="text-[11px] text-slate-400">Min</p>
                <p className="text-sm font-bold text-white">{stats.min} <span className="text-[10px] text-slate-500">{config.unit}</span></p>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center px-2">
                <p className="text-[11px] text-slate-400">Average</p>
                <p className="text-sm font-bold text-teal-400">{stats.avg} <span className="text-[10px] text-slate-500">{config.unit}</span></p>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-center px-2">
                <p className="text-[11px] text-slate-400">Max</p>
                <p className="text-sm font-bold text-white">{stats.max} <span className="text-[10px] text-slate-500">{config.unit}</span></p>
              </div>
            </div>
          </div>

          {/* The Interactive Chart */}
          {chartData.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' ? (
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                    <defs>
                      <linearGradient id="colorGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={config?.color || '#14b8a6'} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={config?.color || '#14b8a6'} stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
                    <Tooltip content={<CustomTooltip />} />
                    {config?.normalMax && (
                      <ReferenceLine
                        y={config.normalMax}
                        stroke="#ef4444"
                        strokeDasharray="4 3"
                        label={{ value: `Max Normal (${config.normalMax})`, fill: '#ef4444', fontSize: 10, position: 'insideTopRight' }}
                      />
                    )}
                    {config?.normalMin && (
                      <ReferenceLine
                        y={config.normalMin}
                        stroke="#f59e0b"
                        strokeDasharray="4 3"
                        label={{ value: `Min Normal (${config.normalMin})`, fill: '#f59e0b', fontSize: 10, position: 'insideBottomRight' }}
                      />
                    )}
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke={config?.color || '#14b8a6'}
                      strokeWidth={3}
                      fill="url(#colorGrad)"
                      dot={{ r: 5, fill: config?.color || '#14b8a6', strokeWidth: 2, stroke: '#0f172a' }}
                      activeDot={{ r: 8, stroke: '#fff', strokeWidth: 2 }}
                      animationDuration={800}
                    />
                  </AreaChart>
                ) : (
                  <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 10, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar
                      dataKey="value"
                      fill={config?.color || '#14b8a6'}
                      radius={[8, 8, 0, 0]}
                      animationDuration={800}
                    />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-48 flex flex-col items-center justify-center text-center p-6 border border-dashed border-slate-800 rounded-xl">
              <FlaskConical size={36} className="text-slate-600 mb-2" />
              <p className="text-slate-400 font-medium">No records found for this time filter</p>
              <button
                onClick={() => setDateFilter('all')}
                className="mt-2 text-xs text-teal-400 underline font-semibold"
              >
                Show all time records
              </button>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* All lab results table with inline Edit & Delete */}
      <motion.div
        className="glass-card rounded-2xl overflow-hidden border border-slate-800"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FlaskConical size={18} className="text-teal-400" />
            <h3 className="text-white font-bold">
              Lab Records for {selectedTest} ({chartData.length})
            </h3>
          </div>
          <button
            onClick={handleOpenAdd}
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1"
          >
            <Plus size={14} /> Add Data Point
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-900/40">
                {['Test Name', 'Value', 'Unit', 'Reference Range', 'Status', 'Date', 'Lab Center', 'Actions'].map(h => (
                  <th key={h} className="text-left text-slate-400 text-xs font-semibold px-4 py-3 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {labs
                .filter(l => l.test_name === selectedTest)
                .sort((a, b) => (b.test_date || '').localeCompare(a.test_date || ''))
                .map((lab) => (
                  <tr
                    key={lab.id}
                    className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="px-4 py-3 text-white font-medium">{lab.test_name}</td>
                    <td className="px-4 py-3 text-white font-bold text-base">{lab.value}</td>
                    <td className="px-4 py-3 text-slate-400">{lab.unit}</td>
                    <td className="px-4 py-3 text-slate-400">{lab.reference_range || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`badge ${
                        lab.status === 'normal' ? 'badge-normal' :
                        lab.status === 'high' ? 'badge-high' :
                        lab.status === 'low' ? 'badge-low' : 'badge-high'
                      }`}>
                        {lab.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-300 font-mono text-xs">{lab.test_date}</td>
                    <td className="px-4 py-3 text-slate-400 text-xs">{lab.lab_name || 'Apollo Diagnostics'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleOpenEdit(lab)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-teal-400 hover:bg-teal-500/10 transition-all"
                          title="Edit this value"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteLab(lab.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                          title="Delete this data point"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Modal for Adding / Editing Lab Data */}
      <AnimatePresence>
        {isAddOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              className="glass-card rounded-2xl p-6 w-full max-w-md border border-slate-700 shadow-2xl relative"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FlaskConical size={20} className="text-teal-400" />
                  <h3 className="text-lg font-bold text-white">
                    {editingItem ? 'Edit Lab Reading' : 'Add New Lab Reading'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsAddOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleSaveLab} className="space-y-4 mt-4">
                {/* Test Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Test Name</label>
                  <select
                    value={formData.test_name}
                    onChange={(e) => {
                      const val = e.target.value
                      const defaultCfg = DEFAULT_TEST_CONFIG[val]
                      setFormData({
                        ...formData,
                        test_name: val,
                        unit: defaultCfg?.unit || formData.unit,
                        reference_range: defaultCfg ? `< ${defaultCfg.normalMax} ${defaultCfg.unit}` : formData.reference_range
                      })
                    }}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  >
                    {Object.keys(DEFAULT_TEST_CONFIG).map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                    <option value="OTHER">+ Other Custom Test...</option>
                  </select>
                </div>

                {formData.test_name === 'OTHER' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Custom Test Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Thyroid TSH or Vitamin D"
                      value={formData.custom_test_name}
                      onChange={(e) => setFormData({ ...formData, custom_test_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                )}

                {/* Value & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Value (Number)</label>
                    <input
                      type="text"
                      placeholder="e.g. 6.9 or 140"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                    <input
                      type="text"
                      placeholder="e.g. mg/dL or %"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                {/* Date & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Test Date</label>
                    <input
                      type="date"
                      value={formData.test_date}
                      onChange={(e) => setFormData({ ...formData, test_date: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Status (Optional override)</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Lab Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lab / Diagnostic Center</label>
                  <input
                    type="text"
                    value={formData.lab_name}
                    onChange={(e) => setFormData({ ...formData, lab_name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-teal-500 hover:bg-teal-400 text-white shadow-lg shadow-teal-500/20 flex items-center gap-1.5"
                  >
                    <Check size={16} /> {editingItem ? 'Save Changes' : 'Add to Chart'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}

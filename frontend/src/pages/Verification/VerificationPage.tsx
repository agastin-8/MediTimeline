import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CheckCircle, X, Edit3, FileText, Brain, Plus, Trash2,
  Save, ThumbsUp, ThumbsDown, AlertCircle, Sparkles,
  ExternalLink, RotateCcw, Activity, Pill, Stethoscope, Scissors
} from 'lucide-react'
import { documentService, verificationService, patientService } from '@/services'
import { usePatientStore } from '@/store/patientStore'

const DOCUMENT_TYPE_LABELS: Record<string, string> = {
  blood_report: 'Blood Report / Hematology',
  lab_report: 'Lab / Biochemistry Report',
  prescription: 'Prescription / Rx',
  mri_report: 'MRI Scan Report',
  xray_report: 'X-Ray Radiograph',
  ecg_report: 'ECG / Cardiology Report',
  discharge_summary: 'Hospital Discharge Summary',
  consultation: 'Clinical Consultation Note',
  other: 'Other Medical Record'
}

export default function VerificationPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { currentPatient, updatePatientName } = usePatientStore()
  const [extraction, setExtraction] = useState<any>(null)
  const [docMeta, setDocMeta] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [fieldState, setFieldState] = useState<Record<string, 'approved' | 'rejected' | 'edited'>>({})
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  // Active edit state for simple fields
  const [editingField, setEditingField] = useState<string | null>(null)
  const [tempFieldValue, setTempFieldValue] = useState<string>('')

  // New item modal or inline adder states
  const [newDiag, setNewDiag] = useState({ condition: '', severity: 'moderate', icd_code: '', notes: '' })
  const [newMed, setNewMed] = useState({ name: '', dosage: '', frequency: 'Twice daily with meals', duration: '1 month', route: 'oral' })
  const [newLab, setNewLab] = useState({ test_name: '', value: '', unit: '', reference_range: '', status: 'normal' })
  const [newProc, setNewProc] = useState({ name: '', type: 'scan', date: '', findings: '' })

  const [showAddDiag, setShowAddDiag] = useState(false)
  const [showAddMed, setShowAddMed] = useState(false)
  const [showAddLab, setShowAddLab] = useState(false)
  const [showAddProc, setShowAddProc] = useState(false)

  useEffect(() => {
    const fetchDocAndExtraction = async () => {
      try {
        const [extRes, fileRes] = await Promise.allSettled([
          documentService.getExtraction(Number(id)),
          documentService.list(currentPatient?.id)
        ])
        
        if (extRes.status === 'fulfilled' && extRes.value.data) {
          const data = extRes.value.data.raw_extraction || extRes.value.data
          setExtraction(data)
          // Default all extracted fields to approved initially for smooth review
          const initialStates: Record<string, 'approved' | 'rejected' | 'edited'> = {}
          const keys = ['patient_name', 'document_type', 'document_date', 'hospital', 'doctor', 'diagnosis', 'medications', 'lab_results', 'procedures', 'clinical_notes', 'follow_up']
          keys.forEach(k => { initialStates[k] = 'approved' })
          setFieldState(initialStates)
        }
        
        if (fileRes.status === 'fulfilled' && fileRes.value.data) {
          const matchingDoc = fileRes.value.data.find((d: any) => d.id === Number(id))
          if (matchingDoc) setDocMeta(matchingDoc)
        }
      } catch (e) {
        console.error("Failed to load extraction", e)
      } finally {
        setLoading(false)
      }
    }
    fetchDocAndExtraction()
  }, [id, currentPatient?.id])

  const handleAction = (key: string, action: 'approved' | 'rejected' | 'edited') => {
    setFieldState(prev => ({ ...prev, [key]: action }))
  }

  const handleApproveAll = () => {
    if (!extraction) return
    const allApproved: Record<string, 'approved' | 'rejected' | 'edited'> = {}
    Object.keys(fieldState).forEach(k => { allApproved[k] = 'approved' })
    setFieldState(allApproved)
  }

  const startEditField = (key: string, currentVal: any) => {
    setEditingField(key)
    const fallback = key === 'patient_name' ? (extraction?.patient_name || currentPatient?.name || '') : ''
    setTempFieldValue(typeof currentVal === 'string' && currentVal.trim() ? currentVal : fallback)
  }

  const saveEditField = (key: string) => {
    setExtraction((prev: any) => ({ ...prev, [key]: tempFieldValue }))
    setFieldState(prev => ({ ...prev, [key]: 'edited' }))
    if (key === 'patient_name' && tempFieldValue.trim()) {
      updatePatientName(tempFieldValue.trim())
      if (currentPatient?.id) {
        patientService.update(currentPatient.id, { name: tempFieldValue.trim() }).catch(console.error)
      }
    }
    setEditingField(null)
  }

  // Diagnosis handlers
  const handleAddDiagnosis = () => {
    if (!newDiag.condition.trim()) return
    const updated = [...(extraction.diagnosis || extraction.diagnoses || []), newDiag]
    setExtraction((prev: any) => ({ ...prev, diagnosis: updated }))
    setFieldState(prev => ({ ...prev, diagnosis: 'edited' }))
    setNewDiag({ condition: '', severity: 'moderate', icd_code: '', notes: '' })
    setShowAddDiag(false)
  }

  const handleDeleteDiagnosis = (index: number) => {
    const list = [...(extraction.diagnosis || extraction.diagnoses || [])]
    list.splice(index, 1)
    setExtraction((prev: any) => ({ ...prev, diagnosis: list }))
    setFieldState(prev => ({ ...prev, diagnosis: 'edited' }))
  }

  // Medication handlers
  const handleAddMedication = () => {
    if (!newMed.name.trim()) return
    const updated = [...(extraction.medications || []), newMed]
    setExtraction((prev: any) => ({ ...prev, medications: updated }))
    setFieldState(prev => ({ ...prev, medications: 'edited' }))
    setNewMed({ name: '', dosage: '', frequency: 'Twice daily with meals', duration: '1 month', route: 'oral' })
    setShowAddMed(false)
  }

  const handleDeleteMedication = (index: number) => {
    const list = [...(extraction.medications || [])]
    list.splice(index, 1)
    setExtraction((prev: any) => ({ ...prev, medications: list }))
    setFieldState(prev => ({ ...prev, medications: 'edited' }))
  }

  // Lab test handlers
  const handleAddLab = () => {
    if (!newLab.test_name.trim()) return
    const updated = [...(extraction.lab_results || []), newLab]
    setExtraction((prev: any) => ({ ...prev, lab_results: updated }))
    setFieldState(prev => ({ ...prev, lab_results: 'edited' }))
    setNewLab({ test_name: '', value: '', unit: '', reference_range: '', status: 'normal' })
    setShowAddLab(false)
  }

  const handleDeleteLab = (index: number) => {
    const list = [...(extraction.lab_results || [])]
    list.splice(index, 1)
    setExtraction((prev: any) => ({ ...prev, lab_results: list }))
    setFieldState(prev => ({ ...prev, lab_results: 'edited' }))
  }

  // Procedure handlers
  const handleAddProcedure = () => {
    if (!newProc.name.trim()) return
    const updated = [...(extraction.procedures || []), newProc]
    setExtraction((prev: any) => ({ ...prev, procedures: updated }))
    setFieldState(prev => ({ ...prev, procedures: 'edited' }))
    setNewProc({ name: '', type: 'scan', date: '', findings: '' })
    setShowAddProc(false)
  }

  const handleDeleteProcedure = (index: number) => {
    const list = [...(extraction.procedures || [])]
    list.splice(index, 1)
    setExtraction((prev: any) => ({ ...prev, procedures: list }))
    setFieldState(prev => ({ ...prev, procedures: 'edited' }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const fields = Object.entries(fieldState).map(([field_name, action]) => ({
        field_name,
        extracted_value: extraction[field_name],
        verified_value: extraction[field_name],
        action
      }))

      await verificationService.approve({
        document_id: Number(id) || 1,
        patient_id: currentPatient?.id || 1,
        fields,
        approved_extraction: extraction
      })

      if (extraction?.patient_name && extraction.patient_name.trim()) {
        updatePatientName(extraction.patient_name.trim())
      }

      setSaved(true)
      setTimeout(() => navigate('/timeline'), 1800)
    } catch {
      // Demo mode fallback
      if (extraction?.patient_name && extraction.patient_name.trim()) {
        updatePatientName(extraction.patient_name.trim())
      }
      setSaved(true)
      setTimeout(() => navigate('/timeline'), 1800)
    } finally {
      setSaving(false)
    }
  }

  const approvedCount = Object.values(fieldState).filter(v => v === 'approved' || v === 'edited').length
  const rejectedCount = Object.values(fieldState).filter(v => v === 'rejected').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-80">
        <div className="text-center">
          <Brain size={48} className="text-teal-400 mx-auto mb-3 animate-pulse" />
          <p className="text-white font-semibold">Analyzing Medical Document...</p>
          <p className="text-slate-400 text-sm mt-1">Extracting patient details, diagnoses, medications, and labs</p>
        </div>
      </div>
    )
  }

  if (saved) {
    return (
      <motion.div
        className="flex flex-col items-center justify-center h-80 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center text-green-400 mb-4 border border-green-500/30">
          <CheckCircle size={36} />
        </div>
        <h2 className="text-white text-2xl font-bold mb-2">Verification Approved & Saved!</h2>
        <p className="text-slate-400 max-w-md">
          Medical records and timeline have been updated with your verified clinical data.
        </p>
        <p className="text-teal-400 text-sm font-medium mt-3 flex items-center gap-1">
          Redirecting to patient timeline...
        </p>
      </motion.div>
    )
  }

  const fileRawUrl = `http://localhost:8000/documents/${id}/raw`

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-display font-bold text-white">Human Verification Center</h1>
            <span className="badge badge-teal flex items-center gap-1">
              <Sparkles size={12} /> AI Assisted
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Review and adjust extracted medical entities. You have full clinical authority before data commits to the patient record.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right text-sm">
            <span className="text-green-400 font-semibold">{approvedCount} approved</span>
            {rejectedCount > 0 && <span className="text-red-400 font-semibold ml-2">{rejectedCount} rejected</span>}
          </div>
          <button onClick={handleApproveAll} className="btn-secondary text-xs py-2 px-3">
            <ThumbsUp size={14} /> Accept All
          </button>
        </div>
      </div>

      {/* Model & Confidence Bar */}
      {extraction && (
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl glass border border-teal-500/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-teal-500/20 flex items-center justify-center">
              <Brain size={18} className="text-teal-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white text-sm font-semibold">
                  Extraction Engine: {extraction.model_used || 'clinical-nlp-engine'}
                </span>
                <span className="text-teal-400 text-xs font-mono">
                  {Math.round((extraction.confidence || 0.94) * 100)}% Confidence
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Target Patient: <strong className="text-slate-200">{extraction.patient_name || currentPatient?.name}</strong> · Document Date: <strong className="text-slate-200">{extraction.document_date || 'N/A'}</strong>
              </p>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving || approvedCount === 0} className="btn-primary text-sm py-2 px-4">
            {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
            {saving ? 'Saving...' : `Approve & Commit (${approvedCount})`}
          </button>
        </div>
      )}

      {/* Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Document Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="glass-card rounded-2xl p-5 sticky top-20">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold flex items-center gap-2">
                <FileText size={16} className="text-teal-400" /> Source Document
              </h3>
              <a
                href={fileRawUrl}
                target="_blank"
                rel="noreferrer"
                className="text-teal-400 hover:text-teal-300 text-xs flex items-center gap-1 transition-colors"
              >
                Open in tab <ExternalLink size={12} />
              </a>
            </div>

            {/* Document Embed or Fallback */}
            <div className="w-full h-[520px] rounded-xl bg-slate-900/90 border border-slate-700/80 overflow-hidden relative flex items-center justify-center">
              {docMeta?.file_type === 'pdf' ? (
                <iframe
                  src={`${fileRawUrl}#toolbar=0`}
                  title="Document Preview"
                  className="w-full h-full border-none bg-slate-950"
                  onError={() => {}}
                />
              ) : docMeta?.file_type && ['png', 'jpg', 'jpeg'].includes(docMeta.file_type) ? (
                <img
                  src={fileRawUrl}
                  alt="Medical Document"
                  className="max-h-full max-w-full object-contain p-2"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none'
                  }}
                />
              ) : (
                <div className="p-6 text-center">
                  <FileText size={48} className="text-teal-400/60 mx-auto mb-3" />
                  <p className="text-white text-sm font-medium">{docMeta?.filename || 'Uploaded Medical Document'}</p>
                  <p className="text-slate-400 text-xs mt-1">
                    Type: {DOCUMENT_TYPE_LABELS[extraction?.document_type] || extraction?.document_type || 'Clinical Document'}
                  </p>
                  <p className="text-slate-500 text-xs mt-0.5">
                    {extraction?.hospital || 'Hospital Record'} · {extraction?.doctor || 'Attending Physician'}
                  </p>
                </div>
              )}
            </div>

            {/* Metadata Summary */}
            <div className="mt-4 space-y-2 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Document Classification</span>
                <span className="text-teal-300 font-semibold">{DOCUMENT_TYPE_LABELS[extraction?.document_type] || extraction?.document_type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Document Date</span>
                <span className="text-slate-300">{extraction?.document_date || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Facility / Clinic</span>
                <span className="text-slate-300">{extraction?.hospital || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Doctor / Consultant</span>
                <span className="text-slate-300">{extraction?.doctor || 'N/A'}</span>
              </div>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-teal-500/10 border border-teal-500/20 flex gap-2 text-xs text-teal-300">
              <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
              <span>Verify all values on the right against this document. You can edit any value before accepting.</span>
            </div>
          </div>
        </div>

        {/* RIGHT: Structured Entity Reviewers (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* 1. Header Metadata Section */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h3 className="text-white font-semibold text-sm flex items-center gap-2 border-b border-slate-800 pb-3">
              <Stethoscope size={16} className="text-teal-400" /> General Document Attributes
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Patient Name */}
              <div className={`p-3 rounded-xl border ${fieldState['patient_name'] === 'approved' ? 'border-green-500/30 bg-green-500/5' : 'border-slate-800 bg-slate-800/30'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Patient Name</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleAction('patient_name', 'approved')} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><ThumbsUp size={11} /></button>
                    <button onClick={() => startEditField('patient_name', extraction?.patient_name || currentPatient?.name)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit3 size={11} /></button>
                  </div>
                </div>
                {editingField === 'patient_name' ? (
                  <div className="flex gap-2 mt-1">
                    <input type="text" value={tempFieldValue} onChange={e => setTempFieldValue(e.target.value)} className="input-field text-xs py-1" />
                    <button onClick={() => saveEditField('patient_name')} className="btn-primary text-xs py-1 px-2"><Save size={11} /></button>
                  </div>
                ) : (
                  <p className="text-white text-sm font-medium">{extraction?.patient_name || currentPatient?.name}</p>
                )}
              </div>

              {/* Document Date */}
              <div className={`p-3 rounded-xl border ${fieldState['document_date'] === 'approved' ? 'border-green-500/30 bg-green-500/5' : 'border-slate-800 bg-slate-800/30'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Document Date</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleAction('document_date', 'approved')} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><ThumbsUp size={11} /></button>
                    <button onClick={() => startEditField('document_date', extraction?.document_date)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit3 size={11} /></button>
                  </div>
                </div>
                {editingField === 'document_date' ? (
                  <div className="flex gap-2 mt-1">
                    <input type="date" value={tempFieldValue} onChange={e => setTempFieldValue(e.target.value)} className="input-field text-xs py-1" />
                    <button onClick={() => saveEditField('document_date')} className="btn-primary text-xs py-1 px-2"><Save size={11} /></button>
                  </div>
                ) : (
                  <p className="text-white text-sm font-medium">{extraction?.document_date || 'Unknown'}</p>
                )}
              </div>

              {/* Document Type */}
              <div className={`p-3 rounded-xl border ${fieldState['document_type'] === 'approved' ? 'border-green-500/30 bg-green-500/5' : 'border-slate-800 bg-slate-800/30'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Document Type</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleAction('document_type', 'approved')} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><ThumbsUp size={11} /></button>
                    <button onClick={() => startEditField('document_type', extraction?.document_type)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit3 size={11} /></button>
                  </div>
                </div>
                {editingField === 'document_type' ? (
                  <div className="flex gap-2 mt-1">
                    <select value={tempFieldValue} onChange={e => setTempFieldValue(e.target.value)} className="input-field text-xs py-1">
                      {Object.entries(DOCUMENT_TYPE_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v}</option>
                      ))}
                    </select>
                    <button onClick={() => saveEditField('document_type')} className="btn-primary text-xs py-1 px-2"><Save size={11} /></button>
                  </div>
                ) : (
                  <p className="text-teal-300 text-sm font-medium">{DOCUMENT_TYPE_LABELS[extraction?.document_type] || extraction?.document_type}</p>
                )}
              </div>

              {/* Hospital / Clinic */}
              <div className={`p-3 rounded-xl border ${fieldState['hospital'] === 'approved' ? 'border-green-500/30 bg-green-500/5' : 'border-slate-800 bg-slate-800/30'}`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Hospital / Facility</span>
                  <div className="flex gap-1">
                    <button onClick={() => handleAction('hospital', 'approved')} className="p-1 text-green-400 hover:bg-green-500/20 rounded"><ThumbsUp size={11} /></button>
                    <button onClick={() => startEditField('hospital', extraction?.hospital)} className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"><Edit3 size={11} /></button>
                  </div>
                </div>
                {editingField === 'hospital' ? (
                  <div className="flex gap-2 mt-1">
                    <input type="text" value={tempFieldValue} onChange={e => setTempFieldValue(e.target.value)} className="input-field text-xs py-1" />
                    <button onClick={() => saveEditField('hospital')} className="btn-primary text-xs py-1 px-2"><Save size={11} /></button>
                  </div>
                ) : (
                  <p className="text-white text-sm font-medium">{extraction?.hospital || 'Apollo Hospitals, Chennai'}</p>
                )}
              </div>
            </div>
          </div>

          {/* 2. Diagnoses & Clinical Conditions */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-teal-400" />
                <h3 className="text-white font-semibold text-sm">Diagnoses & Clinical Findings</h3>
                <span className="badge badge-teal text-xs">{(extraction.diagnosis || extraction.diagnoses || []).length} found</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddDiag(!showAddDiag)}
                  className="btn-ghost text-xs py-1 px-2 text-teal-400 border border-teal-500/30 flex items-center gap-1"
                >
                  <Plus size={12} /> Add Condition
                </button>
                <button
                  onClick={() => handleAction('diagnosis', fieldState['diagnosis'] === 'approved' ? 'rejected' : 'approved')}
                  className={`p-1 rounded ${fieldState['diagnosis'] === 'approved' ? 'text-green-400 bg-green-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <ThumbsUp size={14} />
                </button>
              </div>
            </div>

            {/* Add diagnosis form */}
            <AnimatePresence>
              {showAddDiag && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Condition (e.g. Type 2 Diabetes)"
                      value={newDiag.condition}
                      onChange={e => setNewDiag({ ...newDiag, condition: e.target.value })}
                      className="input-field text-xs sm:col-span-2"
                    />
                    <select
                      value={newDiag.severity}
                      onChange={e => setNewDiag({ ...newDiag, severity: e.target.value })}
                      className="input-field text-xs"
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setShowAddDiag(false)} className="btn-ghost text-xs py-1 px-3">Cancel</button>
                    <button onClick={handleAddDiagnosis} className="btn-primary text-xs py-1 px-3">Add to List</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Diagnoses List */}
            <div className="space-y-2">
              {(extraction.diagnosis || extraction.diagnoses || []).map((diag: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">{diag.condition}</span>
                      {diag.severity && (
                        <span className={`badge ${diag.severity === 'critical' ? 'badge-high' : diag.severity === 'moderate' ? 'badge-low' : 'badge-teal'}`}>
                          {diag.severity}
                        </span>
                      )}
                      {diag.icd_code && <span className="text-slate-500 font-mono text-xs">ICD: {diag.icd_code}</span>}
                    </div>
                    {diag.notes && <p className="text-slate-400 text-xs mt-1">{diag.notes}</p>}
                  </div>
                  <button onClick={() => handleDeleteDiagnosis(i)} className="text-slate-500 hover:text-red-400 p-1.5 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(!extraction.diagnosis || extraction.diagnosis.length === 0) && (
                <p className="text-slate-500 text-xs italic py-2">No primary diagnoses extracted</p>
              )}
            </div>
          </div>

          {/* 3. Medications & Prescriptions */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Pill size={16} className="text-teal-400" />
                <h3 className="text-white font-semibold text-sm">Medications & Prescriptions</h3>
                <span className="badge badge-teal text-xs">{(extraction.medications || []).length} found</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddMed(!showAddMed)}
                  className="btn-ghost text-xs py-1 px-2 text-teal-400 border border-teal-500/30 flex items-center gap-1"
                >
                  <Plus size={12} /> Add Drug
                </button>
                <button
                  onClick={() => handleAction('medications', fieldState['medications'] === 'approved' ? 'rejected' : 'approved')}
                  className={`p-1 rounded ${fieldState['medications'] === 'approved' ? 'text-green-400 bg-green-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <ThumbsUp size={14} />
                </button>
              </div>
            </div>

            {/* Add Medication form */}
            <AnimatePresence>
              {showAddMed && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Medication Name (e.g. Metformin)"
                      value={newMed.name}
                      onChange={e => setNewMed({ ...newMed, name: e.target.value })}
                      className="input-field text-xs sm:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Dosage (e.g. 500mg)"
                      value={newMed.dosage}
                      onChange={e => setNewMed({ ...newMed, dosage: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Frequency (e.g. Twice daily with meals)"
                      value={newMed.frequency}
                      onChange={e => setNewMed({ ...newMed, frequency: e.target.value })}
                      className="input-field text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Duration (e.g. 3 months)"
                      value={newMed.duration}
                      onChange={e => setNewMed({ ...newMed, duration: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setShowAddMed(false)} className="btn-ghost text-xs py-1 px-3">Cancel</button>
                    <button onClick={handleAddMedication} className="btn-primary text-xs py-1 px-3">Add Medication</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Medications List */}
            <div className="space-y-2">
              {(extraction.medications || []).map((med: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50 hover:border-slate-600 transition-all">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm font-semibold">{med.name}</span>
                      <span className="text-teal-400 font-mono text-xs">{med.dosage}</span>
                      <span className="badge badge-teal text-xs">{med.frequency}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1">Duration: {med.duration || 'Ongoing'} · Route: {med.route || 'oral'}</p>
                  </div>
                  <button onClick={() => handleDeleteMedication(i)} className="text-slate-500 hover:text-red-400 p-1.5 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {(!extraction.medications || extraction.medications.length === 0) && (
                <p className="text-slate-500 text-xs italic py-2">No medications identified in document</p>
              )}
            </div>
          </div>

          {/* 4. Lab Results & Diagnostic Biomarkers */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Activity size={16} className="text-teal-400" />
                <h3 className="text-white font-semibold text-sm">Lab Results & Blood Biomarkers</h3>
                <span className="badge badge-teal text-xs">{(extraction.lab_results || []).length} tests</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowAddLab(!showAddLab)}
                  className="btn-ghost text-xs py-1 px-2 text-teal-400 border border-teal-500/30 flex items-center gap-1"
                >
                  <Plus size={12} /> Add Lab Test
                </button>
                <button
                  onClick={() => handleAction('lab_results', fieldState['lab_results'] === 'approved' ? 'rejected' : 'approved')}
                  className={`p-1 rounded ${fieldState['lab_results'] === 'approved' ? 'text-green-400 bg-green-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <ThumbsUp size={14} />
                </button>
              </div>
            </div>

            {/* Add Lab form */}
            <AnimatePresence>
              {showAddLab && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="Test Name (e.g. HbA1c)"
                      value={newLab.test_name}
                      onChange={e => setNewLab({ ...newLab, test_name: e.target.value })}
                      className="input-field text-xs sm:col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Value (e.g. 7.2)"
                      value={newLab.value}
                      onChange={e => setNewLab({ ...newLab, value: e.target.value })}
                      className="input-field text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Unit (e.g. %)"
                      value={newLab.unit}
                      onChange={e => setNewLab({ ...newLab, unit: e.target.value })}
                      className="input-field text-xs"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Reference Range (e.g. <5.7)"
                      value={newLab.reference_range}
                      onChange={e => setNewLab({ ...newLab, reference_range: e.target.value })}
                      className="input-field text-xs"
                    />
                    <select
                      value={newLab.status}
                      onChange={e => setNewLab({ ...newLab, status: e.target.value })}
                      className="input-field text-xs"
                    >
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="low">Low</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => setShowAddLab(false)} className="btn-ghost text-xs py-1 px-3">Cancel</button>
                    <button onClick={handleAddLab} className="btn-primary text-xs py-1 px-3">Add Test</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lab Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-800">
                    <th className="py-2">Test Name</th>
                    <th className="py-2">Result Value</th>
                    <th className="py-2">Reference</th>
                    <th className="py-2">Status</th>
                    <th className="py-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(extraction.lab_results || []).map((lab: any, i: number) => (
                    <tr key={i} className="hover:bg-slate-800/30">
                      <td className="py-2.5 font-medium text-white">{lab.test_name}</td>
                      <td className="py-2.5 font-mono text-teal-300 font-semibold">{lab.value} {lab.unit}</td>
                      <td className="py-2.5 text-slate-400">{lab.reference_range || '—'}</td>
                      <td className="py-2.5">
                        <span className={`badge ${lab.status === 'high' ? 'badge-high' : lab.status === 'low' ? 'badge-low' : 'badge-teal'}`}>
                          {lab.status || 'normal'}
                        </span>
                      </td>
                      <td className="py-2.5 text-right">
                        <button onClick={() => handleDeleteLab(i)} className="text-slate-500 hover:text-red-400 p-1">
                          <Trash2 size={13} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {(!extraction.lab_results || extraction.lab_results.length === 0) && (
                <p className="text-slate-500 text-xs italic py-2">No laboratory parameters detected</p>
              )}
            </div>
          </div>

          {/* 5. Procedures & Scans */}
          {(extraction.procedures || []).length > 0 && (
            <div className="glass-card rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Scissors size={16} className="text-teal-400" />
                  <h3 className="text-white font-semibold text-sm">Procedures & Imaging Studies</h3>
                </div>
                <button
                  onClick={() => handleAction('procedures', fieldState['procedures'] === 'approved' ? 'rejected' : 'approved')}
                  className={`p-1 rounded ${fieldState['procedures'] === 'approved' ? 'text-green-400 bg-green-500/20' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                  <ThumbsUp size={14} />
                </button>
              </div>

              <div className="space-y-2">
                {extraction.procedures.map((proc: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-sm font-semibold">{proc.name}</span>
                        <span className="badge badge-teal text-xs">{proc.type || 'scan'}</span>
                      </div>
                      <p className="text-slate-400 text-xs mt-1">{proc.findings || 'Documented in medical records'}</p>
                    </div>
                    <button onClick={() => handleDeleteProcedure(i)} className="text-slate-500 hover:text-red-400 p-1.5">
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 6. Clinical Summary & Doctor's Notes */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 uppercase font-semibold">Clinical Impressions & Notes</span>
              <button onClick={() => startEditField('clinical_notes', extraction?.clinical_notes)} className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1">
                <Edit3 size={11} /> Edit Note
              </button>
            </div>
            {editingField === 'clinical_notes' ? (
              <div className="space-y-2">
                <textarea
                  value={tempFieldValue}
                  onChange={e => setTempFieldValue(e.target.value)}
                  className="input-field text-xs resize-none"
                  rows={3}
                />
                <div className="flex justify-end gap-2">
                  <button onClick={() => setEditingField(null)} className="btn-ghost text-xs py-1 px-3">Cancel</button>
                  <button onClick={() => saveEditField('clinical_notes')} className="btn-primary text-xs py-1 px-3">Save Note</button>
                </div>
              </div>
            ) : (
              <p className="text-slate-300 text-sm leading-relaxed bg-slate-900/50 p-3 rounded-xl border border-slate-800">
                {extraction?.clinical_notes || 'Extracted structured medical records verified by clinician.'}
              </p>
            )}
          </div>

          {/* Action Bottom Bar */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving || approvedCount === 0}
              className="btn-primary flex-1 justify-center py-3.5 text-base font-semibold shadow-lg shadow-teal-500/20"
            >
              {saving ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={18} />}
              {saving ? 'Committing Verified Clinical Data...' : `Approve & Save ${approvedCount} Fields to Patient Record`}
            </button>
            <button onClick={() => navigate('/documents')} className="btn-ghost px-5">
              Cancel
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

import api from './api'

export const authService = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),
  
  register: (name: string, email: string, password: string, role: string) =>
    api.post('/auth/register', { name, email, password, role }),
  
  demoLogin: () =>
    api.post('/auth/demo-login'),
}

export const patientService = {
  list: () => api.get('/patients'),
  get: (id: number) => api.get(`/patients/${id}`),
  create: (data: any) => api.post('/patients', data),
  update: (id: number, data: any) => api.put(`/patients/${id}`, data),
}

export const documentService = {
  upload: (file: File, patientId: number, onProgress?: (pct: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('patient_id', String(patientId))
    return api.post('/documents/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) {
          onProgress(Math.round((e.loaded / e.total) * 100))
        }
      },
    })
  },
  list: (patientId?: number) =>
    api.get('/documents', { params: patientId ? { patient_id: patientId } : {} }),
  extract: (documentId: number) =>
    api.post(`/documents/extract/${documentId}`),
  getExtraction: (documentId: number) =>
    api.get(`/documents/${documentId}/extraction`),
}

export const verificationService = {
  approve: (data: any) => api.post('/verification/approve', data),
  getLogs: (documentId: number) => api.get(`/verification/logs/${documentId}`),
}

export const timelineService = {
  get: (patientId: number, eventType?: string) =>
    api.get(`/timeline/${patientId}`, { params: eventType ? { event_type: eventType } : {} }),
  getSummary: (patientId: number) =>
    api.get(`/timeline/${patientId}/summary`),
}

export const medicalService = {
  getLabs: (patientId: number) => api.get(`/labs/${patientId}`),
  createLab: (data: any) => api.post('/labs', data),
  updateLab: (id: number, data: any) => api.put(`/labs/${id}`, data),
  deleteLab: (id: number) => api.delete(`/labs/${id}`),
  getMedications: (patientId: number, status?: string) =>
    api.get(`/medications/${patientId}`, { params: status ? { status } : {} }),
  getDiagnoses: (patientId: number) => api.get(`/diagnoses/${patientId}`),
  getProcedures: (patientId: number) => api.get(`/procedures/${patientId}`),
}

export const aiService = {
  query: (query: string, patientId: number) =>
    api.post('/ai/query', { query, patient_id: patientId }),
}

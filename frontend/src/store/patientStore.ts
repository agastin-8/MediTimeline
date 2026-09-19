import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface Patient {
  id: number
  name: string
  date_of_birth: string | null
  gender: string | null
  blood_group: string | null
  phone: string | null
  email: string | null
  stats?: Record<string, number>
}

interface PatientState {
  currentPatient: Patient | null
  patients: Patient[]
  setCurrentPatient: (patient: Patient) => void
  updatePatient: (updated: Partial<Patient>) => void
  updatePatientName: (name: string) => void
  setPatients: (patients: Patient[]) => void
}

export const usePatientStore = create<PatientState>()(
  persist(
    (set) => ({
      currentPatient: null,
      patients: [],
      setCurrentPatient: (patient) => set({ currentPatient: patient }),
      updatePatient: (updated) =>
        set((state) => {
          const current = state.currentPatient
          if (!current) return state
          const newCurrent = { ...current, ...updated }
          const newPatients = state.patients.map((p) =>
            p.id === newCurrent.id ? newCurrent : p
          )
          return { currentPatient: newCurrent, patients: newPatients }
        }),
      updatePatientName: (name: string) =>
        set((state) => {
          const current = state.currentPatient
          if (!current) return state
          const newCurrent = { ...current, name }
          const newPatients = state.patients.map((p) =>
            p.id === newCurrent.id ? { ...p, name } : p
          )
          return { currentPatient: newCurrent, patients: newPatients }
        }),
      setPatients: (patients) => set({ patients }),
    }),
    { name: 'meditimeline-patient' }
  )
)

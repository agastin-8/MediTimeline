export const DEMO_PATIENT = {
  id: 1,
  name: "Ravi Kumar",
  date_of_birth: "1978-06-15",
  gender: "Male",
  blood_group: "B+",
  phone: "+91 98765 43210",
  email: "ravi.kumar@email.com",
  address: "12, Nehru Street, T. Nagar, Chennai - 600017",
  stats: {
    documents: 5,
    timeline_events: 6,
    lab_results: 12,
    medications: 6,
    diagnoses: 5,
    procedures: 3,
  }
}

export const DEMO_TIMELINE = [
  {
    id: 6, event_type: "lab", event_date: "2026-06-10",
    title: "Follow-up Blood Report",
    description: "HbA1c improved to 6.9%. Hemoglobin normalized to 13.1 g/dL after iron supplementation. Cholesterol improved.",
    doctor: "Dr. Meena Krishnan", hospital: "Apollo Hospitals, Chennai",
    confidence: 0.95, source_document_id: 5,
  },
  {
    id: 5, event_type: "procedure", event_date: "2025-07-20",
    title: "MRI Scan Report",
    description: "MRI Lumbar Spine: Mild L4-L5 disc narrowing. Brain MRI normal — no pathology detected.",
    doctor: "Dr. Arjun Patel", hospital: "Fortis Hospital, Chennai",
    confidence: 0.91, source_document_id: 3,
  },
  {
    id: 4, event_type: "medicine", event_date: "2025-03-15",
    title: "Prescription / Consultation",
    description: "Prescribed Metformin 500mg, Glipizide 5mg for T2DM. Ferrous Sulfate for anemia. Lifestyle modifications advised.",
    doctor: "Dr. Meena Krishnan", hospital: "Apollo Hospitals, Chennai",
    confidence: 0.97, source_document_id: 2,
  },
  {
    id: 3, event_type: "lab", event_date: "2025-03-15",
    title: "Blood Report",
    description: "CBC and Metabolic Panel. HbA1c 7.8% (high), Hemoglobin 11.2 g/dL (low), Cholesterol 215 mg/dL (high).",
    doctor: "Dr. Meena Krishnan", hospital: "Apollo Hospitals, Chennai",
    confidence: 0.94, source_document_id: 1,
  },
  {
    id: 2, event_type: "discharge", event_date: "2024-11-30",
    title: "Hospital Discharge",
    description: "Discharged from GGH Chennai. Recovered from gastroenteritis. Follow up: See GP in 1 week.",
    doctor: "Dr. Suresh Babu", hospital: "Government General Hospital, Chennai",
    confidence: 0.96, source_document_id: 4,
  },
  {
    id: 1, event_type: "admission", event_date: "2024-11-27",
    title: "Hospital Admission",
    description: "Admitted with acute gastroenteritis and dehydration. Hypokalemia noted. IV fluids and antiemetics administered.",
    doctor: "Dr. Suresh Babu", hospital: "Government General Hospital, Chennai",
    confidence: 0.96, source_document_id: 4,
  },
]

export const DEMO_LABS = [
  // June 2026
  { id: 9, test_name: "Hemoglobin", value: "13.1", unit: "g/dL", reference_range: "13.0-17.0", status: "normal", test_date: "2026-06-10", lab_name: "Apollo Hospitals" },
  { id: 10, test_name: "Blood Sugar (Fasting)", value: "108", unit: "mg/dL", reference_range: "70-110", status: "normal", test_date: "2026-06-10", lab_name: "Apollo Hospitals" },
  { id: 11, test_name: "HbA1c", value: "6.9", unit: "%", reference_range: "<5.7", status: "high", test_date: "2026-06-10", lab_name: "Apollo Hospitals" },
  { id: 12, test_name: "Total Cholesterol", value: "188", unit: "mg/dL", reference_range: "<200", status: "normal", test_date: "2026-06-10", lab_name: "Apollo Hospitals" },
  // March 2025
  { id: 1, test_name: "Hemoglobin", value: "11.2", unit: "g/dL", reference_range: "13.0-17.0", status: "low", test_date: "2025-03-15", lab_name: "Apollo Hospitals" },
  { id: 2, test_name: "Blood Sugar (Fasting)", value: "142", unit: "mg/dL", reference_range: "70-110", status: "high", test_date: "2025-03-15", lab_name: "Apollo Hospitals" },
  { id: 3, test_name: "HbA1c", value: "7.8", unit: "%", reference_range: "<5.7", status: "high", test_date: "2025-03-15", lab_name: "Apollo Hospitals" },
  { id: 4, test_name: "Total Cholesterol", value: "215", unit: "mg/dL", reference_range: "<200", status: "high", test_date: "2025-03-15", lab_name: "Apollo Hospitals" },
  { id: 5, test_name: "Creatinine", value: "1.1", unit: "mg/dL", reference_range: "0.7-1.2", status: "normal", test_date: "2025-03-15", lab_name: "Apollo Hospitals" },
  // November 2024
  { id: 7, test_name: "Serum Potassium", value: "2.9", unit: "mEq/L", reference_range: "3.5-5.0", status: "low", test_date: "2024-11-27", lab_name: "GGH Chennai" },
  { id: 8, test_name: "Serum Sodium", value: "136", unit: "mEq/L", reference_range: "135-145", status: "normal", test_date: "2024-11-27", lab_name: "GGH Chennai" },
]

export const DEMO_MEDICATIONS = [
  { id: 1, name: "Metformin", dosage: "500mg", frequency: "Twice daily with meals", duration: "Ongoing", prescribed_by: "Dr. Meena Krishnan", prescribed_date: "2025-03-15", status: "active" },
  { id: 2, name: "Glipizide", dosage: "5mg", frequency: "Once daily before breakfast", duration: "Ongoing", prescribed_by: "Dr. Meena Krishnan", prescribed_date: "2025-03-15", status: "active" },
  { id: 3, name: "Ferrous Sulfate", dosage: "200mg", frequency: "Once daily", duration: "2 months", prescribed_by: "Dr. Meena Krishnan", prescribed_date: "2025-03-15", status: "completed" },
  { id: 4, name: "Vitamin B12", dosage: "1000mcg", frequency: "Once daily", duration: "1 month", prescribed_by: "Dr. Meena Krishnan", prescribed_date: "2025-03-15", status: "completed" },
  { id: 5, name: "Ondansetron", dosage: "4mg", frequency: "Every 8 hours", duration: "3 days", prescribed_by: "Dr. Suresh Babu", prescribed_date: "2024-11-27", status: "completed" },
  { id: 6, name: "ORS Sachets", dosage: "200mL per sachet", frequency: "After each loose stool", duration: "5 days", prescribed_by: "Dr. Suresh Babu", prescribed_date: "2024-11-27", status: "completed" },
]

export const DEMO_DIAGNOSES = [
  { id: 1, condition: "Type 2 Diabetes Mellitus", icd_code: "E11", severity: "moderate", status: "chronic", first_seen: "2025-03-15", last_seen: "2026-06-10", diagnosed_by: "Dr. Meena Krishnan", hospital: "Apollo Hospitals, Chennai", notes: "Improving with Metformin and lifestyle changes" },
  { id: 2, condition: "Iron Deficiency Anemia", icd_code: "D50", severity: "mild", status: "resolved", first_seen: "2025-03-15", last_seen: "2026-06-10", diagnosed_by: "Dr. Meena Krishnan", hospital: "Apollo Hospitals, Chennai", notes: "Resolved after 2 months of Ferrous Sulfate" },
  { id: 3, condition: "Acute Gastroenteritis", icd_code: "A09", severity: "moderate", status: "resolved", first_seen: "2024-11-27", last_seen: "2024-11-30", diagnosed_by: "Dr. Suresh Babu", hospital: "GGH Chennai", notes: "Recovered with IV fluids and antiemetics" },
  { id: 4, condition: "Hypokalemia", icd_code: "E87.6", severity: "mild", status: "resolved", first_seen: "2024-11-27", last_seen: "2024-11-29", diagnosed_by: "Dr. Suresh Babu", hospital: "GGH Chennai", notes: "Corrected with IV potassium supplementation" },
  { id: 5, condition: "Lumbar Spondylosis (L4-L5)", icd_code: "M47.816", severity: "mild", status: "active", first_seen: "2025-07-20", last_seen: "2025-07-20", diagnosed_by: "Dr. Arjun Patel", hospital: "Fortis Hospital, Chennai", notes: "Physiotherapy recommended" },
]

export const DEMO_DOCUMENTS = [
  { id: 1, original_filename: "Blood_Report_Mar2025.pdf", document_type: "blood_report", document_date: "2025-03-15", hospital: "Apollo Hospitals, Chennai", doctor: "Dr. Meena Krishnan", status: "verified", file_type: "pdf", file_size: 102400 },
  { id: 2, original_filename: "Prescription_Mar2025.pdf", document_type: "prescription", document_date: "2025-03-15", hospital: "Apollo Hospitals, Chennai", doctor: "Dr. Meena Krishnan", status: "verified", file_type: "pdf", file_size: 81920 },
  { id: 3, original_filename: "MRI_Report_Jul2025.pdf", document_type: "mri_report", document_date: "2025-07-20", hospital: "Fortis Hospital, Chennai", doctor: "Dr. Arjun Patel", status: "verified", file_type: "pdf", file_size: 204800 },
  { id: 4, original_filename: "Discharge_Summary_Nov2024.pdf", document_type: "discharge_summary", document_date: "2024-11-30", hospital: "GGH Chennai", doctor: "Dr. Suresh Babu", status: "verified", file_type: "pdf", file_size: 163840 },
  { id: 5, original_filename: "Blood_Report_Jun2026.pdf", document_type: "blood_report", document_date: "2026-06-10", hospital: "Apollo Hospitals, Chennai", doctor: "Dr. Meena Krishnan", status: "verified", file_type: "pdf", file_size: 98304 },
]

export const LAB_TREND_DATA = {
  "HbA1c": [
    { date: "Mar 2025", value: 7.8, normal_max: 5.7 },
    { date: "Jun 2026", value: 6.9, normal_max: 5.7 },
  ],
  "Hemoglobin": [
    { date: "Mar 2025", value: 11.2, normal_min: 13.0, normal_max: 17.0 },
    { date: "Jun 2026", value: 13.1, normal_min: 13.0, normal_max: 17.0 },
  ],
  "Blood Sugar": [
    { date: "Mar 2025", value: 142, normal_min: 70, normal_max: 110 },
    { date: "Jun 2026", value: 108, normal_min: 70, normal_max: 110 },
  ],
  "Total Cholesterol": [
    { date: "Mar 2025", value: 215, normal_max: 200 },
    { date: "Jun 2026", value: 188, normal_max: 200 },
  ],
}

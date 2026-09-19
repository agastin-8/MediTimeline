import os
import shutil
import fitz

demo_files = [
    ('Blood_Report_Mar2025.pdf', 'Complete Blood Count & Lipid Profile', 'Apollo Hospitals, Chennai\nPatient: Ravi Kumar\nDate: 2025-03-15\nHbA1c: 7.8% (High)\nFasting Blood Glucose: 154 mg/dL\nTotal Cholesterol: 220 mg/dL\nSerum Creatinine: 1.1 mg/dL\nPlatelets: 240,000 /uL'),
    ('Prescription_Mar2025.pdf', 'Prescription Rx', 'Apollo Hospitals, Chennai\nDr. Meena Krishnan\nPatient: Ravi Kumar\nDate: 2025-03-15\n1. Metformin 500mg - Twice daily after meals\n2. Atorvastatin 10mg - Once daily at bedtime\n3. Glimepiride 1mg - Once daily before breakfast'),
    ('MRI_Report_Jul2025.pdf', 'Lumbar Spine MRI Report', 'Fortis Hospital, Chennai\nDr. Arjun Patel\nPatient: Ravi Kumar\nDate: 2025-07-20\nFindings: L4-L5 mild disc bulge with bilateral neural foraminal narrowing. No spinal cord compression.'),
    ('Discharge_Summary_Nov2024.pdf', 'Hospital Discharge Summary', 'Government General Hospital, Chennai\nDr. Suresh Babu\nPatient: Ravi Kumar\nAdmission: 2024-11-25 | Discharge: 2024-11-30\nDiagnosis: Acute Gastroenteritis with Moderate Dehydration\nOutcome: Stable and Discharged'),
    ('Blood_Report_Jun2026.pdf', 'Follow-up Comprehensive Metabolic Panel', 'Apollo Hospitals, Chennai\nDr. Meena Krishnan\nPatient: Ravi Kumar\nDate: 2026-06-10\nHbA1c: 6.9% (Improved)\nFasting Blood Glucose: 118 mg/dL\nSerum Creatinine: 1.0 mg/dL (Normal)')
]

dirs = [r'e:\ASHUUUUUU\backend\uploads', r'e:\ASHUUUUUU\uploads']
for d in dirs:
    os.makedirs(d, exist_ok=True)

for fname, title, content in demo_files:
    for d in dirs:
        p = os.path.join(d, fname)
        if not os.path.exists(p):
            doc = fitz.open()
            page = doc.new_page()
            page.insert_text((50, 72), f'MediTimeline AI - Clinical Document Archive\n\nTitle: {title}\n\n{content}', fontsize=12)
            doc.save(p)
            doc.close()
            print(f'Generated: {p}')

# Sync any user uploaded files between backend/uploads and uploads
for src_dir, dst_dir in [(r'e:\ASHUUUUUU\backend\uploads', r'e:\ASHUUUUUU\uploads'), (r'e:\ASHUUUUUU\uploads', r'e:\ASHUUUUUU\backend\uploads')]:
    if os.path.exists(src_dir):
        for f in os.listdir(src_dir):
            src_file = os.path.join(src_dir, f)
            dst_file = os.path.join(dst_dir, f)
            if os.path.isfile(src_file) and not os.path.exists(dst_file):
                shutil.copy2(src_file, dst_file)
                print(f'Copied {f} to {dst_dir}')

print("Done syncing demo files.")

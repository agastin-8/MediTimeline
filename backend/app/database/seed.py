"""
Seed the database with demo data for hackathon judges.
Demo Patient: Ravi Kumar with 5 pre-populated medical records.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.connection import engine, SessionLocal, Base
from app.models import *
from app.auth.password import hash_password
from datetime import date

def seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    
    try:
        # Check if already seeded
        existing = db.query(User).filter(User.email == "demo@meditimeline.ai").first()
        if existing:
            print("Demo data already seeded!")
            db.close()
            return

        print("Seeding demo data...")

        # Create demo doctor user
        demo_user = User(
            email="demo@meditimeline.ai",
            name="Dr. Demo User",
            hashed_password=hash_password("demo123"),
            role="doctor"
        )
        db.add(demo_user)
        db.flush()

        # Create demo patient: Ravi Kumar
        ravi = Patient(
            name="Ravi Kumar",
            date_of_birth=date(1978, 6, 15),
            gender="Male",
            blood_group="B+",
            phone="+91 98765 43210",
            email="ravi.kumar@email.com",
            address="12, Nehru Street, T. Nagar, Chennai - 600017",
            emergency_contact="Priya Kumar (Wife) - +91 98765 43211",
            created_by=demo_user.id
        )
        db.add(ravi)
        db.flush()
        print(f"Created patient: {ravi.name} (ID: {ravi.id})")

        # Create demo documents
        docs_data = [
            {"original_filename": "Blood_Report_Mar2025.pdf", "document_type": "blood_report", "document_date": "2025-03-15", "hospital": "Apollo Hospitals, Chennai", "doctor": "Dr. Meena Krishnan", "status": "verified"},
            {"original_filename": "Prescription_Mar2025.pdf", "document_type": "prescription", "document_date": "2025-03-15", "hospital": "Apollo Hospitals, Chennai", "doctor": "Dr. Meena Krishnan", "status": "verified"},
            {"original_filename": "MRI_Report_Jul2025.pdf", "document_type": "mri_report", "document_date": "2025-07-20", "hospital": "Fortis Hospital, Chennai", "doctor": "Dr. Arjun Patel", "status": "verified"},
            {"original_filename": "Discharge_Summary_Nov2024.pdf", "document_type": "discharge_summary", "document_date": "2024-11-30", "hospital": "Government General Hospital, Chennai", "doctor": "Dr. Suresh Babu", "status": "verified"},
            {"original_filename": "Blood_Report_Jun2026.pdf", "document_type": "blood_report", "document_date": "2026-06-10", "hospital": "Apollo Hospitals, Chennai", "doctor": "Dr. Meena Krishnan", "status": "verified"},
        ]
        
        created_docs = []
        for d in docs_data:
            doc = Document(
                patient_id=ravi.id,
                filename=d["original_filename"],
                original_filename=d["original_filename"],
                file_path=f"./uploads/{d['original_filename']}",
                file_type="pdf",
                file_size=102400,
                document_type=d["document_type"],
                document_date=d["document_date"],
                hospital=d["hospital"],
                doctor=d["doctor"],
                status=d["status"]
            )
            db.add(doc)
            db.flush()
            created_docs.append(doc)

        # Create timeline events
        events = [
            TimelineEvent(patient_id=ravi.id, source_document_id=created_docs[3].id, event_type="admission", event_date="2024-11-27", title="Hospital Admission", description="Admitted with acute gastroenteritis and dehydration", hospital="Government General Hospital, Chennai", doctor="Dr. Suresh Babu", confidence=0.96, verified="approved"),
            TimelineEvent(patient_id=ravi.id, source_document_id=created_docs[3].id, event_type="discharge", event_date="2024-11-30", title="Hospital Discharge", description="Recovered from gastroenteritis. Discharged with ORS and follow-up advice.", hospital="Government General Hospital, Chennai", doctor="Dr. Suresh Babu", confidence=0.96, verified="approved"),
            TimelineEvent(patient_id=ravi.id, source_document_id=created_docs[0].id, event_type="lab", event_date="2025-03-15", title="Blood Report", description="CBC and Metabolic Panel. HbA1c elevated at 7.8%, mild anemia noted.", hospital="Apollo Hospitals, Chennai", doctor="Dr. Meena Krishnan", confidence=0.94, verified="approved"),
            TimelineEvent(patient_id=ravi.id, source_document_id=created_docs[1].id, event_type="medicine", event_date="2025-03-15", title="Prescription / Consultation", description="Prescribed Metformin for T2DM, Ferrous Sulfate for anemia. Lifestyle modifications advised.", hospital="Apollo Hospitals, Chennai", doctor="Dr. Meena Krishnan", confidence=0.97, verified="approved"),
            TimelineEvent(patient_id=ravi.id, source_document_id=created_docs[2].id, event_type="procedure", event_date="2025-07-20", title="MRI Scan Report", description="MRI Lumbar Spine: Mild L4-L5 disc narrowing. Brain MRI normal.", hospital="Fortis Hospital, Chennai", doctor="Dr. Arjun Patel", confidence=0.91, verified="approved"),
            TimelineEvent(patient_id=ravi.id, source_document_id=created_docs[4].id, event_type="lab", event_date="2026-06-10", title="Follow-up Blood Report", description="HbA1c improved to 6.9%. Hemoglobin normalized to 13.1 g/dL after iron supplementation.", hospital="Apollo Hospitals, Chennai", doctor="Dr. Meena Krishnan", confidence=0.95, verified="approved"),
        ]
        for e in events:
            db.add(e)

        # Lab Results
        lab_data = [
            # March 2025
            LabResult(patient_id=ravi.id, document_id=created_docs[0].id, test_name="Hemoglobin", value="11.2", unit="g/dL", reference_range="13.0-17.0", status="low", test_date="2025-03-15", lab_name="Apollo Hospitals"),
            LabResult(patient_id=ravi.id, document_id=created_docs[0].id, test_name="Blood Sugar (Fasting)", value="142", unit="mg/dL", reference_range="70-110", status="high", test_date="2025-03-15", lab_name="Apollo Hospitals"),
            LabResult(patient_id=ravi.id, document_id=created_docs[0].id, test_name="HbA1c", value="7.8", unit="%", reference_range="<5.7", status="high", test_date="2025-03-15", lab_name="Apollo Hospitals"),
            LabResult(patient_id=ravi.id, document_id=created_docs[0].id, test_name="Total Cholesterol", value="215", unit="mg/dL", reference_range="<200", status="high", test_date="2025-03-15", lab_name="Apollo Hospitals"),
            LabResult(patient_id=ravi.id, document_id=created_docs[0].id, test_name="Creatinine", value="1.1", unit="mg/dL", reference_range="0.7-1.2", status="normal", test_date="2025-03-15", lab_name="Apollo Hospitals"),
            LabResult(patient_id=ravi.id, document_id=created_docs[0].id, test_name="Platelet Count", value="1.8", unit="lakh/µL", reference_range="1.5-4.0", status="normal", test_date="2025-03-15", lab_name="Apollo Hospitals"),
            # November 2024 (discharge)
            LabResult(patient_id=ravi.id, document_id=created_docs[3].id, test_name="Serum Potassium", value="2.9", unit="mEq/L", reference_range="3.5-5.0", status="low", test_date="2024-11-27", lab_name="GGH Chennai"),
            LabResult(patient_id=ravi.id, document_id=created_docs[3].id, test_name="Serum Sodium", value="136", unit="mEq/L", reference_range="135-145", status="normal", test_date="2024-11-27", lab_name="GGH Chennai"),
            # June 2026 - improved values
            LabResult(patient_id=ravi.id, document_id=created_docs[4].id, test_name="Hemoglobin", value="13.1", unit="g/dL", reference_range="13.0-17.0", status="normal", test_date="2026-06-10", lab_name="Apollo Hospitals"),
            LabResult(patient_id=ravi.id, document_id=created_docs[4].id, test_name="Blood Sugar (Fasting)", value="108", unit="mg/dL", reference_range="70-110", status="normal", test_date="2026-06-10", lab_name="Apollo Hospitals"),
            LabResult(patient_id=ravi.id, document_id=created_docs[4].id, test_name="HbA1c", value="6.9", unit="%", reference_range="<5.7", status="high", test_date="2026-06-10", lab_name="Apollo Hospitals"),
            LabResult(patient_id=ravi.id, document_id=created_docs[4].id, test_name="Total Cholesterol", value="188", unit="mg/dL", reference_range="<200", status="normal", test_date="2026-06-10", lab_name="Apollo Hospitals"),
        ]
        for l in lab_data:
            db.add(l)

        # Medications
        meds_data = [
            Medication(patient_id=ravi.id, document_id=created_docs[1].id, name="Metformin", dosage="500mg", frequency="Twice daily with meals", duration="3 months", prescribed_by="Dr. Meena Krishnan", prescribed_date="2025-03-15", status="active"),
            Medication(patient_id=ravi.id, document_id=created_docs[1].id, name="Glipizide", dosage="5mg", frequency="Once daily before breakfast", duration="3 months", prescribed_by="Dr. Meena Krishnan", prescribed_date="2025-03-15", status="active"),
            Medication(patient_id=ravi.id, document_id=created_docs[1].id, name="Ferrous Sulfate", dosage="200mg", frequency="Once daily", duration="2 months", prescribed_by="Dr. Meena Krishnan", prescribed_date="2025-03-15", status="completed"),
            Medication(patient_id=ravi.id, document_id=created_docs[1].id, name="Vitamin B12", dosage="1000mcg", frequency="Once daily", duration="1 month", prescribed_by="Dr. Meena Krishnan", prescribed_date="2025-03-15", status="completed"),
            Medication(patient_id=ravi.id, document_id=created_docs[3].id, name="Ondansetron", dosage="4mg", frequency="Every 8 hours", duration="3 days", prescribed_by="Dr. Suresh Babu", prescribed_date="2024-11-27", status="completed"),
            Medication(patient_id=ravi.id, document_id=created_docs[3].id, name="ORS", dosage="200mL", frequency="After each loose stool", duration="5 days", prescribed_by="Dr. Suresh Babu", prescribed_date="2024-11-27", status="completed"),
        ]
        for m in meds_data:
            db.add(m)

        # Diagnoses
        diagnoses_data = [
            Diagnosis(patient_id=ravi.id, document_id=created_docs[1].id, condition="Type 2 Diabetes Mellitus", icd_code="E11", severity="moderate", status="chronic", first_seen="2025-03-15", last_seen="2026-06-10", diagnosed_by="Dr. Meena Krishnan", hospital="Apollo Hospitals, Chennai", notes="Poorly controlled initially, improving with medication"),
            Diagnosis(patient_id=ravi.id, document_id=created_docs[1].id, condition="Iron Deficiency Anemia", icd_code="D50", severity="mild", status="resolved", first_seen="2025-03-15", last_seen="2026-06-10", diagnosed_by="Dr. Meena Krishnan", hospital="Apollo Hospitals, Chennai", notes="Resolved with iron supplementation"),
            Diagnosis(patient_id=ravi.id, document_id=created_docs[3].id, condition="Acute Gastroenteritis", icd_code="A09", severity="moderate", status="resolved", first_seen="2024-11-27", last_seen="2024-11-30", diagnosed_by="Dr. Suresh Babu", hospital="GGH Chennai", notes="Recovered with IV fluids and antiemetics"),
            Diagnosis(patient_id=ravi.id, document_id=created_docs[3].id, condition="Hypokalemia", icd_code="E87.6", severity="mild", status="resolved", first_seen="2024-11-27", last_seen="2024-11-29", diagnosed_by="Dr. Suresh Babu", hospital="GGH Chennai", notes="Corrected with IV potassium supplementation"),
            Diagnosis(patient_id=ravi.id, document_id=created_docs[2].id, condition="Lumbar Spondylosis", icd_code="M47.816", severity="mild", status="active", first_seen="2025-07-20", last_seen="2025-07-20", diagnosed_by="Dr. Arjun Patel", hospital="Fortis Hospital, Chennai", notes="L4-L5 disc space narrowing on MRI"),
        ]
        for d in diagnoses_data:
            db.add(d)

        # Procedures
        procedures_data = [
            Procedure(patient_id=ravi.id, document_id=created_docs[2].id, procedure_name="MRI Lumbar Spine", procedure_type="scan", procedure_date="2025-07-20", performed_by="Dr. Arjun Patel", hospital="Fortis Hospital, Chennai", outcome="L4-L5 disc narrowing, mild spondylosis"),
            Procedure(patient_id=ravi.id, document_id=created_docs[2].id, procedure_name="MRI Brain with Contrast", procedure_type="scan", procedure_date="2025-07-20", performed_by="Dr. Arjun Patel", hospital="Fortis Hospital, Chennai", outcome="Normal study. No pathology detected."),
            Procedure(patient_id=ravi.id, document_id=created_docs[3].id, procedure_name="IV Fluid Resuscitation", procedure_type="injection", procedure_date="2024-11-27", performed_by="Dr. Suresh Babu", hospital="GGH Chennai", admission_date="2024-11-27", discharge_date="2024-11-30", outcome="Adequate hydration achieved"),
        ]
        for p in procedures_data:
            db.add(p)

        db.commit()
        print("[SUCCESS] Demo data seeded successfully!")
        print(f"   Demo Login: demo@meditimeline.ai / demo123")
        print(f"   Demo Patient: Ravi Kumar (ID: {ravi.id})")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] Seeding failed: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    seed()

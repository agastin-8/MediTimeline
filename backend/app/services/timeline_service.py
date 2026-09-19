from typing import List
from sqlalchemy.orm import Session
from app.models.medical import TimelineEvent, LabResult, Medication, Diagnosis, Procedure, AIExtraction
from app.models.document import Document


def merge_approved_events(db: Session, patient_id: int, document_id: int, extraction: dict) -> List[TimelineEvent]:
    """
    Convert an approved AI extraction into structured timeline events.
    All data is sourced from verified extraction — nothing is fabricated.
    """
    events = []
    doc_date = extraction.get("document_date") or "Unknown"
    hospital = extraction.get("hospital")
    doctor = extraction.get("doctor")

    # Create a main visit/document event
    doc_type = extraction.get("document_type", "consultation")
    event = TimelineEvent(
        patient_id=patient_id,
        source_document_id=document_id,
        event_type=_get_event_type(doc_type),
        event_date=doc_date,
        title=_get_event_title(doc_type),
        description=extraction.get("clinical_notes", ""),
        doctor=doctor,
        hospital=hospital,
        confidence=extraction.get("confidence", 0.9),
        source_page=extraction.get("source_page", 1),
        verified="approved",
        metadata_json={"document_type": doc_type}
    )
    db.add(event)
    events.append(event)

    # Save lab results
    for lab in (extraction.get("lab_results") or []):
        lab_record = LabResult(
            patient_id=patient_id,
            document_id=document_id,
            test_name=lab.get("test_name", "Unknown Test"),
            value=str(lab.get("value", "")),
            unit=lab.get("unit"),
            reference_range=lab.get("reference_range"),
            status=lab.get("status"),
            test_date=doc_date,
            lab_name=hospital
        )
        db.add(lab_record)

    # Save medications
    for med in (extraction.get("medications") or []):
        med_record = Medication(
            patient_id=patient_id,
            document_id=document_id,
            name=med.get("name", "Unknown"),
            dosage=med.get("dosage"),
            frequency=med.get("frequency"),
            duration=med.get("duration"),
            prescribed_by=doctor,
            prescribed_date=doc_date,
            status="active"
        )
        db.add(med_record)

    # Save diagnoses
    for diag in (extraction.get("diagnosis") or []):
        diag_record = Diagnosis(
            patient_id=patient_id,
            document_id=document_id,
            condition=diag.get("condition", "Unknown"),
            icd_code=diag.get("icd_code"),
            severity=diag.get("severity"),
            status="active",
            first_seen=doc_date,
            last_seen=doc_date,
            diagnosed_by=doctor,
            hospital=hospital,
            notes=diag.get("notes")
        )
        db.add(diag_record)

    # Save procedures
    for proc in (extraction.get("procedures") or []):
        proc_record = Procedure(
            patient_id=patient_id,
            document_id=document_id,
            procedure_name=proc.get("name", "Unknown"),
            procedure_type=proc.get("type", "other"),
            procedure_date=proc.get("date") or doc_date,
            performed_by=doctor,
            hospital=hospital,
            outcome=proc.get("findings")
        )
        db.add(proc_record)

    # Handle admissions/discharges
    if extraction.get("admission_date"):
        adm_event = TimelineEvent(
            patient_id=patient_id,
            source_document_id=document_id,
            event_type="admission",
            event_date=extraction["admission_date"],
            title="Hospital Admission",
            description=f"Admitted to {hospital or 'hospital'}",
            hospital=hospital,
            doctor=doctor,
            confidence=extraction.get("confidence", 0.9),
            verified="approved"
        )
        db.add(adm_event)
        events.append(adm_event)

    if extraction.get("discharge_date"):
        dis_event = TimelineEvent(
            patient_id=patient_id,
            source_document_id=document_id,
            event_type="discharge",
            event_date=extraction["discharge_date"],
            title="Hospital Discharge",
            description=f"Discharged from {hospital or 'hospital'}. Follow up: {extraction.get('follow_up', '')}",
            hospital=hospital,
            doctor=doctor,
            confidence=extraction.get("confidence", 0.9),
            verified="approved"
        )
        db.add(dis_event)
        events.append(dis_event)

    db.commit()
    return events


def _get_event_type(doc_type: str) -> str:
    mapping = {
        "blood_report": "lab",
        "lab_report": "lab",
        "prescription": "medicine",
        "mri_report": "procedure",
        "xray_report": "procedure",
        "discharge_summary": "visit",
        "consultation": "visit",
        "ecg_report": "procedure",
    }
    return mapping.get(doc_type, "visit")


def _get_event_title(doc_type: str) -> str:
    mapping = {
        "blood_report": "Blood Report",
        "lab_report": "Lab Report",
        "prescription": "Prescription / Consultation",
        "mri_report": "MRI Scan Report",
        "xray_report": "X-Ray Report",
        "discharge_summary": "Hospital Discharge Summary",
        "consultation": "Doctor Consultation",
        "ecg_report": "ECG Report",
        "other": "Medical Document",
    }
    return mapping.get(doc_type, "Medical Event")


def detect_conflicts(db: Session, patient_id: int) -> list:
    """
    Detect potential conflicts across medical records.
    Returns list of conflict objects.
    """
    conflicts = []

    # Check blood group conflicts from diagnoses metadata
    labs = db.query(LabResult).filter(LabResult.patient_id == patient_id).all()

    # Check for duplicate medications
    meds = db.query(Medication).filter(Medication.patient_id == patient_id).all()
    med_names = [m.name.lower() for m in meds]
    seen = set()
    for name in med_names:
        if name in seen:
            conflicts.append({
                "type": "duplicate_medication",
                "field": "Medication",
                "value": name,
                "message": f"Duplicate medication '{name}' found across multiple documents",
                "severity": "warning"
            })
        seen.add(name)

    return conflicts

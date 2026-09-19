from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.connection import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.medical import TimelineEvent, LabResult, Medication, Diagnosis, Procedure
from app.auth.middleware import get_current_user
from app.services.gemini_service import answer_medical_query

router = APIRouter(prefix="/ai", tags=["AI Search"])


class QueryRequest(BaseModel):
    query: str
    patient_id: int


@router.post("/query")
async def ai_query(
    req: QueryRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Answer natural language questions about a patient's medical records.
    Responses are strictly grounded to uploaded/verified documents.
    """
    patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")
    
    # Build context from verified records
    labs = db.query(LabResult).filter(LabResult.patient_id == req.patient_id).all()
    meds = db.query(Medication).filter(Medication.patient_id == req.patient_id).all()
    diags = db.query(Diagnosis).filter(Diagnosis.patient_id == req.patient_id).all()
    events = db.query(TimelineEvent).filter(
        TimelineEvent.patient_id == req.patient_id,
        TimelineEvent.verified == "approved"
    ).all()
    
    patient_context = {
        "patient": {"name": patient.name, "dob": str(patient.date_of_birth), "blood_group": patient.blood_group},
        "timeline_events": [{"type": e.event_type, "date": e.event_date, "title": e.title, "hospital": e.hospital, "doctor": e.doctor} for e in events],
        "lab_results": [{"test": l.test_name, "value": l.value, "unit": l.unit, "status": l.status, "date": l.test_date} for l in labs],
        "medications": [{"name": m.name, "dosage": m.dosage, "frequency": m.frequency, "status": m.status, "date": m.prescribed_date} for m in meds],
        "diagnoses": [{"condition": d.condition, "severity": d.severity, "status": d.status, "first_seen": d.first_seen} for d in diags]
    }
    
    result = await answer_medical_query(req.query, patient_context)
    
    return {
        "query": req.query,
        "patient_id": req.patient_id,
        "answer": result.get("answer", "Unable to process query"),
        "thinking_process": result.get("thinking_process", []),
        "clinical_insights": result.get("clinical_insights", {}),
        "sources": result.get("sources", []),
        "confidence": result.get("confidence", 0.0),
        "found_in_records": result.get("found_in_records", False)
    }

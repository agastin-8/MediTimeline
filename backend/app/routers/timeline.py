from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.medical import TimelineEvent, LabResult, Medication, Diagnosis, Procedure
from app.models.patient import Patient
from app.auth.middleware import get_current_user

router = APIRouter(prefix="/timeline", tags=["Timeline"])


@router.get("/{patient_id}")
def get_timeline(
    patient_id: int,
    event_type: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the complete patient timeline, sorted chronologically."""
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")
    
    query = db.query(TimelineEvent).filter(
        TimelineEvent.patient_id == patient_id,
        TimelineEvent.verified == "approved"
    )
    if event_type:
        query = query.filter(TimelineEvent.event_type == event_type)
    
    events = query.order_by(TimelineEvent.event_date.desc()).all()
    
    return {
        "patient_id": patient_id,
        "patient_name": patient.name,
        "total_events": len(events),
        "events": [
            {
                "id": e.id,
                "event_type": e.event_type,
                "event_date": e.event_date,
                "title": e.title,
                "description": e.description,
                "doctor": e.doctor,
                "hospital": e.hospital,
                "confidence": e.confidence,
                "source_page": e.source_page,
                "source_document_id": e.source_document_id,
                "metadata": e.metadata_json,
                "created_at": e.created_at.isoformat() if e.created_at else None
            }
            for e in events
        ]
    }


@router.get("/{patient_id}/summary")
def get_timeline_summary(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get summary statistics for a patient's medical timeline."""
    events = db.query(TimelineEvent).filter(
        TimelineEvent.patient_id == patient_id,
        TimelineEvent.verified == "approved"
    ).all()
    
    labs = db.query(LabResult).filter(LabResult.patient_id == patient_id).count()
    meds = db.query(Medication).filter(Medication.patient_id == patient_id).count()
    diags = db.query(Diagnosis).filter(Diagnosis.patient_id == patient_id).count()
    procs = db.query(Procedure).filter(Procedure.patient_id == patient_id).count()
    
    return {
        "total_events": len(events),
        "lab_results": labs,
        "medications": meds,
        "diagnoses": diags,
        "procedures": procs,
        "event_types": list(set(e.event_type for e in events))
    }

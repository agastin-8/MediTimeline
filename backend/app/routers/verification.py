from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional, Any
from app.database.connection import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.document import Document
from app.models.medical import AIExtraction, VerificationLog
from app.auth.middleware import get_current_user
from app.services.timeline_service import merge_approved_events

router = APIRouter(prefix="/verification", tags=["Verification"])


class FieldVerification(BaseModel):
    field_name: str
    extracted_value: Optional[Any] = None
    verified_value: Optional[Any] = None
    action: str  # approved, rejected, edited


class VerificationRequest(BaseModel):
    document_id: int
    patient_id: int
    fields: List[FieldVerification]
    approved_extraction: dict


@router.post("/approve")
def approve_verification(
    req: VerificationRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Process human verification of AI extracted fields.
    Only approved/edited fields are saved to the database.
    """
    doc = db.query(Document).filter(Document.id == req.document_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    # Log each field verification action and build action dictionary
    approved_count = 0
    rejected_count = 0
    field_actions = {}
    field_values = {}
    for field in req.fields:
        log = VerificationLog(
            document_id=req.document_id,
            field_name=field.field_name,
            extracted_value=str(field.extracted_value) if field.extracted_value is not None else None,
            verified_value=str(field.verified_value) if field.verified_value is not None else None,
            action=field.action,
            verified_by=current_user.id
        )
        db.add(log)
        field_actions[field.field_name] = field.action
        if field.verified_value is not None:
            field_values[field.field_name] = field.verified_value
            
        if field.action in ("approved", "edited"):
            approved_count += 1
        else:
            rejected_count += 1
    
    # Filter and construct clean approved extraction
    clean_extraction = dict(req.approved_extraction)
    
    # Apply explicit overrides from field_values
    for k, v in field_values.items():
        clean_extraction[k] = v

    # Remove rejected fields
    for field_name, action in field_actions.items():
        if action == "rejected":
            if field_name in clean_extraction:
                if isinstance(clean_extraction[field_name], list):
                    clean_extraction[field_name] = []
                else:
                    clean_extraction[field_name] = None
    
    # Merge approved extraction into timeline and structured tables
    events = merge_approved_events(db, req.patient_id, req.document_id, clean_extraction)
    
    # Update document status and metadata
    doc.status = "verified"
    if clean_extraction.get("document_type"):
        doc.document_type = clean_extraction.get("document_type")
    if clean_extraction.get("document_date"):
        doc.document_date = clean_extraction.get("document_date")
    if clean_extraction.get("hospital"):
        doc.hospital = clean_extraction.get("hospital")
    if clean_extraction.get("doctor"):
        doc.doctor = clean_extraction.get("doctor")

    # Update patient name if approved or edited
    if clean_extraction.get("patient_name") and str(clean_extraction["patient_name"]).strip():
        patient = db.query(Patient).filter(Patient.id == req.patient_id).first()
        if patient:
            patient.name = str(clean_extraction["patient_name"]).strip()
        
    db.commit()
    
    return {
        "message": "Verification complete",
        "document_id": req.document_id,
        "approved_fields": approved_count,
        "rejected_fields": rejected_count,
        "timeline_events_created": len(events),
        "status": "verified"
    }


@router.get("/logs/{document_id}")
def get_verification_logs(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get verification history for a document."""
    logs = db.query(VerificationLog).filter(
        VerificationLog.document_id == document_id
    ).all()
    return [
        {
            "id": l.id,
            "field_name": l.field_name,
            "extracted_value": l.extracted_value,
            "verified_value": l.verified_value,
            "action": l.action,
            "created_at": l.created_at.isoformat() if l.created_at else None
        }
        for l in logs
    ]

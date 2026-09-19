from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import date
from app.database.connection import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.document import Document
from app.models.medical import TimelineEvent, LabResult, Medication, Diagnosis, Procedure
from app.auth.middleware import get_current_user
from app.services.timeline_service import detect_conflicts

router = APIRouter(prefix="/patients", tags=["Patients"])


class CreatePatientRequest(BaseModel):
    name: str
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


class UpdatePatientRequest(BaseModel):
    name: Optional[str] = None
    date_of_birth: Optional[str] = None
    gender: Optional[str] = None
    blood_group: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None


@router.post("")
def create_patient(
    req: CreatePatientRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = Patient(
        name=req.name,
        date_of_birth=req.date_of_birth,
        gender=req.gender,
        blood_group=req.blood_group,
        phone=req.phone,
        email=req.email,
        address=req.address,
        created_by=current_user.id
    )
    db.add(patient)
    db.commit()
    db.refresh(patient)
    return {"id": patient.id, "name": patient.name, "message": "Patient created"}


@router.put("/{patient_id}")
@router.patch("/{patient_id}")
def update_patient(
    patient_id: int,
    req: UpdatePatientRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")

    if req.name is not None and req.name.strip():
        patient.name = req.name.strip()
    if req.date_of_birth is not None:
        patient.date_of_birth = req.date_of_birth
    if req.gender is not None:
        patient.gender = req.gender
    if req.blood_group is not None:
        patient.blood_group = req.blood_group
    if req.phone is not None:
        patient.phone = req.phone
    if req.email is not None:
        patient.email = req.email
    if req.address is not None:
        patient.address = req.address

    db.commit()
    db.refresh(patient)
    return {
        "id": patient.id,
        "name": patient.name,
        "date_of_birth": str(patient.date_of_birth) if patient.date_of_birth else None,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "email": patient.email,
        "address": patient.address,
        "message": "Patient updated successfully"
    }


@router.get("")
def list_patients(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patients = db.query(Patient).order_by(Patient.name).all()
    return [
        {
            "id": p.id,
            "name": p.name,
            "date_of_birth": str(p.date_of_birth) if p.date_of_birth else None,
            "gender": p.gender,
            "blood_group": p.blood_group,
            "phone": p.phone
        }
        for p in patients
    ]


@router.get("/{patient_id}")
def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(404, "Patient not found")
    
    doc_count = db.query(Document).filter(Document.patient_id == patient_id).count()
    event_count = db.query(TimelineEvent).filter(
        TimelineEvent.patient_id == patient_id,
        TimelineEvent.verified == "approved"
    ).count()
    lab_count = db.query(LabResult).filter(LabResult.patient_id == patient_id).count()
    med_count = db.query(Medication).filter(Medication.patient_id == patient_id).count()
    diag_count = db.query(Diagnosis).filter(Diagnosis.patient_id == patient_id).count()
    proc_count = db.query(Procedure).filter(Procedure.patient_id == patient_id).count()
    conflicts = detect_conflicts(db, patient_id)
    
    return {
        "id": patient.id,
        "name": patient.name,
        "date_of_birth": str(patient.date_of_birth) if patient.date_of_birth else None,
        "gender": patient.gender,
        "blood_group": patient.blood_group,
        "phone": patient.phone,
        "email": patient.email,
        "address": patient.address,
        "stats": {
            "documents": doc_count,
            "timeline_events": event_count,
            "lab_results": lab_count,
            "medications": med_count,
            "diagnoses": diag_count,
            "procedures": proc_count
        },
        "conflicts": conflicts,
        "created_at": patient.created_at.isoformat() if patient.created_at else None
    }

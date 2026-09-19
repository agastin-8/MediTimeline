from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database.connection import get_db
from app.models.user import User
from app.models.medical import LabResult, Medication, Diagnosis, Procedure
from app.auth.middleware import get_current_user

router = APIRouter(tags=["Medical Data"])


from pydantic import BaseModel

class LabCreateSchema(BaseModel):
    patient_id: int
    test_name: str
    value: str
    unit: str
    reference_range: Optional[str] = None
    status: str = "normal"
    test_date: str
    lab_name: Optional[str] = "Apollo Diagnostics"

class LabUpdateSchema(BaseModel):
    value: Optional[str] = None
    unit: Optional[str] = None
    reference_range: Optional[str] = None
    status: Optional[str] = None
    test_date: Optional[str] = None
    lab_name: Optional[str] = None

@router.get("/labs/{patient_id}")
def get_labs(
    patient_id: int,
    test_name: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(LabResult).filter(LabResult.patient_id == patient_id)
    if test_name:
        query = query.filter(LabResult.test_name.ilike(f"%{test_name}%"))
    labs = query.order_by(LabResult.test_date.desc()).all()
    
    return [
        {
            "id": l.id,
            "test_name": l.test_name,
            "value": l.value,
            "unit": l.unit,
            "reference_range": l.reference_range,
            "status": l.status,
            "test_date": l.test_date,
            "lab_name": l.lab_name
        }
        for l in labs
    ]

@router.post("/labs")
def create_lab(
    data: LabCreateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_lab = LabResult(
        patient_id=data.patient_id,
        test_name=data.test_name,
        value=data.value,
        unit=data.unit,
        reference_range=data.reference_range,
        status=data.status,
        test_date=data.test_date,
        lab_name=data.lab_name
    )
    db.add(new_lab)
    db.commit()
    db.refresh(new_lab)
    return {"status": "created", "id": new_lab.id, "message": "Lab result added successfully"}

@router.put("/labs/{lab_id}")
def update_lab(
    lab_id: int,
    data: LabUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lab = db.query(LabResult).filter(LabResult.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab result not found")
    if data.value is not None:
        lab.value = data.value
    if data.unit is not None:
        lab.unit = data.unit
    if data.reference_range is not None:
        lab.reference_range = data.reference_range
    if data.status is not None:
        lab.status = data.status
    if data.test_date is not None:
        lab.test_date = data.test_date
    if data.lab_name is not None:
        lab.lab_name = data.lab_name
    db.commit()
    return {"status": "updated", "message": "Lab result updated successfully"}

@router.delete("/labs/{lab_id}")
def delete_lab(
    lab_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    lab = db.query(LabResult).filter(LabResult.id == lab_id).first()
    if not lab:
        raise HTTPException(status_code=404, detail="Lab result not found")
    db.delete(lab)
    db.commit()
    return {"status": "deleted", "message": "Lab result deleted successfully"}


@router.get("/medications/{patient_id}")
def get_medications(
    patient_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Medication).filter(Medication.patient_id == patient_id)
    if status:
        query = query.filter(Medication.status == status)
    meds = query.order_by(Medication.prescribed_date.desc()).all()
    
    return [
        {
            "id": m.id,
            "name": m.name,
            "dosage": m.dosage,
            "frequency": m.frequency,
            "duration": m.duration,
            "prescribed_by": m.prescribed_by,
            "prescribed_date": m.prescribed_date,
            "status": m.status,
            "notes": m.notes
        }
        for m in meds
    ]


@router.get("/diagnoses/{patient_id}")
def get_diagnoses(
    patient_id: int,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    query = db.query(Diagnosis).filter(Diagnosis.patient_id == patient_id)
    if status:
        query = query.filter(Diagnosis.status == status)
    diags = query.order_by(Diagnosis.first_seen.desc()).all()
    
    return [
        {
            "id": d.id,
            "condition": d.condition,
            "icd_code": d.icd_code,
            "severity": d.severity,
            "status": d.status,
            "first_seen": d.first_seen,
            "last_seen": d.last_seen,
            "diagnosed_by": d.diagnosed_by,
            "hospital": d.hospital,
            "notes": d.notes
        }
        for d in diags
    ]


@router.get("/procedures/{patient_id}")
def get_procedures(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    procs = db.query(Procedure).filter(
        Procedure.patient_id == patient_id
    ).order_by(Procedure.procedure_date.desc()).all()
    
    return [
        {
            "id": p.id,
            "procedure_name": p.procedure_name,
            "procedure_type": p.procedure_type,
            "procedure_date": p.procedure_date,
            "performed_by": p.performed_by,
            "hospital": p.hospital,
            "admission_date": p.admission_date,
            "discharge_date": p.discharge_date,
            "outcome": p.outcome,
            "notes": p.notes
        }
        for p in procs
    ]

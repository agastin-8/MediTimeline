import os
import uuid
import asyncio
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, BackgroundTasks
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from app.database.connection import get_db
from app.models.user import User
from app.models.patient import Patient
from app.models.document import Document
from app.models.medical import AIExtraction
from app.auth.middleware import get_current_user
from app.services.gemini_service import extract_medical_info
from app.services.pdf_service import extract_text_from_pdf
from app.services.ocr_service import extract_text_from_image
from app.config import settings

router = APIRouter(prefix="/documents", tags=["Documents"])

ALLOWED_TYPES = {"application/pdf", "image/png", "image/jpeg", "image/jpg"}
ALLOWED_EXTENSIONS = {".pdf", ".png", ".jpg", ".jpeg"}


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    patient_id: int = Form(...),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Upload a medical document for a patient."""
    # Validate file type
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, f"File type {ext} not allowed. Use: PDF, PNG, JPG")
    
    # Read file
    content = await file.read()
    file_size = len(content)
    
    # Generate unique filename
    unique_name = f"{uuid.uuid4()}{ext}"
    upload_path = os.path.join(settings.UPLOAD_DIR, unique_name)
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    
    with open(upload_path, "wb") as f:
        f.write(content)
    
    # Save document record
    doc = Document(
        patient_id=patient_id,
        filename=unique_name,
        original_filename=file.filename or "unknown",
        file_path=upload_path,
        file_type=ext.lstrip("."),
        file_size=file_size,
        status="uploaded"
    )
    db.add(doc)
    db.commit()
    db.refresh(doc)
    
    return {
        "id": doc.id,
        "filename": doc.original_filename,
        "file_type": doc.file_type,
        "file_size": file_size,
        "status": "uploaded",
        "message": "Document uploaded successfully. Ready for extraction."
    }


@router.post("/extract/{document_id}")
async def extract_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Run AI extraction pipeline on an uploaded document."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    # Update status
    doc.status = "processing"
    db.commit()
    
    try:
        # Read file bytes
        with open(doc.file_path, "rb") as f:
            file_bytes = f.read()
        
        # Extract text based on file type
        raw_text = ""
        if doc.file_type == "pdf":
            raw_text = extract_text_from_pdf(file_bytes)
        elif doc.file_type in ("png", "jpg", "jpeg"):
            raw_text = extract_text_from_image(file_bytes)
        
        doc.raw_text = raw_text
        doc.status = "extracted"
        db.commit()
        
        # Look up patient context
        patient = db.query(Patient).filter(Patient.id == doc.patient_id).first()
        patient_name = patient.name if patient else "Patient"
        
        # Run AI extraction
        extraction_result = await extract_medical_info(
            document_text=raw_text,
            document_hint=doc.original_filename,
            file_bytes=file_bytes,
            file_type=doc.file_type,
            patient_name=patient_name
        )
        
        # Save extraction
        existing = db.query(AIExtraction).filter(AIExtraction.document_id == document_id).first()
        if existing:
            db.delete(existing)
            db.commit()
        
        ai_ext = AIExtraction(
            document_id=document_id,
            raw_extraction=extraction_result,
            patient_name=extraction_result.get("patient_name"),
            document_type=extraction_result.get("document_type"),
            document_date=extraction_result.get("document_date"),
            hospital=extraction_result.get("hospital"),
            doctor=extraction_result.get("doctor"),
            diagnoses=extraction_result.get("diagnosis"),
            medications=extraction_result.get("medications"),
            lab_results=extraction_result.get("lab_results"),
            procedures=extraction_result.get("procedures"),
            clinical_notes=extraction_result.get("clinical_notes"),
            follow_up=extraction_result.get("follow_up"),
            confidence=extraction_result.get("confidence"),
            source_page=extraction_result.get("source_page", 1),
            model_used=extraction_result.get("model_used", "unknown")
        )
        db.add(ai_ext)
        
        # Update document metadata
        doc.document_type = extraction_result.get("document_type")
        doc.document_date = extraction_result.get("document_date")
        doc.hospital = extraction_result.get("hospital")
        doc.doctor = extraction_result.get("doctor")
        doc.status = "extracted"
        db.commit()
        
        return {
            "document_id": document_id,
            "status": "extracted",
            "extraction": extraction_result,
            "message": "Extraction complete. Ready for human verification."
        }
    
    except Exception as e:
        doc.status = "failed"
        db.commit()
        raise HTTPException(500, f"Extraction failed: {str(e)}")


@router.get("")
def list_documents(
    patient_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all documents, optionally filtered by patient."""
    query = db.query(Document)
    if patient_id:
        query = query.filter(Document.patient_id == patient_id)
    docs = query.order_by(Document.created_at.desc()).all()
    
    return [
        {
            "id": d.id,
            "patient_id": d.patient_id,
            "filename": d.original_filename,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "document_type": d.document_type,
            "document_date": d.document_date,
            "hospital": d.hospital,
            "doctor": d.doctor,
            "status": d.status,
            "created_at": d.created_at.isoformat() if d.created_at else None
        }
        for d in docs
    ]


@router.get("/{document_id}/extraction")
def get_extraction(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the AI extraction result for a document."""
    ext = db.query(AIExtraction).filter(AIExtraction.document_id == document_id).first()
    if not ext:
        raise HTTPException(404, "No extraction found for this document")
    return {
        "id": ext.id,
        "document_id": ext.document_id,
        "raw_extraction": ext.raw_extraction,
        "patient_name": ext.patient_name,
        "document_type": ext.document_type,
        "document_date": ext.document_date,
        "hospital": ext.hospital,
        "doctor": ext.doctor,
        "diagnoses": ext.diagnoses,
        "medications": ext.medications,
        "lab_results": ext.lab_results,
        "procedures": ext.procedures,
        "clinical_notes": ext.clinical_notes,
        "follow_up": ext.follow_up,
        "confidence": ext.confidence,
        "model_used": ext.model_used
    }


@router.get("/{document_id}/file")
def get_document_file(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get document file path for preview."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    return {"file_path": doc.file_path, "file_type": doc.file_type, "filename": doc.original_filename}


@router.get("/{document_id}/raw")
def get_document_raw(
    document_id: int,
    db: Session = Depends(get_db)
):
    """Stream document binary content for direct browser preview / embed."""
    doc = db.query(Document).filter(Document.id == document_id).first()
    if not doc:
        raise HTTPException(404, "Document not found")
    
    backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
    root_dir = os.path.dirname(backend_dir)
    
    candidates = [
        doc.file_path,
        os.path.join(settings.UPLOAD_DIR, doc.filename) if doc.filename else None,
        os.path.join(settings.UPLOAD_DIR, doc.original_filename) if doc.original_filename else None,
        os.path.join(backend_dir, "uploads", doc.filename) if doc.filename else None,
        os.path.join(backend_dir, "uploads", doc.original_filename) if doc.original_filename else None,
        os.path.join(root_dir, "uploads", doc.filename) if doc.filename else None,
        os.path.join(root_dir, "uploads", doc.original_filename) if doc.original_filename else None,
    ]
    
    resolved_path = None
    for c in candidates:
        if c and os.path.exists(c) and os.path.isfile(c):
            resolved_path = c
            break
            
    if not resolved_path:
        raise HTTPException(404, f"Document file '{doc.original_filename}' not found on disk")
    
    media_type = "application/pdf" if doc.file_type == "pdf" else f"image/{doc.file_type if doc.file_type != 'jpg' else 'jpeg'}"
    return FileResponse(
        resolved_path,
        media_type=media_type,
        filename=doc.original_filename,
        content_disposition_type="inline"
    )

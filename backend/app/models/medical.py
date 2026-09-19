from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class TimelineEvent(Base):
    __tablename__ = "timeline_events"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    source_document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    event_type = Column(String, nullable=False)  # lab, medicine, visit, diagnosis, procedure, admission, discharge
    event_date = Column(String, nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    doctor = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    confidence = Column(Float, nullable=True)
    source_page = Column(Integer, nullable=True)
    verified = Column(String, default="pending")  # pending, approved, rejected
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="timeline_events")
    source_document = relationship("Document", back_populates="timeline_events")


class AIExtraction(Base):
    __tablename__ = "ai_extractions"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    raw_extraction = Column(JSON, nullable=True)
    patient_name = Column(String, nullable=True)
    document_type = Column(String, nullable=True)
    document_date = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    doctor = Column(String, nullable=True)
    diagnoses = Column(JSON, nullable=True)
    medications = Column(JSON, nullable=True)
    lab_results = Column(JSON, nullable=True)
    procedures = Column(JSON, nullable=True)
    clinical_notes = Column(Text, nullable=True)
    follow_up = Column(Text, nullable=True)
    confidence = Column(Float, nullable=True)
    source_page = Column(Integer, nullable=True)
    model_used = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    document = relationship("Document", back_populates="ai_extraction")


class LabResult(Base):
    __tablename__ = "lab_results"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    test_name = Column(String, nullable=False)
    value = Column(String, nullable=False)
    unit = Column(String, nullable=True)
    reference_range = Column(String, nullable=True)
    status = Column(String, nullable=True)  # normal, high, low, critical
    test_date = Column(String, nullable=True)
    lab_name = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="lab_results")


class Medication(Base):
    __tablename__ = "medications"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    name = Column(String, nullable=False)
    dosage = Column(String, nullable=True)
    frequency = Column(String, nullable=True)
    duration = Column(String, nullable=True)
    prescribed_by = Column(String, nullable=True)
    prescribed_date = Column(String, nullable=True)
    status = Column(String, default="active")  # active, completed, stopped
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="medications")


class Diagnosis(Base):
    __tablename__ = "diagnoses"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    condition = Column(String, nullable=False)
    icd_code = Column(String, nullable=True)
    severity = Column(String, nullable=True)  # mild, moderate, severe, critical
    status = Column(String, default="active")  # active, resolved, chronic
    first_seen = Column(String, nullable=True)
    last_seen = Column(String, nullable=True)
    diagnosed_by = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="diagnoses")


class Procedure(Base):
    __tablename__ = "procedures"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=True)
    procedure_name = Column(String, nullable=False)
    procedure_type = Column(String, nullable=True)  # surgery, scan, visit, admission, discharge
    procedure_date = Column(String, nullable=True)
    performed_by = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    admission_date = Column(String, nullable=True)
    discharge_date = Column(String, nullable=True)
    outcome = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    patient = relationship("Patient", back_populates="procedures")


class VerificationLog(Base):
    __tablename__ = "verification_logs"

    id = Column(Integer, primary_key=True, index=True)
    document_id = Column(Integer, ForeignKey("documents.id"), nullable=False)
    field_name = Column(String, nullable=False)
    extracted_value = Column(Text, nullable=True)
    verified_value = Column(Text, nullable=True)
    action = Column(String, nullable=False)  # approved, rejected, edited
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

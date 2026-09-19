from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database.connection import Base

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=False)
    filename = Column(String, nullable=False)
    original_filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)  # pdf, png, jpg
    file_size = Column(Integer, nullable=True)
    document_type = Column(String, nullable=True)  # blood_report, prescription, mri, etc
    document_date = Column(String, nullable=True)
    hospital = Column(String, nullable=True)
    doctor = Column(String, nullable=True)
    status = Column(String, default="uploaded")  # uploaded, processing, extracted, verified, failed
    raw_text = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    patient = relationship("Patient", back_populates="documents")
    ai_extraction = relationship("AIExtraction", back_populates="document", uselist=False)
    timeline_events = relationship("TimelineEvent", back_populates="source_document")

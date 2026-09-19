import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.config import settings
from app.database.connection import engine
from app.models import *  # Import all models to register with SQLAlchemy
from app.database.connection import Base

# Import routers
from app.routers import auth, documents, verification, timeline, medical, ai_search, patients

# Create all tables
Base.metadata.create_all(bind=engine)

# Create uploads dir
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="MediTimeline AI API",
    description="Medical Document Intelligence & Patient Timeline — HE-05",
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded files statically
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers (support both standard and /api prefixed routes)
ROUTERS = [
    auth.router,
    documents.router,
    verification.router,
    timeline.router,
    medical.router,
    ai_search.router,
    patients.router,
]
for r in ROUTERS:
    app.include_router(r)
    app.include_router(r, prefix="/api")


@app.get("/")
def root():
    return {
        "app": "MediTimeline AI",
        "version": "1.0.0",
        "status": "running",
        "docs": "/api/docs",
        "problem_statement": "HE-05: Medical Document Intelligence & Patient Timeline"
    }


@app.get("/health")
def health():
    return {"status": "healthy", "message": "MediTimeline AI is operational"}

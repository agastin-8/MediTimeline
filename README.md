# MediTimeline AI — Medical Document Intelligence & Patient Timeline (HE-05)

> **Turn scattered medical records into one intelligent, verified patient story.**

[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38B2AC?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Framer Motion](https://img.shields.io/badge/Framer%20Motion-12-0055FF?logo=framer&logoColor=white)](https://framer.com/motion)
[![Google Gemini](https://img.shields.io/badge/AI-Google%20Gemini-8E75B2?logo=google&logoColor=white)](https://ai.google.dev)

---

## 🌟 Overview & Hackathon Problem Alignment (HE-05)

Patients and healthcare providers struggle with disjointed medical records scattered across paper prescriptions, PDF lab reports, MRI/CT scans, discharge summaries, and hospital bills. 

**MediTimeline AI** is an enterprise-grade full stack SaaS application that:
1. Ingests multi-format medical records (PDFs, scanned images, lab reports, prescriptions).
2. Extracts structured clinical entities via **Google Gemini AI + OCR + PyPDF/PyMuPDF**.
3. Enforces a strict **Human-in-the-Loop (HITL) Medical Verification Pipeline** where doctors or patients verify extracted data before committing to the database.
4. Synthesizes an interactive, chronological **Patient Medical Timeline** with full bidirectional links to original source evidence pages and confidence metrics.
5. Surfaces intelligent **Conflict Detection** (e.g. blood group discrepancies, contradictory diagnoses, duplicate prescriptions).
6. Provides conversational **Grounded AI Search** that cites specific documents and page numbers — with strict guardrails against clinical hallucinations.

---

## 🏗️ Architecture & Technology Stack

```
                                  ┌───────────────────────────────┐
                                  │      Client (Browser)         │
                                  │  React 19 + Vite + Tailwind   │
                                  │  Framer Motion + Recharts     │
                                  └──────────────┬────────────────┘
                                                 │ REST API / JWT
                                                 ▼
                                  ┌───────────────────────────────┐
                                  │      FastAPI Backend          │
                                  │  Pydantic + SQLAlchemy 2.0    │
                                  └───────┬──────────────┬────────┘
                                          │              │
                    ┌─────────────────────┴──────┐       └──────────────────┐
                    ▼                            ▼                          ▼
      ┌───────────────────────────┐ ┌──────────────────────────┐ ┌─────────────────────┐
      │     Document Pipeline     │ │        AI Engine         │ │ Database & Storage  │
      │ • PyMuPDF / PyPDF         │ │ • Google Gemini 1.5 Pro  │ │ • PostgreSQL /      │
      │ • Tesseract OCR / PIL     │ │ • Strict JSON Schemas    │ │   SQLite Engine     │
      │ • Multi-format Ingestion  │ │ • Grounded AI QA Search  │ │ • Supabase Ready    │
      └───────────────────────────┘ └──────────────────────────┘ └─────────────────────┘
```

---

## 🚀 Key Features

### 1. 🏥 Real-Time AI Document Processing Pipeline
* Visual 10-stage animated processing status tracker:
  `Uploaded` ➔ `Reading Document` ➔ `Running OCR` ➔ `Extracting Entities` ➔ `Finding Dates` ➔ `Finding Medicines` ➔ `Finding Lab Results` ➔ `Generating Timeline Events` ➔ `Verification Pending` ➔ `Completed`

### 2. 🛡️ Human-in-the-Loop (HITL) Verification Screen
* Split-screen interface: Document Preview on the left, Editable Extracted Entities on the right.
* Per-field confidence score badges (`High >90%`, `Medium >70%`, `Low`).
* Exact source page citation.
* Granular accept / edit / reject controls before committing to the health record.

### 3. 📅 Interactive Patient Medical Timeline
* Unified chronological view of 7 event types: **Labs**, **Medications**, **Visits**, **Diagnoses**, **Procedures**, **Admissions**, **Discharges**.
* Year jumping, category filtering, search, and expandable cards.
* Right-side **Evidence Drawer** with direct document deep-links and verified confidence.

### 4. 📈 Longitudinal Lab Trends
* Interactive Recharts visualizations for key biomarkers:
  * Blood Glucose (Fasting & PP)
  * Hemoglobin / HbA1c
  * Serum Creatinine / eGFR
  * Lipid Panel (Total Cholesterol, LDL, HDL, Triglycerides)
  * Platelet Counts
* Configurable time-range filters (30 Days, 6 Months, 1 Year, All Time) with clinical reference ranges.

### 5. 💊 Medication & Procedure Tracking
* Active vs. historical prescription timeline with dosages, frequency, and source links.
* Surgical and imaging history with hospital admission / discharge summaries.

### 6. 🔍 Grounded AI Medical Records Search
* Natural language clinical question answering grounded exclusively in patient records.
* Instant source citations with document name, date, and page reference.
* Pre-built clinical query prompts.

### 7. ⚠️ Entity Conflict Detection Engine
* Automated cross-document comparison:
  * Conflicting blood groups across lab reports
  * Date of birth / demographic discrepancies
  * Duplicate or contraindicated prescriptions
* Side-by-side resolution drawer.

### 8. 🎭 Preloaded Demo Patient ("Ravi Kumar")
* 1-Click instant demo login for judges.
* Complete pre-populated medical history spanning 2024–2026 across 5 realistic clinical documents.

---

## 💻 Quick Start & Running Locally

### Option A: 1-Click Launch (Windows)
Double-click `start-dev.bat` or run in PowerShell:
```powershell
.\run.ps1
```

### Option B: Manual Setup

#### 1. Backend (FastAPI)
```bash
cd backend
py -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
* API Server: `http://localhost:8000`
* Interactive Swagger Docs: `http://localhost:8000/api/docs`

#### 2. Frontend (React 19 + Vite)
```bash
cd frontend
npm install
npm run dev
```
* Web App: `http://localhost:5173`

---

## 🔒 Security & Medical Disclaimer
* **JWT Authentication** with role-based access control (Doctor, Patient, Admin).
* **Audit Logging** for all document approvals and modifications.
* **Disclaimer**: *MediTimeline AI is an intelligent document management and visualization tool designed to assist healthcare professionals and patients. It does not provide automated diagnostic conclusions.*

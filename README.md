# 🏥 MediTimeline AI

### AI-Powered Medical Document Intelligence & Patient Timeline

MediTimeline AI is a full-stack healthcare SaaS platform that transforms unstructured medical documents into structured, easy-to-understand patient medical timelines using AI.

The platform allows users to upload medical documents such as lab reports, prescriptions, medical records, and PDFs. AI extracts important healthcare information, validates the extracted data, and organizes it chronologically into an interactive patient timeline.

---

## 🚀 Key Features

* 📄 Upload medical documents and PDF reports
* 🔍 PDF text extraction
* 📝 OCR support for scanned medical documents
* 🤖 AI-powered medical information extraction using Gemini
* 🧠 Extract diagnosis, medicines, symptoms, lab results, dates, and medical events
* ✅ AI output validation using Pydantic
* 👤 Human verification and correction of extracted information
* 🕒 Chronological patient medical timeline
* 📊 Interactive healthcare dashboard
* 📈 Medical data visualization using charts
* 🔐 Secure JWT authentication
* 🗄️ Structured database storage
* 📱 Responsive and professional SaaS interface

---

## 🏗️ System Architecture

```text
                    ┌──────────────────┐
                    │      User        │
                    └────────┬─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │ React + Vite        │
                  │ Tailwind CSS        │
                  └─────────┬───────────┘
                            │
                            ▼
                  ┌─────────────────────┐
                  │     FastAPI         │
                  │      Backend        │
                  └─────────┬───────────┘
                            │
                ┌───────────┴───────────┐
                ▼                       ▼
       ┌─────────────────┐     ┌─────────────────┐
       │ PDF Extraction  │     │      OCR        │
       └────────┬────────┘     └────────┬────────┘
                │                       │
                └───────────┬───────────┘
                            ▼
                  ┌─────────────────────┐
                  │    Gemini AI        │
                  │ Medical Extraction  │
                  └─────────┬───────────┘
                            ▼
                  ┌─────────────────────┐
                  │ Pydantic Validation │
                  └─────────┬───────────┘
                            ▼
                  ┌─────────────────────┐
                  │ User Verification   │
                  └─────────┬───────────┘
                            ▼
                  ┌─────────────────────┐
                  │ SQL Database        │
                  │ + SQLAlchemy        │
                  └─────────┬───────────┘
                            ▼
                  ┌─────────────────────┐
                  │ Patient Timeline    │
                  │ & Dashboard         │
                  └─────────────────────┘
```

---

## 🛠️ Technology Stack

### Frontend

* React 19
* Vite
* Tailwind CSS
* Framer Motion
* Recharts

### Backend

* FastAPI
* Python
* Pydantic
* SQLAlchemy
* JWT Authentication

### AI & Document Processing

* Google Gemini API
* OCR
* PDF Text Extraction

### Database

* SQL Database
* SQLAlchemy ORM

### Deployment

* Vercel
* Cloud Backend Hosting

---

## 🔄 How It Works

### 1. User Authentication

The user securely logs into the platform using JWT-based authentication.

### 2. Upload Medical Document

The user uploads a medical document such as:

* Lab Report
* Prescription
* Medical Record
* Medical Certificate
* PDF Report
* Scanned Document

### 3. Document Processing

The backend determines how to process the document.

For text-based PDFs, the system performs PDF text extraction.

For scanned or image-based documents, OCR is used to extract readable text.

### 4. AI Medical Information Extraction

The extracted text is processed using the Google Gemini API.

The AI identifies relevant information such as:

* Patient information
* Diagnosis
* Symptoms
* Medicines
* Dosage
* Lab results
* Doctor information
* Medical dates
* Follow-up information
* Medical events

### 5. Data Validation

The extracted AI response is validated using Pydantic models.

This helps ensure that the extracted information follows the expected structured format.

### 6. Human Verification

The extracted information is shown to the user before being finalized.

Users can review, edit, and correct the information when required.

### 7. Medical Timeline Generation

After verification, medical events are organized chronologically.

Example:

```text
2024-01-10
     ↓
Blood Test
     ↓
Diagnosis
     ↓
Prescription
     ↓
Follow-up
     ↓
2024-03-15
New Lab Report
```

### 8. Dashboard

The verified information is displayed through an interactive dashboard with:

* Patient timeline
* Medical events
* Medicines
* Diagnoses
* Lab results
* Charts and analytics

---

## 🤖 AI Workflow

```text
Medical Document
       ↓
Text / OCR Extraction
       ↓
Gemini AI
       ↓
Medical Information Extraction
       ↓
Structured JSON
       ↓
Pydantic Validation
       ↓
Human Verification
       ↓
Database
       ↓
Patient Timeline
```

---

## 🔐 Security

MediTimeline AI includes security mechanisms such as:

* JWT-based authentication
* Protected API endpoints
* Environment variables for API keys
* Input validation using Pydantic
* Backend-side AI API communication
* User-specific data access

> API keys and sensitive configuration values should be stored in environment variables and should never be committed to GitHub.

---

## 📂 Project Structure

```text
MediTimeline-AI/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── app/
│   ├── models/
│   ├── schemas/
│   ├── routes/
│   ├── services/
│   ├── database/
│   ├── main.py
│   └── requirements.txt
│
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Installation

### Prerequisites

Make sure the following are installed:

* Node.js
* Python 3.10+
* Git
* SQL Database
* Gemini API Key

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will run locally using the Vite development server.

---

### Backend Setup

```bash
cd backend

python -m venv venv
```

Activate the virtual environment.

**Windows:**

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Run the backend:

```bash
uvicorn main:app --reload
```

---

## 🔑 Environment Variables

Create a `.env` file in the backend directory.

Example:

```env
GEMINI_API_KEY=your_gemini_api_key
DATABASE_URL=your_database_url
JWT_SECRET_KEY=your_secret_key
```

Do not commit the `.env` file to GitHub.

---

## 📊 Example Medical Data

The platform can convert unstructured information into structured data such as:

```json
{
  "date": "2025-03-12",
  "diagnosis": "Example Diagnosis",
  "medications": [
    {
      "name": "Example Medicine",
      "dosage": "500 mg"
    }
  ],
  "lab_results": [
    {
      "test": "Example Test",
      "value": "Example Value"
    }
  ]
}
```

---

## 🎯 Problem We Solve

Medical information is often distributed across multiple documents such as prescriptions, lab reports, scans, and hospital records.

Patients and healthcare users may find it difficult to understand their medical history when information is scattered across different documents.

MediTimeline AI converts these documents into structured information and presents them as a chronological medical timeline.

---

## 💡 Innovation

* AI-powered medical document understanding
* Automatic information extraction
* OCR + PDF processing
* Human-in-the-loop verification
* Chronological patient timeline
* Centralized medical information dashboard
* Structured healthcare data from unstructured documents

---

## ⚠️ Medical Disclaimer

MediTimeline AI is designed as a document intelligence and organization tool.

It does **not** replace a qualified doctor, medical professional, diagnosis, or clinical decision-making system.

AI-generated information should always be reviewed and verified by an appropriate healthcare professional when used for medical purposes.

---

## 🏆 Hackathon Project

**Project:** MediTimeline AI

**Problem Statement:** Medical Document Intelligence & Patient Timeline

**Objective:** Transform unstructured medical documents into structured, verifiable, and chronological patient health information using AI.

---

## 👨‍💻 Development Team

Built as a full-stack AI healthcare application for a national-level hackathon.

---

## 📌 Future Enhancements

* Multi-language medical document support
* Voice-based medical history interaction
* Advanced medical trend visualization
* Doctor/hospital integration
* Additional document formats
* Improved AI validation
* Secure healthcare data sharing
* Mobile application

---

## ⭐ Project Vision

> **From scattered medical documents to one understandable medical timeline.**

MediTimeline AI aims to make medical history easier to organize, understand, verify, and access through AI-powered document intelligence.
# MediTimeline

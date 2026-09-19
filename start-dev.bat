@echo off
echo ===================================================
echo     MediTimeline AI - Healthcare Intelligence SaaS
echo ===================================================
echo.

echo Starting Backend API (FastAPI) on http://localhost:8000 ...
start "MediTimeline Backend" cmd /k "cd backend && .\venv\Scripts\activate && uvicorn main:app --reload --port 8000"

echo Starting Frontend (React 19 + Vite) on http://localhost:5173 ...
start "MediTimeline Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ===================================================
echo  Both services launched!
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:8000
echo  API Docs: http://localhost:8000/api/docs
echo ===================================================
pause

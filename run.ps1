# MediTimeline AI - PowerShell Dev Launcher
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "   MediTimeline AI - Healthcare Intelligence SaaS  " -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Starting Backend API (FastAPI) on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\ASHUUUUUU\backend; .\venv\Scripts\activate; uvicorn main:app --reload --port 8000"

Write-Host "Starting Frontend (React 19 + Vite) on http://localhost:5173 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd e:\ASHUUUUUU\frontend; npm run dev"

Write-Host ""
Write-Host "===================================================" -ForegroundColor Green
Write-Host " Both services launched!" -ForegroundColor White
Write-Host " Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host " Backend:  http://localhost:8000" -ForegroundColor Cyan
Write-Host " API Docs: http://localhost:8000/api/docs" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Green

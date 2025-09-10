@echo off
echo Starting DAMS Backend and Frontend...

REM Start Laravel backend
echo Starting Laravel backend server...
start "Laravel Backend" cmd /k "cd /d C:\Users\Dell\Desktop\DAMS\DAMS-Backend && php artisan serve --host=127.0.0.1 --port=8000"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start React frontend
echo Starting React frontend server...
start "React Frontend" cmd /k "cd /d C:\Users\Dell\Desktop\DAMS\DAMS-FRONTEND && npm run dev"

echo Both servers are starting...
echo Backend will be available at: http://127.0.0.1:8000
echo Frontend will be available at: http://localhost:5173 (or similar)
echo.
echo Press any key to exit this script (servers will continue running)
pause >nul

@echo off
REM Admin Panel Setup Script for Windows

echo.
echo ======================================
echo   Admin Panel - Development Setup
echo ======================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo X Node.js is not installed. Please install Node.js first.
    exit /b 1
)

echo + Node.js version:
node -v
echo + npm version:
npm -v
echo.

echo Installing backend dependencies...
call npm install

if %ERRORLEVEL% neq 0 (
    echo X Failed to install backend dependencies
    exit /b 1
)

echo + Backend dependencies installed
echo.

echo Installing frontend dependencies...
cd frontend
call npm install

if %ERRORLEVEL% neq 0 (
    echo X Failed to install frontend dependencies
    exit /b 1
)

echo + Frontend dependencies installed
echo.

cd ..

if not exist .env (
    echo Creating .env file from .env.example...
    copy .env.example .env
    echo Warning: Please update .env with your configuration
    echo.
)

echo ======================================
echo   Setup Complete!
echo ======================================
echo.
echo To start the development server, run:
echo   npm run dev-all
echo.
echo Or start them separately:
echo   Backend:  npm run dev
echo   Frontend: cd frontend ^&^& npm start
echo.
echo Backend will run on: http://localhost:5000
echo Frontend will run on: http://localhost:3000
echo.
pause

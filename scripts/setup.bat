@echo off
REM Business Guardian AI - Windows Setup Script

echo ========================================
echo Business Guardian AI - Setup Script
echo ========================================
echo.

REM Check Python
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Python 3.10+ is required but not installed
    exit /b 1
)
echo [OK] Python found

REM Check Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js 18+ is required but not installed
    exit /b 1
)
echo [OK] Node.js found

REM Check npm
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] npm is required but not installed
    exit /b 1
)
echo [OK] npm found
echo.

REM Setup environment file
echo Setting up environment variables...
if not exist .env (
    copy .env.example .env
    echo [OK] .env file created
    echo [WARNING] Please edit .env and add your API keys
) else (
    echo [WARNING] .env file already exists, skipping...
)
echo.

REM Create directories
echo Creating project directories...
mkdir backend\confluent\kafka_setup 2>nul
mkdir backend\confluent\flink_jobs 2>nul
mkdir backend\confluent\connectors 2>nul
mkdir backend\google_cloud\vertex_ai 2>nul
mkdir backend\google_cloud\gemini 2>nul
mkdir backend\google_cloud\cloud_functions 2>nul
mkdir backend\google_cloud\models 2>nul
mkdir backend\services\qr_verification 2>nul
mkdir backend\services\fraud_detection 2>nul
mkdir backend\services\alert_manager 2>nul
mkdir data\mock_generators 2>nul
mkdir data\sample_data 2>nul
mkdir data\schemas 2>nul
mkdir tests\unit 2>nul
mkdir tests\integration 2>nul
mkdir tests\e2e 2>nul
mkdir logs 2>nul
echo [OK] Directories created
echo.

REM Setup Python backend
echo Setting up Python backend...
cd backend
if not exist venv (
    python -m venv venv
    echo [OK] Virtual environment created
) else (
    echo [WARNING] Virtual environment already exists
)

call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt
echo [OK] Python dependencies installed
cd ..
echo.

REM Setup React frontend
echo Setting up React frontend...
cd frontend
call npm install
echo [OK] npm dependencies installed
cd ..
echo.

echo ========================================
echo Setup complete!
echo ========================================
echo.
echo Next steps:
echo 1. Edit .env file with your API keys
echo 2. Start backend: cd backend ^&^& venv\Scripts\activate ^&^& uvicorn main:app --reload
echo 3. Start frontend: cd frontend ^&^& npm start
echo 4. Visit http://localhost:3000
echo.
echo Or use Docker:
echo docker-compose up
echo.
pause

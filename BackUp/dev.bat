@echo off
title COMP4050 Development Environment

echo ========================================
echo  COMP4050 BAM Development Environment
echo ========================================
echo.

REM Check if we're in the right directory
if not exist "package.json" goto wrong_directory
if not exist "docker-compose.yml" goto wrong_directory
if not exist "backend" goto wrong_directory
goto directory_ok

:wrong_directory
echo ❌ Error: This script must be run from the project root directory
echo    (where package.json, docker-compose.yml, and backend/ are located)
pause
exit /b 1

:directory_ok
echo 📍 Running development setup from: %CD%
echo.

REM Check prerequisites
echo 🔍 Checking prerequisites...

docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Error: npm is not available. Please install Node.js with npm included.
    pause
    exit /b 1
)

echo ✅ Prerequisites check passed
echo.

REM Check if this is first run
if not exist "backend\node_modules" (
    echo 📦 First run detected - installing dependencies...
    echo.
    
    echo 🔧 Installing root dependencies...
    call npm install
    if %errorlevel% neq 0 goto error
    
    echo 🔧 Installing backend dependencies...
    cd backend
    call npm install
    if %errorlevel% neq 0 goto error
    cd ..
    
    echo 🔧 Installing frontend dependencies...
    cd frontend
    call npm install
    if %errorlevel% neq 0 goto error
    cd ..
    
    echo ✅ Dependencies installed!
    echo.
)

echo 🚀 Starting PostgreSQL database...
docker-compose up -d postgres
if %errorlevel% neq 0 goto error

echo.
echo ⏳ Waiting for database to be ready...
:wait_loop
docker-compose exec -T postgres pg_isready -U comp4050_user -d comp4050_db >nul 2>&1
if %errorlevel% neq 0 (
    timeout /t 2 /nobreak >nul
    goto wait_loop
)

echo ✅ Database is ready!
echo.

REM Setup database schema
echo 🗄️ Setting up database schema...
cd backend
call npm run db:generate >nul 2>&1
if %errorlevel% neq 0 goto error
call npm run db:push >nul 2>&1
if %errorlevel% neq 0 goto error
cd ..

echo ✅ Database setup complete
echo.

echo 🔧 Starting backend server...
echo 📊 Backend: http://localhost:3001
echo 🗄️ Database Studio: npm run db:studio
echo.
echo Press Ctrl+C to stop all services
echo.

cd backend
npm run dev

goto end

:error
echo.
echo ❌ An error occurred. Please check the output above.
pause
exit /b 1

:end

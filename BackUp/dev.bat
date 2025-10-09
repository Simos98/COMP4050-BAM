@echo off
title COMP4050 Development Environment

echo ========================================
echo  COMP4050 BAM Development Environment
echo ========================================
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

REM Setup database if needed
echo 🗄️ Setting up database schema...
cd backend
call npm run db:generate >nul 2>&1
call npm run db:push >nul 2>&1
cd ..

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

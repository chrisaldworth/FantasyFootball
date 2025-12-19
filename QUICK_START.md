# Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites

Before you start, make sure you have:
- **Python 3.11+** installed
- **Node.js 18+** installed

Check your versions:
```bash
python3 --version  # Should be 3.11 or higher
node --version     # Should be v18 or higher
```

If you need to install:
- **Python**: `brew install python@3.11` (macOS) or download from python.org
- **Node.js**: `brew install node` (macOS) or download from nodejs.org

## Automated Setup (Recommended)

Run the setup script:
```bash
./setup.sh
```

This will:
- ✅ Check prerequisites
- ✅ Create Python virtual environment
- ✅ Install all dependencies
- ✅ Create environment files

## Manual Setup

### 1. Backend (Terminal 1)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Create .env file
cat > .env << EOF
DATABASE_URL=sqlite:///./fpl_companion.db
SECRET_KEY=dev-secret-key-change-in-production
FRONTEND_URL=http://localhost:3000
DEBUG=True
EOF

# Start backend
uvicorn app.main:app --reload --port 8080
```

Backend will run at: http://localhost:8080

### 2. Frontend (Terminal 2)

```bash
cd frontend
npm install

# Create .env.local file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8080
EOF

# Start frontend
npm run dev
```

Frontend will run at: http://localhost:3000

## Verify It's Working

1. Open http://localhost:3000 in your browser
2. You should see the login/register page
3. Check backend health: http://localhost:8080/health
4. View API docs: http://localhost:8080/docs

## Troubleshooting

**"Python 3.11+ required"**
- Install Python 3.11+: `brew install python@3.11`
- Or use pyenv: `pyenv install 3.11.9 && pyenv local 3.11.9`

**"Node.js not found"**
- Install Node.js: `brew install node`
- Or download from: https://nodejs.org/

**Port already in use**
```bash
# Find and kill process on port 8080
lsof -i :8080
kill -9 <PID>

# Or use different port
uvicorn app.main:app --reload --port 8081
```

**Database errors**
- SQLite is used by default (no setup needed)
- Ensure you have write permissions in `backend/` directory

For more details, see [SETUP.md](SETUP.md)










# Local Development Setup Guide

This guide will help you get the Fantasy Football application running locally on your machine.

## Prerequisites Check

Before starting, ensure you have:

1. **Python 3.11+** (you have Python 3.9.6 - you'll need to upgrade)
2. **Node.js 18+** (not currently installed)
3. **npm** (comes with Node.js)

### Installing Prerequisites

#### Python 3.11+ (macOS)

Using Homebrew:
```bash
brew install python@3.11
# Or for latest:
brew install python@3.12
```

Or using pyenv (recommended for managing multiple Python versions):
```bash
brew install pyenv
pyenv install 3.11.9
pyenv local 3.11.9
```

#### Node.js 18+ (macOS)

Using Homebrew:
```bash
brew install node@18
# Or for latest LTS:
brew install node
```

Or download from: https://nodejs.org/

Verify installation:
```bash
python3 --version  # Should show 3.11+
node --version     # Should show v18+
npm --version      # Should show 9+
```

## Quick Setup

### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (use python3.11 if you have multiple versions)
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from example below)
cp .env.example .env  # Or create manually

# Run the backend
uvicorn app.main:app --reload --port 8080
```

The backend will be available at:
- API: http://localhost:8080
- Docs: http://localhost:8080/docs
- Health: http://localhost:8080/health

### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file (copy from example below)
cp .env.local.example .env.local  # Or create manually

# Run the frontend
npm run dev
```

The frontend will be available at: http://localhost:3000

## Environment Files

### Backend `.env` (create in `backend/` directory)

```env
# Database (SQLite for local dev - no setup required)
DATABASE_URL=sqlite:///./fpl_companion.db

# JWT Secret (for local dev, any string works)
SECRET_KEY=dev-secret-key-change-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Debug mode
DEBUG=True

# Optional: Push Notifications (leave empty for local dev)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=admin@fplassistant.com

# Optional: FPL Encryption Key (only if linking FPL accounts)
FPL_ENCRYPTION_KEY=

# Optional: Football API Keys
API_FOOTBALL_KEY=
FOOTBALL_DATA_KEY=
```

### Frontend `.env.local` (create in `frontend/` directory)

```env
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Optional: VAPID Public Key (for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
```

## Running Both Services

You'll need two terminal windows:

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8080
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Then open http://localhost:3000 in your browser.

## Troubleshooting

### Python Version Issues

If you have multiple Python versions:
```bash
# Check available versions
which python3
which python3.11
which python3.12

# Use specific version when creating venv
python3.11 -m venv venv
```

### Port Already in Use

If port 8080 or 3000 is already in use:
```bash
# Find process using port
lsof -i :8080
lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Database Issues

The app uses SQLite by default, which requires no setup. The database file will be created automatically at `backend/fpl_companion.db`.

If you see database errors:
- Ensure you have write permissions in the `backend/` directory
- Check that the database file isn't locked by another process

### CORS Errors

If you see CORS errors in the browser:
- Verify `FRONTEND_URL=http://localhost:3000` in `backend/.env`
- Make sure the backend is running on port 8080
- Check browser console for specific error messages

### Module Not Found Errors

If you get import errors:
```bash
# Backend
cd backend
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### Next.js Build Errors

If Next.js fails to build:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run dev
```

## Optional: Push Notifications Setup

If you want to test push notifications locally:

1. Generate VAPID keys:
```bash
npx web-push generate-vapid-keys
```

2. Add the public key to `frontend/.env.local`:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public-key-here>
```

3. Add both keys to `backend/.env`:
```env
VAPID_PUBLIC_KEY=<public-key-here>
VAPID_PRIVATE_KEY=<private-key-here>
VAPID_EMAIL=your@email.com
```

## Next Steps

Once both services are running:

1. Open http://localhost:3000
2. Register a new account
3. Link your FPL team ID (optional)
4. Explore the dashboard!

For more details, see:
- [Development Guide](docs/DEVELOPMENT.md)
- [API Documentation](http://localhost:8080/docs) (when backend is running)


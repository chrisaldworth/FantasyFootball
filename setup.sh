#!/bin/bash

# Fantasy Football Local Setup Script
# This script helps set up the development environment

set -e  # Exit on error

echo "🚀 Fantasy Football Local Setup"
echo "================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check prerequisites
echo "📋 Checking prerequisites..."
echo ""

# Check Python
if command -v python3 &> /dev/null; then
    PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
    echo "✅ Python found: $PYTHON_VERSION"
    
    # Check if version is 3.11+
    PYTHON_MAJOR=$(echo $PYTHON_VERSION | cut -d'.' -f1)
    PYTHON_MINOR=$(echo $PYTHON_VERSION | cut -d'.' -f2)
    
    if [ "$PYTHON_MAJOR" -lt 3 ] || ([ "$PYTHON_MAJOR" -eq 3 ] && [ "$PYTHON_MINOR" -lt 11 ]); then
        echo -e "${YELLOW}⚠️  Python 3.11+ required. You have $PYTHON_VERSION${NC}"
        echo "   Install with: brew install python@3.11"
        echo "   Or use pyenv: pyenv install 3.11.9"
    fi
else
    echo -e "${RED}❌ Python 3 not found${NC}"
    echo "   Install with: brew install python@3.11"
    exit 1
fi

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js found: $NODE_VERSION"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    echo "   Install with: brew install node"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm --version)
    echo "✅ npm found: $NPM_VERSION"
else
    echo -e "${RED}❌ npm not found${NC}"
    echo "   Install Node.js (npm comes with it): brew install node"
    exit 1
fi

echo ""
echo "📦 Setting up backend..."
echo ""

# Backend setup
cd backend

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    echo -e "${GREEN}✅ Virtual environment created${NC}"
else
    echo "Virtual environment already exists"
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "Installing Python dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Create .env if it doesn't exist
if [ ! -f ".env" ]; then
    echo "Creating .env file..."
    cat > .env << EOF
# Database (SQLite for local dev)
DATABASE_URL=sqlite:///./fpl_companion.db

# JWT Secret (change in production!)
SECRET_KEY=dev-secret-key-change-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Debug mode
DEBUG=True

# Optional: Push Notifications
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=admin@fplassistant.com

# Optional: FPL Encryption Key
FPL_ENCRYPTION_KEY=

# Optional: Football API Keys
API_FOOTBALL_KEY=
FOOTBALL_DATA_KEY=
EOF
    echo -e "${GREEN}✅ .env file created${NC}"
else
    echo ".env file already exists"
fi

cd ..

echo ""
echo "📦 Setting up frontend..."
echo ""

# Frontend setup
cd frontend

# Install dependencies
if [ ! -d "node_modules" ]; then
    echo "Installing Node.js dependencies..."
    npm install
    echo -e "${GREEN}✅ Frontend dependencies installed${NC}"
else
    echo "Node modules already exist (run 'npm install' to update)"
fi

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local file..."
    cat > .env.local << EOF
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8080

# Optional: VAPID Public Key (for push notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=
EOF
    echo -e "${GREEN}✅ .env.local file created${NC}"
else
    echo ".env.local file already exists"
fi

cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "To run the application:"
echo ""
echo "Terminal 1 - Backend:"
echo "  cd backend"
echo "  source venv/bin/activate"
echo "  uvicorn app.main:app --reload --port 8080"
echo ""
echo "Terminal 2 - Frontend:"
echo "  cd frontend"
echo "  npm run dev"
echo ""
echo "Then open http://localhost:3000 in your browser"
echo ""
echo "For more details, see SETUP.md"











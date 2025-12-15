# FPL Assistant

An AI-powered Fantasy Premier League companion application with real-time notifications, squad analysis, and transfer recommendations.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL (or SQLite for development)

> **📖 For detailed setup instructions, see [SETUP.md](SETUP.md)**  
> **⚡ Or run the automated setup script: `./setup.sh`**

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

## 📁 Project Structure

```
FantasyFootball/
├── frontend/                 # Next.js React application
│   ├── src/
│   │   ├── app/             # Next.js App Router pages
│   │   ├── components/      # React components
│   │   ├── lib/             # Utilities, API clients
│   │   └── hooks/           # Custom React hooks
│   ├── public/              # Static assets, service worker
│   ├── android/             # Capacitor Android project
│   ├── ios/                 # Capacitor iOS project
│   └── assets/              # App icons, splash screens
│
├── backend/                  # FastAPI Python backend
│   ├── app/
│   │   ├── api/             # API route handlers
│   │   ├── core/            # Config, security, database
│   │   ├── models/          # SQLModel database models
│   │   └── services/        # Business logic, FPL API client
│   └── requirements.txt
│
└── docs/                     # Project documentation
```

## ✅ Features Implemented

### Core Features
- [x] User authentication (register, login, JWT tokens)
- [x] FPL team linking via Team ID
- [x] Visual pitch view with player photos
- [x] Live gameweek data with player status
- [x] Player stats modal with detailed metrics

### Analysis Tools
- [x] **Squad Form Analysis** - Last 5 gameweeks performance with graphs
- [x] **Transfer Assistant** - AI recommendations for transfers
- [x] **Captain Pick** - Optimal captain based on form, fixtures, history

### Leagues
- [x] View all your FPL leagues (Classic & H2H)
- [x] League standings with live rankings
- [x] View any manager's team from standings

### Notifications
- [x] Browser push notifications (desktop)
- [x] In-app toast notifications (iOS/mobile)
- [x] Goal, assist, card, substitution alerts
- [x] Backend notification worker for background alerts

### Mobile
- [x] Fully responsive design
- [x] Capacitor setup for native iOS/Android apps
- [x] Touch-optimized UI

## 🔧 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 16, React 19, Tailwind CSS 4 |
| Backend | FastAPI, Python 3.11, SQLModel |
| Database | PostgreSQL (production), SQLite (development) |
| Auth | JWT tokens, bcrypt password hashing |
| Mobile | Capacitor (iOS/Android native wrapper) |
| Deployment | Vercel (frontend), Render (backend), Neon (database) |

## 📖 Documentation

- **[Quick Start Guide](QUICK_START.md)** - Get running in 5 minutes
- **[Local Setup Guide](SETUP.md)** - Detailed setup instructions
- [Development Guide](docs/DEVELOPMENT.md)
- [API Reference](docs/API.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:pass@host:5432/db
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:3000
VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=your@email.com
```

## 📱 Mobile App Build

```bash
cd frontend

# Build and sync
npm run mobile:build

# Open in Android Studio
npm run android:build

# Open in Xcode (macOS only)
npm run ios:build
```

## 🚀 Deployment

### Frontend (Vercel)
1. Connect GitHub repo to Vercel
2. Set Root Directory to `frontend`
3. Add environment variables
4. Deploy

### Backend (Render)
1. Create new Web Service
2. Set Root Directory to `backend`
3. Build Command: `pip install -r requirements.txt`
4. Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables

### Database (Neon)
1. Create PostgreSQL database
2. Copy connection string to backend `DATABASE_URL`

## 📄 License

MIT License - see LICENSE file for details.

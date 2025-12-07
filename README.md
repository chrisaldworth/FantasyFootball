# FPL Companion

AI-powered Fantasy Premier League companion platform with transfer recommendations, captaincy picks, and team analysis.

## Tech Stack

- **Frontend:** Next.js 15, Tailwind CSS, TypeScript
- **Backend:** FastAPI (Python), SQLModel
- **Database:** SQLite (dev) / PostgreSQL (production)
- **Cache:** Redis (optional)

## Getting Started

### Prerequisites

- Node.js 18+
- Python 3.9+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from .env.example)
cp .env.example .env

# Run the server
uvicorn app.main:app --reload --port 8000
```

The API will be available at `http://localhost:8000`
- API Docs: `http://localhost:8000/docs`
- Health Check: `http://localhost:8000/health`

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev
```

The app will be available at `http://localhost:3000`

## Project Structure

```
FantasyFootball/
├── backend/
│   ├── app/
│   │   ├── api/           # API routes (auth, fpl)
│   │   ├── core/          # Config, database, security
│   │   ├── models/        # SQLModel database models
│   │   ├── schemas/       # Pydantic schemas
│   │   ├── services/      # Business logic (FPL API)
│   │   └── main.py        # FastAPI app entry
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── app/           # Next.js pages
│   │   └── lib/           # Utilities, API client, auth
│   └── package.json
└── docs/                  # Project documentation
```

## Features

### Current (MVP)
- ✅ User registration & login
- ✅ FPL Team ID linking
- ✅ Team overview dashboard
- ✅ Gameweek history view

### Coming Soon
- 🔜 AI Transfer Assistant
- 🔜 Captaincy Optimizer
- 🔜 Team Rating Tool
- 🔜 Fixture Difficulty Planner
- 🔜 Price Change Alerts
- 🔜 Mini-League Analysis

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Get access token
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/me/fpl-team` - Update FPL Team ID

### FPL Data
- `GET /api/fpl/bootstrap` - All static FPL data
- `GET /api/fpl/fixtures` - All fixtures
- `GET /api/fpl/live/{gw}` - Live gameweek scores
- `GET /api/fpl/player/{id}` - Player details
- `GET /api/fpl/team/{id}` - Team info
- `GET /api/fpl/team/{id}/picks/{gw}` - Team picks
- `GET /api/fpl/my-team` - Current user's team (auth required)

## Environment Variables

### Backend (.env)
```
DEBUG=True
DATABASE_URL=sqlite:///./fpl_companion.db
SECRET_KEY=your-secret-key
FRONTEND_URL=http://localhost:3000
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## License

MIT


# Development Setup Guide

Complete guide for setting up the FPL Assistant development environment.

## Prerequisites

### Required Software
- **Node.js** 18+ (recommend using nvm)
- **Python** 3.11+
- **Git**

### Optional (for mobile development)
- **Xcode** (macOS only, for iOS)
- **Android Studio** (for Android)
- **CocoaPods** (for iOS dependencies)

---

## Backend Setup

### 1. Navigate to Backend Directory
```bash
cd backend
```

### 2. Create Virtual Environment
```bash
python -m venv venv
```

### 3. Activate Virtual Environment
```bash
# macOS/Linux
source venv/bin/activate

# Windows
venv\Scripts\activate
```

### 4. Install Dependencies
```bash
pip install -r requirements.txt
```

### 5. Create Environment File
Create `backend/.env`:
```env
# Database (SQLite for local dev)
DATABASE_URL=sqlite:///./fpl_companion.db

# For PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost:5432/fpl_companion

# JWT Secret (generate a secure random string)
SECRET_KEY=your-secret-key-change-in-production

# Frontend URL for CORS
FRONTEND_URL=http://localhost:3000

# Push Notifications (optional - generate with: npx web-push generate-vapid-keys)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=your@email.com
```

### 6. Run the Backend
```bash
uvicorn app.main:app --reload --port 8080
```

The API will be available at `http://localhost:8080`
- API Docs: `http://localhost:8080/docs`
- Health Check: `http://localhost:8080/health`

---

## Frontend Setup

### 1. Navigate to Frontend Directory
```bash
cd frontend
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Create Environment File
Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key_here
```

### 4. Run the Frontend
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

---

## Database Setup

### SQLite (Default for Development)
No setup required - database file is created automatically at `backend/fpl_companion.db`

### PostgreSQL (Production)
1. Install PostgreSQL
2. Create database:
```sql
CREATE DATABASE fpl_companion;
CREATE USER fpl_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE fpl_companion TO fpl_user;
```
3. Update `DATABASE_URL` in `.env`

---

## Running Both Services

### Terminal 1 - Backend
```bash
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8080
```

### Terminal 2 - Frontend
```bash
cd frontend
npm run dev
```

---

## Mobile Development

### Capacitor Setup (Already configured)

The project includes Capacitor for building native iOS and Android apps.

### Building for Mobile
```bash
cd frontend

# Build Next.js and sync to native projects
npm run mobile:build

# Open Android Studio
npm run android:build

# Open Xcode (macOS only)
npm run ios:build
```

### iOS-Specific Setup (macOS only)
```bash
# Install Xcode from App Store, then:
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
sudo xcodebuild -license accept
sudo gem install cocoapods

# Install iOS dependencies
cd frontend/ios/App
pod install
```

### Android-Specific Setup
1. Install Android Studio
2. Install Android SDK via Android Studio
3. Set `ANDROID_HOME` environment variable

---

## Push Notifications Setup

### Generate VAPID Keys
```bash
npx web-push generate-vapid-keys
```

Output example:
```
Public Key: BEl62iUYgUivxIkv69yViEuiBIa-Ib9-SkvMeAtA3LFgDzkrxZJjSgSnfckjBJuBkr3qBUYIHBQFLXYp5Nksh8U
Private Key: UUxI4O8-FbRouADVXc-hK3ltm22Wd0kJV8_o4rI8VhU
```

### Add to Environment
- Add **Public Key** to both frontend and backend `.env`
- Add **Private Key** to backend `.env` only

### Run Notification Worker
```bash
cd backend
source venv/bin/activate
python -m app.services.notification_worker
```

---

## Common Issues

### Port Already in Use
```bash
# Find process using port 8080
lsof -i :8080

# Kill it
kill -9 <PID>
```

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL format
- For SQLite, ensure write permissions to backend directory

### CORS Errors
- Verify `FRONTEND_URL` in backend `.env` matches actual frontend URL
- Check browser console for specific CORS error

### bcrypt/passlib Issues
The project uses bcrypt directly (not passlib) to avoid version conflicts.

---

## Testing

### Backend
```bash
cd backend
pytest
```

### Frontend
```bash
cd frontend
npm run lint
npm run build  # Type checking
```

---

## Code Structure

### Frontend Key Files
| File | Purpose |
|------|---------|
| `src/app/dashboard/page.tsx` | Main dashboard with all features |
| `src/components/TeamPitch.tsx` | Visual pitch display |
| `src/components/TransferAssistantModal.tsx` | Transfer recommendations |
| `src/components/CaptainPickModal.tsx` | Captain analysis |
| `src/components/SquadFormModal.tsx` | Form analysis |
| `src/components/LeagueModal.tsx` | League standings |
| `src/lib/api.ts` | API client |
| `src/lib/auth-context.tsx` | Authentication context |
| `src/lib/notifications.ts` | Notification logic |

### Backend Key Files
| File | Purpose |
|------|---------|
| `app/main.py` | FastAPI application entry |
| `app/api/auth.py` | Authentication endpoints |
| `app/api/fpl.py` | FPL data proxy endpoints |
| `app/api/notifications.py` | Push subscription endpoints |
| `app/services/fpl_service.py` | FPL API client |
| `app/services/notification_worker.py` | Background notification worker |
| `app/models/user.py` | User database model |
| `app/models/push_subscription.py` | Push subscription model |
| `app/core/security.py` | JWT and password hashing |
| `app/core/database.py` | Database connection |
| `app/core/config.py` | Configuration settings |


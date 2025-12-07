# Push Notification Setup Guide

This guide covers setting up fully automated push notifications for FPL Assistant.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AUTOMATED NOTIFICATION FLOW                      │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌──────────────────┐    Every 2 min during matches                     │
│  │  GitHub Actions  │────────────────────────────────────┐              │
│  │  (Free Cron)     │                                    │              │
│  └──────────────────┘                                    ▼              │
│                                               ┌──────────────────────┐  │
│                                               │  Render API Server   │  │
│                                               │  /api/notifications  │  │
│                                               │       /check         │  │
│                                               └──────────┬───────────┘  │
│                                                          │              │
│         Fetches live data         ┌──────────────────────┼──────────┐   │
│  ┌────────────────────────────────│    FPL API           │          │   │
│  │                                └──────────────────────┼──────────┘   │
│  ▼                                                       │              │
│  ┌────────────────────┐      Detects changes &           │              │
│  │  Live Match Stats  │──────sends push                  ▼              │
│  │  (goals, assists,  │              ┌───────────────────────────────┐  │
│  │   cards, etc.)     │              │  Push Notification Service    │  │
│  └────────────────────┘              │  (webpush + VAPID)            │  │
│                                      └───────────────┬───────────────┘  │
│                                                      │                  │
│                                                      ▼                  │
│                                      ┌───────────────────────────────┐  │
│                                      │  User's Browser/Device        │  │
│                                      │  🔔 Goal! Salah scored!       │  │
│                                      └───────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Cost: $0 (Free Tier Only)

- **Render API**: Free tier (750 hours/month)
- **GitHub Actions**: Free (2,000 minutes/month)
- **Neon PostgreSQL**: Free tier (0.5GB)
- **Vercel Frontend**: Free tier

## Step-by-Step Setup

### 1. Generate VAPID Keys

Run this command locally:

```bash
npx web-push generate-vapid-keys --json
```

Output:
```json
{
  "publicKey": "BLOdvkD6Us8gCZcUu5OwGqNGLYbia2Ky7neAckq17g1aBL_64VLvQxXgOZSyW0lSrrwAjADjiTBiwjL-w1VnVYw",
  "privateKey": "xtz4VHJ7v5kZn4tlXQtvvIGDzNwbQ_IaGIWViLZRwXA"
}
```

**Save these keys - you'll need them for both Render and Vercel!**

### 2. Configure Render Backend

In your Render dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Your Neon PostgreSQL connection string |
| `SECRET_KEY` | A random secure string |
| `FRONTEND_URL` | `https://your-app.vercel.app` |
| `VAPID_PUBLIC_KEY` | The public key from step 1 |
| `VAPID_PRIVATE_KEY` | The private key from step 1 |
| `VAPID_EMAIL` | Your email (e.g., `admin@example.com`) |

### 3. Configure Vercel Frontend

In your Vercel dashboard, add these environment variables:

| Variable | Value |
|----------|-------|
| `NEXT_PUBLIC_API_URL` | `https://your-api.onrender.com` |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | The public key from step 1 (same as Render) |

### 4. Configure GitHub Actions Secret

In your GitHub repository:

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add:
   - **Name**: `API_URL`
   - **Value**: `https://your-api.onrender.com`

### 5. Deploy Changes

Push your changes to GitHub:

```bash
git add -A
git commit -m "Add automated push notifications"
git push origin main
```

### 6. Test Notifications

1. Visit your deployed app
2. Log in and connect your FPL team
3. Click "Enable" on the notification banner
4. Wait for a live match with your players

**Manual Test**: Go to GitHub Actions tab → Select "FPL Notification Check" → Click "Run workflow"

## How It Works

### Automated Cron Schedule

The GitHub Actions workflow runs:
- **Saturdays & Sundays**: Every 2 minutes, 12:00-22:00 UTC
- **Weekdays**: Every 2 minutes, 18:00-22:00 UTC (for midweek fixtures)

This covers all typical Premier League match times.

### Detection Logic

The system detects changes by comparing current stats to previous stats:

```python
# Example: Goal detection
if current['goals'] > previous.get('goals', 0):
    send_notification(f"⚽ GOAL! {player_name} scored!")
```

### Notification Types

| Event | Emoji | Example |
|-------|-------|---------|
| Goal | ⚽ | "GOAL! Salah scored for LIV!" |
| Assist | 🅰️ | "ASSIST! Trent assist for LIV!" |
| Yellow Card | 🟨 | "Yellow: Casemiro booked" |
| Red Card | 🟥 | "RED! Bruno sent off!" |
| Substitution | 🔄 | "Sub: Rashford off at 73'" |

## Troubleshooting

### Notifications Not Appearing

1. **Check browser permissions**: Ensure notifications are allowed for your site
2. **Check service worker**: Open DevTools → Application → Service Workers
3. **Check subscription**: Open DevTools → Console, look for "Push subscription created"

### GitHub Actions Not Running

1. Go to GitHub → Actions tab
2. Check if the workflow is enabled
3. Click "Run workflow" to test manually

### API Errors

Check Render logs:
```
Render Dashboard → Your Service → Logs
```

Look for:
- `[timestamp] Checking X subscriptions for GWY`
- `[timestamp] Sent: ⚽ GOAL! Player name`

## Local Development

For local testing:

1. Create `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=http://localhost:8080
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your-public-key
```

2. Create `backend/.env`:
```
DATABASE_URL=sqlite:///./fpl_companion.db
SECRET_KEY=dev-secret
FRONTEND_URL=http://localhost:3000
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
VAPID_EMAIL=dev@example.com
```

3. Start both servers:
```bash
# Terminal 1 - Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8080

# Terminal 2 - Frontend
cd frontend && npm run dev
```

4. Manual trigger during a live match:
```bash
curl http://localhost:8080/api/notifications/check
```


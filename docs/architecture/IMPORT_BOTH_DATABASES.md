# Import to Both Local and Cloud Databases

## Quick Guide

This guide shows you how to import match data to both your local and cloud databases.

---

## Method 1: Import Local First, Then Cloud via API

### Step 1: Import to Local Database

```bash
cd backend
source venv/bin/activate
python scripts/import_match_data.py --season 2025-2026 --data-dir data
```

### Step 2: Import to Cloud Database via API

**Option A: Using the Python script**

```bash
cd backend
source venv/bin/activate
python scripts/import_cloud.py \
  --email YOUR_ADMIN_EMAIL \
  --password YOUR_ADMIN_PASSWORD \
  --season 2025-2026
```

**Option B: Using curl**

```bash
# 1. Get admin token
TOKEN=$(curl -X POST 'https://fpl-companion-api.onrender.com/api/auth/login' \
  -H 'Content-Type: application/x-www-form-urlencoded' \
  -d 'username=YOUR_ADMIN_EMAIL&password=YOUR_ADMIN_PASSWORD' \
  | jq -r '.access_token')

# 2. Trigger import
curl -X POST "https://fpl-companion-api.onrender.com/api/admin/import-match-data?season=2025-2026" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Method 2: Import to Specific Database URL

Use the `import_with_db_url.py` script to import to any database:

### Local Database

```bash
cd backend
source venv/bin/activate
python scripts/import_with_db_url.py --season 2025-2026 --data-dir data
```

(Will use DATABASE_URL from .env file)

### Cloud Database

```bash
cd backend
source venv/bin/activate
python scripts/import_with_db_url.py \
  --season 2025-2026 \
  --data-dir data \
  --db-url "postgresql://user:password@host:port/database"
```

---

## Method 3: Automated Script (Both in One Go)

I've created `import_both.sh` that will:
1. Import to local database
2. Provide instructions for cloud import

```bash
cd backend
chmod +x scripts/import_both.sh
./scripts/import_both.sh
```

---

## What Each Method Does

### Local Import
- Uses `DATABASE_URL` from your `.env` file
- Imports directly to your local PostgreSQL/SQLite database
- Shows real-time progress

### Cloud Import (API)
- Authenticates as admin user
- Triggers import on Render server
- Runs in background for large imports
- Check Render logs for progress

### Cloud Import (Direct)
- Connects directly to cloud database
- Requires database URL with credentials
- Runs locally but writes to cloud

---

## Verification

After importing, verify the data:

### Local
```bash
# Connect to your local database and check
psql your_database -c "SELECT COUNT(*) FROM matches WHERE season='2025-2026';"
```

### Cloud
```bash
# Via API
curl "https://fpl-companion-api.onrender.com/api/match-data/matches?season=2025-2026&limit=1"
```

Or visit: `https://your-frontend.vercel.app/match-data-test`

---

## Troubleshooting

### Local Import Fails
- Check `.env` has correct `DATABASE_URL`
- Verify database is running
- Check virtual environment is activated

### Cloud Import Fails (API)
- Verify admin credentials are correct
- Check Render service is running
- Verify data files are in Git repository (for Render to access)

### Cloud Import Fails (Direct)
- Verify database URL is correct
- Check network connectivity
- Verify SSL settings for cloud database

---

## Recommended Approach

**For first-time setup:**
1. Import to local first (faster, easier to debug)
2. Verify data looks correct
3. Then import to cloud via API

**For ongoing updates:**
- Use API method (no need to manage database URLs)
- Or use direct method if you prefer

---

**Ready to import!** Choose the method that works best for you.



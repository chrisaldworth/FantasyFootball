# Cloud Data Import Guide

## Overview

This guide explains how to import match data into the database on your cloud deployment (Render).

## Two Methods

### Method 1: API Endpoint (Recommended for Cloud)

Use the admin API endpoint to trigger the import remotely.

### Method 2: SSH/Console (If Available)

Run the import script directly on the server.

---

## Method 1: API Endpoint Import

### Prerequisites

1. **Admin Access**: You must be logged in as an admin user
2. **Data Files**: JSON files must be accessible to the server
3. **Database**: Database connection must be configured

### Step 1: Upload Data Files to Cloud

**Option A: Include in Git Repository**
- Commit JSON files to repository
- Push to GitHub
- Render will deploy with files

**Option B: Upload via API/Storage**
- Upload files to cloud storage
- Or use file upload endpoint (if implemented)

### Step 2: Trigger Import via API

**Using curl:**
```bash
# Get your auth token first (login via API)
TOKEN="your_jwt_token_here"

# Trigger import
curl -X POST "https://fpl-companion-api.onrender.com/api/admin/import-match-data?season=2025-2026" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json"
```

**Using Python:**
```python
import requests

# Login first
login_response = requests.post(
    "https://fpl-companion-api.onrender.com/api/auth/login",
    data={"username": "admin@example.com", "password": "password"}
)
token = login_response.json()["access_token"]

# Trigger import
import_response = requests.post(
    "https://fpl-companion-api.onrender.com/api/admin/import-match-data",
    params={"season": "2025-2026"},
    headers={"Authorization": f"Bearer {token}"}
)
print(import_response.json())
```

**Using Browser (if you have admin UI):**
- Navigate to admin panel
- Go to Data Import section
- Select season and click "Import"

### Step 3: Monitor Progress

Check Render logs to see import progress:
1. Go to Render Dashboard → Your Service → Logs
2. Watch for import progress messages

---

## Method 2: Direct Script Execution

### Step 1: Access Server Console

**Render:**
1. Go to Render Dashboard → Your Service
2. Click "Shell" tab (if available)
3. Or use SSH if configured

### Step 2: Navigate to Backend Directory

```bash
cd backend
```

### Step 3: Run Import Script

```bash
# Make sure you're in the backend directory
python scripts/import_match_data.py --season 2025-2026 --data-dir data
```

### Step 4: Monitor Output

Watch the console for:
- Progress updates
- Import status
- Any errors

---

## Cloud-Specific Considerations

### Data File Location

On Render, files in your repository are available at:
- Repository root: `/opt/render/project/src/`
- Backend directory: `/opt/render/project/src/backend/`
- Data files: `/opt/render/project/src/backend/data/`

### Environment Variables

Make sure these are set in Render:
- `DATABASE_URL` - PostgreSQL connection string
- `PL_DATABASE_URL` - (Optional) Separate PL database URL

### File System Limitations

**Render Free Tier:**
- Ephemeral file system (files reset on deploy)
- Must include data files in Git repository
- Or use external storage (S3, etc.)

**Render Paid Tier:**
- Persistent volumes available
- Can store data files separately

---

## Recommended Approach for Cloud

### For Initial Import (One-Time)

1. **Include data files in Git** (for 2025-2026 season)
2. **Push to GitHub**
3. **Render auto-deploys**
4. **Trigger import via API** after deployment

### For Ongoing Updates

1. **Scrape new matches locally**
2. **Commit JSON files to Git**
3. **Push to GitHub**
4. **Render auto-deploys**
5. **Trigger import via API**

Or set up automated scraping on cloud (separate worker service).

---

## API Endpoint Details

### POST `/api/admin/import-match-data`

**Parameters:**
- `season` (query, required): Season identifier (e.g., "2025-2026")
- `data_dir` (query, optional): Path to data directory (defaults to "data")

**Authentication:**
- Requires admin user (JWT token)

**Response:**
```json
{
  "status": "completed",
  "message": "Import completed",
  "season": "2025-2026",
  "matches_imported": 122,
  "errors": []
}
```

**For Large Imports:**
- Runs in background if > 10 matches
- Returns immediately with status "started"
- Check logs for progress

---

## Troubleshooting

### "Data directory not found"
- Check that data files are in repository
- Verify path is correct
- Check Render file system structure

### "Permission denied"
- Verify you're logged in as admin
- Check admin role in database

### "Database connection error"
- Verify `DATABASE_URL` is set correctly
- Check database is accessible from Render
- Verify SSL settings

### Import takes too long
- Large imports run in background
- Check Render logs for progress
- Consider splitting into smaller batches

---

## Quick Start (Cloud)

1. **Ensure data files are in Git:**
   ```bash
   git add backend/data/2025-2026/
   git commit -m "Add 2025-2026 match data"
   git push origin main
   ```

2. **Wait for Render to deploy** (auto-deploys on push)

3. **Trigger import via API:**
   ```bash
   # After getting admin token
   curl -X POST "https://fpl-companion-api.onrender.com/api/admin/import-match-data?season=2025-2026" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Check Render logs** for import progress

---

**Status**: Ready to use


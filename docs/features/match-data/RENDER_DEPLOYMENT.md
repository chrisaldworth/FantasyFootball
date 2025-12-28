# Deploying Match Updates to Render.com

This guide shows how to set up automated match data updates on Render.com.

---

## ✅ Yes, It Updates the Database!

The FPL API script **directly updates your PL database**:
- ✅ Creates new matches if they don't exist
- ✅ Updates existing matches with latest scores
- ✅ Updates match status (finished/live/scheduled)
- ✅ No JSON files needed - direct database updates

---

## Adding to Render.com

### Option 1: Using render.yaml (Recommended)

Add this to your `backend/render.yaml`:

```yaml
services:
  # ... your existing services ...

  # Automated Match Data Updates (FPL API)
  # Updates match data daily from Fantasy Premier League API
  - type: cron
    name: match-data-update
    runtime: python
    rootDir: backend
    schedule: "0 2 * * *"  # Daily at 2 AM UTC
    buildCommand: |
      pip install --upgrade pip setuptools wheel
      pip install --only-binary=all greenlet || pip install greenlet
      pip install -r requirements.txt
    startCommand: python3 scripts/update_matches_from_fpl_api.py --days 3
    envVars:
      - key: PL_DATABASE_URL
        sync: false  # Set manually in Render dashboard
      - key: DATABASE_URL
        fromDatabase:
          name: your-database
          property: connectionString
```

### Option 2: Manual Setup in Render Dashboard

1. **Go to Render Dashboard** → Your Service → Add Cron Job

2. **Configure Cron Job**:
   - **Name**: `match-data-update`
   - **Schedule**: `0 2 * * *` (Daily at 2 AM UTC)
   - **Command**: `python3 scripts/update_matches_from_fpl_api.py --days 3`
   - **Root Directory**: `backend`

3. **Set Environment Variables**:
   - `PL_DATABASE_URL` - Your PL match data database connection string
   - `DATABASE_URL` - Your main database (optional, for user data)

---

## Environment Variables

### Required

- **`PL_DATABASE_URL`**: Connection string for your PL match data database
  - Format: `postgresql://user:password@host:port/database`
  - This is where match data is stored

### Optional

- **`DATABASE_URL`**: Main database (for user data, etc.)
  - Only needed if you want to reference user data

---

## Schedule Options

### Daily Updates (Recommended)

```yaml
schedule: "0 2 * * *"  # Daily at 2 AM UTC
startCommand: python3 scripts/update_matches_from_fpl_api.py --days 3
```

### Twice Daily

```yaml
schedule: "0 2,14 * * *"  # 2 AM and 2 PM UTC
startCommand: python3 scripts/update_matches_from_fpl_api.py --days 1
```

### Every 6 Hours

```yaml
schedule: "0 */6 * * *"  # Every 6 hours
startCommand: python3 scripts/update_matches_from_fpl_api.py --days 1
```

### After Each Gameweek (Monday)

```yaml
schedule: "0 1 * * 1"  # Monday 1 AM UTC
startCommand: python3 scripts/update_matches_from_fpl_api.py --days 7
```

---

## Testing on Render

### Manual Test Run

1. **Go to Render Dashboard** → Your Cron Job
2. **Click "Manual Deploy"** or "Run Now"
3. **Check Logs** to see output

### Check Logs

```bash
# In Render Dashboard → Your Cron Job → Logs
# You should see:
# ✓ Found 20 teams
# ✓ Found 380 fixtures for season
# ✓ Filtered to 10 fixtures in last 3 days
# [1/10] ✓ Updated: Arsenal vs Liverpool (2024-12-26)
# ...
```

---

## Database Setup

### If Using Separate PL Database

1. **Create PostgreSQL Database** on Render (or use existing)
2. **Set `PL_DATABASE_URL`** environment variable
3. **Tables are created automatically** on first run

### If Using Same Database

Set `PL_DATABASE_URL` to same as `DATABASE_URL` (different schema/prefix can be used)

---

## Troubleshooting

### Cron Job Not Running

- **Check schedule format**: Use cron format (e.g., `0 2 * * *`)
- **Check timezone**: Render uses UTC
- **Check logs**: Look for errors in Render dashboard

### Database Connection Errors

- **Verify `PL_DATABASE_URL`**: Check connection string format
- **Check database exists**: Ensure database is created
- **Check permissions**: Database user needs write access

### No Matches Found

- **Check date range**: Increase `--days` value
- **Check season**: Verify season format (e.g., "2024-2025")
- **Check FPL API**: Verify FPL API is accessible

---

## Example render.yaml

```yaml
services:
  # Main API Service
  - type: web
    name: fpl-assistant-api
    # ... existing config ...

  # Automated Match Data Updates
  - type: cron
    name: match-data-update
    runtime: python
    rootDir: backend
    schedule: "0 2 * * *"  # Daily at 2 AM UTC
    buildCommand: |
      pip install --upgrade pip setuptools wheel
      pip install --only-binary=all greenlet || pip install greenlet
      pip install -r requirements.txt
    startCommand: python3 scripts/update_matches_from_fpl_api.py --days 3
    envVars:
      - key: PL_DATABASE_URL
        sync: false  # Set in Render dashboard
      - key: DATABASE_URL
        fromDatabase:
          name: your-database
          property: connectionString
```

---

## Cost Considerations

- **Render Cron Jobs**: Free tier allows limited cron jobs
- **Database**: Uses your existing database (no extra cost)
- **API Calls**: FPL API is free (no rate limits for reasonable use)

---

## Monitoring

### Check Update Status

1. **Render Dashboard** → Cron Job → Logs
2. **Database**: Query matches table to see latest updates
3. **API**: Check `/api/match-data/` endpoints

### Success Indicators

- ✅ Logs show "✓ Imported" or "✓ Updated" messages
- ✅ Database has recent match records
- ✅ Match scores are current

---

## Related Files

- **Script**: `backend/scripts/update_matches_from_fpl_api.py`
- **Render Config**: `backend/render.yaml`
- **FPL API Guide**: `docs/features/match-data/FPL_API_MATCH_UPDATES.md`

---

**Last Updated**: 2025-12-21


# Automated Match Data Updates

This document describes how to set up automatic updates for Premier League match data.

---

## Overview

The automated match update system supports **two methods**:

### Method 1: FPL API (Recommended) ⭐
- **Uses Fantasy Premier League official API**
- **Faster** - No web scraping needed
- **More reliable** - No Cloudflare blocking
- **Real-time data** - Updates immediately after matches
- **Free** - No API key required
- **Limitations**: Basic match data (scores, teams, dates) - no detailed stats/lineups

### Method 2: fbref.com Scraper (Fallback)
- **Scrapes from fbref.com** for detailed match data
- **Comprehensive** - Includes lineups, player stats, events, etc.
- **Slower** - Web scraping takes time
- **Can be blocked** - Cloudflare protection
- **Use when**: You need detailed match statistics

The system:
1. **Updates recent matches** (last N days or specific gameweek)
2. **Imports/updates matches** in the database automatically
3. **Can be scheduled** to run regularly (daily, hourly, etc.)

---

## Quick Start

### Manual Run

#### Using FPL API (Recommended) ⭐

```bash
# Update matches from last 7 days using FPL API (default)
./backend/scripts/auto_update_matches.sh

# Update matches from last 3 days
./backend/scripts/auto_update_matches.sh --days 3

# Update specific gameweek
./backend/scripts/update_matches_from_fpl_api.sh --gameweek 19

# Update for specific season
./backend/scripts/update_matches_from_fpl_api.sh --season 2024-2025 --days 7
```

#### Using fbref.com Scraper (Fallback)

```bash
# Use scraper instead of FPL API
./backend/scripts/auto_update_matches.sh --use-scraper --days 7

# Only import existing JSON files (don't scrape)
./backend/scripts/auto_update_matches.sh --import-only
```

### Python Script Directly

```bash
cd backend
python3 scripts/auto_update_matches.py --days 7 --season 2024-2025
```

---

## Scheduling Options

### Option 1: Cron (Linux/macOS)

Add to crontab (`crontab -e`):

```bash
# Run daily at 2 AM using FPL API (recommended)
0 2 * * * /path/to/FantasyFootball/backend/scripts/auto_update_matches.sh --days 3

# Run every 6 hours using FPL API
0 */6 * * * /path/to/FantasyFootball/backend/scripts/update_matches_from_fpl_api.sh --days 1

# Run twice daily (2 AM and 2 PM) using FPL API
0 2,14 * * * /path/to/FantasyFootball/backend/scripts/auto_update_matches.sh --days 2

# Use scraper instead (fallback)
0 2 * * * /path/to/FantasyFootball/backend/scripts/auto_update_matches.sh --use-scraper --days 3
```

### Option 2: Systemd Timer (Linux)

Create `/etc/systemd/system/match-update.service`:

```ini
[Unit]
Description=Update Premier League Match Data
After=network.target

[Service]
Type=oneshot
User=your-user
WorkingDirectory=/path/to/FantasyFootball
ExecStart=/path/to/FantasyFootball/backend/scripts/auto_update_matches.sh --days 3
```

Create `/etc/systemd/system/match-update.timer`:

```ini
[Unit]
Description=Run match update daily
Requires=match-update.service

[Timer]
OnCalendar=daily
OnCalendar=02:00
Persistent=true

[Install]
WantedBy=timers.target
```

Enable and start:

```bash
sudo systemctl enable match-update.timer
sudo systemctl start match-update.timer
sudo systemctl status match-update.timer
```

### Option 3: Render.com Cron Job

Add to `render.yaml`:

```yaml
services:
  - type: cron
    name: match-update
    runtime: python
    rootDir: backend
    schedule: "0 2 * * *"  # Daily at 2 AM UTC
    buildCommand: pip install -r requirements.txt
    startCommand: python3 scripts/auto_update_matches.py --days 3
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: your-database
          property: connectionString
      - key: PL_DATABASE_URL
        fromDatabase:
          name: your-pl-database
          property: connectionString
```

### Option 4: GitHub Actions (for cloud deployments)

Create `.github/workflows/update-matches.yml`:

```yaml
name: Update Match Data

on:
  schedule:
    - cron: '0 2 * * *'  # Daily at 2 AM UTC
  workflow_dispatch:  # Allow manual trigger

jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      
      - name: Update matches
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
          PL_DATABASE_URL: ${{ secrets.PL_DATABASE_URL }}
        run: |
          cd backend
          python3 scripts/auto_update_matches.py --days 3
```

---

## Options

### `--days DAYS`
Number of days back to scrape (default: 7)

```bash
# Last 3 days
--days 3

# Last 14 days
--days 14
```

### `--season SEASON`
Season to scrape (default: current season)

```bash
# Specific season
--season 2024-2025

# Current season (default)
# (automatically determined)
```

### `--import-only`
Only import existing JSON files, don't scrape new ones

```bash
# Useful if you've already scraped manually
./auto_update_matches.sh --import-only
```

### `--no-headless`
Run browser in visible mode (for debugging)

```bash
# See browser window
./auto_update_matches.sh --no-headless
```

### `--data-dir PATH`
Custom data directory path

```bash
# Use custom data directory
./auto_update_matches.sh --data-dir /custom/path/data
```

---

## How It Works

### FPL API Method (Default)

1. **Fetch Phase**:
   - Connects to Fantasy Premier League API
   - Fetches all fixtures for season (or specific gameweek)
   - Filters by date range if specified
   - Gets team information from bootstrap data

2. **Update Phase**:
   - Converts FPL fixture format to match data format
   - Checks if match already exists in database
   - Creates new matches or updates existing ones
   - Updates scores, status, and basic match info
   - **Directly updates database** (no JSON files needed)

3. **Error Handling**:
   - Continues even if some matches fail
   - Logs errors for review
   - Returns exit code 0 on success, 1 on failure

### fbref.com Scraper Method (Fallback)

1. **Scraping Phase**:
   - Determines date range (today - N days)
   - Runs fbref scraper for the season
   - Saves matches as JSON files in `backend/data/{season}/matches/`

2. **Import Phase**:
   - Finds all match JSON files in date range
   - Imports each match into PL database
   - Skips matches that already exist
   - Updates match data if needed

3. **Error Handling**:
   - Continues even if some matches fail
   - Logs errors for review
   - Returns exit code 0 on success, 1 on failure

---

## Monitoring

### Check Last Update

```bash
# Check latest match files
ls -lt backend/data/2024-2025/matches/ | head -10

# Check database for recent matches
# (Use your database client)
```

### Logs

The script outputs progress to stdout/stderr. For cron jobs, redirect to log file:

```bash
# In crontab
0 2 * * * /path/to/auto_update_matches.sh --days 3 >> /var/log/match-update.log 2>&1
```

### Email Notifications (Optional)

Add email notification on failure:

```bash
# In crontab
0 2 * * * /path/to/auto_update_matches.sh --days 3 || echo "Match update failed" | mail -s "Match Update Failed" admin@example.com
```

---

## Troubleshooting

### Scraper Fails

- **Cloudflare blocking**: Try `--no-headless` or wait and retry
- **Network issues**: Check internet connection
- **Missing dependencies**: Run `pip install -r requirements.txt`

### Import Fails

- **Database connection**: Check `PL_DATABASE_URL` environment variable
- **Missing tables**: Run database migrations
- **Permission issues**: Check database user permissions

### No Matches Found

- **Date range too narrow**: Increase `--days` value
- **Season incorrect**: Check season format (e.g., "2024-2025")
- **Matches not played yet**: Some dates may not have matches

---

## Best Practices

1. **Run Daily**: Update matches once per day (e.g., 2 AM)
2. **Small Date Range**: Use `--days 3` to avoid scraping too much
3. **Monitor Logs**: Check logs regularly for errors
4. **Backup Database**: Backup before major updates
5. **Test First**: Test with `--days 1` before scheduling

---

## Example Workflows

### Daily Updates (Recommended)

```bash
# Cron: Daily at 2 AM, last 3 days
0 2 * * * /path/to/auto_update_matches.sh --days 3
```

### Hourly Updates (During Match Days)

```bash
# Cron: Every hour on match days (Saturday/Sunday)
0 * * * 0,6 /path/to/auto_update_matches.sh --days 1
```

### Weekly Full Update

```bash
# Cron: Weekly on Monday, last 7 days
0 3 * * 1 /path/to/auto_update_matches.sh --days 7
```

---

## FPL API vs fbref.com Scraper

### FPL API Advantages ⭐
- ✅ **Fast** - API calls are instant
- ✅ **Reliable** - No Cloudflare blocking
- ✅ **Real-time** - Updates immediately after matches
- ✅ **Free** - No API key required
- ✅ **Official** - Data from Premier League's fantasy game
- ✅ **Simple** - No browser automation needed

### FPL API Limitations
- ❌ **Basic data only** - Scores, teams, dates, status
- ❌ **No detailed stats** - No player stats, lineups, events
- ❌ **No venue/referee** - Limited match metadata

### fbref.com Scraper Advantages
- ✅ **Comprehensive** - Full match details
- ✅ **Player stats** - Individual player performance
- ✅ **Lineups** - Starting XI and substitutes
- ✅ **Events** - Goals, cards, substitutions
- ✅ **Venue/referee** - Complete match metadata

### fbref.com Scraper Limitations
- ❌ **Slow** - Web scraping takes time
- ❌ **Can be blocked** - Cloudflare protection
- ❌ **Fragile** - Breaks if website structure changes
- ❌ **Resource intensive** - Requires browser automation

### Recommendation

**Use FPL API for regular updates** (daily/hourly) - it's fast, reliable, and provides the essential match data.

**Use fbref.com scraper for detailed analysis** - when you need comprehensive match statistics, lineups, and player performance data.

---

## Related Files

- **Script**: `backend/scripts/auto_update_matches.py`
- **Wrapper**: `backend/scripts/auto_update_matches.sh`
- **Scraper**: `backend/scripts/scrape_fbref_comprehensive.py`
- **Import Service**: `backend/app/services/match_import_service.py`
- **Models**: `backend/app/models/pl_data.py`

---

**Last Updated**: 2025-12-21


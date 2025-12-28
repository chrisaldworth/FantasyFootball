# Using FPL API for Match Updates

This document explains how to use the Fantasy Premier League (FPL) API to automatically update match data.

---

## Why Use FPL API?

The FPL API is the **recommended method** for automated match updates because:

✅ **Fast** - API calls complete in seconds  
✅ **Reliable** - No web scraping, no Cloudflare blocking  
✅ **Real-time** - Updates immediately after matches finish  
✅ **Free** - No API key or authentication required  
✅ **Official** - Data from Premier League's official fantasy game  
✅ **Simple** - No browser automation needed  

---

## Quick Start

### Basic Usage

```bash
# Update matches from last 7 days (default)
./backend/scripts/update_matches_from_fpl_api.sh

# Update matches from last 3 days
./backend/scripts/update_matches_from_fpl_api.sh --days 3

# Update specific gameweek
./backend/scripts/update_matches_from_fpl_api.sh --gameweek 19

# Update for specific season
./backend/scripts/update_matches_from_fpl_api.sh --season 2024-2025 --days 7
```

### Python Script Directly

```bash
cd backend
python3 scripts/update_matches_from_fpl_api.py --days 7 --season 2024-2025
```

---

## What Data Does FPL API Provide?

The FPL API provides:

- ✅ **Fixtures** - All matches for the season
- ✅ **Scores** - Home and away team scores
- ✅ **Status** - Finished, live, or scheduled
- ✅ **Kickoff times** - Match dates and times
- ✅ **Teams** - Team names and IDs
- ✅ **Gameweeks** - Match grouping by gameweek

**Note**: FPL API does **not** provide:
- ❌ Detailed player statistics
- ❌ Lineups (starting XI, substitutes)
- ❌ Match events (goals, cards, substitutions)
- ❌ Venue information
- ❌ Referee information
- ❌ Attendance

For detailed match data, use the fbref.com scraper instead.

---

## How It Works

1. **Fetches Bootstrap Data**:
   - Gets team information from FPL API
   - Maps FPL team IDs to team names

2. **Fetches Fixtures**:
   - Gets all fixtures for season (or specific gameweek)
   - Filters by date range if specified

3. **Updates Database**:
   - Converts FPL fixture format to match data format
   - Checks if match already exists
   - Creates new matches or updates existing ones
   - Updates scores, status, and basic info

4. **Direct Database Update**:
   - Updates database directly (no JSON files)
   - Much faster than scraping + importing

---

## Scheduling

### Daily Updates (Recommended)

```bash
# Cron: Daily at 2 AM
0 2 * * * /path/to/FantasyFootball/backend/scripts/update_matches_from_fpl_api.sh --days 3
```

### Hourly Updates (During Match Days)

```bash
# Cron: Every hour on weekends (Saturday/Sunday)
0 * * * 0,6 /path/to/FantasyFootball/backend/scripts/update_matches_from_fpl_api.sh --days 1
```

### After Each Gameweek

```bash
# Cron: After gameweek deadline (e.g., Monday 1 AM)
0 1 * * 1 /path/to/FantasyFootball/backend/scripts/update_matches_from_fpl_api.sh --gameweek $(python3 -c "from datetime import datetime; print((datetime.now() - datetime(2024, 8, 1)).days // 7 + 1)")
```

---

## Options

### `--days DAYS`
Number of days back to update (default: 7)

```bash
# Last 3 days
--days 3

# Last 14 days
--days 14
```

### `--season SEASON`
Season to update (default: current season)

```bash
# Specific season
--season 2024-2025

# Current season (default)
# (automatically determined)
```

### `--gameweek GW`
Update specific gameweek (overrides --days)

```bash
# Update gameweek 19
--gameweek 19
```

---

## Example Output

```
============================================================
Updating Matches from FPL API
============================================================
Season: 2024-2025
Days back: 7
============================================================

Fetching team data from FPL API...
✓ Found 20 teams

Fetching fixtures from FPL API...
✓ Found 380 fixtures for season

✓ Filtered to 10 fixtures in last 7 days

Ensuring database tables exist...
✓ Database ready

Importing 10 matches...

[1/10] ✓ Imported: Arsenal vs Liverpool (2024-12-26)
[2/10] ✓ Updated: Chelsea vs Manchester City (2024-12-27)
[3/10] ✓ Imported: Tottenham vs Newcastle (2024-12-28)
...

============================================================
Import Summary
============================================================
Total fixtures: 10
Imported: 5
Updated: 5
Skipped: 0
Errors: 0
============================================================

✅ Match update completed successfully!
```

---

## Comparison: FPL API vs fbref.com Scraper

| Feature | FPL API | fbref.com Scraper |
|---------|---------|-------------------|
| **Speed** | ⚡ Very Fast (seconds) | 🐌 Slow (minutes) |
| **Reliability** | ✅ High | ⚠️ Can be blocked |
| **Data Completeness** | ⚠️ Basic (scores, teams) | ✅ Comprehensive |
| **Player Stats** | ❌ No | ✅ Yes |
| **Lineups** | ❌ No | ✅ Yes |
| **Events** | ❌ No | ✅ Yes |
| **Venue/Referee** | ❌ No | ✅ Yes |
| **Setup Complexity** | ✅ Simple | ⚠️ Complex |
| **Maintenance** | ✅ Low | ⚠️ High |

---

## When to Use Each Method

### Use FPL API When:
- ✅ You need regular automated updates
- ✅ You only need basic match data (scores, teams, dates)
- ✅ You want fast, reliable updates
- ✅ You're updating frequently (daily/hourly)

### Use fbref.com Scraper When:
- ✅ You need detailed match statistics
- ✅ You need player performance data
- ✅ You need lineups and events
- ✅ You're doing one-time historical data collection

---

## Troubleshooting

### API Connection Issues

```bash
# Test FPL API connection
curl https://fantasy.premierleague.com/api/bootstrap-static/
```

### No Matches Found

- **Check date range**: Increase `--days` value
- **Check season**: Verify season format (e.g., "2024-2025")
- **Check gameweek**: Verify gameweek number exists

### Database Errors

- **Check connection**: Verify `PL_DATABASE_URL` environment variable
- **Check tables**: Ensure database tables exist
- **Check permissions**: Verify database user has write access

---

## API Endpoints Used

The script uses these FPL API endpoints:

1. **`/bootstrap-static/`** - Team data, gameweek info
2. **`/fixtures/`** - All fixtures for season
3. **`/fixtures/?event={gameweek}`** - Fixtures for specific gameweek

All endpoints are public and require no authentication.

---

## Related Files

- **Script**: `backend/scripts/update_matches_from_fpl_api.py`
- **Wrapper**: `backend/scripts/update_matches_from_fpl_api.sh`
- **FPL Service**: `backend/app/services/fpl_service.py`
- **Import Service**: `backend/app/services/match_import_service.py`
- **Models**: `backend/app/models/pl_data.py`

---

**Last Updated**: 2025-12-21


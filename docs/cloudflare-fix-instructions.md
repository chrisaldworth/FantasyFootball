# Fixing Cloudflare and Team Name Issues

## Issues Fixed

1. **Team names showing "Clubs"** - Fixed to properly extract actual team names
2. **Cloudflare requiring frequent human intervention** - Added undetected-chromedriver support

## Installation

First, install the better Cloudflare bypass library:

```bash
cd /Users/chrisaldworth/Football/FantasyFootball/backend
source venv/bin/activate
pip install undetected-chromedriver
```

## Updated Command

```bash
cd /Users/chrisaldworth/Football/FantasyFootball/backend && source venv/bin/activate && python scripts/scrape_fbref_comprehensive.py --season 25/26 --delay 0.5 --skip-club-matches --no-headless
```

## What Changed

### Team Name Extraction
- Now uses the team names passed from the schedule page (most reliable)
- Falls back to extracting from match header area (not navigation)
- Filters out generic words like "Clubs", "Squads", etc.
- Better error handling and logging

### Cloudflare Bypass
- Uses `undetected-chromedriver` if installed (much better at bypassing Cloudflare)
- Falls back to standard Selenium with improved stealth if not installed
- Better browser fingerprinting
- Removes automation indicators

## If You Still Get Cloudflare Challenges

1. **Install undetected-chromedriver** (see above)
2. **Use `--no-headless`** - Visible browsers are less likely to be blocked
3. **Increase delay**: `--delay 2.0` or `--delay 3.0`
4. **Wait between runs** - Don't run multiple instances
5. **Use VPN** if consistently blocked

## Verify the Fix

After running, check a match file:

```bash
cat backend/data/2025-2026/matches/match_*.json | head -20
```

You should see actual team names (e.g., "Bournemouth", "Liverpool") instead of "Clubs".




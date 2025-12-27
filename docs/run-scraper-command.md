# Command to Run Premier League Scraper

## Step 1: Install Better Cloudflare Bypass (Recommended)

```bash
cd /Users/chrisaldworth/Football/FantasyFootball/backend
source venv/bin/activate
pip install undetected-chromedriver
```

This library is much better at bypassing Cloudflare and will significantly reduce the need for human intervention.

## Step 2: Run the Scraper

### Recommended Command (Non-Headless - Best for Cloudflare)

```bash
cd /Users/chrisaldworth/Football/FantasyFootball/backend && source venv/bin/activate && python scripts/scrape_fbref_comprehensive.py --season 25/26 --delay 0.5 --skip-club-matches --no-headless
```

**Why `--no-headless`?** Cloudflare is much less likely to block visible browsers.

### Alternative: Headless Mode (Faster but may be blocked)

```bash
cd /Users/chrisaldworth/Football/FantasyFootball/backend && source venv/bin/activate && python scripts/scrape_fbref_comprehensive.py --season 25/26 --delay 0.5 --skip-club-matches
```

## What's Fixed

1. ✅ **Team names** - Now correctly extracts actual team names (not "Clubs")
2. ✅ **Cloudflare bypass** - Uses undetected-chromedriver if installed
3. ✅ **Better error handling** - More specific team name extraction

## What This Does

- **Scrapes 2025-2026 Premier League season** (25/26)
- **Only Premier League matches** (both teams must be PL clubs)
- **Skips club pages** (only gets PL matches from schedule)
- **Saves each match** as a separate JSON file in `backend/data/2025-2026/matches/`
- **Expected output**: ~380 matches (20 teams × 19 home games)

## If Cloudflare Still Blocks You

1. **Install undetected-chromedriver** (see Step 1 above) - This is the most important step
2. **Use `--no-headless`** - Visible browsers are less likely to be blocked
3. **Increase delay** - Try `--delay 2.0` or `--delay 3.0`
4. **Wait 10-15 minutes** between runs if you've been blocked
5. **Use a VPN** if consistently blocked

## Monitor Progress

In another terminal:

```bash
# Count completed matches
find /Users/chrisaldworth/Football/FantasyFootball/backend/data/2025-2026/matches -name "*.json" | wc -l

# View latest matches
ls -lt /Users/chrisaldworth/Football/FantasyFootball/backend/data/2025-2026/matches/*.json | head -10

# Check team names are correct (should not see "Clubs")
grep -h '"name"' /Users/chrisaldworth/Football/FantasyFootball/backend/data/2025-2026/matches/*.json | head -20
```

## Stop the Script

Press `Ctrl+C` in the terminal where it's running, or:

```bash
pkill -f scrape_fbref_comprehensive
```

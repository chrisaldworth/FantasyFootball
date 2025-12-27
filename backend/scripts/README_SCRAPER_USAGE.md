# Premier League Scraper - Quick Start Guide

## Overview

There are two main ways to scrape Premier League match data:

1. **Comprehensive Scraper** (`scrape_fbref_comprehensive.py`) - Scrapes all matches automatically
2. **Workflow Scraper** (`scrape_fixtures_workflow.py`) - Shows fixtures for approval first, then scrapes

## Quick Start

### Option 1: Simple Shell Script (Recommended)

#### Scrape entire season automatically:
```bash
# From project root
./backend/scripts/scrape_season.sh 2025-2026 --no-headless

# Or use short season format
./backend/scripts/scrape_season.sh 25/26 --no-headless
```

#### Scrape with workflow (shows fixtures for approval first):
```bash
# From project root
./backend/scripts/scrape_season_workflow.sh 25/26 --no-headless

# Skip approval and start immediately
./backend/scripts/scrape_season_workflow.sh 25/26 --no-headless --skip-approval
```

### Option 2: Direct Python Script

#### Comprehensive scraper:
```bash
# From project root
python3 backend/scripts/scrape_fbref_comprehensive.py --season 2025-2026 --no-headless
```

#### Workflow scraper:
```bash
# From project root
python3 backend/scripts/scrape_fixtures_workflow.py --season 25/26 --no-headless
```

## Common Options

### Essential Flags

- `--no-headless` - **Recommended**: Run browser in visible mode (better for Cloudflare bypass)
- `--season SEASON` - Season to scrape (e.g., `2025-2026`, `25/26`, or `current`)
- `--limit N` - Limit to first N matches (for testing)
- `--delay SECONDS` - Delay between requests (default: 2.0 seconds)

### Workflow-Specific Options

- `--skip-approval` - Skip fixture approval and start scraping immediately
- `--skip-existing` - Skip matches that already have JSON files (useful for resuming)
- `--start-from N` - Resume scraping from match number N (1-indexed)

### Advanced Options

- `--debug` - Save HTML snapshots for debugging
- `--debug-dir DIR` - Directory to save debug HTML files
- `--output FILE` - Output JSON file path (comprehensive scraper only)

## Examples

### Scrape 2025-2026 season (all matches):
```bash
./backend/scripts/scrape_season.sh 2025-2026 --no-headless
```

### Test with first 5 matches:
```bash
./backend/scripts/scrape_season.sh 2025-2026 --no-headless --limit 5
```

### Resume scraping from match 50:
```bash
./backend/scripts/scrape_season_workflow.sh 25/26 --no-headless --skip-approval --start-from 50
```

### Scrape with longer delays (if getting blocked):
```bash
./backend/scripts/scrape_season.sh 2025-2026 --no-headless --delay 5.0
```

### Skip existing matches (resume interrupted scrape):
```bash
./backend/scripts/scrape_season_workflow.sh 25/26 --no-headless --skip-approval --skip-existing
```

## Output Location

All match data is saved to:
```
backend/data/{season}/matches/match_*.json
```

Example:
```
backend/data/2025-2026/matches/match_2025_08_15_Liverpool_vs_Bournemouth.json
```

## Monitoring Progress

### Check log file (if running in background):
```bash
tail -f /tmp/scrape_season.log
```

### Count completed matches:
```bash
ls -1 backend/data/2025-2026/matches/*.json | wc -l
```

### Check if scraper is still running:
```bash
ps aux | grep scrape_fbref_comprehensive
```

## Troubleshooting

### Cloudflare Blocking
- Use `--no-headless` flag (visible browser mode)
- Increase `--delay` to 5.0 or higher
- Manually complete Cloudflare verification in the browser window

### Browser Issues
- Make sure Chrome/Chromium is installed
- Check that ChromeDriver is compatible with your Chrome version

### Resuming Interrupted Scrapes
```bash
# Skip existing matches and continue from where you left off
./backend/scripts/scrape_season_workflow.sh 25/26 --no-headless --skip-approval --skip-existing
```

## Which Script to Use?

- **Use `scrape_season.sh`** (comprehensive) if you want to scrape everything automatically
- **Use `scrape_season_workflow.sh`** (workflow) if you want to:
  - Review fixtures before scraping
  - Resume from a specific match
  - Skip existing matches

Both scripts extract the same comprehensive data:
- Match info (date, venue, attendance, referee)
- Team info (managers, captains)
- Lineups (starting XI and substitutes)
- Events (goals, assists, cards, substitutions)
- Player stats
- Team stats


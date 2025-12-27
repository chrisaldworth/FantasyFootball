# How to Monitor the Scraper

The scraper is now running in the background and will scrape all 374 matches.

## Quick Status Commands

### Check if script is running
```bash
ps aux | grep scrape_fbref_comprehensive | grep -v grep
```

### Count completed matches
```bash
find backend/data/2025-2026/matches -name "*.json" -type f | wc -l
```

### View live log (updates in real-time)
```bash
tail -f /tmp/scrape_log.txt
```
Press `Ctrl+C` to exit

### View last 50 lines of log
```bash
tail -50 /tmp/scrape_log.txt
```

### View latest matches scraped
```bash
ls -lt backend/data/2025-2026/matches/ | head -10
```

### Check progress percentage
```bash
grep "Processing match" /tmp/scrape_log.txt | tail -1
```

### View competition breakdown
```bash
grep "competition" backend/data/2025-2026/index.json 2>/dev/null | grep -o '"Premier League"\|"FA Cup"\|"Champions League"\|"Europa League"\|"League Cup"\|"Friendly"\|"Unknown"' | sort | uniq -c
```

## Detailed Monitoring

### View current match being processed
```bash
tail -20 /tmp/scrape_log.txt | grep -E "(Processing match|Match:|Extracting)"
```

### Check for errors
```bash
grep -i "error\|✗\|failed" /tmp/scrape_log.txt | tail -20
```

### View extraction statistics
```bash
grep -E "(✓ Extracted|Goals:|Starting XI|Player stats)" /tmp/scrape_log.txt | tail -30
```

### Check time estimates
```bash
grep -E "(Est. remaining|Avg:|Elapsed)" /tmp/scrape_log.txt | tail -5
```

## Stop the Script

If you need to stop the scraper:
```bash
pkill -f scrape_fbref_comprehensive
```

## Expected Progress

- **Total matches**: 374
- **Estimated time**: ~3-4 hours (depending on network speed)
- **Average time per match**: ~20-30 seconds
- **Matches will be saved to**: `backend/data/2025-2026/matches/`
- **Index file**: `backend/data/2025-2026/index.json` (created at the end)

## What to Expect

The log will show:
- Progress: `[1/374] Processing match 1 of 374 (0.3% complete)`
- Time estimates: `Elapsed: 5.2 minutes | Avg: 20.1s/match | Est. remaining: 125.3 minutes`
- Match details: `Match: Liverpool vs Bournemouth (Premier League)`
- Extraction status: `✓ Extracted comprehensive match data`
- File saves: `✓ Saved match file: match_20250815_Liverpool_vs_Bournemouth.json`

## Check Final Results

Once complete, verify:
```bash
# Count total matches
find backend/data/2025-2026/matches -name "*.json" | wc -l

# Check index file exists
ls -lh backend/data/2025-2026/index.json

# View summary
tail -20 /tmp/scrape_log.txt
```




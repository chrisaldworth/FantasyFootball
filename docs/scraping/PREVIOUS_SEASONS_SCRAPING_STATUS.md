# Previous Seasons Scraping Status

## Started: December 21, 2025 at 22:50

The previous seasons scraper has been started and is running in the background.

**Status**: ✅ Running successfully
- Using venv Python with all dependencies installed
- Chrome WebDriver initialized
- Currently scraping 2023-2024 season (450 matches found)

## What's Being Scraped

The script will scrape the following seasons (in order, most recent first):

1. ✅ **2023-2024** - Currently running (450 matches found)
2. ⏳ 2022-2023
3. ⏳ 2021-2022
4. ⏳ 2020-2021
5. ⏳ 2019-2020
6. ⏳ 2018-2019
7. ⏳ 2017-2018
8. ⏳ 2016-2017
9. ⏳ 2015-2016

## Output Location

Each season's data will be saved to:
```
backend/data/{season}/
├── index.json          # Season summary and metadata
└── matches/            # Individual match JSON files
    ├── match_{date}_{home}_vs_{away}.json
    └── ...
```

## Monitoring

### Check Status
```bash
cd backend
tail -f scrape_previous_seasons.log
```

Or use the status script:
```bash
cd backend/scripts
./check_scraper_status.sh
```

### Check Progress
```bash
# See which seasons are complete
ls -la backend/data/

# Count matches scraped for current season
ls backend/data/2023-2024/matches/ | wc -l
```

## Estimated Time

- **Per match**: ~2-5 seconds (with 2 second delay)
- **Per season**: ~450 matches × 3 seconds = ~22-25 minutes
- **All 9 seasons**: ~3-4 hours total

The scraper will:
- Skip seasons that already have data
- Continue to next season if one fails
- Log all progress to `backend/scrape_previous_seasons.log`

## Process Management

The scraper is running in the background. If you need to stop it:

```bash
# Find the process
ps aux | grep scrape_previous_seasons

# Kill it (if needed)
kill <PID>
```

Or check for PID file:
```bash
cat backend/scrape_previous_seasons.pid
kill $(cat backend/scrape_previous_seasons.pid)
```

## Notes

- The scraper uses headless Chrome (no browser window)
- 2 second delay between requests to be respectful to fbref.com
- All data is saved incrementally (matches saved as they're scraped)
- If the process crashes, you can restart it - it will skip completed seasons


# Scraper Performance & Debug Improvements

## New Features

### 1. Fast Testing Mode (`--skip-club-matches`)
Skip scraping individual club pages (cups, European, friendlies) to speed up testing:
```bash
python scripts/scrape_fbref_comprehensive.py --season 25/26 --limit 1 --skip-club-matches
```
**Time saved**: ~2-3 minutes per test run (skips 20 club pages)

### 2. Debug Mode (`--debug`)
Save HTML snapshots of match report pages for inspection:
```bash
python scripts/scrape_fbref_comprehensive.py --season 25/26 --limit 1 --debug
```
**Output**: HTML files saved to `backend/debug_html/` directory

### 3. Performance Timing
Each match extraction now shows timing:
```
⏱ Match extraction took 24.4s
```

### 4. HTML Inspection Tool
New script to analyze saved HTML for event extraction:
```bash
python scripts/inspect_events_html.py backend/debug_html/match_report_Liverpool_Bournemouth.html
```

## Quick Test Command

For fastest testing/debugging:
```bash
cd backend
source venv/bin/activate
python scripts/scrape_fbref_comprehensive.py \
  --season 25/26 \
  --limit 1 \
  --skip-club-matches \
  --delay 1.0 \
  --debug
```

**Expected time**: ~25-30 seconds per match (vs 3-4 minutes before)

## Debug Workflow for Event Extraction

1. **Run scraper with debug mode**:
   ```bash
   python scripts/scrape_fbref_comprehensive.py --season 25/26 --limit 1 --skip-club-matches --debug
   ```

2. **Inspect saved HTML**:
   ```bash
   python scripts/inspect_events_html.py backend/debug_html/match_report_*.html
   ```

3. **Open HTML in browser** to see actual structure:
   ```bash
   open backend/debug_html/match_report_*.html
   ```

4. **Update extraction logic** based on findings

## Current Status

✅ **Working**:
- Score extraction (4-2)
- Player stats extraction (minutes, goals, assists, shots, passes, etc.)
- Fast testing mode

❌ **Needs Work**:
- Event extraction (goals, assists, cards, substitutions)
- Lineup extraction
- Date extraction

## Next Steps

1. Inspect saved HTML files to understand event structure
2. Update event extraction XPath/selectors based on actual HTML
3. Test with multiple matches to ensure consistency




# Why Does the Script Visit Team Pages?

## Short Answer

The script **only** visits team pages when you want to scrape **ALL matches** for Premier League teams (FA Cup, League Cup, European competitions, friendlies). If you're using `--skip-club-matches` (which you are), it **skips** this step entirely.

## The Two Scraping Modes

### Mode 1: Premier League Only (Current - with `--skip-club-matches`)

```
1. Go to season schedule page
   ↓
2. Extract all Premier League match URLs from schedule
   ↓
3. Skip club pages (because --skip-club-matches is set)
   ↓
4. Scrape each Premier League match directly
```

**Result:** Only Premier League matches (~380 per season)

### Mode 2: All Competitions (without `--skip-club-matches`)

```
1. Go to season schedule page
   ↓
2. Extract all Premier League match URLs from schedule
   ↓
3. For each Premier League team:
   - Go to team's "All Competitions" page
   - Extract ALL matches (FA Cup, League Cup, European, friendlies)
   - Add non-duplicate matches to the list
   ↓
4. Scrape all matches (Premier League + cups + European + friendlies)
```

**Result:** All matches involving Premier League teams (~500-600+ per season)

## Why Visit Team Pages?

The team pages (`/squads/{team_id}/{season}/all_comps/`) show **all matches** for that team across **all competitions**:

- ✅ Premier League (already on schedule page)
- ✅ FA Cup
- ✅ League Cup (Carabao Cup)
- ✅ Champions League
- ✅ Europa League
- ✅ Conference League
- ✅ Friendlies

### Example: Arsenal's 2025-2026 Season

If you visit Arsenal's team page, you'd see:
- 38 Premier League matches
- 5-6 FA Cup matches (if they progress)
- 3-4 League Cup matches
- 6-10 Champions League matches (if they qualify)
- 2-3 Friendlies

**Total: ~50-60 matches** for Arsenal alone

## Current Behavior (With `--skip-club-matches`)

When you run:
```bash
python scripts/scrape_fbref_comprehensive.py --season 25/26 --skip-club-matches
```

The script:
1. ✅ Goes to schedule page
2. ✅ Extracts Premier League matches only
3. ✅ **SKIPS** all team pages (line 3947-3949)
4. ✅ Scrapes only Premier League matches

**It does NOT visit team pages when `--skip-club-matches` is used.**

## Why You Might See Team Pages Being Visited

If you're seeing team pages being visited, it could be:

1. **You're not using `--skip-club-matches` flag**
   - Check your command: make sure `--skip-club-matches` is included

2. **The script is extracting team IDs from the schedule page**
   - This is normal - it extracts team fbref IDs from links on the schedule page
   - But it doesn't navigate to team pages unless `skip_club_matches=False`

3. **Old version of the script**
   - Earlier versions might have visited team pages by default

## Performance Impact

### With `--skip-club-matches` (Current)
- **Time:** ~5-7 hours for full season
- **Matches:** ~380 Premier League matches
- **Team pages visited:** 0

### Without `--skip-club-matches`
- **Time:** ~8-12 hours for full season
- **Matches:** ~500-600+ matches (all competitions)
- **Team pages visited:** 20 (one per Premier League team)
- **Extra time:** ~2-5 hours (visiting 20 team pages + scraping extra matches)

## Recommendation

**For Premier League only:** Keep using `--skip-club-matches` ✅

**For all competitions:** Remove `--skip-club-matches` flag

## Code Reference

The logic is in `scrape_season_comprehensive()` function:

```python
# Line 3947-3950
if skip_club_matches or not include_all_competitions:
    logger.info("Step 2: Skipping club pages - only scraping Premier League matches from schedule")
    logger.info(f"  Total Premier League matches found: {len(valid_matches)}")
else:
    # This block visits team pages (only if skip_club_matches=False)
    logger.info("Step 2: Scraping individual club pages for all competitions...")
    for club_name, club_id in pl_clubs_with_ids.items():
        club_matches = scrape_club_matches_comprehensive(...)
```

## Summary

- **With `--skip-club-matches`:** Script does NOT visit team pages ✅
- **Without `--skip-club-matches`:** Script visits 20 team pages to get all competitions
- **Current command:** Uses `--skip-club-matches`, so no team pages are visited

If you're seeing team pages being visited, check your command to ensure `--skip-club-matches` is included.



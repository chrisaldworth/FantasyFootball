# Import Match Data Guide

## Overview

This guide explains how to import scraped match data from JSON files into the database.

## Prerequisites

1. **Database Setup**: PL database must be configured
2. **JSON Files**: Match data files in `backend/data/{season}/matches/`
3. **Python Environment**: Backend dependencies installed

## Database Configuration

The import script uses the same database connection as the main app. You can optionally use a separate database for PL data by setting:

```bash
export PL_DATABASE_URL="postgresql://user:pass@host:5432/pl_data_db"
```

If not set, it will use `DATABASE_URL` or default to SQLite (`pl_data.db`).

## Running the Import

### Basic Usage

```bash
# From project root
cd backend
python scripts/import_match_data.py --season 2025-2026 --data-dir ../backend/data
```

### Options

- `--season`: Required. Season identifier (e.g., "2025-2026")
- `--data-dir`: Optional. Path to data directory (default: "backend/data")

### Example

```bash
# Import 2025-2026 season data
python scripts/import_match_data.py --season 2025-2026

# With custom data directory
python scripts/import_match_data.py --season 2025-2026 --data-dir /path/to/data
```

## What Gets Imported

The script imports:

1. **Teams** - All teams from matches (deduplicated by fbref_id)
2. **Players** - All players from lineups and stats (deduplicated by fbref_id)
3. **Matches** - Match information (date, score, venue, referee, etc.)
4. **Lineups** - Starting XI and substitutes for both teams
5. **Match Events** - Goals, cards, substitutions
6. **Player Stats** - Individual player statistics per match
7. **Team Stats** - Team-level statistics per match

## Data Structure

### Teams
- `fbref_id` (unique identifier from FBRef)
- `name`
- `logo_url` (optional)

### Players
- `fbref_id` (unique identifier from FBRef)
- `name`
- `position`
- `current_team_id` (from most recent match)

### Matches
- `season` (e.g., "2025-2026")
- `date`
- `home_team_id` / `away_team_id`
- `score_home` / `score_away`
- `venue`, `referee`, `attendance`
- `home_manager` / `away_manager`
- `home_captain` / `away_captain`

### Match Events
- `event_type` (goal, card, substitution)
- `minute`
- `player_id` (if applicable)
- `team_id`
- `details` (JSON with event-specific data)

### Player Stats
- `match_id` / `player_id` / `team_id`
- `minutes`, `goals`, `assists`
- `shots`, `shots_on_target`
- `passes`, `pass_accuracy`
- `tackles`, `interceptions`
- `fouls`, `cards`

## Import Process

1. **Create Tables**: Automatically creates all PL data tables if they don't exist
2. **Process Files**: Iterates through all JSON files in the match directory
3. **Deduplication**: 
   - Teams and players are cached to avoid duplicates
   - Matches are checked for existing records (by date + teams)
4. **Transaction Safety**: Each match is imported in a transaction (rollback on error)
5. **Progress Tracking**: Shows progress and summary at the end

## Error Handling

- **Individual Match Errors**: If one match fails, others continue
- **Rollback**: Failed matches are rolled back (not saved)
- **Error Log**: All errors are collected and displayed at the end
- **Duplicate Detection**: Existing matches are skipped (not re-imported)

## Verification

After import, verify the data:

```python
from app.core.pl_database import get_pl_session
from app.models.pl_data import Match, Team, Player

with Session(pl_engine) as session:
    # Count matches
    matches = session.exec(select(Match)).all()
    print(f"Total matches: {len(matches)}")
    
    # Count teams
    teams = session.exec(select(Team)).all()
    print(f"Total teams: {len(teams)}")
    
    # Count players
    players = session.exec(select(Player)).all()
    print(f"Total players: {len(players)}")
```

## Performance

- **Caching**: Teams and players are cached in memory during import
- **Batch Processing**: All related data for a match is imported together
- **Indexes**: Database indexes are created for fast lookups

## Troubleshooting

### "No module named 'app'"
- Make sure you're running from the backend directory
- Or add the backend directory to PYTHONPATH

### "Table does not exist"
- Run `create_pl_db_and_tables()` first
- Check database connection

### "Duplicate key error"
- Matches are checked for duplicates, but if you see this, the match might have been partially imported
- Delete the match and re-import

### "Connection timeout"
- Check database connection settings
- Increase timeout in `pl_database.py`

## Next Steps

After importing:

1. **Create Indexes**: Additional indexes may be needed for your queries
2. **ID Mapping**: Set up FPL ID mappings (separate process)
3. **API Endpoints**: Create endpoints to query the data
4. **Caching**: Set up Redis caching for frequently accessed data

---

**Status**: Ready to use


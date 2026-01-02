# Import 2023-2024 Match Data to Cloud Database

This script imports all scraped 2023-2024 match data (380 matches) into your cloud database.

## Prerequisites

1. You need your cloud database URL (PostgreSQL connection string)
2. All match JSON files should be in `backend/data/2023-2024/matches/`

## Usage

### Option 1: Using command line argument

```bash
cd backend
python scripts/import_2023_2024_matches.py --db-url "postgresql://user:password@host:port/database"
```

### Option 2: Using environment variable

```bash
export PL_DATABASE_URL="postgresql://user:password@host:port/database"
cd backend
python scripts/import_2023_2024_matches.py
```

### Option 3: Using DATABASE_URL (fallback)

If `PL_DATABASE_URL` is not set, it will use `DATABASE_URL`:

```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
cd backend
python scripts/import_2023_2024_matches.py
```

## What the script does

1. **Transforms JSON format**: Converts the scraped match JSON format to match the import service expectations:
   - Converts date from "December 2, 2023" to "2023-12-02"
   - Moves scores from `score` object to `match_info.home_score` and `match_info.away_score`
   - Transforms substitutions format
   - Transforms team stats format (passes_completed → passes, passing_accuracy → pass_accuracy)

2. **Imports matches**: Uses the `MatchImportService` to import:
   - Match information (teams, scores, date, venue, referee, etc.)
   - Lineups (starting XI and substitutes)
   - Match events (goals, cards, substitutions)
   - Player statistics
   - Team statistics

3. **Handles duplicates**: Skips matches that already exist in the database

## Output

The script will show:
- Progress for each match file
- Summary with total matches, imported count, skipped count, and errors
- Any errors encountered during import

## Example Output

```
============================================================
Importing Match Data for Season: 2023-2024
============================================================

Database: postgresql://user:password@host:port/database...
Data directory: /path/to/backend/data

Found 380 match files

[1/380] Processing: match_December 2, 2023_Arsenal_vs_WolverhamptonWanderers.json
  ✓ Imported: match_December 2, 2023_Arsenal_vs_WolverhamptonWanderers.json
[2/380] Processing: match_December 3, 2023_Bournemouth_vs_AstonVilla.json
  ✓ Imported: match_December 3, 2023_Bournemouth_vs_AstonVilla.json
...

============================================================
Import Summary
============================================================
Total matches processed: 380
Successfully imported: 380
Skipped: 0
Errors: 0

============================================================
```

## Troubleshooting

### Connection errors
- Make sure your database URL is correct
- Check that your database allows connections from your IP
- For cloud databases (Render, Neon, etc.), ensure SSL is enabled

### Date parsing errors
- The script expects dates in "December 2, 2023" format
- If dates are in a different format, you may need to update the `transform_match_data` function

### Missing data
- Some matches might have incomplete data (missing lineups, stats, etc.)
- The script will import what's available and skip missing parts

### Duplicate matches
- If a match already exists (same date, teams, season), it will be skipped
- This is normal if you run the script multiple times

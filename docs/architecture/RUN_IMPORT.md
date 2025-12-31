# How to Run Match Data Import

## Quick Start

### Local Import

```bash
# From project root
cd backend
python3 scripts/import_match_data.py --season 2025-2026 --data-dir data
```

### Cloud Import (Render)

**Option 1: Via API Endpoint (Recommended)**
```bash
# After logging in as admin
curl -X POST "https://fpl-companion-api.onrender.com/api/admin/import-match-data?season=2025-2026" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Option 2: Via Render Shell**
```bash
# In Render dashboard → Shell
cd backend
python scripts/import_match_data.py --season 2025-2026 --data-dir data
```

---

## What the Script Does

1. **Creates Database Tables** (if they don't exist)
   - teams
   - players
   - matches
   - match_player_stats
   - match_events
   - lineups
   - team_stats

2. **Processes Each Match File**
   - Creates/updates teams
   - Creates/updates players
   - Creates match record
   - Imports lineups, events, stats

3. **Shows Progress**
   - Real-time progress updates
   - Success/error messages
   - Final summary

---

## Expected Output

```
============================================================
Importing Match Data for Season: 2025-2026
============================================================

Data directory: /path/to/backend/data
[PL DB] Creating PL database tables...
[PL DB] PL database tables created successfully
Found 122 match files

[1/122] Processing: match_2025_08_15_Liverpool_vs_Bournemouth.json
  ✓ Imported: match_2025_08_15_Liverpool_vs_Bournemouth.json
[2/122] Processing: match_2025_08_16_Aston_Villa_vs_Newcastle_Utd.json
  ✓ Imported: match_2025_08_16_Aston_Villa_vs_Newcastle_Utd.json
...

============================================================
Import Summary
============================================================
Total matches processed: 122
Successfully imported: 122
Errors: 0

============================================================
```

---

## Troubleshooting

### "Module not found"
- Make sure you're in the `backend` directory
- Or set `PYTHONPATH` to include backend directory

### "Database connection error"
- Check `DATABASE_URL` is set correctly
- Verify database is accessible
- Check SSL settings for cloud databases

### "Data directory not found"
- Verify path to data directory
- Use absolute path if relative path doesn't work
- Check files are in `backend/data/{season}/matches/`

---

## Next Steps After Import

1. **Verify Data:**
   ```python
   from app.core.pl_database import get_pl_session
   from app.models.pl_data import Match, Team, Player
   from sqlmodel import select
   
   with Session(pl_engine) as session:
       matches = session.exec(select(Match)).all()
       print(f"Total matches: {len(matches)}")
   ```

2. **Create API Endpoints** to query the data

3. **Set up FPL ID Mappings** (separate process)

---

**Ready to import!**



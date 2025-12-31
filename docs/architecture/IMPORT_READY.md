# Match Data Import - Ready to Run

## ✅ What's Been Created

1. **Database Models** (`backend/app/models/pl_data.py`)
   - Teams, Players, Matches, Stats, Events, Lineups

2. **Database Connection** (`backend/app/core/pl_database.py`)
   - Uses same database as user data (can override with `PL_DATABASE_URL`)

3. **Import Service** (`backend/app/services/match_import_service.py`)
   - Reusable service for importing match data
   - Can be used by scripts or API endpoints

4. **Import Script** (`backend/scripts/import_match_data.py`)
   - Command-line script for local/cloud execution

5. **Admin API Endpoint** (`backend/app/api/admin.py`)
   - `/api/admin/import-match-data` - Trigger import via API

---

## 🚀 How to Run

### Local Import

```bash
# 1. Navigate to backend directory
cd backend

# 2. Make sure dependencies are installed
pip install -r requirements.txt

# 3. Set database URL (if not in .env)
export DATABASE_URL="your_database_url"

# 4. Run import
python3 scripts/import_match_data.py --season 2025-2026 --data-dir data
```

### Cloud Import (Render)

**Method 1: API Endpoint (Recommended)**

1. **Ensure data files are in Git:**
   ```bash
   git add backend/data/2025-2026/
   git commit -m "Add 2025-2026 match data"
   git push origin main
   ```

2. **Wait for Render to deploy**

3. **Get admin token:**
   ```bash
   curl -X POST "https://fpl-companion-api.onrender.com/api/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=admin@example.com&password=your_password"
   ```

4. **Trigger import:**
   ```bash
   curl -X POST "https://fpl-companion-api.onrender.com/api/admin/import-match-data?season=2025-2026" \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

5. **Check Render logs** for progress

**Method 2: Render Shell**

1. Go to Render Dashboard → Your Service → Shell
2. Run:
   ```bash
   cd backend
   python scripts/import_match_data.py --season 2025-2026 --data-dir data
   ```

---

## 📊 What Gets Imported

For each match file, the script imports:

- ✅ **Teams** (deduplicated by fbref_id)
- ✅ **Players** (deduplicated by fbref_id)
- ✅ **Match** (date, score, venue, referee, etc.)
- ✅ **Lineups** (starting XI and substitutes)
- ✅ **Match Events** (goals, cards, substitutions)
- ✅ **Player Stats** (goals, assists, passes, shots, etc.)
- ✅ **Team Stats** (possession, shots, passes, etc.)

---

## 🔍 Verification

After import, verify the data:

```python
from app.core.pl_database import pl_engine, get_pl_session
from app.models.pl_data import Match, Team, Player
from sqlmodel import Session, select

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
    
    # Sample match
    if matches:
        match = matches[0]
        print(f"\nSample match: {match.date} - Season: {match.season}")
```

---

## ⚙️ Configuration

### Database

- **Default**: Uses same database as user data (`DATABASE_URL`)
- **Override**: Set `PL_DATABASE_URL` for separate database

### Data Directory

- **Default**: `backend/data` (relative to backend directory)
- **Override**: Use `--data-dir` flag or `data_dir` parameter

---

## 📝 Notes

- **Idempotent**: Running multiple times is safe (skips existing matches)
- **Transaction Safe**: Each match imported in a transaction
- **Error Handling**: Failed matches don't stop the import
- **Progress Tracking**: Real-time progress updates

---

## 🎯 Next Steps

After importing:

1. ✅ Verify data in database
2. Create API endpoints to query match data
3. Set up FPL ID mappings (separate process)
4. Build frontend components to display data

---

**Status**: ✅ Ready to run!



# Match Data API & Frontend Test Guide

## ✅ What's Been Created

### Backend APIs (`/api/match-data/*`)

1. **Teams**
   - `GET /api/match-data/teams` - List all teams
   - `GET /api/match-data/teams/{team_id}` - Get specific team

2. **Players**
   - `GET /api/match-data/players` - List all players (optional team filter)
   - `GET /api/match-data/players/{player_id}` - Get specific player
   - `GET /api/match-data/players/{player_id}/matches` - Get player's matches
   - `GET /api/match-data/players/{player_id}/stats` - Get player statistics

3. **Matches**
   - `GET /api/match-data/matches` - List matches (filters: season, team, date range)
   - `GET /api/match-data/matches/{match_id}` - Get match with all details
   - `GET /api/match-data/matches/{match_id}/events` - Get match events
   - `GET /api/match-data/matches/{match_id}/stats` - Get match statistics

4. **Team Matches**
   - `GET /api/match-data/teams/{team_id}/matches` - Get team's matches

5. **Seasons**
   - `GET /api/match-data/seasons` - Get all available seasons

### Frontend Test Page

- **Route**: `/match-data-test`
- **Features**:
  - Season selector
  - Tabs for Matches, Teams, Players
  - Match details modal
  - Real-time data loading

### Admin Import Endpoint

- `POST /api/admin/import-match-data?season=2025-2026` - Trigger data import

---

## 🚀 Quick Start

### Step 1: Import Data

**Local:**
```bash
cd backend
python3 scripts/import_match_data.py --season 2025-2026 --data-dir data
```

**Cloud (via API):**
```bash
# After logging in as admin
curl -X POST "https://fpl-companion-api.onrender.com/api/admin/import-match-data?season=2025-2026" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Step 2: Test the APIs

**Get Seasons:**
```bash
curl https://fpl-companion-api.onrender.com/api/match-data/seasons
```

**Get Matches:**
```bash
curl "https://fpl-companion-api.onrender.com/api/match-data/matches?season=2025-2026&limit=10"
```

**Get Teams:**
```bash
curl https://fpl-companion-api.onrender.com/api/match-data/teams
```

### Step 3: Test Frontend

1. Start frontend: `cd frontend && npm run dev`
2. Navigate to: `http://localhost:3000/match-data-test`
3. Select a season
4. Browse matches, teams, and players
5. Click a match to see details

---

## 📋 API Examples

### Get All Matches for a Season

```typescript
const matches = await matchDataApi.getMatches({
  season: '2025-2026',
  limit: 50
});
```

### Get Match Details

```typescript
const match = await matchDataApi.getMatch(matchId);
// Returns: match, home_team, away_team, lineups, events, player_stats, team_stats
```

### Get Player Statistics

```typescript
const stats = await matchDataApi.getPlayerStats(playerId, '2025-2026');
// Returns: aggregated stats (goals, assists, minutes, etc.)
```

### Get Team Matches

```typescript
const teamMatches = await matchDataApi.getTeamMatches(teamId, '2025-2026');
```

---

## 🎨 Frontend Test Page Features

### Tabs

1. **Matches Tab**
   - Lists all matches for selected season
   - Shows: Teams, Date, Score, Venue
   - Click to view full details

2. **Teams Tab**
   - Lists all teams
   - Shows: Name, FBRef ID

3. **Players Tab**
   - Lists all players
   - Shows: Name, Position, Current Team

### Match Details Modal

When you click a match, shows:
- Match information (date, score, venue, referee)
- Teams (home/away)
- Events (goals, cards, substitutions)
- Player statistics count

---

## 🔍 Testing Checklist

After importing data:

- [ ] Visit `/match-data-test` page
- [ ] Select a season from dropdown
- [ ] Verify matches load
- [ ] Click a match to see details
- [ ] Check Teams tab shows teams
- [ ] Check Players tab shows players
- [ ] Verify API endpoints work via browser/curl

---

## 📊 Data Structure

### Match Response
```json
{
  "match": {
    "id": "uuid",
    "season": "2025-2026",
    "date": "2025-11-23",
    "home_team_id": "uuid",
    "away_team_id": "uuid",
    "score_home": 4,
    "score_away": 1,
    "venue": "Emirates Stadium",
    "referee": "Michael Oliver"
  },
  "home_team": { ... },
  "away_team": { ... },
  "lineups": [ ... ],
  "events": [ ... ],
  "player_stats": [ ... ],
  "team_stats": [ ... ]
}
```

---

## 🎯 Next Steps

1. ✅ Import data (local or cloud)
2. ✅ Test APIs via frontend page
3. ✅ Verify data is correct
4. Create production UI components
5. Add filtering and search
6. Create player/team detail pages
7. Add statistics visualizations

---

**Status**: ✅ Ready to test!



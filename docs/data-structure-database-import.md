# Premier League Match Data - Database Import Structure

## Overview
The scraper extracts comprehensive match data from fbref.com for the 2025-2026 Premier League season. Each match is saved as an individual JSON file, and a master index file contains all matches, players, and clubs keyed by IDs for easy database filtering.

## Data Structure

### Individual Match File
Each match is saved as: `backend/data/2025-2026/matches/match_{match_id}.json`

**Match ID Format**: `{date}_{home_team}_vs_{away_team}` (e.g., `20250815_Liverpool_vs_Bournemouth`)

### Match Data Structure
```json
{
  "match_id": "20250815_Liverpool_vs_Bournemouth",
  "date": "August 15, 2025",
  "competition": "Premier League",
  "home_team": {
    "name": "Liverpool",
    "fbref_id": "822bd0ba"
  },
  "away_team": {
    "name": "Bournemouth",
    "fbref_id": "4ba7cbea"
  },
  "score": {
    "home": 4,
    "away": 2
  },
  "lineups": {
    "home": {
      "starting_xi": [
        {
          "name": "Player Name",
          "fbref_id": "player_id_hex",
          "position": null,
          "jersey_number": null
        }
      ],
      "substitutes": [...],
      "formation": null
    },
    "away": {...}
  },
  "events": {
    "goals": [
      {
        "type": "goal",
        "player_name": "Player Name",
        "player_id": "player_id_hex",
        "minute": "14",
        "team": "home"
      }
    ],
    "assists": [...],
    "cards": [
      {
        "type": "card",
        "card_type": "yellow",
        "player_name": "Player Name",
        "player_id": "player_id_hex",
        "minute": "43",
        "team": "home"
      }
    ],
    "substitutions": [
      {
        "type": "substitution",
        "player_name": "Player Out",
        "player_id": "player_id_hex",
        "minute": "65",
        "team": "home",
        "substituted_for": "Player In",
        "substituted_for_id": "player_id_hex"
      }
    ],
    "other": []
  },
  "player_stats": {
    "home": [
      {
        "player_name": "Player Name",
        "player_id": "player_id_hex",
        "position": "FW",
        "minutes": 90,
        "goals": 1,
        "assists": 0,
        "shots": 3,
        "shots_on_target": 2,
        "passes": 45,
        "passes_completed": 38,
        "passing_accuracy": 84.4,
        "touches": 67,
        "tackles": 1,
        "interceptions": 0,
        "clearances": 0,
        "aerial_duels_won": 2,
        "fouls": 1,
        "fouls_drawn": 2,
        "offsides": 0,
        "yellow_cards": 0,
        "red_cards": 0
      }
    ],
    "away": [...]
  },
  "team_stats": {
    "home": {
      "possession": 61.0,
      "passes_completed": null,
      "passes_attempted": null,
      "passing_accuracy": null,
      "shots": null,
      "shots_on_target": null,
      "saves": null,
      "yellow_cards": 3,
      "red_cards": 0,
      "fouls": 10,
      "corners": 7,
      "tackles": 20,
      "interceptions": 11,
      "aerials_won": null,
      "clearances": null,
      "offsides": null,
      "goal_kicks": null,
      "throw_ins": null,
      "long_balls": null
    },
    "away": {...}
  },
  "match_info": {
    "attendance": null,
    "referee": null,
    "venue": null
  }
}
```

## Master Index File
Location: `backend/data/2025-2026/index.json`

```json
{
  "season": "2025-2026",
  "scraped_at": "2025-12-21T19:00:00",
  "matches": {
    "match_id": {...match_data...}
  },
  "players": {
    "player_id_hex": {
      "name": "Player Name",
      "fbref_id": "player_id_hex",
      "position": "FW"
    }
  },
  "clubs": {
    "club_id_hex": {
      "name": "Liverpool",
      "fbref_id": "club_id_hex"
    }
  }
}
```

## Database Import Recommendations

### Tables Structure

#### 1. **matches** table
- `match_id` (PRIMARY KEY)
- `date` (DATE)
- `competition` (VARCHAR)
- `home_team_id` (FOREIGN KEY -> clubs)
- `away_team_id` (FOREIGN KEY -> clubs)
- `home_score` (INTEGER)
- `away_score` (INTEGER)
- `attendance` (INTEGER, nullable)
- `referee` (VARCHAR, nullable)
- `venue` (VARCHAR, nullable)
- `scraped_at` (TIMESTAMP)

#### 2. **clubs** table
- `club_id` (PRIMARY KEY) - uses fbref_id
- `name` (VARCHAR)
- `fbref_id` (VARCHAR, UNIQUE)

#### 3. **players** table
- `player_id` (PRIMARY KEY) - uses fbref_id
- `name` (VARCHAR)
- `fbref_id` (VARCHAR, UNIQUE)
- `position` (VARCHAR, nullable)

#### 4. **match_lineups** table
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `match_id` (FOREIGN KEY -> matches)
- `player_id` (FOREIGN KEY -> players)
- `team` (ENUM: 'home', 'away')
- `is_starting_xi` (BOOLEAN)
- `position` (VARCHAR, nullable)
- `jersey_number` (INTEGER, nullable)

#### 5. **match_events** table
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `match_id` (FOREIGN KEY -> matches)
- `event_type` (ENUM: 'goal', 'assist', 'card', 'substitution', 'other')
- `player_id` (FOREIGN KEY -> players, nullable)
- `player_name` (VARCHAR) - for cases where player_id might be missing
- `minute` (VARCHAR) - can be "14", "45+2", etc.
- `team` (ENUM: 'home', 'away')
- `card_type` (ENUM: 'yellow', 'red', nullable) - for card events
- `substituted_for_player_id` (FOREIGN KEY -> players, nullable) - for substitutions
- `substituted_for_player_name` (VARCHAR, nullable) - for substitutions

#### 6. **match_player_stats** table
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `match_id` (FOREIGN KEY -> matches)
- `player_id` (FOREIGN KEY -> players)
- `team` (ENUM: 'home', 'away')
- `position` (VARCHAR, nullable)
- `minutes` (INTEGER)
- `goals` (INTEGER, default 0)
- `assists` (INTEGER, default 0)
- `shots` (INTEGER, nullable)
- `shots_on_target` (INTEGER, nullable)
- `passes` (INTEGER, nullable)
- `passes_completed` (INTEGER, nullable)
- `passing_accuracy` (DECIMAL(5,2), nullable)
- `touches` (INTEGER, nullable)
- `tackles` (INTEGER, nullable)
- `interceptions` (INTEGER, nullable)
- `clearances` (INTEGER, nullable)
- `aerial_duels_won` (INTEGER, nullable)
- `fouls` (INTEGER, nullable)
- `fouls_drawn` (INTEGER, nullable)
- `offsides` (INTEGER, nullable)
- `yellow_cards` (INTEGER, default 0)
- `red_cards` (INTEGER, default 0)

#### 7. **match_team_stats** table
- `id` (PRIMARY KEY, AUTO_INCREMENT)
- `match_id` (FOREIGN KEY -> matches)
- `team` (ENUM: 'home', 'away')
- `possession` (DECIMAL(5,2), nullable)
- `passes_completed` (INTEGER, nullable)
- `passes_attempted` (INTEGER, nullable)
- `passing_accuracy` (DECIMAL(5,2), nullable)
- `shots` (INTEGER, nullable)
- `shots_on_target` (INTEGER, nullable)
- `saves` (INTEGER, nullable)
- `yellow_cards` (INTEGER, default 0)
- `red_cards` (INTEGER, default 0)
- `fouls` (INTEGER, nullable)
- `corners` (INTEGER, nullable)
- `tackles` (INTEGER, nullable)
- `interceptions` (INTEGER, nullable)
- `aerials_won` (INTEGER, nullable)
- `clearances` (INTEGER, nullable)
- `offsides` (INTEGER, nullable)
- `goal_kicks` (INTEGER, nullable)
- `throw_ins` (INTEGER, nullable)
- `long_balls` (INTEGER, nullable)

## Import Process

1. **Import clubs first** (from `index.json` -> `clubs`)
2. **Import players** (from `index.json` -> `players`)
3. **Import matches** (from `index.json` -> `matches` or individual match files)
4. **Import lineups** (from match files -> `lineups`)
5. **Import events** (from match files -> `events`)
6. **Import player stats** (from match files -> `player_stats`)
7. **Import team stats** (from match files -> `team_stats`)

## Data Quality Notes

- Some team stats (passing accuracy, shots, saves) may be `null` if not extractable from the page
- Player positions may be `null` if not available
- Minutes in events are stored as strings to handle formats like "45+2"
- All IDs use fbref.com's hexadecimal IDs for consistency

## File Locations

- **Match files**: `backend/data/2025-2026/matches/match_*.json`
- **Index file**: `backend/data/2025-2026/index.json`
- **Total matches expected**: ~380 Premier League matches + additional cup/European matches




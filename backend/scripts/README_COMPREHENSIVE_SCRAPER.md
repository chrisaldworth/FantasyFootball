# Comprehensive Premier League Data Scraper

## Overview

This scraper extracts comprehensive match data from fbref.com including:
- Match information (date, score, attendance, referee, venue)
- Team information (with fbref IDs for identification)
- Lineups (starting XI, substitutes, formation)
- Match events (goals, assists, cards, substitutions)
- Player statistics (goals, assists, passes, shots, tackles, etc.)
- Team statistics (possession, shots, passes, etc.)

## Usage

```bash
# Test with limited matches
python scripts/scrape_fbref_comprehensive.py --season 2024-2025 --output pl_data_2024_2025.json --limit 5

# Full season (takes several hours)
python scripts/scrape_fbref_comprehensive.py --season 2024-2025 --output pl_data_2024_2025.json --delay 2.0
```

## JSON Structure

The output JSON follows a normalized structure suitable for PostgreSQL migration:

```json
{
  "season": "2024-2025",
  "scraped_at": "2025-12-20T20:01:30.083637",
  "matches": [
    {
      "match_id": "2024-2025_1",
      "date": "2024-08-16",
      "home_team": {
        "name": "Manchester United",
        "fbref_id": "19538871"
      },
      "away_team": {
        "name": "Fulham",
        "fbref_id": "fd962109"
      },
      "score": {
        "home": 1,
        "away": 0
      },
      "lineups": {
        "home": {
          "starting_xi": [
            {
              "name": "Bruno Fernandes",
              "fbref_id": "507c7bdf",
              "position": "MF",
              "jersey_number": 18
            }
          ],
          "substitutes": [],
          "formation": "4-2-3-1"
        },
        "away": { ... }
      },
      "events": {
        "goals": [
          {
            "type": "goal",
            "player_name": "Bruno Fernandes",
            "player_id": "507c7bdf",
            "minute": 45,
            "team": "home"
          }
        ],
        "assists": [],
        "cards": [],
        "substitutions": []
      },
      "player_stats": {
        "home": [
          {
            "player_name": "Bruno Fernandes",
            "player_id": "507c7bdf",
            "minutes": 90,
            "goals": 1,
            "assists": 0,
            "shots": 3,
            "shots_on_target": 2,
            "passes": 45,
            "pass_accuracy": 88.9,
            "tackles": 2,
            "interceptions": 1,
            "fouls": 1,
            "cards": null
          }
        ],
        "away": [ ... ]
      },
      "team_stats": {
        "home": {
          "possession": 65.2,
          "shots": 15,
          "shots_on_target": 6,
          "passes": 450,
          "pass_accuracy": 88.5,
          "fouls": 12,
          "corners": 7
        },
        "away": { ... }
      },
      "match_info": {
        "attendance": 73500,
        "referee": "Michael Oliver",
        "venue": "Old Trafford"
      }
    }
  ],
  "players": {
    "507c7bdf": {
      "name": "Bruno Fernandes",
      "fbref_id": "507c7bdf",
      "position": "MF"
    }
  },
  "clubs": {
    "19538871": {
      "name": "Manchester United",
      "fbref_id": "19538871"
    }
  }
}
```

## PostgreSQL Migration

### Suggested Database Schema

```sql
-- Clubs table
CREATE TABLE clubs (
    id SERIAL PRIMARY KEY,
    fbref_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Players table
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    fbref_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Matches table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    match_id VARCHAR(50) UNIQUE NOT NULL,
    season VARCHAR(20) NOT NULL,
    date DATE,
    home_team_id INTEGER REFERENCES clubs(id),
    away_team_id INTEGER REFERENCES clubs(id),
    home_score INTEGER,
    away_score INTEGER,
    attendance INTEGER,
    referee VARCHAR(255),
    venue VARCHAR(255),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Lineups table
CREATE TABLE lineups (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id),
    team_id INTEGER REFERENCES clubs(id),
    player_id INTEGER REFERENCES players(id),
    is_starting BOOLEAN DEFAULT TRUE,
    position VARCHAR(10),
    jersey_number INTEGER,
    formation VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Match events table
CREATE TABLE match_events (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id),
    event_type VARCHAR(20) NOT NULL, -- 'goal', 'assist', 'card', 'substitution'
    player_id INTEGER REFERENCES players(id),
    minute INTEGER,
    team_id INTEGER REFERENCES clubs(id),
    card_type VARCHAR(10), -- 'yellow' or 'red' for cards
    created_at TIMESTAMP DEFAULT NOW()
);

-- Player match statistics table
CREATE TABLE player_match_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id),
    player_id INTEGER REFERENCES players(id),
    team_id INTEGER REFERENCES clubs(id),
    minutes INTEGER,
    goals INTEGER DEFAULT 0,
    assists INTEGER DEFAULT 0,
    shots INTEGER,
    shots_on_target INTEGER,
    passes INTEGER,
    pass_accuracy DECIMAL(5,2),
    tackles INTEGER,
    interceptions INTEGER,
    fouls INTEGER,
    cards VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(match_id, player_id)
);

-- Team match statistics table
CREATE TABLE team_match_stats (
    id SERIAL PRIMARY KEY,
    match_id INTEGER REFERENCES matches(id),
    team_id INTEGER REFERENCES clubs(id),
    possession DECIMAL(5,2),
    shots INTEGER,
    shots_on_target INTEGER,
    passes INTEGER,
    pass_accuracy DECIMAL(5,2),
    fouls INTEGER,
    corners INTEGER,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(match_id, team_id)
);
```

### Migration Script Example

```python
import json
import psycopg2
from psycopg2.extras import execute_values

# Load JSON data
with open('pl_data_2024_2025.json', 'r') as f:
    data = json.load(f)

# Connect to PostgreSQL
conn = psycopg2.connect(
    host="localhost",
    database="fantasy_football",
    user="your_user",
    password="your_password"
)
cur = conn.cursor()

# Insert clubs
for club_id, club_info in data['clubs'].items():
    cur.execute("""
        INSERT INTO clubs (fbref_id, name)
        VALUES (%s, %s)
        ON CONFLICT (fbref_id) DO UPDATE SET name = EXCLUDED.name
    """, (club_info['fbref_id'], club_info['name']))

# Insert players
for player_id, player_info in data['players'].items():
    cur.execute("""
        INSERT INTO players (fbref_id, name, position)
        VALUES (%s, %s, %s)
        ON CONFLICT (fbref_id) DO UPDATE SET name = EXCLUDED.name, position = EXCLUDED.position
    """, (player_info['fbref_id'], player_info['name'], player_info.get('position')))

# Insert matches
for match in data['matches']:
    # Get club IDs
    cur.execute("SELECT id FROM clubs WHERE fbref_id = %s", (match['home_team']['fbref_id'],))
    home_team_id = cur.fetchone()[0]
    
    cur.execute("SELECT id FROM clubs WHERE fbref_id = %s", (match['away_team']['fbref_id'],))
    away_team_id = cur.fetchone()[0]
    
    # Insert match
    cur.execute("""
        INSERT INTO matches (match_id, season, date, home_team_id, away_team_id, 
                           home_score, away_score, attendance, referee, venue)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        ON CONFLICT (match_id) DO UPDATE SET
            date = EXCLUDED.date,
            home_score = EXCLUDED.home_score,
            away_score = EXCLUDED.away_score
    """, (
        match['match_id'],
        data['season'],
        match.get('date'),
        home_team_id,
        away_team_id,
        match['score'].get('home'),
        match['score'].get('away'),
        match['match_info'].get('attendance'),
        match['match_info'].get('referee'),
        match['match_info'].get('venue')
    ))
    
    cur.execute("SELECT id FROM matches WHERE match_id = %s", (match['match_id'],))
    match_db_id = cur.fetchone()[0]
    
    # Insert lineups, events, stats, etc.
    # ... (similar pattern for other tables)

conn.commit()
cur.close()
conn.close()
```

## Performance Notes

- Full season scraping takes approximately 3-4 hours for ~380 matches
- Each match takes ~50-60 seconds (including delays)
- The scraper includes delays to avoid rate limiting
- Progress is logged to console and can be redirected to a file

## Future Enhancements

- Add more player attributes (age, nationality, height, weight)
- Extract formation and tactical data
- Add injury/suspension information
- Extract manager information
- Add weather conditions
- Extract xG (expected goals) data if available




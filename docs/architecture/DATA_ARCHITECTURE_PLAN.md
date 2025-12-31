# Data Architecture Plan: Scraped Match Data + FPL API

**Date**: 2025-12-21  
**Status**: Planning  
**Priority**: P0

---

## Overview

This document outlines the architecture for handling two distinct data sources:
1. **Scraped Match Data** (FBRef) - Historical match details, player stats, events
2. **Fantasy Football Data** (FPL API) - Real-time FPL data, prices, ownership, live scores

---

## Key Principles

### 1. **Data Source Separation**
- **Scraped Data**: Historical, detailed, infrequently updated
- **FPL API Data**: Real-time, frequently updated, FPL-specific

### 2. **Update Frequency Strategy**
- **Scraped Data**: Periodic ingestion (daily/weekly)
- **FPL API Data**: Real-time with intelligent caching

### 3. **ID Mapping & Synchronization**
- Map FBRef IDs → FPL IDs for cross-referencing
- Maintain separate identity systems with mapping layer

---

## Architecture Design

### **Three-Layer Data Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Layer                         │
│  (FastAPI Endpoints - Unified Interface)                    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Service Layer                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Match Data   │  │ FPL Data     │  │ ID Mapping  │     │
│  │ Service      │  │ Service      │  │ Service     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┴───────────────────┐
        ▼                                       ▼
┌───────────────────┐                  ┌───────────────────┐
│  PL Data DB       │                  │  FPL Cache        │
│  (PostgreSQL)     │                  │  (Redis)          │
│                   │                  │                    │
│  - Matches        │                  │  - Bootstrap       │
│  - Players        │                  │  - Live Scores    │
│  - Events         │                  │  - Player Prices   │
│  - Stats          │                  │  - Ownership      │
└───────────────────┘                  └───────────────────┘
        │                                       │
        └───────────────────┬───────────────────┘
                            ▼
                  ┌───────────────────┐
                  │  ID Mapping DB    │
                  │  (PostgreSQL)     │
                  │                    │
                  │  - FBRef ↔ FPL    │
                  │  - Team mappings  │
                  │  - Player mappings│
                  └───────────────────┘
```

---

## Data Sources & Update Strategy

### **1. Scraped Match Data (FBRef)**

**Characteristics:**
- Historical match details
- Player statistics per match
- Match events (goals, cards, substitutions)
- Team statistics
- Lineups and formations

**Update Frequency:**
- **During Season**: 
  - Match days: Every 2-4 hours (after matches finish)
  - Non-match days: Once daily
- **Off Season**: Weekly (for any late updates)

**Storage:**
- **Primary**: PostgreSQL (PL Data DB)
- **Cache**: Redis (1-24 hour TTL depending on data age)
- **Backup**: JSON files (for migration/recovery)

**Ingestion Method:**
- Scheduled Celery tasks
- Manual trigger via admin endpoint
- Batch processing for historical data

### **2. FPL API Data**

**Characteristics:**
- Real-time player prices
- Ownership percentages
- Live gameweek scores
- Fixture information
- Player form and stats (FPL-specific)

**Update Frequency:**
- **Bootstrap Data**: Every 1-2 hours (static data changes infrequently)
- **Live Scores**: Every 1-2 minutes during active gameweeks
- **Player Prices**: Every 15-30 minutes (price changes)
- **Player Summaries**: On-demand (when viewing player details)

**Storage:**
- **Primary**: Redis (with TTL based on data type)
- **Fallback**: PostgreSQL (for historical price tracking)
- **No Database**: Most FPL data is ephemeral and API-driven

**Caching Strategy:**
```python
# Cache TTLs by data type
CACHE_TTL = {
    'bootstrap': 3600,        # 1 hour
    'fixtures': 1800,         # 30 minutes
    'live_scores': 120,       # 2 minutes
    'player_price': 900,      # 15 minutes
    'player_summary': 1800,   # 30 minutes
    'team_picks': 300,        # 5 minutes
}
```

---

## Database Design

### **Database 1: User Data (Existing)**
- Users, authentication, preferences
- User FPL team links
- Notifications, subscriptions

### **Database 2: Premier League Data (New)**
```sql
-- Core Tables
teams
  - id (UUID)
  - fbref_id (string)
  - name (string)
  - logo_url (string)
  - created_at, updated_at

players
  - id (UUID)
  - fbref_id (string)
  - name (string)
  - position (string)
  - current_team_id (UUID, FK)
  - created_at, updated_at

matches
  - id (UUID)
  - season (string, e.g., "2024-2025")
  - matchday (integer)
  - date (date)
  - home_team_id (UUID, FK)
  - away_team_id (UUID, FK)
  - score_home (integer)
  - score_away (integer)
  - status (string: scheduled, live, finished)
  - venue (string)
  - referee (string)
  - attendance (integer)
  - created_at, updated_at

match_player_stats
  - id (UUID)
  - match_id (UUID, FK)
  - player_id (UUID, FK)
  - team_id (UUID, FK)
  - minutes (integer)
  - goals (integer)
  - assists (integer)
  - shots (integer)
  - shots_on_target (integer)
  - passes (integer)
  - pass_accuracy (decimal)
  - tackles (integer)
  - interceptions (integer)
  - fouls (integer)
  - cards (string: yellow, red, null)
  - ... (other stats)
  - created_at, updated_at

match_events
  - id (UUID)
  - match_id (UUID, FK)
  - event_type (string: goal, card, substitution, etc.)
  - minute (integer)
  - player_id (UUID, FK, nullable)
  - team_id (UUID, FK)
  - details (JSONB) -- flexible for different event types
  - created_at

lineups
  - id (UUID)
  - match_id (UUID, FK)
  - team_id (UUID, FK)
  - formation (string)
  - starting_xi (JSONB) -- array of player IDs with positions
  - substitutes (JSONB) -- array of player IDs
  - created_at, updated_at
```

### **Database 3: ID Mapping (New)**
```sql
id_mappings
  - id (UUID)
  - entity_type (string: team, player)
  - fbref_id (string)
  - fpl_id (integer, nullable) -- FPL team/player ID
  - name (string) -- normalized name for matching
  - confidence (decimal) -- matching confidence score
  - created_at, updated_at

-- Indexes
CREATE INDEX idx_id_mappings_fbref ON id_mappings(entity_type, fbref_id);
CREATE INDEX idx_id_mappings_fpl ON id_mappings(entity_type, fpl_id);
```

---

## Service Layer Design

### **1. Match Data Service**

**Responsibilities:**
- Query scraped match data
- Aggregate statistics
- Provide match details and history

**Methods:**
```python
class MatchDataService:
    async def get_match(match_id: UUID) -> Match
    async def get_player_matches(player_id: UUID, season: str) -> List[Match]
    async def get_team_matches(team_id: UUID, season: str) -> List[Match]
    async def get_player_stats(player_id: UUID, season: str) -> PlayerStats
    async def get_match_events(match_id: UUID) -> List[MatchEvent]
    async def search_matches(filters: MatchFilters) -> List[Match]
```

**Caching:**
- Redis cache with TTL based on match age
- Older matches: 24 hour TTL
- Recent matches: 1 hour TTL
- Live matches: 5 minute TTL

### **2. FPL Data Service**

**Responsibilities:**
- Fetch and cache FPL API data
- Manage cache invalidation
- Provide real-time FPL data

**Methods:**
```python
class FPLDataService:
    async def get_bootstrap() -> BootstrapData
    async def get_live_scores(gameweek: int) -> LiveScores
    async def get_player_price(player_id: int) -> float
    async def get_player_summary(player_id: int) -> PlayerSummary
    async def get_fixtures(gameweek: Optional[int]) -> List[Fixture]
    async def get_user_team(team_id: int) -> UserTeam
```

**Caching:**
- All methods check Redis first
- Cache-aside pattern
- Automatic TTL based on data type

### **3. ID Mapping Service**

**Responsibilities:**
- Map between FBRef IDs and FPL IDs
- Fuzzy matching for name-based lookups
- Maintain mapping confidence scores

**Methods:**
```python
class IDMappingService:
    async def get_fpl_id_from_fbref(entity_type: str, fbref_id: str) -> Optional[int]
    async def get_fbref_id_from_fpl(entity_type: str, fpl_id: int) -> Optional[str]
    async def create_mapping(entity_type: str, fbref_id: str, fpl_id: int, confidence: float)
    async def search_by_name(entity_type: str, name: str) -> List[Mapping]
```

---

## Data Ingestion Pipeline

### **Scraped Data Ingestion**

```
┌─────────────┐
│  Scheduler  │ (Celery Beat)
│  (Daily)    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Scraper    │ (FBRef Scraper)
│  Task       │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Parser     │ (Parse JSON)
│  & Validate │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  ID Mapping │ (Match FBRef → FPL)
│  Service    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │ (PostgreSQL)
│  Insert     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Cache      │ (Invalidate/Update)
│  Update     │
└─────────────┘
```

### **FPL API Data Ingestion**

```
┌─────────────┐
│  API Call   │ (FPL Service)
│  Request    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Cache      │ (Check Redis)
│  Check      │
└──────┬──────┘
       │
   ┌───┴───┐
   │      │
   ▼      ▼ (Cache Miss)
┌─────┐ ┌─────────────┐
│Return│ │  FPL API   │
│Cache │ │  Fetch     │
└─────┘ └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │  Transform  │
         │  & Store    │
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │  Redis      │ (Set with TTL)
         │  Cache      │
         └──────┬──────┘
                │
                ▼
         ┌─────────────┐
         │  Return     │
         │  Data       │
         └─────────────┘
```

---

## API Endpoint Design

### **Unified Endpoints (Application Layer)**

```python
# Match Data Endpoints
GET /api/matches/{match_id}
GET /api/matches?season=2024-2025&team_id={team_id}
GET /api/players/{player_id}/matches?season=2024-2025
GET /api/players/{player_id}/stats?season=2024-2025
GET /api/matches/{match_id}/events
GET /api/matches/{match_id}/lineups

# FPL Data Endpoints (Existing, enhanced)
GET /api/fpl/bootstrap
GET /api/fpl/live/{gameweek}
GET /api/fpl/player/{player_id}
GET /api/fpl/player/{player_id}/price-history
GET /api/fpl/fixtures?gameweek={gw}

# Combined/Enriched Endpoints
GET /api/players/{player_id}/enriched
  # Returns: FPL data + Match stats + Price history
GET /api/matches/{match_id}/enriched
  # Returns: Match details + FPL fixture data + Live scores
```

---

## Caching Strategy

### **Multi-Layer Caching**

```
Request
  │
  ▼
┌─────────────────┐
│  Application     │ (In-memory cache for hot data)
│  Memory Cache    │ (5-10 min TTL)
└────────┬────────┘
         │ (Cache Miss)
         ▼
┌─────────────────┐
│  Redis Cache    │ (Primary cache layer)
│  - FPL Data     │ (1 min - 1 hour TTL)
│  - Match Data   │ (1 hour - 24 hour TTL)
└────────┬────────┘
         │ (Cache Miss)
         ▼
┌─────────────────┐
│  Database       │ (PostgreSQL)
│  - Match Data   │
│  - ID Mappings  │
└────────┬────────┘
         │ (For FPL: External API)
         ▼
┌─────────────────┐
│  External API   │ (FPL API)
└─────────────────┘
```

### **Cache Keys**

```python
# Match Data
f"match:{match_id}"
f"player:{player_id}:matches:{season}"
f"team:{team_id}:matches:{season}"
f"player:{player_id}:stats:{season}"

# FPL Data
f"fpl:bootstrap"
f"fpl:live:{gameweek}"
f"fpl:player:{player_id}:summary"
f"fpl:player:{player_id}:price"
f"fpl:fixtures:{gameweek}"

# ID Mappings
f"mapping:team:fbref:{fbref_id}"
f"mapping:player:fbref:{fbref_id}"
f"mapping:team:fpl:{fpl_id}"
f"mapping:player:fpl:{fpl_id}"
```

---

## Data Synchronization

### **ID Mapping Strategy**

**Initial Mapping:**
1. Scrape team names from FBRef
2. Match against FPL team names (fuzzy matching)
3. Store mappings with confidence scores
4. Manual review for low-confidence matches

**Player Mapping:**
1. Use team mappings to narrow search
2. Match by name + position + team
3. Store with confidence scores
4. Update as new players are discovered

**Ongoing Updates:**
- New players: Auto-map on first scrape
- Transfers: Update team_id in players table
- Low confidence: Flag for manual review

---

## Implementation Phases

### **Phase 1: Foundation (Week 1-2)**
- [ ] Set up PL Data database
- [ ] Create database schema
- [ ] Set up ID Mapping database
- [ ] Create base models (SQLModel)
- [ ] Migrate existing JSON data

### **Phase 2: Services (Week 2-3)**
- [ ] Implement MatchDataService
- [ ] Implement FPLDataService (enhance existing)
- [ ] Implement IDMappingService
- [ ] Set up Redis caching layer
- [ ] Create cache utilities

### **Phase 3: Ingestion (Week 3-4)**
- [ ] Set up Celery + Redis
- [ ] Create scraper ingestion task
- [ ] Create FPL API refresh tasks
- [ ] Implement scheduled jobs
- [ ] Add error handling and retries

### **Phase 4: API Layer (Week 4-5)**
- [ ] Create match data endpoints
- [ ] Enhance FPL endpoints
- [ ] Create enriched/combined endpoints
- [ ] Add caching middleware
- [ ] Performance optimization

### **Phase 5: Integration (Week 5-6)**
- [ ] Frontend integration
- [ ] Update existing components
- [ ] Testing and validation
- [ ] Monitoring and logging
- [ ] Documentation

---

## Benefits

✅ **Separation of Concerns** - Scraped data vs FPL API data  
✅ **Optimal Caching** - Different strategies for different data types  
✅ **Scalability** - Independent scaling of data sources  
✅ **Performance** - Fast access to both historical and real-time data  
✅ **Flexibility** - Easy to add new data sources  
✅ **Maintainability** - Clear boundaries and responsibilities  

---

## Technology Stack

- **API**: FastAPI (Python)
- **Databases**: PostgreSQL (User DB, PL Data DB, ID Mapping DB)
- **Cache**: Redis
- **Task Queue**: Celery + Redis
- **ORM**: SQLModel
- **Scraping**: Playwright/Selenium (existing)
- **FPL API**: httpx (async HTTP client)

---

## Next Steps

1. ✅ Review and approve this architecture
2. 📋 Design detailed database schemas
3. 🔧 Set up development environment
4. 🚀 Begin Phase 1 implementation

---

**Status**: ✅ Ready for Review and Approval





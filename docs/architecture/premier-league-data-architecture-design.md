# Premier League Data Architecture - Detailed Design
**Date**: 2025-12-21  
**Status**: Design  
**Priority**: P0

---

## Architecture Overview

This document provides detailed design for a scalable Premier League data system with separate database, automated ingestion, and ID mapping.

---

## Recommended Architecture: Modular Monolith → Microservices

### Phase 1: Modular Monolith (Initial Implementation)

**Rationale**: Start simple, extract to microservices when scale requires it.

```
┌─────────────────────────────────────────────────────────┐
│              FastAPI Application                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │              API Layer                           │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │  │
│  │  │ /api/auth│  │/api/fpl  │  │/api/football │  │  │
│  │  │          │  │          │  │              │  │  │
│  │  │          │  │          │  │  /matches    │  │  │
│  │  │          │  │          │  │  /players    │  │  │
│  │  │          │  │          │  │  /teams      │  │  │
│  │  │          │  │          │  │  /stats      │  │  │
│  │  └──────────┘  └──────────┘  └──────────────┘  │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │            Service Layer                         │  │
│  │  ┌────────────┐  ┌────────────┐  ┌───────────┐ │  │
│  │  │   User     │  │    PL      │  │  Ingestion│ │  │
│  │  │  Service   │  │   Service  │  │  Service  │ │  │
│  │  └────────────┘  └────────────┘  └───────────┘ │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │          Data Access Layer                       │  │
│  │  ┌────────────┐  ┌────────────┐                 │  │
│  │  │ User DB    │  │   PL DB    │                 │  │
│  │  │ Repository │  │ Repository │                 │  │
│  │  └────────────┘  └────────────┘                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
  ┌──────────────┐        ┌──────────────┐
  │   User DB    │        │    PL DB     │
  │ (PostgreSQL) │        │ (PostgreSQL) │
  └──────────────┘        └──────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │    Redis     │
                          │ (Cache + Q)  │
                          └──────────────┘
                                  │
                                  ▼
                          ┌──────────────┐
                          │   Celery     │
                          │   Workers    │
                          │  (Ingestion) │
                          └──────────────┘
```

### Phase 2: Microservices (When Scale Requires)

Extract services when:
- Different scaling requirements
- Independent deployment needs
- Team size grows
- Performance bottlenecks

---

## Database Design

### Database Connection Strategy

**Separate Database Connections**:
```python
# backend/app/core/database.py (existing - User DB)
user_engine = create_engine(USER_DATABASE_URL)

# backend/app/core/pl_database.py (new - PL DB)
pl_engine = create_engine(PL_DATABASE_URL)
```

**Environment Variables**:
```bash
# User Database (existing)
DATABASE_URL=postgresql://user:pass@host/user_db

# Premier League Database (new)
PL_DATABASE_URL=postgresql://user:pass@host/pl_db
```

### Schema Design

#### 1. Teams Table
```sql
CREATE TABLE teams (
    id SERIAL PRIMARY KEY,
    internal_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    short_name VARCHAR(50),
    fbref_id VARCHAR(50) UNIQUE NOT NULL,
    logo_url VARCHAR(500),
    founded_year INT,
    stadium VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teams_fbref ON teams(fbref_id);
CREATE INDEX idx_teams_internal ON teams(internal_id);
CREATE INDEX idx_teams_name ON teams(name);
```

#### 2. Players Table
```sql
CREATE TABLE players (
    id SERIAL PRIMARY KEY,
    internal_id UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    fbref_id VARCHAR(50) UNIQUE NOT NULL,
    team_id INT REFERENCES teams(id),
    position VARCHAR(10),  -- GK, DEF, MID, FWD
    nationality VARCHAR(100),
    birth_date DATE,
    photo_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_players_fbref ON players(fbref_id);
CREATE INDEX idx_players_internal ON players(internal_id);
CREATE INDEX idx_players_team ON players(team_id);
```

#### 3. Matches Table
```sql
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    internal_id VARCHAR(50) UNIQUE NOT NULL,  -- e.g., "2025-2026_1"
    season VARCHAR(20) NOT NULL,  -- e.g., "2025-2026"
    matchday INT NOT NULL,
    competition VARCHAR(100) DEFAULT 'Premier League',
    home_team_id INT NOT NULL REFERENCES teams(id),
    away_team_id INT NOT NULL REFERENCES teams(id),
    home_score INT,
    away_score INT,
    match_date TIMESTAMP,
    status VARCHAR(20) DEFAULT 'scheduled',  -- scheduled, live, finished, postponed
    venue VARCHAR(255),
    attendance INT,
    referee VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_matches_season ON matches(season);
CREATE INDEX idx_matches_matchday ON matches(season, matchday);
CREATE INDEX idx_matches_date ON matches(match_date);
CREATE INDEX idx_matches_teams ON matches(home_team_id, away_team_id);
CREATE INDEX idx_matches_internal ON matches(internal_id);
```

#### 4. Match Player Stats Table
```sql
CREATE TABLE match_player_stats (
    id SERIAL PRIMARY KEY,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    player_id INT NOT NULL REFERENCES players(id),
    team_id INT NOT NULL REFERENCES teams(id),
    is_home BOOLEAN NOT NULL,
    
    -- Playing Time
    minutes INT DEFAULT 0,
    
    -- Performance
    goals INT DEFAULT 0,
    assists INT DEFAULT 0,
    shots INT DEFAULT 0,
    shots_on_target INT DEFAULT 0,
    
    -- Passing
    passes INT DEFAULT 0,
    pass_accuracy DECIMAL(5,2),
    key_passes INT DEFAULT 0,
    
    -- Defense
    tackles INT DEFAULT 0,
    interceptions INT DEFAULT 0,
    clearances INT DEFAULT 0,
    
    -- Discipline
    fouls INT DEFAULT 0,
    yellow_cards INT DEFAULT 0,
    red_cards INT DEFAULT 0,
    
    -- Advanced (stored as JSON for flexibility)
    advanced_stats JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(match_id, player_id)
);

CREATE INDEX idx_match_stats_match ON match_player_stats(match_id);
CREATE INDEX idx_match_stats_player ON match_player_stats(player_id);
CREATE INDEX idx_match_stats_team ON match_player_stats(team_id);
```

#### 5. Match Events Table
```sql
CREATE TABLE match_events (
    id SERIAL PRIMARY KEY,
    match_id INT NOT NULL REFERENCES matches(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,  -- goal, assist, card, substitution
    minute INT NOT NULL,
    player_id INT REFERENCES players(id),
    team_id INT NOT NULL REFERENCES teams(id),
    related_player_id INT REFERENCES players(id),  -- For assists, substitutions
    details JSONB,  -- Flexible event data
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_events_match ON match_events(match_id);
CREATE INDEX idx_events_type ON match_events(event_type);
CREATE INDEX idx_events_player ON match_events(player_id);
```

#### 6. ID Mappings Table
```sql
CREATE TABLE id_mappings (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL,  -- team, player, match
    fbref_id VARCHAR(100) NOT NULL,
    internal_id VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(entity_type, fbref_id)
);

CREATE INDEX idx_mappings_fbref ON id_mappings(entity_type, fbref_id);
CREATE INDEX idx_mappings_internal ON id_mappings(entity_type, internal_id);
```

---

## ID Mapping Strategy

### Internal ID Format

**Teams**:
- Format: `fotmate_team_{UUID}`
- Example: `fotmate_team_550e8400-e29b-41d4-a716-446655440000`
- Storage: UUID column

**Players**:
- Format: `fotmate_player_{UUID}`
- Example: `fotmate_player_550e8400-e29b-41d4-a716-446655440001`
- Storage: UUID column

**Matches**:
- Format: `{season}_{matchday}_{sequential}`
- Example: `2025-2026_1_001`
- Storage: VARCHAR (structured string)

### ID Mapping Service

```python
class IDMappingService:
    """Service for mapping FBRef IDs to internal IDs"""
    
    def get_internal_id(self, entity_type: str, fbref_id: str) -> str:
        """Get internal ID from FBRef ID"""
        mapping = self.get_mapping(entity_type, fbref_id)
        if mapping:
            return mapping.internal_id
        return None
    
    def get_fbref_id(self, entity_type: str, internal_id: str) -> str:
        """Get FBRef ID from internal ID"""
        mapping = self.get_mapping_by_internal(entity_type, internal_id)
        if mapping:
            return mapping.fbref_id
        return None
    
    def create_mapping(self, entity_type: str, fbref_id: str, internal_id: str):
        """Create new ID mapping"""
        # Upsert mapping
        pass
```

### Caching Strategy

**Redis Cache for ID Mappings**:
- Key: `mapping:{entity_type}:{fbref_id}`
- Value: `{internal_id}`
- TTL: 24 hours (mappings don't change)
- Cache-aside pattern

---

## Ingestion System Design

### Celery Task Structure

```python
# backend/app/tasks/ingestion_tasks.py

from celery import Celery
from app.core.config import settings

celery_app = Celery(
    "fotmate_ingestion",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL
)

@celery_app.task(name="ingest.match_data")
def ingest_match_data(match_id: str, season: str):
    """Ingest match data from FBRef"""
    # 1. Scrape FBRef
    # 2. Map IDs
    # 3. Transform data
    # 4. Store in database
    # 5. Invalidate cache
    pass

@celery_app.task(name="ingest.daily_update")
def daily_update():
    """Daily scheduled update"""
    # Fetch all recent matches
    # Queue ingestion tasks
    pass

@celery_app.task(name="ingest.realtime_update")
def realtime_update():
    """Real-time update during match days"""
    # Check for live matches
    # Queue ingestion tasks
    pass
```

### Scheduled Jobs

**Using Celery Beat**:
```python
# backend/app/core/celery_config.py

from celery.schedules import crontab

celery_app.conf.beat_schedule = {
    # During match days: every 15 minutes
    'realtime-updates': {
        'task': 'ingest.realtime_update',
        'schedule': crontab(minute='*/15'),
    },
    # Daily: at 2am and 8am
    'daily-updates': {
        'task': 'ingest.daily_update',
        'schedule': crontab(hour='2,8', minute=0),
    },
}
```

### Error Handling

- **Retry Logic**: Exponential backoff (3 attempts)
- **Dead Letter Queue**: Failed tasks after max retries
- **Alerting**: Notify on persistent failures
- **Logging**: Comprehensive error logging

---

## API Service Design

### PL Data API Endpoints

```python
# backend/app/api/pl_data.py

@router.get("/matches")
async def get_matches(
    season: Optional[str] = None,
    team_id: Optional[int] = None,
    limit: int = 50
):
    """Get matches with filtering"""
    pass

@router.get("/matches/{match_id}")
async def get_match_details(match_id: str):
    """Get detailed match data"""
    pass

@router.get("/players/{player_id}/stats")
async def get_player_stats(
    player_id: str,
    season: Optional[str] = None
):
    """Get player statistics"""
    pass

@router.get("/teams/{team_id}/matches")
async def get_team_matches(team_id: int, season: Optional[str] = None):
    """Get team matches"""
    pass
```

### Caching Strategy

**Cache Layers**:
1. **Endpoint-level caching**: FastAPI caching decorator
2. **Service-level caching**: Redis cache in service layer
3. **Database query caching**: Materialized views for common queries

**Cache Keys**:
- `match:{match_id}`
- `player:{player_id}:stats:{season}`
- `team:{team_id}:matches:{season}`

**Cache TTL**:
- Recent matches (last 7 days): 5 minutes
- Historical matches: 1 hour
- Player stats: 15 minutes

---

## Data Flow

### Ingestion Flow

```
1. Scheduled Job Triggered
   ↓
2. Scrape FBRef (Playwright/Selenium)
   ↓
3. Parse JSON Data
   ↓
4. ID Mapping
   ├─ Check if FBRef ID exists in mapping table
   ├─ Create internal ID if new
   └─ Store mapping
   ↓
5. Transform Data
   ├─ Convert FBRef structure to internal schema
   ├─ Map all FBRef IDs to internal IDs
   └─ Validate data
   ↓
6. Database Operations
   ├─ Upsert teams
   ├─ Upsert players
   ├─ Upsert matches
   ├─ Upsert player stats
   └─ Upsert events
   ↓
7. Cache Invalidation
   ├─ Clear Redis cache for updated matches
   └─ Update cache with new data
   ↓
8. Logging & Monitoring
   └─ Log success/failure, update metrics
```

### API Request Flow

```
1. API Request Received
   ↓
2. Check Cache (Redis)
   ├─ Cache Hit → Return cached data
   └─ Cache Miss → Continue
   ↓
3. Database Query
   ├─ Translate external IDs to internal IDs
   └─ Query PL database
   ↓
4. Transform Response
   ├─ Map internal IDs back to external IDs (if needed)
   └─ Format response
   ↓
5. Cache Result
   └─ Store in Redis
   ↓
6. Return Response
```

---

## Implementation Plan

### Phase 1: Database Setup (Week 1)

1. **Create PL Database**
   - Set up PostgreSQL database
   - Create schema
   - Set up migrations (Alembic)

2. **ID Mapping System**
   - Create ID mapping service
   - Implement caching layer
   - Add mapping endpoints

3. **Data Migration**
   - Migrate existing JSON data
   - Create ID mappings
   - Validate data integrity

### Phase 2: Ingestion System (Week 2)

1. **Celery Setup**
   - Install Celery + Redis
   - Configure Celery Beat
   - Set up worker processes

2. **Ingestion Service**
   - Integrate existing scraper
   - Create ingestion tasks
   - Add error handling

3. **Scheduling**
   - Configure scheduled jobs
   - Set up monitoring
   - Test ingestion flow

### Phase 3: API Service (Week 3)

1. **PL Data API**
   - Create API endpoints
   - Implement ID translation
   - Add caching layer

2. **Integration**
   - Update existing endpoints
   - Add PL data endpoints
   - Test API responses

### Phase 4: Frontend Integration (Week 4)

1. **Update Frontend**
   - Update API calls to use PL endpoints
   - Handle new data structure
   - Update UI components

2. **Testing**
   - End-to-end testing
   - Performance testing
   - Error handling testing

---

## Scaling Considerations

### Database Scaling

**Read Replicas**:
- Primary: Write operations
- Replicas: Read operations
- Automatic failover

**Partitioning**:
- Partition matches by season
- Improve query performance
- Easier archival

**Indexing**:
- Strategic indexes on frequently queried columns
- Composite indexes for common query patterns
- Regular index maintenance

### Application Scaling

**Horizontal Scaling**:
- Multiple API instances (load balanced)
- Multiple Celery workers
- Auto-scaling based on metrics

**Vertical Scaling**:
- Larger database instances
- More CPU/memory for workers

### Caching Optimization

**Multi-level Caching**:
1. Application cache (in-memory)
2. Redis cache (distributed)
3. CDN cache (edge)

**Cache Warming**:
- Pre-populate cache with popular data
- Scheduled cache refresh

---

## Monitoring & Observability

### Metrics

- Ingestion success/failure rates
- Database query performance
- Cache hit rates
- API response times
- Worker queue depth

### Logging

- Structured logging (JSON)
- Log aggregation (ELK stack or similar)
- Error tracking (Sentry)

### Alerts

- Ingestion failures
- Database connection issues
- High error rates
- Performance degradation
- Queue backlog

---

## Security

### Database Security

- Encrypted connections (SSL/TLS)
- Connection pooling
- Prepared statements (SQL injection prevention)
- Least privilege access

### API Security

- Authentication/authorization
- Rate limiting
- Input validation
- SQL injection prevention

### FBRef Compliance

- Respect robots.txt
- Rate limiting
- User-agent identification
- Error handling

---

**Status**: 📐 Design Complete  
**Next**: Implementation planning and development





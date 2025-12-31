# Premier League Data Architecture - Requirements & Design
**Date**: 2025-12-21  
**Status**: Planning  
**Priority**: P0 (Critical for scalability)

---

## Executive Summary

**Goal**: Create a scalable, maintainable architecture for storing and managing Premier League match data, separate from user/FPL data, with automated ingestion from FBRef.

**Key Requirements**:
1. Separate database for PL data (independent from user/FPL database)
2. Automated FBRef scraping multiple times per day
3. ID mapping system (FBRef IDs → Internal IDs)
4. Scalable multi-service architecture
5. Real-time data updates
6. High availability and performance

---

## Current State

### Existing Data
- **Location**: `backend/data/2025-2026/` (JSON files)
- **Structure**: Match data with player stats, teams, events, lineups
- **FBRef IDs**: Already present in data (team `fbref_id`, player `player_id`)
- **Scraping**: `backend/scripts/scrape_fbref_comprehensive.py` exists

### Current Database
- **Type**: PostgreSQL (production) / SQLite (dev)
- **Contains**: Users, PushSubscriptions, NotificationLogs
- **Models**: SQLModel-based (User, PushSubscription, NotificationLog)

### Data Structure Example
```json
{
  "match_id": "2025-2026_1",
  "home_team": {
    "name": "Liverpool",
    "fbref_id": "822bd0ba"
  },
  "player_stats": {
    "home": [{
      "player_name": "Hugo Ekitike",
      "player_id": "5b92d896",  // FBRef ID
      "minutes": 71,
      "goals": 1,
      "assists": 1,
      // ... more stats
    }]
  }
}
```

---

## Requirements

### 1. Separate Database for PL Data

**Requirement**: Create independent database for Premier League match data

**Rationale**:
- Different data lifecycle (historical vs transactional)
- Different access patterns (read-heavy vs write-heavy)
- Different scaling requirements
- Data isolation and backup strategies
- Allows independent optimization

**Database Options**:
1. **PostgreSQL** (Recommended)
   - Proven for structured data
   - Excellent JSON support
   - Time-series extensions available
   - Strong indexing capabilities

2. **TimescaleDB** (Alternative)
   - PostgreSQL extension
   - Optimized for time-series data
   - Great for match statistics over time

3. **MongoDB** (Alternative)
   - Document-based (matches existing JSON structure)
   - Flexible schema
   - Good for nested data

**Recommendation**: **PostgreSQL** (consistency with existing stack)

---

### 2. FBRef Data Ingestion System

**Requirement**: Automated scraping system that runs multiple times per day

**Frequency**:
- **During Match Days**: Every 15-30 minutes (real-time updates)
- **After Match Days**: Every 1-2 hours (final data)
- **Off Days**: 2-3 times per day (check for corrections/updates)

**Features**:
- Scheduled jobs (cron-like or task queue)
- Error handling and retry logic
- Rate limiting (respect FBRef's limits)
- Change detection (only update if data changed)
- Logging and monitoring
- Idempotent operations

**Technology Options**:
1. **Celery + Redis** (Recommended)
   - Task queue for scheduled jobs
   - Retry logic built-in
   - Scalable worker pool

2. **APScheduler** (Simple)
   - In-process scheduler
   - Good for single-instance deployments

3. **Cron Jobs** (Traditional)
   - Simple but less flexible
   - External dependency

**Recommendation**: **Celery + Redis** (scalable, production-ready)

---

### 3. ID Mapping System

**Requirement**: Map FBRef IDs to internal ID structure

**FBRef IDs** (Current):
- Teams: `fbref_id` (e.g., `"822bd0ba"`)
- Players: `player_id` (e.g., `"5b92d896"`)
- Matches: `match_id` (e.g., `"2025-2026_1"`)

**Internal ID Structure** (To Design):
- Teams: `pl_team_<internal_id>` (integer or UUID)
- Players: `pl_player_<internal_id>` (integer or UUID)
- Matches: `pl_match_<season>_<matchday>_<id>` (structured string)

**Mapping Strategy**:
1. **Mapping Table** (Recommended)
   - Store FBRef ID → Internal ID mappings
   - Lookup table for both directions
   - Cache frequently accessed mappings

2. **Embedded Mappings**
   - Store both IDs in same table
   - Simpler queries
   - More storage

**Implementation**:
- `id_mappings` table with `external_source`, `external_id`, `internal_id`
- Indexes on both external_id and internal_id
- Caching layer (Redis) for hot lookups

---

### 4. Multi-Service Architecture

**Requirement**: Scalable architecture supporting multiple services and databases

**Architecture Patterns**:

#### Pattern 1: Microservices (Recommended for Scale)
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   API GW    │────▶│  User Svc   │
│  (Next.js)  │     │  (FastAPI)  │     │  (FastAPI)  │
└─────────────┘     └─────────────┘     └─────────────┘
                             │                  │
                             │                  ▼
                             │           ┌──────────────┐
                             │           │ User DB      │
                             │           │ (PostgreSQL) │
                             │           └──────────────┘
                             │
                             ├─────────────────┐
                             │                 │
                             ▼                 ▼
                    ┌──────────────┐  ┌──────────────┐
                    │   PL Data    │  │  Ingestion   │
                    │   Service    │  │   Service    │
                    │  (FastAPI)   │  │  (Celery)    │
                    └──────────────┘  └──────────────┘
                             │                 │
                             ▼                 ▼
                    ┌──────────────┐  ┌──────────────┐
                    │   PL DB      │  │    Redis     │
                    │ (PostgreSQL) │  │  (Task Queue)│
                    └──────────────┘  └──────────────┘
```

**Services**:
1. **API Gateway** - Routes requests to appropriate service
2. **User Service** - Handles auth, user data, FPL integration
3. **PL Data Service** - Serves match data, stats, fixtures
4. **Ingestion Service** - Scrapes FBRef and updates PL DB

**Benefits**:
- Independent scaling
- Technology diversity (can use different stacks)
- Fault isolation
- Team autonomy

**Challenges**:
- More complexity
- Network latency
- Distributed transactions
- Service discovery

#### Pattern 2: Modular Monolith (Recommended for Start)
```
┌─────────────────────────────────────────┐
│         FastAPI Application             │
│  ┌──────────┐  ┌──────────┐  ┌───────┐ │
│  │  User    │  │   PL     │  │Ingest │ │
│  │  Module  │  │   Module │  │Module │ │
│  └──────────┘  └──────────┘  └───────┘ │
└─────────────────────────────────────────┘
         │                  │
         ▼                  ▼
  ┌──────────┐      ┌──────────┐
  │ User DB  │      │   PL DB  │
  │(Postgres)│      │(Postgres)│
  └──────────┘      └──────────┘
```

**Benefits**:
- Simpler to start
- Easier debugging
- Shared code/libraries
- Lower infrastructure costs

**Migration Path**: Start with modular monolith → Extract to microservices when needed

**Recommendation**: **Start with Modular Monolith** → **Migrate to Microservices** when scale requires it

---

### 5. Database Schema Design

#### PL Database Schema

**Tables**:

1. **teams**
   ```sql
   id SERIAL PRIMARY KEY
   internal_id UUID UNIQUE  -- Internal ID (fotmate_team_xxx)
   name VARCHAR NOT NULL
   short_name VARCHAR
   fbref_id VARCHAR UNIQUE  -- FBRef team ID
   created_at TIMESTAMP
   updated_at TIMESTAMP
   ```

2. **players**
   ```sql
   id SERIAL PRIMARY KEY
   internal_id UUID UNIQUE  -- Internal ID (fotmate_player_xxx)
   name VARCHAR NOT NULL
   fbref_id VARCHAR UNIQUE  -- FBRef player ID
   team_id INT REFERENCES teams(id)
   position VARCHAR
   created_at TIMESTAMP
   updated_at TIMESTAMP
   ```

3. **matches**
   ```sql
   id SERIAL PRIMARY KEY
   internal_id VARCHAR UNIQUE  -- e.g., "2025-2026_1"
   season VARCHAR NOT NULL  -- e.g., "2025-2026"
   matchday INT
   competition VARCHAR
   home_team_id INT REFERENCES teams(id)
   away_team_id INT REFERENCES teams(id)
   home_score INT
   away_score INT
   match_date TIMESTAMP
   status VARCHAR  -- scheduled, live, finished
   created_at TIMESTAMP
   updated_at TIMESTAMP
   ```

4. **match_player_stats**
   ```sql
   id SERIAL PRIMARY KEY
   match_id INT REFERENCES matches(id)
   player_id INT REFERENCES players(id)
   team_id INT REFERENCES teams(id)
   is_home BOOLEAN
   
   -- Stats
   minutes INT
   goals INT DEFAULT 0
   assists INT DEFAULT 0
   shots INT
   shots_on_target INT
   passes INT
   pass_accuracy DECIMAL
   tackles INT
   interceptions INT
   fouls INT
   cards VARCHAR  -- yellow, red, null
   
   created_at TIMESTAMP
   updated_at TIMESTAMP
   
   UNIQUE(match_id, player_id)  -- One stat row per player per match
   ```

5. **match_events**
   ```sql
   id SERIAL PRIMARY KEY
   match_id INT REFERENCES matches(id)
   event_type VARCHAR  -- goal, assist, card, substitution
   minute INT
   player_id INT REFERENCES players(id)
   team_id INT REFERENCES teams(id)
   details JSONB  -- Flexible event data
   created_at TIMESTAMP
   ```

6. **id_mappings** (FBRef → Internal)
   ```sql
   id SERIAL PRIMARY KEY
   entity_type VARCHAR  -- team, player, match
   fbref_id VARCHAR NOT NULL
   internal_id VARCHAR NOT NULL
   created_at TIMESTAMP
   
   UNIQUE(entity_type, fbref_id)
   INDEX idx_fbref (entity_type, fbref_id)
   INDEX idx_internal (entity_type, internal_id)
   ```

---

### 6. Data Ingestion Flow

**Process**:

1. **Scrape FBRef** (Scheduled Job)
   - Fetch match data from FBRef
   - Parse and normalize data
   - Extract FBRef IDs

2. **ID Mapping** (Ingestion Service)
   - Check if FBRef IDs exist in mapping table
   - Create internal IDs for new entities
   - Store mappings

3. **Data Transformation**
   - Convert FBRef structure to internal schema
   - Map FBRef IDs to internal IDs
   - Validate data

4. **Database Update**
   - Upsert teams/players (if new)
   - Upsert matches (create or update)
   - Upsert player stats (update if changed)
   - Upsert events

5. **Cache Invalidation**
   - Clear Redis cache for updated matches
   - Notify API services of updates

---

## Scalability Considerations

### Database Scaling

**Read Scaling**:
- **Read Replicas**: Multiple read-only replicas for PL data
- **Caching Layer**: Redis cache for frequently accessed data
- **CDN**: Cache static match data at edge

**Write Scaling**:
- **Sharding**: Partition matches by season or date range
- **Batch Writes**: Batch insert/update operations
- **Async Writes**: Queue write operations during high load

### Service Scaling

**Horizontal Scaling**:
- Multiple API service instances (load balanced)
- Multiple ingestion workers (Celery)
- Auto-scaling based on load

**Vertical Scaling**:
- Larger database instances
- More CPU/memory for workers

### Caching Strategy

**Cache Layers**:
1. **Application Cache** (Redis)
   - Recent matches (last 30 days)
   - Popular players/teams
   - ID mappings

2. **CDN Cache** (Cloudflare/Vercel)
   - Static match data
   - Historical data

3. **Database Query Cache**
   - Frequently accessed queries
   - Materialized views

---

## Technology Stack Recommendations

### Option A: Current Stack Extension (Recommended)
- **API**: FastAPI (existing)
- **Database**: PostgreSQL (existing)
- **Task Queue**: Celery + Redis
- **Cache**: Redis
- **ORM**: SQLModel (existing)

**Pros**:
- Consistency with existing code
- Team familiarity
- Lower learning curve

### Option B: Microservices Stack
- **API Gateway**: Kong / Traefik
- **Services**: FastAPI (Python)
- **Database**: PostgreSQL + TimescaleDB
- **Task Queue**: Celery + Redis
- **Cache**: Redis
- **Message Queue**: RabbitMQ (optional)

**Pros**:
- Better separation of concerns
- Independent scaling
- Technology flexibility

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Set up separate PL database
- [ ] Create database schema
- [ ] Implement ID mapping system
- [ ] Migrate existing JSON data to database

### Phase 2: Ingestion System (Week 2-3)
- [ ] Set up Celery + Redis
- [ ] Create ingestion service
- [ ] Implement FBRef scraper integration
- [ ] Add scheduled jobs
- [ ] Error handling and logging

### Phase 3: API Service (Week 3-4)
- [ ] Create PL Data API endpoints
- [ ] Implement ID translation layer
- [ ] Add caching layer
- [ ] Performance optimization

### Phase 4: Integration (Week 4-5)
- [ ] Integrate PL Data API with frontend
- [ ] Update existing endpoints to use PL DB
- [ ] Testing and validation
- [ ] Monitoring and alerts

### Phase 5: Optimization (Ongoing)
- [ ] Performance tuning
- [ ] Caching optimization
- [ ] Database indexing
- [ ] Scaling improvements

---

## Migration Strategy

### Data Migration
1. **Export existing JSON data**
2. **Transform to database schema**
3. **Create ID mappings**
4. **Import into PL database**
5. **Validate data integrity**

### Code Migration
1. **Add PL database connection**
2. **Create PL models**
3. **Update API endpoints gradually**
4. **Dual-write period (JSON + DB)**
5. **Switch to DB-only**
6. **Remove JSON file dependencies**

---

## Security & Compliance

### Data Protection
- Encrypt sensitive data at rest
- Secure database connections (SSL/TLS)
- API authentication/authorization
- Rate limiting on ingestion endpoints

### FBRef Compliance
- Respect robots.txt
- Rate limiting (don't overload FBRef)
- User-agent identification
- Error handling for blocked requests

---

## Monitoring & Observability

### Metrics
- Ingestion success/failure rates
- Database query performance
- Cache hit rates
- API response times
- Scraping frequency compliance

### Logging
- Ingestion logs (success/failure)
- Error tracking (Sentry)
- Database query logs
- API access logs

### Alerts
- Ingestion failures
- Database connection issues
- High error rates
- Performance degradation

---

## Open Questions

1. **ID Generation Strategy**: UUID vs Sequential IDs?
2. **Data Retention**: How long to keep historical data?
3. **Backup Strategy**: How often to backup PL database?
4. **Disaster Recovery**: RTO/RPO requirements?
5. **Cost Considerations**: Database size and scaling costs?
6. **Rate Limiting**: FBRef scraping limits?

---

## Next Steps

1. **Review and approve architecture**
2. **Design detailed database schema**
3. **Create ID mapping strategy**
4. **Set up development environment**
5. **Begin Phase 1 implementation**

---

**Status**: 📋 Requirements Complete  
**Next**: Architecture design and implementation planning





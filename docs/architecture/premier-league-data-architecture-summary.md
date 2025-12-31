# Premier League Data Architecture - Executive Summary
**Date**: 2025-12-21  
**Status**: Planning Complete  
**Priority**: P0

---

## Quick Overview

**Goal**: Scalable system for storing and managing Premier League match data, separate from user/FPL data, with automated FBRef ingestion.

---

## Recommended Architecture

### **Modular Monolith → Microservices** (Migration Path)

**Start**: Single FastAPI application with separate databases  
**Scale**: Extract services when needed

```
FastAPI App
├── User Service Module → User DB (PostgreSQL)
├── PL Data Service Module → PL DB (PostgreSQL) 
└── Ingestion Service Module → Celery Workers → Redis Queue
```

---

## Key Decisions

### 1. Database Strategy
✅ **Separate PostgreSQL database for PL data**  
- Different lifecycle, scaling, and access patterns
- Isolated from user data
- Independent backup/restore

### 2. ID Mapping
✅ **UUID-based internal IDs + mapping table**  
- Internal IDs: `fotmate_team_{UUID}`, `fotmate_player_{UUID}`
- FBRef IDs: `"822bd0ba"` (teams), `"5b92d896"` (players)
- Mapping table: `id_mappings(entity_type, fbref_id, internal_id)`
- Redis cache for hot lookups

### 3. Ingestion System
✅ **Celery + Redis + Scheduled Jobs**  
- During match days: Every 15-30 minutes
- After matches: Every 1-2 hours
- Off days: 2-3 times per day
- Error handling, retry logic, rate limiting

### 4. Caching Strategy
✅ **Multi-layer caching**  
- Redis: Application cache (5min - 1hr TTL)
- Database: Query optimization and indexes
- Future: CDN for static historical data

---

## Database Schema Summary

### Core Tables

1. **teams** - Team information
   - `internal_id` (UUID), `fbref_id`, `name`, `logo_url`

2. **players** - Player information
   - `internal_id` (UUID), `fbref_id`, `name`, `team_id`, `position`

3. **matches** - Match information
   - `internal_id` (structured string), `season`, `matchday`, `home_team_id`, `away_team_id`, `status`

4. **match_player_stats** - Player stats per match
   - `match_id`, `player_id`, `goals`, `assists`, `minutes`, etc.

5. **match_events** - Match events (goals, cards, etc.)
   - `match_id`, `event_type`, `minute`, `player_id`, `details` (JSONB)

6. **id_mappings** - FBRef → Internal ID mappings
   - `entity_type`, `fbref_id`, `internal_id`

---

## Technology Stack

- **API**: FastAPI (Python)
- **Database**: PostgreSQL (separate DB for PL data)
- **Task Queue**: Celery + Redis
- **Cache**: Redis
- **ORM**: SQLModel
- **Scraping**: Existing Playwright/Selenium scripts

---

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- Set up PL database
- Create schema
- Implement ID mapping
- Migrate existing JSON data

### Phase 2: Ingestion (Week 2-3)
- Set up Celery + Redis
- Create ingestion service
- Integrate FBRef scraper
- Scheduled jobs

### Phase 3: API Service (Week 3-4)
- Create PL Data API endpoints
- ID translation layer
- Caching layer
- Performance optimization

### Phase 4: Integration (Week 4-5)
- Frontend integration
- Update existing endpoints
- Testing and validation
- Monitoring

---

## Scalability Considerations

### Database Scaling
- Read replicas for read-heavy workloads
- Partitioning by season
- Strategic indexes

### Application Scaling
- Horizontal scaling (multiple instances)
- Load balancing
- Auto-scaling based on metrics

### Caching
- Redis cache for hot data
- Cache warming strategies
- CDN for static content (future)

---

## Data Flow

### Ingestion Flow
```
Scheduled Job → Scrape FBRef → Parse Data → ID Mapping → Transform → Database → Cache Invalidation
```

### API Request Flow
```
Request → Cache Check → Database Query → ID Translation → Transform → Cache → Response
```

---

## Benefits

✅ **Separation of Concerns** - User data vs PL data  
✅ **Independent Scaling** - Scale databases independently  
✅ **Better Performance** - Optimized for read-heavy PL data  
✅ **Fault Isolation** - Issues in one DB don't affect the other  
✅ **Flexible Architecture** - Easy to extract services later

---

## Migration Path

**Current**: JSON files + User DB  
**Phase 1**: User DB + PL DB (same app)  
**Phase 2**: Extract services as needed

---

## Next Steps

1. ✅ Review architecture (this document)
2. 📋 Approve database schema
3. 🔧 Set up development environment
4. 🚀 Begin Phase 1 implementation

---

**Documents**:
- [Requirements](./premier-league-data-architecture-requirements.md) - Full requirements analysis
- [Design](./premier-league-data-architecture-design.md) - Detailed design and schema

**Status**: ✅ Ready for Review and Approval





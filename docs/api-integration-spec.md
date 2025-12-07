# API Integration Specification

## 1. FPL Endpoints Used
- `/api/bootstrap-static/` – players, teams, events
- `/api/entry/{id}/` – user team info
- `/api/entry/{id}/event/{gw}/picks/` – squad picks
- `/api/event/{gw}/live/` – live scores
- `/api/fixtures/` – full fixture list
- `/api/element-summary/{player}/` – player history + fixtures

## 2. Data Model
### Player Model
- id, name, team
- cost, form, value
- xG/xA/xGI
- ICT index
- Chance of playing
- Ownership %, transfers in/out

### User Team Model
- picks
- bench order
- captain/vice
- bank + free transfers

## 3. Update Frequency
- Static data: daily
- Price data: hourly
- Live data: every 1–2 minutes

## 4. Error Handling
- Retry logic for failed calls
- Fallback cached data
- Flags for stale data

## 5. Rate Limiting
- Local caching to reduce API calls

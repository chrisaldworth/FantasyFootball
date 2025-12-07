# Functional Requirements

## 1. User Management
- Allow users to enter their FPL team ID.
- Optional login to save preferences.
- (Future) FPL authentication for full squad control.

## 2. Data Ingestion
- Fetch FPL API endpoints on cron schedule.
- Cache responses.
- Store historical data for models.

## 3. Core Features
### 3.1 AI Transfer Assistant
- Recommend players in/out based on form, fixtures, value.
- Evaluate multiple transfer scenarios.

### 3.2 Captaincy Optimiser
- Predict expected points per captain candidate.
- Consider fixtures, xGI, opponent defensive xGA.

### 3.3 Team Rating Tool
- Score user squad (0–100).
- Highlight weaknesses and opportunities.

### 3.4 Fixture Difficulty Planner
- Visual ticker (6–8 GWs).
- Attack vs defence difficulty metrics.

### 3.5 Price Change Alerts
- Notify user of predicted rises/falls.

### 3.6 Live Gameweek View
- Live rank
- Bonus points
- Auto‑sub logic preview

## 4. Premium Features
- Long‑term projections
- Wildcard drafts
- Mini‑league analysis

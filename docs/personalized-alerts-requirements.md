# Personalized Alerts - Requirements
**Date**: 2025-12-19  
**Priority**: P0 (Critical - UX Issue)  
**Status**: Requirements Phase

---

## Executive Summary

**Current Problem**: The key alerts section shows "277 players with injury concerns" - this is counting ALL players in the FPL database, not just the user's relevant players. This is not useful or personalized.

**Solution**: Alerts should only show information relevant to the user:
1. Players in their FPL squad with injury concerns
2. Players from their favorite team with injury concerns
3. Other personalized alerts (price changes for their players, etc.)

---

## Problem Statement

### Current State
- Alerts count ALL injured players in FPL database (277 players)
- No personalization - not relevant to the user
- Confusing and not actionable
- User can't tell if any of their players are injured

### User Need
- See alerts only for players in their FPL squad
- See alerts for their favorite team players
- Clear, actionable information
- Know which specific players are affected

---

## Goals & Objectives

### Primary Goals
1. **Personalized Alerts**: Only show alerts relevant to the user
2. **Actionable Information**: User can see which specific players are affected
3. **Clear Communication**: Alerts are clear and not overwhelming
4. **Relevance**: Every alert is relevant to the user's teams/players

### Success Metrics
- **Relevance**: 100% of alerts are relevant to user
- **Actionability**: User can identify affected players immediately
- **User Satisfaction**: Alerts are helpful, not confusing

---

## User Stories

### Story 1: FPL Squad Injury Alerts
**As an** FPL manager  
**I want** to see alerts only for players in my squad  
**So that** I know if any of my players are injured and need attention

**Acceptance Criteria**:
- Alert only shows if user has FPL team linked
- Alert shows count of injured players in user's squad
- Alert shows specific player names
- Alert links to player details or transfer assistant

### Story 2: Favorite Team Injury Alerts
**As a** football fan  
**I want** to see alerts for players from my favorite team  
**So that** I stay informed about my team's injury situation

**Acceptance Criteria**:
- Alert only shows if user has favorite team selected
- Alert shows count of injured players from favorite team
- Alert shows specific player names
- Alert links to team news or player details

### Story 3: Combined Alerts
**As a** user with both FPL team and favorite team  
**I want** to see both types of alerts clearly separated  
**So that** I can understand what affects my FPL team vs my favorite team

**Acceptance Criteria**:
- Alerts are clearly labeled (FPL Squad vs Favorite Team)
- Alerts are visually distinct
- User can see both types without confusion

---

## Functional Requirements

### FR1: FPL Squad Injury Alerts
**Priority**: P0 (Critical)

**Description**: Show injury alerts only for players in user's FPL squad

**Requirements**:
1. Get user's current FPL squad (from `picks`)
2. Filter injured players to only those in user's squad
3. Count injured players in squad
4. Show alert only if count > 0
5. Display specific player names in alert
6. Link to player details or transfer assistant

**Logic**:
```javascript
// Current (WRONG):
const injuredPlayers = bootstrap.elements.filter(p => 
  p.news && p.news.includes('injur')
); // Counts ALL players

// Correct:
const userSquadPlayerIds = picks.map(p => p.element);
const injuredSquadPlayers = bootstrap.elements.filter(p => 
  userSquadPlayerIds.includes(p.id) && 
  (p.news?.toLowerCase().includes('injur') || 
   p.chance_of_playing_next_round < 75)
);
```

**Alert Format**:
- If 0 injured: No alert
- If 1 injured: "1 player in your squad has injury concerns: [Player Name]"
- If 2-3 injured: "2 players in your squad have injury concerns: [Player 1], [Player 2]"
- If 4+ injured: "4 players in your squad have injury concerns (view details)"

---

### FR2: Favorite Team Injury Alerts
**Priority**: P1 (High)

**Description**: Show injury alerts for players from user's favorite team

**Requirements**:
1. Get user's favorite team ID
2. Filter injured players to only those from favorite team
3. Count injured players from favorite team
4. Show alert only if count > 0
5. Display specific player names in alert
6. Link to team news or player details

**Logic**:
```javascript
const favoriteTeamId = user.favorite_team_id;
const injuredTeamPlayers = bootstrap.elements.filter(p => 
  p.team === favoriteTeamId && 
  (p.news?.toLowerCase().includes('injur') || 
   p.chance_of_playing_next_round < 75)
);
```

**Alert Format**:
- If 0 injured: No alert
- If 1 injured: "1 [Team Name] player has injury concerns: [Player Name]"
- If 2-3 injured: "2 [Team Name] players have injury concerns: [Player 1], [Player 2]"
- If 4+ injured: "4 [Team Name] players have injury concerns (view details)"

---

### FR3: Alert Display Logic
**Priority**: P0 (Critical)

**Description**: Determine which alerts to show based on user's setup

**Requirements**:
1. **User with FPL team only**:
   - Show FPL squad injury alerts
   - Don't show favorite team alerts

2. **User with favorite team only**:
   - Show favorite team injury alerts
   - Don't show FPL squad alerts

3. **User with both**:
   - Show both types of alerts
   - Clearly label each type

4. **User with neither**:
   - Show no injury alerts
   - Show message: "Link your FPL team or select a favorite team to see personalized alerts"

---

### FR4: Alert Details & Actions
**Priority**: P1 (High)

**Description**: Alerts should be actionable and informative

**Requirements**:
1. **Player Names**: Show specific player names (up to 3, then "and X more")
2. **Player Details**: Clicking alert shows:
   - List of all affected players
   - Injury status for each
   - Expected return date (if available)
   - Chance of playing next round
3. **Quick Actions**:
   - "View Squad" button (for FPL alerts)
   - "Transfer Assistant" button (for FPL alerts)
   - "Team News" button (for favorite team alerts)

---

### FR5: Other Personalized Alerts
**Priority**: P2 (Medium)

**Description**: Add other relevant alerts for user's players

**Requirements**:
1. **Price Changes**:
   - Alert if any player in squad has price change
   - Show which players and price change direction
2. **Suspensions**:
   - Alert if any player in squad is suspended
   - Show player name and suspension length
3. **Form Drops**:
   - Alert if key players have significant form drops
   - Show player name and form change

---

## Non-Functional Requirements

### NFR1: Performance
- Alert calculation should complete in < 100ms
- No noticeable delay in dashboard load
- Efficient filtering (don't scan all players unnecessarily)

### NFR2: Accuracy
- Only count players actually in user's squad
- Only count players from user's favorite team
- Accurate injury detection (news + chance_of_playing)

### NFR3: User Experience
- Alerts are clear and not overwhelming
- Alerts are actionable (user knows what to do)
- Empty states are helpful (not error-like)

---

## Technical Considerations

### Current Implementation Issue
**File**: `frontend/src/app/dashboard/page.tsx`  
**Lines**: 253-276

**Current Code** (WRONG):
```javascript
const injuredPlayers = bootstrap.elements.filter((p: Player) => 
  p.news && p.news.length > 0 && 
  (p.news.toLowerCase().includes('injur') || 
   p.chance_of_playing_next_round !== null && 
   p.chance_of_playing_next_round < 75)
);
// This counts ALL players in FPL database!
```

**Fix Required**:
```javascript
// Only check players in user's squad
const userSquadPlayerIds = picks?.picks?.map(p => p.element) || [];
const injuredSquadPlayers = bootstrap.elements.filter((p: Player) => 
  userSquadPlayerIds.includes(p.id) && 
  (p.news?.toLowerCase().includes('injur') || 
   p.chance_of_playing_next_round !== null && 
   p.chance_of_playing_next_round < 75)
);

// Only check players from favorite team
const favoriteTeamId = user?.favorite_team_id;
const injuredTeamPlayers = favoriteTeamId ? 
  bootstrap.elements.filter((p: Player) => 
    p.team === favoriteTeamId && 
    (p.news?.toLowerCase().includes('injur') || 
     p.chance_of_playing_next_round !== null && 
     p.chance_of_playing_next_round < 75)
  ) : [];
```

---

## User Experience Flow

### Scenario 1: User with FPL Team (3 injured players in squad)
1. User logs in
2. Dashboard loads
3. Alert shows: "3 players in your squad have injury concerns: [Player 1], [Player 2], [Player 3]"
4. User clicks alert → See detailed list with injury status
5. User can click "Transfer Assistant" → Get transfer recommendations

### Scenario 2: User with Favorite Team (2 injured players)
1. User logs in (no FPL team)
2. Dashboard loads
3. Alert shows: "2 Arsenal players have injury concerns: [Player 1], [Player 2]"
4. User clicks alert → See detailed list
5. User can click "Team News" → See full team news

### Scenario 3: User with Both (1 FPL, 2 favorite team)
1. User logs in
2. Dashboard loads
3. Two alerts show:
   - "1 player in your squad has injury concerns: [Player Name]"
   - "2 Arsenal players have injury concerns: [Player 1], [Player 2]"
4. Each alert is clearly labeled and actionable

### Scenario 4: User with No Injuries
1. User logs in
2. Dashboard loads
3. No injury alerts shown
4. Other alerts (if any) still show

---

## Design Considerations

### Alert Card Design
- **FPL Squad Alerts**: Use FPL green/cyan colors
- **Favorite Team Alerts**: Use team colors
- **Player Names**: Bold, readable
- **Action Buttons**: Clear, prominent
- **Expandable**: Show details on click

### Visual Hierarchy
- **Most Important**: Alert count and player names
- **Secondary**: Action buttons
- **Tertiary**: Additional details

### Mobile Considerations
- Alerts stack vertically
- Player names wrap properly
- Action buttons are touch-friendly (44x44px)
- Expandable details work on mobile

---

## Acceptance Criteria

### Backend (if needed)
- [ ] No backend changes required (frontend-only fix)

### Frontend
- [ ] Alerts only count user's FPL squad players
- [ ] Alerts only count favorite team players
- [ ] Alert logic handles all user states (FPL only, team only, both, neither)
- [ ] Player names displayed in alerts
- [ ] Action buttons work correctly
- [ ] Empty states are helpful
- [ ] Performance is acceptable (< 100ms)

### Integration
- [ ] Works with existing alert system
- [ ] No breaking changes
- [ ] Backward compatible

---

## Implementation Plan

### Phase 1: Fix FPL Squad Alerts (P0 - Critical)
**Duration**: 1 day

1. Update alert calculation to filter by user's squad
2. Test with various squad configurations
3. Verify player names display correctly
4. Test action buttons

### Phase 2: Add Favorite Team Alerts (P1 - High)
**Duration**: 1 day

1. Add favorite team alert calculation
2. Test with various team configurations
3. Verify team name display
4. Test action buttons

### Phase 3: Enhance Alert Details (P1 - High)
**Duration**: 2 days

1. Add expandable alert details
2. Show full player list
3. Add injury status details
4. Add action buttons

### Phase 4: Testing & Polish (P2 - Medium)
**Duration**: 1 day

1. End-to-end testing
2. Performance testing
3. User acceptance testing
4. Bug fixes

---

## Risks & Mitigation

### Risk 1: Performance Issues
**Probability**: Low  
**Impact**: Medium  
**Mitigation**:
- Filter efficiently (use Set for O(1) lookup)
- Only calculate when needed
- Cache results if possible

### Risk 2: Missing Players
**Probability**: Low  
**Impact**: Low  
**Mitigation**:
- Handle null/undefined cases
- Default to empty array
- Test edge cases

---

## Next Steps

1. ✅ **Requirements Document Created** - This document
2. ⏳ **Hand off to Developer Agent** - Fix the alert calculation
3. ⏳ **Hand off to Tester Agent** - Test the fix

---

**Document Status**: Ready for Review  
**Priority**: P0 (Critical - UX Issue)  
**Next Action**: Hand off to Developer Agent for immediate fix


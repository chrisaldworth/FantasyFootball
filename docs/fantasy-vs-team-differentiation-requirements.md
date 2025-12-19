# Fantasy Football vs My Team - Differentiation Requirements
**Date**: 2025-12-19  
**Priority**: P1 (High)  
**Status**: Requirements Phase

---

## Executive Summary

**Current Problem**: "Fantasy Football" (FPL) and "My Team" (favorite team) are not clearly differentiated across the site. Users may be confused about what refers to their FPL squad vs their favorite real football team.

**Solution**: Create clear visual, terminological, and structural differentiation between:
1. **Fantasy Football** = FPL team, fantasy league, player picks, transfers, points, ranks
2. **My Team** = Favorite real football team (Arsenal, Liverpool, etc.), fixtures, news, standings

---

## Problem Statement

### Current State
- **Terminology is ambiguous**:
  - "My Team" could mean FPL team OR favorite team
  - "Team" is used for both concepts
  - Navigation doesn't clearly separate the two
  
- **Visual confusion**:
  - Site theme is based on favorite team (team colors, logo)
  - But FPL content uses same theme
  - No clear visual distinction between FPL and favorite team sections

- **Structural issues**:
  - Dashboard mixes both concepts
  - Navigation doesn't have clear separation
  - Quick actions don't clearly distinguish

### User Confusion
- Users don't know if "My Team" means FPL or favorite team
- Navigation is unclear about what's FPL vs real football
- Sections blend together without clear boundaries

---

## Goals & Objectives

### Primary Goals
1. **Clear Terminology**: Consistent, unambiguous labels across the site
2. **Visual Differentiation**: Distinct visual treatment for FPL vs favorite team
3. **Structural Separation**: Clear navigation and section boundaries
4. **User Clarity**: Users instantly understand what's FPL vs real football

### Success Metrics
- **Clarity**: Users can distinguish FPL from favorite team in < 2 seconds
- **Consistency**: Terminology is consistent across all pages
- **User Satisfaction**: No confusion about what "My Team" means

---

## Terminology Standards

### Fantasy Football (FPL)
**Use these terms**:
- "Fantasy Football" (primary)
- "FPL" (abbreviation)
- "My FPL Team" (when referring to user's squad)
- "Fantasy Squad" (when referring to players)
- "FPL Leagues" (when referring to leagues)
- "Gameweek" (FPL-specific)

**Avoid**:
- "My Team" (ambiguous)
- "Team" alone (could mean favorite team)
- "Squad" alone (could mean favorite team squad)

### My Team (Favorite Team)
**Use these terms**:
- "My Team" (primary - when context is clear it's favorite team)
- "[Team Name]" (e.g., "Arsenal" - when showing team-specific content)
- "Favorite Team" (when need to be explicit)
- "My Club" (alternative)
- "Real Team" (when contrasting with FPL)

**Avoid**:
- "Team" alone (ambiguous)
- "My Team" in FPL context (confusing)

---

## Visual Differentiation Requirements

### FR1: Color Coding
**Priority**: P1 (High)

**Description**: Use distinct colors to differentiate FPL from favorite team

**Requirements**:
1. **Fantasy Football (FPL)**:
   - Primary Color: FPL Green (#00ff87)
   - Secondary Color: FPL Cyan (#04f5ff)
   - Accent: FPL Pink (#e90052) for highlights
   - Use for: FPL sections, buttons, badges, cards

2. **My Team (Favorite Team)**:
   - Primary Color: Team's primary color (from theme)
   - Secondary Color: Team's secondary color (from theme)
   - Accent: Team's accent color (from theme)
   - Use for: Favorite team sections, buttons, badges, cards

3. **Visual Rules**:
   - FPL sections: Green/cyan borders, backgrounds, badges
   - Favorite team sections: Team color borders, backgrounds, badges
   - Never mix colors (FPL section shouldn't use team colors)

---

### FR2: Icon System
**Priority**: P1 (High)

**Description**: Use distinct icons to differentiate FPL from favorite team

**Requirements**:
1. **Fantasy Football Icons**:
   - Primary: ⚽ (soccer ball) or 🎮 (game controller)
   - Alternative: 📊 (chart) for analytics
   - Use for: FPL navigation, sections, buttons

2. **My Team Icons**:
   - Primary: 🏆 (trophy) or 🎯 (target)
   - Alternative: Team logo/badge
   - Use for: Favorite team navigation, sections, buttons

3. **Consistency**:
   - Same icon used throughout for same concept
   - Icons are visible and clear
   - Icons work on mobile (not too small)

---

### FR3: Section Headers & Labels
**Priority**: P1 (High)

**Description**: Clear section headers that distinguish FPL from favorite team

**Requirements**:
1. **FPL Sections**:
   - Header: "Fantasy Football" or "My FPL Team"
   - Subheader: "Manage your fantasy squad"
   - Icon: ⚽ or 🎮
   - Color: FPL green/cyan

2. **Favorite Team Sections**:
   - Header: "My Team" or "[Team Name]" (e.g., "Arsenal")
   - Subheader: "Follow your favorite club"
   - Icon: 🏆 or team logo
   - Color: Team colors

3. **Consistency**:
   - Same header format across all pages
   - Clear visual distinction
   - Mobile-friendly (readable on small screens)

---

## Navigation Structure Requirements

### FR4: Navigation Differentiation
**Priority**: P1 (High)

**Description**: Clear navigation structure that separates FPL from favorite team

**Requirements**:

**Mobile (Bottom Navigation)**:
- 🏠 Dashboard (Home - shows both)
- ⚽ Fantasy Football (FPL section)
- 🏆 My Team (Favorite team section)
- 📊 Analytics (FPL analytics)
- ⚙️ Settings

**Desktop (Side Navigation)**:
- 🏠 Dashboard
- **Fantasy Football** (section header, FPL green)
  - ⚽ My Squad
  - 🏆 Leagues
  - 📊 Analytics
  - 📈 Performance
- **My Team** (section header, team colors)
  - 🏆 [Team Name]
  - 📅 Fixtures
  - 📰 News
  - 📊 Standings

**Visual Treatment**:
- Section headers: Bold, colored, distinct
- FPL items: FPL green/cyan
- Favorite team items: Team colors
- Clear visual separation

---

### FR5: Dashboard Structure
**Priority**: P1 (High)

**Description**: Clear separation of FPL and favorite team on dashboard

**Requirements**:
1. **Hero Section**: 
   - Shows both (if user has both)
   - Clear visual separation
   - Distinct colors/badges

2. **Favorite Team Section**:
   - Header: "My Team" or "[Team Name]"
   - Team logo prominent
   - Team colors used
   - Content: Fixtures, news, standings

3. **FPL Section**:
   - Header: "Fantasy Football" or "My FPL Team"
   - FPL icon prominent
   - FPL green/cyan colors used
   - Content: Squad, points, rank, leagues

4. **Visual Separation**:
   - Clear boundaries between sections
   - Different background colors/tints
   - Distinct headers with icons
   - Spacing between sections

---

## Page-Level Requirements

### FR6: FPL Page (/fpl)
**Priority**: P1 (High)

**Description**: Dedicated FPL page with clear FPL branding

**Requirements**:
1. **Page Header**:
   - Title: "Fantasy Football" or "My FPL Team"
   - Icon: ⚽ or 🎮
   - Color: FPL green/cyan
   - Subtitle: "Manage your fantasy squad"

2. **Visual Treatment**:
   - FPL green/cyan theme throughout
   - No favorite team colors (unless showing team info for players)
   - Clear FPL branding

3. **Content**:
   - Squad view
   - Points and rank
   - Leagues
   - Transfers
   - Analytics

---

### FR7: Favorite Team Pages
**Priority**: P1 (High)

**Description**: Dedicated favorite team pages with clear team branding

**Requirements**:
1. **Page Header**:
   - Title: "My Team" or "[Team Name]"
   - Icon: 🏆 or team logo
   - Color: Team colors
   - Subtitle: "Follow your favorite club"

2. **Visual Treatment**:
   - Team colors throughout
   - Team logo prominent
   - Clear team branding

3. **Content**:
   - Fixtures
   - News
   - Standings
   - Recent results

---

## Component-Level Requirements

### FR8: Card/Badge Differentiation
**Priority**: P1 (High)

**Description**: Cards and badges clearly indicate FPL vs favorite team

**Requirements**:
1. **FPL Cards**:
   - Border: FPL green/cyan (2-3px)
   - Badge: "FPL" or "Fantasy" label
   - Icon: ⚽
   - Background: Subtle FPL green tint

2. **Favorite Team Cards**:
   - Border: Team color (2-3px)
   - Badge: Team logo or "[Team Name]"
   - Icon: 🏆 or team logo
   - Background: Subtle team color tint

3. **Consistency**:
   - Same treatment across all cards
   - Clear visual distinction
   - Works on mobile

---

### FR9: Button Differentiation
**Priority**: P1 (High)

**Description**: Buttons clearly indicate FPL vs favorite team actions

**Requirements**:
1. **FPL Buttons**:
   - Color: FPL green/cyan
   - Icon: ⚽ (if applicable)
   - Label: "Fantasy Football" or "FPL [Action]"
   - Example: "View FPL Squad", "FPL Leagues"

2. **Favorite Team Buttons**:
   - Color: Team colors
   - Icon: 🏆 or team logo (if applicable)
   - Label: "My Team" or "[Team Name] [Action]"
   - Example: "Arsenal Fixtures", "My Team News"

3. **Consistency**:
   - Same treatment across all buttons
   - Clear visual distinction
   - Touch-friendly (44x44px minimum)

---

### FR10: Quick Actions Differentiation
**Priority**: P1 (High)

**Description**: Quick actions clearly distinguish FPL from favorite team

**Requirements**:
1. **FPL Quick Actions**:
   - Group: "Fantasy Football"
   - Color: FPL green/cyan
   - Icon: ⚽
   - Actions: Transfer Assistant, Captain Pick, Squad View, Leagues

2. **Favorite Team Quick Actions**:
   - Group: "My Team"
   - Color: Team colors
   - Icon: 🏆 or team logo
   - Actions: Fixtures, News, Standings, Results

3. **Layout**:
   - Separate groups
   - Clear headers
   - Visual separation

---

## Content Requirements

### FR11: News Differentiation
**Priority**: P1 (High)

**Description**: News clearly indicates FPL vs favorite team

**Requirements**:
1. **FPL Player News**:
   - Badge: "FPL" or "Fantasy"
   - Color: FPL green/cyan
   - Icon: ⚽
   - Label: "Player News" or "FPL Squad News"

2. **Favorite Team News**:
   - Badge: Team logo or "[Team Name]"
   - Color: Team colors
   - Icon: 🏆
   - Label: "Team News" or "[Team Name] News"

---

### FR12: Alerts Differentiation
**Priority**: P1 (High)

**Description**: Alerts clearly indicate FPL vs favorite team

**Requirements**:
1. **FPL Alerts**:
   - Badge: "FPL Squad"
   - Color: FPL green/cyan
   - Icon: ⚽
   - Message: "X players in your FPL squad..."

2. **Favorite Team Alerts**:
   - Badge: "[Team Name]"
   - Color: Team colors
   - Icon: 🏆
   - Message: "X [Team Name] players..."

---

## User Experience Flow

### Scenario 1: User with Both FPL and Favorite Team
1. User sees dashboard with two clear sections:
   - "My Team" section (team colors, team logo)
   - "Fantasy Football" section (FPL green, FPL icon)
2. Navigation shows both sections clearly separated
3. User can easily navigate to either section
4. Visual distinction is clear throughout

### Scenario 2: User with Only FPL Team
1. User sees "Fantasy Football" section prominently
2. Navigation shows FPL section
3. "My Team" section shows prompt to select favorite team
4. FPL branding is consistent

### Scenario 3: User with Only Favorite Team
1. User sees "My Team" section prominently
2. Navigation shows favorite team section
3. "Fantasy Football" section shows prompt to link FPL team
4. Team branding is consistent

---

## Design Principles

### 1. Visual Hierarchy
- **FPL**: FPL green/cyan is primary color
- **Favorite Team**: Team colors are primary
- **Never mix**: FPL section never uses team colors (except for player team info)

### 2. Consistency
- Same terminology across all pages
- Same visual treatment across all components
- Same icons for same concepts

### 3. Clarity
- Users instantly know what's FPL vs favorite team
- No ambiguity in labels or sections
- Clear visual boundaries

### 4. Context Awareness
- When showing FPL content, use FPL branding
- When showing favorite team content, use team branding
- When showing both, clearly separate

---

## Implementation Plan

### Phase 1: Terminology & Labels - P1
**Duration**: 1 day

1. Audit all labels across the site
2. Create terminology guide
3. Update all text to use consistent terminology
4. Test for clarity

### Phase 2: Visual Differentiation - P1
**Duration**: 2 days

1. Update color system (FPL vs team colors)
2. Update icon system
3. Update card/badge designs
4. Update button designs
5. Test visual distinction

### Phase 3: Navigation Structure - P1
**Duration**: 2 days

1. Redesign navigation (mobile + desktop)
2. Add section headers
3. Separate FPL and favorite team items
4. Test navigation clarity

### Phase 4: Dashboard Structure - P1
**Duration**: 2 days

1. Redesign dashboard sections
2. Add clear headers
3. Separate FPL and favorite team content
4. Test dashboard clarity

### Phase 5: Page-Level Updates - P1
**Duration**: 2 days

1. Update FPL page (/fpl)
2. Update favorite team pages
3. Ensure consistent branding
4. Test page clarity

---

## Acceptance Criteria

### Terminology
- [ ] All labels use consistent terminology
- [ ] "My Team" only refers to favorite team
- [ ] "Fantasy Football" or "FPL" used for FPL content
- [ ] No ambiguous terms

### Visual Differentiation
- [ ] FPL sections use FPL green/cyan
- [ ] Favorite team sections use team colors
- [ ] Icons are distinct and consistent
- [ ] Cards/badges clearly indicate type

### Navigation
- [ ] Navigation clearly separates FPL and favorite team
- [ ] Section headers are clear
- [ ] Visual distinction is obvious
- [ ] Mobile and desktop both work

### Dashboard
- [ ] Sections are clearly separated
- [ ] Headers are clear and distinct
- [ ] Visual boundaries are obvious
- [ ] Users can easily distinguish

### Overall
- [ ] Users can distinguish FPL from favorite team in < 2 seconds
- [ ] No confusion about what "My Team" means
- [ ] Consistent across all pages
- [ ] Mobile-friendly

---

## Risks & Mitigation

### Risk 1: Too Much Visual Noise
**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Use subtle color differences
- Don't overdo it
- Test with users
- Iterate based on feedback

### Risk 2: Breaking Existing Design
**Probability**: Low  
**Impact**: High  
**Mitigation**:
- Gradual rollout
- Test thoroughly
- Maintain backward compatibility
- User testing

---

## Next Steps

1. ✅ **Requirements Document Created** - This document
2. ⏳ **Hand off to UI Designer Agent** - Create design specifications
3. ⏳ **Hand off to Developer Agent** - Implement changes
4. ⏳ **Hand off to Tester Agent** - Test differentiation

---

**Document Status**: Ready for Review  
**Priority**: P1 (High)  
**Next Action**: Hand off to UI Designer Agent for design specifications


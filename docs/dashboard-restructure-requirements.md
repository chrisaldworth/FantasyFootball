# Dashboard Restructure - Two-Section Architecture
**Date**: 2025-12-19  
**Priority**: P0 (Critical)  
**Status**: Requirements Phase

---

## Executive Summary

**User Request**: The dashboard needs to be clearly divided into two distinct sections:
1. **Fantasy Football** - All FPL companion features (Transfer, Captain, Team, Analytics, Leagues) + Fantasy Football News
2. **My Team** - Favorite team content (Fixtures, News, Standings, Analytics)

**Current Problem**: Everything is mixed together on one dashboard, making it unclear what's FPL vs favorite team.

**Solution**: Complete restructure with:
- Dashboard divided into 2 clear sections
- Separate navigation menus: "Fantasy Football" and "My Team"
- Sub-menus for each section
- Clear visual and structural boundaries

---

## Problem Statement

### Current State
- Dashboard mixes FPL and favorite team content
- No clear separation between sections
- Navigation doesn't reflect the two-section structure
- Users can't easily find FPL features vs favorite team features
- Analytics are mixed (FPL analytics vs team analytics)

### User Need
- Clear separation: "This is FPL stuff" vs "This is my favorite team stuff"
- Easy navigation: Go to Fantasy Football section or My Team section
- Sub-menus: Drill down into specific features within each section
- Dedicated spaces: Each section has its own dedicated area

---

## Goals & Objectives

### Primary Goals
1. **Clear Two-Section Structure**: Dashboard clearly divided into Fantasy Football and My Team
2. **Separate Navigation**: Two main menu items with sub-menus
3. **Feature Organization**: All FPL features grouped together, all favorite team features grouped together
4. **Dedicated Analytics**: Separate analytics for FPL vs favorite team

### Success Metrics
- **Clarity**: Users can instantly see the two sections
- **Navigation**: Users can easily navigate to any feature in < 2 clicks
- **User Satisfaction**: Clear organization, no confusion

---

## User Stories

### Story 1: Fantasy Football Section
**As an** FPL manager  
**I want** all my FPL features in one dedicated section  
**So that** I can easily access transfer assistant, captain pick, squad view, analytics, leagues, and FPL news

**Acceptance Criteria**:
- All FPL features grouped in "Fantasy Football" section
- Clear navigation to Fantasy Football section
- Sub-menus for: Squad, Transfers, Captain, Analytics, Leagues, News
- FPL-specific analytics separate from team analytics

### Story 2: My Team Section
**As a** football fan  
**I want** all my favorite team content in one dedicated section  
**So that** I can easily access fixtures, news, standings, and team analytics

**Acceptance Criteria**:
- All favorite team features grouped in "My Team" section
- Clear navigation to My Team section
- Sub-menus for: Fixtures, News, Standings, Analytics
- Team-specific analytics separate from FPL analytics

### Story 3: Navigation Structure
**As a** user  
**I want** clear navigation with main sections and sub-menus  
**So that** I can quickly find any feature

**Acceptance Criteria**:
- Two main menu items: "Fantasy Football" and "My Team"
- Each has expandable sub-menus
- Easy to navigate between sections
- Mobile-friendly navigation

---

## Functional Requirements

### FR1: Dashboard Two-Section Layout
**Priority**: P0 (Critical)

**Description**: Dashboard clearly divided into two sections

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────┐
│  NAVIGATION BAR (Fixed Top)                             │
│  [Logo] [Fantasy Football ▼] [My Team ▼] [Settings]    │
└─────────────────────────────────────────────────────────┘
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  ⚽ FANTASY FOOTBALL                              │  │
│  │  ────────────────────────────────────────────── │  │
│  │  [FPL Green Border/Background]                   │  │
│  │                                                   │  │
│  │  • Hero: Live Rank, Points, Rank                 │  │
│  │  • Quick Actions: Transfer, Captain, Squad       │  │
│  │  • Fantasy Football News (FPL-specific)         │  │
│  │  • Analytics Preview (FPL analytics)             │  │
│  │  • Leagues Preview                                │  │
│  │                                                   │  │
│  │  [View All Fantasy Football →]                    │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  🏆 MY TEAM                                       │  │
│  │  ────────────────────────────────────────────── │  │
│  │  [Team Color Border/Background]                  │  │
│  │                                                   │  │
│  │  • Hero: Team Logo, Next Fixture, Standings     │  │
│  │  • Fixtures (Recent Results, Upcoming)          │  │
│  │  • Team News                                      │  │
│  │  • Team Analytics Preview                         │  │
│  │                                                   │  │
│  │  [View All My Team →]                            │  │
│  └──────────────────────────────────────────────────┘  │
```

**Requirements**:
1. **Two Distinct Sections**:
   - Fantasy Football section (top or left)
   - My Team section (bottom or right)
   - Clear visual separation (different colors, borders, spacing)

2. **Section Headers**:
   - Large, bold, colored headers
   - Icon + label
   - "View All" link to full section

3. **Visual Boundaries**:
   - Colored borders (FPL green vs team colors)
   - Subtle background tints
   - Clear spacing between sections
   - No content mixing

4. **Content Preview**:
   - Each section shows preview of key content
   - "View All" links to full section pages
   - Not overwhelming, just highlights

---

### FR2: Navigation Menu Structure
**Priority**: P0 (Critical)

**Description**: Two main menu items with expandable sub-menus

**Menu Structure**:

**Desktop (Side Navigation)**:
```
🏠 Dashboard

━━━ ⚽ Fantasy Football ━━━ (Expandable, FPL green)
  ├─ 📊 Overview (Dashboard preview)
  ├─ ⚽ My Squad
  ├─ 🔄 Transfers
  ├─ 👑 Captain Pick
  ├─ 📈 Analytics
  ├─ 🏆 Leagues
  └─ 📰 FPL News

━━━ 🏆 My Team ━━━ (Expandable, team colors)
  ├─ 📊 Overview (Dashboard preview)
  ├─ 📅 Fixtures
  ├─ 📰 News
  ├─ 📊 Standings
  └─ 📈 Analytics
```

**Mobile (Bottom Navigation + Drawer)**:
```
Bottom Nav:
🏠 Dashboard
⚽ Fantasy Football
🏆 My Team
⚙️ Settings

When tapping Fantasy Football or My Team:
→ Opens drawer with sub-menu items
```

**Requirements**:
1. **Main Menu Items**:
   - "Fantasy Football" (FPL green, ⚽ icon)
   - "My Team" (Team colors, 🏆 icon)
   - Expandable/collapsible (desktop)
   - Opens drawer (mobile)

2. **Sub-Menus**:
   - Clear hierarchy
   - Icons for each item
   - Active state indicators
   - Touch-friendly (mobile)

3. **Navigation Behavior**:
   - Clicking main item: Goes to section overview
   - Clicking sub-item: Goes to specific feature
   - Expandable sections (desktop)
   - Drawer navigation (mobile)

---

### FR3: Fantasy Football Section Content
**Priority**: P0 (Critical)

**Description**: All FPL features grouped in Fantasy Football section

**Features Included**:
1. **Squad Management**:
   - Team pitch view
   - Player selection
   - Formation changes
   - Squad value

2. **Transfer Tools**:
   - Transfer Assistant
   - Transfer suggestions
   - Price change alerts

3. **Captain Tools**:
   - Captain Pick recommendations
   - Captaincy analytics

4. **Analytics**:
   - Points progression
   - Rank progression
   - Form analysis
   - Chip usage
   - Squad value over time

5. **Leagues**:
   - Classic leagues
   - Head-to-head leagues
   - Cup competitions
   - League standings

6. **FPL News**:
   - News about players in user's squad
   - FPL-specific news (price changes, injuries affecting FPL)
   - Transfer news for FPL players
   - Gameweek news

**Section Pages**:
- `/fantasy-football` - Overview
- `/fantasy-football/squad` - Squad view
- `/fantasy-football/transfers` - Transfer tools
- `/fantasy-football/captain` - Captain pick
- `/fantasy-football/analytics` - FPL analytics
- `/fantasy-football/leagues` - Leagues
- `/fantasy-football/news` - FPL news

---

### FR4: My Team Section Content
**Priority**: P0 (Critical)

**Description**: All favorite team features grouped in My Team section

**Features Included**:
1. **Fixtures**:
   - Recent results
   - Upcoming fixtures
   - Fixture details
   - Match previews

2. **News**:
   - Team news
   - Transfer news
   - Injury news
   - Manager news

3. **Standings**:
   - League position
   - League table
   - Form guide
   - Head-to-head records

4. **Analytics**:
   - Team performance analytics
   - Player statistics
   - Form analysis
   - Goal/assist trends

**Section Pages**:
- `/my-team` - Overview
- `/my-team/fixtures` - Fixtures
- `/my-team/news` - Team news
- `/my-team/standings` - Standings
- `/my-team/analytics` - Team analytics

---

### FR5: Fantasy Football News (New Feature)
**Priority**: P1 (High)

**Description**: Dedicated FPL-specific news section

**Requirements**:
1. **News Sources**:
   - News about players in user's FPL squad
   - FPL-specific news (price changes, gameweek updates)
   - Transfer news affecting FPL players
   - Injury news for FPL players
   - Gameweek deadline reminders
   - Chip usage strategies

2. **Content Types**:
   - Player news (injuries, transfers, form)
   - Price change alerts
   - Gameweek previews
   - Deadline reminders
   - Strategy articles
   - FPL community news

3. **Differentiation from Team News**:
   - Clearly labeled as "FPL News" or "Fantasy Football News"
   - FPL green/cyan branding
   - Focus on FPL-relevant information
   - Player-focused (not team-focused)

---

### FR6: Separate Analytics
**Priority**: P1 (High)

**Description**: Separate analytics for FPL vs favorite team

**FPL Analytics**:
- Points progression
- Rank progression
- Form analysis
- Chip usage timeline
- Squad value over time
- Transfer history
- Captain pick performance

**Team Analytics**:
- Team performance metrics
- Player statistics
- Goal/assist trends
- Form analysis
- Head-to-head records
- League position trends

**Requirements**:
- Clear separation (different pages/sections)
- Different visual treatment
- FPL analytics: FPL green branding
- Team analytics: Team color branding

---

## Navigation Structure Requirements

### FR7: Main Navigation
**Priority**: P0 (Critical)

**Description**: Two main navigation items with sub-menus

**Desktop Navigation**:
```
Side Navigation (Collapsible):

🏠 Dashboard

━━━ ⚽ Fantasy Football ━━━
  📊 Overview
  ⚽ My Squad
  🔄 Transfers
  👑 Captain Pick
  📈 Analytics
  🏆 Leagues
  📰 FPL News

━━━ 🏆 My Team ━━━
  📊 Overview
  📅 Fixtures
  📰 News
  📊 Standings
  📈 Analytics

⚙️ Settings
```

**Mobile Navigation**:
```
Bottom Navigation (Always Visible):
🏠 Dashboard
⚽ Fantasy Football
🏆 My Team
⚙️ Settings

Tapping Fantasy Football or My Team:
→ Opens full-screen drawer with sub-menu
→ Shows all sub-items
→ Easy to navigate
```

**Requirements**:
1. **Main Items**:
   - Clear labels: "Fantasy Football" and "My Team"
   - Distinct icons: ⚽ and 🏆
   - Distinct colors: FPL green vs team colors
   - Expandable (desktop) or drawer (mobile)

2. **Sub-Items**:
   - Clear hierarchy
   - Icons for each
   - Active state indicators
   - Touch-friendly (mobile)

---

## Dashboard Layout Requirements

### FR8: Dashboard Two-Section Layout
**Priority**: P0 (Critical)

**Description**: Dashboard clearly shows two sections

**Layout Options**:

**Option 1: Vertical Stack (Recommended)**
```
┌─────────────────────────────────────┐
│  ⚽ FANTASY FOOTBALL                 │
│  [FPL Green Section]                 │
│  • Preview content                   │
│  [View All →]                        │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│  🏆 MY TEAM                          │
│  [Team Color Section]                │
│  • Preview content                   │
│  [View All →]                        │
└─────────────────────────────────────┘
```

**Option 2: Side-by-Side (Desktop Only)**
```
┌──────────────────┬──────────────────┐
│  ⚽ FANTASY       │  🏆 MY TEAM      │
│  FOOTBALL         │                  │
│  [FPL Green]      │  [Team Colors]   │
│  • Preview        │  • Preview       │
│  [View All →]     │  [View All →]    │
└──────────────────┴──────────────────┘
```

**Requirements**:
1. **Clear Visual Separation**:
   - Different colored borders
   - Different background tints
   - Clear spacing
   - Section headers

2. **Preview Content**:
   - Key highlights from each section
   - Not overwhelming
   - "View All" links to full sections

3. **Responsive**:
   - Vertical stack on mobile
   - Side-by-side on desktop (optional)
   - Touch-friendly

---

## Page Structure Requirements

### FR9: Fantasy Football Pages
**Priority**: P0 (Critical)

**Description**: Dedicated pages for each FPL feature

**Page Structure**:
- `/fantasy-football` - Overview (dashboard preview)
- `/fantasy-football/squad` - Squad view
- `/fantasy-football/transfers` - Transfer tools
- `/fantasy-football/captain` - Captain pick
- `/fantasy-football/analytics` - FPL analytics
- `/fantasy-football/leagues` - Leagues
- `/fantasy-football/news` - FPL news

**Requirements**:
- Consistent FPL green branding
- Clear navigation breadcrumbs
- Sub-navigation for related features
- Mobile-friendly

---

### FR10: My Team Pages
**Priority**: P0 (Critical)

**Description**: Dedicated pages for each favorite team feature

**Page Structure**:
- `/my-team` - Overview (dashboard preview)
- `/my-team/fixtures` - Fixtures
- `/my-team/news` - Team news
- `/my-team/standings` - Standings
- `/my-team/analytics` - Team analytics

**Requirements**:
- Consistent team color branding
- Clear navigation breadcrumbs
- Sub-navigation for related features
- Mobile-friendly

---

## User Experience Flow

### Scenario 1: User Wants FPL Features
1. User sees dashboard with two sections
2. User clicks "Fantasy Football" section or menu item
3. User sees Fantasy Football overview or sub-menu
4. User navigates to specific feature (e.g., Transfers)
5. User uses FPL feature
6. Clear FPL branding throughout

### Scenario 2: User Wants Favorite Team Info
1. User sees dashboard with two sections
2. User clicks "My Team" section or menu item
3. User sees My Team overview or sub-menu
4. User navigates to specific feature (e.g., Fixtures)
5. User views team information
6. Clear team branding throughout

### Scenario 3: User Wants to Switch Between Sections
1. User is in Fantasy Football section
2. User clicks "My Team" in navigation
3. User switches to My Team section
4. Clear visual change (colors, content)
5. User knows they're in different section

---

## Design Requirements

### Visual Differentiation
- **Fantasy Football**: FPL green/cyan throughout
- **My Team**: Team colors throughout
- **Clear Boundaries**: Different colored borders, backgrounds
- **Consistent Branding**: Same colors/icons across all pages in section

### Navigation Design
- **Main Items**: Large, clear, colored
- **Sub-Items**: Clear hierarchy, icons, active states
- **Mobile**: Drawer navigation for sub-menus
- **Desktop**: Expandable sections

### Dashboard Design
- **Two Sections**: Clear visual separation
- **Preview Content**: Key highlights, not overwhelming
- **View All Links**: Easy access to full sections
- **Responsive**: Works on all screen sizes

---

## Implementation Plan

### Phase 1: Navigation Restructure - P0
**Duration**: 2 days

1. Redesign navigation (mobile + desktop)
2. Add two main menu items
3. Add sub-menus for each
4. Test navigation flow

### Phase 2: Dashboard Restructure - P0
**Duration**: 3 days

1. Redesign dashboard layout
2. Create two-section structure
3. Add preview content
4. Add "View All" links
5. Test dashboard clarity

### Phase 3: Page Structure - P0
**Duration**: 3 days

1. Create Fantasy Football pages
2. Create My Team pages
3. Update routing
4. Test page navigation

### Phase 4: FPL News Feature - P1
**Duration**: 2 days

1. Create FPL news backend
2. Create FPL news frontend
3. Integrate into Fantasy Football section
4. Test FPL news display

### Phase 5: Separate Analytics - P1
**Duration**: 2 days

1. Separate FPL analytics
2. Separate team analytics
3. Update navigation
4. Test analytics pages

---

## Acceptance Criteria

### Navigation
- [ ] Two main menu items: "Fantasy Football" and "My Team"
- [ ] Sub-menus for each section
- [ ] Expandable/collapsible (desktop)
- [ ] Drawer navigation (mobile)
- [ ] Clear active states
- [ ] Easy navigation between sections

### Dashboard
- [ ] Two clear sections
- [ ] Visual separation (colors, borders)
- [ ] Preview content in each section
- [ ] "View All" links work
- [ ] Responsive design

### Pages
- [ ] Fantasy Football pages exist and work
- [ ] My Team pages exist and work
- [ ] Consistent branding within sections
- [ ] Clear navigation breadcrumbs

### Overall
- [ ] Users can distinguish sections instantly
- [ ] Navigation is clear and intuitive
- [ ] All features accessible in < 2 clicks
- [ ] Mobile-friendly

---

## Risks & Mitigation

### Risk 1: Too Much Navigation
**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Keep sub-menus collapsible
- Use clear hierarchy
- Test with users
- Iterate based on feedback

### Risk 2: Breaking Existing Features
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
3. ⏳ **Hand off to Developer Agent** - Implement restructure
4. ⏳ **Hand off to Tester Agent** - Test new structure

---

**Document Status**: Ready for Review  
**Priority**: P0 (Critical)  
**Next Action**: Hand off to UI Designer Agent for design specifications


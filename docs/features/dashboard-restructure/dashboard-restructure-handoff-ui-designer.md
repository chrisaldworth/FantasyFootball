# Dashboard Restructure - Two-Section Architecture - Handoff to UI Designer Agent

**From**: Product and Project Agent  
**To**: UI Designer Agent  
**Date**: 2025-12-19  
**Priority**: P0 (Critical)  
**Status**: 🚀 **READY - START DESIGN WORK NOW**

---

## 🎯 Your Mission

The dashboard needs to be completely restructured into two clear, distinct sections:
1. **Fantasy Football** - All FPL companion features (Transfer, Captain, Team, Analytics, Leagues) + Fantasy Football News
2. **My Team** - Favorite team content (Fixtures, News, Standings, Analytics)

Your job is to create beautiful, intuitive design specifications for:
- Two-section dashboard layout
- Separate navigation menus with sub-menus
- Clear visual and structural boundaries
- Dedicated pages for each section

**When you activate, you will automatically detect this document (via glob pattern) and start work immediately.**

---

## Context

### Current Problem
- Dashboard mixes FPL and favorite team content
- No clear separation between sections
- Navigation doesn't reflect two-section structure
- Users can't easily find FPL features vs favorite team features
- Analytics are mixed (FPL analytics vs team analytics)

### User Request
- Dashboard divided into 2 sections: Fantasy Football and My Team
- Menu structure: "Fantasy Football" and "My Team" with sub-menus
- All FPL features grouped together
- All favorite team features grouped together
- Separate analytics for each

---

## Reference Documents

1. **Requirements Document**: `docs/dashboard-restructure-requirements.md`
   - Complete problem analysis
   - Functional requirements
   - Navigation structure
   - Page structure

2. **Differentiation Requirements**: `docs/fantasy-vs-team-differentiation-requirements.md`
   - Visual differentiation guidelines
   - Color system
   - Icon system

---

## Design Specifications Needed

### 1. Dashboard Two-Section Layout

**Requirement**: Dashboard clearly divided into two distinct sections

**Layout Structure**:

**Option 1: Vertical Stack (Recommended)**
```
┌─────────────────────────────────────────────────────────┐
│  ⚽ FANTASY FOOTBALL                                    │
│  ───────────────────────────────────────────────────── │
│  [FPL Green Border, 4px]                               │
│  [FPL Green Background Tint, 10% opacity]              │
│                                                          │
│  • Hero: Live Rank, Points, Rank                        │
│  • Quick Actions: Transfer, Captain, Squad             │
│  • Fantasy Football News Preview                        │
│  • Analytics Preview (FPL analytics)                    │
│  • Leagues Preview                                      │
│                                                          │
│  [View All Fantasy Football →] (FPL green button)      │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│  🏆 MY TEAM                                             │
│  ───────────────────────────────────────────────────── │
│  [Team Color Border, 4px]                               │
│  [Team Color Background Tint, 10% opacity]             │
│                                                          │
│  • Hero: Team Logo, Next Fixture, Standings           │
│  • Fixtures Preview (Recent Results, Upcoming)          │
│  • Team News Preview                                    │
│  • Team Analytics Preview                               │
│                                                          │
│  [View All My Team →] (Team color button)              │
└─────────────────────────────────────────────────────────┘
```

**Design Requirements**:
- **Section Headers**:
  - Large, bold, colored (FPL green vs team colors)
  - Icon + label (⚽ Fantasy Football, 🏆 My Team)
  - Height: 56px (mobile), 64px (desktop)
  - Border: 4px bottom border (colored)
  - Background: Subtle tint (10% opacity)

- **Visual Boundaries**:
  - Colored borders (4px, FPL green vs team colors)
  - Subtle background tints (10% opacity)
  - Clear spacing between sections (32px)
  - No content mixing

- **Preview Content**:
  - Key highlights from each section
  - Not overwhelming (3-5 items max)
  - "View All" button at bottom of each section
  - Links to full section pages

---

### 2. Navigation Menu Structure

**Requirement**: Two main menu items with expandable sub-menus

**Desktop Side Navigation**:
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│                                      │
│  ━━━ ⚽ Fantasy Football ━━━         │
│  [FPL Green Header, Expandable]     │
│    📊 Overview                       │
│    ⚽ My Squad                       │
│    🔄 Transfers                      │
│    👑 Captain Pick                   │
│    📈 Analytics                      │
│    🏆 Leagues                        │
│    📰 FPL News                       │
│                                      │
│  ━━━ 🏆 My Team ━━━                  │
│  [Team Color Header, Expandable]     │
│    📊 Overview                       │
│    📅 Fixtures                       │
│    📰 News                           │
│    📊 Standings                      │
│    📈 Analytics                      │
│                                      │
│  ⚙️ Settings                         │
└─────────────────────────────────────┘
```

**Mobile Navigation**:
```
Bottom Navigation (Always Visible):
🏠 Dashboard
⚽ Fantasy Football
🏆 My Team
⚙️ Settings

Tapping Fantasy Football or My Team:
→ Opens full-screen drawer
→ Shows sub-menu items
→ Easy navigation
```

**Design Requirements**:
1. **Main Menu Items**:
   - Large, clear labels
   - Distinct icons (⚽ vs 🏆)
   - Distinct colors (FPL green vs team colors)
   - Expandable/collapsible (desktop)
   - Opens drawer (mobile)

2. **Sub-Menu Items**:
   - Clear hierarchy (indented)
   - Icons for each item
   - Active state indicators
   - Touch-friendly (44x44px minimum, mobile)

3. **Section Headers**:
   - Bold, colored
   - Expand/collapse icon
   - Clear visual separation

---

### 3. Fantasy Football Section Design

**Requirement**: All FPL features grouped in dedicated section

**Section Pages**:
- `/fantasy-football` - Overview
- `/fantasy-football/squad` - Squad view
- `/fantasy-football/transfers` - Transfer tools
- `/fantasy-football/captain` - Captain pick
- `/fantasy-football/analytics` - FPL analytics
- `/fantasy-football/leagues` - Leagues
- `/fantasy-football/news` - FPL news

**Design Requirements**:
- **Consistent Branding**: FPL green/cyan throughout
- **Page Headers**: FPL green, ⚽ icon
- **Navigation**: Breadcrumbs, sub-navigation
- **Content**: All FPL-related features

---

### 4. My Team Section Design

**Requirement**: All favorite team features grouped in dedicated section

**Section Pages**:
- `/my-team` - Overview
- `/my-team/fixtures` - Fixtures
- `/my-team/news` - Team news
- `/my-team/standings` - Standings
- `/my-team/analytics` - Team analytics

**Design Requirements**:
- **Consistent Branding**: Team colors throughout
- **Page Headers**: Team colors, 🏆 icon or team logo
- **Navigation**: Breadcrumbs, sub-navigation
- **Content**: All favorite team-related features

---

### 5. Fantasy Football News (New Feature)

**Requirement**: Dedicated FPL-specific news section

**Content Types**:
- News about players in user's FPL squad
- FPL-specific news (price changes, gameweek updates)
- Transfer news affecting FPL players
- Injury news for FPL players
- Gameweek deadline reminders
- Strategy articles

**Design Requirements**:
- **Page**: `/fantasy-football/news`
- **Branding**: FPL green/cyan
- **Label**: "FPL News" or "Fantasy Football News"
- **Differentiation**: Clearly different from team news
- **Layout**: Similar to team news but FPL-focused

---

### 6. Separate Analytics Pages

**Requirement**: Separate analytics for FPL vs favorite team

**FPL Analytics** (`/fantasy-football/analytics`):
- Points progression
- Rank progression
- Form analysis
- Chip usage timeline
- Squad value over time
- Transfer history
- Captain pick performance

**Team Analytics** (`/my-team/analytics`):
- Team performance metrics
- Player statistics
- Goal/assist trends
- Form analysis
- Head-to-head records
- League position trends

**Design Requirements**:
- **Clear Separation**: Different pages, different branding
- **FPL Analytics**: FPL green branding
- **Team Analytics**: Team color branding
- **Consistent Layout**: Similar structure, different data

---

## Component Specifications

### Section Container
- **Border**: 4px solid (FPL green or team color)
- **Background**: Subtle tint (10% opacity)
- **Padding**: 24px (mobile), 32px (desktop)
- **Border Radius**: 16px
- **Spacing**: 32px between sections

### Section Header
- **Height**: 56px (mobile), 64px (desktop)
- **Padding**: 16px horizontal
- **Border**: 4px bottom border (colored)
- **Typography**: 24px bold (mobile), 28px bold (desktop)
- **Icon**: 32px (mobile), 36px (desktop)
- **Color**: FPL green or team color

### Preview Content Cards
- **Layout**: Grid (2-3 columns desktop, 1 column mobile)
- **Card Height**: 120-150px
- **Content**: Key highlights only
- **"View All" Button**: Bottom of section, colored

### Navigation Section Header
- **Height**: 48px
- **Padding**: 12px horizontal
- **Background**: Colored (FPL green or team color, 20% opacity)
- **Typography**: 16px bold
- **Icon**: Expand/collapse chevron
- **Touch Target**: 44x44px minimum

### Sub-Menu Items
- **Height**: 44px
- **Padding**: 12px horizontal, 8px vertical
- **Indentation**: 24px (to show hierarchy)
- **Icon**: 20px
- **Active State**: Colored background
- **Touch Target**: 44x44px minimum

---

## Responsive Design

### Mobile (320px - 767px)
- **Dashboard**: Vertical stack, full-width sections
- **Navigation**: Bottom nav + drawer for sub-menus
- **Section Headers**: Full width, stacked
- **Preview Cards**: Single column
- **Touch Targets**: 44x44px minimum

### Tablet (768px - 1023px)
- **Dashboard**: Vertical stack or side-by-side
- **Navigation**: Side nav (collapsible)
- **Section Headers**: Full width
- **Preview Cards**: 2-column grid
- **Touch Targets**: 48x48px

### Desktop (1024px+)
- **Dashboard**: Side-by-side or vertical stack
- **Navigation**: Side nav (expanded)
- **Section Headers**: Full width
- **Preview Cards**: 2-3 column grid
- **Hover States**: Rich interactions

---

## Color System

### Fantasy Football Section
- **Primary**: FPL Green (#00ff87)
- **Secondary**: FPL Cyan (#04f5ff)
- **Border**: FPL Green (4px)
- **Background Tint**: rgba(0, 255, 135, 0.1)
- **Text**: Standard text colors
- **Buttons**: FPL green background

### My Team Section
- **Primary**: Team's primary color (from theme)
- **Secondary**: Team's secondary color (from theme)
- **Border**: Team primary color (4px)
- **Background Tint**: Team color with 10% opacity
- **Text**: Standard text colors
- **Buttons**: Team color background

---

## Typography

### Section Headers
- **Size**: 24px (mobile), 28px (desktop)
- **Weight**: 700 (bold)
- **Color**: FPL green or team color
- **Line Height**: 1.2

### Navigation Headers
- **Size**: 16px
- **Weight**: 700 (bold)
- **Color**: FPL green or team color

### Sub-Menu Items
- **Size**: 14px (mobile), 16px (desktop)
- **Weight**: 500 (medium)
- **Color**: Standard text or colored when active

---

## Animation Guidelines

### Section Expand/Collapse
- **Height Transition**: Smooth
- **Duration**: 0.3s
- **Easing**: ease-in-out

### Navigation Expand/Collapse
- **Height Transition**: Smooth
- **Duration**: 0.3s
- **Easing**: ease-in-out

### Drawer Open/Close (Mobile)
- **Slide Animation**: From bottom or side
- **Duration**: 0.3s
- **Easing**: ease-in-out

---

## Accessibility Requirements

### WCAG AA Compliance
- **Color Contrast**: 4.5:1 minimum for text
- **Touch Targets**: Minimum 44x44px
- **Focus Indicators**: Clear, visible
- **Keyboard Navigation**: Full support
- **Screen Reader**: ARIA labels for sections, navigation items

### Design Considerations
- **Color Blindness**: Don't rely on color alone (use icons/labels)
- **Motion Sensitivity**: Respect `prefers-reduced-motion`
- **Text Size**: Scalable up to 200%
- **Touch Targets**: Generous spacing between interactive elements

---

## Deliverables Required

1. **Dashboard Layout Design**:
   - Two-section layout mockups
   - Section header designs
   - Preview content layouts
   - "View All" button designs
   - Mobile, tablet, desktop layouts

2. **Navigation Design**:
   - Desktop side nav mockups
   - Mobile bottom nav + drawer mockups
   - Section header designs (expandable)
   - Sub-menu item designs
   - Active state designs

3. **Page Header Designs**:
   - Fantasy Football page headers
   - My Team page headers
   - Breadcrumb designs
   - Sub-navigation designs

4. **Component Designs**:
   - Section container designs
   - Preview card designs
   - Navigation item designs
   - Button designs

5. **FPL News Design**:
   - FPL news page layout
   - News card designs (FPL-specific)
   - Differentiation from team news

6. **Analytics Designs**:
   - FPL analytics page layout
   - Team analytics page layout
   - Clear visual distinction

7. **Design System Updates**:
   - Color specifications
   - Typography specifications
   - Component specifications
   - Navigation specifications

---

## What NOT to Do

- ❌ **DO NOT** implement code - hand off to Developer Agent
- ❌ **DO NOT** make requirements decisions - escalate to Product and Project Agent
- ❌ **DO NOT** skip design specs - always provide clear design documentation
- ❌ **DO NOT** mix sections - keep FPL and favorite team completely separate

---

## Definition of Done

Design phase is complete when:
- ✅ All mockups created (mobile, tablet, desktop)
- ✅ Dashboard two-section layout finalized
- ✅ Navigation structure finalized
- ✅ Page designs finalized
- ✅ Component specifications complete
- ✅ Accessibility requirements met
- ✅ Handoff document created for Developer Agent

---

## Next Steps

1. **Review Requirements**: Read `docs/dashboard-restructure-requirements.md` thoroughly
2. **Review Differentiation**: Read `docs/fantasy-vs-team-differentiation-requirements.md`
3. **Create Mockups**: Start with dashboard two-section layout
4. **Design Navigation**: Create navigation structure with sub-menus
5. **Design Pages**: Create page designs for each section
6. **Design System**: Update design system with new components
7. **Handoff to Developer**: Create `docs/dashboard-restructure-handoff-developer.md`

---

**Start designing now! 🎨**

**Remember**: Focus on clear separation, intuitive navigation, and making it instantly obvious what's FPL vs favorite team!


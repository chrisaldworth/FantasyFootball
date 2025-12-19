# Dashboard Restructure - Two-Section Architecture - Design Specification

**Designer**: UI Designer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P0 (Critical)

---

## Overview

This document provides complete design specifications for restructuring the dashboard into two clear, distinct sections: **Fantasy Football** (FPL) and **My Team** (Favorite Team). The goal is to create clear visual and structural boundaries, intuitive navigation with sub-menus, and dedicated pages for each section.

**Key Principle**: Complete separation - FPL content in Fantasy Football section, favorite team content in My Team section.

---

## Design Principles

1. **Clear Separation**: Two distinct sections with visual boundaries
2. **Intuitive Navigation**: Main sections with expandable sub-menus
3. **Consistent Branding**: FPL green for Fantasy Football, team colors for My Team
4. **Progressive Disclosure**: Preview content on dashboard, full content on section pages
5. **Mobile-First**: Touch-friendly navigation and responsive layouts

---

## 1. Dashboard Two-Section Layout

### 1.1 Layout Structure

**Screen: Dashboard - Two Sections (Vertical Stack)**

**Layout (Mobile - 320px - 767px)**:
```
┌─────────────────────────────────────────┐
│  TOP NAVIGATION                         │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ⚽ FANTASY FOOTBALL              │  │
│  │  ─────────────────────────────── │  │
│  │  [FPL Green Border, 4px]         │  │
│  │  [FPL Green Background Tint]     │  │
│  │                                    │  │
│  │  📊 Live Rank: #12,345             │  │
│  │  Points: 1,234 | GW: 45           │  │
│  │                                    │  │
│  │  Quick Actions:                   │  │
│  │  [Transfer] [Captain] [Squad]    │  │
│  │                                    │  │
│  │  📰 FPL News (3 items)            │  │
│  │  • Player injury update           │  │
│  │  • Price change alert             │  │
│  │  • Gameweek preview               │  │
│  │                                    │  │
│  │  📈 Analytics Preview              │  │
│  │  [Points Chart] [Rank Chart]     │  │
│  │                                    │  │
│  │  🏆 Leagues Preview                │  │
│  │  Classic League: #1,234           │  │
│  │                                    │  │
│  │  [View All Fantasy Football →]    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  🏆 MY TEAM                       │  │
│  │  Arsenal                          │  │
│  │  ─────────────────────────────── │  │
│  │  [Team Color Border, 4px]         │  │
│  │  [Team Color Background Tint]     │  │
│  │                                    │  │
│  │  📅 Next Match:                    │  │
│  │  Arsenal vs Liverpool             │  │
│  │  Sat, Dec 21, 15:00                │  │
│  │                                    │  │
│  │  📊 League Position: 3rd          │  │
│  │  Points: 45 | GD: +12              │  │
│  │                                    │  │
│  │  📰 Team News (3 items)           │  │
│  │  • Injury update                  │  │
│  │  • Transfer rumor                 │  │
│  │  • Manager press conference        │  │
│  │                                    │  │
│  │  📈 Team Analytics Preview         │  │
│  │  [Form Chart] [Goals Chart]       │  │
│  │                                    │  │
│  │  [View All My Team →]             │  │
│  └───────────────────────────────────┘  │
│                                         │
│  BOTTOM NAVIGATION                      │
└─────────────────────────────────────────┘
```

**Layout (Desktop - 1024px+)**:
```
┌─────────────────────────────────────────────────────────────┐
│  SIDE NAV │  TOP NAVIGATION                                 │
│           ├─────────────────────────────────────────────────┤
│           │                                                 │
│           │  ┌──────────────────────────────────────────┐  │
│           │  │  ⚽ FANTASY FOOTBALL                       │  │
│           │  │  ──────────────────────────────────────── │  │
│           │  │  [FPL Green Border, 4px]                  │  │
│           │  │  [FPL Green Background Tint]               │  │
│           │  │                                             │  │
│           │  │  Hero: Live Rank | Points | GW Rank       │  │
│           │  │  Quick Actions: [Transfer] [Captain] ...  │  │
│           │  │  FPL News: [3 items grid]                 │  │
│           │  │  Analytics: [Charts grid]                 │  │
│           │  │  Leagues: [Preview cards]                │  │
│           │  │  [View All Fantasy Football →]           │  │
│           │  └──────────────────────────────────────────┘  │
│           │                                                 │
│           │  ┌──────────────────────────────────────────┐  │
│           │  │  🏆 MY TEAM                               │  │
│           │  │  Arsenal                                 │  │
│           │  │  ──────────────────────────────────────── │  │
│           │  │  [Team Color Border, 4px]                 │  │
│           │  │  [Team Color Background Tint]             │  │
│           │  │                                             │  │
│           │  │  Hero: Next Match | League Position       │  │
│           │  │  Fixtures: [Recent + Upcoming]            │  │
│           │  │  Team News: [3 items grid]                │  │
│           │  │  Analytics: [Charts grid]                │  │
│           │  │  [View All My Team →]                    │  │
│           │  └──────────────────────────────────────────┘  │
│           │                                                 │
└───────────┴─────────────────────────────────────────────────┘
```

---

### 1.2 Section Container Design

**Component**: `DashboardSection`

**Design Specifications**:

| Property | Value |
|----------|-------|
| **Border** | 4px solid (FPL green or team color) |
| **Background** | Subtle tint (10% opacity) |
| **Border Radius** | 16px (mobile), 20px (desktop) |
| **Padding** | 24px (mobile), 32px (desktop) |
| **Spacing Between Sections** | 32px (mobile), 40px (desktop) |
| **Min Height** | 400px (mobile), 500px (desktop) |

**FPL Section Styling**:
```tsx
<div className="rounded-2xl border-[4px] border-[var(--fpl-primary)] bg-[var(--fpl-bg-tint)] p-6 sm:p-8">
  {/* Section content */}
</div>
```

**My Team Section Styling**:
```tsx
<div 
  className="rounded-2xl border-[4px] p-6 sm:p-8"
  style={{ 
    borderColor: 'var(--team-primary)',
    backgroundColor: 'var(--team-primary)',
    opacity: 0.1
  }}
>
  {/* Section content */}
</div>
```

---

### 1.3 Section Header Design

**Component**: `DashboardSectionHeader`

**Design Specifications**:

| Property | Value |
|----------|-------|
| **Height** | 56px (mobile), 64px (desktop) |
| **Padding** | 16px horizontal |
| **Border** | 4px bottom border (colored) |
| **Typography** | 24px bold (mobile), 28px bold (desktop) |
| **Icon** | 32px (mobile), 36px (desktop) |
| **Color** | FPL green or team color |

**FPL Section Header**:
```tsx
<div className="pb-4 mb-6 border-b-[4px] border-[var(--fpl-primary)]">
  <div className="flex items-center gap-3">
    <span className="text-3xl sm:text-4xl">⚽</span>
    <div>
      <h2 className="text-2xl sm:text-3xl font-bold text-[var(--fpl-primary)]">
        FANTASY FOOTBALL
      </h2>
      <p className="text-sm text-[var(--pl-text-muted)]">
        Manage your fantasy squad
      </p>
    </div>
  </div>
</div>
```

**My Team Section Header**:
```tsx
<div 
  className="pb-4 mb-6 border-b-[4px]"
  style={{ borderColor: 'var(--team-primary)' }}
>
  <div className="flex items-center gap-3">
    {teamLogo ? (
      <img src={teamLogo} alt={teamName} className="w-10 h-10 sm:w-12 sm:h-12" />
    ) : (
      <span className="text-3xl sm:text-4xl">🏆</span>
    )}
    <div>
      <h2 
        className="text-2xl sm:text-3xl font-bold"
        style={{ color: 'var(--team-primary)' }}
      >
        MY TEAM
      </h2>
      <p className="text-sm text-[var(--pl-text-muted)]">
        {teamName || 'Follow your favorite club'}
      </p>
    </div>
  </div>
</div>
```

---

### 1.4 Preview Content Design

**FPL Section Preview**:

1. **Hero Stats** (Top):
   - Live Rank (large, prominent)
   - Total Points
   - Gameweek Points
   - Rank Change (up/down indicator)

2. **Quick Actions** (Grid):
   - Transfer Assistant
   - Captain Pick
   - Squad View
   - Leagues

3. **FPL News Preview** (3 items):
   - Compact news cards
   - FPL green badges
   - Player-focused news

4. **Analytics Preview** (2 charts):
   - Points progression (mini chart)
   - Rank progression (mini chart)

5. **Leagues Preview** (1-2 leagues):
   - League name
   - Current rank
   - Points behind/ahead

**My Team Section Preview**:

1. **Hero Stats** (Top):
   - Next Match (large, prominent)
   - League Position
   - Points
   - Goal Difference

2. **Fixtures Preview** (2-3 items):
   - Recent result
   - Upcoming fixture
   - Compact fixture cards

3. **Team News Preview** (3 items):
   - Compact news cards
   - Team color badges
   - Team-focused news

4. **Analytics Preview** (2 charts):
   - Form chart (mini)
   - Goals chart (mini)

---

### 1.5 "View All" Button Design

**Component**: `ViewAllButton`

**Design Specifications**:

| Property | Value |
|----------|-------|
| **Position** | Bottom of section, centered |
| **Style** | Outlined button with arrow |
| **Color** | FPL green or team color |
| **Size** | Full width (mobile), auto (desktop) |
| **Height** | 48px minimum |

**FPL "View All" Button**:
```tsx
<Link
  href="/fantasy-football"
  className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 border-[var(--fpl-primary)] text-[var(--fpl-primary)] font-semibold hover:bg-[var(--fpl-primary)] hover:text-[var(--fpl-text-on-primary)] transition-all flex items-center justify-center gap-2"
>
  <span>View All Fantasy Football</span>
  <span>→</span>
</Link>
```

**My Team "View All" Button**:
```tsx
<Link
  href="/my-team"
  className="w-full sm:w-auto px-6 py-3 rounded-lg border-2 font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-2"
  style={{ 
    borderColor: 'var(--team-primary)',
    color: 'var(--team-primary)'
  }}
>
  <span>View All My Team</span>
  <span>→</span>
</Link>
```

---

## 2. Navigation Menu Structure

### 2.1 Desktop Side Navigation

**Layout**:
```
┌─────────────────────────────────────┐
│  🏠 Dashboard                        │
│                                      │
│  ━━━ ⚽ Fantasy Football ━━━        │
│  [FPL Green Header, Expandable]      │
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

**Component**: `ExpandableNavSection`

**Design Specifications**:

| Property | Value |
|----------|-------|
| **Section Header Height** | 48px |
| **Section Header Padding** | 12px horizontal |
| **Section Header Background** | Colored (FPL green or team color, 20% opacity) |
| **Section Header Typography** | 16px bold |
| **Expand/Collapse Icon** | Chevron (right side) |
| **Sub-Item Height** | 44px |
| **Sub-Item Padding** | 12px horizontal, 8px vertical |
| **Sub-Item Indentation** | 24px (to show hierarchy) |
| **Sub-Item Icon** | 20px |
| **Active State** | Colored background (30% opacity) |

**Section Header Implementation**:
```tsx
<button
  onClick={() => setIsExpanded(!isExpanded)}
  className={`w-full px-3 py-3 rounded-lg flex items-center justify-between transition-all ${
    isFPL 
      ? 'bg-[var(--fpl-primary)]/20 hover:bg-[var(--fpl-primary)]/30' 
      : 'bg-[var(--team-primary)]/20 hover:bg-[var(--team-primary)]/30'
  }`}
>
  <div className="flex items-center gap-2">
    <span className="text-xl">{icon}</span>
    <span className={`font-bold text-sm ${
      isFPL ? 'text-[var(--fpl-primary)]' : 'text-[var(--team-primary)]'
    }`}>
      {title}
    </span>
  </div>
  <svg
    className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
</button>
```

**Sub-Menu Item Implementation**:
```tsx
<Link
  href={href}
  className={`flex items-center gap-3 px-6 py-2 rounded-lg transition-all ${
    isActive 
      ? (isFPL 
          ? 'bg-[var(--fpl-primary)]/30 text-[var(--fpl-primary)]' 
          : 'bg-[var(--team-primary)]/30')
      : 'hover:bg-[var(--pl-dark)]/50 text-[var(--pl-text-muted)]'
  }`}
>
  <span className="text-lg">{icon}</span>
  <span className="text-sm font-medium">{label}</span>
</Link>
```

---

### 2.2 Mobile Bottom Navigation + Drawer

**Bottom Navigation** (Always Visible):
```
┌─────────────────────────────────────────┐
│  [🏠] [⚽] [🏆] [⚙️]                    │
│  Dash  FPL  Team  Set                    │
└─────────────────────────────────────────┘
```

**Design**:
- 4 items: Dashboard, Fantasy Football, My Team, Settings
- Icons: 24x24px
- Labels: 12px, below icon
- Touch target: 44x44px minimum
- Active state: Colored background (FPL green or team color)

**Drawer Navigation** (Opens when tapping Fantasy Football or My Team):
```
┌─────────────────────────────────────────┐
│  ⚽ FANTASY FOOTBALL          [✕]       │
│  ──────────────────────────────────── │
│                                         │
│  📊 Overview                            │
│  ⚽ My Squad                            │
│  🔄 Transfers                           │
│  👑 Captain Pick                        │
│  📈 Analytics                           │
│  🏆 Leagues                             │
│  📰 FPL News                            │
│                                         │
│  [Back]                                 │
└─────────────────────────────────────────┘
```

**Drawer Design**:
- Full-screen overlay (mobile)
- Slide-in animation (from bottom or side)
- Section header at top
- Close button (X) in top-right
- Sub-items: Full-width, 56px height
- Touch-friendly: 56px minimum height

---

## 3. Fantasy Football Section Pages

### 3.1 Page Structure

**Pages**:
- `/fantasy-football` - Overview
- `/fantasy-football/squad` - Squad view
- `/fantasy-football/transfers` - Transfer tools
- `/fantasy-football/captain` - Captain pick
- `/fantasy-football/analytics` - FPL analytics
- `/fantasy-football/leagues` - Leagues
- `/fantasy-football/news` - FPL news

### 3.2 Page Header Design

**Component**: `FPLPageHeader`

**Layout**:
```
┌─────────────────────────────────────────┐
│  ⚽ Fantasy Football                    │
│  Manage your fantasy squad              │
│  ──────────────────────────────────── │
│  [FPL green background, subtle]        │
│  [Breadcrumbs: Home > Fantasy Football] │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: ⚽, 48x48px (mobile), 64x64px (desktop)
- Title: "Fantasy Football" or page-specific title
- Subtitle: "Manage your fantasy squad"
- Background: FPL green tint (10-20% opacity)
- Border: 3px bottom border, FPL green
- Breadcrumbs: Above header or below

---

### 3.3 Sub-Navigation Design

**Component**: `FPLSubNavigation`

**Layout** (Horizontal tabs below header):
```
┌─────────────────────────────────────────┐
│  [Overview] [Squad] [Transfers] [Captain]│
│  [Analytics] [Leagues] [News]            │
│  [FPL green active state]                │
└─────────────────────────────────────────┘
```

**Design**:
- Horizontal scrollable tabs (mobile)
- Full-width tabs (desktop)
- Active tab: FPL green background, white text
- Inactive tabs: Transparent, muted text
- Touch-friendly: 44px height minimum

---

## 4. My Team Section Pages

### 4.1 Page Structure

**Pages**:
- `/my-team` - Overview
- `/my-team/fixtures` - Fixtures
- `/my-team/news` - Team news
- `/my-team/standings` - Standings
- `/my-team/analytics` - Team analytics

### 4.2 Page Header Design

**Component**: `TeamPageHeader`

**Layout**:
```
┌─────────────────────────────────────────┐
│  🏆 My Team                             │
│  Arsenal                                │
│  Follow your favorite club              │
│  ──────────────────────────────────── │
│  [Team color background, subtle]        │
│  [Breadcrumbs: Home > My Team]          │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: 🏆 or team logo, 48x48px (mobile), 64x64px (desktop)
- Title: "My Team" or "[Team Name]"
- Subtitle: "Follow your favorite club"
- Background: Team color tint (10-20% opacity)
- Border: 3px bottom border, team primary color
- Breadcrumbs: Above header or below

---

### 4.3 Sub-Navigation Design

**Component**: `TeamSubNavigation`

**Layout** (Horizontal tabs below header):
```
┌─────────────────────────────────────────┐
│  [Overview] [Fixtures] [News]          │
│  [Standings] [Analytics]                │
│  [Team color active state]              │
└─────────────────────────────────────────┘
```

**Design**:
- Horizontal scrollable tabs (mobile)
- Full-width tabs (desktop)
- Active tab: Team color background, white text
- Inactive tabs: Transparent, muted text
- Touch-friendly: 44px height minimum

---

## 5. FPL News Feature (New)

### 5.1 FPL News Page Design

**Page**: `/fantasy-football/news`

**Layout**:
```
┌─────────────────────────────────────────┐
│  ⚽ FANTASY FOOTBALL NEWS                │
│  ──────────────────────────────────── │
│  [FPL green header]                     │
│                                         │
│  Filters: [All] [Injuries] [Transfers] │
│  [Price Changes] [Gameweek]            │
│                                         │
│  News Items:                            │
│  ┌──────────────────────────────────┐ │
│  │  [FPL Badge]             2h ago   │ │
│  │  Player Name: Salah              │ │
│  │  Injury Update: Minor knock...   │ │
│  │  [FPL green border]              │ │
│  └──────────────────────────────────┘ │
│                                         │
│  [More news items...]                   │
└─────────────────────────────────────────┘
```

**Content Types**:
1. **Player News**: News about players in user's squad
2. **Price Changes**: FPL price change alerts
3. **Injury News**: Injuries affecting FPL players
4. **Transfer News**: Transfers affecting FPL players
5. **Gameweek News**: Gameweek previews, deadline reminders
6. **Strategy Articles**: FPL strategy and tips

**Design Requirements**:
- FPL green branding throughout
- "FPL News" or "Fantasy Football News" label
- Player name prominently displayed
- FPL-specific badges
- Different from team news (different colors, focus)

---

## 6. Separate Analytics Pages

### 6.1 FPL Analytics Page

**Page**: `/fantasy-football/analytics`

**Layout**:
```
┌─────────────────────────────────────────┐
│  ⚽ FPL ANALYTICS                        │
│  ──────────────────────────────────── │
│  [FPL green header]                     │
│                                         │
│  Time Range: [This Season] [Last 5 GW]  │
│                                         │
│  Charts:                                │
│  • Points Progression                   │
│  • Rank Progression                     │
│  • Form Analysis                        │
│  • Chip Usage Timeline                  │
│  • Squad Value Over Time                │
│  • Transfer History                     │
│  • Captain Pick Performance             │
│                                         │
│  [FPL green chart colors]              │
└─────────────────────────────────────────┘
```

**Charts**:
- Points progression (line chart)
- Rank progression (line chart, inverted Y-axis)
- Form comparison (bar chart)
- Chip usage timeline (timeline chart)
- Squad value over time (line chart)
- Transfer history (table/timeline)
- Captain pick performance (bar chart)

**Design**:
- FPL green for chart lines/bars
- FPL green header and branding
- Consistent with existing analytics design
- Mobile-responsive charts

---

### 6.2 Team Analytics Page

**Page**: `/my-team/analytics`

**Layout**:
```
┌─────────────────────────────────────────┐
│  🏆 TEAM ANALYTICS                      │
│  Arsenal                                │
│  ──────────────────────────────────── │
│  [Team color header]                    │
│                                         │
│  Time Range: [This Season] [Last 5]    │
│                                         │
│  Charts:                                │
│  • Team Performance Metrics            │
│  • Player Statistics                    │
│  • Goal/Assist Trends                   │
│  • Form Analysis                        │
│  • Head-to-Head Records                │
│  • League Position Trends               │
│                                         │
│  [Team color chart colors]              │
└─────────────────────────────────────────┘
```

**Charts**:
- Team performance metrics (various charts)
- Player statistics (bar/table)
- Goal/assist trends (line/bar chart)
- Form analysis (bar chart)
- Head-to-head records (table/chart)
- League position trends (line chart)

**Design**:
- Team colors for chart lines/bars
- Team color header and branding
- Consistent with existing analytics design
- Mobile-responsive charts

---

## 7. Component Specifications

### 7.1 DashboardSection Component

**Component**: `DashboardSection`

**Props**:
```typescript
interface DashboardSectionProps {
  type: 'fpl' | 'team';
  title: string;
  subtitle?: string;
  icon?: string;
  teamLogo?: string;
  teamName?: string;
  children: React.ReactNode;
  viewAllHref: string;
}
```

**Usage**:
```tsx
<DashboardSection
  type="fpl"
  title="FANTASY FOOTBALL"
  subtitle="Manage your fantasy squad"
  icon="⚽"
  viewAllHref="/fantasy-football"
>
  {/* Preview content */}
</DashboardSection>
```

---

### 7.2 ExpandableNavSection Component

**Component**: `ExpandableNavSection`

**Props**:
```typescript
interface ExpandableNavSectionProps {
  type: 'fpl' | 'team';
  title: string;
  icon: string;
  items: Array<{
    icon: string;
    label: string;
    href: string;
  }>;
  defaultExpanded?: boolean;
  teamLogo?: string;
  teamName?: string;
}
```

**Usage**:
```tsx
<ExpandableNavSection
  type="fpl"
  title="FANTASY FOOTBALL"
  icon="⚽"
  defaultExpanded={true}
  items={[
    { icon: '📊', label: 'Overview', href: '/fantasy-football' },
    { icon: '⚽', label: 'My Squad', href: '/fantasy-football/squad' },
    // ... more items
  ]}
/>
```

---

### 7.3 SubNavigation Component

**Component**: `SubNavigation`

**Props**:
```typescript
interface SubNavigationProps {
  type: 'fpl' | 'team';
  items: Array<{
    label: string;
    href: string;
    icon?: string;
  }>;
  currentPath: string;
}
```

**Usage**:
```tsx
<SubNavigation
  type="fpl"
  currentPath={pathname}
  items={[
    { label: 'Overview', href: '/fantasy-football', icon: '📊' },
    { label: 'Squad', href: '/fantasy-football/squad', icon: '⚽' },
    // ... more items
  ]}
/>
```

---

## 8. Responsive Design

### Mobile (320px - 767px)
- **Dashboard**: Vertical stack, full-width sections
- **Navigation**: Bottom nav + drawer for sub-menus
- **Section Headers**: Full width, stacked
- **Preview Cards**: Single column
- **Touch Targets**: 44x44px minimum
- **Drawer**: Full-screen overlay

### Tablet (768px - 1023px)
- **Dashboard**: Vertical stack
- **Navigation**: Side nav (collapsible)
- **Section Headers**: Full width
- **Preview Cards**: 2-column grid
- **Touch Targets**: 48x48px

### Desktop (1024px+)
- **Dashboard**: Vertical stack (recommended) or side-by-side (optional)
- **Navigation**: Side nav (expanded)
- **Section Headers**: Full width
- **Preview Cards**: 2-3 column grid
- **Hover States**: Rich interactions

---

## 9. Color System

### Fantasy Football Section
- **Primary**: `#00ff87` (FPL Green)
- **Secondary**: `#04f5ff` (FPL Cyan)
- **Border**: FPL Green (4px)
- **Background Tint**: `rgba(0, 255, 135, 0.1)` (10% opacity)
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

## 10. Typography

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

## 11. Animation Guidelines

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

## 12. Accessibility Requirements

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

## 13. Developer Handoff Notes

### Key Implementation Points

1. **Create DashboardSection Component**:
   - Wrapper with colored borders and backgrounds
   - Section header
   - Preview content area
   - "View All" button

2. **Create ExpandableNavSection Component**:
   - Expandable/collapsible section header
   - Sub-menu items with hierarchy
   - Active state indicators

3. **Create SubNavigation Component**:
   - Horizontal tabs for page sub-navigation
   - Active state styling
   - Mobile scrollable

4. **Update Routing**:
   - Create `/fantasy-football/*` routes
   - Create `/my-team/*` routes
   - Update navigation links

5. **Create FPL News Feature**:
   - New page: `/fantasy-football/news`
   - FPL-specific news filtering
   - Player-focused news display

6. **Separate Analytics**:
   - FPL analytics: `/fantasy-football/analytics`
   - Team analytics: `/my-team/analytics`
   - Different branding for each

---

## 14. Testing Checklist

### Visual Testing
- [ ] Two sections clearly visible on dashboard
- [ ] Visual separation (colors, borders) obvious
- [ ] Section headers clear and distinct
- [ ] Navigation structure clear
- [ ] Sub-menus expand/collapse correctly
- [ ] Mobile drawer works correctly
- [ ] All pages use consistent branding

### Functional Testing
- [ ] Navigation works correctly
- [ ] Sub-menus navigate to correct pages
- [ ] "View All" buttons work
- [ ] Dashboard previews show correct content
- [ ] FPL News page displays correctly
- [ ] Analytics pages separate correctly
- [ ] Mobile navigation works

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces sections
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA
- [ ] Touch targets adequate

---

## 15. Success Criteria

Design phase is complete when:
- ✅ Dashboard two-section layout finalized
- ✅ Navigation structure finalized (desktop + mobile)
- ✅ Page designs finalized (FPL + Team sections)
- ✅ FPL News feature designed
- ✅ Analytics separation designed
- ✅ Component specifications complete
- ✅ Accessibility requirements met
- ✅ Developer handoff document created

---

**Design Specification Complete! 🎨**

This document provides complete design specifications for restructuring the dashboard into two clear sections. All components are designed with clear visual distinction, intuitive navigation, and accessibility in mind.

**Ready for Developer Handoff**


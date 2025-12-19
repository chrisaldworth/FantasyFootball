# UI/UX Overhaul - Phase 1 Design Specification

**Designer**: UI Designer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P0 (Critical)  
**Phase**: Foundation (Week 1-2)

---

## Overview

This document provides complete design specifications for Phase 1 of the UI/UX overhaul, focusing on transforming the dashboard into a beautiful, engaging "Command Center" that keeps users' eyes on the screen and makes the most-used features easily accessible.

**Goal**: Create a clear information hierarchy, remove tab clutter, and make key features one-tap away.

---

## Design Principles Applied

1. **Visual Hierarchy**: Most important content = largest, most prominent
2. **Progressive Disclosure**: Show essentials first, details on demand
3. **Mobile-First**: Touch-friendly, thumb-accessible navigation
4. **Engagement Hooks**: Live indicators, countdown timers, progress bars
5. **Contextual Intelligence**: Show what matters right now

---

## 1. New Dashboard Layout - "Command Center"

### Screen: Dashboard - Mobile (320px - 767px)

**Purpose**: Single-column, scrollable dashboard with clear hierarchy

**Layout**:
```
┌─────────────────────────────────────────┐
│  TOP NAVIGATION (Fixed)                 │
│  [Logo] [🔔] [Profile]                  │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  HERO SECTION                     │  │
│  │  "What's Important Right Now"     │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  LIVE RANK (if live GW)     │ │  │
│  │  │  #12,345  ↑ 234             │ │  │
│  │  │  [Pulsing indicator]        │ │  │
│  │  └─────────────────────────────┘ │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  NEXT FIXTURE COUNTDOWN     │ │  │
│  │  │  Arsenal vs Chelsea         │ │  │
│  │  │  ⏰ 2d 14h 23m               │ │  │
│  │  └─────────────────────────────┘ │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  KEY ALERTS                  │ │  │
│  │  │  ⚠️ 2 injuries               │ │  │
│  │  │  💰 Price change alert       │ │  │
│  │  └─────────────────────────────┘ │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  FAVORITE TEAM SECTION            │  │
│  │  [Team Logo] Arsenal              │  │
│  │  ───────────────────────────────  │  │
│  │                                   │  │
│  │  ┌─────────────────────────────┐ │  │
│  │  │  NEXT MATCH (Large Card)     │ │  │
│  │  │  [Badge] Arsenal vs [Badge] │ │  │
│  │  │  Sat, Dec 21 • 3:00 PM       │ │  │
│  │  │  [View Details Button]       │ │  │
│  │  └─────────────────────────────┘ │  │
│  │                                   │  │
│  │  📰 TOP NEWS (3 cards, swipeable) │ │  │
│  │  [Image] Story Title              │ │  │
│  │  [Image] Story Title              │ │  │
│  │  [Image] Story Title              │ │  │
│  │                                   │  │
│  │  📊 STANDINGS                    │ │  │
│  │  Position: 3rd (↑1)              │ │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  FPL OVERVIEW                      │  │
│  │  ───────────────────────────────  │  │
│  │                                   │  │
│  │  ┌──────┐ ┌──────┐                │  │
│  │  │Points│ │Rank │                │  │
│  │  │1,234 │ │12K  │                │  │
│  │  │      │ │↑234 │                │  │
│  │  └──────┘ └──────┘                │  │
│  │                                   │  │
│  │  ┌──────┐ ┌──────┐                │  │
│  │  │Value │ │Bank │                │  │
│  │  │£100m│ │£2.5m│                │  │
│  │  └──────┘ └──────┘                │  │
│  │                                   │  │
│  │  📈 RANK TREND (Mini Chart)      │  │
│  │  [Small line chart]              │  │
│  │                                   │  │
│  │  ⚽ GW PERFORMANCE                │  │
│  │  Points: 68 | Rank: #5,678      │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  QUICK ACTIONS                     │  │
│  │  ───────────────────────────────  │  │
│  │  [🤖 Transfer] [👑 Captain]      │  │
│  │  [⚽ Team] [📊 Analytics]         │  │
│  │  [📅 Fixtures]                    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  RECENT RESULTS (Ticker)           │  │
│  │  [← Scroll →]                     │  │
│  │  Arsenal 2-1 Chelsea              │  │
│  │  Liverpool 3-0 Man City            │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  ANALYTICS PREVIEW (Collapsible)   │  │
│  │  [▼ Expand]                        │  │
│  │  📊 Key Metrics                    │  │
│  │  [Mini Charts]                    │  │
│  │  [View Full Analytics →]          │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ┌───────────────────────────────────┐  │
│  │  LEAGUES PREVIEW (Collapsible)    │  │
│  │  [▼ Expand]                        │  │
│  │  🏆 Top 3 Leagues                  │  │
│  │  [League Cards]                   │  │
│  │  [View All Leagues →]             │  │
│  └───────────────────────────────────┘  │
│                                         │
├─────────────────────────────────────────┤
│  BOTTOM NAVIGATION (Fixed)              │
│  [🏠] [⚽] [📊] [🏆] [⚙️]              │
└─────────────────────────────────────────┘
│  FLOATING ACTION BUTTON (Fixed)        │
│  [🤖] (Transfer Assistant)              │
└─────────────────────────────────────────┘
```

**Key Components**:
- Hero Section (live rank, countdown, alerts)
- Favorite Team Section (match, news, standings)
- FPL Overview (stats, trend, performance)
- Quick Actions Bar
- Recent Results Ticker
- Analytics Preview (collapsible)
- Leagues Preview (collapsible)
- Bottom Navigation
- Floating Action Button

**States**:
- **Loading**: Skeleton loaders for each section
- **Loaded**: All content visible
- **Live Gameweek**: Hero section shows live rank prominently
- **No FPL Team**: Hide FPL sections, show connect prompt
- **No Favorite Team**: Show team selection prompt

**Edge Cases**:
- First-time user (onboarding flow)
- No data available (empty states)
- Network error (retry buttons)
- Very long content (scrollable sections)

---

### Screen: Dashboard - Desktop (1024px+)

**Purpose**: Multi-column layout with side navigation

**Layout**:
```
┌─────────────────────────────────────────────────────────────────────┐
│  TOP NAVIGATION (Fixed)                                             │
│  [Logo] [Quick Actions] [🔔] [Profile]                             │
├──────────┬──────────────────────────────────────────────────────────┤
│          │                                                          │
│  SIDE    │  ┌────────────────────────────────────────────────────┐  │
│  NAV     │  │  HERO SECTION (2-column grid)                     │  │
│          │  │  ┌──────────────┐  ┌──────────────┐              │  │
│  🏠 Dash │  │  │ LIVE RANK    │  │ NEXT FIXTURE │              │  │
│  ⚽ Team │  │  │ #12,345 ↑234 │  │ Countdown    │              │  │
│  📊 Anal │  │  └──────────────┘  └──────────────┘              │  │
│  🏆 Leag │  │  ┌──────────────────────────────────────┐        │  │
│  📅 Fix  │  │  │ KEY ALERTS                           │        │  │
│  ⚙️ Set  │  │  └──────────────────────────────────────┘        │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                          │
│          │  ┌──────────────────┐  ┌──────────────────┐            │
│          │  │ FAVORITE TEAM    │  │ FPL OVERVIEW     │            │
│          │  │ [Team Header]    │  │ [Large Stats]    │            │
│          │  │ [Next Match]     │  │ [Rank Trend]     │            │
│          │  │ [News Feed]      │  │ [GW Performance] │            │
│          │  │ [Standings]      │  │ [Quick Actions]  │            │
│          │  └──────────────────┘  └──────────────────┘            │
│          │                                                          │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ QUICK ACTIONS BAR (Horizontal)                     │  │
│          │  │ [🤖 Transfer] [👑 Captain] [⚽ Team] [📊] [📅]   │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                          │
│          │  ┌──────────────────┐  ┌──────────────────┐            │
│          │  │ RECENT RESULTS   │  │ UPCOMING FIXTURES│            │
│          │  │ [Ticker]         │  │ [Ticker]         │            │
│          │  └──────────────────┘  └──────────────────┘            │
│          │                                                          │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ ANALYTICS PREVIEW (Collapsible)                    │  │
│          │  │ [Mini Charts] [View Full →]                       │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                          │
│          │  ┌────────────────────────────────────────────────────┐  │
│          │  │ LEAGUES PREVIEW (Collapsible)                     │  │
│          │  │ [Top 3 Leagues] [View All →]                     │  │
│          │  └────────────────────────────────────────────────────┘  │
│          │                                                          │
└──────────┴──────────────────────────────────────────────────────────┘
```

**Key Differences from Mobile**:
- Side navigation instead of bottom nav
- 2-column grid for hero section
- Side-by-side sections (Favorite Team + FPL Overview)
- Horizontal quick actions bar
- More content visible without scrolling

---

## 2. Component Specifications

### 2.1 Hero Section - "What's Important Right Now"

**Component**: `HeroSection`

| Property | Value |
|----------|-------|
| **Purpose** | Show most important information at a glance |
| **Variants** | Live Gameweek, Upcoming Gameweek, Post Gameweek |
| **States** | Loading, Loaded, Error, Empty |
| **Layout** | Mobile: Stacked, Desktop: 2-column grid |
| **Components** | LiveRankCard, CountdownTimer, KeyAlerts |

**Visual Design**:
- Container: `glass rounded-2xl p-6 mb-6`
- Background: Team-themed gradient (subtle)
- Spacing: `gap-4` between cards
- Typography: Large numbers (32px mobile, 48px desktop)

**Live Rank Card**:
- Size: Full width (mobile), 50% width (desktop)
- Height: `min-h-[200px]` (mobile), `min-h-[240px]` (desktop)
- Background: Team primary color (20% opacity) + glass effect
- Rank Number: `text-4xl sm:text-6xl font-bold`
- Change Indicator: `text-2xl` with color coding
- Animation: Subtle pulse on live updates

**Countdown Timer**:
- Size: Full width (mobile), 50% width (desktop)
- Format: "2d 14h 23m" or "In 2 days"
- Typography: `text-2xl sm:text-3xl font-bold`
- Color: Team secondary color
- Icon: Clock emoji or SVG

**Key Alerts**:
- Max 3 alerts visible
- Format: Icon + Text + Action button
- Colors: Red (urgent), Yellow (warning), Blue (info)
- Scrollable if more than 3

---

### 2.2 Favorite Team Section

**Component**: `FavoriteTeamSection`

| Property | Value |
|----------|-------|
| **Purpose** | Keep users engaged with their favorite team |
| **Variants** | With Team, No Team Selected |
| **States** | Loading, Loaded, Error, Empty |
| **Layout** | Mobile: Stacked, Desktop: Side-by-side with FPL |

**Team Header**:
- Logo: 64x64px (mobile), 80x80px (desktop)
- Team Name: `text-2xl sm:text-3xl font-bold`
- Position: `text-lg text-[var(--pl-text-muted)]`
- Background: Team colors (subtle gradient)

**Next Match Card**:
- Size: Full width, `min-h-[200px]`
- Layout: Team badges (64x64px) + Match info
- Date/Time: Prominent, large typography
- CTA: "View Details" button (full width mobile, inline desktop)
- Background: Team-themed with glass effect

**News Feed**:
- Format: Horizontal scrollable cards
- Card Size: 280px width, 200px height
- Image: 16:9 aspect ratio, rounded corners
- Title: 2 lines max, ellipsis
- Swipeable on mobile, hover states on desktop

**Standings**:
- Compact card format
- Position: Large number, color-coded
- Change: Arrow indicator (↑↓)
- Link: "View Full Standings"

---

### 2.3 FPL Overview Section

**Component**: `FPLOverview`

| Property | Value |
|----------|-------|
| **Purpose** | Quick snapshot of FPL performance |
| **Variants** | With FPL Team, No FPL Team |
| **States** | Loading, Loaded, Error, Empty |
| **Layout** | Grid: 2x2 (mobile), 4x1 (desktop) |

**Stat Cards**:
- Size: `min-h-[120px]` (mobile), `min-h-[140px]` (desktop)
- Grid: `grid-cols-2 gap-4` (mobile), `grid-cols-4 gap-6` (desktop)
- Label: `text-sm text-[var(--pl-text-muted)]`
- Value: `text-3xl sm:text-4xl font-bold`
- Color: Team primary for value
- Trend: Small arrow + number below value

**Rank Trend Chart**:
- Height: `h-32` (mobile), `h-40` (desktop)
- Type: Mini line chart (last 6 gameweeks)
- Color: Team secondary color
- Tooltip: Show on hover/tap

**Gameweek Performance**:
- Format: Card with points and rank
- Points: Large, green color
- Rank: Medium, with change indicator
- Link: "View Full Stats"

---

### 2.4 Quick Actions Bar

**Component**: `QuickActionsBar`

| Property | Value |
|----------|-------|
| **Purpose** | Most-used features always accessible |
| **Variants** | Mobile (Floating), Desktop (Horizontal) |
| **States** | Default, Active, Disabled |
| **Actions** | Transfer, Captain, Team, Analytics, Fixtures |

**Mobile (Floating Action Button)**:
- Position: Fixed bottom-right
- Size: 56x56px (main button)
- Icon: Most-used action (Transfer Assistant)
- Badge: Red dot if new recommendations
- Menu: Expandable on tap (other actions)

**Desktop (Horizontal Bar)**:
- Position: Top navigation area or below hero
- Layout: `flex gap-4`
- Size: `h-12`, buttons `min-w-[120px]`
- Format: Icon + Label
- Badge: Red dot on icon if new
- Hover: Show preview/tooltip

**Button Design**:
- Background: Team primary color (gradient)
- Text: White or team text-on-primary
- Icon: 24x24px
- Border Radius: `rounded-lg`
- Hover: Scale 1.05, brighter
- Active: Scale 0.95
- Touch Target: Minimum 44x44px

---

### 2.5 Navigation Components

#### Mobile Bottom Navigation

**Component**: `BottomNavigation`

| Property | Value |
|----------|-------|
| **Purpose** | Thumb-friendly navigation |
| **Position** | Fixed bottom |
| **Height** | 64px |
| **Items** | 5 max (Dashboard, Team, Analytics, Leagues, Settings) |

**Design**:
- Background: `glass` with backdrop blur
- Border: Top border `border-t border-white/10`
- Icons: 24x24px, centered
- Labels: `text-xs` below icon
- Active: Team primary color, icon + label
- Inactive: `text-[var(--pl-text-muted)]`
- Touch Target: Full button area (minimum 44x44px)

**Items**:
- 🏠 Dashboard (Home)
- ⚽ My Team (FPL Team View)
- 📊 Analytics
- 🏆 Leagues
- ⚙️ Settings

#### Desktop Side Navigation

**Component**: `SideNavigation`

| Property | Value |
|----------|-------|
| **Purpose** | Main navigation for desktop |
| **Position** | Fixed left |
| **Width** | 240px (expanded), 64px (collapsed) |
| **State** | Expandable/collapsible |

**Design**:
- Background: `glass` with backdrop blur
- Border: Right border `border-r border-white/10`
- Items: Icon + Label (expanded), Icon only (collapsed)
- Active: Team primary color background
- Hover: Subtle background change
- Collapse Button: Top-right corner

**Items** (same as mobile):
- 🏠 Dashboard
- ⚽ My Team
- 📊 Analytics
- 🏆 Leagues
- 📅 Fixtures
- ⚙️ Settings

#### Top Navigation

**Component**: `TopNavigation`

| Property | Value |
|----------|-------|
| **Purpose** | Global navigation and actions |
| **Position** | Fixed top |
| **Height** | 64px |
| **Layout** | Logo | Quick Actions | Notifications | Profile |

**Design**:
- Background: `glass` with backdrop blur
- Border: Bottom border `border-b border-white/10`
- Logo: Left side, 40x40px
- Quick Actions: Center (desktop only)
- Notifications: Right side, badge for count
- Profile: Right side, avatar or icon

---

### 2.6 Collapsible Sections

**Component**: `CollapsibleSection`

| Property | Value |
|----------|-------|
| **Purpose** | Progressive disclosure for detailed content |
| **Variants** | Analytics Preview, Leagues Preview |
| **States** | Collapsed, Expanded, Loading |

**Design**:
- Header: Clickable, shows title + expand/collapse icon
- Content: Hidden when collapsed, smooth expand animation
- Animation: `transition-all duration-300 ease-in-out`
- Icon: Chevron down (collapsed), chevron up (expanded)
- CTA: "View Full [Section]" button at bottom

**Analytics Preview**:
- Shows: 2-3 mini charts (points, rank, value)
- Height: `h-48` when expanded
- CTA: "View Full Analytics" → Navigate to analytics page

**Leagues Preview**:
- Shows: Top 3 leagues with rank
- Format: Compact cards
- CTA: "View All Leagues" → Navigate to leagues page

---

## 3. Design System

### 3.1 Color System

**Team Theme Colors** (Existing):
- `--team-primary`: Main brand color
- `--team-secondary`: Complementary color
- `--team-accent`: Tertiary color
- `--team-text-on-primary`: Text on primary backgrounds
- `--team-text-on-secondary`: Text on secondary backgrounds

**Semantic Colors**:
- **Success**: `#00ff87` (green) - Good performance, positive changes
- **Warning**: `#ffa500` (orange) - Attention needed, medium priority
- **Error/Urgent**: `#e90052` (red/pink) - Urgent alerts, negative changes
- **Info**: `#04f5ff` (cyan) - Informational content
- **Neutral**: Gray scale for backgrounds, borders

**Usage**:
- Live indicators: Team primary with pulse animation
- Rank up: Success green
- Rank down: Error red
- Alerts: Context-appropriate color
- Backgrounds: Glass morphism with team color tints

### 3.2 Typography System

**Font Family**:
- Primary: Space Grotesk (existing)
- Fallback: System fonts (sans-serif)

**Font Sizes**:
- **Hero Numbers**: 48px (mobile), 72px (desktop) - `text-5xl sm:text-7xl`
- **Section Headings**: 24px (mobile), 32px (desktop) - `text-2xl sm:text-3xl`
- **Card Headings**: 20px (mobile), 24px (desktop) - `text-xl sm:text-2xl`
- **Body Text**: 16px (mobile), 18px (tablet), 16px (desktop) - `text-base sm:text-lg`
- **Small Text**: 12px (mobile), 14px (desktop) - `text-xs sm:text-sm`
- **Labels**: 14px (mobile), 16px (desktop) - `text-sm sm:text-base`

**Font Weights**:
- **Bold**: 700 - Headings, important numbers
- **Semibold**: 600 - Subheadings, labels
- **Regular**: 400 - Body text
- **Light**: 300 - Muted text

**Line Heights**:
- Headings: 1.2
- Body: 1.5
- Small: 1.4

### 3.3 Spacing System

**Base Unit**: 4px

**Spacing Scale**:
- **XS**: 4px - `gap-1`, `p-1`
- **SM**: 8px - `gap-2`, `p-2`
- **MD**: 16px - `gap-4`, `p-4`
- **LG**: 24px - `gap-6`, `p-6`
- **XL**: 32px - `gap-8`, `p-8`
- **2XL**: 48px - `gap-12`, `p-12`
- **3XL**: 64px - `gap-16`, `p-16`

**Component Spacing**:
- **Cards**: 16px padding (mobile), 24px (desktop)
- **Sections**: 24px gap (mobile), 32px (desktop)
- **Page**: 16px padding (mobile), 32px (desktop)
- **Grid Gap**: 16px (mobile), 24px (desktop)

### 3.4 Component Styles

**Cards**:
- Border Radius: 12px (mobile), 16px (desktop) - `rounded-xl sm:rounded-2xl`
- Background: `glass` (rgba(26, 26, 46, 0.7) with backdrop blur)
- Border: `border border-white/10`
- Shadow: Subtle glow effect
- Padding: `p-4 sm:p-6`
- Hover: Scale 1.02, brighter background (desktop only)

**Buttons**:
- **Primary**: Team primary gradient, white text
- **Secondary**: Outlined, transparent background
- **Size**: Minimum 44x44px touch target
- **Border Radius**: 8px - `rounded-lg`
- **Padding**: `px-4 py-2` (mobile), `px-6 py-3` (desktop)
- **Hover**: Scale 1.05, brighter colors
- **Active**: Scale 0.95, darker colors

**Inputs**:
- Height: 44px minimum
- Border Radius: 8px - `rounded-lg`
- Background: Dark with glass effect
- Border: `border border-white/10`
- Focus: Border color change, glow effect
- Padding: `px-4 py-2`

---

## 4. Responsive Breakpoints

### Mobile (320px - 767px)
- **Layout**: Single column, stacked
- **Navigation**: Bottom nav bar
- **Cards**: Full width
- **Touch Targets**: Minimum 44x44px
- **Typography**: 16px base
- **Spacing**: 16px minimum padding
- **Gestures**: Swipe, pull-to-refresh

### Tablet (768px - 1023px)
- **Layout**: 2-column grid where appropriate
- **Navigation**: Side nav (collapsible)
- **Cards**: 2-column grid
- **Touch Targets**: 48x48px
- **Typography**: 18px base
- **Spacing**: 24px padding

### Desktop (1024px+)
- **Layout**: Multi-column (3-4 columns)
- **Navigation**: Top + Side nav
- **Cards**: Grid layout
- **Hover States**: Rich interactions
- **Typography**: 16px base, larger for emphasis
- **Spacing**: 32px padding

---

## 5. Interaction Patterns

### Animations

**Transitions**:
- Default: `transition-all duration-300 ease-in-out`
- Fast: `duration-150` (hover states)
- Slow: `duration-500` (page transitions)

**Animations**:
- **Pulse**: `animate-pulse` for live data (subtle, 2s duration)
- **Slide**: Smooth slide for modals, drawers
- **Fade**: `opacity-0` to `opacity-100` for content changes
- **Bounce**: Subtle bounce for achievements (future)

**Performance**:
- Use CSS transforms (not position changes)
- Use `will-change` sparingly
- Limit animations to 60fps
- Respect `prefers-reduced-motion`

### Gestures

**Mobile**:
- **Swipe**: Horizontal scroll for news, results ticker
- **Pull-to-Refresh**: Refresh dashboard content
- **Tap**: All interactive elements
- **Long Press**: Context menus (future)

**Desktop**:
- **Hover**: Show previews, tooltips
- **Click**: All interactive elements
- **Keyboard**: Full navigation support

---

## 6. Accessibility Requirements

### WCAG AA Compliance

**Color Contrast**:
- Text: 4.5:1 minimum
- UI Elements: 3:1 minimum
- Interactive Elements: Clear focus indicators

**Keyboard Navigation**:
- All interactive elements accessible via keyboard
- Tab order: Logical flow
- Focus indicators: Visible, clear
- Skip links: For main content

**Screen Reader**:
- ARIA labels on all interactive elements
- Semantic HTML structure
- Live regions for dynamic updates
- Descriptive alt text for images

**Touch Targets**:
- Minimum 44x44px on mobile
- Generous spacing between interactive elements
- Clear visual feedback on interaction

**Motion**:
- Respect `prefers-reduced-motion`
- Provide alternative for animated content
- No essential information in motion only

---

## 7. Edge Cases & Error States

### Loading States
- Skeleton loaders matching component structure
- Shimmer animation
- Show for minimum 200ms (prevent flash)

### Error States
- Error message with retry button
- Icon: ⚠️
- Message: Clear, actionable
- Retry: Calls same fetch function

### Empty States
- Friendly message with icon
- Suggestion: What user can do next
- CTA: Primary action button

### No Data States
- "No data available yet"
- Context-specific message
- Suggestion: When data will appear

---

## 8. Developer Handoff Notes

### Component Structure
```
frontend/src/components/
  ├── dashboard/
  │   ├── HeroSection.tsx
  │   ├── LiveRankCard.tsx
  │   ├── CountdownTimer.tsx
  │   ├── KeyAlerts.tsx
  │   ├── FavoriteTeamSection.tsx
  │   ├── NextMatchCard.tsx
  │   ├── NewsFeed.tsx
  │   ├── FPLOverview.tsx
  │   ├── StatCard.tsx
  │   ├── RankTrendChart.tsx
  │   ├── QuickActionsBar.tsx
  │   ├── RecentResultsTicker.tsx
  │   ├── AnalyticsPreview.tsx
  │   └── LeaguesPreview.tsx
  ├── navigation/
  │   ├── TopNavigation.tsx
  │   ├── SideNavigation.tsx
  │   ├── BottomNavigation.tsx
  │   └── NavigationItem.tsx
  └── shared/
      ├── CollapsibleSection.tsx
      ├── StatCard.tsx
      └── EmptyState.tsx
```

### Key Implementation Notes

1. **Remove Tab System**: Replace current tab navigation with priority-based layout
2. **Hero Section**: Always visible, most prominent
3. **Progressive Disclosure**: Use collapsible sections for detailed content
4. **Mobile-First**: Start with mobile layout, enhance for desktop
5. **Team Theming**: Use existing `TeamThemeProvider` and CSS variables
6. **Performance**: Lazy load collapsible sections, optimize images
7. **Accessibility**: Add ARIA labels, keyboard navigation, focus states

### Dependencies
- Existing: `@/lib/team-theme-context`, `@/lib/api`, `@/lib/auth-context`
- New: None (use existing design system)

### Data Requirements
- Hero Section: Live rank, next fixture, alerts
- Favorite Team: Team info, news, fixtures, standings
- FPL Overview: Team stats, history, current picks
- Quick Actions: Available tools, badge counts
- Analytics Preview: Mini charts from history
- Leagues Preview: Top 3 leagues from team data

---

## 9. Testing Checklist

### Visual Testing
- [ ] All components render correctly
- [ ] Team theming applied throughout
- [ ] WCAG AA contrast verified
- [ ] Responsive on 320px, 768px, 1024px+
- [ ] No horizontal scroll on mobile
- [ ] Touch targets minimum 44x44px

### Functional Testing
- [ ] Navigation works on all breakpoints
- [ ] Quick actions accessible
- [ ] Collapsible sections expand/collapse
- [ ] Live data updates correctly
- [ ] Empty states display properly
- [ ] Error states handle gracefully

### Performance Testing
- [ ] Dashboard loads < 2s
- [ ] Smooth animations (60fps)
- [ ] No layout shift during load
- [ ] Images optimized and lazy-loaded

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces updates
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA

---

## 10. Next Steps

1. **Review & Approval**: Stakeholder review of design spec
2. **Hand off to Developer**: Create `docs/ui-ux-overhaul-handoff-developer.md`
3. **Implementation**: Developer implements Phase 1
4. **Testing**: Tester validates implementation
5. **Iteration**: Refine based on feedback

---

**Design Specification Complete! 🎨**

This document provides complete design specifications for Phase 1 of the UI/UX overhaul. All components are designed with user engagement, beautiful design, and accessibility in mind.

**Ready for Developer Handoff**


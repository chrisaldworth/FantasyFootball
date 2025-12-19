# Fantasy Football vs My Team - Differentiation Design Specification

**Designer**: UI Designer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P1 (High)

---

## Overview

This document provides complete design specifications for clearly differentiating Fantasy Football (FPL) content from Favorite Team (My Team) content throughout the entire application. The goal is to make it **instantly clear** what's FPL vs favorite team using color, icons, structure, and terminology.

**Key Principle**: Never mix colors - FPL sections use FPL colors, favorite team sections use team colors.

---

## Design Principles

1. **Visual Hierarchy**: FPL green/cyan for FPL, team colors for favorite team
2. **Consistency**: Same treatment across all pages and components
3. **Clarity**: Users instantly know what's FPL vs favorite team
4. **Context Awareness**: Use appropriate branding for each content type
5. **Never Mix**: FPL sections never use team colors (except for player team info)

---

## 1. Color System Differentiation

### 1.1 FPL (Fantasy Football) Colors

**Color Palette**:
- **Primary**: `#00ff87` (FPL Green)
- **Secondary**: `#04f5ff` (FPL Cyan)
- **Accent**: `#e90052` (FPL Pink) - for highlights, urgent items
- **Text on FPL**: `#0d0d0d` (dark) for contrast on green backgrounds
- **Background Tint**: `rgba(0, 255, 135, 0.1)` (10% opacity)

**Usage**:
- All FPL sections, buttons, badges, cards, borders
- Navigation items for FPL
- Section headers for FPL
- Quick actions for FPL
- News badges for FPL player news

**CSS Variables** (add to `globals.css`):
```css
:root {
  --fpl-primary: #00ff87;
  --fpl-secondary: #04f5ff;
  --fpl-accent: #e90052;
  --fpl-text-on-primary: #0d0d0d;
  --fpl-bg-tint: rgba(0, 255, 135, 0.1);
}
```

---

### 1.2 Favorite Team Colors

**Color Palette**:
- **Primary**: `var(--team-primary)` (from existing theme)
- **Secondary**: `var(--team-secondary)` (from existing theme)
- **Accent**: `var(--team-accent)` (from existing theme)
- **Text on Team**: `var(--team-text-on-primary)` (from existing theme)
- **Background Tint**: Team color with 10% opacity

**Usage**:
- All favorite team sections, buttons, badges, cards, borders
- Navigation items for favorite team
- Section headers for favorite team
- Quick actions for favorite team
- News badges for team news

---

### 1.3 Color Application Rules

**FPL Sections**:
- Border: `border-[3px] border-[var(--fpl-primary)]` or `border-[var(--fpl-secondary)]`
- Background: `bg-[var(--fpl-bg-tint)]`
- Text: `text-[var(--fpl-primary)]` for headings
- Buttons: `bg-[var(--fpl-primary)]` with `text-[var(--fpl-text-on-primary)]`

**Favorite Team Sections**:
- Border: `border-[3px] border-[var(--team-primary)]`
- Background: Team color with 10% opacity
- Text: `text-[var(--team-primary)]` for headings
- Buttons: `bg-[var(--team-primary)]` with `text-[var(--team-text-on-primary)]`

**Never Mix**:
- ❌ FPL section using team colors
- ❌ Favorite team section using FPL colors
- ✅ Exception: Player team info in FPL context (e.g., "Salah (Liverpool)")

---

## 2. Icon System Differentiation

### 2.1 FPL Icons

**Primary Icon**: ⚽ (Soccer Ball)
- Size: 24x24px (mobile), 28x28px (desktop)
- Usage: FPL navigation, section headers, buttons, cards

**Alternative Icons**:
- 📊 (Chart) - for FPL Analytics
- 🎮 (Game Controller) - alternative for FPL sections
- 📈 (Trending Up) - for FPL Performance

**Icon Usage**:
- Navigation: ⚽ "Fantasy Football"
- Section Headers: ⚽ "My FPL Team"
- Buttons: ⚽ "View FPL Squad"
- Cards: ⚽ Badge for FPL content
- Quick Actions: ⚽ for FPL actions

---

### 2.2 Favorite Team Icons

**Primary Icon**: 🏆 (Trophy)
- Size: 24x24px (mobile), 28x28px (desktop)
- Usage: Favorite team navigation, section headers, buttons, cards

**Alternative Icons**:
- Team Logo/Badge - when available, use actual team logo
- 🎯 (Target) - alternative for favorite team focus
- 📅 (Calendar) - for fixtures
- 📰 (Newspaper) - for news

**Icon Usage**:
- Navigation: 🏆 "My Team"
- Section Headers: 🏆 "[Team Name]" or team logo
- Buttons: 🏆 "My Team Fixtures"
- Cards: 🏆 Badge or team logo for team content
- Quick Actions: 🏆 for team actions

---

### 2.3 Icon Consistency Rules

- Same icon used throughout for same concept
- Icons are visible and clear (minimum 20x20px)
- Icons work on mobile (not too small)
- Consistent across all pages
- Icons are part of visual identity, not just decoration

---

## 3. Navigation Structure Design

### 3.1 Mobile Bottom Navigation

**Layout**:
```
┌─────────────────────────────────────────┐
│  [🏠] [⚽] [🏆] [📊] [⚙️]              │
│  Dash  FPL  Team  Anal  Set            │
└─────────────────────────────────────────┘
```

**Items**:
1. 🏠 Dashboard (Home - shows both)
2. ⚽ Fantasy Football (FPL section) - **FPL green**
3. 🏆 My Team (Favorite team section) - **Team colors**
4. 📊 Analytics (FPL analytics) - **FPL green**
5. ⚙️ Settings

**Visual Treatment**:
- Active state: Colored background (FPL green or team color)
- Inactive state: Transparent, muted text
- Icons: 24x24px
- Labels: 12px, below icon
- Touch target: Minimum 44x44px

**Design**:
```tsx
// FPL Navigation Item (Active)
className="flex flex-col items-center gap-1 bg-[var(--fpl-primary)]/20 rounded-lg p-2"

// Favorite Team Navigation Item (Active)
className="flex flex-col items-center gap-1 bg-[var(--team-primary)]/20 rounded-lg p-2"
```

---

### 3.2 Desktop Side Navigation

**Layout**:
```
┌─────────────────────────┐
│  🏠 Dashboard           │
├─────────────────────────┤
│  ⚽ FANTASY FOOTBALL    │  (Section Header - FPL green)
│  ─────────────────────  │
│    ⚽ My Squad          │
│    🏆 Leagues           │
│    📊 Analytics         │
│    📈 Performance       │
├─────────────────────────┤
│  🏆 MY TEAM             │  (Section Header - Team colors)
│  ─────────────────────  │
│    🏆 [Team Name]       │
│    📅 Fixtures          │
│    📰 News              │
│    📊 Standings          │
├─────────────────────────┤
│  ⚙️ Settings            │
└─────────────────────────┘
```

**Section Headers**:
- Height: 48px (mobile), 56px (desktop)
- Background: Subtle tint (FPL green or team color, 10% opacity)
- Border: 3px bottom border (FPL green or team color)
- Typography: 18px (mobile), 20px (desktop), bold, colored
- Icon: 24px (mobile), 28px (desktop)

**Navigation Items**:
- Height: 44px (mobile), 48px (desktop)
- Padding: 12px horizontal
- Icon: 20px, left side
- Active state: Colored background (FPL green or team color)
- Inactive state: Transparent, muted text

**Design**:
```tsx
// FPL Section Header
<div className="h-14 px-4 flex items-center gap-2 bg-[var(--fpl-bg-tint)] border-b-[3px] border-[var(--fpl-primary)]">
  <span className="text-2xl">⚽</span>
  <span className="text-lg font-bold text-[var(--fpl-primary)]">FANTASY FOOTBALL</span>
</div>

// Favorite Team Section Header
<div className="h-14 px-4 flex items-center gap-2 bg-[var(--team-primary)]/10 border-b-[3px] border-[var(--team-primary)]">
  <span className="text-2xl">🏆</span>
  <span className="text-lg font-bold" style={{ color: 'var(--team-primary)' }}>MY TEAM</span>
</div>
```

---

## 4. Dashboard Section Design

### 4.1 Section Headers

**FPL Section Header**:
```
┌─────────────────────────────────────────┐
│  ⚽ Fantasy Football                   │
│  My FPL Team                           │
│  ──────────────────────────────────── │
│  [FPL green border, 3px]                │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: ⚽, 32x32px (mobile), 40x40px (desktop)
- Title: "Fantasy Football" or "My FPL Team"
- Subtitle: "Manage your fantasy squad" (optional)
- Border: 3px bottom border, FPL green
- Background: Subtle FPL green tint (10% opacity)
- Typography: 20px (mobile), 24px (desktop), bold, FPL green

**Favorite Team Section Header**:
```
┌─────────────────────────────────────────┐
│  🏆 My Team                             │
│  Arsenal                                │
│  ──────────────────────────────────── │
│  [Team color border, 3px]               │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: 🏆 or team logo, 32x32px (mobile), 40x40px (desktop)
- Title: "My Team" or "[Team Name]"
- Subtitle: "Follow your favorite club" (optional)
- Border: 3px bottom border, team primary color
- Background: Subtle team color tint (10% opacity)
- Typography: 20px (mobile), 24px (desktop), bold, team color

---

### 4.2 Dashboard Layout

**Screen: Dashboard - Mobile (320px - 767px)**

**Layout**:
```
┌─────────────────────────────────────────┐
│  TOP NAVIGATION                        │
├─────────────────────────────────────────┤
│  HERO SECTION (if both)                │
│  [Split: FPL + Team]                   │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐ │
│  │  🏆 MY TEAM                        │ │
│  │  [Team Logo] Arsenal               │ │
│  │  ────────────────────────────────  │ │
│  │  [Team color border, 3px]          │ │
│  │                                     │ │
│  │  • Next Match                      │ │
│  │  • News                            │ │
│  │  • Standings                       │ │
│  │  [Team color background tint]      │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  ⚽ FANTASY FOOTBALL               │ │
│  │  My FPL Team                      │ │
│  │  ────────────────────────────────  │ │
│  │  [FPL green border, 3px]           │ │
│  │                                     │ │
│  │  • Squad                           │ │
│  │  • Points & Rank                   │ │
│  │  • Leagues                         │ │
│  │  [FPL green background tint]       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  QUICK ACTIONS                          │
│  [Split: FPL + Team]                   │
└─────────────────────────────────────────┘
```

**Key Features**:
- Clear visual separation between sections
- Colored borders (3px) for each section
- Section headers with icons and colors
- Background tints (10% opacity) for visual distinction
- Spacing: 24px between sections

---

### 4.3 Section Component

**Component**: `SectionHeader`

| Property | Value |
|----------|-------|
| **Variants** | FPL, Favorite Team |
| **Props** | `type: 'fpl' \| 'team'`, `title: string`, `subtitle?: string`, `icon?: string` |
| **Height** | 56px (mobile), 64px (desktop) |
| **Border** | 3px bottom border (colored) |
| **Background** | Subtle tint (10% opacity) |

**FPL Section Header Design**:
```tsx
<div className="px-4 sm:px-6 py-4 bg-[var(--fpl-bg-tint)] border-b-[3px] border-[var(--fpl-primary)]">
  <div className="flex items-center gap-3">
    <span className="text-3xl sm:text-4xl">⚽</span>
    <div>
      <h2 className="text-xl sm:text-2xl font-bold text-[var(--fpl-primary)]">
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-[var(--pl-text-muted)]">{subtitle}</p>
      )}
    </div>
  </div>
</div>
```

**Favorite Team Section Header Design**:
```tsx
<div 
  className="px-4 sm:px-6 py-4 border-b-[3px]"
  style={{ 
    backgroundColor: 'var(--team-primary)',
    opacity: 0.1,
    borderColor: 'var(--team-primary)'
  }}
>
  <div className="flex items-center gap-3">
    {teamLogo ? (
      <img src={teamLogo} alt={teamName} className="w-8 h-8" />
    ) : (
      <span className="text-3xl sm:text-4xl">🏆</span>
    )}
    <div>
      <h2 
        className="text-xl sm:text-2xl font-bold"
        style={{ color: 'var(--team-primary)' }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-sm text-[var(--pl-text-muted)]">{subtitle}</p>
      )}
    </div>
  </div>
</div>
```

---

## 5. Component Differentiation

### 5.1 Card Design

**FPL Card**:
```
┌─────────────────────────────────────────┐
│  [FPL Badge]                    [⚽]   │
│  ──────────────────────────────────── │
│  [FPL green border, 3px]               │
│                                         │
│  Card Title                            │
│  Card content...                       │
│                                         │
│  [FPL green background tint, 10%]      │
└─────────────────────────────────────────┘
```

**Design**:
- Border: `border-[3px] border-[var(--fpl-primary)]`
- Badge: "FPL" or "Fantasy" label, FPL green background
- Background: `bg-[var(--fpl-bg-tint)]`
- Icon: ⚽ in badge or card

**Favorite Team Card**:
```
┌─────────────────────────────────────────┐
│  [Team Badge]                   [🏆]   │
│  ──────────────────────────────────── │
│  [Team color border, 3px]               │
│                                         │
│  Card Title                            │
│  Card content...                       │
│                                         │
│  [Team color background tint, 10%]     │
└─────────────────────────────────────────┘
```

**Design**:
- Border: `border-[3px]` with team primary color
- Badge: Team logo or "[Team Name]" label, team color background
- Background: Team color with 10% opacity
- Icon: 🏆 or team logo in badge or card

---

### 5.2 Badge Design

**Component**: `ContentTypeBadge`

| Property | Value |
|----------|-------|
| **Variants** | FPL, Favorite Team |
| **Size** | 24x24px icon + label (mobile), 28x28px (desktop) |
| **Position** | Top-right corner of card |

**FPL Badge**:
- Background: `bg-[var(--fpl-primary)]`
- Text: "FPL" or "Fantasy" (uppercase, 10px font)
- Icon: ⚽ (16x16px)
- Border: None or subtle
- Text Color: `text-[var(--fpl-text-on-primary)]` (dark)

**Favorite Team Badge**:
- Background: Team primary color
- Text: "[Team Name]" or "Team" (uppercase, 10px font)
- Icon: 🏆 or team logo (16x16px)
- Border: None or subtle
- Text Color: `text-[var(--team-text-on-primary)]`

---

### 5.3 Button Design

**FPL Button**:
- Background: `bg-[var(--fpl-primary)]`
- Text: `text-[var(--fpl-text-on-primary)]` (dark)
- Icon: ⚽ (20px, left side)
- Label: "Fantasy Football" or "FPL [Action]"
- Examples: "View FPL Squad", "FPL Leagues", "FPL Analytics"

**Favorite Team Button**:
- Background: `bg-[var(--team-primary)]`
- Text: `text-[var(--team-text-on-primary)]`
- Icon: 🏆 or team logo (20px, left side)
- Label: "My Team" or "[Team Name] [Action]"
- Examples: "Arsenal Fixtures", "My Team News", "Team Standings"

**Styling**:
```tsx
// FPL Button
<button className="px-4 py-2 rounded-lg bg-[var(--fpl-primary)] text-[var(--fpl-text-on-primary)] font-semibold flex items-center gap-2">
  <span>⚽</span>
  <span>View FPL Squad</span>
</button>

// Favorite Team Button
<button 
  className="px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
  style={{ 
    backgroundColor: 'var(--team-primary)',
    color: 'var(--team-text-on-primary)'
  }}
>
  <span>🏆</span>
  <span>My Team Fixtures</span>
</button>
```

---

### 5.4 Quick Actions Design

**Component**: `QuickActionsGroup`

**Layout**:
```
┌─────────────────────────────────────────┐
│  ⚽ FANTASY FOOTBALL                    │
│  ────────────────────────────────────  │
│  [FPL green border, 3px]                │
│                                         │
│  [Transfer] [Captain] [Squad] [Leagues]│
│  [FPL green background tint]           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│  🏆 MY TEAM                             │
│  ────────────────────────────────────  │
│  [Team color border, 3px]               │
│                                         │
│  [Fixtures] [News] [Standings]          │
│  [Team color background tint]           │
└─────────────────────────────────────────┘
```

**Design**:
- Section header with icon, title, colored border
- Actions in grid layout (2 columns mobile, 3-4 desktop)
- Background tint matching section type
- Clear visual separation between groups

---

## 6. Page Header Design

### 6.1 FPL Page Header

**Component**: `FPLPageHeader`

**Layout**:
```
┌─────────────────────────────────────────┐
│  ⚽ Fantasy Football                   │
│  Manage your fantasy squad             │
│  ────────────────────────────────────  │
│  [FPL green background, subtle]         │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: ⚽, 48x48px (mobile), 64x64px (desktop)
- Title: "Fantasy Football" or "My FPL Team"
- Subtitle: "Manage your fantasy squad"
- Background: FPL green tint (10-20% opacity)
- Border: 3px bottom border, FPL green
- Typography: 24px (mobile), 32px (desktop), bold, FPL green

---

### 6.2 Favorite Team Page Header

**Component**: `TeamPageHeader`

**Layout**:
```
┌─────────────────────────────────────────┐
│  🏆 My Team                            │
│  Arsenal                               │
│  Follow your favorite club              │
│  ────────────────────────────────────  │
│  [Team color background, subtle]       │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: 🏆 or team logo, 48x48px (mobile), 64x64px (desktop)
- Title: "My Team" or "[Team Name]"
- Subtitle: "Follow your favorite club"
- Background: Team color tint (10-20% opacity)
- Border: 3px bottom border, team primary color
- Typography: 24px (mobile), 32px (desktop), bold, team color

---

## 7. News/Alerts Differentiation

### 7.1 News Badges

**FPL Player News Badge**:
- Background: `bg-[var(--fpl-primary)]`
- Text: "FPL" or "Fantasy"
- Icon: ⚽
- Color: FPL green
- Position: Top-right of news card

**Favorite Team News Badge**:
- Background: Team primary color
- Text: "[Team Name]" or "Team"
- Icon: 🏆 or team logo
- Color: Team colors
- Position: Top-right of news card

---

### 7.2 Alert Design

**FPL Alert**:
- Border: FPL green, 3px left border
- Badge: "FPL Squad"
- Icon: ⚽
- Background: FPL green tint
- Message: "X players in your FPL squad..."

**Favorite Team Alert**:
- Border: Team color, 3px left border
- Badge: "[Team Name]"
- Icon: 🏆 or team logo
- Background: Team color tint
- Message: "X [Team Name] players..."

---

## 8. Terminology Standards

### 8.1 FPL Terminology

**Use**:
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

---

### 8.2 Favorite Team Terminology

**Use**:
- "My Team" (primary - when context is clear)
- "[Team Name]" (e.g., "Arsenal" - when showing team-specific content)
- "Favorite Team" (when need to be explicit)
- "My Club" (alternative)
- "Real Team" (when contrasting with FPL)

**Avoid**:
- "Team" alone (ambiguous)
- "My Team" in FPL context (confusing)

---

## 9. Responsive Design

### Mobile (320px - 767px)
- **Navigation**: Bottom nav, 5 items max
- **Section Headers**: Full width, stacked
- **Cards**: Full width, stacked
- **Buttons**: Full width or 2-column grid
- **Touch Targets**: 44x44px minimum

### Tablet (768px - 1023px)
- **Navigation**: Side nav (collapsible)
- **Section Headers**: Full width
- **Cards**: 2-column grid
- **Buttons**: Flexible width
- **Touch Targets**: 48x48px

### Desktop (1024px+)
- **Navigation**: Side nav (expanded)
- **Section Headers**: Full width
- **Cards**: 2-3 column grid
- **Buttons**: Flexible width
- **Hover States**: Rich interactions

---

## 10. Component Specifications

### 10.1 Section Header Component

**Component**: `SectionHeader`

| Property | Value |
|----------|-------|
| **Variants** | FPL, Favorite Team |
| **Height** | 56px (mobile), 64px (desktop) |
| **Border** | 3px bottom border (colored) |
| **Background** | Subtle tint (10% opacity) |
| **Icon** | 32px (mobile), 40px (desktop) |
| **Typography** | 20px (mobile), 24px (desktop), bold |

**Props**:
```typescript
interface SectionHeaderProps {
  type: 'fpl' | 'team';
  title: string;
  subtitle?: string;
  icon?: string;
  teamLogo?: string;
}
```

---

### 10.2 Content Badge Component

**Component**: `ContentTypeBadge`

| Property | Value |
|----------|-------|
| **Variants** | FPL, Favorite Team |
| **Size** | 24x24px (mobile), 28x28px (desktop) |
| **Position** | Top-right corner |
| **Layout** | Icon + Label |

**Props**:
```typescript
interface ContentTypeBadgeProps {
  type: 'fpl' | 'team';
  label?: string;
  teamName?: string;
  teamLogo?: string;
}
```

---

### 10.3 Themed Card Component

**Component**: `ThemedCard`

| Property | Value |
|----------|-------|
| **Variants** | FPL, Favorite Team |
| **Border** | 3px solid (colored) |
| **Background** | Subtle tint (10% opacity) |
| **Badge** | ContentTypeBadge (top-right) |

**Props**:
```typescript
interface ThemedCardProps {
  type: 'fpl' | 'team';
  title: string;
  children: React.ReactNode;
  teamName?: string;
  teamLogo?: string;
}
```

---

## 11. Navigation Component Specifications

### 11.1 Bottom Navigation (Mobile)

**Component**: `BottomNavigation`

**Items**:
- 🏠 Dashboard (neutral)
- ⚽ Fantasy Football (FPL green when active)
- 🏆 My Team (team colors when active)
- 📊 Analytics (FPL green when active)
- ⚙️ Settings (neutral)

**Active State**:
- FPL items: `bg-[var(--fpl-primary)]/20` with FPL green icon/text
- Team items: Team color background with team color icon/text

---

### 11.2 Side Navigation (Desktop)

**Component**: `SideNavigation`

**Structure**:
- Dashboard (neutral)
- **Fantasy Football** (section header, FPL green)
  - My Squad
  - Leagues
  - Analytics
  - Performance
- **My Team** (section header, team colors)
  - [Team Name]
  - Fixtures
  - News
  - Standings
- Settings (neutral)

**Section Headers**:
- Height: 56px
- Background: Colored tint (10% opacity)
- Border: 3px bottom border (colored)
- Typography: Bold, colored

---

## 12. Dashboard Layout Specifications

### 12.1 Section Container

**Component**: `ThemedSection`

**Design**:
- Container with colored border (3px)
- Background tint (10% opacity)
- Section header at top
- Content below header
- Clear visual boundary

**FPL Section**:
```tsx
<div className="rounded-xl border-[3px] border-[var(--fpl-primary)] bg-[var(--fpl-bg-tint)] overflow-hidden">
  <SectionHeader type="fpl" title="Fantasy Football" />
  <div className="p-4 sm:p-6">
    {/* FPL content */}
  </div>
</div>
```

**Favorite Team Section**:
```tsx
<div 
  className="rounded-xl border-[3px] overflow-hidden"
  style={{ 
    borderColor: 'var(--team-primary)',
    backgroundColor: 'var(--team-primary)',
    opacity: 0.1
  }}
>
  <SectionHeader type="team" title="My Team" teamName={teamName} />
  <div className="p-4 sm:p-6">
    {/* Team content */}
  </div>
</div>
```

---

## 13. Accessibility Requirements

### WCAG AA Compliance

**Color Contrast**:
- FPL green on dark: 4.5:1 minimum
- Team colors on dark: 4.5:1 minimum
- Text on colored backgrounds: 4.5:1 minimum

**Keyboard Navigation**:
- All navigation items accessible via keyboard
- Tab order: Logical flow
- Focus indicators: Clear, visible (colored ring)

**Screen Reader**:
- ARIA labels: "Fantasy Football section" or "My Team section"
- Section headers: Proper heading hierarchy
- Navigation: "Fantasy Football navigation" or "My Team navigation"

**Color Blindness**:
- Don't rely on color alone
- Use icons and labels
- Clear visual distinction beyond color

---

## 14. Developer Handoff Notes

### Key Implementation Points

1. **Add FPL Color Variables**:
   ```css
   :root {
     --fpl-primary: #00ff87;
     --fpl-secondary: #04f5ff;
     --fpl-accent: #e90052;
     --fpl-text-on-primary: #0d0d0d;
     --fpl-bg-tint: rgba(0, 255, 135, 0.1);
   }
   ```

2. **Create Section Components**:
   - `SectionHeader` - FPL and team variants
   - `ThemedCard` - FPL and team variants
   - `ContentTypeBadge` - FPL and team variants

3. **Update Navigation**:
   - Add section headers in side nav
   - Color-code navigation items
   - Separate FPL and team sections

4. **Update Dashboard**:
   - Wrap FPL content in FPL-themed sections
   - Wrap team content in team-themed sections
   - Add clear visual boundaries

5. **Update All Pages**:
   - FPL pages: Use FPL colors and icons
   - Team pages: Use team colors and icons
   - Consistent headers and styling

### Component Structure

**New Components**:
```
frontend/src/components/
  ├── sections/
  │   ├── SectionHeader.tsx
  │   ├── ThemedSection.tsx
  │   └── ThemedCard.tsx
  ├── badges/
  │   └── ContentTypeBadge.tsx
  └── navigation/
      ├── BottomNavigation.tsx (update)
      └── SideNavigation.tsx (update)
```

---

## 15. Testing Checklist

### Visual Testing
- [ ] FPL sections use FPL green/cyan
- [ ] Favorite team sections use team colors
- [ ] No color mixing (FPL never uses team colors)
- [ ] Icons are distinct and consistent
- [ ] Section headers are clear
- [ ] Navigation clearly separates sections
- [ ] Cards/badges clearly indicate type

### Functional Testing
- [ ] Navigation works correctly
- [ ] Section headers display properly
- [ ] Cards use correct colors
- [ ] Buttons use correct colors
- [ ] Badges display correctly
- [ ] All pages use consistent styling

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces sections
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA
- [ ] Icons have alt text

---

## 16. Success Criteria

Design phase is complete when:
- ✅ Color system documented (FPL vs team)
- ✅ Icon system documented
- ✅ Navigation designs finalized
- ✅ Dashboard designs finalized
- ✅ Component specifications complete
- ✅ Page header designs complete
- ✅ Accessibility requirements met
- ✅ Developer handoff document created

---

**Design Specification Complete! 🎨**

This document provides complete design specifications for differentiating Fantasy Football from Favorite Team content. All components are designed with clear visual distinction, consistent terminology, and accessibility in mind.

**Ready for Developer Handoff**


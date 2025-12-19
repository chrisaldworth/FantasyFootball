# Personalized News Feature - Design Specification

**Designer**: UI Designer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P1 (High)

---

## Overview

This document provides complete design specifications for the Personalized News feature, which enhances the existing news section to show both favorite team news and FPL squad player news in one cohesive, engaging interface.

**Goal**: Create a beautiful, intuitive news feed that clearly distinguishes between team news and player news while maintaining consistency with the existing design system.

---

## Design Principles

1. **Visual Hierarchy**: News type badge (team/player) is most prominent
2. **Clarity**: Clear distinction between news types without overwhelming
3. **Consistency**: Enhance existing design, don't replace it
4. **Engagement**: News cards are clickable and visually interesting
5. **Accessibility**: WCAG AA compliant, keyboard navigable

---

## 1. News Card Design

### Screen: News Card - Team News (Enhanced)

**Purpose**: Display favorite team news with clear team identification

**Layout**:
```
┌─────────────────────────────────────────┐
│  [TEAM BADGE]                   2h ago │
│  ┌───────────────────────────────────┐ │
│  │ [Team Logo] TEAM                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  🔄 Arsenal prepare for upcoming match │
│                                         │
│  Latest updates from the Arsenal camp   │
│  as they prepare for their next...     │
│                                         │
│  [Transfer] [Match]  Source: BBC       │
│                           Read more →  │
└─────────────────────────────────────────┘
```

**Key Components**:
- Team badge (top-left or top-right)
- Team logo + "TEAM" label
- Title (2-line clamp)
- Summary (2-line clamp)
- Category tags
- Source and time
- "Read more" link

**Visual Design**:
- Badge: Team primary color background, white text
- Badge Size: 24x24px icon + label (mobile), 28x28px (desktop)
- Badge Position: Top-right corner
- Badge Format: Team logo (16x16px) + "TEAM" text
- Card: Existing glass morphism style
- Background: Team-themed gradient (subtle, 10% opacity)

---

### Screen: News Card - Player News (New)

**Purpose**: Display FPL squad player news with clear player identification

**Layout**:
```
┌─────────────────────────────────────────┐
│  [PLAYER BADGE]                 1h ago │
│  ┌───────────────────────────────────┐ │
│  │ [Player Icon] PLAYER              │ │
│  └───────────────────────────────────┘ │
│                                         │
│  Mohamed Salah                         │
│  (Liverpool)                           │
│                                         │
│  🏥 Salah injury update ahead of GW    │
│                                         │
│  Liverpool forward Mohamed Salah is    │
│  being assessed for a minor injury...  │
│                                         │
│  [Injury] [FPL]  Source: Sky Sports    │
│                           Read more →  │
└─────────────────────────────────────────┘
```

**Key Components**:
- Player badge (top-right)
- Player icon + "PLAYER" label
- Player name (prominent, bold)
- Player team (in parentheses, smaller)
- Title (2-line clamp)
- Summary (2-line clamp)
- Category tags (including "FPL" tag)
- Source and time
- "Read more" link

**Visual Design**:
- Badge: FPL green (#00ff87) or cyan (#04f5ff) background, white text
- Badge Size: 24x24px icon + label (mobile), 28x28px (desktop)
- Badge Position: Top-right corner
- Badge Format: Player icon (16x16px) or FPL icon + "PLAYER" text
- Player Name: Bold, 14px (mobile), 16px (desktop), FPL green/cyan color
- Player Team: Smaller, 12px, muted color, in parentheses
- Card: Existing glass morphism style
- Background: FPL-themed gradient (subtle, 10% opacity)

---

## 2. Component Specifications

### 2.1 News Type Badge

**Component**: `NewsTypeBadge`

| Property | Value |
|----------|-------|
| **Variants** | Team, Player |
| **States** | Default |
| **Props** | `type: 'team' \| 'player'`, `teamLogo?: string`, `playerName?: string` |
| **Size** | 24x24px (mobile), 28x28px (desktop) |
| **Position** | Top-right corner of card |
| **Layout** | Icon (16x16px) + Label text |

**Team Badge Design**:
- Background: Team primary color with 20% opacity
- Border: Team primary color, 1px solid
- Icon: Team logo (16x16px) or team icon
- Label: "TEAM" (uppercase, 10px font, semibold)
- Text Color: White or team text-on-primary
- Border Radius: 6px (rounded)

**Player Badge Design**:
- Background: FPL green (#00ff87) with 20% opacity
- Border: FPL green, 1px solid
- Icon: Player icon (👤) or FPL icon (⚽)
- Label: "PLAYER" (uppercase, 10px font, semibold)
- Text Color: White
- Border Radius: 6px (rounded)

**Accessibility**:
- ARIA label: "Team news" or "Player news"
- Semantic HTML: `<span role="img" aria-label="...">`

---

### 2.2 Player Name Display

**Component**: `PlayerNameDisplay`

| Property | Value |
|----------|-------|
| **Purpose** | Show which player the news is about |
| **Format** | "Player Name" or "Player Name (Team)" |
| **Position** | Below badge, above title |
| **Typography** | Bold, 14px (mobile), 16px (desktop) |
| **Color** | FPL green (#00ff87) or cyan (#04f5ff) |
| **Spacing** | 8px below badge, 12px above title |

**Design**:
- Player Name: Bold, semibold weight (600)
- Team Name: Regular weight (400), smaller (12px), muted color
- Format: "Mohamed Salah" or "Salah (Liverpool)"
- Line Height: 1.4
- Truncation: Ellipsis if too long (max 2 lines)

**Optional Enhancement**:
- Player photo/avatar (if available): 32x32px circle, left of name
- Player position icon: Small icon showing position (GK, DEF, MID, FWD)

---

### 2.3 Enhanced News Card

**Component**: `PersonalizedNewsCard`

| Property | Value |
|----------|-------|
| **Variants** | Team News, Player News |
| **States** | Default, Hover, Loading, Error |
| **Props** | `newsItem: NewsItem`, `type: 'team' \| 'player'`, `playerName?: string`, `teamLogo?: string` |
| **Layout** | Full width (mobile), flexible (desktop) |

**Card Structure**:
1. Badge (top-right)
2. Player Name (if player news, below badge)
3. Title (2-line clamp)
4. Summary (2-line clamp)
5. Category Tags
6. Metadata (source, time)
7. "Read more" link

**Visual Design**:
- Container: `glass rounded-xl p-4 sm:p-6`
- Background: Team-themed (team news) or FPL-themed (player news)
- Border: `border border-white/10`
- Hover: Scale 1.02, brighter background
- Padding: 16px (mobile), 24px (desktop)
- Spacing: 12px between sections

**Typography**:
- Title: 16px (mobile), 18px (desktop), bold, 2-line clamp
- Summary: 14px, regular, 2-line clamp, muted color
- Metadata: 12px, muted color
- Player Name: 14px (mobile), 16px (desktop), semibold, FPL color

---

## 3. Filter & Sort Controls

### Screen: Filter & Sort Bar

**Purpose**: Allow users to filter and sort news

**Layout (Mobile)**:
```
┌─────────────────────────────────────────┐
│  [All News] [Team] [Players]    [Sort▼]│
│  ─────────────────────────────────────  │
└─────────────────────────────────────────┘
```

**Layout (Desktop)**:
```
┌─────────────────────────────────────────┐
│  [All News] [Team] [Players]    [Sort▼]│
│  ─────────────────────────────────────  │
└─────────────────────────────────────────┘
```

**Key Components**:
- Filter buttons (horizontal row)
- Sort dropdown (right-aligned)

---

### 3.1 Filter Buttons

**Component**: `NewsFilterButtons`

| Property | Value |
|----------|-------|
| **Variants** | All News, Team Only, Players Only |
| **States** | Active, Inactive, Hover |
| **Layout** | Horizontal row, scrollable on mobile |
| **Size** | Minimum 44x44px touch target |

**Button Design**:
- **Active State**:
  - Background: Team primary color (gradient)
  - Text: White or team text-on-primary
  - Border: None
  - Font Weight: Semibold (600)
  
- **Inactive State**:
  - Background: Transparent or `bg-[var(--pl-dark)]/50`
  - Text: Muted color
  - Border: `border border-white/10`
  - Font Weight: Regular (400)

- **Size**: 
  - Padding: `px-4 py-2` (mobile), `px-6 py-3` (desktop)
  - Height: Minimum 44px
  - Border Radius: 8px

- **Spacing**: 8px between buttons

- **Hover**: Slightly brighter background, scale 1.02

**Mobile Considerations**:
- Horizontal scrollable if buttons don't fit
- Touch-friendly (44px minimum height)
- Clear active state

---

### 3.2 Sort Dropdown

**Component**: `NewsSortDropdown`

| Property | Value |
|----------|-------|
| **Options** | Most Recent, Most Important, By Category |
| **Default** | Most Recent |
| **Size** | Minimum 44x44px touch target |
| **Position** | Right-aligned or inline with filters |

**Dropdown Design**:
- Style: Match existing dropdowns in app
- Background: `bg-[var(--pl-dark)]/50`
- Border: `border border-white/10`
- Text: Muted color (inactive), white (active)
- Icon: Chevron down (▼)
- Padding: `px-4 py-2`
- Border Radius: 8px

**Options**:
- "Most Recent" (default) - Sort by published date
- "Most Important" - Sort by importance_score
- "By Category" - Group by category, then by date

---

## 4. Combined News Feed Layout

### Screen: News Feed - Mobile (320px - 767px)

**Purpose**: Single-column, scrollable news feed

**Layout**:
```
┌─────────────────────────────────────────┐
│  Personalized News                     │
│  ─────────────────────────────────────  │
│                                         │
│  [All News] [Team] [Players]  [Sort▼] │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [TEAM BADGE]             2h ago  │ │
│  │  Arsenal news title...            │ │
│  │  Summary text...                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  [PLAYER BADGE]           1h ago  │ │
│  │  Mohamed Salah (Liverpool)        │ │
│  │  Player news title...             │ │
│  │  Summary text...                 │ │
│  └───────────────────────────────────┘ │
│                                         │
│  [More news cards...]                   │
│                                         │
└─────────────────────────────────────────┘
```

**Key Features**:
- Single column layout
- Full-width cards
- 16px spacing between cards
- Filter buttons scrollable if needed
- Sort dropdown below filters

---

### Screen: News Feed - Desktop (1024px+)

**Purpose**: Multi-column or single-column layout

**Layout Option 1 (Single Column)**:
```
┌─────────────────────────────────────────────────────┐
│  Personalized News                                 │
│  ─────────────────────────────────────────────────  │
│                                                     │
│  [All News] [Team] [Players]          [Sort▼]     │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  [TEAM BADGE]                       2h ago   │ │
│  │  News card...                                │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
│  ┌───────────────────────────────────────────────┐ │
│  │  [PLAYER BADGE]                     1h ago   │ │
│  │  Mohamed Salah (Liverpool)                   │ │
│  │  News card...                                │ │
│  └───────────────────────────────────────────────┘ │
│                                                     │
└─────────────────────────────────────────────────────┘
```

**Layout Option 2 (Grid - Optional)**:
- 2-column grid on desktop (if cards are compact)
- Maintains readability
- Consistent spacing

**Key Features**:
- Filter buttons full row
- Sort dropdown right-aligned
- 24px spacing between cards
- Hover states on cards

---

## 5. Empty States

### 5.1 No Favorite Team News

**Component**: `EmptyTeamNews`

**Layout**:
```
┌─────────────────────────────────────────┐
│                                         │
│            📰                           │
│                                         │
│  No favorite team news                  │
│                                         │
│  Select a favorite team to see          │
│  personalized team news                 │
│                                         │
│  [Select Team] Button                   │
│                                         │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: 📰 or team icon (64x64px)
- Message: Clear, helpful
- CTA: "Select Team" button (primary style)
- Background: Glass card with subtle gradient

---

### 5.2 No FPL Player News

**Component**: `EmptyPlayerNews`

**Layout**:
```
┌─────────────────────────────────────────┐
│                                         │
│            ⚽                           │
│                                         │
│  No FPL player news                     │
│                                         │
│  Link your FPL team to see news        │
│  about players in your squad            │
│                                         │
│  [Link FPL Team] Button                │
│                                         │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: ⚽ or FPL icon (64x64px)
- Message: Clear, helpful
- CTA: "Link FPL Team" button (primary style)
- Background: Glass card with subtle gradient

---

### 5.3 No News at All

**Component**: `EmptyNews`

**Layout**:
```
┌─────────────────────────────────────────┐
│                                         │
│            📰                           │
│                                         │
│  No news available                      │
│                                         │
│  Check back later for the latest        │
│  updates                                │
│                                         │
└─────────────────────────────────────────┘
```

**Design**:
- Icon: 📰 (64x64px)
- Message: Friendly, not error-like
- No CTA (just informational)
- Background: Glass card

---

## 6. Loading States

### 6.1 Loading Skeleton

**Component**: `NewsCardSkeleton`

**Layout**:
```
┌─────────────────────────────────────────┐
│  [Badge Placeholder]    [Time Placeholder]│
│                                         │
│  [Title Line 1]                         │
│  [Title Line 2]                         │
│                                         │
│  [Summary Line 1]                       │
│  [Summary Line 2]                       │
│                                         │
│  [Tag] [Tag] [Source]                  │
└─────────────────────────────────────────┘
```

**Design**:
- Animated shimmer effect
- Matches final card layout
- Gray placeholder boxes
- Smooth animation (1.5s loop)

**Implementation**:
- Use `animate-pulse` class
- Background: `bg-[var(--pl-dark)]/50`
- Border Radius: Match card radius

---

### 6.2 Loading Spinner

**Component**: `NewsLoadingSpinner`

**Design**:
- Centered in news section
- Team-themed colors (spinner uses team primary)
- Size: 32x32px (mobile), 40x40px (desktop)
- Message: "Loading news..." (optional)

---

## 7. Design System Updates

### 7.1 Color System

**Team News Colors** (Existing):
- Badge: Team primary color
- Background: Team primary with 10% opacity
- Text: Team text-on-primary

**Player News Colors** (New):
- Badge: FPL green (#00ff87) or cyan (#04f5ff)
- Background: FPL green/cyan with 10% opacity
- Player Name: FPL green/cyan
- Text: White (on badge), default (on card)

**Filter Buttons**:
- Active: Team primary color
- Inactive: Muted gray (`var(--pl-text-muted)`)
- Hover: Slightly brighter

**Semantic Colors** (Existing):
- Success: `#00ff87` (green)
- Warning: `#ffa500` (orange)
- Error: `#e90052` (red/pink)
- Info: `#04f5ff` (cyan)

---

### 7.2 Typography

**Player Names**:
- Font Size: 14px (mobile), 16px (desktop)
- Font Weight: 600 (semibold)
- Color: FPL green (#00ff87) or cyan (#04f5ff)
- Line Height: 1.4

**News Type Badge**:
- Font Size: 10px (mobile), 12px (desktop)
- Font Weight: 600 (semibold)
- Text Transform: Uppercase
- Letter Spacing: 0.5px

**News Title**:
- Font Size: 16px (mobile), 18px (desktop)
- Font Weight: 700 (bold)
- Line Height: 1.3
- Max Lines: 2 (with clamp)

**News Summary**:
- Font Size: 14px
- Font Weight: 400 (regular)
- Line Height: 1.5
- Max Lines: 2 (with clamp)
- Color: Muted (`var(--pl-text-muted)`)

---

### 7.3 Spacing

**Card Spacing**:
- Between cards: 16px (mobile), 24px (desktop)
- Card padding: 16px (mobile), 24px (desktop)
- Internal spacing: 12px between sections

**Filter Bar**:
- Padding: 16px (mobile), 24px (desktop)
- Button spacing: 8px
- Bottom margin: 16px (mobile), 24px (desktop)

---

## 8. Responsive Design

### Mobile (320px - 767px)
- **Layout**: Single column, full-width cards
- **Filter Buttons**: Horizontal scrollable row
- **Sort**: Dropdown below filter row
- **Badge**: 20x20px icon + label
- **Player Name**: 14px, below badge
- **Spacing**: 16px between cards

### Tablet (768px - 1023px)
- **Layout**: Single column or 2-column grid
- **Filter Buttons**: Full row, no scroll
- **Sort**: Inline with filter buttons
- **Badge**: 24x24px icon + label
- **Player Name**: 16px, below badge
- **Spacing**: 24px between cards

### Desktop (1024px+)
- **Layout**: Single column (recommended) or 2-column grid
- **Filter Buttons**: Full row
- **Sort**: Right-aligned
- **Badge**: 24x24px icon + label
- **Player Name**: 16px, below badge
- **Spacing**: 32px between cards

---

## 9. Interaction Patterns

### Card Interactions

**Hover (Desktop)**:
- Scale: 1.02x (subtle)
- Duration: 0.2s
- Easing: ease-out
- Background: Slightly brighter

**Click/Tap**:
- Opens news article in new tab
- Visual feedback: Brief scale animation
- Cursor: Pointer

**Loading**:
- Skeleton animation: Continuous shimmer
- Duration: 1.5s (loop)
- Easing: linear

---

## 10. Accessibility Requirements

### WCAG AA Compliance

**Color Contrast**:
- Text: 4.5:1 minimum
- UI Elements: 3:1 minimum
- Badge text: White on colored background (high contrast)

**Keyboard Navigation**:
- All interactive elements accessible via keyboard
- Tab order: Logical flow (filters → cards → links)
- Focus indicators: Clear, visible (ring-2 ring-team-primary)

**Screen Reader**:
- ARIA labels: "Team news" or "Player news: [Player Name]"
- Semantic HTML: Proper heading hierarchy
- Alt text: For team logos, player photos
- Live regions: For dynamic updates

**Touch Targets**:
- Minimum 44x44px on mobile
- Generous spacing between interactive elements
- Clear visual feedback on interaction

**Motion**:
- Respect `prefers-reduced-motion`
- Provide alternative for animated content
- No essential information in motion only

---

## 11. Component Structure

### Files to Create/Modify

**New Components**:
```
frontend/src/components/news/
  ├── PersonalizedNewsFeed.tsx (main component)
  ├── NewsTypeBadge.tsx
  ├── PlayerNameDisplay.tsx
  ├── PersonalizedNewsCard.tsx
  ├── NewsFilterButtons.tsx
  ├── NewsSortDropdown.tsx
  ├── EmptyTeamNews.tsx
  ├── EmptyPlayerNews.tsx
  └── NewsCardSkeleton.tsx
```

**Modified Components**:
- `TeamNewsOverview.tsx` - Enhance to support personalized news
- Or create new `PersonalizedNewsOverview.tsx` that uses existing as base

---

## 12. Developer Handoff Notes

### Key Implementation Points

1. **Enhance, Don't Replace**: Build on existing `TeamNewsOverview` component
2. **Badge System**: Create reusable `NewsTypeBadge` component
3. **Player Name**: Create `PlayerNameDisplay` component for consistency
4. **Filtering**: Client-side filtering of combined news array
5. **Sorting**: Client-side sorting by date, importance, or category
6. **API Integration**: Use new `/api/football/personalized-news` endpoint

### Data Structure

**News Item** (Enhanced):
```typescript
interface PersonalizedNewsItem {
  id: string;
  title: string;
  summary: string;
  type: 'team' | 'player';
  player_name?: string; // If type is 'player'
  team_logo?: string; // If type is 'team'
  categories: string[];
  importance_score: number;
  publishedAt: string;
  source: string;
  url: string;
}
```

### Styling

**Use Existing Design System**:
- Glass morphism: `glass` class
- Team colors: `var(--team-primary)`, etc.
- Spacing: Tailwind spacing scale
- Typography: Existing font system

**New Colors** (Add to CSS if needed):
```css
--fpl-green: #00ff87;
--fpl-cyan: #04f5ff;
```

---

## 13. Testing Checklist

### Visual Testing
- [ ] News cards render correctly
- [ ] Badges clearly visible
- [ ] Player names readable
- [ ] Filter buttons work
- [ ] Sort dropdown works
- [ ] Responsive on all breakpoints
- [ ] WCAG AA contrast verified

### Functional Testing
- [ ] Filtering works (all, team, players)
- [ ] Sorting works (recent, important, category)
- [ ] News cards link to articles
- [ ] Empty states display correctly
- [ ] Loading states display correctly
- [ ] Error states handle gracefully

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces news types
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA

---

## 14. Success Criteria

Design phase is complete when:
- ✅ All mockups created (mobile, tablet, desktop)
- ✅ Component specifications complete
- ✅ Design system updated
- ✅ Accessibility requirements met
- ✅ Developer handoff document created

---

**Design Specification Complete! 🎨**

This document provides complete design specifications for the Personalized News feature. All components are designed with clarity, engagement, and accessibility in mind.

**Ready for Developer Handoff**


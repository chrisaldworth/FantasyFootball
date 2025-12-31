# Follow Players - Design Specifications

**Date**: 2025-12-21  
**Designer**: UI Designer Agent  
**Status**: ✅ Design Complete  
**Priority**: P1 (Follow Players - Player Tracking)  
**For**: Developer Agent

---

## Overview

Complete design specifications for the Follow Players feature. This document provides detailed layouts, component specs, responsive breakpoints, and implementation guidance for all 4 components.

**Reference Documents**:
- Requirements: `follow-players-requirements.md`
- Handoff: `follow-players-handoff-ui-designer.md`
- Current Implementation: None (new feature)

---

## Design Answers

### 1. Follow Icon
**Answer**: **Star icon (⭐)** - Filled star when following, outline star when not following. Universal symbol for favorites/following.

### 2. Follow Button Placement
**Answer**: **Top-right corner** - Standard placement, doesn't interfere with content, always visible but not intrusive.

### 3. Followed Players List Layout
**Answer**: **Grid layout** - Better visual appeal, easier to scan, works well with player photos. Responsive: 1 col (mobile), 2 cols (tablet), 3-4 cols (desktop).

### 4. Card Density
**Answer**: **Compact with key info** - Photo, name, team, position, price, form indicator, quick stats. Balance between information and visual clarity.

### 5. Empty State
**Answer**: **Illustration + encouraging message** - "Start following players to track their performance" with CTA to browse/search players.

### 6. Dashboard Widget
**Answer**: **Horizontal scroll with cards** - Shows 3-4 players at once, scrollable. Each card compact with photo, name, key stat. "View All" link.

### 7. Sort/Filter UI
**Answer**: **Dropdown menus** - Space-efficient, familiar pattern. Filters in collapsible section on mobile.

### 8. Visual Hierarchy
**Answer**: **Player photo/name most prominent** - Then team/position, then stats (price, form, points). Follow button always visible but secondary.

### 9. Follow Indicator
**Answer**: **Always visible** - Star icon always shown (filled = following, outline = not following). No hover required.

### 10. Color Coding
**Answer**: **Form indicators use colors** - Green for good form (5+ avg), Yellow for average (3-4.9), Red for poor (<3). Price changes: Green up, Red down.

---

## Component 1: FollowButton

### Props
```typescript
interface FollowButtonProps {
  playerId: number;
  playerName?: string;
  isFollowed: boolean;
  onToggle: (playerId: number, willFollow: boolean) => Promise<void>;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button';
  className?: string;
}
```

### Design
```
┌──────────────────────┐
│ [Player Card/Detail] │
│                      │
│              [⭐]    │ ← Filled star (following)
│                      │
│           [☆]        │ ← Outline star (not following)
└──────────────────────┘
```

### Sizes
- **Small** (24x24px): For inline use in lists
- **Medium** (32x32px): Default for cards
- **Large** (40x40px): For detail views

### States
1. **Not Following** (Outline):
   - Outline star icon
   - Gray color (#999999)
   - Hover: Green tint, scale 1.1
   - Tooltip: "Follow [Player Name]"

2. **Following** (Filled):
   - Filled star icon
   - Green color (var(--pl-green))
   - Hover: Slightly darker green, scale 1.1
   - Tooltip: "Unfollow [Player Name]"

3. **Loading**:
   - Spinner icon
   - Disabled state
   - No interaction

4. **Disabled**:
   - Reduced opacity (0.5)
   - No interaction
   - Cursor: not-allowed

### Visual Specifications
- Icon: Star (SVG)
- Colors:
  - Following: `var(--pl-green)` (#00ff87)
  - Not Following: `#999999` (gray)
  - Hover: Green tint
- Size: 32x32px (default), scalable
- Position: Top-right corner (absolute positioning)
- Z-index: 10 (above card content)

### Implementation Notes
- Uses SVG star icon (can use Font Awesome or custom SVG)
- Optimistic update: UI changes immediately, API call in background
- Error handling: Revert UI on API failure, show error toast

---

## Component 2: FollowedPlayersList

### Layout
```
┌─────────────────────────────────────────────┐
│ Followed Players                            │
│ [Search...] [Sort ▼] [Filter ▼]           │
├─────────────────────────────────────────────┤
│                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐          │
│ │ Player │ │ Player │ │ Player │          │
│ │ Card   │ │ Card   │ │ Card   │          │
│ └────────┘ └────────┘ └────────┘          │
│                                             │
│ ┌────────┐ ┌────────┐ ┌────────┐          │
│ │ Player │ │ Player │ │ Player │          │
│ │ Card   │ │ Card   │ │ Card   │          │
│ └────────┘ └────────┘ └────────┘          │
│                                             │
└─────────────────────────────────────────────┘
```

### Header Section
- Title: "Followed Players" (with count: "5 players")
- Search bar: Full-width on mobile, inline on desktop
- Sort dropdown: "Recently Followed", "Name", "Points", "Price", "Form"
- Filter dropdown: Position, Team, Price Range
- Layout: Stacked on mobile, inline on desktop

### Empty State
```
┌─────────────────────────────────────────────┐
│                                             │
│            [Illustration Icon]              │
│                                             │
│        No Players Followed Yet              │
│                                             │
│   Start following players to track their    │
│   performance and get quick insights        │
│                                             │
│        [Browse Players] [Search Players]    │
│                                             │
└─────────────────────────────────────────────┘
```

### Loading State
- Skeleton cards (same layout as actual cards)
- 6 skeleton cards shown
- Shimmer animation

### Responsive Grid
- **Mobile (320px-767px)**: 1 column
- **Tablet (768px-1023px)**: 2 columns
- **Desktop (1024px-1535px)**: 3 columns
- **Large Desktop (1536px+)**: 4 columns

---

## Component 3: FollowedPlayerCard

### Props
```typescript
interface FollowedPlayerCardProps {
  player: {
    id: number;
    name: string;
    photo?: string;
    team: string;
    teamId: number;
    position: string;
    positionId: number;
    price: number;
    form: number;
    totalPoints: number;
    priceChange: number; // -1, 0, 1
    ownership: number;
    nextFixture?: {
      opponent: string;
      difficulty: number;
      isHome: boolean;
    };
  };
  onViewDetails: () => void;
  onUnfollow: () => void;
}
```

### Design
```
┌─────────────────────────────────────┐
│                    [⭐] (Follow btn)│
│                                     │
│  [Photo]  Player Name               │
│           Team • Position           │
│                                     │
│  £10.5m  Form: 7.2  Pts: 145       │
│  ↑ £0.1m  Owned: 25.3%             │
│                                     │
│  Next: vs Arsenal (H) [3]          │
│                                     │
│  [View Details] [Unfollow]         │
└─────────────────────────────────────┘
```

### Layout Structure
1. **Header** (top):
   - Follow button (top-right, absolute)
   - Player photo (left, 64x64px circular)
   - Player name (bold, large)
   - Team name + Position badge

2. **Stats Section** (middle):
   - Price: Large, prominent
   - Form indicator: Colored badge (green/yellow/red)
   - Total points: Medium size
   - Price change: Small, colored (green up, red down)
   - Ownership %: Small text

3. **Next Fixture** (bottom section):
   - "Next: vs [Opponent] (H/A)" 
   - Difficulty badge (1-5, color-coded)

4. **Actions** (footer):
   - "View Details" button (primary)
   - "Unfollow" button (secondary, text)

### Visual Specifications
- **Card**: Glass morphism, rounded-xl, padding: 16px
- **Photo**: 64x64px, circular, border with team color
- **Name**: 18px, bold, white
- **Team/Position**: 14px, muted, badges
- **Stats**: 16px, bold for key stats, 14px for secondary
- **Hover**: Scale 1.02, shadow increase, border highlight

### States
- **Default**: Standard card appearance
- **Hover**: Scale up, shadow, border highlight
- **Loading**: Skeleton/shimmer
- **Error**: Error message, retry button

### Form Indicator Colors
- **Green** (≥5.0): `#10b981` - Good form
- **Yellow** (3.0-4.9): `#f59e0b` - Average form
- **Red** (<3.0): `#ef4444` - Poor form

---

## Component 4: FollowedPlayersWidget (Dashboard)

### Props
```typescript
interface FollowedPlayersWidgetProps {
  players: Array<{
    id: number;
    name: string;
    photo?: string;
    team: string;
    keyStat: string | number; // Price or form
    statLabel: string; // "£10.5m" or "Form: 7.2"
  }>;
  onViewAll: () => void;
}
```

### Design
```
┌─────────────────────────────────────────────┐
│ Followed Players                    [View All]│
├─────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐      │
│ │[Photo]│ │[Photo]│ │[Photo]│ │[Photo]│      │
│ │ Name │ │ Name │ │ Name │ │ Name │      │
│ │£10.5m│ │Form:7│ │£8.2m │ │£12m  │      │
│ └──────┘ └──────┘ └──────┘ └──────┘      │
│                                            │
│ [← →] Scroll indicators (if more than 4)  │
└─────────────────────────────────────────────┘
```

### Layout
- **Container**: Horizontal scrollable container
- **Cards**: Compact cards, 120px width
- **Visible**: 3-4 cards at once on desktop, 2-3 on tablet, 1-2 on mobile
- **Scroll**: Horizontal scroll, smooth scrolling
- **Navigation**: Left/right arrows (if more than visible cards)

### Card Design (Compact)
- **Photo**: 48x48px circular
- **Name**: 14px, bold, truncated
- **Key Stat**: 16px, bold, colored (price or form)
- **Hover**: Scale 1.05, show more details

### Empty State
- Message: "Follow players to see them here"
- CTA: "Browse Players" button

---

## Responsive Design

### Mobile (320px - 767px)
- **FollowedPlayersList**: 1 column grid
- **Header**: Stacked (title, search, filters)
- **Filters**: Collapsible section
- **Card**: Full width, stacked layout
- **Widget**: 1-2 cards visible, horizontal scroll

### Tablet (768px - 1023px)
- **FollowedPlayersList**: 2 column grid
- **Header**: Inline (search, sort, filter)
- **Card**: Standard layout
- **Widget**: 3 cards visible

### Desktop (1024px+)
- **FollowedPlayersList**: 3-4 column grid
- **Header**: Full inline layout
- **Card**: Full layout with all stats
- **Widget**: 4 cards visible

---

## Integration Points

### Where FollowButton Appears

1. **Player Detail Modal/View**
   - Top-right corner
   - Medium size (32px)
   - Always visible

2. **Player Search Results**
   - Top-right of each result card
   - Small size (24px)
   - Always visible

3. **Team View (Opponent Teams)**
   - Top-right of player card
   - Small size (24px)
   - Always visible

4. **Transfer Assistant**
   - Top-right of recommendation cards
   - Small size (24px)
   - Highlighted if already following

5. **FollowedPlayersList Cards**
   - Top-right corner
   - Medium size (32px)
   - Always visible (filled when in list)

### Visual Highlighting
- Followed players in lists: Subtle border highlight (green tint)
- Followed players in search: "Following" badge or border
- Transfer Assistant: "You're following" indicator

---

## Color & Typography

### Colors
- **Follow Active**: `var(--pl-green)` (#00ff87)
- **Follow Inactive**: `#999999` (gray)
- **Form Good**: `#10b981` (green)
- **Form Average**: `#f59e0b` (yellow)
- **Form Poor**: `#ef4444` (red)
- **Price Up**: `#10b981` (green)
- **Price Down**: `#ef4444` (red)
- **Card Background**: Glass morphism (`rgba(26, 26, 46, 0.7)`)
- **Card Border**: `rgba(255, 255, 255, 0.1)`

### Typography
- **Card Title**: 18px, bold, white
- **Card Subtitle**: 14px, regular, muted
- **Stats Primary**: 16px, bold, white
- **Stats Secondary**: 14px, regular, muted
- **Button Text**: 14px, medium, white

---

## Interaction States

### FollowButton States
- **Default**: Outline/filled star
- **Hover**: Scale 1.1, color change
- **Active/Click**: Scale 0.95 (brief)
- **Loading**: Spinner, disabled
- **Success**: Brief pulse animation

### Card States
- **Default**: Standard appearance
- **Hover**: Scale 1.02, shadow increase
- **Active/Click**: Scale 0.98 (brief)
- **Loading**: Skeleton/shimmer

---

## Empty States

### No Players Followed
- **Icon**: Star outline icon (large)
- **Heading**: "No Players Followed Yet"
- **Message**: "Start following players to track their performance and get quick insights"
- **CTAs**: 
  - Primary: "Browse Players"
  - Secondary: "Search Players"

### Loading
- Skeleton cards matching card layout
- Shimmer animation
- 6 skeleton cards

### Error
- Error icon
- Message: "Failed to load followed players"
- **CTA**: "Retry" button

---

## Accessibility

### FollowButton
- **ARIA Label**: "Follow [Player Name]" or "Unfollow [Player Name]"
- **Role**: button
- **Keyboard**: Space/Enter to toggle
- **Focus**: Clear focus ring (green)

### Cards
- **ARIA Label**: "Player card for [Name], [Team], [Position]"
- **Keyboard**: Tab to card, Enter to view details
- **Focus**: Clear focus indicator

### List
- **ARIA Label**: "Followed players list"
- **Live Region**: Announce when players are added/removed
- **Keyboard Navigation**: Full support

---

**Design Specification Complete** ✅  
**Ready for Developer Implementation** 🚀



# Top Performing Players - Design Specification

**Date**: 2025-12-19  
**Designer**: UI Designer Agent  
**Status**: ✅ Design Complete  
**Priority**: P1 (High)

---

## Overview

Design specification for the "Top Performing Players" feature that displays the favorite team's top 3 performing players with key statistics, rankings, and performance indicators.

**Location**: Dashboard, within "My Team" section  
**Context**: Part of favorite team information, complements head-to-head stats and opponent form

---

## Design Principles

### Visual Hierarchy
1. **#1 Player**: Most prominent (slightly larger card, highlighted border, gold accent)
2. **#2 & #3 Players**: Equal prominence but secondary to #1 (silver/bronze accents)
3. **Stats**: Primary stats (goals, assists) more prominent than secondary (rating, appearances)

### Information Architecture
- **Primary Info**: Player photo, name, position, ranking badge
- **Key Stats**: Goals, assists (most important, large numbers)
- **Secondary Stats**: Rating, appearances, minutes (smaller, below primary)
- **Context**: Form indicator, performance badges

### Visual Design
- **Player Photos**: Large, prominent, circular (120-150px on desktop)
- **Stats Display**: Clear, scannable numbers with icons
- **Badges**: Distinctive but not overwhelming
- **Colors**: Use app color scheme with optional gold/silver/bronze for rankings

---

## Component Design

### TopPerformersSection Component

**Purpose**: Container component that displays top 3 performing players

**Layout**:
- **Desktop**: 3 cards in horizontal row, equal width (or #1 slightly larger)
- **Tablet**: 3 cards in row (may be smaller)
- **Mobile**: Stacked vertically, full width cards

**Styling**:
- Uses `glass` class for background
- `rounded-xl` border radius
- Padding: `p-4 sm:p-6`
- Spacing between cards: `gap-4 sm:gap-6`

---

### PlayerCard Component

**Purpose**: Individual player card displaying player info and stats

#### Card Structure

```
┌─────────────────────────────────┐
│  [Rank Badge]  [Performance Badges] │
│                                     │
│         [Player Photo]              │
│                                     │
│         Player Name                 │
│         Position                    │
│                                     │
│  ┌─────────┬─────────┐            │
│  │ ⚽ Goals │ 🅰️ Assists│            │
│  │   12    │    8    │            │
│  └─────────┴─────────┘            │
│                                     │
│  ┌─────────┬─────────┐            │
│  │ ⭐ Rating│ 📊 Apps │            │
│  │   7.5   │   24    │            │
│  └─────────┴─────────┘            │
│                                     │
│      [Form Indicator]               │
└─────────────────────────────────┘
```

#### Visual Specifications

**Card Dimensions**:
- Desktop: `w-full` (flex-1 in 3-column grid)
- Mobile: `w-full` (stacked)

**Card Styling**:
- Background: `glass` class or `bg-[var(--pl-card)]`
- Border: `border border-white/10`
- Border Radius: `rounded-xl`
- Padding: `p-4 sm:p-6`
- Hover: `hover:bg-[var(--pl-card-hover)] transition-colors`
- Shadow: `shadow-lg` (optional)

**#1 Player Special Styling**:
- Border: `border-2 border-[var(--pl-yellow)]` (gold accent)
- Background: `bg-[var(--pl-yellow)]/5` (subtle gold tint)
- Scale: Slightly larger on desktop (optional: `scale-105`)

**#2 Player Styling**:
- Border: `border border-white/20` (silver accent)
- Background: `bg-[var(--pl-card)]`

**#3 Player Styling**:
- Border: `border border-white/10` (bronze accent)
- Background: `bg-[var(--pl-card)]`

---

### Ranking Badge Component

**Purpose**: Display player ranking (#1, #2, #3)

**Design**:
- Position: Top-left corner of card
- Size: `w-10 h-10 sm:w-12 sm:h-12` (40-48px)
- Shape: Circular (`rounded-full`)
- Typography: `text-lg sm:text-xl font-bold`

**Colors**:
- #1: `bg-[var(--pl-yellow)] text-[var(--pl-dark)]` (gold)
- #2: `bg-gray-400 text-white` (silver)
- #3: `bg-[#cd7f32] text-white` (bronze) or `bg-[var(--pl-cyan)]/80 text-white`

**Styling**:
- Position: `absolute top-2 left-2`
- Shadow: `shadow-lg`
- Z-index: `z-10`

---

### Player Photo Component

**Purpose**: Display player photo prominently

**Design**:
- Size: `w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36` (96-144px)
- Shape: Circular (`rounded-full`)
- Border: `border-2 border-white/20`
- Position: Centered at top of card

**Styling**:
- Object fit: `object-cover object-top`
- Background: `bg-[var(--pl-dark)]` (fallback)
- Shadow: `shadow-lg`
- Hover: `hover:scale-105 transition-transform` (optional)

**Fallback**:
- If photo unavailable: Show position icon or team logo
- Use `onError` handler to hide broken images

---

### Stats Display Component

**Purpose**: Display player statistics clearly

#### Primary Stats (Goals & Assists)

**Layout**: 2-column grid
- Grid: `grid grid-cols-2 gap-3 sm:gap-4`
- Container: `mt-4`

**Stat Box**:
- Background: `bg-[var(--pl-dark)]/50`
- Border: `border border-white/10`
- Border Radius: `rounded-lg`
- Padding: `p-3 sm:p-4`
- Text Align: Center

**Stat Icon**:
- Size: `text-2xl sm:text-3xl` (emoji or SVG)
- Position: Above number

**Stat Value**:
- Font: `text-2xl sm:text-3xl font-bold`
- Color: `text-[var(--pl-green)]` (for goals), `text-[var(--pl-cyan)]` (for assists)

**Stat Label**:
- Font: `text-xs sm:text-sm`
- Color: `text-[var(--pl-text-muted)]`
- Position: Below value

#### Secondary Stats (Rating & Appearances)

**Layout**: 2-column grid (same as primary)
- Grid: `grid grid-cols-2 gap-2 sm:gap-3`
- Container: `mt-3`

**Stat Box**:
- Background: `bg-[var(--pl-dark)]/30`
- Border: `border border-white/5`
- Border Radius: `rounded-lg`
- Padding: `p-2 sm:p-3`
- Text Align: Center

**Stat Value**:
- Font: `text-lg sm:text-xl font-semibold`
- Color: `text-white`

**Stat Label**:
- Font: `text-xs`
- Color: `text-[var(--pl-text-muted)]`

---

### Performance Badge Component

**Purpose**: Display performance achievements (top scorer, top assister, high rating)

**Design**:
- Position: Top-right corner of card
- Size: `w-8 h-8 sm:w-10 sm:h-10` (32-40px)
- Shape: Circular (`rounded-full`)
- Typography: Icon or emoji

**Badge Types**:
1. **Top Scorer**: ⚽ icon, `bg-[var(--pl-green)]/80`
2. **Top Assister**: 🅰️ icon, `bg-[var(--pl-cyan)]/80`
3. **High Rating**: ⭐ icon, `bg-[var(--pl-yellow)]/80` (if rating > 7.0)

**Styling**:
- Position: `absolute top-2 right-2`
- Shadow: `shadow-md`
- Z-index: `z-10`
- Border: `border-2 border-white/20`

---

### Form Indicator Component

**Purpose**: Show player's recent form (last 5 matches)

**Design Options**:

**Option 1: Form Bar** (Recommended)
- Layout: Horizontal bar with 5 segments
- Colors: Green (W), Yellow (D), Pink (L)
- Size: `h-2 sm:h-3` (8-12px height)
- Width: Full width (`w-full`)
- Border Radius: `rounded-full`

**Option 2: Icons**
- Layout: 5 icons in a row
- Icons: ⚽ (W), ➖ (D), ❌ (L)
- Size: `text-sm sm:text-base`
- Spacing: `gap-1`

**Option 3: Text**
- Layout: Text string (e.g., "WWDLW")
- Font: `text-xs sm:text-sm font-mono`
- Color: `text-[var(--pl-text-muted)]`

**Recommended**: Option 1 (Form Bar) - most visual and scannable

**Styling**:
- Container: `mt-3 sm:mt-4`
- Flex: `flex gap-0.5`
- Each segment: `flex-1 h-2 sm:h-3 rounded`

**Colors**:
- Win: `bg-[var(--pl-green)]`
- Draw: `bg-[var(--pl-yellow)]`
- Loss: `bg-[var(--pl-pink)]`

---

## Responsive Design

### Desktop (> 1024px)

**Layout**:
- 3 cards in horizontal row
- Equal width (or #1 slightly larger)
- Gap: `gap-6`

**Player Photo**:
- Size: `w-36 h-36` (144px)

**Stats**:
- Primary stats: `text-3xl` (large)
- Secondary stats: `text-xl`

**Card Padding**:
- `p-6`

---

### Tablet (768px - 1024px)

**Layout**:
- 3 cards in row (may be smaller)
- Gap: `gap-4`

**Player Photo**:
- Size: `w-32 h-32` (128px)

**Stats**:
- Primary stats: `text-2xl`
- Secondary stats: `text-lg`

**Card Padding**:
- `p-4 sm:p-6`

---

### Mobile (< 768px)

**Layout**:
- Stacked vertically
- Full width cards
- Gap: `gap-4`

**Player Photo**:
- Size: `w-24 h-24` (96px)

**Stats**:
- Primary stats: `text-2xl`
- Secondary stats: `text-lg`

**Card Padding**:
- `p-4`

**Touch Targets**:
- Minimum 44x44px for interactive elements
- Cards clickable (if linking to player details)

---

## Interaction States

### Default State
- Card: `bg-[var(--pl-card)] border border-white/10`
- Photo: Normal size
- Stats: Visible

### Hover State
- Card: `hover:bg-[var(--pl-card-hover)]`
- Photo: `hover:scale-105` (optional)
- Border: `hover:border-white/20`
- Shadow: `hover:shadow-xl` (optional)

### Focus State (Keyboard Navigation)
- Outline: `focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2`
- For clickable cards

### Active State (If Clickable)
- Scale: `active:scale-95`
- Background: `active:bg-[var(--pl-card-hover)]`

---

## Typography

### Player Name
- Font: `text-lg sm:text-xl font-semibold`
- Color: `text-white`
- Truncate: `truncate` (if name too long)

### Position
- Font: `text-sm text-[var(--pl-text-muted)]`
- Uppercase: `uppercase`

### Stat Values (Primary)
- Font: `text-2xl sm:text-3xl font-bold`
- Color: `text-[var(--pl-green)]` (goals), `text-[var(--pl-cyan)]` (assists)

### Stat Values (Secondary)
- Font: `text-lg sm:text-xl font-semibold`
- Color: `text-white`

### Stat Labels
- Font: `text-xs sm:text-sm`
- Color: `text-[var(--pl-text-muted)]`

---

## Color Scheme

### App Colors (Primary)
- Green: `var(--pl-green)` - Goals, primary actions
- Cyan: `var(--pl-cyan)` - Assists, secondary actions
- Pink: `var(--pl-pink)` - Losses, alerts
- Yellow: `var(--pl-yellow)` - Draws, #1 player accent

### Ranking Colors
- #1: Gold - `var(--pl-yellow)` or `#ffd700`
- #2: Silver - `gray-400` or `#c0c0c0`
- #3: Bronze - `#cd7f32` or `var(--pl-cyan)/80`

### Background Colors
- Card: `var(--pl-card)` or `glass` class
- Card Hover: `var(--pl-card-hover)`
- Stat Box: `var(--pl-dark)/50` (primary), `var(--pl-dark)/30` (secondary)

---

## Accessibility

### WCAG AA Compliance
- **Color Contrast**: All text meets WCAG AA standards
  - White text on dark backgrounds: ✅
  - Colored text on dark backgrounds: ✅
  - Stat values: ✅

### Keyboard Navigation
- All interactive elements keyboard accessible
- Focus states visible (`focus:ring-2 focus:ring-[var(--pl-green)]`)
- Tab order logical

### Screen Readers
- Proper ARIA labels:
  - `aria-label="Player ranking: #1"`
  - `aria-label="Goals: 12"`
  - `aria-label="Assists: 8"`
  - `aria-label="Form: 3 wins, 1 draw, 1 loss"`

### Touch Targets
- Minimum 44x44px for all interactive elements
- Cards: Full card clickable (if linking to details)
- Badges: Large enough to tap

### Text Sizing
- Minimum 14px for body text on mobile
- Responsive text sizing (`text-sm sm:text-base`)

---

## Empty States

### No Players Available
- Message: "No player data available"
- Icon: ⚽ or 📊
- Styling: `text-[var(--pl-text-muted)] text-center py-8`

### Loading State
- Skeleton cards: 3 placeholder cards
- Animation: `animate-pulse`
- Same layout as actual cards

### Error State
- Message: "Failed to load player data"
- Retry button: Optional
- Styling: `text-[var(--pl-pink)]`

---

## Integration Points

### Where It Fits
- **Location**: Dashboard, within "My Team" section (`DashboardSection` with `type="team"`)
- **Position**: Below head-to-head section or opponent form stats
- **Context**: Part of favorite team information

### Related Components
- `DashboardSection` - Wraps the component
- `MatchCountdown` - Above or adjacent
- `OpponentFormStats` - Above or adjacent
- `FavoriteTeamInjuryAlerts` - Below or adjacent

### Data Integration
- Uses `footballApi.getTeamPlayers(teamId)` or FPL API filtered by team
- May need new endpoint: `/football/team-top-players/{team_id}`

---

## Design Decisions

### Card Style
**Decision**: Simple cards with photo and stats (not podium style)
**Rationale**: Clean, scannable, consistent with existing card patterns

### Stats Display
**Decision**: All primary stats visible, secondary stats below
**Rationale**: No need for hover/expand - all important info visible at once

### Ranking Visual
**Decision**: Badge in top-left corner (#1, #2, #3) with color coding
**Rationale**: Clear, doesn't interfere with photo, consistent with existing badge patterns

### Player Photos
**Decision**: Large circular photos (120-150px on desktop)
**Rationale**: Prominent, matches existing player card patterns

### Performance Badges
**Decision**: Small circular badges in top-right corner
**Rationale**: Visible but not overwhelming, matches existing badge patterns

### Form Indicator
**Decision**: Horizontal form bar with color-coded segments
**Rationale**: Most visual and scannable, matches existing form indicators

### Layout
**Decision**: Horizontal row on desktop, stacked on mobile
**Rationale**: Best use of space, clear comparison between players

### #1 Player Distinction
**Decision**: Gold border and subtle background tint
**Rationale**: Clear hierarchy without being too dominant

---

## Component Specifications

### TopPerformersSection

```typescript
interface TopPerformersSectionProps {
  teamId: number;
  teamName?: string;
  season?: string; // e.g., "2024/25"
}
```

**States**:
- Loading: Show skeleton cards
- Error: Show error message
- Empty: Show empty state
- Success: Show player cards

---

### PlayerCard

```typescript
interface PlayerCardProps {
  player: {
    id: number;
    name: string;
    position: string; // "GK", "DEF", "MID", "FWD"
    photo: string | null;
    goals: number;
    assists: number;
    rating: number | null;
    appearances: number;
    minutes: number;
    form: ('W' | 'D' | 'L')[]; // Last 5 matches
  };
  rank: 1 | 2 | 3;
  isTopScorer?: boolean;
  isTopAssister?: boolean;
  hasHighRating?: boolean; // rating > 7.0
  onClick?: () => void; // Optional: link to player details
}
```

---

## Implementation Notes

### Player Photo URL
- Use existing `getPlayerPhotoUrl()` function from `TeamPitch.tsx`
- Format: `https://resources.premierleague.com/premierleague/photos/players/250x250/p{photoCode}.png`

### Ranking Logic
1. Primary: Goals scored (highest first)
2. Secondary: Assists (if goals equal)
3. Tertiary: Average rating (if goals and assists equal)
4. Alternative: Combined score (goals × 2 + assists × 1.5 + rating × 0.1)

### Performance Badges Logic
- Top Scorer: Player with most goals
- Top Assister: Player with most assists
- High Rating: Rating > 7.0 (optional threshold)

### Form Data
- Last 5 matches: W/D/L results
- If less than 5 matches available, show available matches only

---

## Design Deliverables Checklist

- [x] Component design specifications
- [x] Layout specifications (desktop, tablet, mobile)
- [x] Typography specifications
- [x] Color scheme
- [x] Interaction states
- [x] Accessibility considerations
- [x] Responsive breakpoints
- [x] Empty/loading/error states
- [x] Integration points
- [x] Design decisions documented

---

**Design Specification Complete** ✅  
**Ready for Developer Handoff** 🚀




# Top Performing Players - Developer Handoff

**Date**: 2025-12-19  
**From**: UI Designer Agent  
**To**: Developer Agent  
**Status**: ✅ Design Complete, Ready for Implementation  
**Priority**: P1 (High)

---

## Overview

Implementation guide for the "Top Performing Players" feature that displays the favorite team's top 3 performing players with key statistics, rankings, and performance indicators.

**Location**: Dashboard, within "My Team" section (`DashboardSection` with `type="team"`)  
**Reference**: Full design specification in `top-performing-players-design-spec.md`

---

## Design Specification

**Full Design Spec**: `docs/features/top-performing-players/top-performing-players-design-spec.md`

**Key Design Decisions**:
- 3 cards in horizontal row (desktop), stacked (mobile)
- #1 player has gold border and subtle background tint
- Large circular player photos (120-150px on desktop)
- Primary stats (goals, assists) prominent, secondary stats below
- Form bar showing last 5 matches (W/D/L)
- Performance badges for top scorer, top assister, high rating

---

## Component Structure

### 1. TopPerformersSection Component

**File**: `frontend/src/components/dashboard/TopPerformersSection.tsx`

**Purpose**: Container component that fetches data and displays top 3 players

**Props**:
```typescript
interface TopPerformersSectionProps {
  teamId: number;
  teamName?: string;
  season?: string; // e.g., "2024/25"
}
```

**Responsibilities**:
- Fetch player data from API
- Calculate rankings (goals → assists → rating)
- Determine performance badges
- Handle loading/error/empty states
- Render 3 PlayerCard components

**Data Fetching**:
```typescript
// Option 1: Use FPL API (if available)
const players = bootstrap.elements.filter(p => p.team === teamId);

// Option 2: Use Football API
const teamPlayers = await footballApi.getTeamPlayers(teamId);

// Option 3: New endpoint (may need to be created)
const topPlayers = await footballApi.getTeamTopPlayers(teamId, 3);
```

**Ranking Logic**:
```typescript
function calculateRanking(players: Player[]): Player[] {
  return players
    .map(player => ({
      ...player,
      score: (player.goals_scored * 2) + (player.assists * 1.5) + (player.rating || 0) * 0.1
    }))
    .sort((a, b) => {
      // Primary: Goals
      if (b.goals_scored !== a.goals_scored) {
        return b.goals_scored - a.goals_scored;
      }
      // Secondary: Assists
      if (b.assists !== a.assists) {
        return b.assists - a.assists;
      }
      // Tertiary: Rating
      return (b.rating || 0) - (a.rating || 0);
    })
    .slice(0, 3);
}
```

**Performance Badges Logic**:
```typescript
function getPerformanceBadges(players: Player[], player: Player) {
  const topScorer = players.reduce((max, p) => p.goals_scored > max.goals_scored ? p : max);
  const topAssister = players.reduce((max, p) => p.assists > max.assists ? p : max);
  
  return {
    isTopScorer: player.id === topScorer.id,
    isTopAssister: player.id === topAssister.id,
    hasHighRating: (player.rating || 0) > 7.0
  };
}
```

---

### 2. PlayerCard Component

**File**: `frontend/src/components/dashboard/PlayerCard.tsx` (or inline in TopPerformersSection)

**Purpose**: Individual player card displaying player info and stats

**Props**:
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
  hasHighRating?: boolean;
  onClick?: () => void;
}
```

**Component Structure**:
```tsx
export default function PlayerCard({
  player,
  rank,
  isTopScorer,
  isTopAssister,
  hasHighRating,
  onClick,
}: PlayerCardProps) {
  const photoUrl = getPlayerPhotoUrl(player.photo);
  
  // Ranking badge colors
  const rankColors = {
    1: 'bg-[var(--pl-yellow)] text-[var(--pl-dark)]',
    2: 'bg-gray-400 text-white',
    3: 'bg-[var(--pl-cyan)]/80 text-white',
  };
  
  // Card styling based on rank
  const cardStyles = {
    1: 'border-2 border-[var(--pl-yellow)] bg-[var(--pl-yellow)]/5',
    2: 'border border-white/20 bg-[var(--pl-card)]',
    3: 'border border-white/10 bg-[var(--pl-card)]',
  };
  
  return (
    <div
      className={`relative glass rounded-xl p-4 sm:p-6 ${cardStyles[rank]} transition-all hover:bg-[var(--pl-card-hover)] ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Ranking Badge */}
      <div className={`absolute top-2 left-2 w-10 h-10 sm:w-12 sm:h-12 rounded-full ${rankColors[rank]} flex items-center justify-center text-lg sm:text-xl font-bold shadow-lg z-10`}>
        #{rank}
      </div>
      
      {/* Performance Badges */}
      <div className="absolute top-2 right-2 flex gap-1 z-10">
        {isTopScorer && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-green)]/80 border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md" title="Top Scorer">
            ⚽
          </div>
        )}
        {isTopAssister && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-cyan)]/80 border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md" title="Top Assister">
            🅰️
          </div>
        )}
        {hasHighRating && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[var(--pl-yellow)]/80 border-2 border-white/20 flex items-center justify-center text-lg sm:text-xl shadow-md" title="High Rating">
            ⭐
          </div>
        )}
      </div>
      
      {/* Player Photo */}
      <div className="flex justify-center mb-4">
        <div className="relative w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full border-2 border-white/20 shadow-lg overflow-hidden bg-[var(--pl-dark)]">
          <img
            src={photoUrl}
            alt={player.name}
            className="w-full h-full object-cover object-top"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      </div>
      
      {/* Player Name & Position */}
      <div className="text-center mb-4">
        <div className="text-lg sm:text-xl font-semibold text-white truncate">
          {player.name}
        </div>
        <div className="text-sm text-[var(--pl-text-muted)] uppercase mt-1">
          {player.position}
        </div>
      </div>
      
      {/* Primary Stats (Goals & Assists) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3">
        <div className="bg-[var(--pl-dark)]/50 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1">⚽</div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-green)]">
            {player.goals}
          </div>
          <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mt-1">
            Goals
          </div>
        </div>
        <div className="bg-[var(--pl-dark)]/50 border border-white/10 rounded-lg p-3 sm:p-4 text-center">
          <div className="text-2xl sm:text-3xl mb-1">🅰️</div>
          <div className="text-2xl sm:text-3xl font-bold text-[var(--pl-cyan)]">
            {player.assists}
          </div>
          <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mt-1">
            Assists
          </div>
        </div>
      </div>
      
      {/* Secondary Stats (Rating & Appearances) */}
      <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4">
        {player.rating !== null && (
          <div className="bg-[var(--pl-dark)]/30 border border-white/5 rounded-lg p-2 sm:p-3 text-center">
            <div className="text-lg sm:text-xl font-semibold text-white">
              {player.rating.toFixed(1)}
            </div>
            <div className="text-xs text-[var(--pl-text-muted)] mt-1">
              ⭐ Rating
            </div>
          </div>
        )}
        <div className="bg-[var(--pl-dark)]/30 border border-white/5 rounded-lg p-2 sm:p-3 text-center">
          <div className="text-lg sm:text-xl font-semibold text-white">
            {player.appearances}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)] mt-1">
            📊 Apps
          </div>
        </div>
      </div>
      
      {/* Form Indicator */}
      {player.form && player.form.length > 0 && (
        <div className="mt-3 sm:mt-4">
          <div className="flex gap-0.5">
            {player.form.map((result, idx) => (
              <div
                key={idx}
                className={`flex-1 h-2 sm:h-3 rounded ${
                  result === 'W'
                    ? 'bg-[var(--pl-green)]'
                    : result === 'D'
                    ? 'bg-[var(--pl-yellow)]'
                    : 'bg-[var(--pl-pink)]'
                }`}
                title={result === 'W' ? 'Win' : result === 'D' ? 'Draw' : 'Loss'}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

### 3. Helper Functions

**Player Photo URL** (reuse from existing code):
```typescript
function getPlayerPhotoUrl(photo: string | null): string {
  if (!photo) return '';
  const photoCode = photo.replace('.jpg', '');
  return `https://resources.premierleague.com/premierleague/photos/players/250x250/p${photoCode}.png`;
}
```

**Position Mapping** (if needed):
```typescript
const POSITION_MAP: { [key: number]: string } = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};
```

---

## Integration

### Dashboard Integration

**File**: `frontend/src/app/dashboard/page.tsx`

**Location**: Within "My Team" section, after `OpponentFormStats` or `MatchCountdown`

**Code**:
```tsx
{/* My Team Section */}
{user?.favorite_team_id && (
  <DashboardSection
    type="team"
    title="MY TEAM"
    subtitle={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name || "Follow your favorite club"}
    viewAllHref="/my-team"
  >
    {/* Match Countdown */}
    {nextFixtureDate && nextFixtureOpponent && (
      <MatchCountdown ... />
    )}
    
    {/* Opponent Form Stats */}
    {user?.favorite_team_id && nextFixtureOpponentId && (
      <OpponentFormStats ... />
    )}
    
    {/* Top Performing Players */}
    <TopPerformersSection
      teamId={user.favorite_team_id}
      teamName={bootstrap?.teams?.find((t: any) => t.id === user?.favorite_team_id)?.name}
      season="2024/25" // Or calculate from current date
    />
    
    {/* Other My Team content */}
  </DashboardSection>
)}
```

---

## Data Requirements

### Data Structure

**Player Data** (from FPL API or Football API):
```typescript
interface PlayerData {
  id: number;
  web_name: string; // or first_name + second_name
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  photo: string | null;
  goals_scored: number;
  assists: number;
  total_points: number;
  minutes: number;
  starts: number;
  // Rating may need to come from Football API
  rating?: number | null;
  // Form may need to be calculated from recent fixtures
  form?: ('W' | 'D' | 'L')[];
}
```

### Data Sources

**Option 1: FPL API** (if players are in FPL):
```typescript
// Filter FPL players by team
const teamPlayers = bootstrap.elements.filter(
  (p: Player) => p.team === favoriteTeamId && p.minutes > 0
);
```

**Option 2: Football API**:
```typescript
// May need new endpoint
const topPlayers = await footballApi.getTeamTopPlayers(teamId, 3);
```

**Option 3: Calculate from existing data**:
```typescript
// Get team players from FPL API
const teamPlayers = bootstrap.elements.filter(
  (p: Player) => p.team === favoriteTeamId
);

// Calculate rankings
const topPlayers = calculateRanking(teamPlayers).slice(0, 3);
```

### Form Data

**Calculate from recent fixtures**:
```typescript
async function getPlayerForm(playerId: number, teamId: number): Promise<('W' | 'D' | 'L')[]> {
  // Get recent fixtures for team
  const fixtures = await footballApi.getRecentFixtures(teamId, 5);
  
  // For each fixture, determine if player's team won/drew/lost
  // This may require checking match results
  // Return array of 'W', 'D', 'L' for last 5 matches
}
```

---

## Responsive Implementation

### Desktop (> 1024px)
```tsx
<div className="grid grid-cols-3 gap-6">
  {topPlayers.map((player, index) => (
    <PlayerCard key={player.id} player={player} rank={(index + 1) as 1 | 2 | 3} />
  ))}
</div>
```

### Tablet (768px - 1024px)
```tsx
<div className="grid grid-cols-3 gap-4">
  {topPlayers.map((player, index) => (
    <PlayerCard key={player.id} player={player} rank={(index + 1) as 1 | 2 | 3} />
  ))}
</div>
```

### Mobile (< 768px)
```tsx
<div className="space-y-4">
  {topPlayers.map((player, index) => (
    <PlayerCard key={player.id} player={player} rank={(index + 1) as 1 | 2 | 3} />
  ))}
</div>
```

---

## States

### Loading State
```tsx
{loading && (
  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
    {[1, 2, 3].map((i) => (
      <div key={i} className="glass rounded-xl p-4 sm:p-6 animate-pulse">
        <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-[var(--pl-dark)]/50 mx-auto mb-4" />
        <div className="h-4 bg-[var(--pl-dark)]/50 rounded mb-2" />
        <div className="h-4 bg-[var(--pl-dark)]/50 rounded w-2/3 mx-auto" />
      </div>
    ))}
  </div>
)}
```

### Error State
```tsx
{error && (
  <div className="glass rounded-xl p-4 sm:p-6 text-center text-[var(--pl-text-muted)]">
    Failed to load top performers
  </div>
)}
```

### Empty State
```tsx
{topPlayers.length === 0 && !loading && (
  <div className="glass rounded-xl p-4 sm:p-6 text-center text-[var(--pl-text-muted)]">
    <div className="text-4xl mb-2">⚽</div>
    <div>No player data available</div>
  </div>
)}
```

---

## Accessibility

### ARIA Labels
```tsx
<div
  aria-label={`Player ranking: #${rank}, ${player.name}, ${player.position}`}
  role="article"
>
  {/* Card content */}
</div>

<div aria-label={`Goals: ${player.goals}`}>
  {player.goals}
</div>

<div aria-label={`Assists: ${player.assists}`}>
  {player.assists}
</div>
```

### Keyboard Navigation
- If cards are clickable, ensure `onClick` is keyboard accessible
- Use `onKeyDown` handler for Enter/Space keys
- Visible focus states: `focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]`

---

## Testing Checklist

- [ ] Component renders correctly on desktop
- [ ] Component renders correctly on tablet
- [ ] Component renders correctly on mobile
- [ ] #1 player has gold border and background tint
- [ ] #2 and #3 players have correct styling
- [ ] Player photos display correctly (with fallback)
- [ ] Stats display correctly (goals, assists, rating, appearances)
- [ ] Performance badges show for top scorer, top assister, high rating
- [ ] Form indicator displays last 5 matches correctly
- [ ] Loading state shows skeleton cards
- [ ] Error state shows error message
- [ ] Empty state shows when no players available
- [ ] Hover states work correctly
- [ ] Clickable cards navigate to player details (if implemented)
- [ ] Keyboard navigation works
- [ ] Screen reader announces content correctly
- [ ] Color contrast meets WCAG AA standards

---

## Implementation Priority

1. **High Priority**:
   - Create `TopPerformersSection` component
   - Create `PlayerCard` component
   - Integrate into dashboard
   - Basic stats display (goals, assists)

2. **Medium Priority**:
   - Ranking badges (#1, #2, #3)
   - Performance badges (top scorer, top assister)
   - Form indicator
   - Secondary stats (rating, appearances)

3. **Low Priority**:
   - Clickable cards (link to player details)
   - Hover effects
   - Animations

---

## Dependencies

- Existing components: `DashboardSection`, `SectionHeader`
- Existing utilities: `getPlayerPhotoUrl()` (from `TeamPitch.tsx`)
- API: `footballApi` or `fplApi` for player data
- CSS variables: `--pl-green`, `--pl-cyan`, `--pl-yellow`, `--pl-pink`, `--pl-card`, etc.

---

## Next Steps

1. **Review Design Spec**: Read `top-performing-players-design-spec.md` for full details
2. **Create Components**: Implement `TopPerformersSection` and `PlayerCard`
3. **Integrate API**: Determine data source and implement data fetching
4. **Integrate Dashboard**: Add component to "My Team" section
5. **Test**: Test on all breakpoints and states
6. **Polish**: Add animations, hover effects, etc.

---

**Handoff Complete** ✅  
**Ready for Implementation** 🚀




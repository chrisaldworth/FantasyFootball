# Personalized News Feature - Developer Handoff

**From**: UI Designer Agent  
**To**: Developer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P1 (High)

---

## Overview

This document provides implementation guidance for the Personalized News feature, which enhances the existing news section to show both favorite team news and FPL squad player news in one cohesive interface.

**Key Changes**:
1. Add news type badges (Team/Player)
2. Add player name display for player news
3. Add filter and sort controls
4. Enhance existing news cards
5. Create empty states for different scenarios

---

## Design Specification Reference

**Complete Design Spec**: `docs/personalized-news-design-spec.md`

This document contains:
- Detailed wireframes (mobile + desktop)
- Component specifications
- Design system updates
- Interaction patterns
- Accessibility requirements

**Please read the design spec thoroughly before starting implementation.**

---

## Implementation Priority

### Week 1: Core Components
1. **News Type Badge** (P1)
   - Create `NewsTypeBadge` component
   - Support team and player variants

2. **Player Name Display** (P1)
   - Create `PlayerNameDisplay` component
   - Format: "Player Name" or "Player Name (Team)"

3. **Enhanced News Card** (P1)
   - Enhance existing news card
   - Add badge and player name support

### Week 2: Filtering & Integration
4. **Filter & Sort Controls** (P1)
   - Create filter buttons
   - Create sort dropdown
   - Implement client-side filtering/sorting

5. **Personalized News Feed** (P1)
   - Create main `PersonalizedNewsFeed` component
   - Integrate with new API endpoint
   - Combine team and player news

6. **Empty States** (P1)
   - Create empty state components
   - Handle different scenarios

---

## Key Implementation Notes

### 1. Enhance Existing Components

**Current State**: `TeamNewsOverview.tsx` shows favorite team news

**New State**: Show both team and player news with filtering

**Approach**:
- Option A: Enhance `TeamNewsOverview.tsx` to support personalized news
- Option B: Create new `PersonalizedNewsFeed.tsx` that uses `TeamNewsOverview` as base
- **Recommendation**: Option B (new component) to avoid breaking existing functionality

**File Structure**:
```
frontend/src/components/news/
  ├── PersonalizedNewsFeed.tsx (new - main component)
  ├── NewsTypeBadge.tsx (new)
  ├── PlayerNameDisplay.tsx (new)
  ├── PersonalizedNewsCard.tsx (new - enhanced card)
  ├── NewsFilterButtons.tsx (new)
  ├── NewsSortDropdown.tsx (new)
  ├── EmptyTeamNews.tsx (new)
  ├── EmptyPlayerNews.tsx (new)
  └── NewsCardSkeleton.tsx (new)
```

---

### 2. News Type Badge Component

**Component**: `NewsTypeBadge`

**File**: `frontend/src/components/news/NewsTypeBadge.tsx`

**Props**:
```typescript
interface NewsTypeBadgeProps {
  type: 'team' | 'player';
  teamLogo?: string; // For team news
  playerName?: string; // For player news (optional, for accessibility)
}
```

**Implementation**:
- Position: Absolute top-right of card
- Size: 24x24px (mobile), 28x28px (desktop)
- Team variant: Team primary color, team logo
- Player variant: FPL green (#00ff87), player icon
- ARIA label: "Team news" or "Player news: [Player Name]"

**Styling**:
```tsx
// Team badge
className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold uppercase"
style={{ 
  backgroundColor: 'var(--team-primary)',
  color: 'var(--team-text-on-primary)'
}}

// Player badge
className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold uppercase bg-[#00ff87]/20 text-white border border-[#00ff87]"
```

---

### 3. Player Name Display Component

**Component**: `PlayerNameDisplay`

**File**: `frontend/src/components/news/PlayerNameDisplay.tsx`

**Props**:
```typescript
interface PlayerNameDisplayProps {
  playerName: string;
  teamName?: string; // Optional
  showTeam?: boolean; // Default: true
}
```

**Implementation**:
- Format: "Mohamed Salah" or "Salah (Liverpool)"
- Typography: Bold, 14px (mobile), 16px (desktop)
- Color: FPL green (#00ff87)
- Position: Below badge, above title
- Truncation: Ellipsis if too long (max 2 lines)

**Styling**:
```tsx
<div className="mb-2">
  <span className="text-sm sm:text-base font-semibold text-[#00ff87]">
    {playerName}
  </span>
  {showTeam && teamName && (
    <span className="text-xs text-[var(--pl-text-muted)] ml-1">
      ({teamName})
    </span>
  )}
</div>
```

---

### 4. Enhanced News Card

**Component**: `PersonalizedNewsCard`

**File**: `frontend/src/components/news/PersonalizedNewsCard.tsx`

**Props**:
```typescript
interface PersonalizedNewsCardProps {
  newsItem: {
    id: string;
    title: string;
    summary: string;
    type: 'team' | 'player';
    player_name?: string;
    team_logo?: string;
    categories?: string[];
    importance_score?: number;
    publishedAt: string;
    source: string;
    url?: string;
  };
}
```

**Implementation**:
- Use existing card design as base
- Add `NewsTypeBadge` component
- Add `PlayerNameDisplay` if type is 'player'
- Maintain existing styling (glass morphism)
- Add team/player themed background (subtle)

**Structure**:
```tsx
<div className="glass rounded-xl p-4 sm:p-6 relative">
  <NewsTypeBadge type={newsItem.type} teamLogo={newsItem.team_logo} />
  {newsItem.type === 'player' && newsItem.player_name && (
    <PlayerNameDisplay 
      playerName={newsItem.player_name} 
      teamName={/* get from player data */}
    />
  )}
  <h5 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">
    {newsItem.title}
  </h5>
  {/* Rest of existing card content */}
</div>
```

---

### 5. Filter & Sort Controls

**Component**: `NewsFilterButtons`

**File**: `frontend/src/components/news/NewsFilterButtons.tsx`

**Props**:
```typescript
interface NewsFilterButtonsProps {
  activeFilter: 'all' | 'team' | 'players';
  onFilterChange: (filter: 'all' | 'team' | 'players') => void;
}
```

**Implementation**:
- Three buttons: "All News", "Team", "Players"
- Active state: Team primary color background
- Inactive state: Transparent with border
- Mobile: Horizontal scrollable row
- Desktop: Full row

**Styling**:
```tsx
<button
  onClick={() => onFilterChange('all')}
  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
    activeFilter === 'all'
      ? 'bg-[var(--team-primary)] text-white'
      : 'bg-transparent border border-white/10 text-[var(--pl-text-muted)]'
  }`}
>
  All News
</button>
```

**Component**: `NewsSortDropdown`

**File**: `frontend/src/components/news/NewsSortDropdown.tsx`

**Props**:
```typescript
interface NewsSortDropdownProps {
  sortBy: 'recent' | 'important' | 'category';
  onSortChange: (sort: 'recent' | 'important' | 'category') => void;
}
```

**Implementation**:
- Dropdown with three options
- Match existing dropdown style
- Right-aligned on desktop

---

### 6. Personalized News Feed

**Component**: `PersonalizedNewsFeed`

**File**: `frontend/src/components/news/PersonalizedNewsFeed.tsx`

**Props**:
```typescript
interface PersonalizedNewsFeedProps {
  // Component handles fetching internally
}
```

**Implementation**:
1. Fetch from `/api/football/personalized-news`
2. Combine team and player news
3. Apply filters (client-side)
4. Apply sorting (client-side)
5. Render news cards
6. Handle loading, error, and empty states

**State Management**:
```typescript
const [news, setNews] = useState<PersonalizedNewsItem[]>([]);
const [filter, setFilter] = useState<'all' | 'team' | 'players'>('all');
const [sortBy, setSortBy] = useState<'recent' | 'important' | 'category'>('recent');
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');
```

**Filtering Logic**:
```typescript
const filteredNews = news.filter(item => {
  if (filter === 'all') return true;
  if (filter === 'team') return item.type === 'team';
  if (filter === 'players') return item.type === 'player';
  return true;
});
```

**Sorting Logic**:
```typescript
const sortedNews = [...filteredNews].sort((a, b) => {
  if (sortBy === 'recent') {
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  }
  if (sortBy === 'important') {
    return (b.importance_score || 0) - (a.importance_score || 0);
  }
  // category sorting: group by category, then by date
  return 0;
});
```

---

### 7. API Integration

**New Endpoint**: `GET /api/football/personalized-news`

**Add to API Client** (`frontend/src/lib/api.ts`):
```typescript
export const footballApi = {
  // ... existing methods
  
  getPersonalizedNews: async () => {
    const response = await api.get('/api/football/personalized-news');
    return response.data;
  },
};
```

**Response Format**:
```typescript
interface PersonalizedNewsResponse {
  favorite_team_news?: {
    overview: string;
    highlights: NewsItem[];
    big_news: NewsItem[];
    categories: Record<string, number>;
    total_count: number;
  };
  fpl_player_news?: {
    overview: string;
    highlights: NewsItem[];
    big_news: NewsItem[];
    categories: Record<string, number>;
    total_count: number;
    players_covered: string[];
  };
  combined_news: PersonalizedNewsItem[];
  total_count: number;
}
```

**Usage**:
```typescript
const fetchPersonalizedNews = async () => {
  try {
    setLoading(true);
    const data = await footballApi.getPersonalizedNews();
    // Transform combined_news to include type and player_name
    const transformedNews = data.combined_news.map(item => ({
      ...item,
      type: item.type, // 'team' or 'player'
      player_name: item.player_name, // if type is 'player'
    }));
    setNews(transformedNews);
  } catch (err) {
    setError('Failed to load personalized news');
  } finally {
    setLoading(false);
  }
};
```

---

### 8. Empty States

**Component**: `EmptyTeamNews`

**File**: `frontend/src/components/news/EmptyTeamNews.tsx`

**Implementation**:
- Show when no favorite team selected
- Message: "Select a favorite team to see team news"
- CTA: "Select Team" button
- Link to team selection

**Component**: `EmptyPlayerNews`

**File**: `frontend/src/components/news/EmptyPlayerNews.tsx`

**Implementation**:
- Show when no FPL team linked
- Message: "Link your FPL team to see player news"
- CTA: "Link FPL Team" button
- Link to FPL account linking

**Component**: `EmptyNews`

**File**: `frontend/src/components/news/EmptyNews.tsx`

**Implementation**:
- Show when no news available at all
- Friendly message: "No news available at the moment"
- No CTA (just informational)

---

### 9. Loading States

**Component**: `NewsCardSkeleton`

**File**: `frontend/src/components/news/NewsCardSkeleton.tsx`

**Implementation**:
- Match final card layout
- Animated shimmer effect
- Use `animate-pulse` class
- Show 3-5 skeleton cards while loading

**Styling**:
```tsx
<div className="glass rounded-xl p-4 sm:p-6 animate-pulse">
  <div className="h-6 bg-[var(--pl-dark)]/50 rounded mb-2"></div>
  <div className="h-4 bg-[var(--pl-dark)]/50 rounded mb-2"></div>
  <div className="h-4 bg-[var(--pl-dark)]/50 rounded w-3/4"></div>
</div>
```

---

## Design System Updates

### Colors

**Add to CSS** (if not exists):
```css
:root {
  --fpl-green: #00ff87;
  --fpl-cyan: #04f5ff;
}
```

**Usage**:
- Player news badge: `bg-[#00ff87]/20` or `bg-[var(--fpl-green)]/20`
- Player name: `text-[#00ff87]` or `text-[var(--fpl-green)]`

### Typography

**Player Names**:
- Class: `text-sm sm:text-base font-semibold text-[#00ff87]`

**Badge Text**:
- Class: `text-xs font-semibold uppercase`

### Spacing

**Card Spacing**:
- Between cards: `gap-4` (mobile), `gap-6` (desktop)
- Card padding: `p-4` (mobile), `p-6` (desktop)

---

## Responsive Breakpoints

**Use Tailwind Breakpoints**:
- Mobile: Default (no prefix)
- Tablet: `sm:` (640px+)
- Desktop: `lg:` (1024px+)

**Key Breakpoints**:
- Mobile: 320px - 767px
- Tablet: 768px - 1023px
- Desktop: 1024px+

**Implementation**:
- Mobile-first: Design for mobile, enhance for larger screens
- Use `sm:` and `lg:` prefixes for responsive styles

---

## Accessibility Requirements

### WCAG AA Compliance

**Color Contrast**:
- Text: 4.5:1 minimum
- UI Elements: 3:1 minimum
- Verify badge text contrast

**Keyboard Navigation**:
- All interactive elements accessible via keyboard
- Tab order: Filters → Cards → Links
- Focus indicators: `focus:ring-2 focus:ring-[var(--team-primary)]`

**Screen Reader**:
- ARIA labels: `aria-label="Team news"` or `aria-label="Player news: [Player Name]"`
- Semantic HTML: Proper heading hierarchy
- Alt text: For team logos, player photos

**Touch Targets**:
- Minimum 44x44px on mobile
- Generous spacing between interactive elements
- Clear visual feedback on interaction

**Motion**:
- Respect `prefers-reduced-motion`:
  ```css
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
    }
  }
  ```

---

## Testing Requirements

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

### Performance Testing
- [ ] News loads < 3s
- [ ] Filtering/sorting is instant (client-side)
- [ ] No layout shift during load
- [ ] Smooth animations (60fps)

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces news types
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA

---

## Migration Strategy

### Step 1: Create New Components (Non-Breaking)
- Create new components in parallel
- Don't modify existing `TeamNewsOverview` yet
- Test new components in isolation

### Step 2: Integrate New Component (Feature Flag)
- Add feature flag for personalized news
- Show new component when flag enabled
- Keep existing component as fallback

### Step 3: Update Dashboard (After Testing)
- Replace `TeamNewsOverview` with `PersonalizedNewsFeed`
- Or show both (personalized in new section)
- Test thoroughly

### Step 4: Gradual Rollout
- Enable for 10% of users
- Monitor metrics
- Gradually increase to 100%

---

## Questions or Issues?

If you encounter any issues or need clarification:

1. **Design Questions**: Refer to `docs/personalized-news-design-spec.md`
2. **Requirements Questions**: Ask Product and Project Agent
3. **Technical Questions**: Use your best judgment, document decisions
4. **Accessibility Questions**: Refer to WCAG AA guidelines

---

## Success Criteria

Implementation is complete when:
- ✅ News type badges display correctly
- ✅ Player names show for player news
- ✅ Filtering works (all, team, players)
- ✅ Sorting works (recent, important, category)
- ✅ Empty states display correctly
- ✅ Loading states display correctly
- ✅ All components responsive (320px - 1920px)
- ✅ Touch targets minimum 44x44px
- ✅ Performance targets met (< 3s load)
- ✅ WCAG AA compliance maintained
- ✅ All tests passing

---

## Next Steps

1. **Review Design Spec**: Read `docs/personalized-news-design-spec.md` thoroughly
2. **Plan Implementation**: Break down into tasks, estimate effort
3. **Start Implementation**: Begin with badge and player name components
4. **Test Continuously**: Test as you build
5. **Hand off to Tester**: Create test plan when complete

---

**Good luck with implementation! 🚀**

**Remember**: Focus on clarity, engagement, and making it easy for users to distinguish between team news and player news!

---

**Handoff Complete!**


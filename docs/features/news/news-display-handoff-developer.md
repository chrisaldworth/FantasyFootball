# News Display Review & Fix - Developer Handoff

**From**: UI Designer Agent  
**To**: Developer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P1 (High)

---

## Overview

This document provides implementation guidance for fixing and simplifying the news display system. The goal is to make news **scannable, curated, and not overwhelming** by simplifying the layout, creating compact cards, and ensuring personalized news works properly.

**Key Changes**:
1. Simplify `TeamNewsOverview` - Remove sections, use compact cards, limit items
2. Fix `PersonalizedNewsFeed` - Ensure it displays properly, use compact cards
3. Create compact news cards - 80-100px height, minimal text
4. Add priority indicators - Colored borders for important news
5. Add "Show More" functionality - Progressive disclosure

---

## Design Specification Reference

**Complete Design Spec**: `docs/news-display-design-spec.md`

This document contains:
- Detailed wireframes (mobile + desktop)
- Component specifications
- Priority system design
- Responsive guidelines
- Accessibility requirements

**Please read the design spec thoroughly before starting implementation.**

---

## Implementation Priority

### Phase 1: Simplify Team News (P1 - High)
1. **Simplify TeamNewsOverview Component**
   - Remove overview summary box (or make collapsible)
   - Remove "Highlights" and "Top Stories" section headers
   - Combine all news into single unified list
   - Use compact cards (80-100px height)
   - Limit to 5-7 items initially

2. **Create CompactNewsCard Component**
   - 80-100px height
   - 2-line headline clamp
   - Optional summary (hidden on mobile)
   - Priority border system
   - Minimal metadata

### Phase 2: Fix Personalized News (P1 - High)
3. **Update PersonalizedNewsFeed**
   - Use compact card design
   - Add priority indicators
   - Limit initial display (5-7 items)
   - Add "Show More" functionality
   - Verify API endpoint works

4. **Debug & Fix Issues**
   - Check why personalized news may not be showing
   - Verify backend endpoint exists and returns data
   - Fix any errors preventing display

### Phase 3: Enhancements (P2 - Medium)
5. **Add Show More Functionality**
   - Progressive disclosure
   - Smooth expand/collapse animation

6. **Add Priority System**
   - Sort by priority (high → medium → low)
   - Visual indicators (colored borders)

---

## Key Implementation Notes

### 1. Simplify TeamNewsOverview

**Current State**: Shows overview, highlights, top stories, categories

**New State**: Single unified list with compact cards

**File**: `frontend/src/components/TeamNewsOverview.tsx`

**Changes Needed**:
1. Remove overview summary box (or make it collapsible)
2. Remove section headers ("Highlights", "Top Stories")
3. Combine `highlights` and `big_news` into single array
4. Sort by priority and importance
5. Limit to 5-7 items initially
6. Use `CompactNewsCard` component
7. Add "Show More" button

**Implementation**:
```tsx
// Combine all news
const allNews = [
  ...(overview.highlights || []),
  ...(overview.big_news || []),
];

// Remove duplicates
const uniqueNews = allNews.filter((item, index, self) =>
  index === self.findIndex((t) => t.id === item.id)
);

// Sort by priority and importance
const sortedNews = uniqueNews.sort((a, b) => {
  const priorityA = calculatePriority(a);
  const priorityB = calculatePriority(b);
  if (priorityA !== priorityB) {
    return priorityOrder[priorityA] - priorityOrder[priorityB];
  }
  return (b.importance_score || 0) - (a.importance_score || 0);
});

// Limit initial display
const [showAll, setShowAll] = useState(false);
const initialItems = 5;
const displayedNews = showAll ? sortedNews : sortedNews.slice(0, initialItems);
```

---

### 2. Create CompactNewsCard Component

**Component**: `CompactNewsCard`

**File**: `frontend/src/components/news/CompactNewsCard.tsx`

**Props**:
```typescript
interface CompactNewsCardProps {
  newsItem: {
    id: string;
    title: string;
    summary?: string;
    type?: 'team' | 'player';
    player_name?: string;
    categories?: string[];
    importance_score?: number;
    publishedAt: string;
    source: string;
    url?: string;
  };
}
```

**Implementation**:
```tsx
export default function CompactNewsCard({ newsItem }: CompactNewsCardProps) {
  const priority = calculatePriority(newsItem);
  const priorityClasses = getPriorityClasses(priority, newsItem.categories);
  
  return (
    <a
      href={newsItem.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`glass rounded-lg p-3 sm:p-4 relative transition-all hover:scale-[1.02] ${priorityClasses}`}
    >
      {/* Badge */}
      {newsItem.type && (
        <NewsTypeBadge 
          type={newsItem.type} 
          teamLogo={newsItem.team_logo}
          playerName={newsItem.player_name}
        />
      )}
      
      {/* Player Name (if player news) */}
      {newsItem.type === 'player' && newsItem.player_name && (
        <PlayerNameDisplay 
          playerName={newsItem.player_name}
          teamName={newsItem.player_team}
        />
      )}
      
      {/* Headline */}
      <h5 className="text-base sm:text-lg font-bold mb-1 line-clamp-2">
        {newsItem.title}
      </h5>
      
      {/* Summary (optional, hidden on mobile) */}
      {newsItem.summary && (
        <p className="text-xs sm:text-sm text-[var(--pl-text-muted)] line-clamp-1 hidden sm:block mb-2">
          {newsItem.summary}
        </p>
      )}
      
      {/* Metadata */}
      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[var(--pl-text-muted)]">
        <span>{newsItem.source}</span>
        <span>•</span>
        <span>{formatTimeAgo(newsItem.publishedAt)}</span>
        {newsItem.categories?.[0] && (
          <>
            <span>•</span>
            <span className="capitalize">{newsItem.categories[0]}</span>
          </>
        )}
      </div>
    </a>
  );
}
```

**Priority Classes**:
```tsx
const getPriorityClasses = (priority: string, categories?: string[]) => {
  const baseClasses = 'min-h-[80px] sm:min-h-[100px]';
  
  if (priority === 'high') {
    if (categories?.includes('injury')) {
      return `${baseClasses} border-l-[3px] border-red-500 min-h-[100px] sm:min-h-[120px]`;
    }
    if (categories?.includes('transfer')) {
      return `${baseClasses} border-l-[3px] border-blue-500 min-h-[100px] sm:min-h-[120px]`;
    }
  }
  
  if (priority === 'medium') {
    return `${baseClasses} border-l border-white/20`;
  }
  
  return `${baseClasses} border-l border-white/5 opacity-90`;
};
```

**Priority Calculation**:
```tsx
const calculatePriority = (item: NewsItem): 'high' | 'medium' | 'low' => {
  const score = item.importance_score || 0;
  const categories = item.categories || [];
  
  if (score >= 8 || categories.includes('injury') || categories.includes('transfer')) {
    return 'high';
  }
  if (score >= 5) {
    return 'medium';
  }
  return 'low';
};
```

---

### 3. Update PersonalizedNewsFeed

**File**: `frontend/src/components/news/PersonalizedNewsFeed.tsx`

**Current State**: Component exists, may not be showing data

**Changes Needed**:
1. Use `CompactNewsCard` instead of `PersonalizedNewsCard`
2. Add priority sorting
3. Limit initial display (5-7 items)
4. Add "Show More" functionality
5. Verify API endpoint works

**Implementation**:
```tsx
// Add state for show more
const [showAll, setShowAll] = useState(false);
const initialItems = 5;

// Sort by priority first, then importance, then date
const sortedNews = useMemo(() => {
  const sorted = [...filteredNews].sort((a, b) => {
    // Priority first
    const priorityA = calculatePriority(a);
    const priorityB = calculatePriority(b);
    if (priorityA !== priorityB) {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[priorityA] - priorityOrder[priorityB];
    }
    
    // Then importance score
    if (sortBy === 'important') {
      return (b.importance_score || 0) - (a.importance_score || 0);
    }
    
    // Then date
    return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
  });
  
  return sorted;
}, [filteredNews, sortBy]);

// Limit display
const displayedNews = showAll ? sortedNews : sortedNews.slice(0, initialItems);

// Render
<div className="space-y-3">
  {displayedNews.map((item) => (
    <CompactNewsCard key={item.id} newsItem={item} />
  ))}
</div>

{/* Show More Button */}
{sortedNews.length > initialItems && (
  <ShowMoreButton
    showAll={showAll}
    remainingCount={sortedNews.length - initialItems}
    onToggle={() => setShowAll(!showAll)}
  />
)}
```

---

### 4. Create ShowMoreButton Component

**Component**: `ShowMoreButton`

**File**: `frontend/src/components/news/ShowMoreButton.tsx`

**Props**:
```typescript
interface ShowMoreButtonProps {
  showAll: boolean;
  remainingCount: number;
  onToggle: () => void;
}
```

**Implementation**:
```tsx
export default function ShowMoreButton({ showAll, remainingCount, onToggle }: ShowMoreButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="w-full py-3 rounded-lg border border-white/10 hover:bg-[var(--pl-card-hover)] transition-all text-sm font-medium"
      aria-expanded={showAll}
    >
      {showAll ? (
        <>
          <span>Show Less</span>
          <span className="ml-2">▲</span>
        </>
      ) : (
        <>
          <span>Show More</span>
          <span className="ml-2">({remainingCount} more)</span>
          <span className="ml-2">▼</span>
        </>
      )}
    </button>
  );
}
```

---

### 5. Debug Personalized News

**Potential Issues**:
1. API endpoint doesn't exist
2. API endpoint returns empty data
3. Component shows empty state
4. Error in API call

**Debugging Steps**:
1. Check if `/api/football/personalized-news` endpoint exists
2. Test endpoint with Postman/curl
3. Check browser console for errors
4. Verify user has favorite team and/or FPL team
5. Check network tab for API calls
6. Verify API returns expected data format

**Backend Endpoint** (if missing):
```python
# backend/app/api/football.py
@router.get("/personalized-news")
async def get_personalized_news(
    current_user: User = Depends(get_current_user)
):
    # Get user's favorite team
    favorite_team_id = current_user.favorite_team_id
    
    # Get user's FPL team
    fpl_team_id = current_user.fpl_team_id
    
    # Fetch team news
    team_news = None
    if favorite_team_id:
        team_news = await news_service.get_team_news_overview(favorite_team_id)
    
    # Fetch player news
    player_news = None
    if fpl_team_id:
        player_news = await news_service.get_player_news(fpl_team_id)
    
    # Combine and return
    combined_news = combine_news(team_news, player_news)
    
    return {
        "favorite_team_news": team_news,
        "fpl_player_news": player_news,
        "combined_news": combined_news,
        "total_count": len(combined_news)
    }
```

---

### 6. Component Structure

**Files to Create**:
```
frontend/src/components/news/
  ├── CompactNewsCard.tsx (new)
  ├── ShowMoreButton.tsx (new)
  └── CollapsibleSection.tsx (new - optional, for overview)
```

**Files to Modify**:
- `TeamNewsOverview.tsx` - Simplify layout
- `PersonalizedNewsFeed.tsx` - Use compact cards, add show more
- `PersonalizedNewsCard.tsx` - Update to compact design (or replace with CompactNewsCard)

---

## Design System Updates

### Compact Card Styles

**Base Styles** (add to component or CSS):
```css
.compact-news-card {
  min-height: 80px;
  padding: 12px;
  border-radius: 8px;
}

@media (min-width: 640px) {
  .compact-news-card {
    min-height: 100px;
    padding: 16px;
  }
}
```

**Priority Borders**:
- High (Injury): `border-l-[3px] border-red-500`
- High (Transfer): `border-l-[3px] border-blue-500`
- Medium: `border-l border-white/20`
- Low: `border-l border-white/5 opacity-90`

---

## Testing Requirements

### Visual Testing
- [ ] Compact cards render correctly (80-100px height)
- [ ] Priority borders visible
- [ ] Headlines readable (2-line clamp works)
- [ ] Summaries hidden on mobile
- [ ] Filter buttons work
- [ ] Show More button works
- [ ] Responsive on all breakpoints

### Functional Testing
- [ ] Only 5-7 items shown initially
- [ ] Show More reveals all items
- [ ] Show Less collapses back
- [ ] Filtering works (all, team, players)
- [ ] Sorting works (recent, important, category)
- [ ] Priority sorting works correctly
- [ ] Empty states display correctly
- [ ] Personalized news displays properly

### Performance Testing
- [ ] News loads < 2s
- [ ] Smooth expand/collapse animation
- [ ] No lag when filtering/sorting
- [ ] No layout shift during load

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces priorities
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA

---

## Migration Strategy

### Step 1: Create New Components (Non-Breaking)
- Create `CompactNewsCard` component
- Create `ShowMoreButton` component
- Test new components in isolation

### Step 2: Update TeamNewsOverview (Feature Flag)
- Add feature flag for simplified layout
- Show simplified layout when flag enabled
- Keep old layout as fallback

### Step 3: Update PersonalizedNewsFeed
- Replace `PersonalizedNewsCard` with `CompactNewsCard`
- Add priority sorting
- Add "Show More" functionality
- Test thoroughly

### Step 4: Remove Old Code (After Testing)
- Remove old section-based layout
- Remove unused components
- Clean up code

---

## Success Criteria

Implementation is complete when:
- ✅ TeamNewsOverview shows simplified layout (single list)
- ✅ Compact cards used (80-100px height)
- ✅ Only 5-7 items shown initially
- ✅ Show More button works
- ✅ Priority indicators visible (colored borders)
- ✅ PersonalizedNewsFeed displays properly
- ✅ All components responsive (320px - 1920px)
- ✅ Performance targets met (< 2s load)
- ✅ WCAG AA compliance maintained
- ✅ All tests passing

---

## Questions or Issues?

If you encounter any issues or need clarification:

1. **Design Questions**: Refer to `docs/news-display-design-spec.md`
2. **Requirements Questions**: Ask Product and Project Agent
3. **Technical Questions**: Use your best judgment, document decisions
4. **API Issues**: Check backend endpoint, verify data format

---

## Next Steps

1. **Review Design Spec**: Read `docs/news-display-design-spec.md` thoroughly
2. **Plan Implementation**: Break down into tasks, estimate effort
3. **Start Implementation**: Begin with CompactNewsCard component
4. **Test Continuously**: Test as you build
5. **Debug Personalized News**: Verify API endpoint works
6. **Hand off to Tester**: Create test plan when complete

---

**Good luck with implementation! 🚀**

**Remember**: Focus on making news scannable, curated, and not overwhelming. Less is more!

---

**Handoff Complete!**


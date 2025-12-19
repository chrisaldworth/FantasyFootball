# News Display Review & Fix - Design Specification

**Designer**: UI Designer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P1 (High)

---

## Overview

This document provides complete design specifications for fixing and simplifying the news display system. The goal is to make news **scannable, curated, and not overwhelming** by:

1. **Simplifying Team News**: Remove sections, show compact cards, limit items
2. **Ensuring Personalized News Works**: Fix any issues preventing display
3. **Creating Compact Cards**: 80-100px height, minimal text, clear hierarchy
4. **Adding Priority Indicators**: Visual cues for important news

---

## Design Principles

1. **Scannability**: Headlines are the focus, summaries optional
2. **Curation**: Show only 5-7 most important items initially
3. **Progressive Disclosure**: "Show More" for additional items
4. **Visual Hierarchy**: Important news = larger, colored borders
5. **Mobile-First**: Touch-friendly, readable, not overwhelming

---

## 1. Compact News Card Design

### Screen: News Card - Compact (80-100px Height)

**Purpose**: Scannable news card that shows essential information without overwhelming

**Layout (Mobile - 80px height)**:
```
┌─────────────────────────────────────────┐
│  [Badge]                       2h ago │
│  Headline text here (2 lines max)     │
│  Source • Category                     │
└─────────────────────────────────────────┘
```

**Layout (Desktop - 100px height)**:
```
┌─────────────────────────────────────────┐
│  [Badge]                       2h ago │
│  Headline text here (2 lines max)     │
│  Summary text (1 line, optional)      │
│  Source • Category                     │
└─────────────────────────────────────────┘
```

**Key Components**:
- News type badge (top-right)
- Headline (2-line clamp, bold)
- Summary (1 line, optional, hidden on mobile)
- Metadata (source, time, category - minimal)
- Priority border (left side, colored)

**Visual Design**:
- Height: `min-h-[80px]` (mobile), `min-h-[100px]` (desktop)
- Padding: `p-3` (mobile), `p-4` (desktop)
- Border Radius: `rounded-lg` (8px)
- Background: Glass morphism (existing)
- Border: `border-l-3` for priority, `border border-white/10` for standard

**Priority Indicators**:
- **High Priority** (Injuries, Transfers):
  - Left border: 3px solid red (injuries) or blue (transfers)
  - Card height: 100px (mobile), 120px (desktop)
  - Headline: Bold, larger (18px)
  
- **Medium Priority** (Match, Manager):
  - Left border: 1px solid (subtle)
  - Card height: 80px (mobile), 100px (desktop)
  - Headline: Standard (16px)
  
- **Low Priority** (General):
  - No left border or very subtle
  - Card height: 80px (mobile), 100px (desktop)
  - Headline: Standard, muted

---

## 2. Component Specifications

### 2.1 Compact News Card

**Component**: `CompactNewsCard`

| Property | Value |
|----------|-------|
| **Variants** | High Priority, Medium Priority, Low Priority |
| **States** | Default, Hover, Loading |
| **Height** | 80px (mobile), 100px (desktop) |
| **Padding** | 12px (mobile), 16px (desktop) |
| **Layout** | Badge (top-right), Headline (main), Metadata (bottom) |

**Content Structure**:
1. Badge (absolute top-right)
2. Headline (2-line clamp, bold)
3. Summary (1 line, optional, hidden on mobile)
4. Metadata (source, time, category - single line)

**Styling**:
```tsx
// High Priority (Injury)
className="glass rounded-lg p-3 sm:p-4 min-h-[100px] sm:min-h-[120px] border-l-[3px] border-red-500 relative"

// Medium Priority
className="glass rounded-lg p-3 sm:p-4 min-h-[80px] sm:min-h-[100px] border border-white/10 relative"

// Low Priority
className="glass rounded-lg p-3 sm:p-4 min-h-[80px] sm:min-h-[100px] border border-white/5 relative opacity-90"
```

**Typography**:
- Headline: `text-base sm:text-lg font-bold line-clamp-2`
- Summary: `text-xs sm:text-sm text-[var(--pl-text-muted)] line-clamp-1 hidden sm:block`
- Metadata: `text-[10px] text-[var(--pl-text-muted)]`

---

### 2.2 Priority Border System

**Component**: `PriorityBorder`

| Priority | Category | Border Color | Border Width | Card Height |
|----------|----------|--------------|--------------|-------------|
| **High** | Injury | Red (#e90052) | 3px | 100-120px |
| **High** | Transfer | Blue (#04f5ff) | 3px | 100-120px |
| **Medium** | Match | Green (#00ff87) | 1px | 80-100px |
| **Medium** | Manager | Purple | 1px | 80-100px |
| **Low** | General | None/Muted | 0px | 80px |

**Implementation**:
```tsx
const getPriorityBorder = (categories: string[]) => {
  if (categories.includes('injury')) {
    return 'border-l-[3px] border-red-500';
  }
  if (categories.includes('transfer')) {
    return 'border-l-[3px] border-blue-500';
  }
  if (categories.includes('match')) {
    return 'border-l border-green-500';
  }
  return 'border-l border-white/10';
};
```

---

## 3. Simplified News Layout

### Screen: News Feed - Simplified (Single List)

**Purpose**: One unified list, no sections, easy to scan

**Layout (Before - Current)**:
```
┌─────────────────────────────────────────┐
│  Overview Summary (Large Box)           │
├─────────────────────────────────────────┤
│  ⭐ Today's Highlights                  │
│  [Large Card 1]                         │
│  [Large Card 2]                         │
│  [Large Card 3]                         │
├─────────────────────────────────────────┤
│  🔥 Top Stories                         │
│  [Medium Card 1]                        │
│  [Medium Card 2]                        │
│  [Medium Card 3]                        │
├─────────────────────────────────────────┤
│  Categories: Transfer(3) Injury(2)...   │
└─────────────────────────────────────────┘
```

**Layout (After - Simplified)**:
```
┌─────────────────────────────────────────┐
│  [All News] [Team] [Players]  [Sort▼] │
├─────────────────────────────────────────┤
│  [Compact Card 1 - High Priority]     │
│  [Compact Card 2 - High Priority]      │
│  [Compact Card 3 - Medium Priority]    │
│  [Compact Card 4 - Medium Priority]    │
│  [Compact Card 5 - Low Priority]       │
│                                         │
│  [Show More] Button                     │
└─────────────────────────────────────────┘
```

**Key Changes**:
- ❌ Remove overview summary box (or make it collapsible)
- ❌ Remove "Highlights" and "Top Stories" section headers
- ❌ Remove category summary (or make it collapsible)
- ✅ Single unified list
- ✅ Compact cards (80-100px)
- ✅ Show 5-7 items initially
- ✅ "Show More" button

---

### 3.1 Show More/Less Functionality

**Component**: `ShowMoreButton`

| Property | Value |
|----------|-------|
| **Purpose** | Progressive disclosure for additional news |
| **Initial Display** | 5-7 items |
| **Expanded Display** | All items (max 20) |
| **Animation** | Smooth expand/collapse |

**Design**:
- Position: Center, below news list
- Style: Outlined button
- Text: "Show More" / "Show Less"
- Icon: Chevron down/up
- Size: Minimum 44x44px touch target

**Implementation**:
```tsx
const [showAll, setShowAll] = useState(false);
const initialItems = 5;
const displayedNews = showAll ? sortedNews : sortedNews.slice(0, initialItems);

// Button
<button
  onClick={() => setShowAll(!showAll)}
  className="w-full py-3 rounded-lg border border-white/10 hover:bg-[var(--pl-card-hover)] transition-all"
>
  {showAll ? 'Show Less' : `Show More (${sortedNews.length - initialItems} more)`}
</button>
```

---

## 4. Team News Overview Simplification

### Current Structure (Too Much)

**Sections**:
1. Overview Summary (large box with text)
2. Highlights Section (3 items, large cards)
3. Top Stories Section (3 items, medium cards)
4. Category Summary (all categories with counts)

**Problems**:
- Too many sections
- Too much text
- No clear hierarchy
- Overwhelming

### New Structure (Simplified)

**Single Unified List**:
1. Filter/Sort Controls (top)
2. News List (5-7 items initially)
3. Show More Button (if more items)
4. Overview Summary (optional, collapsible)
5. Category Summary (optional, collapsible, hidden by default)

**Component**: `SimplifiedTeamNews`

**Props**:
```typescript
interface SimplifiedTeamNewsProps {
  teamId: number;
  teamName: string;
  showOverview?: boolean; // Optional, default: false
  showCategories?: boolean; // Optional, default: false
  initialItems?: number; // Default: 5
}
```

**Layout**:
```tsx
<div className="space-y-4">
  {/* Optional: Collapsible Overview */}
  {showOverview && (
    <CollapsibleSection title="News Overview">
      <p className="text-sm text-[var(--pl-text-muted)]">
        {overview.overview}
      </p>
    </CollapsibleSection>
  )}

  {/* News List */}
  <div className="space-y-3">
    {displayedNews.map((item) => (
      <CompactNewsCard key={item.id} newsItem={item} />
    ))}
  </div>

  {/* Show More */}
  {sortedNews.length > initialItems && (
    <ShowMoreButton ... />
  )}

  {/* Optional: Collapsible Categories */}
  {showCategories && (
    <CollapsibleSection title="Categories">
      {/* Category summary */}
    </CollapsibleSection>
  )}
</div>
```

---

## 5. Personalized News Display

### Current State

**Component**: `PersonalizedNewsFeed` exists and is rendered

**Potential Issues**:
- API endpoint may not exist or return empty data
- Component may show empty state
- Need to verify backend endpoint works

### Design Requirements

**Layout**:
- Same as simplified team news
- Single unified list
- Compact cards
- Filter buttons (All, Team, Players)
- Sort dropdown
- Show 5-7 items initially

**Visual Distinction**:
- Team news: Team badge (team colors)
- Player news: Player badge (FPL green) + player name

**Component**: `PersonalizedNewsFeed` (already exists, may need fixes)

**Enhancements Needed**:
1. Use compact card design (80-100px)
2. Add priority indicators
3. Limit initial display (5-7 items)
4. Add "Show More" functionality
5. Ensure proper error handling

---

## 6. Responsive Design

### Mobile (320px - 767px)

**Layout**:
- Single column, full-width cards
- Cards: 80px height minimum
- Summaries: Hidden
- Filter: Horizontal scrollable row
- Spacing: 12px between cards

**Typography**:
- Headline: 16px, bold, 2-line clamp
- Metadata: 10px, muted
- No summary text

**Touch Targets**:
- Cards: Minimum 80px height
- Filter buttons: 44x44px
- Show More button: 44px height

---

### Tablet (768px - 1023px)

**Layout**:
- Single column
- Cards: 100px height
- Summaries: 1 line (optional)
- Filter: Full row, no scroll
- Spacing: 16px between cards

**Typography**:
- Headline: 18px, bold, 2-line clamp
- Summary: 12px, 1-line clamp (optional)
- Metadata: 10px

---

### Desktop (1024px+)

**Layout**:
- Single column (recommended) or 2-column grid (optional)
- Cards: 100-120px height
- Summaries: 1-2 lines
- Filter: Full row
- Spacing: 20px between cards

**Typography**:
- Headline: 18px, bold, 2-line clamp
- Summary: 14px, 2-line clamp
- Metadata: 12px

---

## 7. Design System Updates

### 7.1 Compact Card Styles

**Base Card**:
```css
.compact-news-card {
  min-height: 80px; /* mobile */
  padding: 12px; /* mobile */
  border-radius: 8px;
  background: glass morphism;
  border: 1px solid rgba(255, 255, 255, 0.1);
  position: relative;
}

@media (min-width: 640px) {
  .compact-news-card {
    min-height: 100px;
    padding: 16px;
  }
}
```

**Priority Borders**:
```css
.priority-high-injury {
  border-left: 3px solid #e90052;
  min-height: 100px; /* mobile */
}

.priority-high-transfer {
  border-left: 3px solid #04f5ff;
  min-height: 100px; /* mobile */
}

.priority-medium {
  border-left: 1px solid rgba(255, 255, 255, 0.2);
  min-height: 80px; /* mobile */
}

.priority-low {
  border-left: 1px solid rgba(255, 255, 255, 0.05);
  opacity: 0.9;
  min-height: 80px; /* mobile */
}
```

### 7.2 Typography

**Headlines**:
- Mobile: 16px, bold, 2-line clamp
- Desktop: 18px, bold, 2-line clamp
- Color: Primary text color
- Line Height: 1.3

**Summaries**:
- Mobile: Hidden
- Desktop: 12-14px, 1-2 lines, muted color
- Optional: Can be hidden entirely

**Metadata**:
- Size: 10px (mobile), 12px (desktop)
- Color: Muted
- Format: "Source • Time ago • Category"

---

## 8. Component Structure

### Files to Create/Modify

**New Components**:
```
frontend/src/components/news/
  ├── CompactNewsCard.tsx (new - simplified card)
  ├── ShowMoreButton.tsx (new)
  └── CollapsibleSection.tsx (new - for overview/categories)
```

**Modified Components**:
- `TeamNewsOverview.tsx` - Simplify to use compact cards, single list
- `PersonalizedNewsCard.tsx` - Update to use compact design
- `PersonalizedNewsFeed.tsx` - Add "Show More", limit initial items

---

## 9. Priority System

### Priority Calculation

**High Priority** (Always show first):
- Injuries (importance_score >= 8)
- Transfers (importance_score >= 8)
- Visual: 3px colored border, larger card

**Medium Priority** (Show next):
- Match results (importance_score 5-7)
- Manager news (importance_score 5-7)
- Visual: 1px border, standard card

**Low Priority** (Show last, can hide):
- General news (importance_score < 5)
- Visual: Subtle border, smaller/muted card

**Sorting Logic**:
1. Sort by priority (high → medium → low)
2. Within priority, sort by importance_score (descending)
3. Within same score, sort by date (recent first)

---

## 10. Empty States

### No News Available

**Component**: `EmptyNews`

**Design**:
- Icon: 📰 (64x64px)
- Message: "No news available at the moment"
- No CTA (just informational)
- Centered, friendly

### No Favorite Team

**Component**: `EmptyTeamNews`

**Design**:
- Icon: 🏠 (64x64px)
- Message: "Select a favorite team to see team news"
- CTA: "Select Team" button

### No FPL Team

**Component**: `EmptyPlayerNews`

**Design**:
- Icon: ⚽ (64x64px)
- Message: "Link your FPL team to see player news"
- CTA: "Link FPL Team" button

---

## 11. Loading States

### Compact Card Skeleton

**Component**: `CompactNewsCardSkeleton`

**Design**:
- Match compact card layout (80-100px height)
- Animated shimmer effect
- Placeholder for badge, headline, metadata
- Show 3-5 skeletons while loading

**Styling**:
```tsx
<div className="glass rounded-lg p-3 sm:p-4 min-h-[80px] sm:min-h-[100px] animate-pulse">
  <div className="h-4 bg-[var(--pl-dark)]/50 rounded mb-2 w-3/4"></div>
  <div className="h-3 bg-[var(--pl-dark)]/50 rounded w-1/2"></div>
</div>
```

---

## 12. Accessibility Requirements

### WCAG AA Compliance

**Color Contrast**:
- Headlines: 4.5:1 minimum
- Metadata: 4.5:1 minimum
- Priority borders: 3:1 minimum

**Keyboard Navigation**:
- All cards clickable via keyboard
- Tab order: Filters → Cards → Show More
- Focus indicators: Clear, visible

**Screen Reader**:
- ARIA labels: "News item: [headline]"
- Priority: "High priority news" / "Medium priority news"
- News type: "Team news" / "Player news: [player name]"

**Touch Targets**:
- Cards: Minimum 80px height
- Buttons: 44x44px minimum
- Generous spacing between interactive elements

---

## 13. Developer Handoff Notes

### Key Implementation Points

1. **Simplify TeamNewsOverview**:
   - Remove overview summary (or make collapsible)
   - Remove section headers (Highlights, Top Stories)
   - Combine all news into single list
   - Use compact cards
   - Limit to 5-7 items initially

2. **Update PersonalizedNewsFeed**:
   - Use compact card design
   - Add priority indicators
   - Limit initial display
   - Add "Show More" functionality
   - Verify API endpoint works

3. **Create CompactNewsCard**:
   - 80-100px height
   - 2-line headline clamp
   - Optional summary (hidden on mobile)
   - Priority border system
   - Minimal metadata

4. **Priority System**:
   - Sort by priority first
   - Then by importance_score
   - Then by date
   - Visual indicators (colored borders)

### Data Requirements

**News Item** (Enhanced):
```typescript
interface CompactNewsItem {
  id: string;
  title: string;
  summary?: string; // Optional
  type: 'team' | 'player';
  player_name?: string;
  categories: string[];
  importance_score: number;
  publishedAt: string;
  source: string;
  url: string;
  priority: 'high' | 'medium' | 'low'; // Calculated
}
```

**Priority Calculation**:
```typescript
const calculatePriority = (item: NewsItem): 'high' | 'medium' | 'low' => {
  if (item.importance_score >= 8 || 
      item.categories.includes('injury') || 
      item.categories.includes('transfer')) {
    return 'high';
  }
  if (item.importance_score >= 5) {
    return 'medium';
  }
  return 'low';
};
```

---

## 14. Testing Checklist

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

## 15. Success Criteria

Design phase is complete when:
- ✅ Compact news card design finalized (80-100px)
- ✅ Simplified layout design finalized (single list)
- ✅ Priority indicator system designed
- ✅ Show More functionality designed
- ✅ Component specifications complete
- ✅ Accessibility requirements met
- ✅ Developer handoff document created

---

**Design Specification Complete! 🎨**

This document provides complete design specifications for simplifying and fixing the news display system. All components are designed to be scannable, curated, and not overwhelming.

**Ready for Developer Handoff**


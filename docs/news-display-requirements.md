# News Display Requirements - Review & Fix
**Date**: 2025-12-19  
**Priority**: P1 (High)  
**Status**: Requirements Phase

---

## Executive Summary

**Current Issues**:
1. **Personalized news isn't showing anything** - The personalized news feature (favorite team + FPL player news) was specified in requirements but not implemented
2. **Team news shows too much** - The team news section is overwhelming, showing too many items and too much detail

**Solution**: Review and redesign the news display system to be:
- **Personalized**: Show relevant news (favorite team + FPL players)
- **Curated**: Show only the most important/recent news
- **Scannable**: Easy to read, not overwhelming
- **Actionable**: Users can quickly see what's important

---

## Problem Analysis

### Issue 1: Personalized News Not Showing

**Current State**:
- `PersonalizedNewsFeed` component exists (`frontend/src/components/news/PersonalizedNewsFeed.tsx`)
- Component is imported in `FavoriteTeamSection` but **NOT RENDERED**
- `getPersonalizedNews()` API method exists in frontend
- Backend endpoint may not exist or may be returning empty data
- Component likely shows empty state or error

**Root Cause**:
- Personalized news component was built but never integrated/displayed
- Component exists but is not used in the UI
- Backend endpoint may be missing or returning no data
- User sees nothing because component isn't rendered

---

### Issue 2: Team News Shows Too Much

**Current State**:
- `TeamNewsOverview` shows:
  - Overview summary box
  - Highlights section (up to 3 items, large cards)
  - Top Stories section (up to 3 items, medium cards)
  - Category summary (all categories with counts)
- `TeamNews` shows:
  - List of all news items (no limit visible)
  - Each item is a full card with title, summary, source, time

**Problems**:
- Too many sections competing for attention
- Too much text (summaries, categories, metadata)
- No clear hierarchy of what's most important
- Overwhelming on mobile
- Users can't quickly scan what's important

**User Feedback**: "Team news shows too much"

---

## Goals & Objectives

### Primary Goals
1. **Personalized News**: Show news relevant to user (favorite team + FPL players)
2. **Curated Content**: Show only the most important/recent news (5-10 items max)
3. **Clear Hierarchy**: Most important news first, easy to scan
4. **Scannable Design**: Users can quickly see what's important without reading everything

### Success Metrics
- **Relevance**: 100% of news is relevant to user
- **Engagement**: Users click on news items (not overwhelmed)
- **Satisfaction**: News section is useful, not cluttered
- **Time to Value**: Users can see important news in < 5 seconds

---

## User Stories

### Story 1: Personalized News Feed
**As a** user  
**I want** to see news about my favorite team AND my FPL players  
**So that** I get all relevant news in one place

**Acceptance Criteria**:
- News feed shows favorite team news (if favorite team selected)
- News feed shows FPL player news (if FPL team linked)
- News is clearly labeled (Team vs Player)
- News is sorted by importance and recency
- Maximum 10 items shown initially

### Story 2: Curated Team News
**As a** user  
**I want** to see only the most important team news  
**So that** I'm not overwhelmed with information

**Acceptance Criteria**:
- Show maximum 5-7 most important news items
- Prioritize: Injuries > Transfers > Match results > General news
- Show only recent news (last 7 days)
- Hide less important categories
- "Show More" option to see all news

### Story 3: Scannable News Display
**As a** user  
**I want** to quickly scan news headlines  
**So that** I can find what's important without reading everything

**Acceptance Criteria**:
- Headlines are prominent and readable
- Summaries are short (1-2 lines max)
- Visual hierarchy is clear (important = larger)
- Category badges are visible but not overwhelming
- Time stamps are clear but not prominent

---

## Functional Requirements

### FR1: Personalized News Implementation
**Priority**: P1 (High)

**Description**: Implement the personalized news feature that combines favorite team and FPL player news

**Requirements**:
1. **Backend Endpoint**:
   - `GET /api/football/personalized-news` (requires auth)
   - Returns combined news (favorite team + FPL players)
   - Sorted by importance and recency
   - Limited to 20 items total

2. **Frontend Component**:
   - New `PersonalizedNews` component
   - Shows both types of news in one feed
   - Clear visual distinction (badges, colors)
   - Filter options (All, Team Only, Players Only)

3. **News Sources**:
   - Favorite team news (from existing endpoint)
   - FPL player news (from new player news endpoint)
   - Combined and deduplicated

**Technical Notes**:
- Use existing `news_service.py` (extend for player news)
- Create new endpoint in `backend/app/api/football.py`
- Create new component `frontend/src/components/PersonalizedNews.tsx`
- Replace or enhance `TeamNewsOverview` usage

---

### FR2: Curated Team News Display
**Priority**: P1 (High)

**Description**: Reduce and curate team news to show only the most important items

**Requirements**:
1. **Limit News Items**:
   - Show maximum 5-7 items initially
   - Prioritize by importance score
   - Show only recent news (last 7 days)

2. **Simplified Layout**:
   - Remove overview summary box (or make it smaller)
   - Remove category summary (or make it collapsible)
   - Combine highlights and top stories into one list
   - Use compact card design

3. **Progressive Disclosure**:
   - Show 5-7 items initially
   - "Show More" button to see all news
   - "Show Less" button to collapse

4. **Priority Order**:
   - Injuries (highest priority)
   - Transfers
   - Match results
   - Manager news
   - Contract news
   - General news (lowest priority)

**Current Issues to Fix**:
- Too many sections (overview, highlights, top stories, categories)
- Too much text (long summaries, category counts)
- No limit on items shown
- Overwhelming on mobile

---

### FR3: Scannable News Cards
**Priority**: P1 (High)

**Description**: Redesign news cards to be scannable and not overwhelming

**Requirements**:
1. **Compact Card Design**:
   - Headline: 16-18px, bold, 2-line clamp
   - Summary: 12-14px, 1-2 lines max, muted color
   - Metadata: 10-12px, minimal (source, time ago)
   - Category badge: Small, subtle

2. **Visual Hierarchy**:
   - Most important news: Slightly larger, colored border
   - Regular news: Standard size, subtle border
   - Less important: Smaller, muted

3. **Information Density**:
   - Remove unnecessary information
   - Hide category summary by default
   - Show only essential metadata
   - Use icons instead of text where possible

4. **Mobile Optimization**:
   - Cards stack vertically
   - Touch-friendly (minimum 44px height)
   - Readable text sizes
   - No horizontal scroll

---

### FR4: News Filtering & Sorting
**Priority**: P2 (Medium)

**Description**: Allow users to filter and sort news

**Requirements**:
1. **Filter Options**:
   - "All News" (default)
   - "Favorite Team Only"
   - "FPL Players Only"
   - "Injuries Only"
   - "Transfers Only"

2. **Sort Options**:
   - "Most Recent" (default)
   - "Most Important"
   - "By Category"

3. **UI**:
   - Filter buttons: Horizontal row, scrollable on mobile
   - Sort dropdown: Right-aligned
   - Clear active states

---

## Non-Functional Requirements

### NFR1: Performance
- News loading: < 2 seconds
- News rendering: < 500ms
- Smooth scrolling
- No lag when filtering/sorting

### NFR2: Content Quality
- Only show relevant news (100% relevance)
- Remove duplicates
- Prioritize recent news (last 7 days)
- Limit total items (20 max, 5-7 shown initially)

### NFR3: User Experience
- Scannable in < 5 seconds
- Not overwhelming
- Clear visual hierarchy
- Mobile-friendly

---

## Design Requirements

### News Card Design (Compact)
- **Height**: 80-100px (mobile), 100-120px (desktop)
- **Padding**: 12px (mobile), 16px (desktop)
- **Border Radius**: 8px
- **Background**: Glass morphism (existing)
- **Border**: 1px solid, subtle

**Content**:
- **Headline**: 16px bold, 2-line clamp, primary color
- **Summary**: 12px, 1-2 lines, muted color (optional, can be hidden)
- **Metadata**: 10px, muted (source, time ago)
- **Category Badge**: Small, 8-10px, subtle

### Layout Design
- **Single Column**: Vertical stack
- **Spacing**: 12px between cards
- **No Sections**: Remove "Highlights", "Top Stories" sections
- **Single List**: One unified list, sorted by priority

### Priority Indicators
- **High Priority** (Injuries, Transfers):
  - Colored left border (red for injuries, blue for transfers)
  - Slightly larger card
  - Bold headline
  
- **Medium Priority** (Match results, Manager):
  - Standard card
  - Normal border
  
- **Low Priority** (General):
  - Smaller card
  - Muted colors

---

## Implementation Plan

### Phase 1: Fix Team News (Show Less) - P1
**Duration**: 2 days

1. **Simplify `TeamNewsOverview` Component**:
   - Remove overview summary box (or make it smaller/collapsible)
   - Remove category summary (or make it collapsible)
   - Combine highlights and top stories into one list
   - Limit to 5-7 items initially
   - Add "Show More" button

2. **Redesign News Cards**:
   - Compact design (80-100px height)
   - Shorter summaries (1-2 lines max)
   - Minimal metadata
   - Priority indicators

3. **Test & Iterate**:
   - Test on mobile
   - Get user feedback
   - Adjust based on feedback

---

### Phase 2: Fix Personalized News (Show It) - P1
**Duration**: 2 days

1. **Backend** (if needed):
   - Verify `/api/football/personalized-news` endpoint exists
   - If missing, create endpoint
   - Ensure it returns combined news (favorite team + FPL players)
   - Test endpoint returns data

2. **Frontend**:
   - **Render `PersonalizedNewsFeed` component** in `FavoriteTeamSection`
   - Replace or supplement `TeamNews` component
   - Verify API call works
   - Fix any errors preventing display
   - Test with various user configurations

3. **Debug**:
   - Check why component isn't showing
   - Verify API endpoint returns data
   - Check console for errors
   - Test empty states

4. **Test & Iterate**:
   - Test with favorite team only
   - Test with FPL team only
   - Test with both
   - Test with neither
   - Get user feedback

---

### Phase 3: Enhancements - P2
**Duration**: 2 days

1. **Filtering & Sorting**:
   - Add filter buttons
   - Add sort dropdown
   - Test interactions

2. **Progressive Disclosure**:
   - "Show More" functionality
   - Smooth expand/collapse
   - Pagination (if needed)

---

## Acceptance Criteria

### Team News Fix
- [ ] Maximum 5-7 items shown initially
- [ ] Overview summary is smaller/collapsible
- [ ] Category summary is hidden/collapsible
- [ ] News cards are compact (80-100px height)
- [ ] Summaries are short (1-2 lines max)
- [ ] "Show More" button works
- [ ] Mobile-friendly
- [ ] Not overwhelming

### Personalized News
- [ ] Backend endpoint returns combined news
- [ ] Frontend component displays both types
- [ ] News is clearly labeled (Team vs Player)
- [ ] News is sorted by priority
- [ ] Filter options work
- [ ] Performance is acceptable (< 2s)

### Overall
- [ ] News is relevant to user
- [ ] News is scannable (< 5 seconds to understand)
- [ ] News is not overwhelming
- [ ] Mobile experience is good
- [ ] User satisfaction improved

---

## Risks & Mitigation

### Risk 1: Too Little News
**Probability**: Medium  
**Impact**: Medium  
**Mitigation**:
- Start with 5-7 items, allow "Show More"
- Monitor user feedback
- Adjust limit based on usage

### Risk 2: Missing Important News
**Probability**: Low  
**Impact**: High  
**Mitigation**:
- Prioritize by importance score
- Always show injuries and transfers
- Test with real news data

### Risk 3: Performance Issues
**Probability**: Low  
**Impact**: Medium  
**Mitigation**:
- Limit news items (20 max)
- Cache results
- Optimize queries

---

## Next Steps

1. ✅ **Requirements Document Created** - This document
2. ⏳ **Hand off to UI Designer Agent** - Create design specifications for curated news display
3. ⏳ **Hand off to Developer Agent** - Implement fixes and personalized news
4. ⏳ **Hand off to Tester Agent** - Test news display improvements

---

**Document Status**: Ready for Review  
**Priority**: P1 (High)  
**Next Action**: Hand off to UI Designer Agent for design specifications


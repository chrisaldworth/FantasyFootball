# News Display Review & Fix - Handoff to UI Designer Agent

**From**: Product and Project Agent  
**To**: UI Designer Agent  
**Date**: 2025-12-19  
**Priority**: P1 (High)  
**Status**: 🚀 **READY - START DESIGN WORK NOW**

---

## 🎯 Your Mission

The news display system needs a complete review and redesign. Two critical issues:
1. **Personalized news isn't showing** - Component exists but not rendered/working
2. **Team news shows too much** - Overwhelming, too many sections, too much text

Your job is to create beautiful, scannable design specifications that make news:
- **Personalized**: Show relevant news (favorite team + FPL players)
- **Curated**: Show only the most important/recent news (5-7 items max)
- **Scannable**: Easy to read, clear hierarchy, not overwhelming
- **Actionable**: Users can quickly see what's important

**When you activate, you will automatically detect this document (via glob pattern) and start work immediately.**

---

## Context

### Current Issues

**Issue 1: Personalized News Not Showing**
- `PersonalizedNewsFeed` component exists but is **not rendered** in the UI
- Component is imported in `FavoriteTeamSection` but never displayed
- Backend endpoint may exist but needs verification
- User sees nothing because component isn't shown

**Issue 2: Team News Shows Too Much**
- `TeamNewsOverview` shows:
  - Large overview summary box
  - Highlights section (3 items, large cards)
  - Top Stories section (3 items, medium cards)
  - Category summary (all categories with counts)
- Too many sections competing for attention
- Too much text (long summaries, metadata)
- Overwhelming on mobile
- Users can't quickly scan what's important

---

## Reference Documents

1. **Requirements Document**: `docs/news-display-requirements.md`
   - Complete problem analysis
   - Functional requirements
   - Design requirements
   - Implementation plan

2. **Existing Components**:
   - `frontend/src/components/TeamNewsOverview.tsx` (shows too much)
   - `frontend/src/components/news/PersonalizedNewsFeed.tsx` (exists but not rendered)
   - `frontend/src/components/TeamNews.tsx` (basic list)

---

## Design Specifications Needed

### 1. Curated News Card Design (Compact)

**Current Problem**: News cards are too large, show too much text

**Design Requirements**:
- **Height**: 80-100px (mobile), 100-120px (desktop)
- **Padding**: 12px (mobile), 16px (desktop)
- **Border Radius**: 8px
- **Background**: Glass morphism (existing style)

**Content Layout**:
- **Headline**: 
  - 16px bold (mobile), 18px (desktop)
  - 2-line clamp maximum
  - Primary text color
  - Most prominent element
  
- **Summary**: 
  - 12px (mobile), 14px (desktop)
  - 1-2 lines maximum (or hide completely)
  - Muted color
  - Optional (can be hidden for compact view)

- **Metadata**: 
  - 10px, muted color
  - Source + time ago only
  - Minimal, unobtrusive

- **Category Badge**: 
  - Small, 8-10px
  - Subtle, not prominent
  - Optional (can be hidden)

**Priority Indicators**:
- **High Priority** (Injuries, Transfers):
  - Colored left border (3px, red for injuries, blue for transfers)
  - Slightly larger card (10px taller)
  - Bold headline
  
- **Medium Priority** (Match results, Manager):
  - Standard card size
  - Normal border (1px, subtle)
  
- **Low Priority** (General):
  - Standard or slightly smaller
  - Muted colors

---

### 2. Simplified News Layout

**Current Problem**: Too many sections (overview, highlights, top stories, categories)

**Design Requirements**:
- **Single Unified List**: 
  - Remove separate "Highlights" and "Top Stories" sections
  - One continuous list, sorted by priority
  - No section headers (or minimal)

- **Overview Summary**:
  - Remove large summary box OR
  - Make it smaller/collapsible
  - Optional, not prominent

- **Category Summary**:
  - Hide by default OR
  - Make it collapsible
  - Show only on "Show More" expansion

- **Progressive Disclosure**:
  - Show 5-7 items initially
  - "Show More" button at bottom
  - "Show Less" button when expanded
  - Smooth expand/collapse animation

---

### 3. Personalized News Display

**Current Problem**: Component exists but not shown

**Design Requirements**:
- **Combined Feed**:
  - Show both favorite team news and FPL player news
  - Single unified list
  - Clear visual distinction between types

- **News Type Badges**:
  - **Team News**: Team logo/icon + "Team" label
  - **Player News**: Player icon + "Player" label + player name
  - Badge size: 20x20px icon + label
  - Position: Top-right corner of card
  - Color coding: Team colors vs FPL green/cyan

- **Player Name Display**:
  - For player news: Show player name prominently
  - Format: "Player Name" or "Player Name (Team)"
  - Position: Below badge or in title area
  - Typography: 14px bold, distinct color

- **Filter Options**:
  - "All News" (default)
  - "Favorite Team Only"
  - "FPL Players Only"
  - Filter buttons: Horizontal row, scrollable on mobile
  - Active state: Team color background
  - Inactive state: Transparent, muted text

---

### 4. Mobile Optimization

**Current Problem**: Overwhelming on mobile

**Design Requirements**:
- **Layout**:
  - Single column, vertical stack
  - Cards full width
  - 12px spacing between cards

- **Touch Targets**:
  - Cards minimum 80px height
  - "Show More" button: 44x44px minimum
  - Filter buttons: 44x44px minimum

- **Typography**:
  - Headlines: 16px (readable without zoom)
  - Summaries: 12px (optional, can hide)
  - Metadata: 10px (minimal)

- **Information Density**:
  - Less text on mobile
  - Hide summaries on small screens
  - Show only essential info

---

### 5. Visual Hierarchy

**Current Problem**: Everything feels equal weight

**Design Requirements**:
- **Most Important** (Injuries, Transfers):
  - Largest cards
  - Colored borders
  - Bold headlines
  - Top of list

- **Secondary** (Match results, Manager):
  - Standard cards
  - Normal styling
  - Middle of list

- **Tertiary** (General news):
  - Smaller cards
  - Muted colors
  - Bottom of list

- **Progressive Disclosure**:
  - Most important always visible
  - Less important hidden by default
  - "Show More" reveals all

---

## Design Principles to Follow

### 1. Scannability
- Headlines are the focus
- Summaries are optional/short
- Metadata is minimal
- Visual hierarchy is clear

### 2. Curation
- Show only the most important news
- Limit initial display (5-7 items)
- Prioritize by importance score
- Hide less important content

### 3. Personalization
- Clear distinction between news types
- Player names visible for player news
- Team branding for team news
- Filter options for user control

### 4. Mobile-First
- Touch-friendly targets
- Readable text sizes
- Single column layout
- Reduced information density

---

## Component Specifications

### Compact News Card
- **Dimensions**: 
  - Mobile: Full width, 80-100px height
  - Desktop: Full width, 100-120px height
  
- **Layout**:
  - Headline: Top, 2-line clamp
  - Summary: Middle, 1-2 lines (optional)
  - Metadata: Bottom, single line
  - Badge: Top-right corner

- **Styling**:
  - Glass morphism background
  - 1px border (subtle)
  - 8px border radius
  - Hover: Slight scale (1.02x)

### Filter Buttons
- **Size**: 44x44px minimum touch target
- **Padding**: 12px horizontal, 8px vertical
- **Border Radius**: 8px
- **Active State**: Team color background, white text
- **Inactive State**: Transparent, muted text
- **Spacing**: 8px between buttons

### Show More Button
- **Size**: 44x44px minimum
- **Style**: Outlined button
- **Position**: Center, below news list
- **Text**: "Show More" / "Show Less"
- **Icon**: Chevron down/up

---

## Responsive Design

### Mobile (320px - 767px)
- **Layout**: Single column, full-width cards
- **Cards**: 80-100px height, compact
- **Summaries**: Hidden or 1 line max
- **Filter**: Horizontal scrollable row
- **Spacing**: 12px between cards

### Tablet (768px - 1023px)
- **Layout**: Single column or 2-column grid
- **Cards**: 100-120px height
- **Summaries**: 1-2 lines
- **Filter**: Full row, no scroll
- **Spacing**: 16px between cards

### Desktop (1024px+)
- **Layout**: Single column or 2-column grid
- **Cards**: 100-120px height
- **Summaries**: 2 lines max
- **Filter**: Full row
- **Spacing**: 20px between cards

---

## Color System

### Team News
- **Badge**: Team primary color
- **Border**: Team primary color (for high priority)
- **Text**: Standard text colors

### Player News
- **Badge**: FPL green (#00ff87) or cyan (#04f5ff)
- **Border**: FPL green/cyan (for high priority)
- **Player Name**: FPL green/cyan, bold

### Priority Indicators
- **High Priority**: Red border (injuries), Blue border (transfers)
- **Medium Priority**: Standard border
- **Low Priority**: Muted border

---

## Typography

### Headlines
- **Size**: 16px (mobile), 18px (desktop)
- **Weight**: 700 (bold)
- **Line Height**: 1.3
- **Max Lines**: 2 (with clamp)

### Summaries
- **Size**: 12px (mobile), 14px (desktop)
- **Weight**: 400 (regular)
- **Line Height**: 1.4
- **Max Lines**: 1-2 (optional, can hide)

### Metadata
- **Size**: 10px
- **Weight**: 400 (regular)
- **Color**: Muted

### Player Names
- **Size**: 14px
- **Weight**: 600 (semibold)
- **Color**: FPL green/cyan

---

## Animation Guidelines

### Card Hover
- **Scale**: 1.02x (subtle)
- **Duration**: 0.2s
- **Easing**: ease-out

### Show More/Less
- **Expand/Collapse**: Smooth height transition
- **Duration**: 0.3s
- **Easing**: ease-in-out

### Filter Change
- **Fade**: Items fade out/in
- **Duration**: 0.2s
- **Easing**: ease-in-out

---

## Accessibility Requirements

### WCAG AA Compliance
- **Color Contrast**: 4.5:1 minimum for text
- **Touch Targets**: Minimum 44x44px
- **Focus Indicators**: Clear, visible
- **Keyboard Navigation**: Full support
- **Screen Reader**: ARIA labels for news types, filters

### Design Considerations
- **Color Blindness**: Don't rely on color alone (use icons/labels)
- **Motion Sensitivity**: Respect `prefers-reduced-motion`
- **Text Size**: Scalable up to 200%
- **Touch Targets**: Generous spacing between interactive elements

---

## Deliverables Required

1. **Compact News Card Design**:
   - Mockups for compact card (80-100px height)
   - Priority indicator designs (colored borders)
   - Badge designs (team/player)
   - Mobile and desktop versions

2. **Simplified Layout Design**:
   - Single unified list layout
   - "Show More" functionality design
   - Collapsible sections design
   - Mobile, tablet, desktop layouts

3. **Personalized News Design**:
   - Combined feed layout
   - News type badges
   - Player name display
   - Filter button designs

4. **Component Specifications**:
   - Exact dimensions
   - Spacing specifications
   - Typography specifications
   - Color specifications

5. **Design System Updates**:
   - News card component specs
   - Filter button component specs
   - Show More button component specs

---

## What NOT to Do

- ❌ **DO NOT** implement code - hand off to Developer Agent
- ❌ **DO NOT** make requirements decisions - escalate to Product and Project Agent
- ❌ **DO NOT** skip design specs - always provide clear design documentation
- ❌ **DO NOT** keep the current overwhelming design - simplify significantly

---

## Definition of Done

Design phase is complete when:
- ✅ All mockups created (mobile, tablet, desktop)
- ✅ Compact news card design finalized
- ✅ Simplified layout design finalized
- ✅ Personalized news design finalized
- ✅ Component specifications complete
- ✅ Accessibility requirements met
- ✅ Handoff document created for Developer Agent

---

## Next Steps

1. **Review Requirements**: Read `docs/news-display-requirements.md` thoroughly
2. **Review Existing Components**: Check `TeamNewsOverview.tsx` and `PersonalizedNewsFeed.tsx`
3. **Create Mockups**: Start with compact news card design
4. **Design System**: Update design system with new components
5. **Component Library**: Design all reusable components
6. **Handoff to Developer**: Create `docs/news-display-handoff-developer.md`

---

**Start designing now! 🎨**

**Remember**: Focus on making news scannable, curated, and not overwhelming. Less is more!


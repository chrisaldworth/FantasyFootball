# Personalized News Feature - Handoff to UI Designer Agent

**From**: Product and Project Agent  
**To**: UI Designer Agent  
**Date**: 2025-12-19  
**Priority**: P1 (High)  
**Status**: 🚀 **READY - START DESIGN WORK NOW**

---

## 🎯 Your Mission

The news section needs to be enhanced to show both:
1. **Favorite Team News** (already working)
2. **FPL Squad Player News** (new feature)

Your job is to create beautiful, intuitive design specifications that allow users to see personalized news about their favorite team AND their fantasy football players in one cohesive, engaging interface.

**When you activate, you will automatically detect this document (via glob pattern) and start work immediately.**

---

## Context

### Current State
- ✅ News section shows favorite team news
- ✅ News is categorized and analyzed
- ❌ No news about FPL squad players
- ❌ Users miss important player news (injuries, transfers)

### Goal
Create a personalized news feed that:
- Shows favorite team news (existing)
- Shows FPL player news (new)
- Clearly distinguishes between the two types
- Allows filtering and sorting
- Keeps users engaged with relevant content

---

## Reference Documents

1. **Requirements Document**: `docs/personalized-news-requirements.md`
   - Complete functional requirements
   - User stories
   - Technical considerations
   - Acceptance criteria

---

## Design Specifications Needed

### 1. News Type Visual Distinction

**Requirement**: Users must be able to instantly see if news is about their favorite team or their FPL players.

**Design Elements Needed**:
- **Badge/Icon System**:
  - Team news badge: Team logo/icon + "Team" label
  - Player news badge: Player icon + "Player" label + player name
- **Color Coding**:
  - Team news: Use team colors (already themed)
  - Player news: Use distinct color (e.g., FPL green/cyan)
- **Visual Hierarchy**:
  - Badge placement (top-left or top-right of news card)
  - Badge size and prominence
  - Typography for player names

**Design Requirements**:
- Badges must be visible but not overwhelming
- Player names must be clearly readable
- Color contrast meets WCAG AA (4.5:1)
- Works on mobile (small screens)

---

### 2. Combined News Feed Layout

**Requirement**: Display both types of news in a single, scrollable feed.

**Design Elements Needed**:
- **News Card Design**:
  - Standard card layout (existing)
  - News type badge
  - Player name (for player news)
  - Title, summary, source, date
  - Category tags
  - "Read more" link
- **Feed Layout**:
  - Vertical stacking (mobile)
  - Grid layout option (desktop)
  - Spacing between cards
  - Visual separation between news types (optional)

**Design Requirements**:
- Cards must be scannable
- Player names clearly visible
- Consistent with existing design system
- Responsive (mobile-first)

---

### 3. Filter & Sort Controls

**Requirement**: Users can filter and sort news to find what they want.

**Design Elements Needed**:
- **Filter Buttons**:
  - "All News" (default)
  - "Favorite Team Only"
  - "FPL Players Only"
- **Sort Dropdown**:
  - "Most Recent" (default)
  - "Most Important"
  - "By Category"
- **Layout**:
  - Filter buttons: Horizontal row (scrollable on mobile)
  - Sort dropdown: Right-aligned or in filter row
  - Active state indicators
  - Hover states

**Design Requirements**:
- Filter buttons: Minimum 44x44px touch targets
- Clear active/inactive states
- Mobile-friendly (scrollable if needed)
- Accessible (keyboard navigation)

---

### 4. Player Name Display

**Requirement**: Player news must clearly show which player the news is about.

**Design Elements Needed**:
- **Player Name Display**:
  - Position in card (below badge or in title area)
  - Typography: Bold, readable
  - Format: "Player Name" or "Player Name (Team)"
  - Optional: Player photo/avatar (if available)
- **Visual Treatment**:
  - Color: Distinct from team news
  - Icon: Player icon or FPL icon
  - Spacing: Clear separation from other content

**Design Requirements**:
- Player names must be prominent
- Format: "Mohamed Salah" or "Salah (Liverpool)"
- Works with long names
- Mobile-friendly

---

### 5. Empty States

**Requirement**: Handle cases where no news is available.

**Design Elements Needed**:
- **No Favorite Team News**:
  - Message: "Select a favorite team to see team news"
  - Call-to-action: "Select Team" button
- **No FPL Player News**:
  - Message: "Link your FPL team to see player news"
  - Call-to-action: "Link FPL Team" button
- **No News at All**:
  - Message: "No news available at the moment"
  - Friendly illustration or icon

**Design Requirements**:
- Clear, helpful messages
- Actionable CTAs
- Consistent with app design
- Not intimidating or error-like

---

### 6. Loading States

**Requirement**: Show loading indicators while fetching news.

**Design Elements Needed**:
- **Loading Skeleton**:
  - Card-shaped skeleton
  - Animated shimmer effect
  - Shows structure of news card
- **Loading Spinner**:
  - For initial load
  - Centered in news section
  - Team-themed colors

**Design Requirements**:
- Skeleton matches final card layout
- Smooth animations
- Not jarring or distracting

---

## Design Principles to Follow

### 1. Visual Hierarchy
- **Most Important**: News type badge (team vs player)
- **Secondary**: Player name (for player news)
- **Tertiary**: Title, summary, metadata

### 2. Consistency
- Use existing design system (glass morphism, team colors)
- Match existing news card design
- Consistent spacing and typography

### 3. Clarity
- Clear distinction between news types
- Player names easily readable
- Filter options obvious and accessible

### 4. Engagement
- News cards are clickable and engaging
- Hover states provide feedback
- Visual interest without clutter

---

## Component Specifications

### News Card (Enhanced)
- **Dimensions**: Full width (mobile), flexible (desktop)
- **Padding**: 16px (mobile), 24px (desktop)
- **Border Radius**: 12px (mobile), 16px (desktop)
- **Background**: Glass morphism (existing)
- **Badge**: Top-right corner, 24x24px icon + label
- **Player Name**: Below badge or in title area, bold, 14-16px
- **Title**: 16-18px, bold, 2-line clamp
- **Summary**: 14px, 2-line clamp, muted color
- **Metadata**: 12px, muted color (source, time ago)
- **Category Tags**: Small badges, 10-12px

### Filter Buttons
- **Size**: Minimum 44x44px touch target
- **Padding**: 12px horizontal, 8px vertical
- **Border Radius**: 8px
- **Active State**: Team color background, white text
- **Inactive State**: Transparent background, muted text
- **Spacing**: 8px between buttons

### Sort Dropdown
- **Size**: Minimum 44x44px touch target
- **Style**: Match existing dropdowns
- **Position**: Right-aligned or in filter row
- **Options**: Clear labels, icons optional

---

## Responsive Design

### Mobile (320px - 767px)
- **Layout**: Single column, full-width cards
- **Filter Buttons**: Horizontal scrollable row
- **Sort**: Dropdown below filter row
- **Badge**: Top-right, 20x20px
- **Player Name**: Below badge, 14px
- **Spacing**: 16px between cards

### Tablet (768px - 1023px)
- **Layout**: Single column or 2-column grid
- **Filter Buttons**: Full row, no scroll
- **Sort**: Inline with filter buttons
- **Badge**: Top-right, 24x24px
- **Player Name**: Below badge, 16px
- **Spacing**: 24px between cards

### Desktop (1024px+)
- **Layout**: 2-column grid (optional)
- **Filter Buttons**: Full row
- **Sort**: Right-aligned
- **Badge**: Top-right, 24x24px
- **Player Name**: Below badge, 16px
- **Spacing**: 32px between cards

---

## Color System

### Team News
- **Badge Color**: Team primary color (from theme)
- **Badge Background**: Team primary color with 20% opacity
- **Text**: Team text color (from theme)

### Player News
- **Badge Color**: FPL green (#00ff87) or cyan (#04f5ff)
- **Badge Background**: FPL green/cyan with 20% opacity
- **Text**: White or dark (for contrast)
- **Player Name**: FPL green or cyan

### Filter Buttons
- **Active**: Team primary color
- **Inactive**: Muted gray
- **Hover**: Slightly brighter

---

## Typography

### Player Names
- **Font Size**: 14px (mobile), 16px (desktop)
- **Font Weight**: 600 (semibold)
- **Color**: FPL green/cyan or team color
- **Line Height**: 1.4

### News Type Badge
- **Font Size**: 10px (mobile), 12px (desktop)
- **Font Weight**: 600 (semibold)
- **Text Transform**: Uppercase
- **Letter Spacing**: 0.5px

### News Title
- **Font Size**: 16px (mobile), 18px (desktop)
- **Font Weight**: 700 (bold)
- **Line Height**: 1.3
- **Max Lines**: 2 (with clamp)

---

## Animation Guidelines

### Card Hover
- **Scale**: 1.02x (subtle)
- **Duration**: 0.2s
- **Easing**: ease-out

### Filter Button Active
- **Background Color**: Smooth transition
- **Duration**: 0.3s
- **Easing**: ease-in-out

### Loading Skeleton
- **Shimmer**: Continuous, subtle
- **Duration**: 1.5s (loop)
- **Easing**: linear

---

## Accessibility Requirements

### WCAG AA Compliance
- **Color Contrast**: 4.5:1 minimum for text
- **Touch Targets**: Minimum 44x44px
- **Focus Indicators**: Clear, visible
- **Keyboard Navigation**: Full support
- **Screen Reader**: ARIA labels for news types

### Design Considerations
- **Color Blindness**: Don't rely on color alone (use icons/labels)
- **Motion Sensitivity**: Respect `prefers-reduced-motion`
- **Text Size**: Scalable up to 200%
- **Touch Targets**: Generous spacing between interactive elements

---

## Deliverables Required

1. **News Card Design**:
   - Mockups for team news card (enhanced)
   - Mockups for player news card (new)
   - Badge designs
   - Player name display design

2. **Filter & Sort UI**:
   - Filter button designs
   - Sort dropdown design
   - Active/inactive states
   - Mobile layout

3. **Layout Designs**:
   - Combined news feed layout
   - Mobile, tablet, desktop views
   - Spacing and grid specifications

4. **Empty States**:
   - No favorite team message
   - No FPL team message
   - No news message

5. **Loading States**:
   - Skeleton loader design
   - Loading spinner design

6. **Design System Updates**:
   - Color specifications
   - Typography specifications
   - Component specifications

---

## What NOT to Do

- ❌ **DO NOT** implement code - hand off to Developer Agent
- ❌ **DO NOT** make requirements decisions - escalate to Product and Project Agent
- ❌ **DO NOT** skip design specs - always provide clear design documentation
- ❌ **DO NOT** break existing news design - enhance, don't replace

---

## Definition of Done

Design phase is complete when:
- ✅ All mockups created (mobile, tablet, desktop)
- ✅ Design system documented
- ✅ Component specifications complete
- ✅ Accessibility requirements met
- ✅ Handoff document created for Developer Agent

---

## Next Steps

1. **Review Requirements**: Read `docs/personalized-news-requirements.md` thoroughly
2. **Create Mockups**: Start with news card designs
3. **Design System**: Update design system with new components
4. **Component Library**: Design all reusable components
5. **Handoff to Developer**: Create `docs/personalized-news-handoff-developer.md`

---

**Start designing now! 🎨**

**Remember**: Focus on clarity, engagement, and making it easy for users to distinguish between team news and player news!


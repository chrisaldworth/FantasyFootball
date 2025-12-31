# Navigation Consistency - Design Specification

**Date**: 2025-12-19  
**Designer**: UI Designer Agent  
**Status**: ✅ Design Complete  
**Priority**: P0 (Critical)

---

## Overview

Comprehensive design specification for standardizing TopNavigation component across all pages, ensuring consistent layout, spacing, responsive behavior, and seamless integration with SideNavigation and BottomNavigation.

**Goal**: Same navigation experience on every page, always accessible, fits seamlessly with content

---

## Design Principles

### Consistency
- Same TopNavigation component on every page
- Same layout and styling
- Same behavior and interactions
- Same spacing and positioning

### Accessibility
- Always accessible from anywhere (fixed position)
- Keyboard navigation works
- Screen reader friendly
- Clear focus indicators

### Responsive
- Works on all screen sizes
- Touch-friendly on mobile (44x44px minimum)
- Efficient on desktop
- Adapts to content

### Content Fit
- Doesn't hide important content
- Proper spacing and padding
- Smooth scrolling works
- No overlap issues

---

## TopNavigation Component Design

### Component Structure

```
┌─────────────────────────────────────────────────────────────┐
│ [Back] [Logo] [Page Title]    [Team] [🔗] [🔔] [User] [Logout] │
└─────────────────────────────────────────────────────────────┘
```

### Layout Sections

**Left Section**:
- Back button (optional, conditional)
- Logo (always)
- Page title (optional, conditional)

**Right Section**:
- Favorite team selector (conditional)
- Link FPL button (conditional)
- Notifications button (conditional)
- User info (conditional)
- Auth buttons (conditional)

---

## Visual Specifications

### TopNavigation Container

**Positioning**:
- Position: `fixed top-0`
- Z-index: `z-50`
- Width: Full width (`left-0 right-0`)
- Sidebar offset: `lg:left-16` (collapsed) or `lg:left-60` (expanded)

**Styling**:
- Background: `glass` class (semi-transparent with blur)
- Border: `border-b border-white/10` (optional, subtle bottom border)
- Height: 
  - Desktop: `h-16` (64px)
  - Mobile: `h-14` (56px)
- Transition: `transition-all duration-300` (for sidebar offset changes)

**Content Container**:
- Max-width: `max-w-7xl mx-auto`
- Padding: `px-3 sm:px-4 lg:px-6 py-2 sm:py-3`
- Layout: `flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 lg:gap-4`

---

### Left Section (Logo & Title)

**Layout**:
- Flex: `flex items-center gap-3 sm:gap-4 flex-1 min-w-0`
- Overflow: `min-w-0` (allows truncation)

**Back Button** (Optional):
- Position: Before logo
- Styling: `text-[var(--pl-text-muted)] hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap flex-shrink-0`
- Text: `← Back` or icon only on mobile
- Link: Uses `backHref` prop (default: `/dashboard`)

**Logo**:
- Size: `size={80}` (desktop), responsive on mobile
- Variant: `variant="full" color="full"`
- Link: `/dashboard` (or `/` if not logged in)
- Styling: `flex-shrink-0` (prevents shrinking)

**Page Title** (Optional):
- Position: After logo
- Styling: `text-lg sm:text-xl lg:text-2xl font-bold text-white truncate hidden sm:block`
- Truncation: `truncate` (if too long)
- Visibility: Hidden on mobile (`hidden sm:block`)

---

### Right Section (Actions)

**Layout**:
- Flex: `flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end`
- Responsive: Full width on mobile, auto on desktop

**Favorite Team Selector** (Conditional):
- Component: `FavoriteTeamSelector`
- Show: If `showFavoriteTeam={true}` and user has favorite team
- Mobile: Compact dropdown
- Desktop: Full dropdown

**Link FPL Button** (Conditional):
- Show: If `showLinkFPL={true}` and user has no FPL team
- Size: `w-9 h-9 sm:w-10 sm:h-10` (36-40px, touch-friendly)
- Styling: `rounded-lg bg-[var(--pl-dark)] hover:bg-[var(--pl-card-hover)]`
- Icon: 🔗 emoji or SVG
- Title: "Link FPL Account"

**Notifications Button** (Conditional):
- Show: If `showNotifications={true}` and user logged in
- Size: `w-9 h-9 sm:w-10 sm:h-10` (36-40px, touch-friendly)
- Styling: `rounded-lg bg-[var(--pl-dark)] hover:bg-[var(--pl-card-hover)]`
- Icon: 🔔 emoji or SVG
- Badge: Red dot if notifications enabled (`absolute top-1 right-1 w-2 sm:w-2.5 h-2 sm:h-2.5 bg-[var(--pl-pink)] rounded-full`)
- Title: "Notifications"

**User Info** (Conditional):
- Show: If user logged in
- Username: `text-[var(--pl-text-muted)] text-xs sm:text-sm hidden sm:block whitespace-nowrap`
- Logout Button: `btn-secondary px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm touch-manipulation whitespace-nowrap`

**Auth Buttons** (Conditional):
- Show: If user not logged in
- Login: `btn-secondary`
- Register: `btn-primary`
- Styling: `text-xs sm:text-sm px-3 sm:px-6 py-1.5 sm:py-2`

---

## Responsive Design

### Desktop (> 1024px)

**TopNavigation**:
- Height: `h-16` (64px)
- Sidebar offset: `lg:left-16` (collapsed) or `lg:left-60` (expanded)
- Layout: Horizontal row
- Logo size: 80-100px
- Page title: Visible (`text-xl lg:text-2xl`)
- All buttons: Full size

**Content Padding**:
- Top: `pt-16 lg:pt-20` (64-80px)
- Left: `pl-16 lg:pl-60` (for sidebar, dynamic based on sidebar state)
- Bottom: `pb-12` (normal)

---

### Tablet (768px - 1024px)

**TopNavigation**:
- Height: `h-14 sm:h-16` (56-64px)
- Sidebar: Hidden or drawer
- Layout: Horizontal row (may be tighter)
- Logo size: 80px
- Page title: Visible (`text-xl`)
- Buttons: Medium size

**Content Padding**:
- Top: `pt-14 sm:pt-16` (56-64px)
- Left: `pl-4 sm:pl-6` (no sidebar offset)
- Bottom: `pb-16` (for bottom nav if visible)

---

### Mobile (< 768px)

**TopNavigation**:
- Height: `h-14` (56px)
- Sidebar: Hidden
- Layout: Vertical stack on very small screens, horizontal on larger mobile
- Logo size: 80px (responsive)
- Page title: Hidden (`hidden sm:block`)
- Buttons: Compact (`w-9 h-9`)

**Content Padding**:
- Top: `pt-14` (56px)
- Left: `pl-4` (normal padding)
- Bottom: `pb-20` (for bottom nav, 80px)

---

## Page-Specific Configurations

### Public Pages (Home, Login, Register)

**TopNavigation Props**:
```typescript
<TopNavigation
  showFavoriteTeam={false}
  showNotifications={false}
  showLinkFPL={false}
  // No sidebar offset
/>
```

**Home Page** (`/`):
- Logo links to `/`
- Auth buttons shown (Login/Register) or Dashboard link if logged in
- No sidebar
- No favorite team selector

**Login/Register Pages**:
- Logo links to `/`
- Minimal navigation (just logo)
- No sidebar
- No favorite team selector

---

### Main Pages (Dashboard, Fantasy Football, My Team)

**TopNavigation Props**:
```typescript
<TopNavigation
  showFavoriteTeam={true}
  showNotifications={true}
  showLinkFPL={true}
  onNotificationsClick={() => setShowNotifications(true)}
  onLinkFPLClick={() => setShowLinkFPL(true)}
/>
```

**Dashboard** (`/dashboard`):
- No page title (main page)
- No back button
- All features enabled

**Fantasy Football** (`/fantasy-football`):
- No page title (main page)
- No back button
- All features enabled

**My Team** (`/my-team`):
- No page title (main page)
- No back button
- All features enabled

---

### Sub-Pages (Analytics, Squad, News, etc.)

**TopNavigation Props**:
```typescript
<TopNavigation
  pageTitle="Analytics" // or "Squad", "News", etc.
  showBackButton={true}
  backHref="/fantasy-football" // or "/my-team", "/dashboard"
  showFavoriteTeam={true}
  showNotifications={true}
  showLinkFPL={true}
  onNotificationsClick={() => setShowNotifications(true)}
  onLinkFPLClick={() => setShowLinkFPL(true)}
/>
```

**Fantasy Football Sub-Pages**:
- `/fantasy-football/analytics` - Title: "Analytics", Back: `/fantasy-football`
- `/fantasy-football/squad` - Title: "My Squad", Back: `/fantasy-football`
- `/fantasy-football/news` - Title: "FPL News", Back: `/fantasy-football`
- `/fantasy-football/transfers` - Title: "Transfers", Back: `/fantasy-football`
- `/fantasy-football/leagues` - Title: "Leagues", Back: `/fantasy-football`
- `/fantasy-football/captain` - Title: "Captain Pick", Back: `/fantasy-football`

**My Team Sub-Pages**:
- `/my-team/fixtures` - Title: "Fixtures", Back: `/my-team`
- `/my-team/news` - Title: "News", Back: `/my-team`
- `/my-team/standings` - Title: "Standings", Back: `/my-team`
- `/my-team/analytics` - Title: "Analytics", Back: `/my-team`

**Settings** (`/settings`):
- Title: "Settings"
- Back: `/dashboard`
- All features enabled

---

### FPL Page (`/fpl`)

**TopNavigation Props**:
```typescript
<TopNavigation
  pageTitle="Fantasy Premier League"
  showBackButton={true}
  backHref="/dashboard"
  showFavoriteTeam={true}
  showNotifications={true}
  showLinkFPL={true}
  onNotificationsClick={() => setShowNotifications(true)}
  onLinkFPLClick={() => setShowLinkFPL(true)}
/>
```

**Note**: Replace custom header with TopNavigation

---

## Content Spacing Specifications

### Standard Content Padding

**Desktop** (with sidebar):
```tsx
<main className="pt-16 lg:pt-20 pb-12 px-4 sm:px-6 lg:pl-16 lg:pr-6 transition-all duration-300">
  {/* Content */}
</main>
```

**Desktop** (sidebar collapsed):
```tsx
<main className="pt-16 lg:pt-20 pb-12 px-4 sm:px-6 lg:pl-16 lg:pr-6 transition-all duration-300">
  {/* Content */}
</main>
```

**Desktop** (sidebar expanded):
```tsx
<main className="pt-16 lg:pt-20 pb-12 px-4 sm:px-6 lg:pl-60 lg:pr-6 transition-all duration-300">
  {/* Content */}
</main>
```

**Mobile**:
```tsx
<main className="pt-14 pb-20 px-4 sm:px-6">
  {/* Content */}
</main>
```

**Public Pages** (no sidebar):
```tsx
<main className="pt-14 sm:pt-16 pb-12 px-4 sm:px-6">
  {/* Content */}
</main>
```

---

## Z-Index Hierarchy

**Consistent across all pages**:
- Modals: `z-100`
- TopNavigation: `z-50`
- BottomNavigation: `z-50`
- SideNavigation: `z-40`
- Dropdowns: `z-30`
- Content: `z-10`

---

## Sidebar Integration

### Sidebar Offset Logic

**TopNavigation should account for sidebar width**:
- Collapsed sidebar: `lg:left-16` (64px)
- Expanded sidebar: `lg:left-60` (240px)
- No sidebar: `left-0` (public pages)

**Implementation**:
```typescript
const showSidebarOffset = pathname !== '/' && pathname !== '/login' && pathname !== '/register';
const sidebarOffset = showSidebarOffset ? (isExpanded ? 'lg:left-60' : 'lg:left-16') : '';
```

**Transition**:
- Smooth transition when sidebar toggles: `transition-all duration-300`
- TopNavigation width adjusts automatically

---

## Interaction States

### Hover States
- Buttons: `hover:bg-[var(--pl-card-hover)]`
- Links: `hover:text-white` (from muted)
- Logo: Optional hover scale

### Focus States
- All interactive elements: `focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2`
- Keyboard navigation: Tab order logical

### Active States
- Buttons: `active:bg-[var(--pl-card-hover)]`
- Touch: `touch-manipulation` class

---

## Accessibility

### WCAG AA Compliance
- Color contrast: All text meets WCAG AA standards
- Focus indicators: Visible on all interactive elements
- Touch targets: Minimum 44x44px on mobile

### Keyboard Navigation
- All navigation items keyboard accessible
- Tab order: Logo → Back → Actions (left to right)
- Enter/Space to activate links and buttons

### Screen Readers
- Proper ARIA labels:
  - `aria-label="Back to dashboard"` (back button)
  - `aria-label="Fotmate home"` (logo)
  - `aria-label="Notifications"` (notifications button)
  - `aria-label="Link FPL Account"` (link FPL button)
- Semantic HTML: `<nav>`, `<button>`, `<a>`

---

## Typography

### Page Title
- Font: `text-lg sm:text-xl lg:text-2xl`
- Weight: `font-bold`
- Color: `text-white`
- Truncation: `truncate` (if too long)

### Back Button
- Font: `text-sm sm:text-base`
- Color: `text-[var(--pl-text-muted)] hover:text-white`

### Username
- Font: `text-xs sm:text-sm`
- Color: `text-[var(--pl-text-muted)]`

### Buttons
- Font: `text-xs sm:text-sm`
- Weight: `font-semibold` (via btn classes)

---

## Design Decisions

### 1. Page Title Placement
**Decision**: Same line as logo, after logo  
**Rationale**: Efficient use of space, clear hierarchy

### 2. Back Button Placement
**Decision**: Left of logo  
**Rationale**: Standard position, doesn't interfere with logo

### 3. Mobile Page Title
**Decision**: Hidden on mobile (`hidden sm:block`)  
**Rationale**: Saves space, logo is sufficient identifier

### 4. Favorite Team Selector
**Decision**: Show on all authenticated pages  
**Rationale**: Important feature, should be accessible

### 5. Sidebar Offset
**Decision**: TopNavigation adjusts width when sidebar toggles  
**Rationale**: Prevents overlap, maintains alignment

### 6. Public Pages
**Decision**: Use TopNavigation but simplified  
**Rationale**: Consistency, but appropriate for context

### 7. Content Padding
**Decision**: Dynamic based on sidebar state  
**Rationale**: Prevents content from being hidden

---

## Component Specifications

### TopNavigation Props

```typescript
interface TopNavigationProps {
  showFavoriteTeam?: boolean;      // Default: true
  showNotifications?: boolean;      // Default: true
  showLinkFPL?: boolean;            // Default: true
  onNotificationsClick?: () => void;
  onLinkFPLClick?: () => void;
  pageTitle?: string;               // Optional page title
  showBackButton?: boolean;         // Default: false
  backHref?: string;                // Default: '/dashboard'
}
```

---

## Implementation Checklist

### Pages to Update

**Missing TopNavigation** (Add it):
- [ ] `/fantasy-football/analytics`
- [ ] `/fantasy-football/squad`
- [ ] `/fantasy-football/news`
- [ ] `/fantasy-football/transfers`
- [ ] `/fantasy-football/leagues`
- [ ] `/fantasy-football/captain`
- [ ] `/my-team/fixtures`
- [ ] `/my-team/news`
- [ ] `/my-team/standings`
- [ ] `/my-team/analytics`

**Custom Navigation** (Replace with TopNavigation):
- [ ] `/` (Home)
- [ ] `/login`
- [ ] `/register`
- [ ] `/fpl`

**Already Have TopNavigation** (Verify consistency):
- [ ] `/dashboard`
- [ ] `/my-team`
- [ ] `/settings`
- [ ] `/fantasy-football`

---

## Testing Checklist

- [ ] TopNavigation appears on all pages
- [ ] Consistent layout across all pages
- [ ] Sidebar offset works correctly (desktop)
- [ ] Content padding correct (not hidden)
- [ ] Mobile navigation works (top + bottom)
- [ ] Desktop navigation works (top + side)
- [ ] Touch targets minimum 44x44px
- [ ] Keyboard navigation works
- [ ] Focus states visible
- [ ] Screen reader announces correctly
- [ ] No content overlap issues
- [ ] Smooth transitions when sidebar toggles
- [ ] Responsive breakpoints work correctly

---

**Design Specification Complete** ✅  
**Ready for Developer Handoff** 🚀





# Navigation Consistency - Requirements
**Date**: 2025-12-19  
**Priority**: P0 (Critical)  
**Status**: Requirements Phase  
**Feature**: Consistent Top Navigation Across All Pages

---

## Executive Summary

**User Request**: Review and standardize the top menu/navigation for mobile and desktop so it's consistent across all pages, fits with page content, and is usable/navigable from anywhere on the site.

**Current State**: 
- Different pages use different navigation implementations
- Some pages have TopNavigation, some don't
- Home page has custom nav
- FPL page has custom header
- Sub-pages (analytics, squad, etc.) missing TopNavigation
- Inconsistent navigation experience

**Solution**: Standardize TopNavigation component across all pages with consistent layout, responsive design, and always-accessible navigation.

---

## Problem Statement

### Current Issues
1. **Inconsistent Navigation**: Different pages have different nav implementations
   - Dashboard: Uses TopNavigation + SideNavigation + BottomNavigation
   - Fantasy Football main: Uses TopNavigation + SideNavigation + BottomNavigation
   - Fantasy Football sub-pages: Only SideNavigation + BottomNavigation (missing TopNavigation)
   - My Team sub-pages: Only SideNavigation + BottomNavigation (missing TopNavigation)
   - Home page: Custom navigation (different from rest)
   - FPL page: Custom header with "Back" button
   - Login/Register: Custom navigation

2. **Missing Top Navigation**: Many sub-pages don't have TopNavigation
   - `/fantasy-football/analytics` - No TopNavigation
   - `/fantasy-football/squad` - No TopNavigation
   - `/fantasy-football/news` - No TopNavigation
   - `/fantasy-football/transfers` - No TopNavigation
   - `/fantasy-football/leagues` - No TopNavigation
   - `/fantasy-football/captain` - No TopNavigation
   - `/my-team/fixtures` - No TopNavigation
   - `/my-team/news` - No TopNavigation
   - `/my-team/standings` - No TopNavigation
   - `/my-team/analytics` - No TopNavigation

3. **Inconsistent Layout**: Navigation doesn't fit consistently with page content
   - Different padding/margins
   - Different z-index values
   - Different positioning
   - Content overlap issues

4. **Mobile Navigation Issues**: 
   - Bottom navigation exists but top nav may be missing on some pages
   - Inconsistent touch targets
   - Different behavior across pages

5. **Desktop Navigation Issues**:
   - Side navigation exists but top nav missing on sub-pages
   - Inconsistent spacing with sidebar
   - Different header heights

### User Need
- **Consistent Experience**: Same navigation on every page
- **Always Accessible**: Can navigate from anywhere
- **Fits Content**: Navigation doesn't interfere with page content
- **Mobile Friendly**: Works well on mobile devices
- **Desktop Friendly**: Works well on desktop
- **Clear Navigation**: Easy to understand where you are and where you can go

---

## Goals & Objectives

### Primary Goals
1. **Consistency**: Same top navigation on all pages
2. **Accessibility**: Navigation always accessible from anywhere
3. **Responsive**: Works perfectly on mobile and desktop
4. **Content Fit**: Navigation fits seamlessly with page content
5. **Usability**: Easy to navigate from any page

### Success Metrics
- **Consistency**: 100% of pages use same TopNavigation component
- **Accessibility**: Navigation accessible in < 100ms from any page
- **Mobile Usability**: Touch targets minimum 44x44px on all devices
- **Desktop Usability**: Navigation doesn't interfere with content
- **User Satisfaction**: Zero navigation-related confusion

---

## User Stories

### Story 1: Consistent Top Navigation
**As a** user  
**I want** the same top navigation on every page  
**So that** I always know where I am and can navigate easily

**Acceptance Criteria**:
- TopNavigation component used on all pages
- Same layout and styling across all pages
- Same functionality (logo, favorite team, notifications, etc.)
- Consistent positioning and spacing

### Story 2: Always Accessible Navigation
**As a** user  
**I want** navigation to always be accessible from anywhere on the site  
**So that** I can navigate without scrolling or searching

**Acceptance Criteria**:
- Top navigation always visible (fixed/sticky)
- Bottom navigation always visible on mobile (fixed)
- Side navigation always visible on desktop (fixed)
- No pages missing navigation components

### Story 3: Mobile Navigation
**As a** mobile user  
**I want** navigation that works well on mobile  
**So that** I can easily navigate on my phone

**Acceptance Criteria**:
- Top navigation responsive and touch-friendly
- Bottom navigation always accessible
- Touch targets minimum 44x44px
- No horizontal scroll issues
- Navigation doesn't cover important content

### Story 4: Desktop Navigation
**As a** desktop user  
**I want** navigation that works well on desktop  
**So that** I can efficiently navigate on my computer

**Acceptance Criteria**:
- Top navigation accounts for sidebar
- Side navigation always accessible
- Navigation doesn't interfere with content
- Proper spacing and alignment
- Keyboard navigation works

### Story 5: Page Content Fit
**As a** user  
**I want** navigation to fit seamlessly with page content  
**So that** content is not hidden or overlapped

**Acceptance Criteria**:
- Page content has proper top padding for navigation
- No content hidden behind navigation
- Consistent spacing across all pages
- Navigation doesn't overlap important content
- Smooth scrolling works correctly

---

## Functional Requirements

### FR1: Standardize TopNavigation Component
**Priority**: P0 (Critical)

**Description**: Use TopNavigation component on all pages consistently

**Pages to Update**:
1. **Home Page** (`/`)
   - Replace custom nav with TopNavigation
   - Show logo, auth buttons
   - Hide favorite team selector (not logged in)

2. **Login Page** (`/login`)
   - Add TopNavigation (minimal, just logo)
   - Or keep simple nav but consistent styling

3. **Register Page** (`/register`)
   - Add TopNavigation (minimal, just logo)
   - Or keep simple nav but consistent styling

4. **FPL Page** (`/fpl`)
   - Replace custom header with TopNavigation
   - Use `showBackButton` prop
   - Use `pageTitle` prop

5. **Fantasy Football Sub-Pages**:
   - `/fantasy-football/analytics` - Add TopNavigation
   - `/fantasy-football/squad` - Add TopNavigation
   - `/fantasy-football/news` - Add TopNavigation
   - `/fantasy-football/transfers` - Add TopNavigation
   - `/fantasy-football/leagues` - Add TopNavigation
   - `/fantasy-football/captain` - Add TopNavigation

6. **My Team Sub-Pages**:
   - `/my-team/fixtures` - Add TopNavigation
   - `/my-team/news` - Add TopNavigation
   - `/my-team/standings` - Add TopNavigation
   - `/my-team/analytics` - Add TopNavigation

7. **Dashboard Sub-Pages** (if any):
   - Ensure TopNavigation is present

**TopNavigation Props**:
- `pageTitle`: Optional page title to display
- `showBackButton`: Show back button (for sub-pages)
- `backHref`: Where back button goes (default: '/dashboard')
- `showFavoriteTeam`: Show favorite team selector (default: true)
- `showNotifications`: Show notifications button (default: true)
- `showLinkFPL`: Show link FPL button (default: true)

---

### FR2: Consistent Layout & Spacing
**Priority**: P0 (Critical)

**Description**: Ensure navigation fits consistently with page content

**Requirements**:
1. **Top Navigation Height**
   - Consistent height across all pages
   - Desktop: ~64px (4rem)
   - Mobile: ~56px (3.5rem)
   - Account for different content (with/without page title)

2. **Content Padding**
   - All pages have consistent top padding
   - Desktop: `pt-16` or `pt-20` (account for top nav + sidebar)
   - Mobile: `pt-14` or `pt-16` (account for top nav)
   - Bottom padding for mobile bottom nav: `pb-16` or `pb-20`

3. **Sidebar Offset** (Desktop)
   - TopNavigation accounts for sidebar width
   - Collapsed sidebar: `left-16` (64px)
   - Expanded sidebar: `left-60` (240px)
   - Smooth transition when sidebar toggles

4. **Z-Index Management**
   - TopNavigation: `z-50`
   - SideNavigation: `z-40`
   - BottomNavigation: `z-50`
   - Modals: `z-100`
   - Consistent across all pages

5. **Content Max-Width**
   - Page content uses consistent max-width
   - `max-w-7xl mx-auto` for main content
   - Navigation uses same max-width for alignment

---

### FR3: Mobile Navigation
**Priority**: P0 (Critical)

**Description**: Ensure mobile navigation works perfectly

**Requirements**:
1. **Top Navigation (Mobile)**
   - Fixed at top
   - Height: ~56px (3.5rem)
   - Touch-friendly buttons (44x44px minimum)
   - Responsive text sizing
   - Logo scales appropriately
   - Favorite team selector works on mobile

2. **Bottom Navigation (Mobile)**
   - Fixed at bottom
   - Height: ~64px (4rem)
   - Always visible
   - Touch-friendly (44x44px minimum)
   - Icons + labels
   - Drawer for FPL/Team sub-menus

3. **Content Spacing (Mobile)**
   - Top padding: `pt-14` or `pt-16` (for top nav)
   - Bottom padding: `pb-16` or `pb-20` (for bottom nav)
   - No content hidden behind navigation
   - Smooth scrolling works

4. **Touch Targets**
   - All interactive elements minimum 44x44px
   - Adequate spacing between buttons
   - No accidental taps
   - Clear visual feedback

---

### FR4: Desktop Navigation
**Priority**: P0 (Critical)

**Description**: Ensure desktop navigation works perfectly

**Requirements**:
1. **Top Navigation (Desktop)**
   - Fixed at top
   - Height: ~64px (4rem)
   - Accounts for sidebar (left offset)
   - Smooth transition when sidebar toggles
   - Logo, favorite team, notifications, user info

2. **Side Navigation (Desktop)**
   - Fixed on left
   - Collapsible (expanded/collapsed)
   - TopNavigation adjusts when sidebar toggles
   - Always accessible
   - Smooth animations

3. **Content Spacing (Desktop)**
   - Top padding: `pt-16` or `pt-20` (for top nav)
   - Left padding: `pl-16` or `pl-60` (for sidebar, when present)
   - No content hidden behind navigation
   - Proper alignment

4. **Keyboard Navigation**
   - All navigation items keyboard accessible
   - Tab order logical
   - Focus indicators visible
   - Enter/Space to activate

---

### FR5: Navigation Content
**Priority**: P0 (Critical)

**Description**: Ensure navigation shows appropriate content based on context

**Top Navigation Elements**:
1. **Logo** (Always)
   - Fotmate logo (when designed) or text
   - Links to dashboard (or home if not logged in)
   - Responsive sizing

2. **Page Title** (Optional)
   - Show on sub-pages
   - Hide on main pages (dashboard, home)
   - Truncate if too long

3. **Back Button** (Optional)
   - Show on sub-pages
   - Links to parent page
   - Text: "← Back" or icon

4. **Favorite Team Selector** (Conditional)
   - Show if user logged in and has favorite team
   - Hide on login/register pages
   - Dropdown to change team

5. **Link FPL Button** (Conditional)
   - Show if user logged in but no FPL team linked
   - Icon button
   - Opens link FPL modal

6. **Notifications Button** (Conditional)
   - Show if user logged in
   - Icon button with badge if enabled
   - Opens notifications modal

7. **User Info** (Conditional)
   - Show username (desktop only, hidden on mobile)
   - Logout button
   - Show if user logged in

8. **Auth Buttons** (Conditional)
   - Login/Register buttons
   - Show if user not logged in
   - Hide if user logged in

---

### FR6: Page-Specific Navigation
**Priority**: P1 (High)

**Description**: Handle page-specific navigation needs

**Home Page** (`/`):
- TopNavigation with logo
- Auth buttons (Login/Register) or Dashboard link
- No favorite team selector (not logged in)
- No sidebar (public page)

**Login/Register Pages**:
- TopNavigation minimal (just logo)
- Or simple nav with consistent styling
- No sidebar
- No favorite team selector

**Dashboard** (`/dashboard`):
- TopNavigation with all features
- SideNavigation (desktop)
- BottomNavigation (mobile)
- Favorite team selector
- Notifications, Link FPL

**Fantasy Football Pages**:
- TopNavigation with page title
- Back button to dashboard or fantasy-football overview
- SideNavigation (desktop)
- BottomNavigation (mobile)
- Sub-navigation (breadcrumbs or tabs)

**My Team Pages**:
- TopNavigation with page title
- Back button to dashboard or my-team overview
- SideNavigation (desktop)
- BottomNavigation (mobile)
- Sub-navigation (breadcrumbs or tabs)

**Settings** (`/settings`):
- TopNavigation with "Settings" title
- Back button to dashboard
- SideNavigation (desktop)
- BottomNavigation (mobile)

---

## Technical Requirements

### Component Structure
```typescript
<TopNavigation
  pageTitle?: string              // Optional page title
  showBackButton?: boolean        // Show back button
  backHref?: string              // Back button destination
  showFavoriteTeam?: boolean    // Show favorite team selector
  showNotifications?: boolean    // Show notifications button
  showLinkFPL?: boolean         // Show link FPL button
  onNotificationsClick?: () => void
  onLinkFPLClick?: () => void
/>
```

### Layout Structure
```typescript
<div className="min-h-screen">
  {/* Desktop Side Navigation */}
  {showSidebar && <SideNavigation />}
  
  {/* Top Navigation - Always Present */}
  <TopNavigation {...props} />
  
  {/* Mobile Bottom Navigation */}
  <BottomNavigation />
  
  {/* Page Content */}
  <main className={contentPaddingClasses}>
    {children}
  </main>
</div>
```

### Responsive Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Z-Index Hierarchy
- Modals: `z-100`
- TopNavigation: `z-50`
- BottomNavigation: `z-50`
- SideNavigation: `z-40`
- Dropdowns: `z-30`
- Content: `z-10`

---

## Design Considerations

### Visual Consistency
- Same styling across all pages
- Same spacing and padding
- Same colors and effects
- Same animations and transitions

### Content Alignment
- Navigation max-width matches content max-width
- Proper alignment between nav and content
- Consistent margins and padding

### Responsive Behavior
- Navigation adapts to screen size
- Touch targets appropriate for device
- Text sizing appropriate for device
- Icons scale appropriately

### Accessibility
- Keyboard navigation works
- Screen reader friendly
- Focus indicators visible
- ARIA labels correct

---

## Acceptance Criteria

### Must Have (P0)
- [ ] TopNavigation used on all pages
- [ ] Consistent layout and styling
- [ ] Mobile navigation works (top + bottom)
- [ ] Desktop navigation works (top + side)
- [ ] Content has proper padding (not hidden)
- [ ] Navigation always accessible
- [ ] Touch targets minimum 44x44px
- [ ] Keyboard navigation works
- [ ] No content overlap issues

### Should Have (P1)
- [ ] Page titles on sub-pages
- [ ] Back buttons on sub-pages
- [ ] Smooth transitions
- [ ] Loading states
- [ ] Error states

---

## Implementation Plan

### Phase 1: Audit Current Navigation
1. List all pages
2. Document current navigation on each page
3. Identify inconsistencies
4. Create migration plan

### Phase 2: Standardize TopNavigation
1. Update TopNavigation component (if needed)
2. Add TopNavigation to all pages missing it
3. Standardize props and usage
4. Test on all pages

### Phase 3: Fix Layout & Spacing
1. Standardize content padding
2. Fix sidebar offset
3. Fix z-index issues
4. Test responsive behavior

### Phase 4: Mobile Optimization
1. Ensure mobile nav works on all pages
2. Fix touch targets
3. Test on real devices
4. Fix any issues

### Phase 5: Desktop Optimization
1. Ensure desktop nav works on all pages
2. Fix sidebar integration
3. Test keyboard navigation
4. Fix any issues

---

## Pages to Update

### Pages Missing TopNavigation
1. `/fantasy-football/analytics`
2. `/fantasy-football/squad`
3. `/fantasy-football/news`
4. `/fantasy-football/transfers`
5. `/fantasy-football/leagues`
6. `/fantasy-football/captain`
7. `/my-team/fixtures`
8. `/my-team/news`
9. `/my-team/standings`
10. `/my-team/analytics`
11. `/dashboard/analytics` (if exists)
12. `/dashboard/leagues` (if exists)

### Pages with Custom Navigation (Need Standardization)
1. `/` (Home) - Custom nav
2. `/login` - Custom nav
3. `/register` - Custom nav
4. `/fpl` - Custom header

---

## Success Criteria

1. **Consistency**: 100% of pages use TopNavigation
2. **Accessibility**: Navigation accessible from all pages
3. **Mobile**: Works perfectly on all mobile devices
4. **Desktop**: Works perfectly on all desktop sizes
5. **Content Fit**: No content hidden or overlapped
6. **User Satisfaction**: Zero navigation confusion

---

## Next Steps

1. **UI Designer**: Review and create design specifications for consistent navigation
2. **Developer**: Implement TopNavigation on all pages
3. **Tester**: Test navigation on all pages and devices

---

**Document Status**: ✅ Requirements Complete  
**Next**: Hand off to UI Designer Agent


# Follow Players - Designer Handoff
**Date**: 2025-12-21  
**Status**: Ready for Design  
**Priority**: P1  
**Handoff From**: Product & Project Management  
**Handoff To**: UI/UX Designer

---

## 🎯 Quick Overview

**Feature**: Follow Players - Allow users to follow specific FPL players to track their performance and access quick insights.

**Objective**: Design intuitive follow/unfollow interactions and a clean followed players list view that integrates seamlessly with existing Fantasy Football UI.

**Full Requirements**: See `follow-players-requirements.md` for complete requirements.

---

## 📋 What You Need to Design

### Core Components (4 Components)

1. **FollowButton Component**
   - Icon/button to follow/unfollow a player
   - States: Following (filled), Not Following (outline)
   - Appears in: Player cards, player detail views, search results
   - Must be consistent across all locations

2. **FollowedPlayersList Component**
   - Main view showing all followed players
   - List/grid layout
   - Sorting and filtering UI
   - Empty state (when no players followed)

3. **FollowedPlayerCard Component**
   - Individual player card in the followed players list
   - Displays: Photo, name, team, position, key stats
   - Quick actions (view details, unfollow)
   - Compact information display

4. **FollowedPlayersWidget Component** (Dashboard)
   - Compact widget for dashboard
   - Shows 3-5 followed players
   - Quick stats overview
   - Link to full list

---

## 🎨 Key Design Requirements

### Visual Style
- **Consistent with Existing UI**: Matches Fantasy Football section styling
- **Football-native**: Feels integrated with FPL player views
- **Clean & Modern**: Not cluttered, easy to scan
- **Mobile-First**: Works perfectly on mobile devices

### Brand Colors
- **Primary**: `--pl-green` (Fotmate brand)
- **Follow Indicator**: Consider using star (⭐) or heart (❤️) icon
- **Active State**: Green accent for "Following" state
- **Inactive State**: Gray outline for "Not Following"

### Key Principles
- **Quick Actions**: Follow/unfollow should be immediate (one tap)
- **Clear Status**: Always obvious if player is followed or not
- **Non-Intrusive**: Doesn't clutter existing player views
- **Visual Consistency**: Same follow indicator everywhere

---

## 🧩 Components to Design

1. **FollowButton**
   - States: Default, Hover, Active (Following), Loading, Disabled
   - Sizes: Small (inline), Medium (card), Large (detail view)
   - Icon options: Star, Heart, Plus/Check
   - Tooltip: "Follow [Player]" / "Unfollow [Player]"

2. **FollowedPlayersList**
   - Layout: Grid (mobile: 1 column, tablet: 2, desktop: 3-4)
   - Header: Title, sort dropdown, filter dropdown, search
   - Empty state: Illustration, message, CTA to browse players
   - Loading state: Skeleton cards

3. **FollowedPlayerCard**
   - Photo: Player photo (circular/square)
   - Header: Name, team badge, position badge
   - Stats: Price, form indicator, points, ownership
   - Actions: View details button, unfollow button
   - Hover state: Subtle elevation/shadow

4. **FollowedPlayersWidget**
   - Compact card layout
   - Shows 3-5 players (horizontal scroll or grid)
   - Each player: Photo, name, key stat (price/form)
   - "View All" link
   - Section title: "Followed Players"

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px (primary focus)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+

**Adaptations**:
- Mobile: Single column list, stacked filters, bottom sheet for actions
- Tablet: 2-column grid, side-by-side filters
- Desktop: 3-4 column grid, expanded information

---

## 🎯 Design Questions to Answer

1. **Follow Icon**: Star ⭐ or Heart ❤️ or Plus/Check ➕/✓?
2. **Follow Button Placement**: Top-right corner, bottom of card, or integrated into header?
3. **Followed Players List**: Grid or list layout? (Recommend grid for visual appeal)
4. **Card Density**: How much information on each card? (Compact vs detailed)
5. **Empty State**: What illustration/message encourages users to follow players?
6. **Dashboard Widget**: Horizontal scroll or grid? How many visible at once?
7. **Sort/Filter UI**: Dropdown, tabs, or buttons?
8. **Visual Hierarchy**: What's most important on each card?
9. **Follow Indicator**: Always visible or only on hover?
10. **Color Coding**: Use colors for form indicators? (green = good, red = bad)

---

## ✅ Deliverables Required

### Required
1. **Component Designs** (all 4 components with states)
2. **Layout Definitions** (Followed Players List page layout)
3. **Visual Design Specs** (colors, typography, spacing)
4. **Interaction States** (default, hover, active, loading, error)
5. **Responsive Breakpoints** (mobile, tablet, desktop)
6. **Empty States** (no players followed, loading, error)
7. **Integration Points** (where follow button appears in existing UI)

### Optional (Nice to Have)
- High-fidelity mockups (Figma, Sketch, etc.)
- Interactive prototype
- Animation specifications (for follow/unfollow transitions)

---

## 📊 Key Features to Highlight

### Follow/Unfollow
- **One-Tap Action**: Quick and easy to follow/unfollow
- **Visual Feedback**: Immediate indication of state change
- **Consistent UI**: Same button/icon everywhere

### Followed Players List
- **Quick Stats**: See key info at a glance
- **Easy Navigation**: Quick access to player details
- **Organization**: Sort and filter to find players

### Integration
- **Seamless**: Follow button appears naturally in player views
- **Non-Intrusive**: Doesn't interfere with existing functionality
- **Helpful**: Adds value without clutter

---

## 🔄 User Flows to Design

### Flow 1: Follow a Player
1. User views player (detail/search/team view)
2. Sees follow button (outline/empty state)
3. Clicks follow button
4. Button changes to filled/active state
5. Success feedback (optional: toast notification)

### Flow 2: View Followed Players
1. User navigates to "Followed Players" section
2. Sees list/grid of followed players
3. Can sort/filter list
4. Clicks player card to view details
5. Can unfollow from list or detail view

### Flow 3: Unfollow a Player
1. User views followed player (list or detail)
2. Sees follow button (filled/active state)
3. Clicks unfollow button
4. Button changes to outline/inactive state
5. If in list, player card fades out or updates

---

## 🎨 Design Considerations

### Mobile-First
- **Touch Targets**: Follow button should be at least 44x44pt
- **Thumb-Friendly**: Actions within easy reach
- **Swipe Actions**: Consider swipe to unfollow (optional)
- **Bottom Sheets**: Use for filter/sort options

### Accessibility
- **WCAG AA Compliance**: 4.5:1 contrast ratio
- **Screen Reader Support**: Icon buttons need labels
- **Keyboard Navigation**: Full keyboard support
- **Focus States**: Clear focus indicators

### Performance
- **Optimistic Updates**: UI updates immediately, syncs in background
- **Loading States**: Show skeleton/loading for async operations
- **Error Handling**: Clear error messages, retry options

---

## 📚 Reference Materials

### Full Documentation
- **Complete Requirements**: `follow-players-requirements.md`
  - Full feature requirements
  - Technical specifications
  - User stories
  - Acceptance criteria

### Existing Code
- **Fotmate Branding**: `docs/features/branding/branding-requirements.md`
- **Player Components**: Check existing player card/detail components
- **Fantasy Football UI**: Review existing FPL section styling
- **Design System**: CSS variables, Tailwind classes

### Similar Features
- **Favorites/Bookmarks**: Common UI patterns to reference
- **Watchlists**: Similar functionality in other apps
- **Social Follow**: Familiar interaction pattern

---

## ⚠️ Important Constraints

### Technical
- **Existing Tech Stack**: Next.js, React, Tailwind CSS
- **FPL API**: Player data comes from FPL API
- **Reuse Components**: Try to reuse existing player card components where possible

### Scope
- **MVP Focus**: Core follow/unfollow + list view first
- **Mobile-First**: Ensure great mobile experience
- **Feasible Timeline**: Realistic for implementation

### UX
- **Maximum 20 Players**: Design should accommodate this limit gracefully
- **No Confirmation**: Unfollow should be quick (no confirmation dialog)
- **Visual Feedback**: Always show current follow status

---

## 🎯 Success Criteria

Your design is successful if:
- ✅ **Intuitive**: Users understand follow/unfollow immediately
- ✅ **Consistent**: Same follow indicator everywhere
- ✅ **Quick**: Follow/unfollow takes one tap/click
- ✅ **Clear**: Always obvious if player is followed
- ✅ **Mobile-Friendly**: Works perfectly on mobile devices
- ✅ **Non-Intrusive**: Doesn't clutter existing UI
- ✅ **Developer-Ready**: Clear specs, implementable

---

## 📅 Timeline

**Estimated Design Time**: 1-2 weeks

**Phases**:
1. **Week 1**: Core components (FollowButton, FollowedPlayerCard, List layout)
2. **Week 2**: Dashboard widget, integration points, polish

---

## 🚀 Next Steps

1. **Review this handoff** (understand scope and objectives)
2. **Read full requirements** (`follow-players-requirements.md`)
3. **Review existing player UI** (understand current player display patterns)
4. **Answer design questions** (clarify with stakeholders if needed)
5. **Create design specifications** (layout, wireframes, visual design)
6. **Review with stakeholders** (get approval)
7. **Hand off to Developer** (create implementation handoff document)

---

## 📞 Questions?

**Contact**: Product Manager  
**Full Requirements**: `docs/features/follow-players/follow-players-requirements.md`

---

**Document Status**: ✅ Ready for Designer  
**Next**: Begin design work

---

## 🎨 Quick Reference: Key Numbers

- **20** maximum players users can follow
- **4** main components to design
- **1 tap** target for follow/unfollow action
- **3-4 columns** grid on desktop
- **1-2 columns** on mobile/tablet
- **WCAG AA** accessibility requirement

---

**Good luck with the design! 🎨⚽**



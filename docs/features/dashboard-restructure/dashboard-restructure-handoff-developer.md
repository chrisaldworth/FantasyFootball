# Dashboard Restructure - Two-Section Architecture - Developer Handoff

**From**: UI Designer Agent  
**To**: Developer Agent  
**Date**: 2025-12-19  
**Status**: Ready for Implementation  
**Priority**: P0 (Critical)

---

## Overview

This document provides implementation guidance for restructuring the dashboard into two clear, distinct sections: **Fantasy Football** (FPL) and **My Team** (Favorite Team). The goal is to create clear visual and structural boundaries, intuitive navigation with sub-menus, and dedicated pages for each section.

**Key Principle**: Complete separation - FPL content in Fantasy Football section, favorite team content in My Team section.

---

## Design Specification Reference

**Complete Design Spec**: `docs/dashboard-restructure-design-spec.md`

This document contains:
- Detailed dashboard layout designs (mobile + desktop)
- Navigation structure with sub-menus
- Page designs for each section
- FPL News feature design
- Analytics separation design
- Component specifications

**Please read the design spec thoroughly before starting implementation.**

---

## Implementation Priority

### Phase 1: Navigation Restructure (P0 - Critical)
1. **Update Side Navigation**
   - Add expandable sections for "Fantasy Football" and "My Team"
   - Add sub-menu items for each section
   - Implement expand/collapse functionality

2. **Update Bottom Navigation**
   - Add "Fantasy Football" and "My Team" items
   - Implement drawer navigation for sub-menus

### Phase 2: Dashboard Restructure (P0 - Critical)
3. **Create DashboardSection Component**
   - Wrapper with colored borders and backgrounds
   - Section headers
   - Preview content area
   - "View All" buttons

4. **Restructure Dashboard Page**
   - Split into two sections
   - Add preview content for each section
   - Add "View All" links

### Phase 3: Page Structure (P0 - Critical)
5. **Create Fantasy Football Pages**
   - `/fantasy-football` - Overview
   - `/fantasy-football/squad` - Squad view
   - `/fantasy-football/transfers` - Transfer tools
   - `/fantasy-football/captain` - Captain pick
   - `/fantasy-football/analytics` - FPL analytics
   - `/fantasy-football/leagues` - Leagues
   - `/fantasy-football/news` - FPL news

6. **Create My Team Pages**
   - `/my-team` - Overview
   - `/my-team/fixtures` - Fixtures
   - `/my-team/news` - Team news
   - `/my-team/standings` - Standings
   - `/my-team/analytics` - Team analytics

### Phase 4: FPL News Feature (P1 - High)
7. **Create FPL News Page**
   - New page: `/fantasy-football/news`
   - FPL-specific news filtering
   - Player-focused news display

### Phase 5: Separate Analytics (P1 - High)
8. **Separate Analytics Pages**
   - FPL analytics: `/fantasy-football/analytics`
   - Team analytics: `/my-team/analytics`
   - Different branding for each

---

## Key Implementation Notes

### 1. Create DashboardSection Component

**Component**: `DashboardSection`

**File**: `frontend/src/components/dashboard/DashboardSection.tsx`

**Props**:
```typescript
interface DashboardSectionProps {
  type: 'fpl' | 'team';
  title: string;
  subtitle?: string;
  icon?: string;
  teamLogo?: string;
  teamName?: string;
  children: React.ReactNode;
  viewAllHref: string;
}
```

**Implementation**:
```tsx
export default function DashboardSection({
  type,
  title,
  subtitle,
  icon,
  teamLogo,
  teamName,
  children,
  viewAllHref,
}: DashboardSectionProps) {
  const isFPL = type === 'fpl';
  
  const borderColor = isFPL 
    ? 'border-[var(--fpl-primary)]' 
    : 'border-[var(--team-primary)]';
    
  const bgColor = isFPL 
    ? 'bg-[var(--fpl-bg-tint)]' 
    : 'bg-[var(--team-primary)]/10';
    
  const textColor = isFPL 
    ? 'text-[var(--fpl-primary)]' 
    : 'text-[var(--team-primary)]';

  const defaultIcon = isFPL ? '⚽' : '🏆';
  const displayIcon = icon || (teamLogo ? null : defaultIcon);

  return (
    <div className={`rounded-2xl border-[4px] ${borderColor} ${bgColor} p-6 sm:p-8 mb-8 sm:mb-10`}>
      {/* Section Header */}
      <div className={`pb-4 mb-6 border-b-[4px] ${borderColor}`}>
        <div className="flex items-center gap-3">
          {displayIcon && (
            <span className="text-3xl sm:text-4xl">{displayIcon}</span>
          )}
          {teamLogo && !displayIcon && (
            <img 
              src={teamLogo} 
              alt={teamName || 'Team'} 
              className="w-10 h-10 sm:w-12 sm:h-12" 
            />
          )}
          <div>
            <h2 className={`text-2xl sm:text-3xl font-bold ${textColor}`}>
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm text-[var(--pl-text-muted)]">{subtitle}</p>
            )}
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="space-y-6">
        {children}
      </div>

      {/* View All Button */}
      <div className="mt-8 flex justify-center">
        <Link
          href={viewAllHref}
          className={`w-full sm:w-auto px-6 py-3 rounded-lg border-2 font-semibold transition-all flex items-center justify-center gap-2 ${
            isFPL
              ? 'border-[var(--fpl-primary)] text-[var(--fpl-primary)] hover:bg-[var(--fpl-primary)] hover:text-[var(--fpl-text-on-primary)]'
              : 'border-[var(--team-primary)] text-[var(--team-primary)] hover:bg-[var(--team-primary)] hover:text-[var(--team-text-on-primary)]'
          }`}
          style={!isFPL ? {
            borderColor: 'var(--team-primary)',
            color: 'var(--team-primary)'
          } : undefined}
        >
          <span>View All {title}</span>
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
```

---

### 2. Create ExpandableNavSection Component

**Component**: `ExpandableNavSection`

**File**: `frontend/src/components/navigation/ExpandableNavSection.tsx`

**Props**:
```typescript
interface ExpandableNavSectionProps {
  type: 'fpl' | 'team';
  title: string;
  icon: string;
  items: Array<{
    icon: string;
    label: string;
    href: string;
  }>;
  defaultExpanded?: boolean;
  teamLogo?: string;
  teamName?: string;
}
```

**Implementation**:
```tsx
export default function ExpandableNavSection({
  type,
  title,
  icon,
  items,
  defaultExpanded = false,
  teamLogo,
  teamName,
}: ExpandableNavSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const pathname = usePathname();
  const isFPL = type === 'fpl';

  const bgColor = isFPL 
    ? 'bg-[var(--fpl-primary)]/20 hover:bg-[var(--fpl-primary)]/30' 
    : 'bg-[var(--team-primary)]/20 hover:bg-[var(--team-primary)]/30';
    
  const textColor = isFPL 
    ? 'text-[var(--fpl-primary)]' 
    : 'text-[var(--team-primary)]';

  return (
    <div className="space-y-1">
      {/* Section Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`w-full px-3 py-3 rounded-lg flex items-center justify-between transition-all ${bgColor}`}
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-2">
          {teamLogo ? (
            <img src={teamLogo} alt={teamName || 'Team'} className="w-5 h-5" />
          ) : (
            <span className="text-xl">{icon}</span>
          )}
          <span className={`font-bold text-sm ${textColor}`}>
            {title}
          </span>
        </div>
        <svg
          className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Sub-Menu Items */}
      {isExpanded && (
        <div className="space-y-1 pl-6">
          {items.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const activeBg = isFPL 
              ? 'bg-[var(--fpl-primary)]/30 text-[var(--fpl-primary)]' 
              : 'bg-[var(--team-primary)]/30';
            const inactiveBg = 'hover:bg-[var(--pl-dark)]/50 text-[var(--pl-text-muted)]';

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all ${
                  isActive ? activeBg : inactiveBg
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
```

---

### 3. Update Side Navigation

**File**: `frontend/src/components/navigation/SideNavigation.tsx`

**Changes Needed**:
1. Replace existing navigation items with `ExpandableNavSection` components
2. Add Fantasy Football section with sub-items
3. Add My Team section with sub-items
4. Keep Dashboard and Settings as top-level items

**Implementation**:
```tsx
import ExpandableNavSection from './ExpandableNavSection';

const fplNavItems = [
  { icon: '📊', label: 'Overview', href: '/fantasy-football' },
  { icon: '⚽', label: 'My Squad', href: '/fantasy-football/squad' },
  { icon: '🔄', label: 'Transfers', href: '/fantasy-football/transfers' },
  { icon: '👑', label: 'Captain Pick', href: '/fantasy-football/captain' },
  { icon: '📈', label: 'Analytics', href: '/fantasy-football/analytics' },
  { icon: '🏆', label: 'Leagues', href: '/fantasy-football/leagues' },
  { icon: '📰', label: 'FPL News', href: '/fantasy-football/news' },
];

const teamNavItems = [
  { icon: '📊', label: 'Overview', href: '/my-team' },
  { icon: '📅', label: 'Fixtures', href: '/my-team/fixtures' },
  { icon: '📰', label: 'News', href: '/my-team/news' },
  { icon: '📊', label: 'Standings', href: '/my-team/standings' },
  { icon: '📈', label: 'Analytics', href: '/my-team/analytics' },
];

// In component
<div className="flex flex-col gap-2 p-4 h-full overflow-y-auto">
  {/* Dashboard */}
  <NavigationItem
    icon="🏠"
    label="Dashboard"
    href="/dashboard"
    color="neutral"
  />

  {/* Fantasy Football Section */}
  <ExpandableNavSection
    type="fpl"
    title="FANTASY FOOTBALL"
    icon="⚽"
    items={fplNavItems}
    defaultExpanded={true}
  />

  {/* My Team Section */}
  {theme && (
    <ExpandableNavSection
      type="team"
      title="MY TEAM"
      icon="🏆"
      items={teamNavItems}
      defaultExpanded={true}
      teamLogo={theme.logo}
      teamName={theme.name}
    />
  )}

  {/* Settings */}
  <NavigationItem
    icon="⚙️"
    label="Settings"
    href="/settings"
    color="neutral"
  />
</div>
```

---

### 4. Update Bottom Navigation

**File**: `frontend/src/components/navigation/BottomNavigation.tsx`

**Changes Needed**:
1. Add "Fantasy Football" and "My Team" items
2. Implement drawer navigation for sub-menus
3. Keep Dashboard and Settings

**Implementation**:
```tsx
const [drawerOpen, setDrawerOpen] = useState(false);
const [drawerType, setDrawerType] = useState<'fpl' | 'team' | null>(null);

const navItems = [
  { icon: '🏠', label: 'Dashboard', href: '/dashboard', type: 'neutral' },
  { icon: '⚽', label: 'FPL', href: '/fantasy-football', type: 'fpl' },
  { icon: '🏆', label: 'Team', href: '/my-team', type: 'team' },
  { icon: '⚙️', label: 'Settings', href: '/settings', type: 'neutral' },
];

const handleNavClick = (item: typeof navItems[0]) => {
  if (item.type === 'fpl' || item.type === 'team') {
    setDrawerType(item.type);
    setDrawerOpen(true);
  } else {
    router.push(item.href);
  }
};

// Drawer Component
{drawerOpen && drawerType && (
  <Drawer
    isOpen={drawerOpen}
    onClose={() => setDrawerOpen(false)}
    type={drawerType}
  />
)}
```

**Drawer Component**:
```tsx
// frontend/src/components/navigation/Drawer.tsx
export default function Drawer({ isOpen, onClose, type }: DrawerProps) {
  const items = type === 'fpl' ? fplNavItems : teamNavItems;
  const title = type === 'fpl' ? 'FANTASY FOOTBALL' : 'MY TEAM';
  const icon = type === 'fpl' ? '⚽' : '🏆';

  return (
    <div
      className={`fixed inset-0 z-50 bg-[var(--pl-dark)]/90 backdrop-blur-sm transition-opacity ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
      onClick={onClose}
    >
      <div
        className={`absolute bottom-0 left-0 right-0 bg-[var(--pl-dark)] rounded-t-2xl border-t border-white/10 transition-transform ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
          <button onClick={onClose} className="text-2xl">✕</button>
        </div>

        {/* Items */}
        <div className="p-4 space-y-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-4 rounded-lg bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-card-hover)] transition-all"
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-base font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

### 5. Restructure Dashboard Page

**File**: `frontend/src/app/dashboard/page.tsx`

**Changes Needed**:
1. Wrap FPL content in `DashboardSection` with `type="fpl"`
2. Wrap favorite team content in `DashboardSection` with `type="team"`
3. Add preview content for each section
4. Add "View All" links

**Implementation**:
```tsx
import DashboardSection from '@/components/dashboard/DashboardSection';

// In component return
<div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 sm:space-y-10">
  {/* Fantasy Football Section */}
  <DashboardSection
    type="fpl"
    title="FANTASY FOOTBALL"
    subtitle="Manage your fantasy squad"
    icon="⚽"
    viewAllHref="/fantasy-football"
  >
    {/* Hero Stats */}
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <LiveRank team={team} history={history} />
      {/* Other stats */}
    </div>

    {/* Quick Actions */}
    <QuickActionsBar type="fpl" />

    {/* FPL News Preview */}
    <FPLNewsPreview limit={3} />

    {/* Analytics Preview */}
    <AnalyticsPreview type="fpl" limit={2} />

    {/* Leagues Preview */}
    <LeaguesPreview limit={2} />
  </DashboardSection>

  {/* My Team Section */}
  {user?.favorite_team_id && (
    <DashboardSection
      type="team"
      title="MY TEAM"
      subtitle={theme?.name || 'Follow your favorite club'}
      teamLogo={theme?.logo}
      teamName={theme?.name}
      viewAllHref="/my-team"
    >
      {/* Hero Stats */}
      <TeamHeroStats teamId={user.favorite_team_id} />

      {/* Fixtures Preview */}
      <FixturesPreview teamId={user.favorite_team_id} limit={3} />

      {/* Team News Preview */}
      <TeamNewsPreview teamId={user.favorite_team_id} limit={3} />

      {/* Analytics Preview */}
      <AnalyticsPreview type="team" limit={2} />
    </DashboardSection>
  )}
</div>
```

---

### 6. Create Fantasy Football Pages

**File Structure**:
```
frontend/src/app/fantasy-football/
  ├── page.tsx (Overview)
  ├── squad/page.tsx
  ├── transfers/page.tsx
  ├── captain/page.tsx
  ├── analytics/page.tsx
  ├── leagues/page.tsx
  └── news/page.tsx
```

**Page Template** (e.g., `fantasy-football/page.tsx`):
```tsx
import FPLPageHeader from '@/components/pages/FPLPageHeader';
import SubNavigation from '@/components/navigation/SubNavigation';

export default function FantasyFootballPage() {
  const subNavItems = [
    { label: 'Overview', href: '/fantasy-football', icon: '📊' },
    { label: 'Squad', href: '/fantasy-football/squad', icon: '⚽' },
    { label: 'Transfers', href: '/fantasy-football/transfers', icon: '🔄' },
    { label: 'Captain', href: '/fantasy-football/captain', icon: '👑' },
    { label: 'Analytics', href: '/fantasy-football/analytics', icon: '📈' },
    { label: 'Leagues', href: '/fantasy-football/leagues', icon: '🏆' },
    { label: 'News', href: '/fantasy-football/news', icon: '📰' },
  ];

  return (
    <div className="min-h-screen">
      <FPLPageHeader
        title="Fantasy Football"
        subtitle="Manage your fantasy squad"
      />
      <SubNavigation type="fpl" items={subNavItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page content */}
      </div>
    </div>
  );
}
```

---

### 7. Create My Team Pages

**File Structure**:
```
frontend/src/app/my-team/
  ├── page.tsx (Overview)
  ├── fixtures/page.tsx
  ├── news/page.tsx
  ├── standings/page.tsx
  └── analytics/page.tsx
```

**Page Template** (e.g., `my-team/page.tsx`):
```tsx
import TeamPageHeader from '@/components/pages/TeamPageHeader';
import SubNavigation from '@/components/navigation/SubNavigation';

export default function MyTeamPage() {
  const { theme } = useTeamTheme();
  const subNavItems = [
    { label: 'Overview', href: '/my-team', icon: '📊' },
    { label: 'Fixtures', href: '/my-team/fixtures', icon: '📅' },
    { label: 'News', href: '/my-team/news', icon: '📰' },
    { label: 'Standings', href: '/my-team/standings', icon: '📊' },
    { label: 'Analytics', href: '/my-team/analytics', icon: '📈' },
  ];

  return (
    <div className="min-h-screen">
      <TeamPageHeader
        title="My Team"
        subtitle={theme?.name || 'Follow your favorite club'}
        teamLogo={theme?.logo}
        teamName={theme?.name}
      />
      <SubNavigation type="team" items={subNavItems} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Page content */}
      </div>
    </div>
  );
}
```

---

### 8. Create FPL News Page

**File**: `frontend/src/app/fantasy-football/news/page.tsx`

**Implementation**:
```tsx
import FPLPageHeader from '@/components/pages/FPLPageHeader';
import FPLNewsFeed from '@/components/news/FPLNewsFeed';

export default function FPLNewsPage() {
  return (
    <div className="min-h-screen">
      <FPLPageHeader
        title="Fantasy Football News"
        subtitle="FPL squad player news and updates"
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <FPLNewsFeed />
      </div>
    </div>
  );
}
```

**FPLNewsFeed Component**:
- Filters: All, Injuries, Transfers, Price Changes, Gameweek
- News items: Player-focused, FPL-specific
- FPL green branding
- Different from team news

---

### 9. Separate Analytics Pages

**FPL Analytics** (`/fantasy-football/analytics`):
- Use existing `AnalyticsDashboard` component
- FPL green branding
- FPL-specific charts (points, rank, form, chips, etc.)

**Team Analytics** (`/my-team/analytics`):
- New `TeamAnalyticsDashboard` component
- Team color branding
- Team-specific charts (performance, goals, form, etc.)

---

## Component Structure

**New Components**:
```
frontend/src/components/
  ├── dashboard/
  │   └── DashboardSection.tsx (new)
  ├── navigation/
  │   ├── ExpandableNavSection.tsx (new)
  │   ├── Drawer.tsx (new)
  │   └── SubNavigation.tsx (new)
  ├── pages/
  │   ├── FPLPageHeader.tsx (new)
  │   └── TeamPageHeader.tsx (new)
  └── news/
      └── FPLNewsFeed.tsx (new)
```

**New Pages**:
```
frontend/src/app/
  ├── fantasy-football/
  │   ├── page.tsx (new)
  │   ├── squad/page.tsx (new)
  │   ├── transfers/page.tsx (new)
  │   ├── captain/page.tsx (new)
  │   ├── analytics/page.tsx (new)
  │   ├── leagues/page.tsx (new)
  │   └── news/page.tsx (new)
  └── my-team/
      ├── page.tsx (new)
      ├── fixtures/page.tsx (new)
      ├── news/page.tsx (new)
      ├── standings/page.tsx (new)
      └── analytics/page.tsx (new)
```

---

## Testing Requirements

### Visual Testing
- [ ] Two sections clearly visible on dashboard
- [ ] Visual separation (colors, borders) obvious
- [ ] Section headers clear and distinct
- [ ] Navigation structure clear
- [ ] Sub-menus expand/collapse correctly
- [ ] Mobile drawer works correctly
- [ ] All pages use consistent branding

### Functional Testing
- [ ] Navigation works correctly
- [ ] Sub-menus navigate to correct pages
- [ ] "View All" buttons work
- [ ] Dashboard previews show correct content
- [ ] FPL News page displays correctly
- [ ] Analytics pages separate correctly
- [ ] Mobile navigation works

### Accessibility Testing
- [ ] Keyboard navigation works
- [ ] Screen reader announces sections
- [ ] Focus states visible
- [ ] ARIA labels present
- [ ] Color contrast passes WCAG AA
- [ ] Touch targets adequate

---

## Migration Strategy

### Step 1: Create New Components (Non-Breaking)
- Create DashboardSection, ExpandableNavSection, etc.
- Test new components in isolation

### Step 2: Update Navigation (Feature Flag)
- Add feature flag for new navigation
- Show new navigation when flag enabled
- Keep old navigation as fallback

### Step 3: Create New Pages (Non-Breaking)
- Create all new pages
- Test pages individually
- Update routing

### Step 4: Restructure Dashboard (Feature Flag)
- Wrap sections in DashboardSection
- Add preview content
- Test thoroughly

### Step 5: Remove Old Code
- Remove old navigation
- Remove old dashboard structure
- Clean up unused code

---

## Success Criteria

Implementation is complete when:
- ✅ Dashboard shows two clear sections
- ✅ Navigation has expandable sub-menus
- ✅ All Fantasy Football pages exist and work
- ✅ All My Team pages exist and work
- ✅ FPL News page displays correctly
- ✅ Analytics pages are separate
- ✅ Mobile navigation works (drawer)
- ✅ All components responsive (320px - 1920px)
- ✅ WCAG AA compliance maintained
- ✅ All tests passing

---

## Questions or Issues?

If you encounter any issues or need clarification:

1. **Design Questions**: Refer to `docs/dashboard-restructure-design-spec.md`
2. **Requirements Questions**: Ask Product and Project Agent
3. **Technical Questions**: Use your best judgment, document decisions
4. **Navigation Questions**: Follow the expandable section pattern

---

## Next Steps

1. **Review Design Spec**: Read `docs/dashboard-restructure-design-spec.md` thoroughly
2. **Plan Implementation**: Break down into tasks, estimate effort
3. **Start Implementation**: Begin with DashboardSection component
4. **Test Continuously**: Test as you build
5. **Update All Pages**: Ensure consistency across entire app
6. **Hand off to Tester**: Create test plan when complete

---

**Good luck with implementation! 🚀**

**Remember**: Complete separation - FPL content in Fantasy Football section, favorite team content in My Team section. Make it instantly clear what's FPL vs favorite team!

---

**Handoff Complete!**


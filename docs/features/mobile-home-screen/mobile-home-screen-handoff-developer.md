# Mobile Home Screen Redesign - Developer Handoff

**Date**: 2025-12-21  
**From**: UI Designer Agent  
**To**: Developer Agent  
**Status**: ✅ Design Complete, Ready for Implementation  
**Priority**: P0 (Critical - Primary Conversion Surface)

---

## Overview

Complete implementation guide for the Fotmate home screen redesign. This document provides step-by-step instructions, code examples, and implementation details for both logged-out and logged-in states.

**⚠️ IMPORTANT**: See `mobile-home-screen-enhanced-design.md` for **ENHANCED** design specifications that make the logged-out homepage significantly more enticing and conversion-focused with animations, live data previews, and interactive elements.

**Reference Documents**:
- **Enhanced Design**: `mobile-home-screen-enhanced-design.md` ⭐ **START HERE**
- Design Specification: `mobile-home-screen-design-spec.md`
- Requirements: `mobile-home-screen-requirements.md`
- Design Brief: `mobile-home-screen-complete-design-brief.md`
- Current Implementation: `frontend/src/app/page.tsx`

---

## Design Specification

**Full Design Spec**: `docs/features/mobile-home-screen/mobile-home-screen-design-spec.md`

**Key Design Decisions**:
- Mobile-first approach with desktop optimization
- Text-focused hero (no large images for performance)
- 6 feature cards in responsive grid
- Sticky CTA on mobile (after scroll)
- Highly personalized logged-in dashboard
- News feed on logged-in dashboard only

---

## Implementation Tasks

### Task 1: Update Home Page Component Structure

**File**: `frontend/src/app/page.tsx`

**Current State**: Basic hero, features, and CTA sections. Not fully optimized for mobile-first design.

**Changes Needed**:
1. Restructure for logged-out vs logged-in states
2. Add sticky CTA component (mobile only)
3. Improve responsive breakpoints
4. Add logged-in dashboard sections

---

### Task 2: Create Feature Card Component

**File**: `frontend/src/components/home/FeatureCard.tsx` (new file)

**Purpose**: Reusable component for feature showcase cards

**Props Interface**:
```typescript
interface FeatureCardProps {
  icon: string; // Emoji or icon name
  title: string;
  description: string;
  color: string; // CSS variable for color
  href?: string; // Optional link
  premium?: boolean; // Show premium badge
}
```

**Implementation**:
```tsx
'use client';

import Link from 'next/link';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  href?: string;
  premium?: boolean;
}

export default function FeatureCard({
  icon,
  title,
  description,
  color,
  href,
  premium = false,
}: FeatureCardProps) {
  const cardContent = (
    <div className="glass rounded-xl p-6 hover:scale-[1.02] hover:border-[var(--pl-green)]/50 transition-all">
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4"
        style={{ background: `${color}20` }}
      >
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-[var(--pl-text-muted)] mb-3">{description}</p>
      {premium && (
        <span className="inline-block px-2 py-1 rounded bg-[var(--pl-purple)]/30 text-[var(--pl-purple)] text-xs font-medium mb-3">
          Premium
        </span>
      )}
      {href && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 text-[var(--pl-green)] hover:underline text-sm font-medium"
        >
          Learn More
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)] rounded-xl">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}
```

---

### Task 3: Create Quick Action Button Component

**File**: `frontend/src/components/home/QuickActionButton.tsx` (new file)

**Purpose**: Reusable component for quick action buttons in logged-in dashboard

**Props Interface**:
```typescript
interface QuickActionButtonProps {
  icon: string; // Emoji or icon name
  label: string;
  href: string;
  badge?: number; // Optional notification badge
}
```

**Implementation**:
```tsx
'use client';

import Link from 'next/link';

interface QuickActionButtonProps {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

export default function QuickActionButton({
  icon,
  label,
  href,
  badge,
}: QuickActionButtonProps) {
  return (
    <Link
      href={href}
      className="relative flex flex-col items-center gap-2 p-4 glass rounded-xl min-w-[80px] hover:bg-[var(--pl-card-hover)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
    >
      {badge && badge > 0 && (
        <span className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--pl-pink)] text-white text-xs flex items-center justify-center font-bold">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      <span className="text-2xl" aria-hidden="true">{icon}</span>
      <span className="text-xs font-medium text-center">{label}</span>
    </Link>
  );
}
```

---

### Task 4: Create Stats Card Component

**File**: `frontend/src/components/home/StatsCard.tsx` (new file)

**Purpose**: Reusable component for displaying stats (social proof, user stats)

**Props Interface**:
```typescript
interface StatsCardProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
```

**Implementation**:
```tsx
'use client';

interface StatsCardProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function StatsCard({
  value,
  label,
  trend,
  trendValue,
}: StatsCardProps) {
  const trendColor =
    trend === 'up'
      ? 'text-[var(--pl-green)]'
      : trend === 'down'
      ? 'text-[var(--pl-pink)]'
      : 'text-[var(--pl-text-muted)]';

  return (
    <div className="text-center">
      <div className="text-2xl sm:text-3xl font-bold text-gradient-primary mb-1">
        {value}
      </div>
      <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-1">
        {label}
      </div>
      {trend && trendValue && (
        <div className={`text-xs ${trendColor} flex items-center justify-center gap-1`}>
          {trend === 'up' && '↑'}
          {trend === 'down' && '↓'}
          {trendValue}
        </div>
      )}
    </div>
  );
}
```

---

### Task 5: Create Sticky CTA Component (Mobile Only)

**File**: `frontend/src/components/home/StickyCTA.tsx` (new file)

**Purpose**: Sticky CTA button that appears at bottom of viewport on mobile after scrolling past hero

**Implementation**:
```tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface StickyCTAProps {
  showAfterScroll?: number; // Pixels to scroll before showing
  hideAtSelector?: string; // CSS selector to hide when reached
}

export default function StickyCTA({
  showAfterScroll = 400,
  hideAtSelector,
}: StickyCTAProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldHide, setShouldHide] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      const isPastThreshold = scrollY > showAfterScroll;

      // Check if we've reached the hide selector
      if (hideAtSelector) {
        const element = document.querySelector(hideAtSelector);
        if (element) {
          const elementTop = element.getBoundingClientRect().top + window.scrollY;
          const elementBottom = elementTop + element.offsetHeight;
          const isPastElement = scrollY >= elementTop - window.innerHeight;
          setShouldHide(isPastElement && scrollY < elementBottom);
        }
      }

      setIsVisible(isPastThreshold && !shouldHide);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [showAfterScroll, hideAtSelector, shouldHide]);

  // Only show on mobile (hide on desktop)
  if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
    return null;
  }

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--pl-dark)] border-t border-white/10 p-4 shadow-lg md:hidden">
      <Link
        href="/register"
        className="btn-primary w-full text-center text-lg py-3 block"
      >
        Get Started for Free
      </Link>
    </div>
  );
}
```

---

### Task 6: Create Logged-In Dashboard Header Component

**File**: `frontend/src/components/home/DashboardHeader.tsx` (new file)

**Purpose**: Personalized header for logged-in users showing greeting and quick stats

**Props Interface**:
```typescript
interface DashboardHeaderProps {
  userName: string;
  rank?: number;
  points?: number;
  gameweek?: number;
}
```

**Implementation**:
```tsx
'use client';

interface DashboardHeaderProps {
  userName: string;
  rank?: number;
  points?: number;
  gameweek?: number;
}

export default function DashboardHeader({
  userName,
  rank,
  points,
  gameweek,
}: DashboardHeaderProps) {
  const formatRank = (rank?: number) => {
    if (!rank) return 'N/A';
    return `#${rank.toLocaleString()}`;
  };

  const formatPoints = (points?: number) => {
    if (!points) return 'N/A';
    return points.toLocaleString();
  };

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-2xl font-bold mb-4">
        Welcome back, {userName}
      </h2>
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-primary mb-1">
            {formatRank(rank)}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Rank</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-primary mb-1">
            {formatPoints(points)}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Points</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-gradient-primary mb-1">
            GW {gameweek || 'N/A'}
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Gameweek</div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 7: Create Quick Actions Bar Component

**File**: `frontend/src/components/home/QuickActionsBar.tsx` (new file)

**Purpose**: Horizontal scrollable bar of quick action buttons

**Implementation**:
```tsx
'use client';

import QuickActionButton from './QuickActionButton';

export default function QuickActionsBar() {
  const actions = [
    { icon: '👥', label: 'Squad', href: '/dashboard' },
    { icon: '🔄', label: 'Transfer', href: '/fantasy-football/transfers' },
    { icon: '📅', label: 'Fixtures', href: '/fantasy-football/fixtures' },
    { icon: '📰', label: 'News', href: '/dashboard#news' },
    { icon: '📊', label: 'Analytics', href: '/fantasy-football/analytics' },
  ];

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
      {actions.map((action) => (
        <QuickActionButton
          key={action.href}
          icon={action.icon}
          label={action.label}
          href={action.href}
        />
      ))}
    </div>
  );
}
```

---

### Task 8: Update Home Page Implementation

**File**: `frontend/src/app/page.tsx`

**Key Changes**:

1. **Import new components**:
```tsx
import FeatureCard from '@/components/home/FeatureCard';
import QuickActionButton from '@/components/home/QuickActionButton';
import QuickActionsBar from '@/components/home/QuickActionsBar';
import DashboardHeader from '@/components/home/DashboardHeader';
import StatsCard from '@/components/home/StatsCard';
import StickyCTA from '@/components/home/StickyCTA';
```

2. **Restructure for logged-out vs logged-in**:
```tsx
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Logged-in users: Show dashboard
  if (user) {
    return <LoggedInDashboard user={user} />;
  }

  // Logged-out users: Show marketing home page
  return <LoggedOutHomePage />;
}
```

3. **Logged-Out Home Page Structure**:
```tsx
function LoggedOutHomePage() {
  return (
    <div className="min-h-screen">
      <TopNavigation
        showFavoriteTeam={false}
        showNotifications={false}
        showLinkFPL={false}
      />

      {/* Hero Section */}
      <HeroSection />

      {/* Feature Showcase */}
      <FeatureShowcase />

      {/* Final CTA Section */}
      <FinalCTASection />

      {/* Sticky CTA (Mobile Only) */}
      <StickyCTA hideAtSelector="#final-cta" />

      <Footer />
    </div>
  );
}
```

4. **Logged-In Dashboard Structure**:
```tsx
function LoggedInDashboard({ user }: { user: User }) {
  return (
    <div className="min-h-screen">
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* Personalized Header */}
        <DashboardHeader
          userName={user.name || user.email}
          rank={user.rank}
          points={user.points}
          gameweek={user.current_gameweek}
        />

        {/* Quick Actions Bar */}
        <div className="mt-6">
          <QuickActionsBar />
        </div>

        {/* Personalized Insights */}
        <PersonalizedInsights user={user} />

        {/* News Feed */}
        <NewsFeedSection />

        {/* Feature Cards */}
        <FeatureCardsGrid />
      </div>
    </div>
  );
}
```

---

## Feature Data

### Feature Cards (6 Total)

```typescript
const features = [
  {
    icon: '🤖',
    title: 'AI Transfer Assistant',
    description: 'Get personalized transfer recommendations based on form, fixtures, and value.',
    color: 'var(--pl-green)',
    href: '/fantasy-football/transfers',
  },
  {
    icon: '👑',
    title: 'Captaincy Optimizer',
    description: 'Never miss a captaincy pick with our xG-based predictions.',
    color: 'var(--pl-pink)',
    href: '/fantasy-football/captain',
  },
  {
    icon: '📊',
    title: 'Team Rating',
    description: 'See how your squad scores against the ideal team structure.',
    color: 'var(--pl-cyan)',
    href: '/fantasy-football/analytics',
  },
  {
    icon: '📅',
    title: 'Fixture Planner',
    description: 'Visual fixture difficulty ratings for the next 8 gameweeks.',
    color: 'var(--pl-green)',
    href: '/fantasy-football/fixtures',
  },
  {
    icon: '💰',
    title: 'Price Predictions',
    description: 'Stay ahead of price changes with our prediction model.',
    color: 'var(--pl-pink)',
    href: '/fantasy-football/transfers',
  },
  {
    icon: '🏆',
    title: 'Mini-League Insights',
    description: 'Analyze your rivals and find your competitive edge.',
    color: 'var(--pl-cyan)',
    href: '/fantasy-football/leagues',
  },
];
```

---

## Responsive Breakpoints

### Tailwind CSS Breakpoints
- **Mobile**: Default (320px+)
- **Tablet**: `sm:` (640px+), `md:` (768px+)
- **Desktop**: `lg:` (1024px+)
- **Large Desktop**: `xl:` (1280px+), `2xl:` (1536px+)

### Implementation
- Use mobile-first approach (default styles for mobile)
- Add `sm:`, `md:`, `lg:` prefixes for larger screens
- Test at: 320px, 768px, 1024px, 1920px

---

## Styling Guidelines

### Use Existing Classes
- `glass` - Glass morphism card
- `btn-primary` - Primary button
- `btn-secondary` - Secondary button
- `text-gradient-primary` - Gradient text

### Spacing
- Section padding: `py-12 sm:py-16 lg:py-20`
- Card padding: `p-6 sm:p-8`
- Gap between elements: `gap-4 sm:gap-6`

### Typography
- Hero headline: `text-3xl sm:text-4xl lg:text-5xl font-bold`
- Section title: `text-2xl sm:text-3xl lg:text-4xl font-bold`
- Card title: `text-xl sm:text-2xl font-semibold`

---

## Testing Checklist

### Responsive Design
- [ ] Mobile (320px) - All sections render correctly
- [ ] Tablet (768px) - Grid layouts work
- [ ] Desktop (1024px) - Multi-column layouts work
- [ ] Large Desktop (1920px) - Max-width containers work

### Logged-Out State
- [ ] Hero section displays correctly
- [ ] Feature showcase shows all 6 features
- [ ] CTAs are prominent and accessible
- [ ] Sticky CTA appears after scroll (mobile)
- [ ] Sticky CTA hides at final CTA section
- [ ] Social proof stats display correctly

### Logged-In State
- [ ] Personalized header shows user data
- [ ] Quick actions bar is scrollable (mobile)
- [ ] Quick actions bar shows all actions (desktop)
- [ ] Personalized insights show real data
- [ ] News feed displays correctly
- [ ] Feature cards are accessible

### Interactions
- [ ] Buttons have hover states (desktop)
- [ ] Cards have hover states (desktop)
- [ ] Touch targets are 44x44pt minimum (mobile)
- [ ] All links work correctly
- [ ] Sticky CTA shows/hides correctly

### Accessibility
- [ ] WCAG AA contrast ratios met
- [ ] Keyboard navigation works
- [ ] Screen reader labels present
- [ ] Touch targets meet minimum size

### Performance
- [ ] Page loads in < 2 seconds
- [ ] Images are optimized
- [ ] Smooth scrolling (60fps)
- [ ] No layout shifts

---

## Files to Create

1. `frontend/src/components/home/FeatureCard.tsx`
2. `frontend/src/components/home/QuickActionButton.tsx`
3. `frontend/src/components/home/QuickActionsBar.tsx`
4. `frontend/src/components/home/StatsCard.tsx`
5. `frontend/src/components/home/StickyCTA.tsx`
6. `frontend/src/components/home/DashboardHeader.tsx`

## Files to Modify

1. `frontend/src/app/page.tsx` - Restructure for logged-out/logged-in states

---

## Dependencies

### Existing Components
- `Logo` component (existing)
- `TopNavigation` component (existing)
- `BottomNavigation` component (existing, mobile)
- `PersonalizedNewsFeed` component (existing, logged-in dashboard)

### Hooks
- `useAuth()` - Get user authentication state

### API Integration
- User data (for logged-in dashboard)
- FPL team data (for personalized insights)
- News feed (for logged-in dashboard)

---

## Implementation Priority

### Phase 1: MVP (Week 1-2)
1. ✅ Create new components (FeatureCard, StatsCard, etc.)
2. ✅ Restructure home page for logged-out/logged-in states
3. ✅ Implement logged-out home page (hero, features, CTA)
4. ✅ Add sticky CTA (mobile only)
5. ✅ Mobile responsiveness (320px - 767px)

### Phase 2: Logged-In Dashboard (Week 2-3)
1. ✅ Implement logged-in dashboard header
2. ✅ Implement quick actions bar
3. ✅ Integrate personalized insights
4. ✅ Integrate news feed
5. ✅ Feature cards grid

### Phase 3: Desktop Optimization (Week 3-4)
1. ✅ Tablet optimization (768px - 1023px)
2. ✅ Desktop optimization (1024px+)
3. ✅ Hover states and interactions
4. ✅ Performance optimization

---

## Next Steps

1. **Review this handoff** - Understand all requirements
2. **Create components** - Build new components first
3. **Update home page** - Restructure for logged-out/logged-in
4. **Test responsive** - Verify all breakpoints
5. **Test interactions** - Verify hover states, CTAs, etc.
6. **Test accessibility** - Verify WCAG AA compliance
7. **Performance test** - Verify load times and smooth scrolling

---

**Handoff Complete** ✅  
**Ready for Implementation** 🚀


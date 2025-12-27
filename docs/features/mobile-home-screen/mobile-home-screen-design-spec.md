# Mobile Home Screen Redesign - Design Specifications

**Date**: 2025-12-21  
**Designer**: UI Designer Agent  
**Status**: ✅ Design Complete  
**Priority**: P0 (Critical - Primary Conversion Surface)  
**For**: Developer Agent

---

## Overview

Complete design specifications for the Fotmate home screen redesign. This document provides detailed layouts, component specs, responsive breakpoints, and implementation guidance for both logged-out and logged-in states.

**⚠️ IMPORTANT**: For a more enticing and conversion-focused logged-out homepage, see **`mobile-home-screen-enhanced-design.md`** which includes:
- Animated hero section with gradient backgrounds
- Live data previews (blurred/locked)
- Interactive feature cards with scroll animations
- Social proof section with testimonials
- App screenshot carousel
- Rich micro-interactions and visual effects

**Reference Documents**:
- **Enhanced Design**: `mobile-home-screen-enhanced-design.md` ⭐ **RECOMMENDED**
- Enhancement Summary: `mobile-home-screen-enhancements-summary.md`
- Requirements: `mobile-home-screen-requirements.md`
- Design Brief: `mobile-home-screen-complete-design-brief.md`
- Current Implementation: `frontend/src/app/page.tsx`

---

## Design Principles

### Mobile-First with Desktop Optimization
- **Start with mobile** (320px width)
- **Expand to larger screens** (tablet, desktop, large desktop)
- **Touch-optimized** (mobile: 44x44pt minimum touch targets)
- **Mouse-optimized** (desktop: hover states, click targets)
- **Thumb-friendly** (mobile: key actions within thumb reach)
- **Desktop-optimized** (utilize screen real estate, multi-column layouts)

### Conversion-Focused
- **Clear value proposition** (5-second rule)
- **Prominent CTAs** (sign-up buttons)
- **Reduce friction** (minimal steps to sign-up)
- **Build trust** (social proof, clear messaging)

### Football-Native
- **Football imagery** (not generic stock photos)
- **Football terminology** (use FPL/PL terms)
- **Football colors** (team colors, green pitch, etc.)
- **Football context** (match days, gameweeks, etc.)

### Clean & Modern
- **No clutter** (white space, clear sections)
- **Visual hierarchy** (most important first)
- **Scannable** (cards, lists, clear structure)
- **Fast** (optimize for performance)

---

## Design Answers

### 1. Hero Section
**Answer**: Text-focused with optional subtle background gradient. No large images to keep load time fast. Use football-themed icons/illustrations sparingly.

### 2. Feature Cards
**Answer**: 3 features above the fold on mobile, 6 features on desktop. Use grid layout: 1 column (mobile) → 2 columns (tablet) → 3 columns (desktop).

### 3. CTA Placement
**Answer**: 
- **Mobile**: Sticky CTA at bottom (after scroll), plus inline CTAs
- **Desktop**: Inline CTAs only (no sticky needed)

### 4. Social Proof
**Answer**: Integrated into hero section (stats badges) and optional testimonial section below features.

### 5. Logged-In Dashboard
**Answer**: Highly personalized with user's FPL team data, favorite team info, and actionable insights. Show real data, not generic placeholders.

### 6. News Integration
**Answer**: News appears on logged-in dashboard only (personalized feed). Not on logged-out home screen.

### 7. Premium Features
**Answer**: Display as "Coming Soon" badges on feature cards. Optional dedicated section below main features (clearly labeled as premium).

### 8. Desktop Layout
**Answer**: 
- **Hero**: Side-by-side layout (text left, visual right)
- **Features**: 3-column grid
- **Dashboard**: Multi-column layout with side-by-side cards

### 9. Navigation
**Answer**: 
- **Mobile**: Bottom navigation (existing BottomNavigation component)
- **Desktop**: Top navigation + side navigation (existing TopNavigation + SideNavigation)

### 10. Content Density
**Answer**: 
- **Mobile**: Focused, scannable, minimal (1-2 key metrics per card)
- **Desktop**: More information visible (3-4 metrics per card, side-by-side comparisons)

---

## Logged-Out Home Screen Design

### Layout Structure

```
┌─────────────────────────────────┐
│ TopNavigation (minimal)          │
├─────────────────────────────────┤
│                                 │
│ HERO SECTION                    │
│ - Logo                          │
│ - Value Prop Headline           │
│ - Supporting Copy               │
│ - Primary CTA                  │
│ - Secondary CTA                │
│ - Social Proof Stats            │
│                                 │
├─────────────────────────────────┤
│                                 │
│ FEATURE SHOWCASE                │
│ - 6 Feature Cards (grid)        │
│   - Icon                        │
│   - Title                       │
│   - Description                 │
│   - Learn More link             │
│                                 │
├─────────────────────────────────┤
│                                 │
│ FINAL CTA SECTION               │
│ - Reinforce Value Prop          │
│ - Get Started Button            │
│                                 │
├─────────────────────────────────┤
│ Footer                          │
└─────────────────────────────────┘
```

---

### Section 1: Hero Section

#### Mobile Layout (320px - 767px)

**Structure**:
```
┌─────────────────────────────┐
│ [Fotmate Logo - centered]   │
│                             │
│ Your Complete               │
│ Football Companion          │
│                             │
│ [Supporting copy text]      │
│                             │
│ [Start Free Trial] (primary)│
│ [Learn More] (secondary)    │
│                             │
│ 50K+   85%    4.9★         │
│ Active  Acc.   Rating      │
│ Managers Rate               │
└─────────────────────────────┘
```

**Spacing**:
- Top padding: `pt-16 sm:pt-20` (64px mobile, 80px tablet+)
- Bottom padding: `pb-12 sm:pb-16` (48px mobile, 64px tablet+)
- Horizontal padding: `px-4 sm:px-6` (16px mobile, 24px tablet+)
- Logo margin bottom: `mb-6` (24px)
- Headline margin bottom: `mb-4` (16px)
- Copy margin bottom: `mb-6` (24px)
- CTA buttons gap: `gap-3` (12px)
- Stats section margin top: `mt-8` (32px)

**Typography**:
- Logo: Use `<Logo variant="full" color="full" size={120} />` (mobile), `size={140}` (tablet+)
- Headline: `text-3xl sm:text-4xl font-bold` (30px mobile, 36px tablet+)
- Supporting copy: `text-base sm:text-lg text-[var(--pl-text-muted)]` (16px mobile, 18px tablet+)
- CTA buttons: `text-base sm:text-lg font-semibold` (16px mobile, 18px tablet+)
- Stats numbers: `text-2xl sm:text-3xl font-bold text-gradient-primary` (24px mobile, 30px tablet+)
- Stats labels: `text-xs sm:text-sm text-[var(--pl-text-muted)]` (12px mobile, 14px tablet+)

**Colors**:
- Headline: `text-white` (default), `text-gradient-primary` for "Football Companion"
- Primary CTA: `btn-primary` (green background, white text)
- Secondary CTA: `btn-secondary` (outline, green border/text)
- Stats: Use gradient text for numbers

**Components**:
- Logo: `<Logo variant="full" color="full" size={120} />`
- Primary CTA: `<Link href="/register" className="btn-primary">Start Free Trial</Link>`
- Secondary CTA: `<Link href="#features" className="btn-secondary">Learn More</Link>`
- Stats: Custom component with numbers and labels

---

#### Desktop Layout (1024px+)

**Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│ [Fotmate Logo - top left]                                   │
│                                                             │
│ ┌──────────────────────┐  ┌─────────────────────────────┐ │
│ │ Your Complete        │  │ [Visual Preview Card]        │ │
│ │ Football Companion   │  │ - AI Transfer Example       │ │
│ │                      │  │ - Blurred/Locked            │ │
│ │ [Supporting copy]    │  │ - "Sign up to unlock"       │ │
│ │                      │  │                             │ │
│ │ [Start Free Trial]   │  │                             │ │
│ │ [Learn More]         │  │                             │ │
│ │                      │  │                             │ │
│ │ 50K+  85%  4.9★     │  │                             │ │
│ └──────────────────────┘  └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Layout**:
- Grid: `grid lg:grid-cols-2 gap-12 items-center`
- Max width: `max-w-7xl mx-auto`
- Text column: Left side
- Visual column: Right side (optional preview card)

**Visual Preview Card** (Right Side):
- Glass card with blurred/locked content
- Shows example AI transfer suggestion
- "Sign up to unlock" overlay
- Subtle gradient background

---

### Section 2: Feature Showcase

#### Mobile Layout (320px - 767px)

**Structure**:
```
┌─────────────────────────────┐
│ Powerful Features           │
│ [Subtitle text]             │
│                             │
│ ┌─────────────────────────┐ │
│ │ 🤖                      │ │
│ │ AI Transfer Assistant   │ │
│ │ [Description]           │ │
│ │ Learn More →            │ │
│ └─────────────────────────┘ │
│                             │
│ [Repeat for 6 features]     │
└─────────────────────────────┘
```

**Grid**:
- Single column: `grid grid-cols-1 gap-6`
- Card padding: `p-6` (24px)
- Card spacing: `gap-6` (24px between cards)

**Card Design**:
- Background: `glass` (glass morphism)
- Border radius: `rounded-xl` (12px)
- Icon size: `w-14 h-14` (56px)
- Icon background: Color with 20% opacity
- Title: `text-xl font-semibold mb-2`
- Description: `text-[var(--pl-text-muted)]`
- Learn More link: `text-[var(--pl-green)] hover:underline`

**Feature Cards** (6 total):
1. **AI Transfer Assistant** - `var(--pl-green)`
2. **Captaincy Optimizer** - `var(--pl-pink)`
3. **Team Rating** - `var(--pl-cyan)`
4. **Fixture Planner** - `var(--pl-green)`
5. **Price Predictions** - `var(--pl-pink)`
6. **Mini-League Insights** - `var(--pl-cyan)`

---

#### Tablet Layout (768px - 1023px)

**Grid**:
- 2 columns: `grid md:grid-cols-2 gap-6`
- Same card design as mobile

---

#### Desktop Layout (1024px+)

**Grid**:
- 3 columns: `grid lg:grid-cols-3 gap-6`
- Max width: `max-w-7xl mx-auto`
- Card hover: `hover:scale-[1.02] transition-transform`
- Card hover border: `hover:border-[var(--pl-green)]/50`

---

### Section 3: Final CTA Section

#### Mobile Layout (320px - 767px)

**Structure**:
```
┌─────────────────────────────┐
│ Ready to Climb Rankings?    │
│ [Supporting text]           │
│                             │
│ [Get Started for Free]      │
│                             │
│ "No credit card required"    │
└─────────────────────────────┘
```

**Design**:
- Glass card with gradient overlay
- Centered text
- Large CTA button
- Trust message below button

**Styling**:
- Background: `glass rounded-3xl p-8 sm:p-12`
- Gradient overlay: `bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] opacity-20`
- Title: `text-3xl sm:text-4xl font-bold mb-4`
- Supporting text: `text-lg sm:text-xl text-[var(--pl-text-muted)] mb-8`
- CTA button: `btn-primary text-lg px-10 py-4`
- Trust message: `text-sm text-[var(--pl-text-muted)] mt-4`

---

#### Desktop Layout (1024px+)

**Layout**:
- Max width: `max-w-4xl mx-auto`
- Same design, larger padding

---

### Sticky CTA (Mobile Only)

**Position**: Fixed at bottom of viewport

**Design**:
```
┌─────────────────────────────┐
│ [Get Started for Free]      │
└─────────────────────────────┘
```

**Styling**:
- Position: `fixed bottom-0 left-0 right-0 z-50`
- Background: `bg-[var(--pl-dark)] border-t border-white/10`
- Padding: `p-4`
- Button: Full width, `btn-primary`
- Shadow: `shadow-lg`

**Behavior**:
- Show after user scrolls past hero section
- Hide when user reaches final CTA section
- Smooth show/hide animation

---

## Logged-In Dashboard Design

### Layout Structure

```
┌─────────────────────────────────┐
│ TopNavigation                   │
├─────────────────────────────────┤
│                                 │
│ PERSONALIZED HEADER             │
│ - Greeting                      │
│ - Quick Stats                   │
│                                 │
├─────────────────────────────────┤
│                                 │
│ QUICK ACTIONS BAR               │
│ [View Squad] [Transfer] [etc]  │
│                                 │
├─────────────────────────────────┤
│                                 │
│ PERSONALIZED INSIGHTS           │
│ - AI Transfer Recommendation    │
│ - Captaincy Suggestion          │
│ - Upcoming Fixtures             │
│                                 │
├─────────────────────────────────┤
│                                 │
│ NEWS FEED                       │
│ - Personalized News             │
│                                 │
├─────────────────────────────────┤
│                                 │
│ FEATURE CARDS                   │
│ - Analytics                     │
│ - Leagues                       │
│ - Settings                      │
│                                 │
└─────────────────────────────────┘
```

---

### Section 1: Personalized Header

#### Mobile Layout (320px - 767px)

**Structure**:
```
┌─────────────────────────────┐
│ Welcome back, [Name]        │
│                             │
│ Rank: #12,345               │
│ Points: 1,234               │
│ Gameweek: 15                │
└─────────────────────────────┘
```

**Design**:
- Glass card
- Greeting with user name
- Quick stats in grid (3 columns)

**Styling**:
- Card: `glass rounded-xl p-6`
- Greeting: `text-2xl font-bold mb-4`
- Stats grid: `grid grid-cols-3 gap-4`
- Stat label: `text-xs text-[var(--pl-text-muted)]`
- Stat value: `text-lg font-bold`

---

#### Desktop Layout (1024px+)

**Layout**:
- Horizontal layout: Stats side-by-side
- Larger spacing
- Optional: Profile avatar on right

---

### Section 2: Quick Actions Bar

#### Mobile Layout (320px - 767px)

**Structure**:
```
┌─────────────────────────────┐
│ [View Squad] [Transfer]     │
│ [Fixtures] [News] [More]    │
└─────────────────────────────┘
```

**Design**:
- Horizontal scrollable bar
- Icon + label buttons
- Touch-friendly (44x44pt minimum)

**Styling**:
- Container: `flex gap-3 overflow-x-auto pb-2`
- Button: `flex flex-col items-center gap-2 p-4 glass rounded-xl min-w-[80px]`
- Icon: `text-2xl`
- Label: `text-xs font-medium`
- Active state: `border-2 border-[var(--pl-green)]`

**Actions**:
1. View Squad - Link to `/dashboard`
2. Make Transfer - Link to `/fantasy-football/transfers`
3. Check Fixtures - Link to `/fantasy-football/fixtures`
4. View News - Link to `/dashboard` (scroll to news)
5. More - Expandable menu

---

#### Desktop Layout (1024px+)

**Layout**:
- No horizontal scroll needed
- All actions visible
- Hover states: `hover:bg-[var(--pl-card-hover)]`

---

### Section 3: Personalized Insights

#### Mobile Layout (320px - 767px)

**Structure**:
```
┌─────────────────────────────┐
│ AI Transfer Recommendation  │
│ [Transfer card]            │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Captaincy Suggestion        │
│ [Captain card]              │
└─────────────────────────────┘

┌─────────────────────────────┐
│ Upcoming Fixtures           │
│ [Fixture cards]             │
└─────────────────────────────┘
```

**Card Design**:
- Glass cards
- Section headers with icons
- Action buttons
- Real data (not placeholders)

**Styling**:
- Card: `glass rounded-xl p-6 mb-6`
- Header: `text-lg font-semibold mb-4 flex items-center gap-2`
- Icon: `text-xl`
- Content: Varies by card type
- Action button: `btn-primary text-sm px-4 py-2`

---

#### Desktop Layout (1024px+)

**Layout**:
- 2-column grid for insights
- Side-by-side cards
- More information visible

---

### Section 4: News Feed

**Component**: Use existing `PersonalizedNewsFeed` component

**Styling**:
- Glass card container
- Section header
- News cards below

---

### Section 5: Feature Cards

**Grid**:
- Mobile: 2 columns
- Desktop: 3 columns

**Cards**:
- Analytics
- Leagues
- Settings
- (More as needed)

---

## Responsive Breakpoints

### Mobile: 320px - 767px
- **Layout**: Single column, stacked sections
- **Navigation**: Bottom navigation
- **Touch targets**: 44x44pt minimum
- **Typography**: Smaller sizes (text-base, text-lg)
- **Spacing**: Tighter padding (p-4, p-6)
- **Grid**: 1 column

### Tablet: 768px - 1023px
- **Layout**: 2-column grid where appropriate
- **Navigation**: Bottom nav or side nav (contextual)
- **Touch targets**: 44x44pt minimum
- **Typography**: Medium sizes (text-lg, text-xl)
- **Spacing**: Medium padding (p-6, p-8)
- **Grid**: 2 columns

### Desktop: 1024px - 1919px
- **Layout**: Multi-column (3-4 columns), side-by-side
- **Navigation**: Top navigation + side navigation
- **Click targets**: Standard sizes
- **Typography**: Larger sizes (text-xl, text-2xl)
- **Spacing**: Larger padding (p-8, p-12)
- **Grid**: 3 columns
- **Hover states**: Enabled
- **Keyboard navigation**: Enabled

### Large Desktop: 1920px+
- **Layout**: Max-width container (1440px-1920px), centered
- **Navigation**: Top navigation + side navigation
- **Content width**: Max-width container
- **Grid**: 3-4 columns (depending on content)

---

## Component Specifications

### Feature Card Component

**Props**:
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

**Styling**:
- Container: `glass rounded-xl p-6`
- Icon container: `w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4`
- Icon background: `${color}20` (20% opacity)
- Title: `text-xl font-semibold mb-2`
- Description: `text-[var(--pl-text-muted)]`
- Premium badge: `px-2 py-1 rounded bg-[var(--pl-purple)]/30 text-[var(--pl-purple)] text-xs`

**Hover States** (Desktop):
- Scale: `hover:scale-[1.02] transition-transform`
- Border: `hover:border-[var(--pl-green)]/50`

---

### Quick Action Button Component

**Props**:
```typescript
interface QuickActionButtonProps {
  icon: string; // Emoji or icon name
  label: string;
  href: string;
  badge?: number; // Optional notification badge
}
```

**Styling**:
- Container: `flex flex-col items-center gap-2 p-4 glass rounded-xl min-w-[80px]`
- Icon: `text-2xl`
- Label: `text-xs font-medium`
- Badge: `absolute top-2 right-2 w-5 h-5 rounded-full bg-[var(--pl-pink)] text-white text-xs flex items-center justify-center`

---

### Stats Card Component

**Props**:
```typescript
interface StatsCardProps {
  value: string | number;
  label: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
```

**Styling**:
- Container: `text-center`
- Value: `text-2xl sm:text-3xl font-bold text-gradient-primary`
- Label: `text-xs sm:text-sm text-[var(--pl-text-muted)]`
- Trend: `text-xs` with color (green for up, red for down)

---

## Color Usage

### Primary Colors
- **Primary CTA**: `var(--pl-green)` (green)
- **Secondary CTA**: Outline with `var(--pl-green)` border/text
- **Accent**: `var(--pl-pink)` (pink) for highlights
- **Secondary**: `var(--pl-cyan)` (cyan) for secondary elements
- **Tertiary**: `var(--pl-purple)` (purple) for premium/optional

### Text Colors
- **Primary text**: `text-white` or `text-[var(--pl-text)]`
- **Muted text**: `text-[var(--pl-text-muted)]`
- **Gradient text**: `text-gradient-primary` (green to cyan)

### Background Colors
- **Card background**: `glass` (glass morphism)
- **Hover background**: `bg-[var(--pl-card-hover)]`
- **Gradient overlays**: Use brand colors with 20% opacity

---

## Typography

### Headings
- **H1 (Hero)**: `text-3xl sm:text-4xl lg:text-5xl font-bold` (30px → 36px → 48px)
- **H2 (Section)**: `text-2xl sm:text-3xl lg:text-4xl font-bold` (24px → 30px → 36px)
- **H3 (Card Title)**: `text-xl sm:text-2xl font-semibold` (20px → 24px)

### Body Text
- **Large**: `text-lg sm:text-xl` (18px → 20px)
- **Base**: `text-base sm:text-lg` (16px → 18px)
- **Small**: `text-sm sm:text-base` (14px → 16px)
- **XSmall**: `text-xs sm:text-sm` (12px → 14px)

### Line Heights
- **Headings**: `leading-tight` (1.2)
- **Body**: `leading-normal` (1.5)

---

## Spacing System

### Padding
- **Small**: `p-4` (16px)
- **Medium**: `p-6` (24px)
- **Large**: `p-8` (32px)
- **XLarge**: `p-12` (48px)

### Margins
- **Section spacing**: `py-12 sm:py-16 lg:py-20` (48px → 64px → 80px)
- **Card spacing**: `gap-4 sm:gap-6` (16px → 24px)
- **Element spacing**: `mb-4 sm:mb-6` (16px → 24px)

---

## Interaction States

### Buttons

**Primary Button**:
- Default: `bg-[var(--pl-green)] text-white`
- Hover: `hover:bg-[var(--pl-green)]/90`
- Active: `active:scale-95`
- Disabled: `opacity-50 cursor-not-allowed`

**Secondary Button**:
- Default: `border-2 border-[var(--pl-green)] text-[var(--pl-green)]`
- Hover: `hover:bg-[var(--pl-green)]/10`
- Active: `active:scale-95`

### Cards

**Default**:
- Background: `glass`
- Border: None (or subtle border)

**Hover** (Desktop):
- Scale: `hover:scale-[1.02] transition-transform`
- Border: `hover:border-[var(--pl-green)]/50`
- Background: `hover:bg-[var(--pl-card-hover)]`

**Active** (Mobile):
- Scale: `active:scale-95`

---

## Loading States

### Skeleton Screens
- Use skeleton placeholders for async content
- Match card structure
- Animate with pulse effect

**Styling**:
- Background: `bg-[var(--pl-card)] animate-pulse`
- Border radius: Match card radius
- Height: Match content height

---

## Empty States

### No Data
- Icon or illustration
- Message explaining empty state
- Optional CTA to take action

**Styling**:
- Centered content
- Muted text color
- Large icon (text-4xl)

---

## Accessibility

### WCAG AA Compliance
- **Contrast ratios**: Minimum 4.5:1 for text
- **Touch targets**: Minimum 44x44pt on mobile
- **Keyboard navigation**: All interactive elements accessible
- **Screen readers**: Semantic HTML, ARIA labels

### ARIA Labels
- Buttons: `aria-label` for icon-only buttons
- Cards: `aria-label` for clickable cards
- Sections: `aria-labelledby` for section headers

---

## Performance

### Image Optimization
- Use WebP format
- Lazy loading for below-fold images
- Responsive images with `srcset`

### Code Splitting
- Lazy load components below fold
- Code split by route

### Animation
- Use CSS transforms (GPU-accelerated)
- Avoid layout shifts
- Smooth 60fps animations

---

## Implementation Notes

### Conditional Rendering
- Check `user` from `useAuth()` hook
- Show logged-out state if `!user`
- Show logged-in dashboard if `user`

### Navigation
- Use existing `TopNavigation` component
- Use existing `BottomNavigation` component (mobile)
- Use existing `SideNavigation` component (desktop)

### Components to Reuse
- `Logo` component (existing)
- `TopNavigation` component (existing)
- `BottomNavigation` component (existing)
- `PersonalizedNewsFeed` component (existing)
- Glass card styling (existing `.glass` class)

### New Components Needed
- `FeatureCard` component
- `QuickActionButton` component
- `StatsCard` component
- `StickyCTA` component (mobile only)

---

## Testing Checklist

### Responsive Design
- [ ] Mobile (320px - 767px) - All sections render correctly
- [ ] Tablet (768px - 1023px) - Grid layouts work
- [ ] Desktop (1024px - 1919px) - Multi-column layouts work
- [ ] Large Desktop (1920px+) - Max-width containers work

### Logged-Out State
- [ ] Hero section displays correctly
- [ ] Feature showcase displays all 6 features
- [ ] CTAs are prominent and accessible
- [ ] Sticky CTA appears on mobile after scroll
- [ ] Social proof stats display correctly

### Logged-In State
- [ ] Personalized header shows user data
- [ ] Quick actions bar is accessible
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

**Design Specification Complete** ✅  
**Ready for Developer Implementation** 🚀


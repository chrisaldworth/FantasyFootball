# Fotmate Home Screen Redesign - Complete Design Brief
**Date**: 2025-12-21  
**Status**: Ready for Design  
**Priority**: P0 (Critical - Primary Conversion Surface)  
**For**: UI/UX Designer

---

## 📋 Table of Contents

1. [Executive Summary](#executive-summary)
2. [Product Context & Branding](#product-context--branding)
3. [Requirements](#requirements)
4. [Design Tasks](#design-tasks)
5. [Design Specifications](#design-specifications)
6. [Responsive Design](#responsive-design)
7. [Delivery Plan](#delivery-plan)
8. [Reference Materials](#reference-materials)

---

## Executive Summary

### Objective
Redesign the entire **Home Screen** of the Fotmate app (mobile and desktop) to:
- Reflect current Fotmate.com website branding, tone, and feature set
- Be mobile-first, fully responsive, and optimized for desktop
- Clearly communicate value to new users
- Strongly encourage sign-up / account creation
- Act as a feature showcase for everything Fotmate offers

### Success Criteria
- ✅ New user understands Fotmate in 5 seconds
- ✅ Sign-up intent is clearly encouraged
- ✅ Screen feels premium, fast, and football-focused
- ✅ Matches and reinforces Fotmate.com website identity
- ✅ Works seamlessly on mobile, tablet, and desktop

### Key Focus
**Primary**: Logged-out users (conversion-focused)  
**Secondary**: Logged-in users (personalized dashboard)

---

## Product Context & Branding

### About Fotmate
Fotmate is a fantasy football companion designed to help users:
- Improve Fantasy Premier League performance
- Analyze trends, stats, fixtures, and transfers
- Support grassroots / personal football teams alongside fantasy play
- Feel like they have a "co-manager" rather than just a stats site

### Brand Identity
- **Site Name**: Fotmate
- **Domain**: fotmate.com
- **Tone**: Smart, modern, trustworthy, fast, uncluttered, football-native
- **Colors**: 
  - Primary: `--pl-green`
  - Secondary: `--pl-cyan`
  - Accent: `--pl-pink`
  - Tertiary: `--pl-purple`
- **Logo**: Exists at `frontend/src/components/Logo.tsx` (multiple variants: full, icon, wordmark, stacked)

### Current State
- **Existing Home Page**: `frontend/src/app/page.tsx`
- **Current Design**: Web-focused landing page
- **Issues**: Not optimized for mobile, not conversion-focused
- **Components Available**: Logo, TopNavigation, BottomNavigation

---

## Requirements

### Two User States

#### 1. Logged-Out Users (Primary Focus)
The home screen must:
- **Instantly explain what Fotmate is** (5-second rule)
- **Show key features & benefits** (scannable, visual)
- **Tease live data or examples** (blurred/locked if needed to encourage sign-up)
- **Promote Sign Up / Create Account** (clear, prominent CTAs)
- **Reduce friction and cognitive load** (simple, focused)

#### 2. Logged-In Users
The home screen must:
- **Act as a dashboard** (personalized, actionable)
- **Surface personalized insights** (relevant to user's FPL team and favorite team)
- **Highlight actions** (transfers, trends, fixtures)
- **Gently upsell advanced features** (if applicable, clearly labeled)

### Features to Showcase

1. **Fantasy Team Insights & Recommendations**
   - AI-powered transfer suggestions
   - Team rating and analysis
   - Squad optimization tips

2. **Transfer Trends & Popularity**
   - Most transferred players
   - Price change predictions
   - Transfer value analysis

3. **Fixture Difficulty & Upcoming Games**
   - Visual fixture planner
   - Difficulty ratings (next 8 gameweeks)
   - Key fixture highlights

4. **Player Performance Stats**
   - Form analysis
   - xG/xA data
   - Points predictions

5. **Grassroots / Personal Team Stats**
   - Favorite team news
   - Team fixtures and results
   - Player performance tracking

6. **AI Insights or "Fotmate Tips"**
   - Personalized recommendations
   - Captaincy suggestions
   - Gameweek strategy tips

7. **News & Match Updates**
   - Personalized news feed
   - Breaking news alerts
   - Match day updates

8. **Future Premium Features** (clearly labeled)
   - Advanced analytics
   - Premium insights
   - Early access features

### Design & UX Requirements

**Visual Design**:
- Clean, modern UI (no clutter)
- Clear visual hierarchy (most important content first)
- Strong CTAs (Sign Up, Explore Features - prominent, accessible)
- Scannable sections (cards, panels, highlights)
- Football-native aesthetic (not generic SaaS)

**Accessibility**:
- WCAG AA compliance (4.5:1 contrast ratio)
- Screen reader support (semantic HTML, ARIA labels)
- Keyboard navigation
- Text sizing (readable, scalable)

**Performance**:
- Fast initial load (< 2 seconds)
- Smooth scrolling (60fps)
- Optimized images (WebP, lazy loading)
- Minimal JavaScript (code splitting)

---

## Design Tasks

### Task 1: Logged-Out Home Screen Design (P0)

#### Above the Fold
- **Hero Section**
  - Fotmate logo (top center or top left)
  - Value proposition headline (1-2 sentences, clear, benefit-focused)
  - Supporting copy (optional, brief)
  - Primary CTA: "Sign Up Free" (prominent, accessible)
  - Secondary CTA: "Learn More" or "See Features"
  - Optional: Social proof badge (e.g., "50K+ Active Managers")

#### Below the Fold
- **Feature Showcase** (3-6 key features)
  - Visual cards with icons/illustrations
  - Feature name
  - Brief description (1-2 sentences)
  - "Learn More" link or preview (blurred for logged-out)
  
- **Social Proof Section** (optional)
  - User testimonials
  - Usage statistics
  - Trust indicators

- **Final CTA Section**
  - Reinforce value proposition
  - Prominent "Get Started" button
  - Optional: "No credit card required" or similar trust message

**Design Considerations**:
- Visual Hierarchy: Most important content first
- Scannable: Cards, clear sections, white space
- Mobile-Optimized: Thumb-friendly, touch targets (44x44pt minimum)
- Fast Loading: Optimize images, consider lazy loading
- Football Theme: Use football imagery, colors, icons (not generic)

---

### Task 2: Logged-In Home Screen Design (P0)

#### Dashboard Layout
- **Personalized Header**
  - Greeting (e.g., "Welcome back, [Name]")
  - Quick stats (current rank, points, gameweek)
  - Optional: Profile/avatar

- **Quick Actions Bar**
  - View Squad
  - Make Transfer
  - Check Fixtures
  - View News
  - (Thumb-friendly, horizontal scroll if needed)

- **Personalized Insights**
  - AI Transfer Recommendation (if available)
  - Captaincy Suggestion (if applicable)
  - Upcoming Fixtures (next 3-5 games)
  - Recent News (personalized feed)

- **Feature Cards** (Secondary)
  - Analytics
  - Leagues
  - Settings
  - (Grid or list layout)

**Design Considerations**:
- Actionable: Every element should have a purpose
- Personalized: Show user-specific data
- Quick Access: Most-used features easily accessible
- Visual Balance: Not cluttered, clear sections

---

### Task 3: Responsive Design (P0 - Critical)

#### Breakpoints
- **Mobile**: 320px - 767px (primary focus, mobile-first)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1919px (laptop screens)
- **Large Desktop**: 1920px+ (large monitors)

#### Adaptations by Breakpoint

**Layout**:
- Mobile: Single column, stacked sections
- Tablet: 2-column grid where appropriate
- Desktop: Multi-column (3-4 columns), side-by-side layouts
- Large Desktop: Max-width container (1440px-1920px), centered content

**Navigation**:
- Mobile: Bottom navigation
- Tablet: Bottom nav or side nav (contextual)
- Desktop: Top navigation + side navigation

**Touch/Click Targets**:
- Mobile: 44x44pt minimum (thumb-friendly)
- Desktop: Standard click targets (hover states)

**Typography**:
- Mobile: Smaller, readable sizes
- Desktop: Larger headings, more spacing, better readability

**Content Density**:
- Mobile: Focused, scannable, minimal
- Desktop: More information visible, richer content, side-by-side comparisons

**Interactions**:
- Mobile: Touch gestures, swipe actions
- Desktop: Hover states, keyboard navigation, mouse interactions

---

### Task 4: Component Design (P1)

#### Reusable Components
- **Feature Card**: Icon, title, description, CTA
- **CTA Button**: Primary, secondary, tertiary variants
- **Stats Card**: Number, label, optional trend
- **News Card**: Headline, image, source, timestamp
- **Quick Action Button**: Icon, label, optional badge

#### Design System
- **Colors**: Use existing brand colors (`--pl-green`, `--pl-cyan`, `--pl-pink`, `--pl-purple`)
- **Typography**: Define heading hierarchy, body text
- **Spacing**: Consistent padding/margins
- **Shadows/Borders**: Subtle, modern
- **Animations**: Smooth, purposeful (if applicable)

---

## Design Specifications

### Required Deliverables

#### 1. Layout Definition
- Section-by-section breakdown
- Purpose of each section
- Logged-out vs logged-in behavior
- Spacing and sizing (mobile-first)

#### 2. Wireframe-Level Description
- Text-based wireframe or layout map
- Clear enough for developer to implement
- Include:
  - Component placement
  - Content hierarchy
  - Interaction states (hover, active, disabled)
  - Responsive breakpoints

#### 3. Visual Design
- Color usage (when to use which brand color)
- Typography (font sizes, weights, line heights)
- Iconography (icon style, sizing)
- Imagery (photo style, illustrations if used)
- Shadows/Borders (depth, separation)

#### 4. Interaction Design
- Button states (default, hover, active, disabled)
- Link styles (inline, button-style)
- Loading states (skeleton screens, spinners)
- Error states (if applicable)
- Empty states (if applicable)

#### 5. Feature Prioritization
- Above the fold (what appears first)
- Secondary content (what appears below)
- Progressive disclosure (what can be hidden/expanded)

### Optional Deliverables (Nice to Have)
- High-fidelity mockups (Figma, Sketch, etc.)
- Interactive prototype (if time permits)
- Design system documentation (if creating new components)

---

## Design Principles

### Mobile-First with Desktop Optimization
- Start with mobile (320px width)
- Expand to larger screens (tablet, desktop, large desktop)
- Touch-optimized (mobile: 44x44pt minimum touch targets)
- Mouse-optimized (desktop: hover states, click targets)
- Thumb-friendly (mobile: key actions within thumb reach)
- Desktop-optimized (utilize screen real estate, multi-column layouts)

### Conversion-Focused
- Clear value proposition (5-second rule)
- Prominent CTAs (sign-up buttons)
- Reduce friction (minimal steps to sign-up)
- Build trust (social proof, clear messaging)

### Football-Native
- Football imagery (not generic stock photos)
- Football terminology (use FPL/PL terms)
- Football colors (team colors, green pitch, etc.)
- Football context (match days, gameweeks, etc.)

### Clean & Modern
- No clutter (white space, clear sections)
- Visual hierarchy (most important first)
- Scannable (cards, lists, clear structure)
- Fast (optimize for performance)

---

## Assets Needed

### Icons
- Feature icons (AI, Transfer, Captain, Analytics, etc.)
- Action icons (Sign Up, Learn More, View, etc.)
- Football icons (ball, pitch, trophy, etc.)
- Style: Consistent, modern, football-themed

### Images
- Hero image (optional, football-themed)
- Feature illustrations (optional, if using illustrations)
- Screenshots (if showing app previews)
- Style: High-quality, football context

### Logo
- **Existing**: `frontend/src/components/Logo.tsx`
- **Variants**: Full, icon, wordmark, stacked
- **Colors**: Full-color, white, black, gradient
- **Usage**: Top of screen, centered or left-aligned

---

## Technical Constraints

### Platform
- **Capacitor iOS app** (React/Next.js)
- **Tailwind CSS** (styling framework)
- **Existing components** (Logo, Navigation, etc.)

### Performance
- Fast loading (< 2 seconds)
- Optimized images (WebP, lazy loading)
- Minimal JavaScript (code splitting)

### Accessibility
- WCAG AA compliance (4.5:1 contrast)
- Screen reader support (semantic HTML, ARIA)
- Touch targets (44x44pt minimum)

---

## Design Questions to Answer

1. **Hero Section**: Should it include an image/illustration, or text-only?
2. **Feature Cards**: How many features above the fold? (3-6 recommended on mobile, more on desktop)
3. **CTA Placement**: Sticky CTA at bottom (mobile), or inline only (desktop)?
4. **Social Proof**: Where should it appear? (hero, separate section, footer)
5. **Logged-In Dashboard**: How much personalization vs. generic dashboard?
6. **News Integration**: Should news appear on home screen? (logged-in only?)
7. **Premium Features**: How prominently should premium features be displayed?
8. **Desktop Layout**: Should desktop use side-by-side hero content? Multi-column feature grid?
9. **Navigation**: How should navigation adapt from mobile (bottom) to desktop (top/side)?
10. **Content Density**: How much more information should desktop show vs. mobile?

---

## Delivery Plan

### Phase 1: MVP - Logged-Out Home Screen (Week 1-2)
**Goal**: Create conversion-focused home screen for new users

**Tasks**:
- Design logged-out home screen layout
- Implement hero section (logo, value prop, CTAs)
- Implement feature showcase (3-6 key features)
- Implement final CTA section
- Add social proof (optional, if time permits)
- Mobile responsiveness (320px - 767px)
- Testing and QA

**Deliverables**:
- Logged-out home screen (mobile-optimized)
- Sign-up flow integration
- Basic feature showcase

**Success Criteria**:
- New user understands Fotmate in 5 seconds
- Sign-up CTA is prominent and accessible
- Screen loads in < 2 seconds
- Mobile-responsive across iPhone sizes

---

### Phase 2: Logged-In Dashboard (Week 2-3)
**Goal**: Create personalized dashboard for returning users

**Tasks**:
- Design logged-in dashboard layout
- Implement personalized header (greeting, stats)
- Implement quick actions bar
- Implement personalized insights (transfer recs, captaincy, fixtures)
- Implement news feed (if applicable)
- Implement feature cards (secondary features)
- Mobile responsiveness
- Testing and QA

**Deliverables**:
- Logged-in dashboard (mobile-optimized)
- Personalized content integration
- Quick actions functionality

**Success Criteria**:
- Dashboard shows relevant, personalized content
- Quick actions are easily accessible
- Screen loads in < 2 seconds
- Mobile-responsive

---

### Phase 3: Desktop Optimization & Responsive Design (Week 3-4)
**Goal**: Ensure seamless experience across all devices, with full desktop optimization

**Tasks**:
- Tablet optimization (768px - 1023px)
- Desktop optimization (1024px - 1919px)
  - Multi-column layouts
  - Side-by-side content
  - Hover states
  - Keyboard navigation
- Large desktop optimization (1920px+)
  - Max-width containers
  - Optimal content width
- Navigation adaptation (bottom nav → top/side nav on desktop)
- Touch target optimization (mobile) vs. click targets (desktop)
- Performance optimization (images, lazy loading)
- Accessibility improvements (WCAG AA)
- Testing across all devices and screen sizes

**Deliverables**:
- Fully responsive home screen (mobile, tablet, desktop, large desktop)
- Desktop-optimized layouts (multi-column, side-by-side)
- Optimized performance
- Accessibility compliance

**Success Criteria**:
- Works seamlessly on mobile, tablet, desktop, and large desktop
- Desktop utilizes screen space effectively (not just stretched mobile layout)
- Meets WCAG AA accessibility standards
- Fast loading (< 2 seconds)
- Smooth scrolling (60fps)
- Proper hover states and interactions on desktop

---

### Phase 4: Enhancements & Iterations (Week 4+)
**Goal**: Add polish and advanced features

**Tasks**:
- Advanced animations (if applicable)
- Skeleton loading states
- Error states
- Empty states
- A/B testing setup (if applicable)
- Analytics integration
- User feedback collection

**Deliverables**:
- Polished, production-ready home screen
- Analytics tracking
- User feedback mechanism

---

## MVP vs. Enhancements

### MVP (Must Have - Phase 1)
**Logged-Out Home Screen**:
- ✅ Hero section (logo, value prop, CTAs)
- ✅ Feature showcase (3-6 features)
- ✅ Final CTA section
- ✅ Mobile responsiveness (320px - 767px)
- ✅ Sign-up flow integration

**Logged-In Dashboard**:
- ✅ Personalized header
- ✅ Quick actions bar
- ✅ Basic personalized insights
- ✅ Mobile responsiveness

### Enhancements (Nice to Have - Phase 2+)
- Social proof section (testimonials, stats)
- Advanced animations
- Skeleton loading states
- Tablet/desktop optimization (if not in MVP)
- Premium feature upsells
- News feed integration
- Advanced personalization
- A/B testing

---

## Success Metrics

### Conversion Metrics (Phase 1)
- **Sign-up Rate**: Target 10-15% (logged-out → registered)
- **Time to Sign-Up**: Target < 2 minutes
- **Feature Discovery**: Target 30%+ users view features

### Engagement Metrics (Phase 2)
- **Daily Active Users**: Track returning users
- **Session Duration**: Target 2+ minutes
- **Feature Usage**: Track which features are accessed

### User Experience Metrics
- **Bounce Rate**: Target < 50% (logged-out users)
- **Return Rate**: Target 40%+ (logged-in users)
- **User Satisfaction**: Collect qualitative feedback

---

## Timeline Summary

| Phase | Duration | Focus | Deliverable |
|-------|----------|-------|-------------|
| **Phase 1** | Week 1-2 | Logged-Out MVP | Conversion-focused home screen |
| **Phase 2** | Week 2-3 | Logged-In Dashboard | Personalized dashboard |
| **Phase 3** | Week 3-4 | Responsive & Desktop | Full responsive design |
| **Phase 4** | Week 4+ | Enhancements | Advanced features |

**Total Estimated Time**: 4-6 weeks (depending on team size and complexity)

---

## Reference Materials

### Code References
- **Current Home Page**: `frontend/src/app/page.tsx`
- **Logo Component**: `frontend/src/components/Logo.tsx`
- **Navigation Components**: `frontend/src/components/navigation/`
- **Auth Context**: `frontend/src/lib/auth-context.tsx`

### Documentation
- **Branding Requirements**: `docs/features/branding/branding-requirements.md`
- **Logo Design**: `docs/features/branding/logo-design-requirements.md`

---

## Next Steps

1. **Review this brief** (understand scope and objectives)
2. **Answer design questions** (clarify with stakeholders if needed)
3. **Create design specifications** (layout, wireframes, visual design)
4. **Review with stakeholders** (get approval)
5. **Hand off to Developer** (create implementation handoff document)

---

## Success Criteria Summary

Your design is successful if:
- ✅ **New user understands Fotmate in 5 seconds** (clear value prop)
- ✅ **Sign-up intent is clearly encouraged** (prominent CTAs)
- ✅ **Screen feels premium, fast, and football-focused** (visual design)
- ✅ **Matches Fotmate.com website identity** (brand consistency)
- ✅ **Mobile-optimized** (touch-friendly, responsive)
- ✅ **Desktop-optimized** (utilizes screen space, multi-column layouts, hover states)
- ✅ **Responsive across all breakpoints** (mobile, tablet, desktop, large desktop)
- ✅ **Developer-ready** (clear specs, implementable)

---

**Document Status**: ✅ Complete Design Brief  
**Ready For**: UI/UX Designer to begin design work

---

**Questions?** Contact the Product Manager or refer to the individual requirement documents in `docs/features/mobile-home-screen/`



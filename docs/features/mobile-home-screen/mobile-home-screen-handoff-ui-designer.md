# Mobile Home Screen Redesign - UI Designer Handoff
**Date**: 2025-12-21  
**Status**: Design Phase  
**Priority**: P0  
**Handoff From**: Product & Project Management Agent  
**Handoff To**: UI Designer Agent

---

## Overview

You are tasked with designing the **Home Screen** for the Fotmate app (mobile and desktop). This is the primary conversion surface for new users and the daily entry point for returning users.

**Key Objective**: Create a mobile-first, desktop-optimized, conversion-focused home screen that clearly communicates Fotmate's value and encourages sign-up across all devices.

---

## Requirements Reference

**Full Requirements**: See `mobile-home-screen-requirements.md`

**Key Points**:
- Two user states: Logged-Out (primary focus) and Logged-In
- Mobile-first, responsive design
- Clear value proposition (5-second rule)
- Strong CTAs for sign-up
- Feature showcase
- Football-native aesthetic

---

## Current State

### Existing Home Page
- **Location**: `frontend/src/app/page.tsx`
- **Current Design**: Web-focused landing page
- **Components**: Hero section, features grid, CTA section
- **Issues**: Not optimized for mobile, not conversion-focused

### Branding
- **Logo**: `frontend/src/components/Logo.tsx` (exists, multiple variants)
- **Colors**: 
  - Primary: `--pl-green`
  - Secondary: `--pl-cyan`
  - Accent: `--pl-pink`
  - Tertiary: `--pl-purple`
- **Tone**: Smart, modern, trustworthy, football-native

---

## Design Tasks

### Task 1: Logged-Out Home Screen Design (P0)

**Above the Fold**:
- **Hero Section**
  - Fotmate logo (top center or top left)
  - Value proposition headline (1-2 sentences, clear, benefit-focused)
  - Supporting copy (optional, brief)
  - Primary CTA: "Sign Up Free" (prominent, accessible)
  - Secondary CTA: "Learn More" or "See Features"
  - Optional: Social proof badge (e.g., "50K+ Active Managers")

**Below the Fold**:
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
- **Visual Hierarchy**: Most important content first
- **Scannable**: Cards, clear sections, white space
- **Mobile-Optimized**: Thumb-friendly, touch targets (44x44pt minimum)
- **Fast Loading**: Optimize images, consider lazy loading
- **Football Theme**: Use football imagery, colors, icons (not generic)

---

### Task 2: Logged-In Home Screen Design (P0)

**Dashboard Layout**:
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
- **Actionable**: Every element should have a purpose
- **Personalized**: Show user-specific data
- **Quick Access**: Most-used features easily accessible
- **Visual Balance**: Not cluttered, clear sections

---

### Task 3: Responsive Design (P0 - Critical)

**Breakpoints**:
- **Mobile**: 320px - 767px (primary focus, mobile-first)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1919px (laptop screens)
- **Large Desktop**: 1920px+ (large monitors)

**Adaptations**:
- **Layout**: 
  - Mobile: Single column, stacked sections
  - Tablet: 2-column grid where appropriate
  - Desktop: Multi-column (3-4 columns), side-by-side layouts
  - Large Desktop: Max-width container (1440px-1920px), centered content
- **Navigation**: 
  - Mobile: Bottom navigation
  - Tablet: Bottom nav or side nav (contextual)
  - Desktop: Top navigation + side navigation
- **Touch Targets**: 
  - Mobile: 44x44pt minimum (thumb-friendly)
  - Desktop: Standard click targets (hover states)
- **Typography**: 
  - Mobile: Smaller, readable sizes
  - Desktop: Larger headings, more spacing, better readability
- **Content Density**:
  - Mobile: Focused, scannable, minimal
  - Desktop: More information visible, richer content, side-by-side comparisons
- **Interactions**:
  - Mobile: Touch gestures, swipe actions
  - Desktop: Hover states, keyboard navigation, mouse interactions

---

### Task 4: Component Design (P1)

**Reusable Components**:
- **Feature Card**: Icon, title, description, CTA
- **CTA Button**: Primary, secondary, tertiary variants
- **Stats Card**: Number, label, optional trend
- **News Card**: Headline, image, source, timestamp
- **Quick Action Button**: Icon, label, optional badge

**Design System**:
- **Colors**: Use existing brand colors
- **Typography**: Define heading hierarchy, body text
- **Spacing**: Consistent padding/margins
- **Shadows/Borders**: Subtle, modern
- **Animations**: Smooth, purposeful (if applicable)

---

## Design Specifications Required

### 1. Layout Definition
- **Section-by-section breakdown**
- **Purpose of each section**
- **Logged-out vs logged-in behavior**
- **Spacing and sizing** (mobile-first)

### 2. Wireframe-Level Description
- **Text-based wireframe or layout map**
- **Clear enough for developer to implement**
- **Include:**
  - Component placement
  - Content hierarchy
  - Interaction states (hover, active, disabled)
  - Responsive breakpoints

### 3. Visual Design
- **Color usage** (when to use which brand color)
- **Typography** (font sizes, weights, line heights)
- **Iconography** (icon style, sizing)
- **Imagery** (photo style, illustrations if used)
- **Shadows/Borders** (depth, separation)

### 4. Interaction Design
- **Button states** (default, hover, active, disabled)
- **Link styles** (inline, button-style)
- **Loading states** (skeleton screens, spinners)
- **Error states** (if applicable)
- **Empty states** (if applicable)

### 5. Feature Prioritization
- **Above the fold** (what appears first)
- **Secondary content** (what appears below)
- **Progressive disclosure** (what can be hidden/expanded)

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
- **Fast loading** (< 2 seconds)
- **Optimized images** (WebP, lazy loading)
- **Minimal JavaScript** (code splitting)

### Accessibility
- **WCAG AA compliance** (4.5:1 contrast)
- **Screen reader support** (semantic HTML, ARIA)
- **Touch targets** (44x44pt minimum)

---

## Deliverables

### Required
1. **Layout Definition** (section-by-section breakdown)
2. **Wireframe Description** (text-based, developer-friendly)
3. **Visual Design Specs** (colors, typography, spacing)
4. **Component Designs** (reusable components)
5. **Responsive Breakpoints** (mobile, tablet, desktop)

### Optional (Nice to Have)
- **High-fidelity mockups** (Figma, Sketch, etc.)
- **Interactive prototype** (if time permits)
- **Design system documentation** (if creating new components)

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

## Success Criteria

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

## Next Steps

1. **Review requirements** (understand scope and objectives)
2. **Answer design questions** (clarify with stakeholders if needed)
3. **Create design specifications** (layout, wireframes, visual design)
4. **Review with stakeholders** (get approval)
5. **Hand off to Developer** (create implementation handoff document)

---

**Document Status**: 📋 Ready for UI Designer  
**Next**: UI Designer creates design specifications

---

## Reference Materials

- **Branding Requirements**: `docs/features/branding/branding-requirements.md`
- **Logo Design**: `docs/features/branding/logo-design-requirements.md`
- **Current Home Page**: `frontend/src/app/page.tsx`
- **Logo Component**: `frontend/src/components/Logo.tsx`
- **Navigation Components**: `frontend/src/components/navigation/`


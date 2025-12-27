# Mobile Home Screen Redesign - Requirements
**Date**: 2025-12-21  
**Status**: Requirements Phase  
**Priority**: P0 (Critical - Primary Conversion Surface)  
**Feature**: Mobile Home Screen Redesign

---

## Executive Summary

**Objective**: Redesign the entire Home Screen of the Fotmate app (mobile and desktop) to:
- Reflect current Fotmate.com website branding, tone, and feature set
- Be mobile-first, fully responsive, and optimized for desktop
- Clearly communicate value to new users
- Strongly encourage sign-up / account creation
- Act as a feature showcase for everything Fotmate offers

**Success Criteria**:
- New user understands Fotmate in 5 seconds
- Sign-up intent is clearly encouraged
- Screen feels premium, fast, and football-focused
- Matches and reinforces Fotmate.com website identity
- Works seamlessly on mobile, tablet, and desktop

---

## Product Context

### About Fotmate
Fotmate is a fantasy football companion designed to help users:
- Improve Fantasy Premier League performance
- Analyze trends, stats, fixtures, and transfers
- Support grassroots / personal football teams alongside fantasy play
- Feel like they have a "co-manager" rather than just a stats site

### Brand Identity
- **Site Name**: Fotmate (note: user mentioned "Footmate" but branding is "Fotmate")
- **Domain**: fotmate.com
- **Tone**: Smart, modern, trustworthy, fast, uncluttered, football-native
- **Colors**: 
  - Primary: `--pl-green`
  - Secondary: `--pl-cyan`
  - Accent: `--pl-pink`
  - Tertiary: `--pl-purple`
- **Logo**: Fotmate logo component exists (`/components/Logo.tsx`)

---

## Core Requirements

### 1. Two User States

#### 1.1 Logged-Out Users (Primary Focus)
The home screen must:
- **Instantly explain what Fotmate is** (5-second rule)
- **Show key features & benefits** (scannable, visual)
- **Tease live data or examples** (blurred/locked if needed to encourage sign-up)
- **Promote Sign Up / Create Account** (clear, prominent CTAs)
- **Reduce friction and cognitive load** (simple, focused)

#### 1.2 Logged-In Users
The home screen must:
- **Act as a dashboard** (personalized, actionable)
- **Surface personalized insights** (relevant to user's FPL team and favorite team)
- **Highlight actions** (transfers, trends, fixtures)
- **Gently upsell advanced features** (if applicable, clearly labeled)

---

## Features to Showcase

### Core Features (Must Highlight)
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

5. **Grassroots / Personal Team Stats** (if supported)
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

---

## Design & UX Requirements

### Visual Design
- **Clean, modern UI** (no clutter)
- **Clear visual hierarchy** (most important content first)
- **Strong CTAs** (Sign Up, Explore Features - prominent, accessible)
- **Scannable sections** (cards, panels, highlights)
- **Football-native aesthetic** (not generic SaaS)

### Responsiveness
Must work seamlessly across:
- **Mobile** (iPhone SE, iPhone 12/13/14/15, iPhone Pro Max, Android phones)
- **Tablets** (iPad, iPad Pro, Android tablets)
- **Desktop** (Laptop screens 1024px+, Desktop monitors 1920px+, Large displays)
- **Responsive breakpoints**: 320px (mobile) → 768px (tablet) → 1024px (desktop) → 1920px+ (large desktop)

### Mobile-First Principles (with Desktop Optimization)
- **Touch-friendly targets** (minimum 44x44pt on mobile, standard click targets on desktop)
- **Thumb-zone optimization** (mobile: key actions within thumb reach; desktop: mouse-friendly)
- **Fast loading** (optimize images, lazy load)
- **Offline considerations** (graceful degradation)
- **Desktop-specific optimizations**:
  - Multi-column layouts (utilize wider screens)
  - Hover states (desktop interactions)
  - Keyboard navigation (desktop accessibility)
  - Larger content areas (more information density)

### Accessibility
- **WCAG AA compliance** (4.5:1 contrast ratio)
- **Screen reader support** (semantic HTML, ARIA labels)
- **Keyboard navigation** (if applicable)
- **Text sizing** (readable, scalable)

---

## Content Requirements

### Hero Section (Above the Fold)
**Logged-Out**:
- Fotmate logo
- Clear value proposition (1-2 sentences)
- Primary CTA: "Sign Up Free" or "Get Started"
- Secondary CTA: "Learn More" or "See Features"
- Optional: Social proof (user count, rating)

**Logged-In**:
- Personalized greeting
- Quick stats (current rank, points, gameweek)
- Quick actions (View Squad, Make Transfer, Check Fixtures)

### Feature Showcase
- **Visual cards** for each key feature
- **Icons or illustrations** (football-themed)
- **Brief descriptions** (1-2 sentences max)
- **"Learn More" links** (for logged-out users)
- **Direct access** (for logged-in users)

### Social Proof
- User testimonials (optional)
- Usage statistics (e.g., "50K+ Active Managers")
- Trust indicators (if applicable)

### Call-to-Action
- **Primary CTA**: Sign Up / Create Account (logged-out)
- **Secondary CTAs**: Explore Features, View Demo, Learn More
- **Clear, action-oriented copy**
- **Prominent placement** (above fold, sticky if needed)

---

## Technical Requirements

### Platform
- **Capacitor-based iOS app** (existing structure)
- **Next.js frontend** (React components)
- **Responsive design** (Tailwind CSS)

### Performance
- **Fast initial load** (< 2 seconds)
- **Smooth scrolling** (60fps)
- **Optimized images** (WebP, lazy loading)
- **Minimal JavaScript** (code splitting)

### Integration
- **Auth context** (`useAuth` hook)
- **Logo component** (existing `Logo.tsx`)
- **Navigation** (TopNavigation, BottomNavigation components)
- **API integration** (for logged-in user data)

---

## User Journey Flows

### First-Time Visitor → Sign-Up → First Success
1. **Land on home screen** (logged-out state)
2. **See clear value proposition** (5 seconds to understand)
3. **Browse features** (scroll to see what's available)
4. **See social proof** (builds trust)
5. **Click "Sign Up"** (prominent CTA)
6. **Complete registration** (minimal friction)
7. **Redirect to onboarding** (team selection, FPL linking)
8. **First success moment** (see personalized dashboard)

### Returning User → Daily Check-In
1. **Land on home screen** (logged-in state)
2. **See personalized dashboard** (relevant insights)
3. **Quick actions available** (transfers, fixtures, news)
4. **Navigate to specific features** (via navigation)
5. **Get value immediately** (actionable insights)

---

## Constraints

### Scope
- **Home screen only** (do NOT redesign unrelated screens)
- **Mobile-first** (but responsive to tablets/web)
- **Feasible for small team** (realistic implementation)

### Technical
- **Existing tech stack** (Next.js, React, Tailwind, Capacitor)
- **Existing components** (reuse where possible)
- **API limitations** (work with existing endpoints)

### Time
- **Do NOT assume unlimited dev time**
- **Prioritize MVP features** (core functionality first)
- **Plan for enhancements** (future iterations)

---

## Success Metrics

### Conversion Metrics
- **Sign-up rate** (logged-out → registered)
- **Time to first action** (registration completion)
- **Feature discovery** (features clicked/viewed)

### Engagement Metrics
- **Daily active users** (returning users)
- **Session duration** (time on home screen)
- **Feature usage** (which features are accessed)

### User Experience Metrics
- **Bounce rate** (logged-out users leaving)
- **Return rate** (logged-in users coming back)
- **User satisfaction** (qualitative feedback)

---

## Open Questions

1. **Onboarding flow**: Should home screen redirect to onboarding after sign-up, or handle onboarding inline?
2. **Premium features**: How prominently should premium features be displayed?
3. **Personalization**: How much personalization for logged-in users vs. generic dashboard?
4. **News integration**: Should news be prominently displayed on home screen?
5. **Live data**: Should home screen show live match data or only scheduled/preview data?

---

## Dependencies

### Design Dependencies
- Logo design (exists, may need mobile variants)
- Icon set (football-themed icons)
- Illustration style (if using illustrations)

### Technical Dependencies
- Auth system (existing)
- API endpoints (existing)
- Navigation components (existing)

### Content Dependencies
- Copywriting (value propositions, feature descriptions)
- Images/assets (feature illustrations, screenshots)

---

## Next Steps

1. **Review requirements** (stakeholder approval)
2. **Answer open questions** (clarify scope)
3. **Hand off to UI Designer** (create design specifications)
4. **Design review** (approve designs)
5. **Hand off to Developer** (implementation)
6. **Testing** (QA validation)
7. **Launch** (deploy to production)

---

**Document Status**: ✅ Requirements Complete  
**Next**: Hand off to UI Designer Agent for design specifications


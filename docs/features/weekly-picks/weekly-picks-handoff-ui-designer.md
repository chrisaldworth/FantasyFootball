# Footmate Weekly Picks - Designer Handoff
**Date**: 2025-12-21  
**Status**: Ready for Design  
**Priority**: P0  
**Handoff From**: Product & Project Management  
**Handoff To**: UI/UX Designer

---

## 🎯 Quick Overview

**Feature**: Footmate Weekly Picks - A weekly game where users predict 3 match scores and pick 3 players to earn points.

**Objective**: Create a mobile-first, conversion-focused design that makes the game simple to understand and engaging to play.

**Full Brief**: See `weekly-picks-complete-design-brief.md` for complete requirements.

---

## 📋 What You Need to Design

### Core Screens (6 Screens)

1. **Weekly Picks Main Page**
   - Logged-out: Feature intro, sample picks, CTA
   - Logged-in: Pick status, countdown, quick actions

2. **Pick Submission Flow** (3 steps)
   - Step 1: Select 3 fixtures + input score predictions
   - Step 2: Select 3 players (one per team)
   - Step 3: Review & submit

3. **Results & Leaderboard**
   - Points breakdown (scores + players + multiplier)
   - Leaderboard (global + private leagues)
   - League selector

4. **History & Past Weeks**
   - Week selector
   - Past picks and results
   - Season summary

5. **Private Leagues** (NEW)
   - League list
   - League detail (leaderboard, members)
   - Create league flow
   - Invite system (code, link)

6. **Statistics & Analytics** (NEW)
   - Overview dashboard (key metrics)
   - Performance charts (points/rank over time)
   - Score prediction analytics
   - Player pick analytics
   - Comparative stats

---

## 🎨 Key Design Requirements

### Visual Style
- **Football-native** (not generic game UI)
- **Clean & modern** (aligns with Fotmate branding)
- **Mobile-first** (320px - 767px primary)
- **Fully responsive** (tablet, desktop, large desktop)

### Brand Colors
- Primary: `--pl-green`
- Secondary: `--pl-cyan`
- Accent: `--pl-pink`
- Tertiary: `--pl-purple`

### Key Principles
- **Simple to understand** (5-second rule for new users)
- **Transparent scoring** (clear how points are calculated)
- **Quick to use** (picks in < 2 minutes)
- **Engaging** (encourages weekly return)

---

## 🧩 Components to Design (10 Components)

1. **Score Prediction Input** - Home/Away goals input
2. **Player Selection Card** - Player pick with team/photo
3. **Pick Progress Indicator** - X/6 picks made
4. **Countdown Timer** - Time until pick lock
5. **Points Breakdown Card** - How points were calculated
6. **Leaderboard Row** - Rank, user, points, movement
7. **League Card** (NEW) - League info, members, rank
8. **Stat Card** (NEW) - Single statistic display
9. **Chart Component** (NEW) - Performance trends (line/bar)
10. **Invite Code Display** (NEW) - League code with copy/share

---

## 📱 Responsive Breakpoints

- **Mobile**: 320px - 767px (primary focus)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1919px
- **Large Desktop**: 1920px+

**Adaptations**:
- Mobile: Single column, bottom nav, touch-optimized
- Desktop: Multi-column, top/side nav, hover states, more content density

---

## 🎯 Design Questions to Answer

1. **Pick Submission**: Single page or multi-step wizard?
2. **Score Input**: Number inputs, sliders, or visual selector?
3. **Player Selection**: Search-first or browse-first?
4. **Results Display**: Detailed breakdown or summary-first?
5. **Leaderboard**: Table, cards, or hybrid?
6. **Charts**: Which chart types work best for mobile? (line, bar, etc.)
7. **Private Leagues**: How prominent should league creation be?
8. **Statistics**: Dashboard view or separate detailed pages?
9. **Visual Style**: Game-like or professional?
10. **Quick Pick**: How much AI insight to show?

---

## ✅ Deliverables Required

### Required
1. **Layout Definitions** (section-by-section for each screen)
2. **Wireframe Descriptions** (text-based, developer-friendly)
3. **Visual Design Specs** (colors, typography, spacing)
4. **Component Designs** (all 10 components with states)
5. **Responsive Breakpoints** (mobile, tablet, desktop adaptations)
6. **Interaction States** (hover, active, disabled, loading, error)

### Optional (Nice to Have)
- High-fidelity mockups (Figma, Sketch, etc.)
- Interactive prototype
- Design system documentation

---

## 📊 Key Features to Highlight

### Game Mechanics
- **3 Score Predictions** (exact scores, different fixtures)
- **3 Player Picks** (one per team, earn FPL points)
- **Component-Based Scoring** (partial credit for correct goals/result)
- **Combo Multiplier** (×1.25 if both conditions met)
- **Pick Lock Deadline** (first kickoff of gameweek)

### Leagues & Competition
- **Global Leaderboard** (all users)
- **Private Leagues** (create, invite, compete)
- **Weekly & Seasonal** (different ranking types)
- **Rank Movement** (up/down indicators)

### Statistics & Analytics
- **Performance Trends** (points/rank over time)
- **Accuracy Metrics** (score prediction success)
- **Player Pick Analytics** (success rates, best picks)
- **Comparative Stats** (vs. average, vs. top 10%)

---

## 🔄 User Flows to Design

### Flow 1: First-Time User Making Picks
1. Land on picks page → See intro
2. Start making picks → Select fixtures → Input scores
3. Select players → Review → Submit

### Flow 2: Viewing Results
1. Land on picks page → See results summary
2. View breakdown → Check leaderboard → See league position

### Flow 3: Quick Pick (Anti-Friction)
1. Click "Auto Pick for Me" → Review generated picks
2. Edit if needed → Submit

### Flow 4: Create Private League (NEW)
1. Navigate to leagues → Create new league
2. Fill details → Generate code → Invite members

### Flow 5: View Statistics (NEW)
1. Navigate to statistics → See overview dashboard
2. Explore analytics → View charts → Check insights

---

## 🎨 Design Considerations

### Mobile-First
- **Touch targets**: 44x44pt minimum
- **Thumb-friendly**: Key actions within thumb reach
- **Fast loading**: Optimize images, lazy load
- **Simple navigation**: Bottom nav, clear hierarchy

### Desktop Optimization
- **Multi-column layouts**: Utilize screen space
- **Hover states**: Interactive elements
- **More content density**: Show more information
- **Keyboard navigation**: Accessibility

### Accessibility
- **WCAG AA compliance**: 4.5:1 contrast ratio
- **Screen reader support**: Semantic HTML, ARIA
- **Touch targets**: 44x44pt minimum
- **Clear typography**: Readable, scalable

---

## 📚 Reference Materials

### Full Documentation
- **Complete Design Brief**: `weekly-picks-complete-design-brief.md`
  - Full requirements
  - Detailed scoring system
  - All user flows
  - Complete screen specifications

### Existing Code
- **Fotmate Branding**: `docs/features/branding/branding-requirements.md`
- **Logo Component**: `frontend/src/components/Logo.tsx`
- **Navigation**: `frontend/src/components/navigation/`
- **FPL Integration**: `frontend/src/lib/api.ts`

### Design System
- **Colors**: CSS variables (`--pl-green`, `--pl-cyan`, etc.)
- **Framework**: Tailwind CSS
- **Platform**: Next.js/React, Capacitor iOS

---

## ⚠️ Important Constraints

### Technical
- **Existing tech stack**: Next.js, React, Tailwind, Capacitor
- **Reuse components**: Logo, Navigation where possible
- **API limitations**: Work with existing FPL API integration

### Scope
- **MVP focus**: Core features first, polish later
- **Mobile-first**: Desktop optimization in Phase 3
- **Feasible timeline**: Realistic for small team

### Guardrails
- **One player per team**: Enforced in UI
- **Three different fixtures**: Cannot select same fixture twice
- **Pick lock deadline**: Clear countdown, no changes after deadline
- **Score validation**: 0-10 goals, reasonable limits

---

## 🎯 Success Criteria

Your design is successful if:
- ✅ **Users understand the game in < 30 seconds** (clear explanation)
- ✅ **Pick submission takes < 2 minutes** (efficient flow)
- ✅ **Scoring is transparent** (clear breakdown)
- ✅ **Encourages weekly return** (engagement hooks)
- ✅ **Mobile-first and responsive** (works on all devices)
- ✅ **Football-native aesthetic** (aligns with Fotmate branding)
- ✅ **Developer-ready** (clear specs, implementable)

---

## 📅 Timeline

**Estimated Design Time**: 1-2 weeks

**Phases**:
1. **Week 1**: Core screens (Picks, Results, Leaderboard)
2. **Week 2**: Private Leagues & Statistics screens
3. **Review & Iteration**: Stakeholder feedback, refinements

---

## 🚀 Next Steps

1. **Review this handoff** (understand scope and objectives)
2. **Read full design brief** (`weekly-picks-complete-design-brief.md`)
3. **Answer design questions** (clarify with stakeholders if needed)
4. **Create design specifications** (layout, wireframes, visual design)
5. **Review with stakeholders** (get approval)
6. **Hand off to Developer** (create implementation handoff document)

---

## 📞 Questions?

**Contact**: Product Manager  
**Full Requirements**: `docs/features/weekly-picks/weekly-picks-complete-design-brief.md`

---

**Document Status**: ✅ Ready for Designer  
**Next**: Begin design work

---

## 🎨 Quick Reference: Key Numbers

- **3** score predictions per week
- **3** player picks per week
- **12** max points per score prediction
- **×1.25** combo multiplier
- **6** total screens to design
- **10** components to design
- **5** user flows to design
- **< 2 minutes** target pick submission time
- **< 30 seconds** target time to understand game

---

**Good luck with the design! 🎨⚽**




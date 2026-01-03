# FPL Account Linking - UI Designer Handoff

## Overview

We've created initial implementations for improving the FPL account linking flow. This document provides context for the UI Designer to review and enhance the designs.

## Components Created

### 1. `OnboardingWizard.tsx`
- **Location**: `frontend/src/components/OnboardingWizard.tsx`
- **Purpose**: Multi-step wizard shown after registration
- **Current Steps**: Welcome → Choose Method → Team ID Entry → Success

### 2. `FPLTeamIdHelper.tsx`
- **Location**: `frontend/src/components/FPLTeamIdHelper.tsx`
- **Purpose**: Helps users find their FPL Team ID
- **Features**: 
  - URL paste detection (auto-extracts Team ID)
  - Step-by-step visual guide
  - Quick tips section

### 3. `FPLConnectionPrompt.tsx`
- **Location**: `frontend/src/components/FPLConnectionPrompt.tsx`
- **Purpose**: Reusable prompt shown when FPL isn't connected
- **Variants**: `card`, `banner`, `full-page`

## Design Review Needed

### 1. Onboarding Wizard
- [ ] Review overall flow and step progression
- [ ] Improve visual hierarchy and spacing
- [ ] Add illustrations/graphics for each step
- [ ] Review mobile responsiveness
- [ ] Consider adding animation between steps

### 2. Team ID Helper
- [ ] Add actual screenshot/visual showing where Team ID is in FPL URL
- [ ] Consider animated GIF showing the process
- [ ] Review expandable section UX

### 3. Empty States (FPLConnectionPrompt)
- [ ] Review the full-page variant design
- [ ] Ensure feature preview cards are compelling
- [ ] Consider adding testimonials or social proof

### 4. TopNavigation Changes
- [ ] Review "Connect FPL" button prominence
- [ ] Ensure connected state (green dot) is clear
- [ ] Consider tooltip or hover state showing FPL status

## Visual Assets Needed

1. **Welcome Illustration**: Celebratory graphic for onboarding welcome
2. **FPL Team ID Screenshot**: Annotated screenshot showing Team ID location
3. **Success Animation**: Confetti or check animation for completion
4. **Feature Icons**: Consistent icons for features preview

## Color Palette (Current)
- Primary Purple: `var(--pl-purple)`
- Primary Pink: `var(--pl-pink)`
- Success Green: `var(--pl-green)`
- Info Cyan: `var(--pl-cyan)`
- Background: `#1a1a2e`
- Card Background: `rgba(255, 255, 255, 0.05)`

## Spacing Guidelines (Current)
- Section padding: `p-6`
- Gap between elements: `space-y-4` or `space-y-6`
- Button padding: `py-3 px-6`
- Border radius: `rounded-xl` or `rounded-2xl`

## Questions for Designer

1. Should we add progress animations between wizard steps?
2. Do we want different background treatments for each step?
3. Should the "Skip" option be more/less prominent?
4. Any accessibility improvements needed (focus states, screen reader labels)?

## Next Steps

After design review:
1. Apply design improvements to components
2. Add missing visual assets
3. Test on mobile devices
4. Hand off to Tester Agent for QA

---

## Related Files

- Requirements: `docs/features/fpl-account-linking/fpl-account-linking-improvements-requirements.md`
- Registration Page: `frontend/src/app/register/page.tsx`
- Fantasy Football Page: `frontend/src/app/fantasy-football/page.tsx`
- TopNavigation: `frontend/src/components/navigation/TopNavigation.tsx`

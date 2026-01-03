# FPL Account Linking Flow - Improvement Requirements

## Overview

The current FPL account linking flow has several friction points that make it difficult for new users to connect their Fantasy Premier League accounts. This document outlines the current pain points and proposed improvements to streamline the process.

## Current Pain Points

### 1. **Discoverability Issues**
- The linking option is hidden in Settings or a small icon in the top navigation
- New users don't know they need to link their FPL account to access full features
- No onboarding guidance after registration

### 2. **Two-Step Confusion**
- Registration asks for "FPL Team ID" (optional) - this enables READ-ONLY access
- Full account linking (for making transfers, etc.) requires a separate step with email/password
- Users don't understand the difference between these two methods

### 3. **Finding FPL Team ID is Hard**
- Users must navigate to the FPL website, find their team, and extract the ID from the URL
- No visual guide or helper to explain where to find this
- No alternative lookup method (e.g., search by team name)

### 4. **Security Concerns**
- Users are hesitant to share their FPL credentials
- Current security messaging is buried in the form
- No explanation of what the app CAN and CANNOT do with their credentials

### 5. **Poor Error Handling**
- Login failures show technical error messages
- Timeout errors don't explain what to do next
- No retry guidance

---

## Proposed Improvements

### Phase 1: Quick Wins (Immediate Impact)

#### 1.1 Add Onboarding After Registration
- After successful registration, show a "Welcome" modal/wizard
- Walk user through: "Connect your FPL account to get personalized insights"
- Offer three options:
  - **Quick Setup**: Just enter Team ID (read-only)
  - **Full Access**: Link with FPL credentials (enables transfers)
  - **Skip for now**: Continue without linking

#### 1.2 FPL Team ID Finder
- Add a visual guide showing where to find Team ID on the FPL website
- Include screenshot or animated GIF
- Add "How to find your Team ID" expandable section

#### 1.3 Improved Empty States
- When viewing Fantasy Football pages without a linked account, show a prominent, helpful prompt
- Include clear value proposition: "See your squad, track transfers, and more"
- One-click access to linking flow

#### 1.4 Better Security Messaging
- Prominently display what we use credentials for
- List what we CAN'T do (can't spend real money, can't access personal info)
- Add privacy policy link

### Phase 2: Enhanced Linking Options

#### 2.1 Team Name Search
- Allow users to search for their team by name instead of requiring Team ID
- Use FPL API to search: `/api/fpl/search?name=TeamName`
- Display matching results with confirmation

#### 2.2 URL Paste Detection
- Allow users to paste their FPL team URL directly
- Auto-extract Team ID from URL patterns like:
  - `https://fantasy.premierleague.com/entry/1234567/event/1`
  - `https://fantasy.premierleague.com/entry/1234567/history`

#### 2.3 QR Code Login (Optional)
- Generate a QR code that users can scan from the FPL app
- Link accounts without manually entering credentials

### Phase 3: Onboarding Flow

#### 3.1 Post-Registration Wizard
```
Step 1: Welcome
"Let's personalize your experience!"

Step 2: Connect FPL Account
"Do you play Fantasy Premier League?"
- Yes, I have a team → Continue to linking
- Not yet → Skip (show CTA to create FPL team)

Step 3: Choose Linking Method
- Quick Setup (Team ID only)
- Full Access (FPL Credentials)
- Visual guide for each option

Step 4: Success!
"You're all set! Here's what you can do now:"
- View your squad
- Track your rank
- Get transfer suggestions
- [If full access] Make transfers directly
```

#### 3.2 Progressive Disclosure
- Start with read-only access (Team ID only)
- Prompt for full linking when user tries to use a feature that requires it
- "To make transfers directly, link your FPL credentials"

---

## Implementation Priority

| Priority | Feature | Impact | Effort |
|----------|---------|--------|--------|
| P0 | FPL Team ID Finder/Guide | High | Low |
| P0 | Improved empty states | High | Low |
| P1 | Post-registration onboarding | High | Medium |
| P1 | Better error messages | Medium | Low |
| P1 | URL paste detection | Medium | Low |
| P2 | Team name search | High | Medium |
| P2 | Progressive disclosure | Medium | Medium |
| P3 | QR code linking | Low | High |

---

## Success Metrics

1. **Account linking rate**: % of registered users who link their FPL account
2. **Time to link**: Average time from registration to successful linking
3. **Drop-off rate**: % of users who start but don't complete linking
4. **Error rate**: % of linking attempts that fail
5. **Feature engagement**: Usage of FPL features after linking

---

## Technical Considerations

### Backend
- Add `/api/fpl/search` endpoint for team name search
- Improve error messages in `/api/fpl-account/link` endpoint
- Add telemetry for linking attempts/failures

### Frontend
- Create `OnboardingWizard` component
- Create `FPLTeamIdHelper` component with visual guide
- Update `LinkFPLAccountModal` with improved UX
- Add URL paste handler with Team ID extraction

### Security
- All credential handling already uses encryption (Fernet)
- Consider adding rate limiting on login attempts
- Add clear data retention policy messaging

---

## Acceptance Criteria

### Onboarding Flow
- [ ] New users see onboarding wizard after registration
- [ ] Wizard explains the difference between read-only and full access
- [ ] Users can skip onboarding and access it later from Settings
- [ ] Progress is saved if user exits mid-flow

### Team ID Helper
- [ ] Visual guide shows where to find Team ID on FPL website
- [ ] URL paste field auto-extracts Team ID
- [ ] Team name search returns accurate results

### Error Handling
- [ ] All error messages are user-friendly (no technical jargon)
- [ ] Timeout errors suggest retrying
- [ ] Invalid credentials show specific guidance
- [ ] Network errors are distinguished from auth errors

---

## Related Files

- `frontend/src/components/LinkFPLAccountModal.tsx` - Current linking modal
- `frontend/src/app/register/page.tsx` - Registration page
- `backend/app/api/fpl_account.py` - Account linking API
- `backend/app/services/fpl_auth_service.py` - FPL authentication service

---

## Handoff Notes

This document is ready for handoff to the **UI Designer Agent** to create:
1. Onboarding wizard design
2. FPL Team ID helper visual guide
3. Improved empty state designs
4. Error state designs

After design completion, hand off to **Developer Agent** for implementation.

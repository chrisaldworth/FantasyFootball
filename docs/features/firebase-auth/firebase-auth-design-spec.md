# Firebase Authentication - Design Specifications

**Date**: 2025-12-21  
**Designer**: UI Designer Agent  
**Status**: ✅ Design Complete  
**Priority**: P1 (Firebase Authentication with Google Sign-In)  
**For**: Developer Agent

---

## Overview

Complete design specifications for Firebase Authentication integration with Google Sign-In. This document provides detailed layouts, component specs, and implementation guidance for all authentication UI components.

**Reference Documents**:
- Requirements: `firebase-auth-requirements.md`
- Handoff: `firebase-auth-handoff-ui-designer.md`
- Current Implementation: Email/password auth exists, Google sign-in is new

---

## Design Answers

### 1. Button Placement
**Answer**: **Above email form** - Google sign-in button placed prominently at the top of the login/register card, before the email/password form. This emphasizes the quick, one-click option while keeping email/password as an alternative.

### 2. Button Style
**Answer**: **Full-width, rounded corners** - Full-width button (matches email form button width) with rounded-lg corners (8px border radius). Height: 48px for optimal touch targets.

### 3. Divider
**Answer**: **Text divider with "or"** - Horizontal line with centered "or" text. Spacing: 24px above and below divider. Style: Subtle gray line with "or" text in muted color.

### 4. Button Size
**Answer**: **Match email form button** - Same width and height (48px) as the email/password submit button for visual consistency.

### 5. Icon/Logo
**Answer**: **Google logo (18x18px) + text** - Official Google logo on the left side of button, followed by text. Logo sourced from Google's official assets or SVG.

### 6. Text
**Answer**: **"Continue with Google"** - Used for both sign-in and sign-up flows. More modern and action-oriented than "Sign in with Google".

### 7. Account Settings
**Answer**: **Card-based list** - Each auth method in its own card with status indicator, method name, and action button. Clean, scannable layout.

### 8. Status Indicators
**Answer**: **Badge + icon** - Green badge with checkmark (✓) for linked, gray badge with X (✗) for not linked. Clear visual distinction.

### 9. Error States
**Answer**: **Inline error messages** - Error displayed in red alert box above form (same style as existing login/register errors). Toast notifications for success messages.

### 10. Loading States
**Answer**: **Button disabled + spinner** - Button shows spinner icon and "Signing in..." text, button disabled during authentication. Same pattern as existing email/password loading.

---

## Component 1: GoogleSignInButton

### Props
```typescript
interface GoogleSignInButtonProps {
  variant?: 'signin' | 'signup' | 'link';
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}
```

### Design
```
┌─────────────────────────────────────────────┐
│  [Google Logo]  Continue with Google      │
└─────────────────────────────────────────────┘
```

### Visual Specifications
- **Width**: Full width (100%)
- **Height**: 48px
- **Background**: White (`#FFFFFF`)
- **Text Color**: Gray (`#3c4043`)
- **Border**: 1px solid `#dadce0`
- **Border Radius**: 8px (`rounded-lg`)
- **Padding**: 12px 16px
- **Font**: 14px, medium weight
- **Icon**: Google logo, 18x18px, left side, 12px margin from text
- **Hover**: Shadow (`shadow-md`), slight elevation
- **Active**: Slightly darker background (`#f8f9fa`)
- **Loading**: Spinner replaces logo, text changes to "Signing in..."
- **Disabled**: Opacity 50%, cursor not-allowed

### States

1. **Default**:
   - White background
   - Google logo + "Continue with Google" text
   - Hover: Shadow elevation

2. **Hover**:
   - Shadow: `0 2px 4px rgba(0,0,0,0.1)`
   - Slight scale: `scale-[1.01]`
   - Transition: 150ms

3. **Active/Pressed**:
   - Background: `#f8f9fa`
   - Scale: `scale-[0.99]`

4. **Loading**:
   - Spinner icon replaces Google logo
   - Text: "Signing in..."
   - Button disabled
   - Cursor: `wait`

5. **Disabled**:
   - Opacity: 50%
   - Cursor: `not-allowed`
   - No hover effects

### Google Branding Compliance
- **Colors**: White background, Google blue text (`#4285f4`) for logo
- **Logo**: Official Google logo (G icon)
- **Spacing**: 12px between logo and text
- **Typography**: 14px, medium weight, Google-approved font
- **Button Style**: Follows Google's sign-in button guidelines

---

## Component 2: Login Page Integration

### Layout
```
┌─────────────────────────────────────────────┐
│          Welcome Back                       │
│    Sign in to access your dashboard         │
├─────────────────────────────────────────────┤
│                                              │
│  [GoogleSignInButton]                       │
│                                              │
│  ──────────── or ────────────              │
│                                              │
│  Email Address                               │
│  [input field]                               │
│                                              │
│  Password                                    │
│  [input field]                               │
│                                              │
│  [Sign In Button]                            │
│                                              │
│  Don't have an account? Sign up              │
└─────────────────────────────────────────────┘
```

### Spacing
- **Google Button**: Top margin: 0px (first element after header)
- **Divider**: 24px margin above and below
- **Email Form**: 24px margin below divider
- **Error Message**: Above Google button if error occurs

### Responsive
- **Mobile**: Full width, stacked layout
- **Tablet**: Same as mobile
- **Desktop**: Max width 448px, centered

---

## Component 3: Register Page Integration

### Layout
```
┌─────────────────────────────────────────────┐
│        Create Account                       │
│    Start your journey to FPL glory         │
├─────────────────────────────────────────────┤
│                                              │
│  [GoogleSignInButton]                       │
│                                              │
│  ──────────── or ────────────              │
│                                              │
│  Email Address                               │
│  [input field]                               │
│                                              │
│  Username                                    │
│  [input field]                               │
│                                              │
│  Password                                    │
│  [input field]                               │
│                                              │
│  Confirm Password                            │
│  [input field]                               │
│                                              │
│  [Create Account Button]                    │
│                                              │
│  Already have an account? Sign in            │
└─────────────────────────────────────────────┘
```

### Same spacing and layout as login page

---

## Component 4: AccountSettingsAuthSection

### Props
```typescript
interface AccountSettingsAuthSectionProps {
  authMethods: {
    email: { linked: boolean; email?: string };
    google: { linked: boolean; email?: string };
  };
  onLinkGoogle: () => void;
  onUnlinkGoogle: () => void;
  loading?: boolean;
}
```

### Layout
```
┌─────────────────────────────────────────────┐
│ Authentication Methods                       │
├─────────────────────────────────────────────┤
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ Email/Password                        │   │
│  │ user@example.com                      │   │
│  │ [✓ Linked]                           │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ Google                               │   │
│  │ user@gmail.com                       │   │
│  │ [✓ Linked]  [Unlink Google Account] │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  OR (if Google not linked):                  │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ Google                               │   │
│  │ [✗ Not linked]                       │   │
│  │ [Link Google Account]                │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Card Design
- **Card**: Glass morphism, rounded-xl, padding: 16px
- **Method Name**: 16px, bold
- **Email**: 14px, muted color
- **Status Badge**: Small badge (12px text), rounded-full
  - Linked: Green background, white text, checkmark icon
  - Not linked: Gray background, white text, X icon
- **Action Button**: Right-aligned, secondary button style

### Status Badges
- **Linked**: `bg-[var(--pl-green)] text-white` with ✓ icon
- **Not Linked**: `bg-gray-600 text-white` with ✗ icon

### Action Buttons
- **Link Google**: Primary button style, "Link Google Account"
- **Unlink Google**: Secondary/danger button style, "Unlink Google Account"
- **Confirmation**: Show confirmation dialog before unlinking (if only one method, show warning)

---

## Component 5: AuthMethodSelector (Account Merging)

### Props
```typescript
interface AuthMethodSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  googleEmail: string;
  existingEmail: string;
  onLinkAccount: (password: string) => void;
  onCreateAccount: () => void;
  onSignInWithPassword: () => void;
}
```

### Layout (Modal)
```
┌─────────────────────────────────────────────┐
│ Account Already Exists                      │
├─────────────────────────────────────────────┤
│                                              │
│  An account with this email already exists:  │
│  user@example.com                            │
│                                              │
│  What would you like to do?                  │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ Link to Existing Account             │   │
│  │ Link your Google account to your     │   │
│  │ existing account. You'll be able to  │   │
│  │ sign in with either method.          │   │
│  │                                       │   │
│  │ Password: [input field]               │   │
│  │ [Link Account Button]                │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ Create New Account                   │   │
│  │ Create a separate account with your  │   │
│  │ Google email. You'll have two       │   │
│  │ separate accounts.                    │   │
│  │                                       │   │
│  │ [Create Account Button]              │   │
│  └─────────────────────────────────────┘   │
│                                              │
│  ┌─────────────────────────────────────┐   │
│  │ Sign In with Password                │   │
│  │ Use your existing password to sign   │   │
│  │ in to your account.                  │   │
│  │                                       │   │
│  │ [Sign In Button]                     │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
```

### Design
- **Modal**: Centered, glass morphism, max-width: 500px
- **Options**: Three cards, each with description and action button
- **Password Field**: Only shown for "Link Account" option
- **Buttons**: Primary style for recommended action, secondary for alternatives

---

## Divider Component

### Design
```
────────────────── or ──────────────────
```

### Specifications
- **Layout**: Flex container with line, text, line
- **Line**: 1px solid `rgba(255, 255, 255, 0.1)`, flex: 1
- **Text**: "or", 14px, `var(--pl-text-muted)`, padding: 0 16px
- **Spacing**: 24px margin above and below

### Code Structure
```tsx
<div className="flex items-center gap-4 my-6">
  <div className="flex-1 h-px bg-white/10" />
  <span className="text-sm text-[var(--pl-text-muted)]">or</span>
  <div className="flex-1 h-px bg-white/10" />
</div>
```

---

## Error States

### Error Display
- **Location**: Above Google button or above form
- **Style**: Red alert box (same as existing login/register errors)
- **Background**: `bg-[var(--pl-pink)]/10`
- **Border**: `border-[var(--pl-pink)]/30`
- **Text**: `text-[var(--pl-pink)]`
- **Padding**: 16px
- **Border Radius**: 8px

### Error Messages
- **User Cancels**: "Sign-in cancelled. Please try again."
- **Network Error**: "Network error. Please check your connection."
- **Account Conflict**: "This Google account is already linked to another account."
- **Token Error**: "Authentication failed. Please try again."
- **Generic**: "Something went wrong. Please try again."

---

## Loading States

### GoogleSignInButton Loading
- **Spinner**: Replaces Google logo
- **Text**: Changes to "Signing in..."
- **Button**: Disabled, cursor: wait
- **Spinner**: Same style as existing login/register spinner

### Account Linking Loading
- **Button**: Shows spinner, disabled
- **Text**: "Linking..." or "Unlinking..."
- **Card**: Slight opacity reduction (90%)

---

## Success States

### After Successful Sign-In
- **Toast Notification**: "Signed in successfully!"
- **Redirect**: To dashboard (same as email/password)

### After Linking Account
- **Toast Notification**: "Google account linked successfully!"
- **Status Update**: Card updates to show linked status
- **Button Change**: "Link" button changes to "Unlink"

### After Unlinking Account
- **Toast Notification**: "Google account unlinked successfully!"
- **Status Update**: Card updates to show not linked
- **Button Change**: "Unlink" button changes to "Link"

---

## Responsive Design

### Mobile (320px - 767px)
- **Google Button**: Full width, 48px height
- **Divider**: Full width, 24px margins
- **Form**: Full width, stacked
- **Account Settings**: Single column, cards stack vertically
- **Modal**: Full-screen on mobile, bottom sheet style

### Tablet (768px - 1023px)
- **Google Button**: Full width, 48px height
- **Form**: Max-width: 448px, centered
- **Account Settings**: Single column, cards side-by-side if space allows

### Desktop (1024px+)
- **Google Button**: Full width, 48px height
- **Form**: Max-width: 448px, centered
- **Account Settings**: Cards in grid (2 columns if space allows)

---

## Color & Typography

### Google Button Colors
- **Background**: `#FFFFFF` (white)
- **Text**: `#3c4043` (Google gray)
- **Border**: `#dadce0` (light gray)
- **Hover Shadow**: `rgba(0, 0, 0, 0.1)`
- **Active Background**: `#f8f9fa` (light gray)

### Status Colors
- **Linked**: `var(--pl-green)` (#00ff87)
- **Not Linked**: `#6b7280` (gray-500)
- **Error**: `var(--pl-pink)` (#e90052)
- **Success**: `var(--pl-green)` (#00ff87)

### Typography
- **Button Text**: 14px, medium weight
- **Status Badge**: 12px, semibold
- **Card Title**: 16px, bold
- **Card Email**: 14px, regular, muted color
- **Error Text**: 14px, regular

---

## Interaction States

### GoogleSignInButton
- **Default**: White background, Google logo + text
- **Hover**: Shadow elevation, slight scale
- **Active**: Darker background, pressed effect
- **Loading**: Spinner, disabled
- **Disabled**: 50% opacity, no interactions

### Account Settings Cards
- **Default**: Glass morphism, standard appearance
- **Hover**: Slight background brightness increase
- **Click**: (If card is clickable) Scale effect

### Link/Unlink Buttons
- **Default**: Secondary button style
- **Hover**: Background brightness increase
- **Active**: Pressed effect
- **Loading**: Spinner, disabled

---

## Accessibility

### WCAG AA Compliance
- **Contrast**: Google button (white on gray) meets 4.5:1 ratio
- **Text Size**: Minimum 14px for readability
- **Touch Targets**: Minimum 48x48px for mobile

### Screen Reader Support
- **ARIA Labels**: 
  - Google button: `aria-label="Continue with Google"`
  - Status badges: `aria-label="Google account linked"` or `"Google account not linked"`
- **Roles**: `button` role for all interactive elements
- **States**: `aria-disabled` for disabled buttons, `aria-busy` for loading

### Keyboard Navigation
- **Tab Order**: Google button → Email field → Password field → Submit button
- **Focus**: Clear focus indicator (outline)
- **Enter Key**: Activates Google sign-in button when focused

---

## Google Branding Guidelines

### Required Elements
- **Google Logo**: Must use official Google logo (G icon)
- **Colors**: White background, Google-approved text color
- **Spacing**: 12px between logo and text
- **Typography**: 14px, medium weight, readable font

### Approved Text Variations
- "Continue with Google" ✅ (Recommended)
- "Sign in with Google" ✅
- "Sign up with Google" ✅

### Button Style
- **Full-width or fixed-width**: Both acceptable
- **Rounded corners**: Recommended (8px)
- **Height**: Minimum 40px, recommended 48px
- **Padding**: Adequate padding for touch targets

---

## Integration Points

### Where Google Button Appears

1. **Login Page** (`/login`):
   - Above email/password form
   - Divider between Google and email

2. **Register Page** (`/register`):
   - Above email/password form
   - Divider between Google and email

3. **Account Settings** (if exists):
   - In "Authentication Methods" section
   - Link/unlink Google account buttons

### User Flows

1. **New User Sign-Up**:
   - Click "Continue with Google"
   - Google OAuth popup
   - Account created automatically
   - Redirected to dashboard

2. **Existing User Sign-In**:
   - Click "Continue with Google"
   - Google OAuth popup
   - Signed in automatically
   - Redirected to dashboard

3. **Link Google to Existing Account**:
   - Sign in with email/password
   - Go to account settings
   - Click "Link Google Account"
   - Google OAuth popup
   - Account linked

4. **Account Merging**:
   - Sign in with Google
   - Email already exists
   - Modal shows options
   - User chooses action

---

**Design Specification Complete** ✅  
**Ready for Developer Implementation** 🚀

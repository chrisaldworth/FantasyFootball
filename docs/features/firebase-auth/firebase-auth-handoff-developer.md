# Firebase Authentication - Developer Handoff

**Date**: 2025-12-21  
**From**: UI Designer Agent  
**To**: Developer Agent  
**Status**: ✅ Design Complete, Ready for Implementation  
**Priority**: P1 (Firebase Authentication with Google Sign-In)

---

## Overview

Complete implementation guide for Firebase Authentication integration with Google Sign-In. This document provides step-by-step instructions, code examples, and implementation details for all authentication UI components.

**Reference Documents**:
- Design Specification: `firebase-auth-design-spec.md` ⭐ **START HERE**
- Requirements: `firebase-auth-requirements.md`
- Handoff: `firebase-auth-handoff-ui-designer.md`

---

## Design Specification

**Full Design Spec**: `docs/features/firebase-auth/firebase-auth-design-spec.md`

**Key Design Decisions**:
- Google button placed **above** email form (prominent placement)
- Full-width button with rounded corners (48px height)
- "Continue with Google" text (modern, action-oriented)
- Divider with "or" text between Google and email
- Card-based account settings layout
- Status badges (green ✓ for linked, gray ✗ for not linked)
- Inline error messages (same style as existing)
- Button disabled + spinner for loading states

---

## Implementation Tasks

### Task 1: Install Firebase SDK

**Install Firebase JavaScript SDK**:
```bash
cd frontend
npm install firebase
```

---

### Task 2: Create Firebase Configuration

**File**: `frontend/src/lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication
export const auth = getAuth(app);

// Configure Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account', // Always show account picker
});
```

**Environment Variables** (`.env.local`):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

---

### Task 3: Create Firebase Auth Service

**File**: `frontend/src/lib/firebase-auth.ts`

```typescript
import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { authApi } from './api';

export async function signInWithGoogle(): Promise<void> {
  try {
    // Use popup for desktop, redirect for mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use redirect for mobile
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    
    // Use popup for desktop
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    // Send token to backend for verification
    const response = await authApi.verifyFirebaseToken(idToken);
    
    // Store backend JWT token
    localStorage.setItem('token', response.access_token);
    
    // Return to allow auth context to update
    return;
  } catch (error: any) {
    console.error('[Firebase Auth] Error:', error);
    
    // Handle specific errors
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('This Google account is already linked to another account.');
    } else {
      throw new Error('Authentication failed. Please try again.');
    }
  }
}

export async function handleRedirectResult(): Promise<void> {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      const idToken = await result.user.getIdToken();
      const response = await authApi.verifyFirebaseToken(idToken);
      localStorage.setItem('token', response.access_token);
      return;
    }
  } catch (error: any) {
    console.error('[Firebase Auth] Redirect error:', error);
    throw error;
  }
}

export async function linkGoogleAccount(): Promise<void> {
  try {
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    await authApi.linkGoogleAccount(idToken);
  } catch (error: any) {
    console.error('[Firebase Auth] Link error:', error);
    throw error;
  }
}
```

---

### Task 4: Create GoogleSignInButton Component

**File**: `frontend/src/components/auth/GoogleSignInButton.tsx`

```tsx
'use client';

import { useState } from 'react';
import { signInWithGoogle } from '@/lib/firebase-auth';

interface GoogleSignInButtonProps {
  variant?: 'signin' | 'signup' | 'link';
  onSuccess?: () => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function GoogleSignInButton({
  variant = 'signin',
  onSuccess,
  onError,
  className = '',
}: GoogleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
      onSuccess?.();
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={`
        w-full h-12 px-4 rounded-lg
        bg-white text-[#3c4043]
        border border-[#dadce0]
        font-medium text-sm
        flex items-center justify-center gap-3
        hover:shadow-md hover:scale-[1.01]
        active:scale-[0.99] active:bg-[#f8f9fa]
        disabled:opacity-50 disabled:cursor-wait disabled:hover:scale-100
        transition-all duration-150
        ${className}
      `}
      aria-label="Continue with Google"
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Signing in...</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <g fill="#000" fillRule="evenodd">
              <path
                d="M9 3.48c1.69 0 2.83.73 3.48 1.34l2.54-2.48C13.46.89 11.43 0 9 0 5.48 0 2.44 2.02.96 4.96l2.91 2.26C4.6 5.05 6.62 3.48 9 3.48z"
                fill="#EA4335"
              />
              <path
                d="M17.64 9.2c0-.74-.06-1.28-.19-1.84H9v3.34h4.96c-.21 1.18-.84 2.18-1.84 2.85l2.84 2.2c2.07-1.9 3.26-4.7 3.26-8.55z"
                fill="#4285F4"
              />
              <path
                d="M3.88 10.78l-2.92-2.26C.93 9.98 0 11.43 0 13c0 1.57.93 3.02 2.96 4.48l2.92-2.26c-.87-.58-1.47-1.49-1.47-2.74 0-1.25.6-2.16 1.47-2.74z"
                fill="#FBBC05"
              />
              <path
                d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.84-2.2c-.76.53-1.78.9-3.12.9-2.38 0-4.4-1.57-5.12-3.74L.96 13.04C2.45 15.98 5.48 18 9 18z"
                fill="#34A853"
              />
            </g>
          </svg>
          <span>Continue with Google</span>
        </>
      )}
    </button>
  );
}
```

---

### Task 5: Create Divider Component

**File**: `frontend/src/components/auth/AuthDivider.tsx`

```tsx
export default function AuthDivider() {
  return (
    <div className="flex items-center gap-4 my-6">
      <div className="flex-1 h-px bg-white/10" />
      <span className="text-sm text-[var(--pl-text-muted)]">or</span>
      <div className="flex-1 h-px bg-white/10" />
    </div>
  );
}
```

---

### Task 6: Update Login Page

**File**: `frontend/src/app/login/page.tsx`

Add Google sign-in button above the email form:

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import TopNavigation from '@/components/navigation/TopNavigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AuthDivider from '@/components/auth/AuthDivider';

export default function LoginPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleSuccess = async () => {
    await checkAuth();
    router.push('/dashboard');
  };

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  // ... existing handleSubmit ...

  return (
    <div className="min-h-screen">
      <TopNavigation
        showFavoriteTeam={false}
        showNotifications={false}
        showLinkFPL={false}
      />
      
      <div className="flex items-center justify-center px-4 sm:px-6 py-8 pt-14 sm:pt-16">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full blur-[128px] opacity-20" style={{ backgroundColor: 'var(--pl-green)' }} />
          <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full blur-[128px] opacity-20" style={{ backgroundColor: 'var(--pl-pink)' }} />
        </div>

        <div className="w-full max-w-md relative">
          <div className="glass rounded-2xl p-6 sm:p-8 animate-slide-up">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
              <p className="text-[var(--pl-text-muted)]">Sign in to access your dashboard</p>
            </div>

            {/* Google Sign-In Button */}
            <GoogleSignInButton
              variant="signin"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />

            {/* Divider */}
            <AuthDivider />

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
                  {error}
                </div>
              )}

              {/* ... existing form fields ... */}
            </form>

            {/* ... existing sign up link ... */}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 7: Update Register Page

**File**: `frontend/src/app/register/page.tsx`

Add Google sign-in button above the email form (same pattern as login page).

---

### Task 8: Update API Client

**File**: `frontend/src/lib/api.ts`

Add Firebase auth methods:

```typescript
export const authApi = {
  // ... existing methods ...

  verifyFirebaseToken: async (idToken: string) => {
    const response = await api.post('/api/auth/firebase/verify', { id_token: idToken });
    return response.data;
  },

  linkGoogleAccount: async (idToken: string) => {
    const response = await api.post('/api/auth/link-google', { id_token: idToken });
    return response.data;
  },

  unlinkGoogleAccount: async () => {
    const response = await api.delete('/api/auth/unlink-google');
    return response.data;
  },

  getAuthMethods: async () => {
    const response = await api.get('/api/auth/methods');
    return response.data;
  },
};
```

---

### Task 9: Create AccountSettingsAuthSection Component

**File**: `frontend/src/components/account/AccountSettingsAuthSection.tsx`

```tsx
'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';

interface AuthMethod {
  email: { linked: boolean; email?: string };
  google: { linked: boolean; email?: string };
}

export default function AccountSettingsAuthSection() {
  const [authMethods, setAuthMethods] = useState<AuthMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAuthMethods();
  }, []);

  const fetchAuthMethods = async () => {
    try {
      const data = await authApi.getAuthMethods();
      setAuthMethods(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load auth methods');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      setError('');
      setSuccess('');
      // GoogleSignInButton will handle the OAuth flow
      // After successful link, refresh auth methods
      await fetchAuthMethods();
      setSuccess('Google account linked successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to link Google account');
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm('Are you sure you want to unlink your Google account? You will only be able to sign in with email/password.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      await authApi.unlinkGoogleAccount();
      await fetchAuthMethods();
      setSuccess('Google account unlinked successfully!');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to unlink Google account');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold mb-4">Authentication Methods</h2>
        
        {error && (
          <div className="p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)] mb-4">
            {error}
          </div>
        )}

        {success && (
          <div className="p-4 rounded-lg bg-[var(--pl-green)]/10 border border-[var(--pl-green)]/30 text-[var(--pl-green)] mb-4">
            {success}
          </div>
        )}

        <div className="space-y-4">
          {/* Email/Password Card */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-base mb-1">Email/Password</div>
                {authMethods?.email.email && (
                  <div className="text-sm text-[var(--pl-text-muted)]">{authMethods.email.email}</div>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                authMethods?.email.linked
                  ? 'bg-[var(--pl-green)] text-white'
                  : 'bg-gray-600 text-white'
              }`}>
                {authMethods?.email.linked ? '✓ Linked' : '✗ Not linked'}
              </span>
            </div>
          </div>

          {/* Google Card */}
          <div className="glass rounded-xl p-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="font-semibold text-base mb-1">Google</div>
                {authMethods?.google.email && (
                  <div className="text-sm text-[var(--pl-text-muted)]">{authMethods.google.email}</div>
                )}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                authMethods?.google.linked
                  ? 'bg-[var(--pl-green)] text-white'
                  : 'bg-gray-600 text-white'
              }`}>
                {authMethods?.google.linked ? '✓ Linked' : '✗ Not linked'}
              </span>
            </div>
            
            {authMethods?.google.linked ? (
              <button
                onClick={handleUnlinkGoogle}
                className="w-full py-2 px-4 rounded-lg bg-[var(--pl-pink)]/20 hover:bg-[var(--pl-pink)]/30 text-[var(--pl-pink)] font-semibold text-sm transition-colors"
              >
                Unlink Google Account
              </button>
            ) : (
              <GoogleSignInButton
                variant="link"
                onSuccess={handleLinkGoogle}
                onError={(err) => setError(err)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

---

### Task 10: Handle Redirect Result (Mobile)

**File**: `frontend/src/app/login/page.tsx` and `frontend/src/app/register/page.tsx`

Add redirect result handling:

```tsx
import { useEffect } from 'react';
import { handleRedirectResult } from '@/lib/firebase-auth';

export default function LoginPage() {
  // ... existing code ...

  useEffect(() => {
    // Handle Firebase redirect result (for mobile)
    handleRedirectResult()
      .then(() => {
        checkAuth();
        router.push('/dashboard');
      })
      .catch((error) => {
        // Only show error if user actually tried to sign in
        if (error.message && !error.message.includes('cancelled')) {
          setError(error.message);
        }
      });
  }, []);

  // ... rest of component ...
}
```

---

## Backend API Endpoints

### Required Endpoints

1. **POST /api/auth/firebase/verify**
   - Body: `{ "id_token": string }`
   - Response: `{ "access_token": string, "user": UserRead }`
   - Verify Firebase ID token and return backend JWT

2. **POST /api/auth/link-google**
   - Body: `{ "id_token": string }`
   - Response: `{ "success": bool, "message": string }`
   - Link Google account to current user

3. **DELETE /api/auth/unlink-google**
   - Response: `{ "success": bool, "message": string }`
   - Unlink Google account from current user

4. **GET /api/auth/methods**
   - Response: `{ "email": { "linked": bool, "email": string }, "google": { "linked": bool, "email": string } }`
   - Get auth methods for current user

---

## Testing Checklist

### Functionality
- [ ] Google sign-in button displays correctly
- [ ] Google OAuth popup/redirect works
- [ ] Firebase token verification works
- [ ] Backend JWT token created and stored
- [ ] User logged in after Google sign-in
- [ ] Account created for new users
- [ ] Account linking works
- [ ] Account unlinking works
- [ ] Error handling works (cancelled, network errors)
- [ ] Loading states display correctly

### Integration
- [ ] Login page shows Google button
- [ ] Register page shows Google button
- [ ] Account settings shows auth methods
- [ ] Auth context updates after Google sign-in
- [ ] Redirect to dashboard works
- [ ] Existing email/password auth still works

### Responsive
- [ ] Mobile: Google button works (redirect flow)
- [ ] Desktop: Google button works (popup flow)
- [ ] Tablet: Google button works
- [ ] Account settings responsive

### Accessibility
- [ ] WCAG AA contrast ratios
- [ ] Keyboard navigation works
- [ ] Screen reader support (ARIA labels)
- [ ] Focus indicators visible
- [ ] Touch targets minimum 48x48px

---

**Handoff Complete** ✅  
**Ready for Implementation** 🚀

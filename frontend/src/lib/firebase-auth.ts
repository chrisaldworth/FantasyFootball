import { signInWithPopup, signInWithRedirect, getRedirectResult, linkWithPopup, linkWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { authApi } from './api';

// Session storage key to track redirect sign-in in progress
const REDIRECT_SIGNIN_KEY = 'firebase_redirect_signin';

/**
 * Helper function to process Firebase sign-in result
 */
async function processSignInResult(result: any): Promise<{ token: string; isNewUser: boolean }> {
  const idToken = await result.user.getIdToken();
  
  console.log('[Firebase Auth] Got ID token, verifying with backend...');
  
  // Send token to backend for verification
  const response = await authApi.verifyFirebaseToken(idToken);
  
  // Store backend JWT token
  localStorage.setItem('token', response.access_token);
  
  // Clear redirect flag if it exists
  sessionStorage.removeItem(REDIRECT_SIGNIN_KEY);
  
  return {
    token: response.access_token,
    isNewUser: response.is_new_user || false,
  };
}

/**
 * Sign in with Google using popup
 * On mobile, if popup is blocked, falls back to redirect flow
 * Returns the backend JWT token on success
 */
export async function signInWithGoogle(): Promise<{ token: string; isNewUser: boolean }> {
  try {
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // First, try popup for all devices (including mobile)
    // Modern mobile browsers support popups better than redirect flow
    // due to Safari ITP and third-party cookie restrictions
    try {
      console.log('[Firebase Auth] Attempting popup sign-in...');
      const result = await signInWithPopup(auth, googleProvider);
      return await processSignInResult(result);
    } catch (popupError: any) {
      console.log('[Firebase Auth] Popup error:', popupError.code, popupError.message);
      
      // If popup was blocked on mobile, fall back to redirect
      if (isMobile && (
        popupError.code === 'auth/popup-blocked' || 
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      )) {
        console.log('[Firebase Auth] Popup blocked/closed on mobile, falling back to redirect...');
        // Store the current page to know where to return and that we initiated a redirect
        sessionStorage.setItem(REDIRECT_SIGNIN_KEY, window.location.pathname);
        await signInWithRedirect(auth, googleProvider);
        // This line won't be reached as the page redirects
        return { token: '', isNewUser: false };
      }
      
      // Re-throw the error for non-mobile or other errors
      throw popupError;
    }
  } catch (error: any) {
    console.error('[Firebase Auth] Sign-in error:', error);
    
    // Log full error details for debugging
    if (error.response) {
      console.error('[Firebase Auth] Backend response status:', error.response.status);
      console.error('[Firebase Auth] Backend response data:', error.response.data);
    }
    
    // Handle specific Firebase errors
    if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('Sign-in cancelled. Please try again.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection.');
    } else if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('This Google account is already linked to another account.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site or try again.');
    } else if (error.response?.data?.detail) {
      // Backend error with detail message
      const detail = error.response.data.detail;
      console.error('[Firebase Auth] Backend error detail:', detail);
      throw new Error(detail);
    } else if (error.response?.status === 500) {
      // Generic 500 error - show more info
      const errorData = error.response?.data;
      const detail = typeof errorData === 'string' ? errorData : JSON.stringify(errorData);
      console.error('[Firebase Auth] 500 error data:', detail);
      throw new Error(`Server error: ${detail || 'Internal server error'}`);
    } else {
      throw new Error(error.message || 'Authentication failed. Please try again.');
    }
  }
}

/**
 * Handle redirect result after returning from Google sign-in (mobile)
 * Also handles cases where getRedirectResult fails but user is already authenticated
 */
export async function handleRedirectResult(): Promise<{ token: string; isNewUser: boolean } | null> {
  try {
    // Check if we were in the middle of a redirect sign-in
    const wasRedirectSignIn = sessionStorage.getItem(REDIRECT_SIGNIN_KEY);
    
    // Try to get the redirect result first
    const result = await getRedirectResult(auth);
    
    if (result) {
      console.log('[Firebase Auth] Got redirect result, verifying with backend...');
      sessionStorage.removeItem(REDIRECT_SIGNIN_KEY);
      return await processSignInResult(result);
    }
    
    // If no redirect result but we were expecting one (redirect was initiated),
    // check if the user is already signed in via Firebase Auth state
    // This handles Safari ITP issues where getRedirectResult returns null
    if (wasRedirectSignIn && auth.currentUser) {
      console.log('[Firebase Auth] No redirect result but user is authenticated, processing...');
      sessionStorage.removeItem(REDIRECT_SIGNIN_KEY);
      
      const idToken = await auth.currentUser.getIdToken();
      const response = await authApi.verifyFirebaseToken(idToken);
      localStorage.setItem('token', response.access_token);
      
      return {
        token: response.access_token,
        isNewUser: response.is_new_user || false,
      };
    }
    
    // Clear the flag if it exists and no auth happened
    if (wasRedirectSignIn) {
      console.log('[Firebase Auth] Redirect was initiated but no auth result found');
      sessionStorage.removeItem(REDIRECT_SIGNIN_KEY);
    }
    
    return null;
  } catch (error: any) {
    console.error('[Firebase Auth] Redirect error:', error);
    sessionStorage.removeItem(REDIRECT_SIGNIN_KEY);
    
    if (error.code === 'auth/account-exists-with-different-credential') {
      throw new Error('This Google account is already linked to another account.');
    }
    throw error;
  }
}

/**
 * Link Google account to existing user account
 */
export async function linkGoogleAccount(): Promise<void> {
  try {
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    // Try popup first for all devices
    try {
      console.log('[Firebase Auth] Attempting popup for linking...');
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      
      console.log('[Firebase Auth] Linking Google account...');
      await authApi.linkGoogleAccount(idToken);
      return;
    } catch (popupError: any) {
      console.log('[Firebase Auth] Link popup error:', popupError.code, popupError.message);
      
      // If popup was blocked on mobile, fall back to redirect
      if (isMobile && (
        popupError.code === 'auth/popup-blocked' || 
        popupError.code === 'auth/popup-closed-by-user' ||
        popupError.code === 'auth/cancelled-popup-request'
      )) {
        console.log('[Firebase Auth] Popup blocked on mobile, falling back to redirect for linking...');
        sessionStorage.setItem(REDIRECT_SIGNIN_KEY, window.location.pathname);
        await signInWithRedirect(auth, googleProvider);
        return;
      }
      
      // Re-throw for non-mobile or other errors
      throw popupError;
    }
  } catch (error: any) {
    console.error('[Firebase Auth] Link error:', error);
    
    if (error.code === 'auth/credential-already-in-use') {
      throw new Error('This Google account is already linked to another user.');
    } else if (error.code === 'auth/popup-closed-by-user' || error.code === 'auth/cancelled-popup-request') {
      throw new Error('Linking cancelled. Please try again.');
    } else if (error.code === 'auth/popup-blocked') {
      throw new Error('Popup was blocked. Please allow popups for this site or try again.');
    } else if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
}

/**
 * Unlink Google account from current user
 */
export async function unlinkGoogleAccount(): Promise<void> {
  try {
    console.log('[Firebase Auth] Unlinking Google account...');
    await authApi.unlinkGoogleAccount();
  } catch (error: any) {
    console.error('[Firebase Auth] Unlink error:', error);
    if (error.response?.data?.detail) {
      throw new Error(error.response.data.detail);
    }
    throw error;
  }
}

/**
 * Sign out from Firebase
 */
export async function signOutFirebase(): Promise<void> {
  try {
    await auth.signOut();
  } catch (error) {
    console.error('[Firebase Auth] Sign out error:', error);
  }
}

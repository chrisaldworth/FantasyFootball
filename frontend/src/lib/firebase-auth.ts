import { signInWithPopup, signInWithRedirect, getRedirectResult, linkWithPopup, linkWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { authApi } from './api';

/**
 * Sign in with Google using popup (desktop) or redirect (mobile)
 * Returns the backend JWT token on success
 */
export async function signInWithGoogle(): Promise<{ token: string; isNewUser: boolean }> {
  try {
    // Use popup for desktop, redirect for mobile
    const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // Use redirect for mobile - this will navigate away and back
      await signInWithRedirect(auth, googleProvider);
      // This line won't be reached as the page redirects
      return { token: '', isNewUser: false };
    }
    
    // Use popup for desktop
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    console.log('[Firebase Auth] Got ID token, verifying with backend...');
    
    // Send token to backend for verification
    const response = await authApi.verifyFirebaseToken(idToken);
    
    // Store backend JWT token
    localStorage.setItem('token', response.access_token);
    
    return {
      token: response.access_token,
      isNewUser: response.is_new_user || false,
    };
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
      throw new Error('Popup was blocked. Please allow popups for this site.');
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
 */
export async function handleRedirectResult(): Promise<{ token: string; isNewUser: boolean } | null> {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('[Firebase Auth] Got redirect result, verifying with backend...');
      const idToken = await result.user.getIdToken();
      const response = await authApi.verifyFirebaseToken(idToken);
      localStorage.setItem('token', response.access_token);
      return {
        token: response.access_token,
        isNewUser: response.is_new_user || false,
      };
    }
    return null;
  } catch (error: any) {
    console.error('[Firebase Auth] Redirect error:', error);
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
    
    if (isMobile) {
      await signInWithRedirect(auth, googleProvider);
      return;
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    const idToken = await result.user.getIdToken();
    
    console.log('[Firebase Auth] Linking Google account...');
    await authApi.linkGoogleAccount(idToken);
  } catch (error: any) {
    console.error('[Firebase Auth] Link error:', error);
    
    if (error.code === 'auth/credential-already-in-use') {
      throw new Error('This Google account is already linked to another user.');
    } else if (error.code === 'auth/popup-closed-by-user') {
      throw new Error('Linking cancelled. Please try again.');
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

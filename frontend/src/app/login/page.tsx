'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import TopNavigation from '@/components/navigation/TopNavigation';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AppleSignInButton from '@/components/auth/AppleSignInButton';
import AuthDivider from '@/components/auth/AuthDivider';
import { handleRedirectResult } from '@/lib/firebase-auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, checkAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  // Handle Firebase redirect result (for mobile)
  useEffect(() => {
    handleRedirectResult()
      .then(async (result) => {
        if (result) {
          await checkAuth();
          router.push('/dashboard');
        }
      })
      .catch((error) => {
        // Only show error if user actually tried to sign in
        if (error.message && !error.message.includes('cancelled')) {
          setError(error.message);
        }
      })
      .finally(() => {
        setCheckingRedirect(false);
      });
  }, [checkAuth, router]);

  const handleGoogleSuccess = async (isNewUser?: boolean) => {
    await checkAuth();
    if (isNewUser) {
      // New user - could show onboarding
      router.push('/dashboard');
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      console.error('[Login Page] Error:', err);
      if (err.response) {
        // Backend responded with an error
        const errorMsg = err.response?.data?.detail || err.response?.data?.error || 'Login failed. Please check your credentials.';
        setError(errorMsg);
      } else if (err.request) {
        // Request was made but no response received (network/CORS issue)
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        setError(`Cannot connect to backend server (${apiUrl}). Please check your connection or contact support if this persists.`);
      } else {
        // Something else happened
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking for redirect result
  if (checkingRedirect) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--pl-green)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
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

        {/* Login Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
            <p className="text-[var(--pl-text-muted)]">Sign in to access your dashboard</p>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="space-y-3">
            <GoogleSignInButton
              variant="signin"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            <AppleSignInButton
              variant="signin"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>

          {/* Divider */}
          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
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
                  Signing in...
                </span>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[var(--pl-text-muted)]">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="text-[var(--pl-green)] hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}

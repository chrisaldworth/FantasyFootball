'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import TopNavigation from '@/components/navigation/TopNavigation';
import OnboardingWizard from '@/components/OnboardingWizard';
import GoogleSignInButton from '@/components/auth/GoogleSignInButton';
import AppleSignInButton from '@/components/auth/AppleSignInButton';
import AuthDivider from '@/components/auth/AuthDivider';
import { handleRedirectResult } from '@/lib/firebase-auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, checkAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checkingRedirect, setCheckingRedirect] = useState(true);

  // Handle Firebase redirect result (for mobile)
  useEffect(() => {
    handleRedirectResult()
      .then(async (result) => {
        if (result) {
          await checkAuth();
          if (result.isNewUser) {
            setShowOnboarding(true);
          } else {
            router.push('/dashboard');
          }
        }
      })
      .catch((error) => {
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
      setShowOnboarding(true);
    } else {
      router.push('/dashboard');
    }
  };

  const handleGoogleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      await register(formData.email, formData.username, formData.password);
      // Show onboarding wizard after successful registration
      setShowOnboarding(true);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingClose = () => {
    setShowOnboarding(false);
    router.push('/dashboard');
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
      
      <div className="flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12 pt-14 sm:pt-16">
        {/* Background decoration */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[var(--pl-cyan)] rounded-full blur-[128px] opacity-20" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[var(--pl-green)] rounded-full blur-[128px] opacity-20" />
        </div>

        <div className="w-full max-w-md relative">
        {/* Register Card */}
        <div className="glass rounded-2xl p-6 sm:p-8 animate-slide-up">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">Create Account</h1>
            <p className="text-[var(--pl-text-muted)]">Start your journey to FPL glory</p>
          </div>

          {/* Social Sign-In Buttons */}
          <div className="space-y-3">
            <GoogleSignInButton
              variant="signup"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
            <AppleSignInButton
              variant="signup"
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>

          {/* Divider */}
          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-5">
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
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="input-field"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                className="input-field"
                placeholder="fpl_champion"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
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
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-[var(--pl-text-muted)]">
            Already have an account?{' '}
            <Link href="/login" className="text-[var(--pl-green)] hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
        </div>
      </div>

      {/* Onboarding Wizard - shown after successful registration */}
      <OnboardingWizard
        isOpen={showOnboarding}
        onClose={handleOnboardingClose}
        onComplete={() => router.push('/fantasy-football')}
      />
    </div>
  );
}

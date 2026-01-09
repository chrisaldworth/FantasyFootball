'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api';
import { linkGoogleAccount, unlinkGoogleAccount } from '@/lib/firebase-auth';

interface AuthMethods {
  email: { linked: boolean; email?: string | null };
  google: { linked: boolean; email?: string | null };
}

export default function AccountSettingsAuthSection() {
  const [authMethods, setAuthMethods] = useState<AuthMethods | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchAuthMethods();
  }, []);

  const fetchAuthMethods = async () => {
    try {
      setLoading(true);
      const data = await authApi.getAuthMethods();
      setAuthMethods(data);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load authentication methods');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkGoogle = async () => {
    try {
      setError('');
      setSuccess('');
      setActionLoading(true);
      
      await linkGoogleAccount();
      await fetchAuthMethods();
      setSuccess('Google account linked successfully!');
    } catch (err: any) {
      setError(err.message || err.response?.data?.detail || 'Failed to link Google account');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUnlinkGoogle = async () => {
    if (!confirm('Are you sure you want to unlink your Google account? You will only be able to sign in with email/password.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');
      setActionLoading(true);
      
      await unlinkGoogleAccount();
      await fetchAuthMethods();
      setSuccess('Google account unlinked successfully!');
    } catch (err: any) {
      setError(err.message || err.response?.data?.detail || 'Failed to unlink Google account');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-white/10 rounded w-48"></div>
          <div className="h-20 bg-white/10 rounded"></div>
          <div className="h-20 bg-white/10 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <h2 className="text-xl font-bold mb-6">Authentication Methods</h2>
      
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
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <div className="font-semibold">Email/Password</div>
                {authMethods?.email.email && (
                  <div className="text-sm text-[var(--pl-text-muted)]">{authMethods.email.email}</div>
                )}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
              authMethods?.email.linked
                ? 'bg-[var(--pl-green)] text-white'
                : 'bg-gray-600 text-white'
            }`}>
              {authMethods?.email.linked ? '✓ Linked' : '✗ Not set'}
            </span>
          </div>
        </div>

        {/* Google Card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                <svg width="20" height="20" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                  <g fill="none" fillRule="evenodd">
                    <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                    <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                  </g>
                </svg>
              </div>
              <div>
                <div className="font-semibold">Google</div>
                {authMethods?.google.email && (
                  <div className="text-sm text-[var(--pl-text-muted)]">{authMethods.google.email}</div>
                )}
              </div>
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
              disabled={actionLoading}
              className="w-full py-2.5 px-4 rounded-lg bg-[var(--pl-pink)]/20 hover:bg-[var(--pl-pink)]/30 text-[var(--pl-pink)] font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {actionLoading ? 'Unlinking...' : 'Unlink Google Account'}
            </button>
          ) : (
            <button
              onClick={handleLinkGoogle}
              disabled={actionLoading}
              className="w-full h-11 px-4 rounded-lg bg-white text-[#3c4043] border border-[#dadce0] font-medium text-sm flex items-center justify-center gap-3 hover:shadow-md hover:bg-[#f8f9fa] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {actionLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-[#3c4043]" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  <span>Linking...</span>
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
                    <g fill="none" fillRule="evenodd">
                      <path d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
                      <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </g>
                  </svg>
                  <span>Link Google Account</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      <p className="mt-4 text-xs text-[var(--pl-text-muted)]">
        Linking multiple authentication methods allows you to sign in using either option.
      </p>
    </div>
  );
}

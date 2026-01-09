'use client';

import { useState } from 'react';
import { signInWithGoogle, linkGoogleAccount } from '@/lib/firebase-auth';

interface GoogleSignInButtonProps {
  variant?: 'signin' | 'signup' | 'link';
  onSuccess?: (isNewUser?: boolean) => void;
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
      if (variant === 'link') {
        await linkGoogleAccount();
        onSuccess?.();
      } else {
        const result = await signInWithGoogle();
        onSuccess?.(result.isNewUser);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Authentication failed. Please try again.';
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const buttonText = {
    signin: 'Continue with Google',
    signup: 'Sign up with Google',
    link: 'Link Google Account',
  }[variant];

  const loadingText = {
    signin: 'Signing in...',
    signup: 'Creating account...',
    link: 'Linking...',
  }[variant];

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
        hover:shadow-md hover:bg-[#f8f9fa]
        active:bg-[#f1f3f4]
        disabled:opacity-60 disabled:cursor-wait disabled:hover:shadow-none disabled:hover:bg-white
        transition-all duration-150
        ${className}
      `}
      aria-label={buttonText}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-[#3c4043]" viewBox="0 0 24 24">
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
          <span>{loadingText}</span>
        </>
      ) : (
        <>
          {/* Google Logo SVG - Official colors */}
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <g fill="none" fillRule="evenodd">
              <path
                d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 01-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
                fill="#4285F4"
              />
              <path
                d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z"
                fill="#34A853"
              />
              <path
                d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
                fill="#FBBC05"
              />
              <path
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
                fill="#EA4335"
              />
            </g>
          </svg>
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}

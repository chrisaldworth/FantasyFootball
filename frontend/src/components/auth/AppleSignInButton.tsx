'use client';

import { useState } from 'react';
import { signInWithApple, linkAppleAccount } from '@/lib/firebase-auth';

interface AppleSignInButtonProps {
  variant?: 'signin' | 'signup' | 'link';
  onSuccess?: (isNewUser?: boolean) => void;
  onError?: (error: string) => void;
  className?: string;
}

export default function AppleSignInButton({
  variant = 'signin',
  onSuccess,
  onError,
  className = '',
}: AppleSignInButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      if (variant === 'link') {
        await linkAppleAccount();
        onSuccess?.();
      } else {
        const result = await signInWithApple();
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
    signin: 'Continue with Apple',
    signup: 'Sign up with Apple',
    link: 'Link Apple Account',
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
        bg-black text-white
        border border-black
        font-medium text-sm
        flex items-center justify-center gap-3
        hover:bg-[#333] hover:border-[#333]
        active:bg-[#1a1a1a]
        disabled:opacity-60 disabled:cursor-wait disabled:hover:bg-black disabled:hover:border-black
        transition-all duration-150
        ${className}
      `}
      aria-label={buttonText}
    >
      {loading ? (
        <>
          <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
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
          {/* Apple Logo SVG */}
          <svg width="18" height="18" viewBox="0 0 18 18" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M14.94 13.168c-.263.6-.573 1.152-.932 1.66-.49.693-.89 1.173-1.2 1.44-.478.439-.991.664-1.54.676-.394 0-.869-.112-1.424-.338-.556-.226-1.068-.338-1.534-.338-.49 0-1.015.112-1.576.338-.562.226-1.015.345-1.36.357-.526.022-1.051-.21-1.576-.696-.336-.29-.756-.788-1.26-1.494-.54-.756-.982-1.633-1.328-2.63C.74 10.918.525 9.728.525 8.573c0-1.323.286-2.464.858-3.42.45-.765 1.048-1.37 1.796-1.813a4.837 4.837 0 012.424-.665c.418 0 .966.13 1.648.385.68.256 1.116.386 1.308.386.143 0 .63-.152 1.458-.455.782-.28 1.442-.397 1.982-.35 1.465.117 2.566.693 3.3 1.73-1.31.794-1.958 1.906-1.944 3.333.013 1.111.415 2.036 1.205 2.77.358.34.758.602 1.2.787-.096.28-.198.547-.305.803zM11.37.36c0 .87-.318 1.683-.952 2.436-.766.897-1.692 1.415-2.697 1.334a2.713 2.713 0 01-.02-.33c0-.836.363-1.73.009-2.47C8.352.578 9.336.08 10.368.002c.012.12.018.24.018.358z"
              fill="currentColor"
              fillRule="evenodd"
            />
          </svg>
          <span>{buttonText}</span>
        </>
      )}
    </button>
  );
}

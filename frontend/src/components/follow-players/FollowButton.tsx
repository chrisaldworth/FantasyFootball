'use client';

import { useState } from 'react';

interface FollowButtonProps {
  playerId: number;
  playerName?: string;
  isFollowed: boolean;
  onToggle: (playerId: number, willFollow: boolean) => Promise<void>;
  size?: 'small' | 'medium' | 'large';
  variant?: 'icon' | 'button';
  className?: string;
}

export default function FollowButton({
  playerId,
  playerName,
  isFollowed,
  onToggle,
  size = 'medium',
  variant = 'icon',
  className = '',
}: FollowButtonProps) {
  const [loading, setLoading] = useState(false);

  const sizes = {
    small: 'w-6 h-6',
    medium: 'w-8 h-8',
    large: 'w-10 h-10',
  };

  const iconSizes = {
    small: 16,
    medium: 20,
    large: 24,
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      await onToggle(playerId, !isFollowed);
    } catch (error: any) {
      console.error('Failed to toggle follow:', error);
      // Error will be handled by parent component or toast notification
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`
        ${sizes[size]}
        flex items-center justify-center
        rounded-full
        transition-all duration-200
        hover:scale-110
        active:scale-95
        focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]
        ${isFollowed 
          ? 'text-[var(--pl-green)] hover:text-[var(--pl-green)]/80' 
          : 'text-[#999999] hover:text-[var(--pl-green)]'
        }
        ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      aria-label={isFollowed ? `Unfollow ${playerName || 'player'}` : `Follow ${playerName || 'player'}`}
      title={isFollowed ? `Unfollow ${playerName || 'player'}` : `Follow ${playerName || 'player'}`}
    >
      {loading ? (
        <svg
          className={`animate-spin ${sizes[size]}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : (
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 24 24"
          fill={isFollowed ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )}
    </button>
  );
}

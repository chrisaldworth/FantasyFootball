'use client';

import { useState } from 'react';
import Link from 'next/link';

interface PreviewCardProps {
  title: string;
  data: any; // Preview data
  blurIntensity?: number; // 0-10
  unlockText?: string;
  onUnlock?: () => void;
  href?: string;
}

export default function PreviewCard({
  title,
  data,
  blurIntensity = 5,
  unlockText = 'Sign up to unlock',
  onUnlock,
  href = '/register',
}: PreviewCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    if (onUnlock) {
      onUnlock();
    }
  };

  const cardContent = (
    <div
      className="glass rounded-xl p-6 relative overflow-hidden group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      {/* Blurred content */}
      <div
        className="transition-all duration-300"
        style={{
          filter: `blur(${isHovered ? blurIntensity * 0.5 : blurIntensity}px)`,
        }}
      >
        {data}
      </div>

      {/* Unlock overlay */}
      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--pl-dark)]/80 via-[var(--pl-dark)]/60 to-[var(--pl-dark)]/80 backdrop-blur-sm">
        <div className="text-center space-y-3">
          <div className="text-3xl mb-2">🔒</div>
          <div className="text-lg font-semibold text-white mb-1">{unlockText}</div>
          <div className="text-sm text-[var(--pl-text-muted)]">{title}</div>
          <Link
            href={href}
            className="btn-primary inline-block mt-4"
            onClick={(e) => e.stopPropagation()}
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );

  return cardContent;
}


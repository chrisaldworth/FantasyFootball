'use client';

import Link from 'next/link';
import { useState } from 'react';

interface FeatureCardProps {
  icon: string;
  title: string;
  description: string;
  color: string;
  href?: string;
  premium?: boolean;
}

export default function FeatureCard({
  icon,
  title,
  description,
  color,
  href,
  premium = false,
}: FeatureCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const cardContent = (
    <div
      className={`
        glass rounded-xl p-6 
        transition-all duration-300 ease-out
        hover:scale-[1.03] hover:border-[var(--pl-green)]/50
        hover:shadow-[0_10px_40px_rgba(0,255,135,0.15)]
        relative overflow-hidden group
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Animated background gradient on hover */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-[var(--pl-green)]/10
          transition-opacity duration-500
          ${isHovered ? 'opacity-100' : 'opacity-0'}
        `}
      />
      
      {/* Shimmer effect on hover */}
      <div
        className={`
          absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent
          -translate-x-full transition-transform duration-700
          ${isHovered ? 'translate-x-full' : ''}
        `}
      />
      
      {/* Icon with bounce animation on hover */}
      <div
        className={`
          w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4
          transition-all duration-300 relative z-10
          ${isHovered ? 'scale-110 rotate-3' : 'scale-100 rotate-0'}
        `}
        style={{ background: `${color}20` }}
      >
        <span className={isHovered ? 'animate-wiggle' : ''}>{icon}</span>
      </div>
      
      {/* Title with slide effect */}
      <h3
        className={`
          text-xl font-semibold mb-2 relative z-10
          transition-transform duration-300
          ${isHovered ? 'translate-x-1' : 'translate-x-0'}
        `}
      >
        {title}
      </h3>
      
      {/* Description */}
      <p className="text-[var(--pl-text-muted)] mb-3 relative z-10">{description}</p>
      
      {/* Premium badge with glow */}
      {premium && (
        <span
          className={`
            inline-block px-2 py-1 rounded bg-[var(--pl-purple)]/30 text-[var(--pl-purple)] 
            text-xs font-medium mb-3 relative z-10
            ${isHovered ? 'animate-pulse-glow' : ''}
          `}
        >
          Premium
        </span>
      )}
      
      {/* Learn More link with arrow animation */}
      {href && (
        <span className="inline-flex items-center gap-1 text-[var(--pl-green)] hover:underline text-sm font-medium relative z-10 group/link">
          Learn More
          <svg
            className={`
              w-4 h-4 transition-transform duration-300
              ${isHovered ? 'translate-x-1' : 'translate-x-0'}
            `}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="block focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)] rounded-xl"
      >
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}


'use client';

import { useState } from 'react';
import Link from 'next/link';

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  className?: string;
}

export default function CollapsibleSection({
  title,
  children,
  defaultExpanded = false,
  ctaLabel,
  ctaHref,
  className = '',
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <div className={`glass rounded-xl overflow-hidden ${className}`}>
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full px-4 sm:px-6 py-4 flex items-center justify-between hover:bg-white/5 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${title}`}
      >
        <h3 className="text-xl sm:text-2xl font-semibold text-white">{title}</h3>
        <svg
          className={`w-5 h-5 text-[var(--pl-text-muted)] transition-transform duration-300 ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Content */}
      <div
        className={`transition-all duration-300 ease-in-out ${
          isExpanded ? 'max-h-[5000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
        }`}
        aria-hidden={!isExpanded}
      >
        <div className="px-4 sm:px-6 pb-4 sm:pb-6">
          {children}
          
          {/* CTA Button */}
          {ctaLabel && ctaHref && (
            <div className="mt-4 sm:mt-6 pt-4 border-t border-white/10">
              <Link
                href={ctaHref}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-[var(--team-primary)] to-[var(--team-secondary)] text-white font-semibold hover:opacity-90 transition-opacity touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
              >
                {ctaLabel}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


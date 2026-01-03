'use client';

import Link from 'next/link';
import { useRef, useEffect, useState } from 'react';

interface QuickRecommendationsProps {
  transferRecommendation?: {
    playerIn: { id: number; name: string };
    playerOut: { id: number; name: string };
    reason: string;
  };
  captainRecommendation?: {
    player: { id: number; name: string };
    reason: string;
  };
}

export default function QuickRecommendations({
  transferRecommendation,
  captainRecommendation,
}: QuickRecommendationsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<'transfer' | 'captain' | null>(null);

  // Intersection observer for entrance animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  if (!transferRecommendation && !captainRecommendation) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`
        glass rounded-xl p-1.5 sm:p-6
        transition-all duration-700 ease-out
        ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}
        hover:shadow-[0_0_25px_rgba(0,255,135,0.15)]
      `}
    >
      {/* Header with animated lightbulb */}
      <div
        className={`
          flex items-center gap-1 sm:gap-2 mb-1.5 sm:mb-4
          transition-all duration-500
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}
      >
        <span
          className={`
            text-base sm:text-2xl transition-all duration-300
            ${isVisible ? 'animate-bounce-subtle' : ''}
          `}
          aria-hidden="true"
        >
          💡
        </span>
        <h3 className="text-xs sm:text-xl font-semibold text-white">
          Quick Recommendations
        </h3>
      </div>

      <div className="space-y-1.5 sm:space-y-4">
        {/* Transfer Recommendation Card */}
        {transferRecommendation && (
          <div
            className={`
              p-2 sm:p-4 rounded-lg border-2 border-[var(--pl-green)] bg-[var(--pl-green)]/10
              transition-all duration-500 relative overflow-hidden
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
              ${hoveredCard === 'transfer' ? 'scale-[1.02] shadow-[0_0_20px_rgba(0,255,135,0.2)]' : 'scale-100'}
            `}
            style={{ transitionDelay: '100ms' }}
            onMouseEnter={() => setHoveredCard('transfer')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Shimmer effect on hover */}
            <div
              className={`
                absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                -translate-x-full transition-transform duration-700
                ${hoveredCard === 'transfer' ? 'translate-x-full' : ''}
              `}
            />
            
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 relative z-10">
              <span
                className={`
                  text-base sm:text-xl transition-transform duration-300
                  ${hoveredCard === 'transfer' ? 'rotate-180' : 'rotate-0'}
                `}
                aria-hidden="true"
              >
                🔄
              </span>
              <h4 className="text-sm sm:text-base font-semibold text-white">Transfer Recommendation</h4>
            </div>
            
            <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 relative z-10">
              {/* Transfer In - animated */}
              <div
                className={`
                  text-xs sm:text-sm flex items-center gap-2
                  transition-all duration-300
                  ${hoveredCard === 'transfer' ? 'translate-x-1' : 'translate-x-0'}
                `}
              >
                <span className="text-[var(--pl-green)]">↑</span>
                <span className="text-[var(--pl-text-muted)]">In: </span>
                <span className="font-semibold text-white">{transferRecommendation.playerIn.name}</span>
              </div>
              
              {/* Transfer Out - animated */}
              <div
                className={`
                  text-sm flex items-center gap-2
                  transition-all duration-300 delay-75
                  ${hoveredCard === 'transfer' ? 'translate-x-1' : 'translate-x-0'}
                `}
              >
                <span className="text-[var(--pl-pink)]">↓</span>
                <span className="text-[var(--pl-text-muted)]">Out: </span>
                <span className="font-semibold text-white">{transferRecommendation.playerOut.name}</span>
              </div>
              
              <div className="text-sm text-[var(--pl-text-muted)] mt-2">
                {transferRecommendation.reason}
              </div>
            </div>
            
            <Link
              href="/fantasy-football/transfers"
              className={`
                inline-flex items-center gap-1 text-sm text-[var(--pl-green)] hover:underline
                relative z-10 transition-all duration-300
                ${hoveredCard === 'transfer' ? 'gap-2' : 'gap-1'}
              `}
            >
              Make Transfer
              <svg
                className={`
                  w-4 h-4 transition-transform duration-300
                  ${hoveredCard === 'transfer' ? 'translate-x-1' : 'translate-x-0'}
                `}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {/* Captain Recommendation Card */}
        {captainRecommendation && (
          <div
            className={`
              p-2 sm:p-4 rounded-lg border-2 border-[var(--pl-green)] bg-[var(--pl-green)]/10
              transition-all duration-500 relative overflow-hidden
              ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}
              ${hoveredCard === 'captain' ? 'scale-[1.02] shadow-[0_0_20px_rgba(0,255,135,0.2)]' : 'scale-100'}
            `}
            style={{ transitionDelay: '200ms' }}
            onMouseEnter={() => setHoveredCard('captain')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Shimmer effect on hover */}
            <div
              className={`
                absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent
                -translate-x-full transition-transform duration-700
                ${hoveredCard === 'captain' ? 'translate-x-full' : ''}
              `}
            />
            
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 relative z-10">
              <span
                className={`
                  text-base sm:text-xl transition-transform duration-300
                  ${hoveredCard === 'captain' ? 'scale-125 animate-bounce-subtle' : 'scale-100'}
                `}
                aria-hidden="true"
              >
                👑
              </span>
              <h4 className="text-sm sm:text-base font-semibold text-white">Captain Recommendation</h4>
            </div>
            
            <div className="space-y-0.5 sm:space-y-1 mb-2 sm:mb-3 relative z-10">
              <div
                className={`
                  text-xs sm:text-sm transition-all duration-300
                  ${hoveredCard === 'captain' ? 'translate-x-1' : 'translate-x-0'}
                `}
              >
                <span className="text-[var(--pl-text-muted)]">Captain: </span>
                <span className="font-semibold text-white text-gradient-primary">
                  {captainRecommendation.player.name}
                </span>
              </div>
              <div className="text-sm text-[var(--pl-text-muted)]">
                {captainRecommendation.reason}
              </div>
            </div>
            
            <Link
              href="/fantasy-football/captain"
              className={`
                inline-flex items-center gap-1 text-sm text-[var(--pl-green)] hover:underline
                relative z-10 transition-all duration-300
                ${hoveredCard === 'captain' ? 'gap-2' : 'gap-1'}
              `}
            >
              Set Captain
              <svg
                className={`
                  w-4 h-4 transition-transform duration-300
                  ${hoveredCard === 'captain' ? 'translate-x-1' : 'translate-x-0'}
                `}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}


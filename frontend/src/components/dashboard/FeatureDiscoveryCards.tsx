'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';

interface FeatureCard {
  id: string;
  icon: string;
  title: string;
  description: string;
  href: string;
  gradient: string;
  highlight?: string;
  stats?: { label: string; value: string }[];
}

interface FeatureDiscoveryCardsProps {
  hasFplTeam?: boolean;
  hasFavoriteTeam?: boolean;
  predictionAccuracy?: number;
  weeklyPicksStreak?: number;
}

export default function FeatureDiscoveryCards({
  hasFplTeam = false,
  hasFavoriteTeam = false,
  predictionAccuracy,
  weeklyPicksStreak = 0,
}: FeatureDiscoveryCardsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener('scroll', checkScroll);
      return () => ref.removeEventListener('scroll', checkScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  const features: FeatureCard[] = [
    {
      id: 'predictions',
      icon: '🔮',
      title: 'AI Match Predictions',
      description: 'Advanced predictions using Poisson distribution, Elo ratings & squad availability',
      href: '/predictions',
      gradient: 'from-purple-600 via-purple-700 to-indigo-800',
      highlight: 'NEW: Enhanced Algorithm',
      stats: predictionAccuracy ? [
        { label: 'Accuracy', value: `${predictionAccuracy}%` },
      ] : undefined,
    },
    {
      id: 'weekly-picks',
      icon: '🎯',
      title: 'Weekly Picks Game',
      description: 'Predict 3 scores & 3 goal scorers each week. Compete with friends!',
      href: '/weekly-picks',
      gradient: 'from-emerald-600 via-green-600 to-teal-700',
      highlight: weeklyPicksStreak > 0 ? `${weeklyPicksStreak} week streak! 🔥` : 'Free to play',
      stats: [
        { label: 'Picks/Week', value: '6' },
      ],
    },
    {
      id: 'fpl',
      icon: '⚽',
      title: 'FPL Manager',
      description: 'Link your FPL team for transfer tips, captain picks & live rank tracking',
      href: '/fantasy-football',
      gradient: 'from-cyan-600 via-blue-600 to-blue-800',
      highlight: hasFplTeam ? 'Team Linked ✓' : 'Link Your Team',
    },
    {
      id: 'team-tracker',
      icon: '🏆',
      title: 'My Team Tracker',
      description: 'Follow your favorite club with fixtures, news, standings & analytics',
      href: '/my-team',
      gradient: 'from-pink-600 via-rose-600 to-red-700',
      highlight: hasFavoriteTeam ? 'Following ✓' : 'Choose Your Team',
    },
    {
      id: 'matches',
      icon: '🏟️',
      title: 'Match Center',
      description: 'All Premier League fixtures, results, and detailed match reports',
      href: '/matches',
      gradient: 'from-amber-600 via-orange-600 to-red-600',
    },
  ];

  return (
    <div className="relative">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4 px-1">
        <h2 className="text-sm sm:text-lg font-bold text-white">Explore Features</h2>
        <div className="flex items-center gap-2">
          {/* Scroll buttons - hidden on mobile (swipe works) */}
          <div className="hidden sm:flex gap-1">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll left"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
              aria-label="Scroll right"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Scrolling Cards */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory -mx-4 px-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {features.map((feature, index) => (
          <Link
            key={feature.id}
            href={feature.href}
            className={`
              relative flex-shrink-0 w-[260px] sm:w-[300px]
              rounded-2xl overflow-hidden
              snap-start
              group
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Gradient Background */}
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-90`} />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
            </div>

            {/* Content */}
            <div className="relative z-10 p-4 sm:p-5 h-full flex flex-col">
              {/* Highlight Badge */}
              {feature.highlight && (
                <span className="self-start px-2 py-1 rounded-full bg-white/20 text-[10px] sm:text-xs font-bold text-white mb-2 sm:mb-3">
                  {feature.highlight}
                </span>
              )}

              {/* Icon & Title */}
              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                <span className="text-2xl sm:text-3xl group-hover:scale-110 transition-transform">{feature.icon}</span>
                <h3 className="text-base sm:text-lg font-bold text-white">{feature.title}</h3>
              </div>

              {/* Description */}
              <p className="text-xs sm:text-sm text-white/80 mb-3 sm:mb-4 flex-grow line-clamp-2">
                {feature.description}
              </p>

              {/* Stats */}
              {feature.stats && feature.stats.length > 0 && (
                <div className="flex gap-3 mb-3">
                  {feature.stats.map((stat) => (
                    <div key={stat.label} className="text-center">
                      <div className="text-lg sm:text-xl font-black text-white">{stat.value}</div>
                      <div className="text-[10px] text-white/60">{stat.label}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA */}
              <div className="flex items-center gap-1 text-xs sm:text-sm font-semibold text-white group-hover:gap-2 transition-all">
                <span>Explore</span>
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Scroll indicators for mobile */}
      <div className="flex justify-center gap-1 mt-3 sm:hidden">
        {features.map((_, idx) => (
          <div
            key={idx}
            className="w-1.5 h-1.5 rounded-full bg-white/20"
          />
        ))}
      </div>
    </div>
  );
}

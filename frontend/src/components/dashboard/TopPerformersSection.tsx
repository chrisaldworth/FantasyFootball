'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { fplApi, footballApi } from '@/lib/api';
import PlayerCard from './PlayerCard';

interface Player {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  photo: string | null;
  goals_scored: number;
  assists: number;
  total_points: number;
  minutes: number;
  starts: number;
  team: number;
}

interface TopPerformersSectionProps {
  teamId: number;
  teamName?: string;
  season?: string;
}

interface PlayerWithForm extends Player {
  name: string;
  position: number;
  goals: number;
  assists: number;
  rating: number | null;
  appearances: number;
  minutes: number;
  form?: ('W' | 'D' | 'L')[];
}

export default function TopPerformersSection({
  teamId,
  teamName,
  season,
}: TopPerformersSectionProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bootstrap, setBootstrap] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get bootstrap data which contains all players
        const bootstrapData = await fplApi.getBootstrap();
        setBootstrap(bootstrapData);

        // Filter players by team ID and only include players with minutes
        const teamPlayers = bootstrapData.elements.filter(
          (p: Player) => p.team === teamId && p.minutes > 0
        );

        setPlayers(teamPlayers);
      } catch (err: any) {
        console.error('[TopPerformersSection] Error fetching data:', err);
        setError(err.message || 'Failed to load top performers');
      } finally {
        setLoading(false);
      }
    };

    if (teamId) {
      fetchData();
    }
  }, [teamId]);

  // Calculate rankings and get top 3
  const topPlayers = useMemo(() => {
    if (players.length === 0) return [];

    // Map players to include calculated fields
    const playersWithStats: PlayerWithForm[] = players.map((p) => ({
      ...p,
      name: p.web_name || `${p.first_name} ${p.second_name}`,
      position: p.element_type,
      goals: p.goals_scored || 0,
      assists: p.assists || 0,
      rating: null, // Rating not available in FPL API
      appearances: p.starts || 0,
      minutes: p.minutes || 0,
      form: undefined, // Form not calculated yet - will be added in future
    }));

    // Sort by: Goals (primary), Assists (secondary), Total Points (tertiary)
    const sorted = [...playersWithStats].sort((a, b) => {
      // Primary: Goals
      if (b.goals !== a.goals) {
        return b.goals - a.goals;
      }
      // Secondary: Assists
      if (b.assists !== a.assists) {
        return b.assists - a.assists;
      }
      // Tertiary: Total Points
      return b.total_points - a.total_points;
    });

    return sorted.slice(0, 3);
  }, [players]);

  // Calculate performance badges
  const getPerformanceBadges = (player: PlayerWithForm) => {
    if (topPlayers.length === 0) {
      return { isTopScorer: false, isTopAssister: false, hasHighRating: false };
    }

    const topScorer = topPlayers.reduce((max, p) => 
      p.goals > max.goals ? p : max, topPlayers[0]
    );
    const topAssister = topPlayers.reduce((max, p) => 
      p.assists > max.assists ? p : max, topPlayers[0]
    );
    
    return {
      isTopScorer: player.id === topScorer.id && player.goals > 0,
      isTopAssister: player.id === topAssister.id && player.assists > 0,
      hasHighRating: false, // Rating not available in FPL API
    };
  };

  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-xl p-4 sm:p-6 animate-pulse">
            <div className="w-24 h-24 sm:w-32 sm:h-32 lg:w-36 lg:h-36 rounded-full bg-[var(--pl-dark)]/50 mx-auto mb-4" />
            <div className="h-4 bg-[var(--pl-dark)]/50 rounded mb-2" />
            <div className="h-4 bg-[var(--pl-dark)]/50 rounded w-2/3 mx-auto" />
          </div>
        ))}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="glass rounded-xl p-4 sm:p-6 text-center text-[var(--pl-text-muted)]">
        Failed to load top performers
      </div>
    );
  }

  // Empty state
  if (topPlayers.length === 0) {
    return (
      <div className="glass rounded-xl p-4 sm:p-6 text-center text-[var(--pl-text-muted)]">
        <div className="text-4xl mb-2" aria-hidden="true">⚽</div>
        <div>No player data available</div>
      </div>
    );
  }

  // Intersection observer for entrance animation
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  return (
    <div ref={containerRef}>
      <div
        className={`
          mb-4 transition-all duration-500
          ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}
        `}
      >
        <h3 className="text-lg sm:text-xl font-semibold text-white mb-1 flex items-center gap-2">
          <span className={isVisible ? 'animate-bounce-subtle' : ''}>🌟</span>
          Top Performers
        </h3>
        {season && (
          <p className="text-sm text-[var(--pl-text-muted)]">
            {season} Season
          </p>
        )}
      </div>
      
      {/* Desktop: 3 columns, Mobile: Stacked with staggered animation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {topPlayers.map((player, index) => {
          const badges = getPerformanceBadges(player);
          return (
            <div
              key={player.id}
              className={`
                transition-all duration-500
                ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
              `}
              style={{ transitionDelay: `${(index + 1) * 150}ms` }}
            >
              <PlayerCard
                player={{
                  id: player.id,
                  name: player.name,
                  position: player.position,
                  photo: player.photo,
                  goals: player.goals,
                  assists: player.assists,
                  rating: player.rating,
                  appearances: player.appearances,
                  minutes: player.minutes,
                  form: player.form,
                }}
                rank={(index + 1) as 1 | 2 | 3}
                isTopScorer={badges.isTopScorer}
                isTopAssister={badges.isTopAssister}
                hasHighRating={badges.hasHighRating}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}


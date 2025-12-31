'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';
import { useFollowedPlayers } from '@/hooks/useFollowedPlayers';
import FollowButton from '@/components/follow-players/FollowButton';
import TeamLogo from '@/components/TeamLogo';
import TopNavigation from '@/components/navigation/TopNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import Image from 'next/image';

interface FPLPlayer {
  id: number;
  web_name: string;
  first_name: string;
  second_name: string;
  team: number;
  element_type: number; // 1=GK, 2=DEF, 3=MID, 4=FWD
  now_cost: number;
  total_points: number;
  form: string;
  selected_by_percent: string;
  photo: string;
  news: string;
  news_added: string | null;
  chance_of_playing_next_round: number | null;
  value_form: string;
  value_season: string;
  points_per_game: string;
  goals_scored: number;
  assists: number;
  clean_sheets: number;
  minutes: number;
}

interface FPLTeam {
  id: number;
  name: string;
  short_name: string;
}

interface BootstrapData {
  elements: FPLPlayer[];
  teams: FPLTeam[];
}

const POSITION_MAP: { [key: number]: string } = {
  1: 'Goalkeeper',
  2: 'Defender',
  3: 'Midfielder',
  4: 'Forward',
};

const POSITION_COLORS: { [key: number]: string } = {
  1: 'from-blue-500 to-blue-700',
  2: 'from-green-500 to-green-700',
  3: 'from-purple-500 to-purple-700',
  4: 'from-red-500 to-red-700',
};

const getPlayerPhotoUrl = (photoCode: string) => 
  `https://resources.premierleague.com/premierleague/photos/players/110x140/p${photoCode}.png`;

function PlayersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { isFollowed, toggleFollow } = useFollowedPlayers();
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'points' | 'price' | 'form' | 'ownership'>('points');
  const [filterPosition, setFilterPosition] = useState<string>('all');
  const [filterTeam, setFilterTeam] = useState<string>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchBootstrap = async () => {
      try {
        setLoading(true);
        const data = await fplApi.getBootstrap();
        setBootstrap(data);
      } catch (err: any) {
        console.error('Failed to fetch players:', err);
        setError(err.message || 'Failed to load players');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBootstrap();
    }
  }, [user]);

  const filteredAndSortedPlayers = useMemo(() => {
    if (!bootstrap) return [];

    let players = [...bootstrap.elements];

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      players = players.filter(p => {
        const team = bootstrap.teams.find(t => t.id === p.team);
        return (
          p.web_name.toLowerCase().includes(query) ||
          p.first_name.toLowerCase().includes(query) ||
          p.second_name.toLowerCase().includes(query) ||
          team?.name.toLowerCase().includes(query)
        );
      });
    }

    // Filter by position
    if (filterPosition !== 'all') {
      players = players.filter(p => p.element_type === parseInt(filterPosition));
    }

    // Filter by team
    if (filterTeam !== 'all') {
      players = players.filter(p => p.team === parseInt(filterTeam));
    }

    // Sort
    players.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.web_name.localeCompare(b.web_name);
        case 'points':
          return b.total_points - a.total_points;
        case 'price':
          return b.now_cost - a.now_cost;
        case 'form':
          return parseFloat(b.form || '0') - parseFloat(a.form || '0');
        case 'ownership':
          return parseFloat(b.selected_by_percent || '0') - parseFloat(a.selected_by_percent || '0');
        default:
          return 0;
      }
    });

    return players;
  }, [bootstrap, searchQuery, sortBy, filterPosition, filterTeam]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-[var(--pl-text-muted)]">Loading players...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      <SideNavigation />
      <TopNavigation pageTitle="Browse Players" showBackButton={true} backHref="/fantasy-football/followed-players" />
      <BottomNavigation />

      <main className="pt-20 sm:pt-20 lg:pt-28 pb-20 lg:pb-12 px-4 sm:px-6 lg:pr-6 transition-all duration-300 lg:pl-72">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Browse All Players
            </h1>
            <p className="text-[var(--pl-text-muted)]">
              {filteredAndSortedPlayers.length} {filteredAndSortedPlayers.length === 1 ? 'player' : 'players'} found
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30">
              {error}
            </div>
          )}

          {/* Search and Filters */}
          <div className="glass rounded-xl p-4 space-y-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search players by name or team..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)] focus:border-[var(--pl-green)] focus:outline-none text-white placeholder-[var(--pl-text-muted)]"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)] focus:border-[var(--pl-green)] focus:outline-none text-white"
              >
                <option value="points">Sort by Points</option>
                <option value="name">Sort by Name</option>
                <option value="price">Sort by Price</option>
                <option value="form">Sort by Form</option>
                <option value="ownership">Sort by Ownership</option>
              </select>

              {/* Position Filter */}
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)] focus:border-[var(--pl-green)] focus:outline-none text-white"
              >
                <option value="all">All Positions</option>
                <option value="1">Goalkeeper</option>
                <option value="2">Defender</option>
                <option value="3">Midfielder</option>
                <option value="4">Forward</option>
              </select>

              {/* Team Filter */}
              <select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)] focus:border-[var(--pl-green)] focus:outline-none text-white"
              >
                <option value="all">All Teams</option>
                {bootstrap?.teams.map(team => (
                  <option key={team.id} value={team.id.toString()}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Players Grid */}
          {filteredAndSortedPlayers.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedPlayers.map((player) => {
                const team = bootstrap?.teams.find(t => t.id === player.team);
                const photoCode = player.photo?.replace('.jpg', '') || '';
                const playerPhotoUrl = getPlayerPhotoUrl(photoCode);
                const form = parseFloat(player.form || '0');
                const price = player.now_cost / 10;

                return (
                  <div
                    key={player.id}
                    className="glass rounded-xl p-4 relative flex flex-col h-full transition-all hover:scale-[1.02] hover:shadow-lg"
                  >
                    {/* Follow Button */}
                    <div className="absolute top-3 right-3 z-10">
                      <FollowButton
                        playerId={player.id}
                        playerName={player.web_name}
                        isFollowed={isFollowed(player.id)}
                        onToggle={toggleFollow}
                        size="medium"
                      />
                    </div>

                    {/* Player Info */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative w-16 h-16 flex-shrink-0">
                        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${POSITION_COLORS[player.element_type]} opacity-30`} />
                        <Image
                          src={playerPhotoUrl}
                          alt={player.web_name}
                          width={64}
                          height={64}
                          className="rounded-full object-cover border-2 border-[var(--pl-green)]/50"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/path/to/fallback-player-image.png';
                          }}
                        />
                        <div className={`absolute bottom-0 right-0 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r ${POSITION_COLORS[player.element_type]} text-white`}>
                          {POSITION_MAP[player.element_type]?.charAt(0) || '?'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold truncate">{player.web_name}</h3>
                        <div className="flex items-center gap-2 text-sm text-[var(--pl-text-muted)]">
                          {team && <TeamLogo teamId={team.id} size={20} />}
                          <span className="truncate">{team?.name || 'Unknown'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-4 text-sm flex-grow">
                      <div>
                        <div className="text-[var(--pl-text-muted)]">Price</div>
                        <div className="font-bold">£{price.toFixed(1)}m</div>
                      </div>
                      <div>
                        <div className="text-[var(--pl-text-muted)]">Form</div>
                        <div className={`font-bold ${form >= 5 ? 'text-[var(--pl-green)]' : form >= 3 ? 'text-[var(--pl-yellow)]' : 'text-[var(--pl-pink)]'}`}>
                          {form.toFixed(1)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[var(--pl-text-muted)]">Points</div>
                        <div className="font-bold">{player.total_points}</div>
                      </div>
                      <div>
                        <div className="text-[var(--pl-text-muted)]">Ownership</div>
                        <div className="font-bold">{parseFloat(player.selected_by_percent || '0').toFixed(1)}%</div>
                      </div>
                    </div>

                    {/* News Alert */}
                    {player.news && (
                      <div className="mb-4 p-2 rounded-lg bg-[var(--pl-pink)]/20 border border-[var(--pl-pink)]/30">
                        <div className="text-xs text-[var(--pl-pink)] font-semibold">⚠️ News</div>
                        <div className="text-xs text-white mt-1 line-clamp-2">{player.news}</div>
                      </div>
                    )}

                    {/* View Details Button */}
                    <button
                      onClick={() => router.push(`/fantasy-football/player/${player.id}`)}
                      className="btn-primary w-full py-2 text-sm mt-auto"
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="glass rounded-2xl p-12 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <h2 className="text-2xl font-bold mb-2">No Players Found</h2>
              <p className="text-[var(--pl-text-muted)]">
                Try adjusting your search or filters
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PlayersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <PlayersContent />
    </Suspense>
  );
}

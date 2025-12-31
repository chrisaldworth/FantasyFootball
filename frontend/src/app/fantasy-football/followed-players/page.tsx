'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';
import { useFollowedPlayers } from '@/hooks/useFollowedPlayers';
import FollowedPlayerCard from '@/components/follow-players/FollowedPlayerCard';
import TopNavigation from '@/components/navigation/TopNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import { useSidebar } from '@/lib/sidebar-context';
import TeamViewModal from '@/components/TeamViewModal';

type SortOption = 'recently_followed' | 'name' | 'points' | 'price' | 'form';
type FilterPosition = 'all' | '1' | '2' | '3' | '4';
type FilterTeam = 'all' | number;

interface FollowedPlayerWithStats {
  followed_player_id: number;
  player_id: number;
  followed_at: string;
  player: {
    id: number;
    web_name: string;
    first_name: string;
    second_name: string;
    photo?: string;
    team: number;
    team_name: string;
    team_short_name: string;
    element_type: number;
    position: string;
    now_cost: number;
    price: number;
    form: number;
    total_points: number;
    selected_by_percent: string;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    minutes: number;
    starts: number;
  };
}

export default function FollowedPlayersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { isExpanded } = useSidebar();
  const { isFollowed, toggleFollow } = useFollowedPlayers();
  
  const [players, setPlayers] = useState<FollowedPlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('recently_followed');
  const [filterPosition, setFilterPosition] = useState<FilterPosition>('all');
  const [filterTeam, setFilterTeam] = useState<FilterTeam>('all');
  const [bootstrap, setBootstrap] = useState<any>(null);
  const [viewingPlayer, setViewingPlayer] = useState<{ id: number; name: string } | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load bootstrap for team info and fixtures
      const [followedData, bootstrapData] = await Promise.all([
        fplApi.getFollowedPlayersWithStats(),
        fplApi.getBootstrap(),
      ]);
      
      setPlayers(followedData);
      setBootstrap(bootstrapData);
    } catch (err: any) {
      console.error('Failed to load followed players:', err);
      setError(err.message || 'Failed to load followed players');
    } finally {
      setLoading(false);
    }
  };

  // Get unique teams for filter
  const availableTeams = useMemo(() => {
    if (!bootstrap?.teams) return [];
    const teamIds = new Set(players.map(p => p.player.team));
    return bootstrap.teams.filter((t: any) => teamIds.has(t.id));
  }, [players, bootstrap]);

  // Filter and sort players
  const filteredAndSortedPlayers = useMemo(() => {
    let filtered = [...players];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.player.web_name.toLowerCase().includes(query) ||
        p.player.first_name.toLowerCase().includes(query) ||
        p.player.second_name.toLowerCase().includes(query) ||
        p.player.team_name.toLowerCase().includes(query)
      );
    }

    // Position filter
    if (filterPosition !== 'all') {
      filtered = filtered.filter(p => p.player.element_type === parseInt(filterPosition));
    }

    // Team filter
    if (filterTeam !== 'all') {
      filtered = filtered.filter(p => p.player.team === filterTeam);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'recently_followed':
          return new Date(b.followed_at).getTime() - new Date(a.followed_at).getTime();
        case 'name':
          return a.player.web_name.localeCompare(b.player.web_name);
        case 'points':
          return b.player.total_points - a.player.total_points;
        case 'price':
          return b.player.price - a.player.price;
        case 'form':
          return b.player.form - a.player.form;
        default:
          return 0;
      }
    });

    return filtered;
  }, [players, searchQuery, sortBy, filterPosition, filterTeam]);

  const handleViewDetails = (player: FollowedPlayerWithStats) => {
    // Navigate to player detail or open modal
    // For now, we'll use the TeamViewModal pattern but for a single player
    setViewingPlayer({ id: player.player.id, name: player.player.web_name });
  };

  const handleUnfollow = async (player: FollowedPlayerWithStats) => {
    try {
      await toggleFollow(player.player_id, false);
      // Remove from local state
      setPlayers(prev => prev.filter(p => p.player_id !== player.player_id));
    } catch (err) {
      console.error('Failed to unfollow:', err);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[var(--pl-text-muted)]">Loading followed players...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen">
      {/* Desktop Side Navigation */}
      <SideNavigation />
      
      {/* Top Navigation */}
      <TopNavigation
        pageTitle="Followed Players"
        showBackButton={true}
        backHref="/fantasy-football"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Main Content */}
      <main 
        className={`pt-20 sm:pt-20 lg:pt-28 pb-20 lg:pb-12 px-4 sm:px-6 lg:pr-6 transition-all duration-300 ${
          isExpanded ? 'lg:pl-72' : 'lg:pl-24'
        }`}
      >
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Followed Players
            </h1>
            <p className="text-[var(--pl-text-muted)]">
              {players.length} {players.length === 1 ? 'player' : 'players'} followed
            </p>
          </div>

          {/* Search and Filters */}
          <div className="glass rounded-xl p-4 space-y-4">
            {/* Search */}
            <div>
              <input
                type="text"
                placeholder="Search players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)] focus:border-[var(--pl-green)] focus:outline-none text-white placeholder-[var(--pl-text-muted)]"
              />
            </div>

            {/* Sort and Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Sort */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)] focus:border-[var(--pl-green)] focus:outline-none text-white"
              >
                <option value="recently_followed">Recently Followed</option>
                <option value="name">Name</option>
                <option value="points">Points</option>
                <option value="price">Price</option>
                <option value="form">Form</option>
              </select>

              {/* Position Filter */}
              <select
                value={filterPosition}
                onChange={(e) => setFilterPosition(e.target.value as FilterPosition)}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)] focus:border-[var(--pl-green)] focus:outline-none text-white"
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
                onChange={(e) => setFilterTeam(e.target.value === 'all' ? 'all' : parseInt(e.target.value) as FilterTeam)}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)] focus:border-[var(--pl-green)] focus:outline-none text-white"
              >
                <option value="all">All Teams</option>
                {availableTeams.map((team: any) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Error State */}
          {error && (
            <div className="glass rounded-xl p-4 bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30">
              <p className="text-[var(--pl-pink)]">{error}</p>
            </div>
          )}

          {/* Empty State */}
          {!loading && players.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <div className="text-6xl mb-4">⭐</div>
              <h2 className="text-2xl font-bold mb-2">No Players Followed Yet</h2>
              <p className="text-[var(--pl-text-muted)] mb-6">
                Start following players to track their performance and get quick insights
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => router.push('/fantasy-football/players')}
                  className="px-6 py-2 rounded-lg bg-[var(--pl-green)] hover:bg-[var(--pl-green)]/80 text-white font-medium"
                >
                  Browse Players
                </button>
              </div>
            </div>
          )}

          {/* Players Grid */}
          {filteredAndSortedPlayers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredAndSortedPlayers.map((playerData) => (
                <FollowedPlayerCard
                  key={playerData.followed_player_id}
                  player={{
                    id: playerData.player.id,
                    name: playerData.player.web_name,
                    photo: playerData.player.photo,
                    team: playerData.player.team_name,
                    teamId: playerData.player.team,
                    position: playerData.player.position,
                    positionId: playerData.player.element_type,
                    price: playerData.player.price,
                    form: playerData.player.form,
                    totalPoints: playerData.player.total_points,
                    ownership: parseFloat(playerData.player.selected_by_percent),
                  }}
                  onViewDetails={() => handleViewDetails(playerData)}
                  onUnfollow={() => handleUnfollow(playerData)}
                  isFollowed={isFollowed(playerData.player_id)}
                  onToggleFollow={toggleFollow}
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && players.length > 0 && filteredAndSortedPlayers.length === 0 && (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-[var(--pl-text-muted)]">No players match your filters</p>
            </div>
          )}
        </div>
      </main>

      {/* Player View Modal - Placeholder for now */}
      {viewingPlayer && bootstrap && (
        <TeamViewModal
          teamId={viewingPlayer.id}
          teamName={viewingPlayer.name}
          managerName=""
          onClose={() => setViewingPlayer(null)}
          bootstrapData={bootstrap}
        />
      )}
    </div>
  );
}

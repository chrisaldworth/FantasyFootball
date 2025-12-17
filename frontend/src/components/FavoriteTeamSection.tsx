'use client';

import { useState, useEffect } from 'react';
import { footballApi } from '@/lib/api';
import Link from 'next/link';
import TeamNews from './TeamNews';
import TeamNewsOverview from './TeamNewsOverview';
import MatchDetailsModal from './MatchDetailsModal';
import FixtureTicker from './FixtureTicker';

interface TeamInfo {
  id: number;
  name: string;
  logo: string | null;
  code: string | null;
  country: string | null;
  founded: number | null;
  venue: {
    name: string | null;
    city: string | null;
    capacity: number | null;
  };
  upcoming_fixtures: any[];
}

interface FavoriteTeamSectionProps {
  teamId: number;
  onChangeTeam?: () => void;
}

interface Fixture {
  fixture: {
    id: number;
    date: string;
    status: {
      long: string;
      short: string;
    };
  };
  teams: {
    home: {
      id: number;
      name: string;
    };
    away: {
      id: number;
      name: string;
    };
  };
  goals: {
    home?: number;
    away?: number;
  };
  league: {
    id: number;
    name: string;
  };
}

export default function FavoriteTeamSection({ teamId, onChangeTeam }: FavoriteTeamSectionProps) {
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [recentResults, setRecentResults] = useState<Fixture[]>([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);

  useEffect(() => {
    fetchTeamInfo();
    fetchRecentResults();
    fetchUpcomingFixtures();
  }, [teamId]);

  const fetchTeamInfo = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await footballApi.getTeamInfo(teamId);
      if (data.error) {
        setError(data.error);
      } else {
        setTeamInfo(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load team information');
    } finally {
      setLoading(false);
    }
  };

  const fetchRecentResults = async () => {
    try {
      setLoadingResults(true);
      // Fetch last 30 days of results, filtered by team_id
      // The backend will handle filtering across all competitions (Premier League, Champions League, FA Cup, League Cup)
      const data = await footballApi.getRecentResults(30, teamId);
      if (data.results) {
        // Show all results for ticker (backend already filters by team)
        setRecentResults(data.results);
      }
    } catch (err: any) {
      console.error('Failed to fetch recent results:', err);
      // Don't show error to user, just leave empty
    } finally {
      setLoadingResults(false);
    }
  };

  const fetchUpcomingFixtures = async () => {
    try {
      setLoadingFixtures(true);
      // Note: getUpcomingFixtures doesn't support teamId filter yet, so we filter client-side
      const data = await footballApi.getUpcomingFixtures(30);
      if (data.fixtures) {
        // Filter by teamId
        const filtered = data.fixtures.filter((f: Fixture) => 
          f.teams?.home?.id === teamId || f.teams?.away?.id === teamId
        );
        setUpcomingFixtures(filtered);
      }
    } catch (err: any) {
      console.error('Failed to fetch upcoming fixtures:', err);
      // Don't show error to user, just leave empty
    } finally {
      setLoadingFixtures(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !teamInfo) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--pl-pink)] mb-4">{error || 'Team information not available'}</p>
        <button onClick={fetchTeamInfo} className="btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const getLeagueBadge = (leagueName: string) => {
    const name = leagueName.toLowerCase();
    if (name.includes('champions league')) {
      return { emoji: '🏆', color: 'bg-blue-500/20', textColor: 'text-blue-400', label: 'UCL' };
    }
    if (name.includes('fa cup')) {
      return { emoji: '🏆', color: 'bg-red-500/20', textColor: 'text-red-400', label: 'FA Cup' };
    }
    if (name.includes('league cup') || name.includes('carabao')) {
      return { emoji: '🏆', color: 'bg-orange-500/20', textColor: 'text-orange-400', label: 'League Cup' };
    }
    if (name.includes('premier league')) {
      return { emoji: '⚽', color: 'bg-[var(--pl-green)]/20', textColor: 'text-[var(--pl-green)]', label: 'PL' };
    }
    return { emoji: '⚽', color: 'bg-gray-500/20', textColor: 'text-gray-400', label: leagueName };
  };

  return (
    <div className="space-y-6">
      {/* News Overview - Top Level */}
      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-xl">📰</span>
          <span>News Overview</span>
        </h3>
        <TeamNewsOverview teamId={teamId} teamName={teamInfo.name} />
      </div>

      {/* Team Header */}
      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6">
          {teamInfo.logo && (
            <img
              src={teamInfo.logo}
              alt={teamInfo.name}
              className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="flex-1 text-center sm:text-left w-full">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold">{teamInfo.name}</h2>
              {onChangeTeam && (
                <button
                  onClick={onChangeTeam}
                  className="px-3 py-1.5 text-xs sm:text-sm rounded-lg bg-[var(--pl-green)]/20 hover:bg-[var(--pl-green)]/30 text-[var(--pl-green)] font-medium transition-colors"
                >
                  Change Team
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-[var(--pl-text-muted)] justify-center sm:justify-start">
              {teamInfo.venue.name && (
                <div className="truncate">
                  <span className="font-medium">Stadium:</span> {teamInfo.venue.name}
                  {teamInfo.venue.capacity && ` (${teamInfo.venue.capacity.toLocaleString()})`}
                </div>
              )}
              {teamInfo.founded && (
                <div>
                  <span className="font-medium">Founded:</span> {teamInfo.founded}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Results Ticker */}
      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-xl">📊</span>
          Recent Results
        </h3>
        <FixtureTicker
          fixtures={recentResults}
          teamId={teamId}
          teamName={teamInfo.name}
          type="results"
          onFixtureClick={setSelectedMatch}
          loading={loadingResults}
        />
      </div>

      {/* Upcoming Fixtures Ticker */}
      {upcomingFixtures.length > 0 && (
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
            <span className="text-xl">📅</span>
            Upcoming Fixtures
          </h3>
          <FixtureTicker
            fixtures={upcomingFixtures}
            teamId={teamId}
            teamName={teamInfo.name}
            type="upcoming"
            loading={loadingFixtures}
          />
        </div>
      )}

      {/* Team News */}
      <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-bold mb-4 flex items-center gap-2">
          <span className="text-xl">📰</span>
          Team News
        </h3>
        <TeamNews teamId={teamId} teamName={teamInfo.name} />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
        <Link
          href="/fpl"
          className="glass rounded-xl p-4 sm:p-6 hover:bg-[var(--pl-card-hover)] active:scale-95 transition-all text-center touch-manipulation"
        >
          <div className="text-2xl sm:text-3xl mb-2">⚽</div>
          <div className="font-semibold mb-1 text-sm sm:text-base">Fantasy Football</div>
          <div className="text-xs sm:text-sm text-[var(--pl-text-muted)]">Manage your FPL team</div>
        </Link>
        <Link
          href="/dashboard?tab=football"
          className="glass rounded-xl p-4 sm:p-6 hover:bg-[var(--pl-card-hover)] active:scale-95 transition-all text-center touch-manipulation"
        >
          <div className="text-2xl sm:text-3xl mb-2">📅</div>
          <div className="font-semibold mb-1 text-sm sm:text-base">All Fixtures</div>
          <div className="text-xs sm:text-sm text-[var(--pl-text-muted)]">View all football matches</div>
        </Link>
      </div>

      {/* Match Details Modal */}
      {selectedMatch && (
        <MatchDetailsModal
          fixture={selectedMatch}
          isOpen={!!selectedMatch}
          onClose={() => setSelectedMatch(null)}
        />
      )}
    </div>
  );
}


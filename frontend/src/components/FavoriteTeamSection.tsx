'use client';

import { useState, useEffect } from 'react';
import { footballApi } from '@/lib/api';
import Link from 'next/link';

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
}

export default function FavoriteTeamSection({ teamId }: FavoriteTeamSectionProps) {
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTeamInfo();
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

  return (
    <div className="space-y-6">
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-2">{teamInfo.name}</h2>
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

      {/* Upcoming Fixtures */}
      {teamInfo.upcoming_fixtures && teamInfo.upcoming_fixtures.length > 0 && (
        <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-bold mb-4">Upcoming Fixtures</h3>
          <div className="space-y-2 sm:space-y-3">
            {teamInfo.upcoming_fixtures.slice(0, 5).map((fixture: any) => {
              const isHome = fixture.teams?.home?.id === teamId;
              const opponent = isHome ? fixture.teams?.away : fixture.teams?.home;
              const fixtureDate = fixture.fixture?.date;

              return (
                <div
                  key={fixture.fixture?.id}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 sm:p-4 rounded-lg sm:rounded-xl bg-[var(--pl-dark)]/50 border border-white/10 gap-2 sm:gap-4"
                >
                  <div className="flex items-center gap-2 sm:gap-4 flex-1 w-full sm:w-auto min-w-0">
                    <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] flex-shrink-0 w-20 sm:w-24">
                      {fixtureDate && (
                        <>
                          <div className="whitespace-nowrap">{formatDate(fixtureDate)}</div>
                          <div className="whitespace-nowrap">{formatTime(fixtureDate)}</div>
                        </>
                      )}
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                      {isHome ? (
                        <>
                          <span className="font-semibold truncate">{teamInfo.name}</span>
                          <span className="text-[var(--pl-text-muted)] flex-shrink-0">vs</span>
                          <span className="truncate">{opponent?.name || 'TBD'}</span>
                        </>
                      ) : (
                        <>
                          <span className="truncate">{opponent?.name || 'TBD'}</span>
                          <span className="text-[var(--pl-text-muted)] flex-shrink-0">vs</span>
                          <span className="font-semibold truncate">{teamInfo.name}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] truncate w-full sm:w-auto text-left sm:text-right">
                    {fixture.league?.name}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

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
    </div>
  );
}


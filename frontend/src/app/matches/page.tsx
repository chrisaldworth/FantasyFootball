'use client';

import { useState, useEffect } from 'react';
import { matchDataApi } from '@/lib/api';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';

interface Team {
  id: string;
  fbref_id: string;
  name: string;
  logo_url?: string;
}

interface Match {
  id: string;
  season: string;
  match_date: string;
  home_team_id: string;
  away_team_id: string;
  score_home?: number;
  score_away?: number;
  status: string;
  venue?: string;
  referee?: string;
}

interface MatchDetails {
  match: Match;
  home_team: Team;
  away_team: Team;
  lineups: any[];
  events: any[];
  player_stats: any[];
  team_stats: any[];
}

export default function MatchesPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<MatchDetails | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const matchesPerPage = 20;

  // Load seasons and teams on mount
  useEffect(() => {
    loadSeasons();
    loadTeams();
  }, []);

  // Load matches when filters change
  useEffect(() => {
    if (selectedSeason) {
      loadMatches();
    }
  }, [selectedSeason, selectedTeam, currentPage]);

  const loadSeasons = async () => {
    try {
      setLoading(true);
      const data = await matchDataApi.getSeasons();
      setSeasons(data.seasons || []);
      if (data.seasons && data.seasons.length > 0) {
        setSelectedSeason(data.seasons[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load seasons');
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const data = await matchDataApi.getTeams(0, 100);
      setTeams(data.teams || []);
    } catch (err: any) {
      console.error('Failed to load teams:', err);
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await matchDataApi.getMatches({
        season: selectedSeason,
        teamId: selectedTeam || undefined,
        skip: currentPage * matchesPerPage,
        limit: matchesPerPage,
      });
      setMatches(data.matches || []);
      setTotalMatches(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  };

  const loadMatchDetails = async (matchId: string) => {
    try {
      setLoading(true);
      const data = await matchDataApi.getMatch(matchId);
      setSelectedMatch(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team?.name || teamId;
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  const totalPages = Math.ceil(totalMatches / matchesPerPage);

  return (
    <div className="min-h-screen bg-[var(--pl-bg)] pb-16 lg:pb-0">
      <TopNavigation
        showFavoriteTeam={false}
        showNotifications={false}
        showLinkFPL={false}
      />

      <div className="container mx-auto px-4 py-8 pt-28 lg:pt-24">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Match Database</h1>
          <p className="text-[var(--pl-text-muted)]">
            Browse and view detailed match data from the database
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
            {error}
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Season</label>
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                setCurrentPage(0);
              }}
              className="input-field w-full"
              disabled={loading}
            >
              <option value="">All seasons...</option>
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Team (Optional)</label>
            <select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setCurrentPage(0);
              }}
              className="input-field w-full"
              disabled={loading}
            >
              <option value="">All teams...</option>
              {teams.map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Summary */}
        {!loading && selectedSeason && (
          <div className="mb-4 text-sm text-[var(--pl-text-muted)]">
            Showing {matches.length} of {totalMatches} matches
            {selectedTeam && ` for ${getTeamName(selectedTeam)}`}
          </div>
        )}

        {/* Loading State */}
        {loading && matches.length === 0 && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--pl-green)]"></div>
            <p className="mt-2 text-[var(--pl-text-muted)]">Loading matches...</p>
          </div>
        )}

        {/* Matches List */}
        {!loading && matches.length > 0 && (
          <div className="space-y-3 mb-6">
            {matches.map(match => (
              <div
                key={match.id}
                className={`glass rounded-lg p-4 cursor-pointer hover:bg-[var(--pl-bg-hover)] transition-colors ${
                  selectedMatch?.match?.id === match.id ? 'ring-2 ring-[var(--pl-green)] bg-[var(--pl-bg-hover)]' : ''
                }`}
                onClick={() => loadMatchDetails(match.id)}
              >
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="font-semibold mb-1">
                      {getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)}
                    </div>
                    <div className="text-sm text-[var(--pl-text-muted)]">
                      {formatDate(match.match_date)} • {match.venue || 'Venue TBD'}
                    </div>
                    {match.referee && (
                      <div className="text-xs text-[var(--pl-text-muted)] mt-1">
                        Referee: {match.referee}
                      </div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold mb-1">
                      {match.score_home !== null && match.score_away !== null
                        ? `${match.score_home} - ${match.score_away}`
                        : 'TBD'}
                    </div>
                    <div className="text-xs text-[var(--pl-text-muted)] capitalize">
                      {match.status}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && matches.length === 0 && selectedSeason && (
          <div className="text-center py-12 text-[var(--pl-text-muted)]">
            <p className="text-lg mb-2">No matches found</p>
            <p className="text-sm">Try selecting a different season or team</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
              disabled={currentPage === 0}
              className="px-4 py-2 rounded-lg bg-[var(--pl-bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--pl-bg-hover)]/80"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-sm text-[var(--pl-text-muted)]">
              Page {currentPage + 1} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={currentPage >= totalPages - 1}
              className="px-4 py-2 rounded-lg bg-[var(--pl-bg-hover)] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[var(--pl-bg-hover)]/80"
            >
              Next
            </button>
          </div>
        )}

        {/* Match Details Modal */}
        {selectedMatch && (
          <div 
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50"
            onClick={() => setSelectedMatch(null)}
          >
            <div 
              className="glass rounded-lg p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Match Details</h2>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-[var(--pl-text-muted)] hover:text-white text-2xl"
                >
                  ×
                </button>
              </div>

              {/* Match Header */}
              <div className="bg-[var(--pl-bg-hover)] rounded-lg p-6 mb-6">
                <div className="grid md:grid-cols-3 gap-4 items-center">
                  <div className="text-right">
                    <div className="text-xl font-bold">{selectedMatch.home_team.name}</div>
                    {selectedMatch.match.score_home !== null && (
                      <div className="text-4xl font-bold mt-2">{selectedMatch.match.score_home}</div>
                    )}
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-[var(--pl-text-muted)] mb-2">
                      {formatDate(selectedMatch.match.match_date)}
                    </div>
                    <div className="text-xs text-[var(--pl-text-muted)] capitalize">
                      {selectedMatch.match.status}
                    </div>
                    {selectedMatch.match.venue && (
                      <div className="text-xs text-[var(--pl-text-muted)] mt-2">
                        {selectedMatch.match.venue}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold">{selectedMatch.away_team.name}</div>
                    {selectedMatch.match.score_away !== null && (
                      <div className="text-4xl font-bold mt-2">{selectedMatch.match.score_away}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Match Info */}
              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Match Information</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--pl-text-muted)]">Season:</span>
                      <span>{selectedMatch.match.season}</span>
                    </div>
                    {selectedMatch.match.referee && (
                      <div className="flex justify-between">
                        <span className="text-[var(--pl-text-muted)]">Referee:</span>
                        <span>{selectedMatch.match.referee}</span>
                      </div>
                    )}
                    {selectedMatch.match.venue && (
                      <div className="flex justify-between">
                        <span className="text-[var(--pl-text-muted)]">Venue:</span>
                        <span>{selectedMatch.match.venue}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Events */}
              {selectedMatch.events && selectedMatch.events.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Match Events ({selectedMatch.events.length})</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {selectedMatch.events.map((event: any, idx: number) => (
                      <div key={idx} className="text-sm p-3 bg-[var(--pl-bg-hover)] rounded">
                        <span className="font-semibold">{event.minute}'</span> - 
                        <span className="capitalize ml-2">{event.event_type}</span>
                        {event.details?.player_name && (
                          <span className="text-[var(--pl-text-muted)] ml-2">
                            • {event.details.player_name}
                          </span>
                        )}
                        {event.details?.assist_player && (
                          <span className="text-[var(--pl-text-muted)]">
                            (assist: {event.details.assist_player})
                          </span>
                        )}
                        {event.details?.card_type && (
                          <span className="text-[var(--pl-text-muted)]">
                            ({event.details.card_type})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lineups */}
              {selectedMatch.lineups && selectedMatch.lineups.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">Lineups</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedMatch.lineups.map((lineup: any, idx: number) => (
                      <div key={idx} className="p-4 bg-[var(--pl-bg-hover)] rounded">
                        <div className="font-semibold mb-2">
                          {lineup.is_home ? selectedMatch.home_team.name : selectedMatch.away_team.name}
                          {lineup.formation && (
                            <span className="text-sm text-[var(--pl-text-muted)] ml-2">
                              ({lineup.formation})
                            </span>
                          )}
                        </div>
                        {lineup.starting_xi && Array.isArray(lineup.starting_xi) && (
                          <div className="text-sm space-y-1">
                            <div className="font-medium mb-2 text-[var(--pl-text-muted)]">Starting XI:</div>
                            <div className="space-y-1">
                              {lineup.starting_xi.map((player: any, pIdx: number) => (
                                <div key={pIdx} className="text-[var(--pl-text-muted)]">
                                  {player.name || player.player_name || `Player ${pIdx + 1}`}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Player Stats Summary */}
              {selectedMatch.player_stats && selectedMatch.player_stats.length > 0 && (
                <div className="mb-6">
                  <h3 className="font-semibold text-lg mb-3">
                    Player Statistics ({selectedMatch.player_stats.length} players)
                  </h3>
                  <div className="text-sm text-[var(--pl-text-muted)] mb-3">
                    Showing statistics for {selectedMatch.player_stats.length} players
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {selectedMatch.player_stats.slice(0, 15).map((stat: any, idx: number) => {
                      // Try to get player name from teams data
                      const playerName = stat.player_name || `Player ${idx + 1}`;
                      return (
                        <div key={idx} className="p-3 bg-[var(--pl-bg-hover)] rounded text-sm">
                          <div className="font-medium mb-1">{playerName}</div>
                          <div className="text-[var(--pl-text-muted)] text-xs space-x-3">
                            <span>Goals: {stat.goals || 0}</span>
                            <span>Assists: {stat.assists || 0}</span>
                            <span>Minutes: {stat.minutes || 0}</span>
                            {stat.shots !== null && <span>Shots: {stat.shots}</span>}
                            {stat.passes !== null && <span>Passes: {stat.passes}</span>}
                          </div>
                        </div>
                      );
                    })}
                    {selectedMatch.player_stats.length > 15 && (
                      <div className="text-center text-[var(--pl-text-muted)] py-2">
                        ... and {selectedMatch.player_stats.length - 15} more players
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Team Stats */}
              {selectedMatch.team_stats && selectedMatch.team_stats.length > 0 && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Team Statistics</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {selectedMatch.team_stats.map((stat: any, idx: number) => (
                      <div key={idx} className="p-4 bg-[var(--pl-bg-hover)] rounded">
                        <div className="font-medium mb-3">
                          {stat.is_home ? selectedMatch.home_team.name : selectedMatch.away_team.name}
                        </div>
                        <div className="text-sm space-y-2 text-[var(--pl-text-muted)]">
                          {stat.possession !== null && (
                            <div className="flex justify-between">
                              <span>Possession:</span>
                              <span>{stat.possession}%</span>
                            </div>
                          )}
                          {stat.shots !== null && (
                            <div className="flex justify-between">
                              <span>Shots:</span>
                              <span>{stat.shots}</span>
                            </div>
                          )}
                          {stat.shots_on_target !== null && (
                            <div className="flex justify-between">
                              <span>Shots on Target:</span>
                              <span>{stat.shots_on_target}</span>
                            </div>
                          )}
                          {stat.passes !== null && (
                            <div className="flex justify-between">
                              <span>Passes:</span>
                              <span>{stat.passes}</span>
                            </div>
                          )}
                          {stat.pass_accuracy !== null && (
                            <div className="flex justify-between">
                              <span>Pass Accuracy:</span>
                              <span>{stat.pass_accuracy}%</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}


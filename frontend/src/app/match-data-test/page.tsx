'use client';

import { useState, useEffect } from 'react';
import { matchDataApi } from '@/lib/api';
import TopNavigation from '@/components/navigation/TopNavigation';

interface Team {
  id: string;
  fbref_id: string;
  name: string;
  logo_url?: string;
}

interface Player {
  id: string;
  fbref_id: string;
  name: string;
  position?: string;
  current_team_id?: string;
}

interface Match {
  id: string;
  season: string;
  match_date: string;  // Updated to match_date
  date?: string;  // Keep for backward compatibility
  home_team_id: string;
  away_team_id: string;
  score_home?: number;
  score_away?: number;
  status: string;
  venue?: string;
  referee?: string;
}

export default function MatchDataTestPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'teams' | 'players' | 'matches'>('matches');

  // Load seasons on mount
  useEffect(() => {
    loadSeasons();
  }, []);

  // Load data when season changes
  useEffect(() => {
    if (selectedSeason) {
      loadMatches();
      loadTeams();
      loadPlayers();
    }
  }, [selectedSeason]);

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

  const loadPlayers = async () => {
    try {
      const data = await matchDataApi.getPlayers(undefined, 0, 100);
      setPlayers(data.players || []);
    } catch (err: any) {
      console.error('Failed to load players:', err);
    }
  };

  const loadMatches = async () => {
    try {
      setLoading(true);
      const data = await matchDataApi.getMatches({
        season: selectedSeason,
        limit: 50,
      });
      setMatches(data.matches || []);
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

  return (
    <div className="min-h-screen bg-[var(--pl-bg)]">
      <TopNavigation
        showFavoriteTeam={false}
        showNotifications={false}
        showLinkFPL={false}
      />

      <div className="container mx-auto px-4 py-8 pt-20">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Match Data Test</h1>
          <p className="text-[var(--pl-text-muted)]">
            Test page for querying scraped match data from the database
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
            {error}
          </div>
        )}

        {/* Season Selector */}
        <div className="mb-6">
          <label className="block text-sm font-medium mb-2">Season</label>
          <select
            value={selectedSeason}
            onChange={(e) => setSelectedSeason(e.target.value)}
            className="input-field"
            disabled={loading}
          >
            <option value="">Select season...</option>
            {seasons.map(season => (
              <option key={season} value={season}>{season}</option>
            ))}
          </select>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex gap-4 border-b border-[var(--pl-border)]">
          <button
            onClick={() => setActiveTab('matches')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'matches'
                ? 'border-b-2 border-[var(--pl-green)] text-[var(--pl-green)]'
                : 'text-[var(--pl-text-muted)]'
            }`}
          >
            Matches ({matches.length})
          </button>
          <button
            onClick={() => setActiveTab('teams')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'teams'
                ? 'border-b-2 border-[var(--pl-green)] text-[var(--pl-green)]'
                : 'text-[var(--pl-text-muted)]'
            }`}
          >
            Teams ({teams.length})
          </button>
          <button
            onClick={() => setActiveTab('players')}
            className={`pb-2 px-4 font-medium ${
              activeTab === 'players'
                ? 'border-b-2 border-[var(--pl-green)] text-[var(--pl-green)]'
                : 'text-[var(--pl-text-muted)]'
            }`}
          >
            Players ({players.length})
          </button>
        </div>

        {/* Content */}
        {loading && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--pl-green)]"></div>
            <p className="mt-2 text-[var(--pl-text-muted)]">Loading...</p>
          </div>
        )}

        {!loading && activeTab === 'matches' && (
          <div className="space-y-4">
            {matches.length === 0 ? (
              <div className="text-center py-8 text-[var(--pl-text-muted)]">
                No matches found. Make sure data has been imported.
              </div>
            ) : (
              <>
                {/* Match selector dropdown */}
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Quick Select Match</label>
                  <select
                    value={selectedMatch?.match?.id || ''}
                    onChange={(e) => {
                      if (e.target.value) {
                        loadMatchDetails(e.target.value);
                      } else {
                        setSelectedMatch(null);
                      }
                    }}
                    className="input-field w-full"
                  >
                    <option value="">-- Select a match to view details --</option>
                    {matches.map(match => (
                      <option key={match.id} value={match.id}>
                        {getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)} - {new Date(match.match_date || match.date || '').toLocaleDateString()} ({match.score_home !== null && match.score_away !== null ? `${match.score_home}-${match.score_away}` : 'TBD'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Match list - click any match to view details */}
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">
                  Click any match below to view full details
                </div>
                {matches.map(match => (
                  <div
                    key={match.id}
                    className={`glass rounded-lg p-4 cursor-pointer hover:bg-[var(--pl-bg-hover)] transition-colors ${
                      selectedMatch?.match?.id === match.id ? 'ring-2 ring-[var(--pl-green)] bg-[var(--pl-bg-hover)]' : ''
                    }`}
                    onClick={() => loadMatchDetails(match.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-semibold mb-1">
                          {getTeamName(match.home_team_id)} vs {getTeamName(match.away_team_id)}
                        </div>
                        <div className="text-sm text-[var(--pl-text-muted)]">
                          {new Date(match.match_date || match.date || '').toLocaleDateString()} • {match.venue || 'Venue TBD'}
                        </div>
                      </div>
                      <div className="text-2xl font-bold">
                        {match.score_home !== null && match.score_away !== null
                          ? `${match.score_home} - ${match.score_away}`
                          : 'TBD'}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {!loading && activeTab === 'teams' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {teams.map(team => (
              <div key={team.id} className="glass rounded-lg p-4">
                <div className="font-semibold">{team.name}</div>
                <div className="text-sm text-[var(--pl-text-muted)] mt-1">
                  FBRef ID: {team.fbref_id}
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && activeTab === 'players' && (
          <div className="space-y-2">
            {players.slice(0, 50).map(player => (
              <div key={player.id} className="glass rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{player.name}</div>
                    <div className="text-sm text-[var(--pl-text-muted)]">
                      {player.position || 'Position TBD'} • {player.current_team_id ? getTeamName(player.current_team_id) : 'No team'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {players.length > 50 && (
              <div className="text-center text-[var(--pl-text-muted)] py-4">
                Showing first 50 of {players.length} players
              </div>
            )}
          </div>
        )}

        {/* Match Details Modal */}
        {selectedMatch && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedMatch(null)}>
            <div className="glass rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Match Details</h2>
                <button
                  onClick={() => setSelectedMatch(null)}
                  className="text-[var(--pl-text-muted)] hover:text-white"
                >
                  ✕
                </button>
              </div>

              {selectedMatch.match && (
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">Match Info</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-sm text-[var(--pl-text-muted)]">Date</div>
                        <div>{new Date(selectedMatch.match.match_date || selectedMatch.match.date || '').toLocaleDateString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[var(--pl-text-muted)]">Season</div>
                        <div>{selectedMatch.match.season}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[var(--pl-text-muted)]">Score</div>
                        <div className="text-xl font-bold">
                          {selectedMatch.match.score_home} - {selectedMatch.match.score_away}
                        </div>
                      </div>
                      <div>
                        <div className="text-sm text-[var(--pl-text-muted)]">Venue</div>
                        <div>{selectedMatch.match.venue || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[var(--pl-text-muted)]">Referee</div>
                        <div>{selectedMatch.match.referee || 'N/A'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-[var(--pl-text-muted)]">Attendance</div>
                        <div>{selectedMatch.match.attendance?.toLocaleString() || 'N/A'}</div>
                      </div>
                    </div>
                  </div>

                  {selectedMatch.home_team && selectedMatch.away_team && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Teams</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="font-semibold">{selectedMatch.home_team.name}</div>
                          <div className="text-sm text-[var(--pl-text-muted)]">Home</div>
                        </div>
                        <div>
                          <div className="font-semibold">{selectedMatch.away_team.name}</div>
                          <div className="text-sm text-[var(--pl-text-muted)]">Away</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedMatch.lineups && selectedMatch.lineups.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Lineups</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMatch.lineups.map((lineup: any, idx: number) => (
                          <div key={idx} className="p-3 bg-[var(--pl-bg-hover)] rounded">
                            <div className="font-semibold mb-2">
                              {lineup.is_home ? 'Home' : 'Away'} Team
                              {lineup.formation && <span className="text-sm text-[var(--pl-text-muted)] ml-2">({lineup.formation})</span>}
                            </div>
                            {lineup.starting_xi && Array.isArray(lineup.starting_xi) && (
                              <div className="text-sm">
                                <div className="font-medium mb-1">Starting XI:</div>
                                <div className="space-y-1 text-[var(--pl-text-muted)]">
                                  {lineup.starting_xi.slice(0, 5).map((player: any, pIdx: number) => (
                                    <div key={pIdx}>{player.name || player.player_name}</div>
                                  ))}
                                  {lineup.starting_xi.length > 5 && (
                                    <div>... and {lineup.starting_xi.length - 5} more</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMatch.events && selectedMatch.events.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Match Events ({selectedMatch.events.length})</h3>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {selectedMatch.events.map((event: any, idx: number) => (
                          <div key={idx} className="text-sm p-2 bg-[var(--pl-bg-hover)] rounded">
                            <span className="font-semibold">{event.minute}'</span> - <span className="capitalize">{event.event_type}</span>
                            {event.details?.player_name && (
                              <span className="text-[var(--pl-text-muted)]"> • {event.details.player_name}</span>
                            )}
                            {event.details?.assist_player && (
                              <span className="text-[var(--pl-text-muted)]"> (assist: {event.details.assist_player})</span>
                            )}
                            {event.details?.card_type && (
                              <span className="text-[var(--pl-text-muted)]"> ({event.details.card_type})</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedMatch.player_stats && selectedMatch.player_stats.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Player Statistics ({selectedMatch.player_stats.length})</h3>
                      <div className="text-sm text-[var(--pl-text-muted)] mb-2">
                        Showing statistics for {selectedMatch.player_stats.length} players
                      </div>
                      <div className="max-h-60 overflow-y-auto space-y-2">
                        {selectedMatch.player_stats.slice(0, 10).map((stat: any, idx: number) => (
                          <div key={idx} className="p-2 bg-[var(--pl-bg-hover)] rounded text-sm">
                            <div className="font-medium">
                              {stat.player_id ? `Player ${stat.player_id}` : 'Unknown Player'}
                            </div>
                            <div className="text-[var(--pl-text-muted)] text-xs mt-1">
                              Goals: {stat.goals || 0} • Assists: {stat.assists || 0} • Minutes: {stat.minutes || 0}
                            </div>
                          </div>
                        ))}
                        {selectedMatch.player_stats.length > 10 && (
                          <div className="text-center text-[var(--pl-text-muted)] py-2">
                            ... and {selectedMatch.player_stats.length - 10} more players
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedMatch.team_stats && selectedMatch.team_stats.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Team Statistics</h3>
                      <div className="grid grid-cols-2 gap-4">
                        {selectedMatch.team_stats.map((stat: any, idx: number) => (
                          <div key={idx} className="p-3 bg-[var(--pl-bg-hover)] rounded">
                            <div className="font-medium mb-2">{stat.is_home ? 'Home' : 'Away'} Team</div>
                            <div className="text-sm space-y-1 text-[var(--pl-text-muted)]">
                              {stat.possession !== null && <div>Possession: {stat.possession}%</div>}
                              {stat.shots !== null && <div>Shots: {stat.shots}</div>}
                              {stat.passes !== null && <div>Passes: {stat.passes}</div>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

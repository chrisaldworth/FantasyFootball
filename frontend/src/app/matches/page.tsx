'use client';

import { useState, useEffect, useMemo } from 'react';
import { matchDataApi, fplApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import { useSidebar } from '@/lib/sidebar-context';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import MatchCard from '@/components/matches/MatchCard';
import LiveMatchBanner from '@/components/matches/LiveMatchBanner';
import MatchesFilterTabs from '@/components/matches/MatchesFilterTabs';

interface Team {
  id: string;
  fbref_id: string;
  name: string;
  logo_url?: string;
}

interface Match {
  id: string;
  season: string;
  matchday?: number;
  match_date: string;
  home_team_id: string;
  away_team_id: string;
  score_home?: number;
  score_away?: number;
  status: string;
  venue?: string;
  referee?: string;
  attendance?: number;
  home_manager?: string;
  away_manager?: string;
  home_captain?: string;
  away_captain?: string;
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

// Team name to FPL ID mapping
const TEAM_NAME_TO_FPL_ID: Record<string, number> = {
  'Arsenal': 1,
  'Aston Villa': 2,
  'Bournemouth': 3,
  'Brentford': 4,
  'Brighton': 5,
  'Brighton & Hove Albion': 5,
  'Chelsea': 6,
  'Crystal Palace': 7,
  'Everton': 8,
  'Fulham': 9,
  'Ipswich Town': 10,
  'Ipswich': 10,
  'Leicester City': 11,
  'Leicester': 11,
  'Liverpool': 12,
  'Manchester City': 13,
  'Man City': 13,
  'Manchester United': 14,
  'Man Utd': 14,
  'Newcastle United': 15,
  'Newcastle': 15,
  'Nottingham Forest': 16,
  "Nott'm Forest": 16,
  'Southampton': 17,
  'Tottenham Hotspur': 18,
  'Spurs': 18,
  'Tottenham': 18,
  'West Ham United': 19,
  'West Ham': 19,
  'Wolverhampton Wanderers': 20,
  'Wolves': 20,
};

export default function MatchesPage() {
  const { user } = useAuth();
  const { isExpanded } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [seasons, setSeasons] = useState<string[]>([]);
  const [selectedSeason, setSelectedSeason] = useState<string>('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [selectedMatchDetails, setSelectedMatchDetails] = useState<MatchDetails | null>(null);
  const [totalMatches, setTotalMatches] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [activeTab, setActiveTab] = useState<'all' | 'live' | 'upcoming' | 'results'>('all');
  const [showMyTeamOnly, setShowMyTeamOnly] = useState(false);
  const [favoriteTeamName, setFavoriteTeamName] = useState<string | null>(null);
  const [bootstrap, setBootstrap] = useState<any>(null);
  const matchesPerPage = 30;

  // Load initial data
  useEffect(() => {
    loadSeasons();
    loadTeams();
    loadBootstrap();
  }, []);

  // Load matches when filters change
  useEffect(() => {
    if (selectedSeason) {
      loadMatches();
    }
  }, [selectedSeason, selectedTeam, currentPage]);

  // Get favorite team name
  useEffect(() => {
    if (user?.favorite_team_id && bootstrap?.teams) {
      const team = bootstrap.teams.find((t: any) => t.id === user.favorite_team_id);
      if (team) {
        setFavoriteTeamName(team.name);
      }
    }
  }, [user?.favorite_team_id, bootstrap]);

  const loadBootstrap = async () => {
    try {
      const data = await fplApi.getBootstrap();
      setBootstrap(data);
    } catch (err) {
      console.error('Failed to load bootstrap:', err);
    }
  };

  const loadSeasons = async () => {
    try {
      const data = await matchDataApi.getSeasons();
      const sortedSeasons = (data.seasons || []).sort((a: string, b: string) => b.localeCompare(a));
      setSeasons(sortedSeasons);
      if (sortedSeasons.length > 0) {
        setSelectedSeason(sortedSeasons[0]); // Default to latest season
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load seasons');
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
      
      // Sort matches by date (most recent first for results, earliest first for upcoming)
      const sortedMatches = (data.matches || []).sort((a: Match, b: Match) => {
        return new Date(b.match_date).getTime() - new Date(a.match_date).getTime();
      });
      
      setMatches(sortedMatches);
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
      setSelectedMatchDetails(data);
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

  const getFplTeamId = (teamName: string): number | null => {
    return TEAM_NAME_TO_FPL_ID[teamName] || null;
  };

  // Process matches for display
  const processedMatches = useMemo(() => {
    return matches.map(match => {
      const homeTeamName = getTeamName(match.home_team_id);
      const awayTeamName = getTeamName(match.away_team_id);
      
      // Determine match status
      let status: 'scheduled' | 'live' | 'finished' | 'postponed' = 'scheduled';
      if (match.status === 'finished' || match.status === 'FT') {
        status = 'finished';
      } else if (match.status === 'live' || match.status === 'LIVE') {
        status = 'live';
      } else if (match.status === 'postponed' || match.status === 'PP') {
        status = 'postponed';
      }

      return {
        id: match.id,
        homeTeam: homeTeamName,
        awayTeam: awayTeamName,
        homeTeamId: getFplTeamId(homeTeamName),
        awayTeamId: getFplTeamId(awayTeamName),
        homeScore: match.score_home ?? null,
        awayScore: match.score_away ?? null,
        date: match.match_date,
        status,
        venue: match.venue,
        matchday: match.matchday,
      };
    });
  }, [matches, teams]);

  // Filter matches based on active tab
  const filteredMatches = useMemo(() => {
    let filtered = processedMatches;
    
    // Filter by tab
    switch (activeTab) {
      case 'live':
        filtered = filtered.filter(m => m.status === 'live');
        break;
      case 'upcoming':
        filtered = filtered.filter(m => m.status === 'scheduled' && new Date(m.date) > new Date());
        // Sort upcoming by date ascending (soonest first)
        filtered = filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        break;
      case 'results':
        filtered = filtered.filter(m => m.status === 'finished');
        // Sort results by date descending (most recent first)
        filtered = filtered.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        break;
    }
    
    // Filter by favorite team
    if (showMyTeamOnly && favoriteTeamName) {
      filtered = filtered.filter(m => 
        m.homeTeam.toLowerCase().includes(favoriteTeamName.toLowerCase()) ||
        m.awayTeam.toLowerCase().includes(favoriteTeamName.toLowerCase())
      );
    }
    
    return filtered;
  }, [processedMatches, activeTab, showMyTeamOnly, favoriteTeamName]);

  // Calculate counts for tabs
  const tabCounts = useMemo(() => {
    const live = processedMatches.filter(m => m.status === 'live').length;
    const upcoming = processedMatches.filter(m => m.status === 'scheduled' && new Date(m.date) > new Date()).length;
    const results = processedMatches.filter(m => m.status === 'finished').length;
    
    return {
      all: processedMatches.length,
      live,
      upcoming,
      results,
    };
  }, [processedMatches]);

  // Get live matches for banner
  const liveMatches = useMemo(() => {
    return processedMatches
      .filter(m => m.status === 'live')
      .map(m => ({
        id: m.id,
        homeTeam: m.homeTeam,
        awayTeam: m.awayTeam,
        homeTeamId: m.homeTeamId || undefined,
        awayTeamId: m.awayTeamId || undefined,
        homeScore: m.homeScore || 0,
        awayScore: m.awayScore || 0,
        minute: 45, // Would need real minute data
        venue: m.venue,
      }));
  }, [processedMatches]);

  // Get next upcoming match for banner
  const nextMatch = useMemo(() => {
    const upcoming = processedMatches
      .filter(m => m.status === 'scheduled' && new Date(m.date) > new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (upcoming.length === 0) return null;
    
    const next = upcoming[0];
    return {
      id: next.id,
      homeTeam: next.homeTeam,
      awayTeam: next.awayTeam,
      homeTeamId: next.homeTeamId || undefined,
      awayTeamId: next.awayTeamId || undefined,
      date: next.date,
      venue: next.venue,
    };
  }, [processedMatches]);

  const isFavoriteTeamMatch = (match: typeof processedMatches[0]) => {
    if (!favoriteTeamName) return false;
    return match.homeTeam.toLowerCase().includes(favoriteTeamName.toLowerCase()) ||
           match.awayTeam.toLowerCase().includes(favoriteTeamName.toLowerCase());
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-GB', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  // Group matches by date for results
  const matchesByDate = useMemo(() => {
    const groups: Record<string, typeof filteredMatches> = {};
    
    filteredMatches.forEach(match => {
      const dateKey = new Date(match.date).toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(match);
    });
    
    return groups;
  }, [filteredMatches]);

  const totalPages = Math.ceil(totalMatches / matchesPerPage);

  return (
    <div className="min-h-screen bg-[var(--pl-background)] pb-20 lg:pb-0">
      <SideNavigation />
      
      <TopNavigation
        pageTitle="Matches"
        showBackButton={true}
        backHref="/dashboard"
        showFavoriteTeam={true}
      />

      <main className={`pt-20 sm:pt-20 lg:pt-28 px-4 sm:px-6 transition-all duration-300 ${
        isExpanded ? 'lg:pl-72' : 'lg:pl-24'
      } lg:pr-6`}>
        <div className="max-w-5xl mx-auto">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-3">
              <span>🏟️</span>
              <span>Premier League Matches</span>
            </h1>
            <p className="text-sm sm:text-base text-[var(--pl-text-muted)]">
              Live scores, fixtures, and results
            </p>
          </div>

          {/* Live/Next Match Banner */}
          {(liveMatches.length > 0 || nextMatch) && (
            <div className="mb-6">
              <LiveMatchBanner liveMatches={liveMatches} nextMatch={nextMatch} />
            </div>
          )}

          {/* Season Selector */}
          <div className="mb-4 flex flex-wrap gap-3 items-center">
            <select
              value={selectedSeason}
              onChange={(e) => {
                setSelectedSeason(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              disabled={loading}
            >
              {seasons.map(season => (
                <option key={season} value={season}>{season}</option>
              ))}
            </select>

            <select
              value={selectedTeam}
              onChange={(e) => {
                setSelectedTeam(e.target.value);
                setCurrentPage(0);
              }}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              disabled={loading}
            >
              <option value="">All Teams</option>
              {teams.sort((a, b) => a.name.localeCompare(b.name)).map(team => (
                <option key={team.id} value={team.id}>{team.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Tabs */}
          <div className="mb-6">
            <MatchesFilterTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              counts={tabCounts}
              showMyTeamOnly={showMyTeamOnly}
              onMyTeamToggle={setShowMyTeamOnly}
              hasMyTeam={!!favoriteTeamName}
            />
          </div>

          {/* Error State */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
              {error}
            </div>
          )}

          {/* Loading State */}
          {loading && matches.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-[var(--pl-green)]"></div>
              <p className="mt-4 text-[var(--pl-text-muted)]">Loading matches...</p>
            </div>
          )}

          {/* Matches List */}
          {!loading && filteredMatches.length > 0 && (
            <div className="space-y-6">
              {activeTab === 'results' || activeTab === 'all' ? (
                // Group by date for results
                Object.entries(matchesByDate).map(([dateKey, dateMatches]) => (
                  <div key={dateKey}>
                    <h3 className="text-sm font-semibold text-[var(--pl-text-muted)] mb-3 sticky top-20 bg-[var(--pl-background)] py-2 z-10">
                      {formatDate(dateMatches[0].date)}
                    </h3>
                    <div className="space-y-2">
                      {dateMatches.map(match => (
                        <MatchCard
                          key={match.id}
                          match={match}
                          isFavoriteTeamMatch={isFavoriteTeamMatch(match)}
                          onViewDetails={() => loadMatchDetails(match.id)}
                          showPrediction={match.status === 'scheduled'}
                        />
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                // Simple list for other tabs
                <div className="space-y-2">
                  {filteredMatches.map(match => (
                    <MatchCard
                      key={match.id}
                      match={match}
                      isFavoriteTeamMatch={isFavoriteTeamMatch(match)}
                      onViewDetails={() => loadMatchDetails(match.id)}
                      showPrediction={match.status === 'scheduled'}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!loading && filteredMatches.length === 0 && selectedSeason && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">
                {activeTab === 'live' ? '📺' : activeTab === 'upcoming' ? '📅' : '🏆'}
              </div>
              <h3 className="text-xl font-bold mb-2">
                {activeTab === 'live' ? 'No Live Matches' : 
                 activeTab === 'upcoming' ? 'No Upcoming Matches' : 
                 'No Results Found'}
              </h3>
              <p className="text-[var(--pl-text-muted)]">
                {activeTab === 'live' ? 'Check back during match time!' :
                 activeTab === 'upcoming' ? 'All matches have been played for this selection.' :
                 'Try selecting a different season or team.'}
              </p>
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 mb-4">
              <button
                onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))}
                disabled={currentPage === 0}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                ← Previous
              </button>
              <span className="px-4 py-2 text-sm text-[var(--pl-text-muted)]">
                Page {currentPage + 1} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))}
                disabled={currentPage >= totalPages - 1}
                className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </main>

      {/* Match Details Modal */}
      {selectedMatchDetails && (
        <MatchDetailsModal
          details={selectedMatchDetails}
          onClose={() => setSelectedMatchDetails(null)}
          formatDate={formatDate}
        />
      )}

      <BottomNavigation />
    </div>
  );
}

// Match Details Modal Component
function MatchDetailsModal({
  details,
  onClose,
  formatDate,
}: {
  details: MatchDetails;
  onClose: () => void;
  formatDate: (date: string) => string;
}) {
  const getTeamLogo = (teamName: string) => {
    const fplId = TEAM_NAME_TO_FPL_ID[teamName];
    if (fplId) {
      return `https://resources.premierleague.com/premierleague/badges/70/t${fplId}.png`;
    }
    return null;
  };

  return (
    <div 
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-start justify-center p-4 z-50 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="glass rounded-2xl w-full max-w-4xl my-8" 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 glass rounded-t-2xl p-4 sm:p-6 border-b border-white/10 z-10">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">Match Details</h2>
              <p className="text-sm text-[var(--pl-text-muted)]">{formatDate(details.match.match_date)}</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Score Banner */}
          <div className="bg-gradient-to-r from-[var(--pl-green)]/10 via-transparent to-[var(--pl-green)]/10 rounded-xl p-6">
            <div className="flex items-center justify-between">
              {/* Home Team */}
              <div className="flex-1 text-center">
                {getTeamLogo(details.home_team.name) && (
                  <img
                    src={getTeamLogo(details.home_team.name)!}
                    alt={details.home_team.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2"
                  />
                )}
                <div className="font-bold text-lg sm:text-xl">{details.home_team.name}</div>
                {details.match.home_manager && (
                  <div className="text-xs text-[var(--pl-text-muted)]">{details.match.home_manager}</div>
                )}
              </div>

              {/* Score */}
              <div className="px-6 text-center">
                <div className="flex items-center gap-4">
                  <span className="text-4xl sm:text-5xl font-black">
                    {details.match.score_home ?? '-'}
                  </span>
                  <span className="text-2xl text-white/30">-</span>
                  <span className="text-4xl sm:text-5xl font-black">
                    {details.match.score_away ?? '-'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-[var(--pl-text-muted)] capitalize">
                  {details.match.status}
                </div>
              </div>

              {/* Away Team */}
              <div className="flex-1 text-center">
                {getTeamLogo(details.away_team.name) && (
                  <img
                    src={getTeamLogo(details.away_team.name)!}
                    alt={details.away_team.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-2"
                  />
                )}
                <div className="font-bold text-lg sm:text-xl">{details.away_team.name}</div>
                {details.match.away_manager && (
                  <div className="text-xs text-[var(--pl-text-muted)]">{details.match.away_manager}</div>
                )}
              </div>
            </div>
          </div>

          {/* Match Info */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {details.match.venue && (
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-[var(--pl-text-muted)] text-xs mb-1">Venue</div>
                <div className="font-medium text-sm">{details.match.venue}</div>
              </div>
            )}
            {details.match.referee && (
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-[var(--pl-text-muted)] text-xs mb-1">Referee</div>
                <div className="font-medium text-sm">{details.match.referee}</div>
              </div>
            )}
            {details.match.attendance && (
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-[var(--pl-text-muted)] text-xs mb-1">Attendance</div>
                <div className="font-medium text-sm">{details.match.attendance.toLocaleString()}</div>
              </div>
            )}
            {details.match.matchday && (
              <div className="text-center p-3 rounded-lg bg-white/5">
                <div className="text-[var(--pl-text-muted)] text-xs mb-1">Matchday</div>
                <div className="font-medium text-sm">GW {details.match.matchday}</div>
              </div>
            )}
          </div>

          {/* Events */}
          {details.events && details.events.length > 0 && (
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>⚽</span>
                <span>Match Events</span>
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {details.events.map((event: any, idx: number) => {
                  const isHome = event.team_id === details.match.home_team_id;
                  const teamName = isHome ? details.home_team.name : details.away_team.name;
                  const eventIcon = event.event_type === 'goal' ? '⚽' : 
                                   event.event_type === 'yellow_card' ? '🟨' :
                                   event.event_type === 'red_card' ? '🟥' :
                                   event.event_type === 'substitution' ? '🔄' : '•';
                  
                  return (
                    <div 
                      key={idx} 
                      className={`flex items-center gap-3 p-3 rounded-lg bg-white/5 ${
                        isHome ? '' : 'flex-row-reverse text-right'
                      }`}
                    >
                      <span className="text-lg">{eventIcon}</span>
                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {event.details?.player_name || event.event_type}
                        </div>
                        {event.details?.assist_player && (
                          <div className="text-xs text-[var(--pl-text-muted)]">
                            Assist: {event.details.assist_player}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-[var(--pl-text-muted)]">
                        {event.minute}'
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Team Stats */}
          {details.team_stats && details.team_stats.length === 2 && (
            <div>
              <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                <span>📊</span>
                <span>Statistics</span>
              </h3>
              <div className="space-y-3">
                {['possession', 'shots', 'shots_on_target', 'passes', 'pass_accuracy'].map(stat => {
                  const homeStat = details.team_stats.find((s: any) => s.is_home);
                  const awayStat = details.team_stats.find((s: any) => !s.is_home);
                  
                  if (!homeStat?.[stat] && !awayStat?.[stat]) return null;
                  
                  const homeVal = homeStat?.[stat] || 0;
                  const awayVal = awayStat?.[stat] || 0;
                  const total = homeVal + awayVal || 1;
                  const homePercent = (homeVal / total) * 100;
                  
                  return (
                    <div key={stat} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{homeVal}{stat.includes('accuracy') || stat === 'possession' ? '%' : ''}</span>
                        <span className="text-[var(--pl-text-muted)] capitalize">{stat.replace(/_/g, ' ')}</span>
                        <span className="font-medium">{awayVal}{stat.includes('accuracy') || stat === 'possession' ? '%' : ''}</span>
                      </div>
                      <div className="flex h-2 rounded-full overflow-hidden bg-white/10">
                        <div 
                          className="bg-[var(--pl-green)] transition-all"
                          style={{ width: `${homePercent}%` }}
                        />
                        <div 
                          className="bg-[var(--pl-cyan)]"
                          style={{ width: `${100 - homePercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

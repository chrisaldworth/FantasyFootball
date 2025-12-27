'use client';
import { useEffect, useState } from 'react';

interface PlayerStat {
  player_name: string;
  minutes: number | null;
  goals: number | null;
  assists: number | null;
  shots: number | null;
  shots_on_target: number | null;
  passes: number | null;
  pass_accuracy: number | null;
  tackles: number | null;
  interceptions: number | null;
  fouls: number | null;
  cards: string | null;
}

interface MatchEvent {
  type: string;
  player_name: string;
  player_id?: string | null;
  minute: number | string | null;
  team: 'home' | 'away';
  card_type?: 'yellow' | 'red';
  substituted_for?: string;
}

interface MatchData {
  match_id: string;
  date: string | null;
  competition: string;
  home_team: { name: string; fbref_id: string };
  away_team: { name: string; fbref_id: string };
  score: { home: number | null; away: number | null };
  lineups: {
    home: { starting_xi: any[]; substitutes: any[]; formation: string | null };
    away: { starting_xi: any[]; substitutes: any[]; formation: string | null };
  };
  events: {
    goals: MatchEvent[];
    assists: MatchEvent[];
    cards: MatchEvent[];
    substitutions: MatchEvent[];
    other: MatchEvent[];
  };
  player_stats: {
    home: PlayerStat[];
    away: PlayerStat[];
  };
  team_stats: {
    home: any;
    away: any;
  };
  match_info: {
    home_score: number | null;
    away_score: number | null;
    date: string | null;
  };
}

export default function MatchDataTest() {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        // Try API route first, fallback to public file
        let response = await fetch('/api/match-data-test');
        
        if (!response.ok) {
          console.warn('API route failed, trying public file...');
          // Fallback to public file
          response = await fetch('/match-test-data.json');
          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
          }
        }
        
        const data: MatchData = await response.json();
        setMatchData(data);
      } catch (e: any) {
        console.error('Error fetching match data:', e);
        setError(e.message || 'Failed to load match data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-white">Loading match data...</div>;
  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!matchData) return <div className="p-8 text-white">No match data found.</div>;

  const renderPlayerStats = (stats: PlayerStat[], teamName: string) => (
    <div className="w-full lg:w-1/2 p-2">
      <h3 className="text-xl font-semibold mb-4 text-center text-purple-300">{teamName} Player Stats</h3>
      {stats.length === 0 ? (
        <p className="text-center text-gray-400">No player stats available.</p>
      ) : (
        <div className="overflow-x-auto bg-gray-800 rounded-lg shadow-lg">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Player</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Min</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Gls</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ast</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sh</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SoT</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Passes</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Pass Acc (%)</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tkl</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Int</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Fouls</th>
                <th scope="col" className="px-4 py-2 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Cards</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {stats.map((player, index) => (
                <tr key={index} className="hover:bg-gray-700">
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">{player.player_name}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.minutes ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.goals ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.assists ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.shots ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.shots_on_target ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.passes ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.pass_accuracy ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.tackles ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.interceptions ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.fouls ?? '-'}</td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">{player.cards ?? '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const renderEventIcon = (type: string, cardType?: string) => {
    switch (type) {
      case 'goal': return '⚽';
      case 'assist': return '🅰️';
      case 'card': return cardType === 'yellow' ? '🟨' : '🟥';
      case 'substitution': return '🔄';
      default: return '📝';
    }
  };

  const allEvents: MatchEvent[] = [
    ...matchData.events.goals,
    ...matchData.events.assists,
    ...matchData.events.cards,
    ...matchData.events.substitutions,
    ...matchData.events.other,
  ].sort((a, b) => {
    const minuteA = typeof a.minute === 'string' ? parseInt(a.minute.split('+')[0]) : a.minute || 0;
    const minuteB = typeof b.minute === 'string' ? parseInt(b.minute.split('+')[0]) : b.minute || 0;
    return minuteA - minuteB;
  });

  const homeStartingXI = matchData.lineups?.home?.starting_xi || [];
  const awayStartingXI = matchData.lineups?.away?.starting_xi || [];
  const homeSubs = matchData.lineups?.home?.substitutes || [];
  const awaySubs = matchData.lineups?.away?.substitutes || [];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 sm:p-8 font-sans">
      <div className="max-w-7xl mx-auto bg-gray-800 rounded-xl shadow-2xl p-6 sm:p-8 border border-purple-700">
        <h1 className="text-3xl sm:text-4xl font-bold text-center text-purple-400 mb-6">Match Data Test Viewer</h1>

        {/* Match Header */}
        <div className="bg-gray-700 rounded-lg p-4 mb-6 shadow-md flex flex-col sm:flex-row justify-between items-center">
          <div className="text-center sm:text-left mb-4 sm:mb-0">
            <p className="text-lg text-gray-300">{matchData.competition || 'Competition N/A'}</p>
            <h2 className="text-2xl font-bold text-white">{matchData.home_team.name} vs {matchData.away_team.name}</h2>
            <p className="text-md text-gray-400">{matchData.date || matchData.match_info?.date || 'Date N/A'}</p>
            <p className="text-sm text-gray-500">Match ID: {matchData.match_id}</p>
          </div>
          <div className="text-center">
            <p className="text-4xl sm:text-5xl font-extrabold text-purple-300">
              {matchData.score.home ?? matchData.match_info?.home_score ?? '?'} : {matchData.score.away ?? matchData.match_info?.away_score ?? '?'}
            </p>
          </div>
        </div>

        {/* Data Summary */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          <div className="bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-300">{matchData.events.goals.length}</p>
            <p className="text-sm text-gray-400">Goals</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-300">{matchData.events.assists.length}</p>
            <p className="text-sm text-gray-400">Assists</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-300">{matchData.events.cards.length}</p>
            <p className="text-sm text-gray-400">Cards</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-300">{matchData.events.substitutions.length}</p>
            <p className="text-sm text-gray-400">Substitutions</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-300">{matchData.lineups.home.starting_xi.length + matchData.lineups.away.starting_xi.length}</p>
            <p className="text-sm text-gray-400">Starting XI</p>
          </div>
          <div className="bg-gray-700 p-3 rounded-lg text-center">
            <p className="text-2xl font-bold text-purple-300">{matchData.player_stats.home.length + matchData.player_stats.away.length}</p>
            <p className="text-sm text-gray-400">Players</p>
          </div>
        </div>

        {/* Match Events */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-purple-300 mb-4">Match Events</h2>
          {allEvents.length === 0 ? (
            <div className="bg-yellow-900/20 border border-yellow-700 rounded-lg p-4">
              <p className="text-yellow-300">⚠️ No events captured for this match.</p>
              <p className="text-yellow-400 text-sm mt-2">This indicates the event extraction is not working yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Goals */}
              {matchData.events.goals.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-green-400 mb-2">Goals ({matchData.events.goals.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {matchData.events.goals.map((event, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg flex items-center shadow-sm">
                        <span className="text-lg mr-3">⚽</span>
                        <div className="flex-1">
                          <p className="text-gray-200">
                            <span className="font-semibold">{event.minute}'</span> - {event.player_name}
                          </p>
                          <p className="text-sm text-gray-400">{event.team === 'home' ? matchData.home_team.name : matchData.away_team.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Assists */}
              {matchData.events.assists.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">Assists ({matchData.events.assists.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {matchData.events.assists.map((event, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg flex items-center shadow-sm">
                        <span className="text-lg mr-3">🅰️</span>
                        <div className="flex-1">
                          <p className="text-gray-200">
                            <span className="font-semibold">{event.minute}'</span> - {event.player_name}
                          </p>
                          <p className="text-sm text-gray-400">{event.team === 'home' ? matchData.home_team.name : matchData.away_team.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Cards */}
              {matchData.events.cards.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-yellow-400 mb-2">Cards ({matchData.events.cards.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {matchData.events.cards.map((event, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg flex items-center shadow-sm">
                        <span className="text-lg mr-3">{event.card_type === 'yellow' ? '🟨' : '🟥'}</span>
                        <div className="flex-1">
                          <p className="text-gray-200">
                            <span className="font-semibold">{event.minute}'</span> - {event.player_name} ({event.card_type})
                          </p>
                          <p className="text-sm text-gray-400">{event.team === 'home' ? matchData.home_team.name : matchData.away_team.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Substitutions */}
              {matchData.events.substitutions.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-cyan-400 mb-2">Substitutions ({matchData.events.substitutions.length})</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {matchData.events.substitutions.map((event, index) => (
                      <div key={index} className="bg-gray-700 p-3 rounded-lg flex items-center shadow-sm">
                        <span className="text-lg mr-3">🔄</span>
                        <div className="flex-1">
                          <p className="text-gray-200">
                            <span className="font-semibold">{event.minute}'</span> - {event.player_name}
                            {event.substituted_for && ` → ${event.substituted_for}`}
                          </p>
                          <p className="text-sm text-gray-400">{event.team === 'home' ? matchData.home_team.name : matchData.away_team.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Lineups */}
        {(homeStartingXI.length > 0 || awayStartingXI.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">Lineups</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{matchData.home_team.name}</h3>
                {matchData.lineups?.home?.formation && (
                  <p className="text-sm text-gray-400 mb-2">Formation: {matchData.lineups.home.formation}</p>
                )}
                <div className="space-y-1">
                  {homeStartingXI.map((player, idx) => (
                    <p key={idx} className="text-sm text-gray-300">{player.name || player.player_name || JSON.stringify(player)}</p>
                  ))}
                </div>
                {homeSubs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-sm font-semibold text-gray-400 mb-1">Substitutes:</p>
                    {homeSubs.map((sub, idx) => (
                      <p key={idx} className="text-sm text-gray-300">{sub.name || sub.player_name || JSON.stringify(sub)}</p>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-gray-700 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-2">{matchData.away_team.name}</h3>
                {matchData.lineups?.away?.formation && (
                  <p className="text-sm text-gray-400 mb-2">Formation: {matchData.lineups.away.formation}</p>
                )}
                <div className="space-y-1">
                  {awayStartingXI.map((player, idx) => (
                    <p key={idx} className="text-sm text-gray-300">{player.name || player.player_name || JSON.stringify(player)}</p>
                  ))}
                </div>
                {awaySubs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-600">
                    <p className="text-sm font-semibold text-gray-400 mb-1">Substitutes:</p>
                    {awaySubs.map((sub, idx) => (
                      <p key={idx} className="text-sm text-gray-300">{sub.name || sub.player_name || JSON.stringify(sub)}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Player Stats */}
        <div className="flex flex-wrap -mx-2 mb-8">
          {renderPlayerStats(matchData.player_stats.home, matchData.home_team.name)}
          {renderPlayerStats(matchData.player_stats.away, matchData.away_team.name)}
        </div>

        {/* Raw JSON Toggle */}
        <div className="mt-8 pt-6 border-t border-gray-700">
          <button
            onClick={() => setShowRawJson(!showRawJson)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition duration-300 ease-in-out"
          >
            {showRawJson ? 'Hide Raw JSON' : 'Show Raw JSON'}
          </button>
          {showRawJson && (
            <pre className="bg-gray-900 p-4 rounded-lg mt-4 text-sm overflow-x-auto max-h-96">
              <code className="text-gray-100">{JSON.stringify(matchData, null, 2)}</code>
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}


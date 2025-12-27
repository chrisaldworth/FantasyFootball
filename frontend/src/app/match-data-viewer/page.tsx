'use client';

import { useEffect, useState } from 'react';

interface PlayerStats {
  player_name: string;
  player_id: string;
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

interface MatchData {
  match_id: string;
  date: string | null;
  competition: string;
  home_team: {
    name: string;
    fbref_id: string;
  };
  away_team: {
    name: string;
    fbref_id: string;
  };
  score: {
    home: number | null;
    away: number | null;
  };
  lineups: {
    home: {
      starting_xi: any[];
      substitutes: any[];
      formation: string | null;
    };
    away: {
      starting_xi: any[];
      substitutes: any[];
      formation: string | null;
    };
  };
  events: {
    goals: any[];
    assists: any[];
    cards: any[];
    substitutions: any[];
    other: any[];
  };
  player_stats: {
    home: PlayerStats[];
    away: PlayerStats[];
  };
}

export default function MatchDataViewer() {
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/data/match-example.json')
      .then(res => res.json())
      .then(data => {
        setMatchData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading match data...</div>
      </div>
    );
  }

  if (error || !matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-red-400 text-xl">Error loading data: {error || 'No data found'}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Match Data Viewer</h1>
          <p className="text-slate-300">Preview of scraped match data from fbref.com</p>
        </div>

        {/* Match Info */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">{matchData.home_team.name}</h2>
              <p className="text-slate-400">ID: {matchData.home_team.fbref_id}</p>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">
                {matchData.score.home !== null ? matchData.score.home : '?'} - {matchData.score.away !== null ? matchData.score.away : '?'}
              </div>
              <p className="text-slate-400">{matchData.competition}</p>
              {matchData.date && <p className="text-slate-400 mt-2">{matchData.date}</p>}
            </div>
            <div className="text-right">
              <h2 className="text-2xl font-bold mb-4">{matchData.away_team.name}</h2>
              <p className="text-slate-400">ID: {matchData.away_team.fbref_id}</p>
            </div>
          </div>
        </div>

        {/* Events */}
        {(matchData.events.goals.length > 0 || matchData.events.assists.length > 0 || matchData.events.cards.length > 0) && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">Match Events</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {matchData.events.goals.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-green-400">Goals ({matchData.events.goals.length})</h3>
                  <ul className="space-y-1 text-sm">
                    {matchData.events.goals.map((goal, idx) => (
                      <li key={idx} className="text-slate-300">
                        {goal.player_name} ({goal.minute}')
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {matchData.events.assists.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-blue-400">Assists ({matchData.events.assists.length})</h3>
                  <ul className="space-y-1 text-sm">
                    {matchData.events.assists.map((assist, idx) => (
                      <li key={idx} className="text-slate-300">
                        {assist.player_name} ({assist.minute}')
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {matchData.events.cards.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-yellow-400">Cards ({matchData.events.cards.length})</h3>
                  <ul className="space-y-1 text-sm">
                    {matchData.events.cards.map((card, idx) => (
                      <li key={idx} className="text-slate-300">
                        {card.player_name} ({card.minute}')
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Player Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Home Team Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">{matchData.home_team.name} Player Stats</h2>
            <p className="text-slate-400 mb-4">{matchData.player_stats.home.length} players</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-2">Player</th>
                    <th className="text-right p-2">Min</th>
                    <th className="text-right p-2">G</th>
                    <th className="text-right p-2">A</th>
                    <th className="text-right p-2">Sh</th>
                    <th className="text-right p-2">SoT</th>
                    <th className="text-right p-2">Pass</th>
                    <th className="text-right p-2">Pass%</th>
                    <th className="text-right p-2">Tkl</th>
                    <th className="text-right p-2">Int</th>
                  </tr>
                </thead>
                <tbody>
                  {matchData.player_stats.home.map((player, idx) => (
                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-2 font-medium">{player.player_name}</td>
                      <td className="text-right p-2">{player.minutes ?? '-'}</td>
                      <td className="text-right p-2">{player.goals ?? '-'}</td>
                      <td className="text-right p-2">{player.assists ?? '-'}</td>
                      <td className="text-right p-2">{player.shots ?? '-'}</td>
                      <td className="text-right p-2">{player.shots_on_target ?? '-'}</td>
                      <td className="text-right p-2">{player.passes ?? '-'}</td>
                      <td className="text-right p-2">{player.pass_accuracy !== null ? `${player.pass_accuracy.toFixed(1)}%` : '-'}</td>
                      <td className="text-right p-2">{player.tackles ?? '-'}</td>
                      <td className="text-right p-2">{player.interceptions ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Away Team Stats */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
            <h2 className="text-2xl font-bold mb-4">{matchData.away_team.name} Player Stats</h2>
            <p className="text-slate-400 mb-4">{matchData.player_stats.away.length} players</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left p-2">Player</th>
                    <th className="text-right p-2">Min</th>
                    <th className="text-right p-2">G</th>
                    <th className="text-right p-2">A</th>
                    <th className="text-right p-2">Sh</th>
                    <th className="text-right p-2">SoT</th>
                    <th className="text-right p-2">Pass</th>
                    <th className="text-right p-2">Pass%</th>
                    <th className="text-right p-2">Tkl</th>
                    <th className="text-right p-2">Int</th>
                  </tr>
                </thead>
                <tbody>
                  {matchData.player_stats.away.map((player, idx) => (
                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/30">
                      <td className="p-2 font-medium">{player.player_name}</td>
                      <td className="text-right p-2">{player.minutes ?? '-'}</td>
                      <td className="text-right p-2">{player.goals ?? '-'}</td>
                      <td className="text-right p-2">{player.assists ?? '-'}</td>
                      <td className="text-right p-2">{player.shots ?? '-'}</td>
                      <td className="text-right p-2">{player.shots_on_target ?? '-'}</td>
                      <td className="text-right p-2">{player.passes ?? '-'}</td>
                      <td className="text-right p-2">{player.pass_accuracy !== null ? `${player.pass_accuracy.toFixed(1)}%` : '-'}</td>
                      <td className="text-right p-2">{player.tackles ?? '-'}</td>
                      <td className="text-right p-2">{player.interceptions ?? '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Data Summary */}
        <div className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <h2 className="text-2xl font-bold mb-4">Data Summary</h2>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">Match Info</h3>
              <ul className="space-y-1 text-slate-300">
                <li>Match ID: {matchData.match_id}</li>
                <li>Competition: {matchData.competition}</li>
                <li>Date: {matchData.date || 'Not available'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Statistics</h3>
              <ul className="space-y-1 text-slate-300">
                <li>Home Players: {matchData.player_stats.home.length}</li>
                <li>Away Players: {matchData.player_stats.away.length}</li>
                <li>Goals: {matchData.events.goals.length}</li>
                <li>Assists: {matchData.events.assists.length}</li>
                <li>Cards: {matchData.events.cards.length}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Raw JSON Toggle */}
        <details className="mt-6 bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700">
          <summary className="cursor-pointer font-semibold text-lg mb-4">View Raw JSON Data</summary>
          <pre className="text-xs overflow-x-auto bg-slate-900/50 p-4 rounded border border-slate-700">
            {JSON.stringify(matchData, null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}




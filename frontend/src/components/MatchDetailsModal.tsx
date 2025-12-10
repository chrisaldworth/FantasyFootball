'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface MatchDetailsModalProps {
  fixture: {
    fixture: {
      id: number;
      date: string;
      status: {
        long: string;
        short: string;
        elapsed?: number;
      };
      venue?: {
        name?: string;
      };
    };
    league: {
      id: number;
      name: string;
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
  };
  isOpen: boolean;
  onClose: () => void;
}

interface MatchEvent {
  time: {
    elapsed?: number;
    extra?: number;
  };
  team: {
    id: number;
    name: string;
  };
  player: {
    id: number;
    name: string;
  };
  assist: {
    id?: number;
    name?: string;
  } | null;
  type: string; // Goal, Card, subst
  detail: string; // Normal Goal, Yellow Card, Substitution
  comments?: string;
}

interface Lineup {
  team: {
    id: number;
    name: string;
  };
  coach: {
    id: number;
    name: string;
  };
  formation: string;
  startXI: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
    };
  }>;
  substitutes: Array<{
    player: {
      id: number;
      name: string;
      number: number;
      pos: string;
    };
  }>;
}

interface Statistic {
  team: {
    id: number;
    name: string;
  };
  statistics: Array<{
    type: string;
    value: number | string;
  }>;
}

export default function MatchDetailsModal({ fixture, isOpen, onClose }: MatchDetailsModalProps) {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<MatchEvent[]>([]);
  const [lineups, setLineups] = useState<Lineup[]>([]);
  const [statistics, setStatistics] = useState<Statistic[]>([]);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'events' | 'lineups' | 'stats'>('events');

  useEffect(() => {
    if (isOpen && fixture.fixture.id) {
      fetchMatchDetails();
    }
  }, [isOpen, fixture.fixture.id]);

  const fetchMatchDetails = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/football/match/${fixture.fixture.id}`);
      setEvents(response.data.events || []);
      setLineups(response.data.lineups || []);
      setStatistics(response.data.statistics || []);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load match details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      weekday: 'long',
      day: 'numeric', 
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getEventIcon = (type: string, detail: string) => {
    if (type === 'Goal') {
      if (detail.includes('Penalty')) return '🎯';
      if (detail.includes('Own')) return '😱';
      return '⚽';
    }
    if (type === 'Card') {
      if (detail.includes('Red')) return '🟥';
      return '🟨';
    }
    if (type === 'subst') return '🔄';
    return '📝';
  };

  if (!isOpen) return null;

  const homeTeam = fixture.teams.home;
  const awayTeam = fixture.teams.away;
  const isFinished = fixture.fixture.status.long === 'Match Finished';
  const isLive = fixture.fixture.status.short === 'LIVE' || fixture.fixture.status.elapsed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-[#1a1a2e] rounded-2xl shadow-2xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-1">{fixture.league.name}</h2>
            <p className="text-sm text-gray-400">{formatDate(fixture.fixture.date)}</p>
            {fixture.fixture.venue?.name && (
              <p className="text-xs text-gray-500 mt-1">📍 {fixture.fixture.venue.name}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors ml-4"
          >
            ✕
          </button>
        </div>

        {/* Match Score Header */}
        <div className={`p-6 ${isLive ? 'bg-[var(--pl-green)]/20 border-b border-[var(--pl-green)]/30' : 'bg-white/5'}`}>
          <div className="flex items-center justify-between">
            <div className="flex-1 text-right">
              <div className="text-xl font-bold">{homeTeam.name}</div>
              {fixture.goals.home !== undefined && (
                <div className="text-4xl font-bold mt-2">{fixture.goals.home}</div>
              )}
            </div>
            
            <div className="px-8 text-center">
              <div className={`text-sm font-semibold px-4 py-2 rounded-lg ${
                isLive 
                  ? 'bg-[var(--pl-green)] text-white' 
                  : isFinished
                  ? 'bg-gray-600 text-gray-200'
                  : 'bg-gray-700 text-gray-300'
              }`}>
                {isLive 
                  ? `LIVE ${fixture.fixture.status.elapsed || ''}'`
                  : isFinished
                  ? 'FT'
                  : fixture.fixture.status.short}
              </div>
            </div>
            
            <div className="flex-1 text-left">
              <div className="text-xl font-bold">{awayTeam.name}</div>
              {fixture.goals.away !== undefined && (
                <div className="text-4xl font-bold mt-2">{fixture.goals.away}</div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab('events')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'events'
                ? 'border-[var(--pl-green)] text-[var(--pl-green)]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Events ({events.length})
          </button>
          <button
            onClick={() => setActiveTab('lineups')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'lineups'
                ? 'border-[var(--pl-green)] text-[var(--pl-green)]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Lineups ({lineups.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`px-4 py-2 font-medium transition-colors border-b-2 ${
              activeTab === 'stats'
                ? 'border-[var(--pl-green)] text-[var(--pl-green)]'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            Statistics
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-12 text-yellow-400">
              <p>{error}</p>
              <p className="text-sm text-gray-400 mt-2">Match details may not be available for this fixture</p>
            </div>
          ) : (
            <>
              {activeTab === 'events' && (
                <div className="space-y-3">
                  {events.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>No events available</p>
                    </div>
                  ) : (
                    events.map((event, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center gap-4 p-4 rounded-xl ${
                          event.team.id === homeTeam.id
                            ? 'bg-[var(--pl-green)]/10 border-l-4 border-[var(--pl-green)]'
                            : 'bg-blue-500/10 border-l-4 border-blue-500'
                        }`}
                      >
                        <div className="text-2xl">{getEventIcon(event.type, event.detail)}</div>
                        <div className="flex-1">
                          <div className="font-semibold">{event.player.name}</div>
                          <div className="text-sm text-gray-400">
                            {event.detail}
                            {event.assist && ` (Assist: ${event.assist.name})`}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold">
                            {event.time.elapsed}
                            {event.time.extra ? `+${event.time.extra}` : ''}'
                          </div>
                          <div className="text-xs text-gray-400">{event.team.name}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'lineups' && (
                <div className="space-y-6">
                  {lineups.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>Lineups not available for this match</p>
                    </div>
                  ) : (
                    lineups.map((lineup) => (
                      <div key={lineup.team.id} className="bg-white/5 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-bold text-lg">{lineup.team.name}</div>
                            <div className="text-sm text-gray-400">Formation: {lineup.formation}</div>
                          </div>
                          <div className="text-sm text-gray-400">Coach: {lineup.coach.name}</div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          {/* Starting XI */}
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-gray-400">Starting XI</h4>
                            <div className="space-y-1">
                              {lineup.startXI.map((player, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm">
                                  <span className="w-8 text-center font-bold">{player.player.number}</span>
                                  <span>{player.player.name}</span>
                                  <span className="text-xs text-gray-500 ml-auto">{player.player.pos}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                          
                          {/* Substitutes */}
                          <div>
                            <h4 className="font-semibold mb-2 text-sm text-gray-400">Substitutes</h4>
                            <div className="space-y-1">
                              {lineup.substitutes.map((player, idx) => (
                                <div key={idx} className="flex items-center gap-2 text-sm opacity-70">
                                  <span className="w-8 text-center font-bold">{player.player.number}</span>
                                  <span>{player.player.name}</span>
                                  <span className="text-xs text-gray-500 ml-auto">{player.player.pos}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6">
                  {statistics.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <p>Statistics not available for this match</p>
                    </div>
                  ) : (
                    statistics.map((teamStats) => (
                      <div key={teamStats.team.id} className="bg-white/5 rounded-xl p-4">
                        <h4 className="font-bold text-lg mb-4">{teamStats.team.name}</h4>
                        <div className="space-y-3">
                          {teamStats.statistics.map((stat, idx) => (
                            <div key={idx} className="flex items-center gap-4">
                              <div className="w-32 text-sm text-gray-400">{stat.type}</div>
                              <div className="flex-1 bg-gray-700 rounded-full h-2 relative overflow-hidden">
                                <div
                                  className={`absolute left-0 top-0 h-full ${
                                    teamStats.team.id === homeTeam.id
                                      ? 'bg-[var(--pl-green)]'
                                      : 'bg-blue-500'
                                  }`}
                                  style={{ width: typeof stat.value === 'number' ? `${stat.value}%` : '0%' }}
                                />
                              </div>
                              <div className="w-16 text-right text-sm font-semibold">
                                {typeof stat.value === 'number' ? `${stat.value}%` : stat.value}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


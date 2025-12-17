'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import MatchDetailsModal from './MatchDetailsModal';

interface Fixture {
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
}

export default function FootballSection() {
  const [loading, setLoading] = useState(true);
  const [todaysFixtures, setTodaysFixtures] = useState<Fixture[]>([]);
  const [upcomingFixtures, setUpcomingFixtures] = useState<Fixture[]>([]);
  const [recentResults, setRecentResults] = useState<Fixture[]>([]);
  const [allFixtures, setAllFixtures] = useState<{past: Fixture[], future: Fixture[]} | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'upcoming' | 'results' | 'all'>('today');
  const [error, setError] = useState('');
  const [selectedMatch, setSelectedMatch] = useState<Fixture | null>(null);

  useEffect(() => {
    fetchFootballData();
  }, []);

  const fetchFootballData = async (forceRefresh = false) => {
    setLoading(true);
    setError('');
    try {
      const refreshParam = forceRefresh ? '&force_refresh=true' : '';
      
      // Fetch all data in parallel
      const [todayData, upcomingData, resultsData, allData] = await Promise.allSettled([
        api.get(`/api/football/fixtures/today${refreshParam}`),
        api.get(`/api/football/fixtures/upcoming?days=30${refreshParam}`), // Increased to 30 days
        api.get(`/api/football/results/recent?days=30${refreshParam}`), // Increased to 30 days
        api.get(`/api/football/fixtures/all${refreshParam}`),
      ]);

      // Handle today's fixtures
      if (todayData.status === 'fulfilled') {
        const data = todayData.value.data;
        console.log('[Football] Today fixtures response:', data);
        setTodaysFixtures(data.fixtures || []);
        if (data.error) {
          setError(data.error);
        } else if (data.count === 0 && !data.fixtures) {
          // Likely no API key configured
          setError('No fixtures returned. Check API key configuration in Render.');
        }
      } else {
        const err = todayData.reason;
        console.error('[Football] Today fixtures error:', err);
        console.error('[Football] Error response:', err.response?.data);
        setTodaysFixtures([]);
        const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load today\'s fixtures';
        setError(errorMsg);
      }

      // Handle upcoming fixtures
      if (upcomingData.status === 'fulfilled') {
        setUpcomingFixtures(upcomingData.value.data.fixtures || []);
      } else {
        console.error('Upcoming fixtures error:', upcomingData.reason);
        setUpcomingFixtures([]);
      }

      // Handle results
      if (resultsData.status === 'fulfilled') {
        setRecentResults(resultsData.value.data.results || []);
      } else {
        console.error('Results error:', resultsData.reason);
        setRecentResults([]);
      }

      // Handle all fixtures
      if (allData.status === 'fulfilled') {
        const data = allData.value.data;
        setAllFixtures({
          past: data.past || [],
          future: data.future || [],
        });
      } else {
        console.error('All fixtures error:', allData.reason);
        setAllFixtures(null);
      }

      // If all failed, show error
      if (todayData.status === 'rejected' && upcomingData.status === 'rejected' && resultsData.status === 'rejected') {
        setError('Failed to load football data. Check API key configuration and Render logs.');
      }
    } catch (err: any) {
      console.error('Football data fetch error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to load football data. Make sure API keys are configured.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  };

  const renderFixture = (fixture: Fixture) => {
    const isFinished = fixture.fixture.status.long === 'Match Finished';
    const isLive = fixture.fixture.status.short === 'LIVE' || fixture.fixture.status.elapsed;
    const isScheduled = fixture.fixture.status.short === 'NS';

    return (
      <button
        key={fixture.fixture.id}
        onClick={() => setSelectedMatch(fixture)}
        className={`w-full text-left p-4 rounded-xl bg-[var(--pl-dark)]/50 border ${
          isLive ? 'border-[var(--pl-green)] border-2' : 'border-white/10'
        } hover:bg-[var(--pl-card-hover)] transition-all cursor-pointer`}
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-gray-400">{fixture.league.name}</span>
          <span className={`text-xs px-2 py-1 rounded ${
            isLive 
              ? 'bg-[var(--pl-green)] text-white font-semibold'
              : isFinished
              ? 'bg-gray-600 text-gray-200'
              : 'bg-gray-700 text-gray-300'
          }`}>
            {isLive 
              ? `LIVE ${fixture.fixture.status.elapsed || ''}'`
              : isFinished
              ? 'FT'
              : formatTime(fixture.fixture.date)}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className={`flex items-center gap-2 ${isFinished && fixture.goals.home !== undefined && fixture.goals.away !== undefined ? '' : 'opacity-70'}`}>
              <span className="font-medium">{fixture.teams.home.name}</span>
              {isFinished && fixture.goals.home !== undefined && (
                <span className="font-bold text-lg">{fixture.goals.home}</span>
              )}
            </div>
            <div className={`flex items-center gap-2 mt-1 ${isFinished && fixture.goals.home !== undefined && fixture.goals.away !== undefined ? '' : 'opacity-70'}`}>
              <span className="font-medium">{fixture.teams.away.name}</span>
              {isFinished && fixture.goals.away !== undefined && (
                <span className="font-bold text-lg">{fixture.goals.away}</span>
              )}
            </div>
          </div>
        </div>

        {fixture.fixture.venue?.name && (
          <div className="text-xs text-gray-500 mt-2">📍 {fixture.fixture.venue.name}</div>
        )}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Football</h2>
          <p className="text-sm text-gray-400">Live scores, fixtures & results</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => fetchFootballData(true)}
            disabled={loading}
            className="px-4 py-2 rounded-xl bg-[var(--pl-green)]/20 hover:bg-[var(--pl-green)]/30 text-[var(--pl-green)] text-sm font-medium transition-colors disabled:opacity-50"
            title="Force refresh from API"
          >
            {loading ? 'Loading...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-yellow-500/20 border border-yellow-500/40 rounded-xl p-4">
          <p className="text-sm text-yellow-300 font-semibold mb-2">ℹ️ Premier League Data Available</p>
          <p className="text-xs text-yellow-400/70 mt-2">
            <strong>Currently showing:</strong> Premier League fixtures and results (via FPL API)
            <br />
            <br />
            <strong>To add more competitions:</strong> Add API keys in your backend configuration:
            <br />
            • API_FOOTBALL_KEY (from api-sports.io) - Adds Champions League, FA Cup, League Cup (100 requests/day free)
            <br />
            • Or FOOTBALL_DATA_KEY (from football-data.org) - Alternative source (10 calls/min free)
            <br />
            <br />
            <a 
              href={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/football/test`}
              target="_blank"
              rel="noopener noreferrer"
              className="underline text-yellow-300 hover:text-yellow-200"
            >
              Test API connection →
            </a>
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10 overflow-x-auto">
        <button
          onClick={() => setActiveTab('today')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'today'
              ? 'border-[var(--pl-green)] text-[var(--pl-green)]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Today ({todaysFixtures.length})
        </button>
        <button
          onClick={() => setActiveTab('upcoming')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'upcoming'
              ? 'border-[var(--pl-green)] text-[var(--pl-green)]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Upcoming ({upcomingFixtures.length})
        </button>
        <button
          onClick={() => setActiveTab('results')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'results'
              ? 'border-[var(--pl-green)] text-[var(--pl-green)]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          Results ({recentResults.length})
        </button>
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium transition-colors border-b-2 whitespace-nowrap ${
            activeTab === 'all'
              ? 'border-[var(--pl-green)] text-[var(--pl-green)]'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          All Fixtures ({allFixtures ? allFixtures.past.length + allFixtures.future.length : 0})
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 mb-4">
          <p className="text-red-400 text-sm font-medium mb-1">Error loading fixtures</p>
          <p className="text-red-300 text-xs">{error}</p>
          <p className="text-gray-400 text-xs mt-2">
            Note: Premier League fixtures are available via FPL API. For additional competitions (Champions League, FA Cup, League Cup), 
            add <code className="bg-black/30 px-1 rounded">API_FOOTBALL_KEY</code> to your backend environment variables.
          </p>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {activeTab === 'today' && (
            <>
              {todaysFixtures.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">No fixtures today</p>
                  <p className="text-sm mb-4">Check upcoming fixtures for future matches</p>
                  {upcomingFixtures.length > 0 && (
                    <button
                      onClick={() => setActiveTab('upcoming')}
                      className="px-4 py-2 bg-[var(--pl-green)] text-black rounded-lg hover:bg-[var(--pl-green)]/90 transition-colors font-medium"
                    >
                      View {upcomingFixtures.length} Upcoming Fixtures →
                    </button>
                  )}
                </div>
              ) : (
                todaysFixtures.map(renderFixture)
              )}
            </>
          )}

          {activeTab === 'upcoming' && (
            <>
              {upcomingFixtures.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">No upcoming fixtures</p>
                  <p className="text-sm">Fixtures will appear here when scheduled</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingFixtures.map(renderFixture)}
                </div>
              )}
            </>
          )}

          {activeTab === 'results' && (
            <>
              {recentResults.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">No recent results</p>
                  <p className="text-sm">Recent match results will appear here</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentResults.map(renderFixture)}
                </div>
              )}
            </>
          )}

          {activeTab === 'all' && (
            <>
              {!allFixtures ? (
                <div className="text-center py-12 text-gray-400">
                  <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-sm">Loading all fixtures...</p>
                </div>
              ) : allFixtures.past.length === 0 && allFixtures.future.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-lg mb-2">No fixtures available</p>
                  <p className="text-sm">Fixtures will appear here when available</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Future Fixtures */}
                  {allFixtures.future.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-[var(--pl-green)]">
                        Upcoming Fixtures ({allFixtures.future.length})
                      </h3>
                      <div className="space-y-3">
                        {allFixtures.future.map(renderFixture)}
                      </div>
                    </div>
                  )}
                  
                  {/* Past Results */}
                  {allFixtures.past.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 text-[var(--pl-text-muted)]">
                        Past Results ({allFixtures.past.length})
                      </h3>
                      <div className="space-y-3">
                        {allFixtures.past.slice().reverse().map(renderFixture)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

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


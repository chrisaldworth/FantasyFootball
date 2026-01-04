'use client';

import { useState, useEffect } from 'react';
import { predictionsApi, fplApi } from '@/lib/api';
import MatchPredictionCard from '@/components/score-predictor/MatchPredictionCard';
import PredictionDetailsModal from '@/components/score-predictor/PredictionDetailsModal';
import PredictionAccuracyWidget from '@/components/score-predictor/PredictionAccuracyWidget';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import TopNavigation from '@/components/navigation/TopNavigation';

interface Fixture {
  id: number;
  homeTeam: { id: number; name: string; logo?: string };
  awayTeam: { id: number; name: string; logo?: string };
  date: string;
  venue?: string;
}

interface Prediction {
  predictedHomeScore: number;
  predictedAwayScore: number;
  confidence: number;
  homeWinProbability: number;
  drawProbability: number;
  awayWinProbability: number;
  keyFactors: string[];
  alternativeScores?: Array<{ home: number; away: number; probability: number }>;
}

interface MatchPrediction {
  fixture: Fixture;
  prediction: Prediction;
  actualResult?: {
    homeScore: number;
    awayScore: number;
  };
}

interface Team {
  id: number;
  name: string;
  short_name: string;
}

interface Gameweek {
  id: number;
  name: string;
  deadline_time: string;
  is_current: boolean;
  is_next: boolean;
  finished: boolean;
}

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<MatchPrediction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Filter state
  const [teams, setTeams] = useState<Team[]>([]);
  const [gameweeks, setGameweeks] = useState<Gameweek[]>([]);
  const [currentGameweek, setCurrentGameweek] = useState<number | null>(null);
  const [filters, setFilters] = useState({
    gameweek: undefined as number | undefined,
    team_id: undefined as number | undefined,
  });
  
  // Accuracy state
  const [accuracyMetrics, setAccuracyMetrics] = useState<{
    metrics: {
      overallAccuracy: number;
      exactScoreAccuracy: number;
      outcomeAccuracy: number;
      goalScorerAccuracy: number;
    };
    trend?: any[];
    recentPredictions?: Array<{
      fixture: string;
      predicted: string;
      actual: string;
      accuracy: 'exact' | 'outcome' | 'wrong';
      date: string;
    }>;
  } | null>(null);

  // Fetch teams and gameweeks on mount
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const bootstrap = await fplApi.getBootstrap();
        
        // Set teams
        const teamsList = bootstrap.teams || [];
        setTeams(teamsList.sort((a: Team, b: Team) => a.name.localeCompare(b.name)));
        
        // Set gameweeks (future ones for predictions)
        const events = bootstrap.events || [];
        const relevantGameweeks = events
          .filter((e: any) => !e.finished || e.is_current)
          .map((e: any) => ({
            id: e.id,
            name: e.name,
            deadline_time: e.deadline_time,
            is_current: e.is_current,
            is_next: e.is_next,
            finished: e.finished,
          }));
        setGameweeks(relevantGameweeks);
        
        // Set current gameweek
        const current = events.find((e: any) => e.is_current);
        if (current) {
          setCurrentGameweek(current.id);
        }
      } catch (err) {
        console.error('Error fetching metadata:', err);
      }
    };
    
    fetchMetadata();
    fetchAccuracy();
  }, []);

  // Fetch predictions when filters change
  useEffect(() => {
    fetchPredictions();
  }, [filters]);

  const fetchPredictions = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await predictionsApi.getFixtures(filters);
      setPredictions(data.predictions || []);
    } catch (err: any) {
      console.error('Error fetching predictions:', err);
      setError(err.response?.data?.detail || 'Failed to load predictions');
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccuracy = async () => {
    try {
      const data = await predictionsApi.getAccuracy(30);
      setAccuracyMetrics(data);
    } catch (err) {
      console.error('Error fetching accuracy:', err);
    }
  };

  const [modalData, setModalData] = useState<{
    teamForm?: any;
    headToHead?: any;
    teamStats?: any;
    goalScorers?: any;
  }>({});

  const handleViewDetails = async (prediction: MatchPrediction) => {
    try {
      // Fetch detailed prediction data
      const detailedData = await predictionsApi.getMatchPrediction(prediction.fixture.id);
      const goalScorersData = await predictionsApi.getGoalScorers(prediction.fixture.id);
      
      // Store modal data separately
      setModalData({
        teamForm: detailedData.teamForm,
        headToHead: detailedData.headToHead,
        teamStats: detailedData.teamStats,
        goalScorers: {
          home: goalScorersData.homeScorers || [],
          away: goalScorersData.awayScorers || [],
        },
      });
      
      setSelectedPrediction({
        ...prediction,
        prediction: {
          ...prediction.prediction,
          ...detailedData.prediction,
        },
      } as any);
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching prediction details:', err);
      // Still open modal with basic data
      setModalData({});
      setSelectedPrediction(prediction);
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPrediction(null);
    setModalData({});
  };

  const clearFilters = () => {
    setFilters({
      gameweek: undefined,
      team_id: undefined,
    });
  };

  const hasActiveFilters = filters.gameweek !== undefined || filters.team_id !== undefined;

  return (
    <div className="min-h-screen bg-[var(--pl-background)] pb-16 lg:pb-0">
      {/* Desktop Side Navigation */}
      <SideNavigation />
      
      {/* Top Navigation */}
      <TopNavigation
        pageTitle="Score Predictions"
        showBackButton={true}
        backHref="/dashboard"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
      />

      {/* Mobile Bottom Navigation */}
      <BottomNavigation />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl pt-20 sm:pt-20 lg:pt-28">
        {/* Hero Section */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pl-green)]/20 text-[var(--pl-green)] text-xs font-medium mb-3">
            <span>🤖</span>
            <span>AI-Powered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
            Match Predictions
          </h1>
          <p className="text-sm sm:text-base text-[var(--pl-text-muted)] max-w-2xl">
            Our AI analyzes team form, head-to-head history, and player performance to predict Premier League match outcomes.
          </p>
        </div>

        {/* Accuracy Widget */}
        {accuracyMetrics && (
          <div className="mb-8">
            <PredictionAccuracyWidget
              metrics={accuracyMetrics.metrics}
              trend={accuracyMetrics.trend}
              recentPredictions={accuracyMetrics.recentPredictions}
            />
          </div>
        )}

        {/* Filters */}
        <div className="glass rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
            {/* Gameweek Filter */}
            <div className="w-full sm:w-auto sm:min-w-[180px]">
              <label className="block text-xs text-[var(--pl-text-muted)] mb-1 font-medium">
                Gameweek
              </label>
              <select
                value={filters.gameweek || ''}
                onChange={(e) => setFilters({ ...filters, gameweek: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 text-white focus:border-[var(--pl-green)] focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]/20"
              >
                <option value="">All Upcoming</option>
                {gameweeks.map((gw) => (
                  <option key={gw.id} value={gw.id}>
                    {gw.name} {gw.is_current ? '(Current)' : gw.is_next ? '(Next)' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Team Filter */}
            <div className="w-full sm:w-auto sm:min-w-[200px]">
              <label className="block text-xs text-[var(--pl-text-muted)] mb-1 font-medium">
                Team
              </label>
              <select
                value={filters.team_id || ''}
                onChange={(e) => setFilters({ ...filters, team_id: e.target.value ? parseInt(e.target.value) : undefined })}
                className="w-full px-3 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 text-white focus:border-[var(--pl-green)] focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]/20"
              >
                <option value="">All Teams</option>
                {teams.map((team) => (
                  <option key={team.id} value={team.id}>
                    {team.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm font-medium transition-colors whitespace-nowrap"
              >
                Clear Filters
              </button>
            )}

            {/* Results Count */}
            <div className="sm:ml-auto text-sm text-[var(--pl-text-muted)]">
              {!loading && `${predictions.length} match${predictions.length !== 1 ? 'es' : ''}`}
            </div>
          </div>
        </div>

        {/* Quick Gameweek Buttons */}
        {currentGameweek && (
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setFilters({ ...filters, gameweek: currentGameweek })}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filters.gameweek === currentGameweek
                  ? 'bg-[var(--pl-green)] text-white'
                  : 'bg-[var(--pl-dark)]/50 text-[var(--pl-text-muted)] hover:bg-[var(--pl-dark)]/70'
              }`}
            >
              GW{currentGameweek} (Current)
            </button>
            {currentGameweek < 38 && (
              <button
                onClick={() => setFilters({ ...filters, gameweek: currentGameweek + 1 })}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filters.gameweek === currentGameweek + 1
                    ? 'bg-[var(--pl-green)] text-white'
                    : 'bg-[var(--pl-dark)]/50 text-[var(--pl-text-muted)] hover:bg-[var(--pl-dark)]/70'
                }`}
              >
                GW{currentGameweek + 1} (Next)
              </button>
            )}
            {currentGameweek < 37 && (
              <button
                onClick={() => setFilters({ ...filters, gameweek: currentGameweek + 2 })}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filters.gameweek === currentGameweek + 2
                    ? 'bg-[var(--pl-green)] text-white'
                    : 'bg-[var(--pl-dark)]/50 text-[var(--pl-text-muted)] hover:bg-[var(--pl-dark)]/70'
                }`}
              >
                GW{currentGameweek + 2}
              </button>
            )}
          </div>
        )}

        {/* Predictions Grid */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pl-green)]"></div>
            <p className="mt-4 text-[var(--pl-text-muted)]">Generating predictions...</p>
          </div>
        ) : error ? (
          <div className="glass rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">⚠️</div>
            <p className="text-red-400 font-semibold mb-2">Error loading predictions</p>
            <p className="text-sm text-[var(--pl-text-muted)] mb-4">{error}</p>
            <button
              onClick={fetchPredictions}
              className="px-6 py-2 rounded-lg bg-[var(--pl-green)]/20 hover:bg-[var(--pl-green)]/30 text-[var(--pl-green)] font-semibold text-sm transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : predictions.length === 0 ? (
          <div className="glass rounded-xl p-8 text-center">
            <div className="text-4xl mb-4">🔮</div>
            <p className="text-lg font-semibold mb-2">No predictions found</p>
            <p className="text-sm text-[var(--pl-text-muted)] mb-4">
              {hasActiveFilters 
                ? 'Try adjusting your filters to see more matches'
                : 'No upcoming matches available for predictions'}
            </p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-6 py-2 rounded-lg bg-[var(--pl-green)]/20 hover:bg-[var(--pl-green)]/30 text-[var(--pl-green)] font-semibold text-sm transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {predictions.map((matchPrediction) => (
              <MatchPredictionCard
                key={matchPrediction.fixture.id}
                fixture={matchPrediction.fixture}
                prediction={matchPrediction.prediction}
                actualResult={matchPrediction.actualResult}
                onViewDetails={() => handleViewDetails(matchPrediction)}
              />
            ))}
          </div>
        )}

        {/* How It Works Section */}
        <div className="mt-12 glass rounded-xl p-6">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <span>❓</span>
            <span>How Our Predictions Work</span>
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-[var(--pl-dark)]/30">
              <div className="text-2xl mb-2">📈</div>
              <div className="font-semibold mb-1">Team Form</div>
              <div className="text-xs text-[var(--pl-text-muted)]">
                Analyzes last 10 matches with weighted recency
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--pl-dark)]/30">
              <div className="text-2xl mb-2">⚔️</div>
              <div className="font-semibold mb-1">Head-to-Head</div>
              <div className="text-xs text-[var(--pl-text-muted)]">
                Historical matchups between the two teams
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--pl-dark)]/30">
              <div className="text-2xl mb-2">🏠</div>
              <div className="font-semibold mb-1">Home Advantage</div>
              <div className="text-xs text-[var(--pl-text-muted)]">
                Factors in the typical +0.35 goal advantage
              </div>
            </div>
            <div className="p-4 rounded-lg bg-[var(--pl-dark)]/30">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-semibold mb-1">Attack vs Defense</div>
              <div className="text-xs text-[var(--pl-text-muted)]">
                Compares offensive strength vs defensive solidity
              </div>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {selectedPrediction && (
          <PredictionDetailsModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            fixture={selectedPrediction.fixture}
            prediction={selectedPrediction.prediction}
            teamForm={modalData.teamForm}
            headToHead={modalData.headToHead}
            teamStats={modalData.teamStats}
            goalScorers={modalData.goalScorers}
          />
        )}
      </div>
    </div>
  );
}

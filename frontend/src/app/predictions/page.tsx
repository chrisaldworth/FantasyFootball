'use client';

import { useState, useEffect } from 'react';
import { predictionsApi } from '@/lib/api';
import MatchPredictionCard from '@/components/score-predictor/MatchPredictionCard';
import PredictionDetailsModal from '@/components/score-predictor/PredictionDetailsModal';
import PredictionAccuracyWidget from '@/components/score-predictor/PredictionAccuracyWidget';

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

export default function PredictionsPage() {
  const [predictions, setPredictions] = useState<MatchPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrediction, setSelectedPrediction] = useState<MatchPrediction | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filters, setFilters] = useState({
    gameweek: undefined as number | undefined,
    team_id: undefined as number | undefined,
    date_from: undefined as string | undefined,
    date_to: undefined as string | undefined,
  });
  const [accuracyMetrics, setAccuracyMetrics] = useState<{
    metrics: {
      overallAccuracy: number;
      exactScoreAccuracy: number;
      outcomeAccuracy: number;
      goalScorerAccuracy: number;
    };
    trend?: Array<{
      date: string;
      accuracy: number;
      exactScore: number;
      outcome: number;
    }>;
    recentPredictions?: Array<{
      fixture: string;
      predicted: string;
      actual: string;
      accuracy: 'exact' | 'outcome' | 'wrong';
      date: string;
    }>;
  } | null>(null);

  useEffect(() => {
    fetchPredictions();
    fetchAccuracy();
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

  return (
    <div className="container mx-auto px-4 py-6 sm:py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2 flex items-center gap-2">
          <span>🔮</span>
          <span>Score Predictions</span>
        </h1>
        <p className="text-sm sm:text-base text-[var(--pl-text-muted)]">
          AI-powered match score and goal scorer predictions
        </p>
      </div>

      {/* Accuracy Widget */}
      {accuracyMetrics && (
        <div className="mb-6 sm:mb-8">
          <PredictionAccuracyWidget
            metrics={accuracyMetrics.metrics}
            trend={accuracyMetrics.trend}
            recentPredictions={accuracyMetrics.recentPredictions}
          />
        </div>
      )}

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6 sm:mb-8">
        <h2 className="text-lg font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs text-[var(--pl-text-muted)] mb-1">Gameweek</label>
            <input
              type="number"
              min="1"
              max="38"
              value={filters.gameweek || ''}
              onChange={(e) => setFilters({ ...filters, gameweek: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)]/50 text-white focus:border-[var(--pl-green)] focus:outline-none"
              placeholder="All gameweeks"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--pl-text-muted)] mb-1">Team ID</label>
            <input
              type="number"
              min="1"
              max="20"
              value={filters.team_id || ''}
              onChange={(e) => setFilters({ ...filters, team_id: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)]/50 text-white focus:border-[var(--pl-green)] focus:outline-none"
              placeholder="All teams"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--pl-text-muted)] mb-1">From Date</label>
            <input
              type="date"
              value={filters.date_from || ''}
              onChange={(e) => setFilters({ ...filters, date_from: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)]/50 text-white focus:border-[var(--pl-green)] focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-xs text-[var(--pl-text-muted)] mb-1">To Date</label>
            <input
              type="date"
              value={filters.date_to || ''}
              onChange={(e) => setFilters({ ...filters, date_to: e.target.value || undefined })}
              className="w-full px-3 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)]/50 text-white focus:border-[var(--pl-green)] focus:outline-none"
            />
          </div>
        </div>
        <button
          onClick={() => setFilters({
            gameweek: undefined,
            team_id: undefined,
            date_from: undefined,
            date_to: undefined,
          })}
          className="mt-4 px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-dark)]/70 text-sm text-[var(--pl-text-muted)] transition-colors"
        >
          Clear Filters
        </button>
      </div>

      {/* Predictions Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--pl-green)]"></div>
          <p className="mt-4 text-[var(--pl-text-muted)]">Loading predictions...</p>
        </div>
      ) : error ? (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-red-500 mb-2">Error loading predictions</p>
          <p className="text-sm text-[var(--pl-text-muted)]">{error}</p>
          <button
            onClick={fetchPredictions}
            className="mt-4 px-4 py-2 rounded-lg bg-[var(--pl-green)]/20 hover:bg-[var(--pl-green)]/30 text-[var(--pl-green)] font-semibold text-sm transition-colors"
          >
            Retry
          </button>
        </div>
      ) : predictions.length === 0 ? (
        <div className="glass rounded-xl p-6 text-center">
          <p className="text-[var(--pl-text-muted)] mb-2">No predictions found</p>
          <p className="text-sm text-[var(--pl-text-muted)]">
            Try adjusting your filters or check back later
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
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
  );
}

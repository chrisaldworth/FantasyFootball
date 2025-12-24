'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import StatCard from '@/components/weekly-picks/StatCard';
import ChartComponent from '@/components/weekly-picks/ChartComponent';
import { weeklyPicksApi } from '@/lib/api';

export default function StatisticsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [statistics, setStatistics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/weekly-picks');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const statsData = await weeklyPicksApi.getStatistics();
        setStatistics(statsData);
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--pl-green)]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Prepare chart data
  const pointsOverTime = statistics?.pointsOverTime || [];
  const rankOverTime = statistics?.rankOverTime || [];

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-20 lg:pt-28 pb-8 sm:pb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">My Statistics</h1>

        {/* Key Metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Points"
            value={statistics?.totalPoints || 0}
            trend={statistics?.pointsTrend}
            trendValue={statistics?.pointsTrendValue}
            comparison="average"
          />
          <StatCard
            label="Average Points"
            value={statistics?.averagePoints?.toFixed(1) || '0.0'}
            trend={statistics?.avgPointsTrend}
            trendValue={statistics?.avgPointsTrendValue}
          />
          <StatCard
            label="Best Rank"
            value={statistics?.bestRank ? `#${statistics.bestRank}` : '—'}
            trend={statistics?.rankTrend}
            trendValue={statistics?.rankTrendValue}
          />
          <StatCard
            label="Score Accuracy"
            value={statistics?.scoreAccuracy ? `${statistics.scoreAccuracy}%` : '—'}
            trend={statistics?.accuracyTrend}
            trendValue={statistics?.accuracyTrendValue}
          />
        </div>

        {/* Performance Trends */}
        <div className="grid sm:grid-cols-2 gap-6 mb-8">
          {pointsOverTime.length > 0 && (
            <ChartComponent
              type="line"
              data={pointsOverTime.map((d: any) => ({ x: d.gameweek, y: d.points }))}
              title="Points Over Time"
              xLabel="Gameweek"
              yLabel="Points"
            />
          )}
          {rankOverTime.length > 0 && (
            <ChartComponent
              type="line"
              data={rankOverTime.map((d: any) => ({ x: d.gameweek, y: d.rank }))}
              title="Rank Over Time"
              xLabel="Gameweek"
              yLabel="Rank"
            />
          )}
        </div>

        {/* Score Prediction Analytics */}
        {statistics?.scorePredictionStats && (
          <div className="glass rounded-xl p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">Score Prediction Analytics</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">Accuracy</div>
                <div className="text-2xl font-bold">
                  {statistics.scorePredictionStats.accuracy || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">Exact Scores</div>
                <div className="text-2xl font-bold">
                  {statistics.scorePredictionStats.exactScores || 0}
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">Avg Points</div>
                <div className="text-2xl font-bold">
                  {statistics.scorePredictionStats.avgPoints?.toFixed(1) || '0.0'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Player Pick Analytics */}
        {statistics?.playerPickStats && (
          <div className="glass rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Player Pick Analytics</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">Avg FPL Points</div>
                <div className="text-2xl font-bold">
                  {statistics.playerPickStats.avgFplPoints?.toFixed(1) || '0.0'}
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">Success Rate</div>
                <div className="text-2xl font-bold">
                  {statistics.playerPickStats.successRate || 0}%
                </div>
              </div>
              <div>
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">Total Picks</div>
                <div className="text-2xl font-bold">
                  {statistics.playerPickStats.totalPicks || 0}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}


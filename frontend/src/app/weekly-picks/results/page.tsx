'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import PointsBreakdownCard from '@/components/weekly-picks/PointsBreakdownCard';
import LeaderboardRow from '@/components/weekly-picks/LeaderboardRow';
import { fplApi, weeklyPicksApi } from '@/lib/api';

export default function ResultsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [gameweek, setGameweek] = useState<number | null>(null);
  const [results, setResults] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
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
        const bootstrap = await fplApi.getBootstrap();
        const currentEvent = bootstrap?.events?.find((e: any) => e.is_current);
        if (currentEvent) {
          setGameweek(currentEvent.id);
          
          // Fetch results
          try {
            const resultsData = await weeklyPicksApi.getResults(currentEvent.id);
            setResults(resultsData);
          } catch (error) {
            console.error('Error fetching results:', error);
          }

          // Fetch leaderboard
          try {
            const leaderboardData = await weeklyPicksApi.getLeaderboard(currentEvent.id);
            setLeaderboard(leaderboardData || []);
          } catch (error) {
            console.error('Error fetching leaderboard:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
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

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-20 lg:pt-28 pb-8 sm:pb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">
          Results
          {gameweek && <span className="text-gradient-primary"> - Gameweek {gameweek}</span>}
        </h1>

        {/* Your Results */}
        {results && (
          <div className="mb-12">
            <h2 className="text-xl font-semibold mb-6">Your Results</h2>
            <div className="grid sm:grid-cols-2 gap-6 mb-6">
              {results.scorePredictions?.map((sp: any, index: number) => (
                <PointsBreakdownCard
                  key={index}
                  type="score"
                  homeTeam={sp.homeTeam}
                  awayTeam={sp.awayTeam}
                  prediction={sp.prediction}
                  actual={sp.actual}
                  points={sp.points}
                  breakdown={sp.breakdown}
                />
              ))}
              {results.playerPicks?.map((pp: any, index: number) => (
                <PointsBreakdownCard
                  key={index}
                  type="player"
                  player={pp.player}
                  points={pp.points}
                />
              ))}
            </div>
            <div className="glass rounded-xl p-6 text-center">
              <div className="text-sm text-[var(--pl-text-muted)] mb-2">Total Points</div>
              <div className="text-4xl font-bold text-gradient-primary">
                {results.totalPoints || 0}
              </div>
            </div>
          </div>
        )}

        {/* Leaderboard */}
        <div>
          <h2 className="text-xl font-semibold mb-6">Leaderboard</h2>
          <div className="space-y-3">
            {leaderboard.length > 0 ? (
              leaderboard.map((entry, index) => (
                <LeaderboardRow
                  key={entry.userId || index}
                  rank={entry.rank || index + 1}
                  user={{
                    name: entry.userName || entry.name || 'Unknown',
                    avatar: entry.avatar,
                  }}
                  points={entry.points || 0}
                  movement={entry.movement}
                  isCurrentUser={entry.userId === user.id}
                />
              ))
            ) : (
              <div className="glass rounded-xl p-8 text-center text-[var(--pl-text-muted)]">
                No leaderboard data available yet
              </div>
            )}
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}


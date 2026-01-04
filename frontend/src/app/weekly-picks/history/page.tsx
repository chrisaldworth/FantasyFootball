'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import StatCard from '@/components/weekly-picks/StatCard';
import { weeklyPicksApi } from '@/lib/api';

export default function HistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [history, setHistory] = useState<any[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<number | null>(null);
  const [weekData, setWeekData] = useState<any>(null);
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
        const historyData = await weeklyPicksApi.getHistory();
        setHistory(historyData || []);
        if (historyData && historyData.length > 0) {
          setSelectedWeek(historyData[0].gameweek);
          setWeekData(historyData[0]);
        }
      } catch (error) {
        console.error('Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleWeekSelect = (week: number) => {
    setSelectedWeek(week);
    const weekData = history.find(h => h.gameweek === week);
    setWeekData(weekData);
  };

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

  // Calculate season summary
  const totalPoints = history.reduce((sum, h) => sum + (h.totalPoints || 0), 0);
  const avgPoints = history.length > 0 ? totalPoints / history.length : 0;
  const bestWeek = history.reduce((best, h) => 
    (h.totalPoints || 0) > (best?.totalPoints || 0) ? h : best, 
    history[0] || null
  );

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      {/* Desktop Side Navigation */}
      <SideNavigation />
      
      <TopNavigation
        pageTitle="History"
        showBackButton={true}
        backHref="/weekly-picks"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-20 lg:pt-28 pb-8 sm:pb-12">
        <h1 className="text-2xl sm:text-3xl font-bold mb-8">History</h1>

        {/* Season Summary */}
        <div className="grid sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Points" value={totalPoints} />
          <StatCard label="Average Points" value={avgPoints.toFixed(1)} />
          <StatCard 
            label="Best Week" 
            value={bestWeek ? `GW ${bestWeek.gameweek}` : '—'} 
            trendValue={bestWeek ? `${bestWeek.totalPoints} pts` : undefined}
          />
        </div>

        {/* Week Selector */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Select Gameweek</h2>
          <div className="flex flex-wrap gap-2">
            {history.map((h) => (
              <button
                key={h.gameweek}
                onClick={() => handleWeekSelect(h.gameweek)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  selectedWeek === h.gameweek
                    ? 'bg-[var(--pl-green)] text-white'
                    : 'glass border border-white/10 hover:border-[var(--pl-green)]/50'
                }`}
              >
                GW {h.gameweek}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Week Details */}
        {weekData && (
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Gameweek {weekData.gameweek} Details</h2>
            <div className="glass rounded-xl p-6">
              <div className="grid sm:grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-sm text-[var(--pl-text-muted)] mb-2">Total Points</div>
                  <div className="text-3xl font-bold text-gradient-primary">
                    {weekData.totalPoints || 0}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-[var(--pl-text-muted)] mb-2">Rank</div>
                  <div className="text-3xl font-bold">
                    #{weekData.rank || '—'}
                  </div>
                </div>
              </div>
              {weekData.scorePredictions && weekData.scorePredictions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold mb-4">Score Predictions</h3>
                  <div className="space-y-3">
                    {weekData.scorePredictions.map((sp: any, index: number) => (
                      <div key={index} className="p-4 bg-[var(--pl-dark)]/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold">
                              {sp.homeTeam} vs {sp.awayTeam}
                            </div>
                            <div className="text-sm text-[var(--pl-text-muted)]">
                              Predicted: {sp.prediction?.home || 0}-{sp.prediction?.away || 0} | 
                              Actual: {sp.actual?.home || 0}-{sp.actual?.away || 0}
                            </div>
                          </div>
                          <div className="text-lg font-bold text-[var(--pl-green)]">
                            {sp.points || 0} pts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {weekData.playerPicks && weekData.playerPicks.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Player Picks</h3>
                  <div className="space-y-3">
                    {weekData.playerPicks.map((pp: any, index: number) => (
                      <div key={index} className="p-4 bg-[var(--pl-dark)]/50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            {pp.player?.photo && (
                              <img
                                src={pp.player.photo}
                                alt={pp.player.name}
                                className="w-12 h-12 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <div className="font-semibold">{pp.player?.name || 'Unknown'}</div>
                              <div className="text-sm text-[var(--pl-text-muted)]">
                                FPL Points: {pp.player?.fplPoints || 0}
                              </div>
                            </div>
                          </div>
                          <div className="text-lg font-bold text-[var(--pl-green)]">
                            {pp.points || 0} pts
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}


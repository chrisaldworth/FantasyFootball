'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import Link from 'next/link';
import CountdownTimer from '@/components/weekly-picks/CountdownTimer';
import PickProgressIndicator from '@/components/weekly-picks/PickProgressIndicator';
import StatCard from '@/components/weekly-picks/StatCard';
import { fplApi, weeklyPicksApi } from '@/lib/api';

// Loading spinner
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--pl-green)]"></div>
    </div>
  );
}

// Logged-Out State
function LoggedOutWeeklyPicks() {
  return (
    <div className="min-h-screen">
      <TopNavigation
        showFavoriteTeam={false}
        showNotifications={false}
        showLinkFPL={false}
      />

      {/* Hero Section */}
      <section className="pt-28 sm:pt-32 lg:pt-24 pb-12 sm:pb-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Weekly Picks
            <span className="text-gradient-primary block">Test Your Predictions</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--pl-text-muted)] max-w-2xl mx-auto">
            Pick 3 scores. Pick 3 players. Compete with thousands of managers every gameweek.
          </p>
          <Link href="/register" className="btn-primary text-lg px-8 py-4 inline-block">
            Sign up to play
          </Link>
        </div>
      </section>

      {/* Sample Picks (Blurred) */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="glass rounded-xl p-6 relative overflow-hidden">
            <div className="blur-sm opacity-50">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--pl-dark)]/50 rounded-lg">
                  <div>Arsenal vs Liverpool</div>
                  <div className="font-bold">2 - 1</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--pl-dark)]/50 rounded-lg">
                  <div>Man City vs Chelsea</div>
                  <div className="font-bold">3 - 0</div>
                </div>
                <div className="flex items-center justify-between p-4 bg-[var(--pl-dark)]/50 rounded-lg">
                  <div>Spurs vs Brighton</div>
                  <div className="font-bold">1 - 2</div>
                </div>
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--pl-dark)]/80 to-[var(--pl-dark)]/60">
              <div className="text-center">
                <div className="text-3xl mb-2">🔒</div>
                <div className="text-lg font-semibold mb-1">Sign up to unlock</div>
                <Link href="/register" className="btn-primary mt-4 inline-block">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: 1, title: 'Pick 3 Scores', description: 'Predict the score for 3 different fixtures' },
              { step: 2, title: 'Pick 3 Players', description: 'Select 3 players from different teams' },
              { step: 3, title: 'Earn Points', description: 'Score points based on accuracy and FPL performance' },
            ].map((item) => (
              <div key={item.step} className="glass rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center text-2xl font-bold mb-4 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--pl-text-muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-block">
            Start Making Picks
          </Link>
        </div>
      </section>
      <BottomNavigation />
    </div>
  );
}

// Logged-In State
function LoggedInWeeklyPicks({ user }: { user: any }) {
  const router = useRouter();
  const [gameweek, setGameweek] = useState<number | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [picksStatus, setPicksStatus] = useState<{
    scorePredictions: number;
    playerPicks: number;
    total: number;
  }>({ scorePredictions: 0, playerPicks: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [hasPicks, setHasPicks] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bootstrap = await fplApi.getBootstrap();
        const currentEvent = bootstrap?.events?.find((e: any) => e.is_current);
        if (currentEvent) {
          setGameweek(currentEvent.id);
          // Set deadline to gameweek deadline (usually Friday 18:30 UK time)
          const deadlineDate = new Date(currentEvent.deadline_time || Date.now() + 24 * 60 * 60 * 1000);
          setDeadline(deadlineDate);
          setIsLocked(new Date() >= deadlineDate);

          // Check if user has picks
          try {
            const picks = await weeklyPicksApi.getPicks(currentEvent.id);
            if (picks && picks.scorePredictions && picks.playerPicks) {
              setHasPicks(true);
              setPicksStatus({
                scorePredictions: picks.scorePredictions.length || 0,
                playerPicks: picks.playerPicks.length || 0,
                total: (picks.scorePredictions.length || 0) + (picks.playerPicks.length || 0),
              });
            }
          } catch (error) {
            // No picks yet
            setHasPicks(false);
          }
        }
      } catch (error) {
        console.error('Error fetching weekly picks data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Weekly Picks
                {gameweek && <span className="text-gradient-primary"> - Gameweek {gameweek}</span>}
              </h1>
              {deadline && !isLocked && (
                <CountdownTimer deadline={deadline} />
              )}
              {isLocked && (
                <div className="text-lg font-bold text-[var(--pl-pink)] mt-2">Picks Locked</div>
              )}
            </div>
          </div>

          {/* Progress Indicator */}
          <PickProgressIndicator
            scorePredictions={picksStatus.scorePredictions}
            playerPicks={picksStatus.playerPicks}
            total={picksStatus.total}
          />
        </div>

        {/* Action Section */}
        <div className="mb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {!hasPicks && !isLocked && (
              <Link
                href="/weekly-picks/make-picks"
                className="btn-primary text-center py-4 text-lg"
              >
                Make Your Picks
              </Link>
            )}
            {hasPicks && !isLocked && (
              <Link
                href="/weekly-picks/make-picks"
                className="btn-secondary text-center py-4 text-lg"
              >
                Edit Your Picks
              </Link>
            )}
            {isLocked && (
              <Link
                href="/weekly-picks/results"
                className="btn-primary text-center py-4 text-lg"
              >
                View Results
              </Link>
            )}
            <Link
              href="/weekly-picks/results"
              className="btn-secondary text-center py-4 text-lg"
            >
              View Leaderboard
            </Link>
            <Link
              href="/weekly-picks/leagues"
              className="btn-secondary text-center py-4 text-lg"
            >
              My Leagues
            </Link>
            <Link
              href="/weekly-picks/statistics"
              className="btn-secondary text-center py-4 text-lg"
            >
              Statistics
            </Link>
          </div>
        </div>

        {/* Quick Stats (if picks made) */}
        {hasPicks && (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Current Points" value="0" />
            <StatCard label="Current Rank" value="—" />
            <StatCard label="League Position" value="—" />
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}

// Main Component
export default function WeeklyPicksPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // Allow viewing logged-out state
    }
  }, [user, loading, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <LoggedInWeeklyPicks user={user} />;
  }

  return <LoggedOutWeeklyPicks />;
}


'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
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
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--pl-green)]/20 text-[var(--pl-green)] text-sm font-medium mb-4">
            <span>🏆</span>
            <span>Free to Play • Win Prizes</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold">
            Weekly Picks
            <span className="text-gradient-primary block mt-2">Test Your Predictions</span>
          </h1>
          <p className="text-lg sm:text-xl text-[var(--pl-text-muted)] max-w-2xl mx-auto">
            Pick 3 scores. Pick 3 players. Compete with thousands of managers every gameweek and climb the leaderboard!
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
              { step: 1, title: 'Pick 3 Scores', description: 'Predict the exact score for 3 different fixtures', icon: '⚽' },
              { step: 2, title: 'Pick 3 Players', description: 'Select 3 players from different teams to score points', icon: '👤' },
              { step: 3, title: 'Earn Points', description: 'Score points based on accuracy and FPL performance', icon: '🏆' },
            ].map((item) => (
              <div key={item.step} className="glass rounded-xl p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center text-3xl mb-4 mx-auto">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--pl-text-muted)]">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scoring System */}
      <section className="py-12 px-4 sm:px-6 bg-[var(--pl-dark)]/50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">Scoring System</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>⚽</span> Score Predictions
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-[var(--pl-text-muted)]">Exact score</span>
                  <span className="font-bold text-[var(--pl-green)]">+4 pts</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-[var(--pl-text-muted)]">Correct result (W/D/L)</span>
                  <span className="font-bold text-[var(--pl-cyan)]">+2 pts</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-[var(--pl-text-muted)]">Correct home goals</span>
                  <span className="font-bold text-yellow-400">+1 pt</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-[var(--pl-text-muted)]">Correct away goals</span>
                  <span className="font-bold text-yellow-400">+1 pt</span>
                </li>
              </ul>
            </div>
            <div className="glass rounded-xl p-6">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <span>👤</span> Player Picks
              </h3>
              <ul className="space-y-3">
                <li className="flex justify-between items-center">
                  <span className="text-[var(--pl-text-muted)]">Points = FPL points</span>
                  <span className="font-bold text-[var(--pl-green)]">1:1 ratio</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-[var(--pl-text-muted)]">Pick from different teams</span>
                  <span className="font-bold text-[var(--pl-cyan)]">Max 1 per team</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-[var(--pl-text-muted)]">Top performers score big</span>
                  <span className="font-bold text-yellow-400">No cap</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl sm:text-2xl font-bold mb-4">Ready to test your prediction skills?</h2>
          <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-block">
            Start Making Picks
          </Link>
        </div>
      </section>
      <BottomNavigation />
    </div>
  );
}

interface GameweekInfo {
  id: number;
  name: string;
  deadline: Date;
  isCurrent: boolean;
  isFinished: boolean;
  isOpen: boolean; // NEW: deadline hasn't passed
  deadlineFormatted: string; // NEW: human-readable deadline
}

// Logged-In State
function LoggedInWeeklyPicks({ user }: { user: any }) {
  const router = useRouter();
  const [gameweek, setGameweek] = useState<number | null>(null);
  const [availableGameweeks, setAvailableGameweeks] = useState<GameweekInfo[]>([]);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [picksStatus, setPicksStatus] = useState<{
    scorePredictions: number;
    playerPicks: number;
    total: number;
  }>({ scorePredictions: 0, playerPicks: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const [hasPicks, setHasPicks] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const bootstrap = await fplApi.getBootstrap();
        const events = bootstrap?.events || [];
        const now = new Date();
        
        // Get fixtures to determine actual deadlines (first kickoff time)
        let fixtureDeadlines: Record<number, Date> = {};
        try {
          // Get current and next gameweek fixtures
          const currentEvent = events.find((e: any) => e.is_current);
          if (currentEvent) {
            const currentFixtures = await fplApi.getFixtures(currentEvent.id);
            if (currentFixtures?.length > 0) {
              const firstKickoff = currentFixtures
                .filter((f: any) => f.kickoff_time)
                .sort((a: any, b: any) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())[0];
              if (firstKickoff) {
                fixtureDeadlines[currentEvent.id] = new Date(firstKickoff.kickoff_time);
              }
            }
            
            // Also get next gameweek fixtures
            const nextEvent = events.find((e: any) => e.id === currentEvent.id + 1);
            if (nextEvent) {
              const nextFixtures = await fplApi.getFixtures(nextEvent.id);
              if (nextFixtures?.length > 0) {
                const firstKickoff = nextFixtures
                  .filter((f: any) => f.kickoff_time)
                  .sort((a: any, b: any) => new Date(a.kickoff_time).getTime() - new Date(b.kickoff_time).getTime())[0];
                if (firstKickoff) {
                  fixtureDeadlines[nextEvent.id] = new Date(firstKickoff.kickoff_time);
                }
              }
            }
          }
        } catch (e) {
          console.warn('Could not fetch fixture deadlines:', e);
        }
        
        // Filter gameweeks: only current and next, and only if deadline hasn't passed
        const available: GameweekInfo[] = events
          .filter((e: any) => {
            // Only consider current and next gameweek
            const currentEvent = events.find((ev: any) => ev.is_current);
            if (!currentEvent) return false;
            return e.id === currentEvent.id || e.id === currentEvent.id + 1;
          })
          .map((e: any) => {
            // Use fixture deadline if available, otherwise use event deadline
            const deadlineDate = fixtureDeadlines[e.id] || new Date(e.deadline_time);
            const isOpen = now < deadlineDate;
            
            return {
              id: e.id,
              name: `Gameweek ${e.id}`,
              deadline: deadlineDate,
              isCurrent: e.is_current,
              isFinished: e.finished,
              isOpen,
              deadlineFormatted: formatDeadline(deadlineDate),
            };
          })
          .filter((gw: GameweekInfo) => gw.isOpen) // Only show gameweeks with open deadlines
          .sort((a: GameweekInfo, b: GameweekInfo) => a.id - b.id);
        
        setAvailableGameweeks(available);
        
        // Select the first open gameweek, or show locked state
        if (available.length > 0) {
          const selectedGw = available[0];
          setGameweek(selectedGw.id);
          setDeadline(selectedGw.deadline);
          setIsLocked(false);

          // Check if user has picks
          try {
            const picks = await weeklyPicksApi.getPicks(selectedGw.id);
            if (picks && (picks.scorePredictions?.length > 0 || picks.playerPicks?.length > 0)) {
              setHasPicks(true);
              setPicksStatus({
                scorePredictions: picks.scorePredictions?.length || 0,
                playerPicks: picks.playerPicks?.length || 0,
                total: (picks.scorePredictions?.length || 0) + (picks.playerPicks?.length || 0),
              });
            } else {
              setHasPicks(false);
              setPicksStatus({ scorePredictions: 0, playerPicks: 0, total: 0 });
            }
          } catch (error) {
            setHasPicks(false);
            setPicksStatus({ scorePredictions: 0, playerPicks: 0, total: 0 });
          }
        } else {
          // No open gameweeks - all locked
          const currentEvent = events.find((e: any) => e.is_current);
          if (currentEvent) {
            setGameweek(currentEvent.id);
            setDeadline(new Date(currentEvent.deadline_time));
          }
          setIsLocked(true);
          setHasPicks(false);
          setPicksStatus({ scorePredictions: 0, playerPicks: 0, total: 0 });
        }
      } catch (error) {
        console.error('Error fetching weekly picks data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleGameweekChange = async (newGameweek: number) => {
    const selectedGw = availableGameweeks.find(gw => gw.id === newGameweek);
    if (!selectedGw) return;
    
    setGameweek(newGameweek);
    setDeadline(selectedGw.deadline);
    setIsLocked(!selectedGw.isOpen);
    setLoading(true);
    
    try {
      // Check if user has picks for this gameweek
      const picks = await weeklyPicksApi.getPicks(newGameweek);
      if (picks && (picks.scorePredictions?.length > 0 || picks.playerPicks?.length > 0)) {
        setHasPicks(true);
        setPicksStatus({
          scorePredictions: picks.scorePredictions?.length || 0,
          playerPicks: picks.playerPicks?.length || 0,
          total: (picks.scorePredictions?.length || 0) + (picks.playerPicks?.length || 0),
        });
      } else {
        setHasPicks(false);
        setPicksStatus({ scorePredictions: 0, playerPicks: 0, total: 0 });
      }
    } catch (error) {
      setHasPicks(false);
      setPicksStatus({ scorePredictions: 0, playerPicks: 0, total: 0 });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      {/* Desktop Side Navigation */}
      <SideNavigation />
      
      <TopNavigation
        pageTitle="Weekly Picks"
        showBackButton={true}
        backHref="/dashboard"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-20 lg:pt-28 pb-8 sm:pb-12">
        
        {/* Hero Banner for New Users / Promotion */}
        {!hasPicks && !isLocked && (
          <div className="mb-8 glass rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[var(--pl-green)]/10 to-[var(--pl-cyan)]/10 border border-[var(--pl-green)]/20">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--pl-green)]/20 text-[var(--pl-green)] text-xs font-medium mb-3">
                  <span>🎯</span>
                  <span>Free to Play</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold mb-2">
                  Make Your Picks for Gameweek {gameweek}!
                </h2>
                <p className="text-[var(--pl-text-muted)] mb-4">
                  Predict 3 scores and pick 3 players to climb the leaderboard. It only takes 2 minutes!
                </p>
                {deadline && (
                  <div className="inline-flex items-center gap-2 text-sm">
                    <span className="text-[var(--pl-text-muted)]">⏰ Deadline:</span>
                    <span className="font-semibold text-yellow-400">
                      {formatDeadline(deadline)}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-shrink-0">
                <Link
                  href={`/weekly-picks/make-picks?gameweek=${gameweek}`}
                  className="btn-primary text-lg px-8 py-4 inline-flex items-center gap-2"
                >
                  <span>Make Your Picks</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Locked State Banner */}
        {isLocked && (
          <div className="mb-8 glass rounded-2xl p-6 sm:p-8 bg-gradient-to-br from-[var(--pl-pink)]/10 to-[var(--pl-dark)]/50 border border-[var(--pl-pink)]/20">
            <div className="text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h2 className="text-2xl font-bold mb-2 text-[var(--pl-pink)]">
                Gameweek {gameweek} Picks Locked
              </h2>
              <p className="text-[var(--pl-text-muted)] mb-4">
                The deadline has passed. Check back for the next gameweek!
              </p>
              <Link
                href="/weekly-picks/results"
                className="btn-secondary inline-flex items-center gap-2"
              >
                <span>View Results & Leaderboard</span>
              </Link>
            </div>
          </div>
        )}

        {/* Header Section with Gameweek Selector */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">
                Weekly Picks
                {gameweek && <span className="text-gradient-primary"> - GW{gameweek}</span>}
              </h1>
              {deadline && !isLocked && (
                <CountdownTimer deadline={deadline} />
              )}
            </div>
            
            {/* Gameweek Selector */}
            {availableGameweeks.length > 0 && (
              <div className="flex-shrink-0 w-full sm:w-auto">
                <label className="block text-sm font-medium text-[var(--pl-text-muted)] mb-2">
                  Select Gameweek
                </label>
                <select
                  value={gameweek || ''}
                  onChange={(e) => handleGameweekChange(Number(e.target.value))}
                  className="w-full sm:w-auto px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 text-white focus:border-[var(--pl-green)] focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] text-sm sm:text-base"
                >
                  {availableGameweeks.map((gw) => (
                    <option key={gw.id} value={gw.id}>
                      {gw.name} • {gw.deadlineFormatted}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Progress Indicator (only show if user has started picks) */}
          {(hasPicks || picksStatus.total > 0) && (
            <PickProgressIndicator
              scorePredictions={picksStatus.scorePredictions}
              playerPicks={picksStatus.playerPicks}
              total={picksStatus.total}
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="mb-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Primary Action - Make/Edit Picks */}
            {!isLocked && gameweek && (
              <Link
                href={`/weekly-picks/make-picks?gameweek=${gameweek}`}
                className={`${hasPicks ? 'btn-secondary' : 'btn-primary'} text-center py-4 text-lg flex flex-col items-center justify-center`}
              >
                <span className="text-2xl mb-1">{hasPicks ? '✏️' : '🎯'}</span>
                <span>{hasPicks ? 'Edit Your Picks' : 'Make Your Picks'}</span>
              </Link>
            )}
            
            {/* Results/Leaderboard */}
            <Link
              href="/weekly-picks/results"
              className="btn-secondary text-center py-4 text-lg flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">🏆</span>
              <span>Leaderboard</span>
            </Link>
            
            {/* Leagues */}
            <Link
              href="/weekly-picks/leagues"
              className="btn-secondary text-center py-4 text-lg flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">👥</span>
              <span>My Leagues</span>
            </Link>
            
            {/* Statistics */}
            <Link
              href="/weekly-picks/statistics"
              className="btn-secondary text-center py-4 text-lg flex flex-col items-center justify-center"
            >
              <span className="text-2xl mb-1">📊</span>
              <span>Statistics</span>
            </Link>
          </div>
        </div>

        {/* Quick Stats (if picks made) */}
        {hasPicks && (
          <div className="grid sm:grid-cols-3 gap-4 mb-8">
            <StatCard label="Picks Made" value={`${picksStatus.total}/6`} />
            <StatCard label="Score Predictions" value={`${picksStatus.scorePredictions}/3`} />
            <StatCard label="Player Picks" value={`${picksStatus.playerPicks}/3`} />
          </div>
        )}

        {/* How to Play Section (collapsible) */}
        <div className="mb-8">
          <button
            onClick={() => setShowHowToPlay(!showHowToPlay)}
            className="w-full glass rounded-xl p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">❓</span>
              <span className="font-semibold">How to Play & Scoring</span>
            </div>
            <span className={`text-2xl transition-transform ${showHowToPlay ? 'rotate-180' : ''}`}>
              ⌄
            </span>
          </button>
          
          {showHowToPlay && (
            <div className="mt-4 glass rounded-xl p-6 space-y-6">
              {/* How to Play */}
              <div>
                <h3 className="text-lg font-bold mb-4">How It Works</h3>
                <div className="grid sm:grid-cols-3 gap-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--pl-green)]/20 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
                    <div>
                      <div className="font-semibold">Pick 3 Scores</div>
                      <div className="text-sm text-[var(--pl-text-muted)]">Predict exact scores for 3 fixtures</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--pl-cyan)]/20 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
                    <div>
                      <div className="font-semibold">Pick 3 Players</div>
                      <div className="text-sm text-[var(--pl-text-muted)]">Select 3 players from different teams</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-yellow-400/20 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
                    <div>
                      <div className="font-semibold">Earn Points</div>
                      <div className="text-sm text-[var(--pl-text-muted)]">Compete for the top of the leaderboard</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Scoring */}
              <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-white/10">
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>⚽</span> Score Predictions
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-[var(--pl-text-muted)]">Exact score</span>
                      <span className="font-bold text-[var(--pl-green)]">+4 pts</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[var(--pl-text-muted)]">Correct result</span>
                      <span className="font-bold text-[var(--pl-cyan)]">+2 pts</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[var(--pl-text-muted)]">Correct home/away goals</span>
                      <span className="font-bold text-yellow-400">+1 pt each</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <span>👤</span> Player Picks
                  </h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span className="text-[var(--pl-text-muted)]">Points = FPL gameweek points</span>
                      <span className="font-bold text-[var(--pl-green)]">1:1</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-[var(--pl-text-muted)]">Max 1 player per team</span>
                      <span className="font-bold text-[var(--pl-cyan)]">Rule</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Create/Join League CTA */}
        <div className="glass rounded-xl p-6 bg-gradient-to-r from-[var(--pl-cyan)]/10 to-[var(--pl-green)]/10">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-bold mb-1">Compete with Friends!</h3>
              <p className="text-sm text-[var(--pl-text-muted)]">
                Create or join a private league to compete with friends and colleagues.
              </p>
            </div>
            <Link
              href="/weekly-picks/leagues"
              className="btn-secondary whitespace-nowrap"
            >
              Manage Leagues
            </Link>
          </div>
        </div>
      </div>
      <BottomNavigation />
    </div>
  );
}

// Helper function to format deadline
function formatDeadline(date: Date): string {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) {
    return 'Locked';
  }
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 1) {
    return date.toLocaleDateString('en-GB', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    });
  } else if (hours > 1) {
    return `${hours}h left`;
  } else {
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m left`;
  }
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

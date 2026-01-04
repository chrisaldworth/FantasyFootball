'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import SideNavigation from '@/components/navigation/SideNavigation';
import ScorePredictionInput from '@/components/weekly-picks/ScorePredictionInput';
import PlayerSelectionCard from '@/components/weekly-picks/PlayerSelectionCard';
import PickProgressIndicator from '@/components/weekly-picks/PickProgressIndicator';
import CountdownTimer from '@/components/weekly-picks/CountdownTimer';
import { fplApi, weeklyPicksApi } from '@/lib/api';
import TeamLogoEnhanced from '@/components/TeamLogoEnhanced';
import Link from 'next/link';

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  date: string;
  kickoffTime: Date | null;
}

interface Player {
  id: number;
  name: string;
  photo?: string;
  team: string;
  teamId: number;
  position: string;
  form?: number;
  totalPoints?: number;
}

type Step = 1 | 2 | 3;

function MakePicksContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>(1);
  const [gameweek, setGameweek] = useState<number | null>(null);
  const [deadline, setDeadline] = useState<Date | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedFixtures, setSelectedFixtures] = useState<Map<number, { home: number; away: number }>>(new Map());
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerPositionFilter, setPlayerPositionFilter] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);

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
        setError(null);
        const bootstrap = await fplApi.getBootstrap();
        const events = bootstrap?.events || [];
        
        // Get gameweek from URL parameter or default to current/next open
        const gameweekParam = searchParams.get('gameweek');
        let selectedEvent: any = null;
        
        if (gameweekParam) {
          selectedEvent = events.find((e: any) => e.id === Number(gameweekParam));
        }
        
        // If no param or invalid, find the next open gameweek
        if (!selectedEvent) {
          const currentEvent = events.find((e: any) => e.is_current);
          if (currentEvent) {
            selectedEvent = currentEvent;
          }
        }
        
        if (!selectedEvent) {
          setError('No valid gameweek found');
          setLoading(false);
          return;
        }
        
        setGameweek(selectedEvent.id);
        
        // Fetch fixtures for selected gameweek
        const fixturesData = await fplApi.getFixtures(selectedEvent.id);
        const teams = bootstrap.teams || [];
        
        // Find the earliest kickoff time (this is the real deadline)
        let earliestKickoff: Date | null = null;
        const formattedFixtures: Fixture[] = (fixturesData || []).map((f: any) => {
          const homeTeam = teams.find((t: any) => t.id === f.team_h);
          const awayTeam = teams.find((t: any) => t.id === f.team_a);
          const kickoffTime = f.kickoff_time ? new Date(f.kickoff_time) : null;
          
          if (kickoffTime && (!earliestKickoff || kickoffTime < earliestKickoff)) {
            earliestKickoff = kickoffTime;
          }
          
          return {
            id: f.id,
            homeTeam: homeTeam?.short_name || 'TBD',
            awayTeam: awayTeam?.short_name || 'TBD',
            homeTeamId: f.team_h,
            awayTeamId: f.team_a,
            date: f.kickoff_time || '',
            kickoffTime,
          };
        });
        
        // Use earliest kickoff as deadline, fallback to event deadline
        const deadlineDate = earliestKickoff || new Date(selectedEvent.deadline_time);
        setDeadline(deadlineDate);
        
        // Check if deadline has passed
        const now = new Date();
        if (now >= deadlineDate) {
          setIsLocked(true);
          setError(`The deadline for Gameweek ${selectedEvent.id} has passed. You can no longer submit picks.`);
          setLoading(false);
          return;
        }
        
        setIsLocked(false);
        setFixtures(formattedFixtures);

        // Fetch players
        const elements = bootstrap.elements || [];
        const formattedPlayers: Player[] = elements.map((p: any) => {
          const team = teams.find((t: any) => t.id === p.team);
          return {
            id: p.id,
            name: p.web_name,
            photo: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${p.code}.png`,
            team: team?.short_name || 'TBD',
            teamId: p.team,
            position: ['GK', 'DEF', 'MID', 'FWD'][p.element_type - 1] || 'TBD',
            form: parseFloat(p.form) || undefined,
            totalPoints: p.total_points || 0,
          };
        });

        // Sort players by total points (descending), then by form
        const sortedPlayers = formattedPlayers.sort((a, b) => {
          const pointsDiff = (b.totalPoints || 0) - (a.totalPoints || 0);
          if (pointsDiff !== 0) return pointsDiff;
          return (b.form || 0) - (a.form || 0);
        });

        setPlayers(sortedPlayers);

        // Load existing picks if any
        try {
          const existingPicks = await weeklyPicksApi.getPicks(selectedEvent.id);
          if (existingPicks) {
            if (existingPicks.scorePredictions) {
              const fixtureMap = new Map();
              existingPicks.scorePredictions.forEach((sp: any) => {
                fixtureMap.set(sp.fixtureId, { home: sp.homeScore, away: sp.awayScore });
              });
              setSelectedFixtures(fixtureMap);
            }
            if (existingPicks.playerPicks) {
              setSelectedPlayers(new Set(existingPicks.playerPicks.map((pp: any) => pp.playerId)));
            }
          }
        } catch (error) {
          // No existing picks
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load gameweek data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, searchParams]);

  // Handle deadline expiring while on page
  const handleDeadlineExpire = () => {
    setIsLocked(true);
    setError('The deadline has passed! You can no longer submit picks for this gameweek.');
  };

  const handleFixtureSelect = (fixtureId: number) => {
    if (isLocked) return;
    
    if (selectedFixtures.has(fixtureId)) {
      const newMap = new Map(selectedFixtures);
      newMap.delete(fixtureId);
      setSelectedFixtures(newMap);
    } else if (selectedFixtures.size < 3) {
      const newMap = new Map(selectedFixtures);
      newMap.set(fixtureId, { home: 0, away: 0 });
      setSelectedFixtures(newMap);
    }
  };

  const handleScoreChange = (fixtureId: number, home: number, away: number) => {
    if (isLocked) return;
    
    const newMap = new Map(selectedFixtures);
    newMap.set(fixtureId, { home, away });
    setSelectedFixtures(newMap);
  };

  const handlePlayerSelect = (playerId: number) => {
    if (isLocked) return;
    
    const player = players.find(p => p.id === playerId);
    if (!player) return;

    // Check if player's team is already selected
    const selectedPlayerTeams = Array.from(selectedPlayers).map(id => {
      const p = players.find(pl => pl.id === id);
      return p?.teamId;
    });

    if (selectedPlayers.has(playerId)) {
      const newSet = new Set(selectedPlayers);
      newSet.delete(playerId);
      setSelectedPlayers(newSet);
    } else if (selectedPlayers.size < 3 && !selectedPlayerTeams.includes(player.teamId)) {
      const newSet = new Set(selectedPlayers);
      newSet.add(playerId);
      setSelectedPlayers(newSet);
    }
  };

  const handleSubmit = async () => {
    if (!gameweek || isLocked) return;

    if (selectedFixtures.size !== 3 || selectedPlayers.size !== 3) {
      alert('Please select 3 fixtures and 3 players');
      return;
    }

    // Double-check deadline before submitting
    if (deadline && new Date() >= deadline) {
      setIsLocked(true);
      setError('The deadline has passed! You can no longer submit picks for this gameweek.');
      return;
    }

    try {
      setSubmitting(true);
      
      const scorePredictions = Array.from(selectedFixtures.entries()).map(([fixtureId, scores]) => ({
        fixtureId,
        homeScore: scores.home,
        awayScore: scores.away,
      }));
      
      const playerPicks = Array.from(selectedPlayers).map(playerId => {
        const player = players.find(p => p.id === playerId);
        if (!player) {
          throw new Error(`Player with ID ${playerId} not found`);
        }
        // Find a fixture for this player's team
        const fixture = fixtures.find(f => f.homeTeamId === player.teamId || f.awayTeamId === player.teamId);
        if (!fixture) {
          throw new Error(`No fixture found for player ${player.name}'s team`);
        }
        return {
          playerId,
          fixtureId: fixture.id,
        };
      });

      await weeklyPicksApi.submitPicks(gameweek, {
        scorePredictions,
        playerPicks,
      });

      // Success - redirect to weekly picks page
      router.push('/weekly-picks');
    } catch (error: any) {
      console.error('Error submitting picks:', error);
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to submit picks. Please try again.';
      
      // Check if it's a deadline error
      if (errorMessage.toLowerCase().includes('deadline') || errorMessage.toLowerCase().includes('locked')) {
        setIsLocked(true);
      }
      
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep1 = selectedFixtures.size === 3 && 
    Array.from(selectedFixtures.values()).every(s => s.home >= 0 && s.away >= 0);
  const canProceedStep2 = selectedPlayers.size === 3;
  const canSubmit = canProceedStep1 && canProceedStep2 && !isLocked;

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

  // Show locked state
  if (isLocked) {
    return (
      <div className="min-h-screen">
        <SideNavigation />
        <TopNavigation
          pageTitle="Make Picks"
          showBackButton={true}
          backHref="/weekly-picks"
          showFavoriteTeam={true}
          showNotifications={true}
          showLinkFPL={true}
        />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-20 lg:pt-28 pb-8">
          <div className="glass rounded-2xl p-8 text-center bg-gradient-to-br from-[var(--pl-pink)]/10 to-[var(--pl-dark)]/50">
            <div className="text-5xl mb-4">🔒</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-[var(--pl-pink)]">
              Picks Locked
            </h1>
            <p className="text-[var(--pl-text-muted)] mb-6">
              {error || `The deadline for Gameweek ${gameweek} has passed. You can no longer make or edit picks.`}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/weekly-picks" className="btn-primary">
                Back to Weekly Picks
              </Link>
              <Link href="/weekly-picks/results" className="btn-secondary">
                View Results
              </Link>
            </div>
          </div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

  const progress = (step / 3) * 100;
  const scorePredictionsCount = selectedFixtures.size;
  const playerPicksCount = selectedPlayers.size;

  return (
    <div className="min-h-screen">
      {/* Desktop Side Navigation */}
      <SideNavigation />
      
      <TopNavigation
        pageTitle="Make Picks"
        showBackButton={true}
        backHref="/weekly-picks"
        showFavoriteTeam={true}
        showNotifications={true}
        showLinkFPL={true}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-20 sm:pt-20 lg:pt-28 pb-8">
        {/* Gameweek & Deadline Display */}
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="glass rounded-lg px-4 py-2">
            <span className="text-sm text-[var(--pl-text-muted)]">Picking for </span>
            <span className="text-base font-bold text-[var(--pl-green)]">Gameweek {gameweek}</span>
          </div>
          {deadline && (
            <div className="flex-shrink-0">
              <CountdownTimer deadline={deadline} onExpire={handleDeadlineExpire} />
            </div>
          )}
        </div>
        
        {/* Progress Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.push('/weekly-picks')}
              className="text-[var(--pl-green)] hover:underline flex items-center gap-1"
            >
              ← {step > 1 ? 'Back' : 'Cancel'}
            </button>
            <div className="text-sm text-[var(--pl-text-muted)]">
              Step {step} of 3
            </div>
          </div>
          <div className="w-full h-2 bg-[var(--pl-card)] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[var(--pl-green)] to-[var(--pl-cyan)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-6">
          <PickProgressIndicator
            scorePredictions={scorePredictionsCount}
            playerPicks={playerPicksCount}
            total={scorePredictionsCount + playerPicksCount}
          />
        </div>

        {/* Step 1: Score Predictions */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Select 3 Fixtures</h2>
              <span className="text-sm text-[var(--pl-text-muted)]">{selectedFixtures.size}/3 selected</span>
            </div>
            <p className="text-sm text-[var(--pl-text-muted)]">
              Tap a fixture to select it, then predict the score. Exact scores earn 4 points!
            </p>
            <div className="space-y-4">
              {fixtures.map((fixture) => {
                const isSelected = selectedFixtures.has(fixture.id);
                const scores = selectedFixtures.get(fixture.id) || { home: 0, away: 0 };
                return (
                  <div key={fixture.id} className="space-y-3">
                    <button
                      onClick={() => handleFixtureSelect(fixture.id)}
                      className={`w-full glass rounded-xl p-4 text-left transition-all ${
                        isSelected
                          ? 'border-2 border-[var(--pl-green)] bg-[var(--pl-green)]/10'
                          : selectedFixtures.size >= 3
                          ? 'border border-white/5 opacity-50 cursor-not-allowed'
                          : 'border border-white/10 hover:border-[var(--pl-green)]/50'
                      }`}
                      disabled={!isSelected && selectedFixtures.size >= 3}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 sm:gap-4">
                          <TeamLogoEnhanced teamId={fixture.homeTeamId} size={32} style="shield" />
                          <span className="font-semibold text-sm sm:text-base">{fixture.homeTeam}</span>
                          <span className="text-[var(--pl-text-muted)] text-sm">vs</span>
                          <span className="font-semibold text-sm sm:text-base">{fixture.awayTeam}</span>
                          <TeamLogoEnhanced teamId={fixture.awayTeamId} size={32} style="shield" />
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[var(--pl-green)] flex items-center justify-center flex-shrink-0">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
                      {fixture.date && (
                        <div className="text-xs text-[var(--pl-text-muted)] mt-2">
                          {new Date(fixture.date).toLocaleDateString('en-GB', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      )}
                    </button>
                    {isSelected && (
                      <ScorePredictionInput
                        homeTeam={fixture.homeTeam}
                        awayTeam={fixture.awayTeam}
                        homeScore={scores.home}
                        awayScore={scores.away}
                        onChange={(home, away) => handleScoreChange(fixture.id, home, away)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="btn-primary w-full py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Player Picks →
            </button>
          </div>
        )}

        {/* Step 2: Player Picks */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Select 3 Players</h2>
              <span className="text-sm text-[var(--pl-text-muted)]">{selectedPlayers.size}/3 selected</span>
            </div>
            <p className="text-sm text-[var(--pl-text-muted)]">
              Pick 3 players from different teams. You'll earn their FPL points for this gameweek!
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="Search players..."
                value={playerSearch}
                onChange={(e) => setPlayerSearch(e.target.value)}
                className="flex-1 px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 text-white placeholder-[var(--pl-text-muted)] focus:border-[var(--pl-green)] focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              />
              <select
                value={playerPositionFilter}
                onChange={(e) => setPlayerPositionFilter(e.target.value)}
                className="px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 text-white focus:border-[var(--pl-green)] focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              >
                <option value="all">All Positions</option>
                <option value="GK">Goalkeepers</option>
                <option value="DEF">Defenders</option>
                <option value="MID">Midfielders</option>
                <option value="FWD">Forwards</option>
              </select>
            </div>

            {/* Selected Players Summary */}
            {selectedPlayers.size > 0 && (
              <div className="glass rounded-lg p-3 bg-[var(--pl-green)]/10">
                <div className="text-sm text-[var(--pl-text-muted)] mb-2">Selected:</div>
                <div className="flex flex-wrap gap-2">
                  {Array.from(selectedPlayers).map(playerId => {
                    const player = players.find(p => p.id === playerId);
                    if (!player) return null;
                    return (
                      <button
                        key={playerId}
                        onClick={() => handlePlayerSelect(playerId)}
                        className="px-3 py-1 rounded-full bg-[var(--pl-green)]/20 text-[var(--pl-green)] text-sm flex items-center gap-2 hover:bg-[var(--pl-green)]/30"
                      >
                        <span>{player.name}</span>
                        <span>×</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Filtered Players */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {players
                .filter((player) => {
                  const matchesSearch = player.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                    player.team.toLowerCase().includes(playerSearch.toLowerCase());
                  const matchesPosition = playerPositionFilter === 'all' || player.position === playerPositionFilter;
                  return matchesSearch && matchesPosition;
                })
                .slice(0, 50) // Limit to first 50 for performance
                .map((player) => {
                const isSelected = selectedPlayers.has(player.id);
                const selectedPlayerTeams = Array.from(selectedPlayers).map(id => {
                  const p = players.find(pl => pl.id === id);
                  return p?.teamId;
                });
                const isDisabled = !isSelected && selectedPlayerTeams.includes(player.teamId) && selectedPlayers.size < 3;
                const isMaxReached = !isSelected && selectedPlayers.size >= 3;
                return (
                  <PlayerSelectionCard
                    key={player.id}
                    player={player}
                    selected={isSelected}
                    disabled={isDisabled || isMaxReached}
                    onSelect={() => handlePlayerSelect(player.id)}
                    onDeselect={() => handlePlayerSelect(player.id)}
                  />
                );
              })}
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep(1)}
                className="btn-secondary flex-1 py-4 text-lg"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!canProceedStep2}
                className="btn-primary flex-1 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Review Picks →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Review Your Picks</h2>
            <p className="text-sm text-[var(--pl-text-muted)]">
              Double-check your picks before submitting. You can edit them until the deadline.
            </p>
            
            <div className="space-y-6">
              {/* Score Predictions */}
              <div className="glass rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>⚽</span> Score Predictions
                </h3>
                <div className="space-y-3">
                  {Array.from(selectedFixtures.entries()).map(([fixtureId, scores]) => {
                    const fixture = fixtures.find(f => f.id === fixtureId);
                    if (!fixture) return null;
                    return (
                      <div key={fixtureId} className="flex items-center justify-between p-3 bg-[var(--pl-dark)]/50 rounded-lg">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <TeamLogoEnhanced teamId={fixture.homeTeamId} size={24} style="shield" />
                          <span className="text-sm sm:text-base">{fixture.homeTeam}</span>
                        </div>
                        <div className="text-xl sm:text-2xl font-bold px-4">
                          {scores.home} - {scores.away}
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <span className="text-sm sm:text-base">{fixture.awayTeam}</span>
                          <TeamLogoEnhanced teamId={fixture.awayTeamId} size={24} style="shield" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Player Picks */}
              <div className="glass rounded-xl p-4 sm:p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <span>👤</span> Player Picks
                </h3>
                <div className="space-y-3">
                  {Array.from(selectedPlayers).map((playerId) => {
                    const player = players.find(p => p.id === playerId);
                    if (!player) return null;
                    return (
                      <div key={playerId} className="flex items-center gap-4 p-3 bg-[var(--pl-dark)]/50 rounded-lg">
                        {player.photo && (
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover bg-[var(--pl-card)]"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-[var(--pl-text-muted)]">
                            {player.team} • {player.position}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-[var(--pl-text-muted)]">Season Pts</div>
                          <div className="font-bold text-[var(--pl-green)]">{player.totalPoints}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Deadline Warning */}
            {deadline && (
              <div className="glass rounded-lg p-4 bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">⏰</span>
                  <div>
                    <div className="font-semibold text-yellow-400">Remember!</div>
                    <div className="text-sm text-[var(--pl-text-muted)]">
                      You can edit your picks until the deadline. After that, they're locked in.
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary flex-1 py-4 text-lg"
              >
                ← Edit Picks
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="btn-primary flex-1 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></span>
                    <span>Submitting...</span>
                  </span>
                ) : (
                  '✓ Submit Picks'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}

export default function MakePicksPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--pl-green)]"></div>
      </div>
    }>
      <MakePicksContent />
    </Suspense>
  );
}

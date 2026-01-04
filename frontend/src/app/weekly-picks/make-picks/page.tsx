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
import { fplApi, weeklyPicksApi, footballApi } from '@/lib/api';
import TeamLogoEnhanced from '@/components/TeamLogoEnhanced';

interface Fixture {
  id: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamId: number;
  awayTeamId: number;
  date: string;
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
  const [fixtures, setFixtures] = useState<Fixture[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [selectedFixtures, setSelectedFixtures] = useState<Map<number, { home: number; away: number }>>(new Map());
  const [selectedPlayers, setSelectedPlayers] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [playerSearch, setPlayerSearch] = useState('');
  const [playerPositionFilter, setPlayerPositionFilter] = useState<string>('all');

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
        const events = bootstrap?.events || [];
        
        // Get gameweek from URL parameter or default to current
        const gameweekParam = searchParams.get('gameweek');
        let selectedEvent;
        
        if (gameweekParam) {
          selectedEvent = events.find((e: any) => e.id === Number(gameweekParam));
        }
        
        if (!selectedEvent) {
          selectedEvent = events.find((e: any) => e.is_current);
        }
        
        if (selectedEvent) {
          setGameweek(selectedEvent.id);
          const deadlineDate = new Date(selectedEvent.deadline_time || Date.now() + 24 * 60 * 60 * 1000);
          setDeadline(deadlineDate);

          // Fetch fixtures for selected gameweek
          const fixturesData = await fplApi.getFixtures(selectedEvent.id);
          const teams = bootstrap.teams || [];
          
          const formattedFixtures: Fixture[] = (fixturesData || []).map((f: any) => {
            const homeTeam = teams.find((t: any) => t.id === f.team_h);
            const awayTeam = teams.find((t: any) => t.id === f.team_a);
            return {
              id: f.id,
              homeTeam: homeTeam?.short_name || 'TBD',
              awayTeam: awayTeam?.short_name || 'TBD',
              homeTeamId: f.team_h,
              awayTeamId: f.team_a,
              date: f.kickoff_time || '',
            };
          });

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
  }, [user, searchParams]);

  const handleFixtureSelect = (fixtureId: number) => {
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
    const newMap = new Map(selectedFixtures);
    newMap.set(fixtureId, { home, away });
    setSelectedFixtures(newMap);
  };

  const handlePlayerSelect = (playerId: number) => {
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
    if (!gameweek) return;

    if (selectedFixtures.size !== 3 || selectedPlayers.size !== 3) {
      alert('Please select 3 fixtures and 3 players');
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
      
      // Show error in a more user-friendly way
      // If error mentions current gameweek, extract it for better UX
      const currentGameweekMatch = errorMessage.match(/Current gameweek: (\d+)/);
      if (currentGameweekMatch) {
        const currentGw = currentGameweekMatch[1];
        alert(`${errorMessage}\n\nPlease select gameweek ${currentGw} or ${parseInt(currentGw) + 1} to make your picks.`);
      } else {
        alert(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const canProceedStep1 = selectedFixtures.size === 3 && 
    Array.from(selectedFixtures.values()).every(s => s.home >= 0 && s.away >= 0);
  const canProceedStep2 = selectedPlayers.size === 3;
  const canSubmit = canProceedStep1 && canProceedStep2;

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
        {/* Gameweek Display */}
        {gameweek && (
          <div className="mb-4">
            <div className="glass rounded-lg px-4 py-2 inline-block">
              <span className="text-sm text-[var(--pl-text-muted)]">Picking for </span>
              <span className="text-base font-bold text-[var(--pl-green)]">Gameweek {gameweek}</span>
            </div>
          </div>
        )}
        
        {/* Progress Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => step > 1 ? setStep((s) => (s - 1) as Step) : router.push('/weekly-picks')}
              className="text-[var(--pl-green)] hover:underline"
            >
              ← Back
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

        {/* Countdown Timer */}
        {deadline && (
          <div className="mb-8">
            <CountdownTimer deadline={deadline} />
          </div>
        )}

        {/* Progress Indicator */}
        <div className="mb-8">
          <PickProgressIndicator
            scorePredictions={scorePredictionsCount}
            playerPicks={playerPicksCount}
            total={scorePredictionsCount + playerPicksCount}
          />
        </div>

        {/* Step 1: Score Predictions */}
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Select 3 Fixtures</h2>
            <div className="space-y-4">
              {fixtures.map((fixture) => {
                const isSelected = selectedFixtures.has(fixture.id);
                const scores = selectedFixtures.get(fixture.id) || { home: 0, away: 0 };
                return (
                  <div key={fixture.id} className="space-y-4">
                    <button
                      onClick={() => handleFixtureSelect(fixture.id)}
                      className={`w-full glass rounded-xl p-4 text-left transition-all ${
                        isSelected
                          ? 'border-2 border-[var(--pl-green)] bg-[var(--pl-green)]/10'
                          : 'border border-white/10 hover:border-[var(--pl-green)]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <TeamLogoEnhanced teamId={fixture.homeTeamId} size={32} style="shield" />
                          <span className="font-semibold">{fixture.homeTeam}</span>
                          <span className="text-[var(--pl-text-muted)]">vs</span>
                          <span className="font-semibold">{fixture.awayTeam}</span>
                          <TeamLogoEnhanced teamId={fixture.awayTeamId} size={32} style="shield" />
                        </div>
                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-[var(--pl-green)] flex items-center justify-center">
                            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        )}
                      </div>
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
              Continue to Step 2 →
            </button>
          </div>
        )}

        {/* Step 2: Player Picks */}
        {step === 2 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Select 3 Players</h2>
            
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
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

            {/* Filtered Players */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {players
                .filter((player) => {
                  const matchesSearch = player.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
                    player.team.toLowerCase().includes(playerSearch.toLowerCase());
                  const matchesPosition = playerPositionFilter === 'all' || player.position === playerPositionFilter;
                  return matchesSearch && matchesPosition;
                })
                .map((player) => {
                const isSelected = selectedPlayers.has(player.id);
                const selectedPlayerTeams = Array.from(selectedPlayers).map(id => {
                  const p = players.find(pl => pl.id === id);
                  return p?.teamId;
                });
                const isDisabled = !isSelected && selectedPlayerTeams.includes(player.teamId) && selectedPlayers.size < 3;
                return (
                  <PlayerSelectionCard
                    key={player.id}
                    player={player}
                    selected={isSelected}
                    disabled={isDisabled}
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
                Continue to Step 3 →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Submit */}
        {step === 3 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-4">Review Your Picks</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Score Predictions</h3>
                {Array.from(selectedFixtures.entries()).map(([fixtureId, scores]) => {
                  const fixture = fixtures.find(f => f.id === fixtureId);
                  if (!fixture) return null;
                  return (
                    <div key={fixtureId} className="glass rounded-xl p-4 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <TeamLogoEnhanced teamId={fixture.homeTeamId} size={32} style="shield" />
                          <span className="font-semibold">{fixture.homeTeam}</span>
                          <span className="text-2xl font-bold">{scores.home} - {scores.away}</span>
                          <span className="font-semibold">{fixture.awayTeam}</span>
                          <TeamLogoEnhanced teamId={fixture.awayTeamId} size={32} style="shield" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Player Picks</h3>
                {Array.from(selectedPlayers).map((playerId) => {
                  const player = players.find(p => p.id === playerId);
                  if (!player) return null;
                  return (
                    <div key={playerId} className="glass rounded-xl p-4 mb-3">
                      <div className="flex items-center gap-4">
                        {player.photo && (
                          <img
                            src={player.photo}
                            alt={player.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <div className="font-semibold">{player.name}</div>
                          <div className="text-sm text-[var(--pl-text-muted)]">
                            {player.team} • {player.position}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setStep(2)}
                className="btn-secondary flex-1 py-4 text-lg"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
                className="btn-primary flex-1 py-4 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting...' : 'Submit Picks'}
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


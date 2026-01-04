'use client';

import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import TeamLogo from '@/components/TeamLogo';
import GoalScorerPredictions from './GoalScorerPredictions';

interface PredictionDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fixture: {
    id: number;
    homeTeam: { id: number; name: string };
    awayTeam: { id: number; name: string };
    date: string;
    venue?: string;
  };
  prediction: {
    predictedHomeScore: number;
    predictedAwayScore: number;
    confidence: number;
    homeWinProbability: number;
    drawProbability: number;
    awayWinProbability: number;
    keyFactors: string[];
    alternativeScores?: Array<{ home: number; away: number; probability: number }>;
  };
  teamForm?: {
    home: Array<{ match: string; goalsFor: number; goalsAgainst: number; result: 'W' | 'D' | 'L' }>;
    away: Array<{ match: string; goalsFor: number; goalsAgainst: number; result: 'W' | 'D' | 'L' }>;
  };
  headToHead?: Array<{
    date: string;
    homeTeam: string;
    awayTeam: string;
    homeScore: number;
    awayScore: number;
    result: string;
  }>;
  teamStats?: {
    home: { goalsFor: number; goalsAgainst: number; wins: number; draws: number; losses: number };
    away: { goalsFor: number; goalsAgainst: number; wins: number; draws: number; losses: number };
  };
  goalScorers?: {
    home: Array<{ playerId: number; playerName: string; position: string; probability: number; form?: 'hot' | 'cold' | 'neutral'; recentGoals?: number; photo?: string }>;
    away: Array<{ playerId: number; playerName: string; position: string; probability: number; form?: 'hot' | 'cold' | 'neutral'; recentGoals?: number; photo?: string }>;
  };
}

type TabType = 'summary' | 'form' | 'h2h' | 'stats' | 'scorers';

export default function PredictionDetailsModal({
  isOpen,
  onClose,
  fixture,
  prediction,
  teamForm,
  headToHead,
  teamStats,
  goalScorers,
}: PredictionDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<TabType>('summary');

  if (!isOpen) return null;

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: 'summary', label: 'Summary', icon: '📊' },
    { id: 'form', label: 'Form', icon: '📈' },
    { id: 'h2h', label: 'H2H', icon: '⚔️' },
    { id: 'stats', label: 'Stats', icon: '📋' },
    { id: 'scorers', label: 'Scorers', icon: '⚽' },
  ];

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 70) return { label: 'High', color: 'text-[var(--pl-green)]' };
    if (confidence >= 40) return { label: 'Medium', color: 'text-yellow-500' };
    return { label: 'Low', color: 'text-gray-400' };
  };

  const confidence = getConfidenceLevel(prediction.confidence);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      <div className="relative w-full sm:max-w-4xl max-h-[95vh] overflow-hidden glass rounded-t-2xl sm:rounded-2xl animate-slide-up sm:m-4 flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 p-4 sm:p-6 border-b border-white/10 bg-[var(--pl-card)]">
          <button
            onClick={onClose}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <span className="text-white text-xl leading-none">×</span>
          </button>

          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--pl-green)] to-[var(--pl-cyan)] flex items-center justify-center text-2xl">
              🔮
            </div>
            <div className="flex-1">
              <h2 className="text-xl sm:text-2xl font-bold">
                {fixture.homeTeam.name} vs {fixture.awayTeam.name}
              </h2>
              <p className="text-sm text-[var(--pl-text-muted)]">
                {new Date(fixture.date).toLocaleDateString('en-GB', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors
                  ${activeTab === tab.id
                    ? 'bg-[var(--pl-green)] text-white'
                    : 'bg-[var(--pl-dark)]/50 text-[var(--pl-text-muted)] hover:bg-[var(--pl-dark)]/70'
                  }
                `}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Summary Tab */}
          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Predicted Score */}
              <div className="text-center">
                <div className="text-5xl sm:text-6xl font-bold mb-2">
                  {prediction.predictedHomeScore}-{prediction.predictedAwayScore}
                </div>
                <div className="text-sm text-[var(--pl-text-muted)] mb-4">Predicted Score</div>
                <div className={`text-lg font-semibold ${confidence.color}`}>
                  {confidence.label} Confidence ({prediction.confidence}%)
                </div>
              </div>

              {/* Outcome Probabilities */}
              <div className="glass rounded-xl p-4">
                <h3 className="text-lg font-bold mb-4">Outcome Probabilities</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Home Win</span>
                      <span className="text-sm font-semibold">{prediction.homeWinProbability}%</span>
                    </div>
                    <div className="h-3 bg-[var(--pl-dark)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-[var(--pl-green)] transition-all duration-500"
                        style={{ width: `${prediction.homeWinProbability}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Draw</span>
                      <span className="text-sm font-semibold">{prediction.drawProbability}%</span>
                    </div>
                    <div className="h-3 bg-[var(--pl-dark)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-500 transition-all duration-500"
                        style={{ width: `${prediction.drawProbability}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm">Away Win</span>
                      <span className="text-sm font-semibold">{prediction.awayWinProbability}%</span>
                    </div>
                    <div className="h-3 bg-[var(--pl-dark)] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-red-500 transition-all duration-500"
                        style={{ width: `${prediction.awayWinProbability}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Factors */}
              {prediction.keyFactors.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="text-lg font-bold mb-4">Key Factors</h3>
                  <ul className="space-y-2">
                    {prediction.keyFactors.map((factor, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm">
                        <span className="text-[var(--pl-green)] mt-1">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Alternative Scores */}
              {prediction.alternativeScores && prediction.alternativeScores.length > 0 && (
                <div className="glass rounded-xl p-4">
                  <h3 className="text-lg font-bold mb-4">Alternative Scorelines</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {prediction.alternativeScores.slice(0, 6).map((alt, idx) => (
                      <div key={idx} className="text-center p-2 rounded-lg bg-[var(--pl-dark)]/50">
                        <div className="text-lg font-semibold">{alt.home}-{alt.away}</div>
                        <div className="text-xs text-[var(--pl-text-muted)]">{alt.probability}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Form Tab */}
          {activeTab === 'form' && (
            <div className="space-y-6">
              {teamForm && teamForm.home && teamForm.away ? (
                <>
                  <div className="glass rounded-xl p-4">
                    <h3 className="text-lg font-bold mb-4">{fixture.homeTeam.name} - Last 5 Matches</h3>
                    {teamForm.home.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={teamForm.home}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="match" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                          <Line type="monotone" dataKey="goalsFor" stroke="#10b981" strokeWidth={2} name="Goals For" />
                          <Line type="monotone" dataKey="goalsAgainst" stroke="#ef4444" strokeWidth={2} name="Goals Against" />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-[var(--pl-text-muted)]">No form data available</div>
                    )}
                  </div>

                  <div className="glass rounded-xl p-4">
                    <h3 className="text-lg font-bold mb-4">{fixture.awayTeam.name} - Last 5 Matches</h3>
                    {teamForm.away.length > 0 ? (
                      <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={teamForm.away}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                          <XAxis dataKey="match" stroke="#888" fontSize={12} />
                          <YAxis stroke="#888" fontSize={12} />
                          <Tooltip contentStyle={{ backgroundColor: '#1a1a2e', border: '1px solid rgba(255,255,255,0.1)' }} />
                          <Line type="monotone" dataKey="goalsFor" stroke="#10b981" strokeWidth={2} name="Goals For" />
                          <Line type="monotone" dataKey="goalsAgainst" stroke="#ef4444" strokeWidth={2} name="Goals Against" />
                          <Legend />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-8 text-[var(--pl-text-muted)]">No form data available</div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-[var(--pl-text-muted)]">
                  <p>Form data not available</p>
                  <p className="text-sm mt-2">Historical match data may not be loaded yet</p>
                </div>
              )}
            </div>
          )}

          {/* Head-to-Head Tab */}
          {activeTab === 'h2h' && (
            <div className="glass rounded-xl p-4">
              <h3 className="text-lg font-bold mb-4">Head-to-Head History</h3>
              {headToHead && headToHead.length > 0 ? (
                <div className="space-y-3">
                  {headToHead.map((match, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-[var(--pl-dark)]/50">
                      <div className="text-xs text-[var(--pl-text-muted)] mb-1">
                        {new Date(match.date).toLocaleDateString('en-GB')}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">{match.homeTeam}</span>
                        <span className="font-bold">{match.homeScore}-{match.awayScore}</span>
                        <span className="text-sm">{match.awayTeam}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-[var(--pl-text-muted)]">
                  <p>No head-to-head history available</p>
                  <p className="text-sm mt-2">Historical match data may not be available for these teams</p>
                </div>
              )}
            </div>
          )}

          {/* Stats Tab */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {teamStats && teamStats.home && teamStats.away ? (
                <>
                  {/* Team Comparison Cards */}
                  <div className="grid grid-cols-2 gap-4">
                    {/* Home Team Card */}
                    <div className="glass rounded-xl p-4">
                      <div className="text-center mb-4">
                        <TeamLogo teamId={fixture.homeTeam.id} size={48} />
                        <div className="font-bold mt-2">{fixture.homeTeam.name}</div>
                        <div className="text-xs text-[var(--pl-text-muted)]">Home</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[var(--pl-text-muted)]">Avg Goals For</span>
                          <span className="font-bold text-[var(--pl-green)]">{teamStats.home.goalsFor}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[var(--pl-text-muted)]">Avg Goals Against</span>
                          <span className="font-bold text-red-400">{teamStats.home.goalsAgainst}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex justify-center gap-2 text-sm">
                            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">{teamStats.home.wins}W</span>
                            <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">{teamStats.home.draws}D</span>
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400">{teamStats.home.losses}L</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Away Team Card */}
                    <div className="glass rounded-xl p-4">
                      <div className="text-center mb-4">
                        <TeamLogo teamId={fixture.awayTeam.id} size={48} />
                        <div className="font-bold mt-2">{fixture.awayTeam.name}</div>
                        <div className="text-xs text-[var(--pl-text-muted)]">Away</div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[var(--pl-text-muted)]">Avg Goals For</span>
                          <span className="font-bold text-[var(--pl-green)]">{teamStats.away.goalsFor}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-[var(--pl-text-muted)]">Avg Goals Against</span>
                          <span className="font-bold text-red-400">{teamStats.away.goalsAgainst}</span>
                        </div>
                        <div className="pt-2 border-t border-white/10">
                          <div className="flex justify-center gap-2 text-sm">
                            <span className="px-2 py-1 rounded bg-green-500/20 text-green-400">{teamStats.away.wins}W</span>
                            <span className="px-2 py-1 rounded bg-yellow-500/20 text-yellow-400">{teamStats.away.draws}D</span>
                            <span className="px-2 py-1 rounded bg-red-500/20 text-red-400">{teamStats.away.losses}L</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Comparison Bars */}
                  <div className="glass rounded-xl p-4">
                    <h3 className="text-sm font-bold mb-4 text-[var(--pl-text-muted)]">Head-to-Head Comparison</h3>
                    
                    {/* Goals For Comparison */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--pl-green)]">{teamStats.home.goalsFor}</span>
                        <span className="text-[var(--pl-text-muted)]">Avg Goals For</span>
                        <span className="text-[var(--pl-green)]">{teamStats.away.goalsFor}</span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--pl-dark)]">
                        <div 
                          className="bg-[var(--pl-green)] transition-all" 
                          style={{ width: `${teamStats.home.goalsFor + teamStats.away.goalsFor > 0 ? (teamStats.home.goalsFor / (teamStats.home.goalsFor + teamStats.away.goalsFor)) * 100 : 50}%` }}
                        />
                        <div 
                          className="bg-[var(--pl-cyan)] transition-all" 
                          style={{ width: `${teamStats.home.goalsFor + teamStats.away.goalsFor > 0 ? (teamStats.away.goalsFor / (teamStats.home.goalsFor + teamStats.away.goalsFor)) * 100 : 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Goals Against Comparison */}
                    <div className="mb-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-red-400">{teamStats.home.goalsAgainst}</span>
                        <span className="text-[var(--pl-text-muted)]">Avg Goals Against</span>
                        <span className="text-red-400">{teamStats.away.goalsAgainst}</span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--pl-dark)]">
                        <div 
                          className="bg-red-500 transition-all" 
                          style={{ width: `${teamStats.home.goalsAgainst + teamStats.away.goalsAgainst > 0 ? (teamStats.home.goalsAgainst / (teamStats.home.goalsAgainst + teamStats.away.goalsAgainst)) * 100 : 50}%` }}
                        />
                        <div 
                          className="bg-orange-500 transition-all" 
                          style={{ width: `${teamStats.home.goalsAgainst + teamStats.away.goalsAgainst > 0 ? (teamStats.away.goalsAgainst / (teamStats.home.goalsAgainst + teamStats.away.goalsAgainst)) * 100 : 50}%` }}
                        />
                      </div>
                    </div>

                    {/* Wins Comparison */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-green-400">{teamStats.home.wins}</span>
                        <span className="text-[var(--pl-text-muted)]">Wins (Last 10)</span>
                        <span className="text-green-400">{teamStats.away.wins}</span>
                      </div>
                      <div className="flex h-3 rounded-full overflow-hidden bg-[var(--pl-dark)]">
                        <div 
                          className="bg-green-500 transition-all" 
                          style={{ width: `${teamStats.home.wins + teamStats.away.wins > 0 ? (teamStats.home.wins / (teamStats.home.wins + teamStats.away.wins)) * 100 : 50}%` }}
                        />
                        <div 
                          className="bg-blue-500 transition-all" 
                          style={{ width: `${teamStats.home.wins + teamStats.away.wins > 0 ? (teamStats.away.wins / (teamStats.home.wins + teamStats.away.wins)) * 100 : 50}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="glass rounded-xl p-8 text-center text-[var(--pl-text-muted)]">
                  <p>Statistics not available</p>
                  <p className="text-sm mt-2">Team statistics may not be loaded yet</p>
                </div>
              )}
            </div>
          )}

          {/* Scorers Tab */}
          {activeTab === 'scorers' && (
            <div>
              {goalScorers && goalScorers.home && goalScorers.away ? (
                <GoalScorerPredictions
                  homeTeam={fixture.homeTeam}
                  awayTeam={fixture.awayTeam}
                  homeScorers={goalScorers.home}
                  awayScorers={goalScorers.away}
                />
              ) : (
                <div className="glass rounded-xl p-8 text-center text-[var(--pl-text-muted)]">
                  <p>Goal scorer predictions not available</p>
                  <p className="text-sm mt-2">Player data may not be loaded yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

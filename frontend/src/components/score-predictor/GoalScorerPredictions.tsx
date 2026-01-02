'use client';

import TeamLogo from '@/components/TeamLogo';

interface GoalScorer {
  playerId: number;
  playerName: string;
  position: string;
  probability: number;
  form?: 'hot' | 'cold' | 'neutral';
  recentGoals?: number;
  photo?: string;
}

interface GoalScorerPredictionsProps {
  homeTeam: { id: number; name: string };
  awayTeam: { id: number; name: string };
  homeScorers: GoalScorer[];
  awayScorers: GoalScorer[];
  actualScorers?: {
    home: number[];
    away: number[];
  };
}

export default function GoalScorerPredictions({
  homeTeam,
  awayTeam,
  homeScorers,
  awayScorers,
  actualScorers,
}: GoalScorerPredictionsProps) {
  const getFormBadge = (form?: 'hot' | 'cold' | 'neutral') => {
    if (form === 'hot') return { icon: '🔥', label: 'Hot', color: 'text-red-500' };
    if (form === 'cold') return { icon: '❄️', label: 'Cold', color: 'text-blue-400' };
    return { icon: '→', label: 'Neutral', color: 'text-gray-400' };
  };

  const getPositionBadge = (position: string) => {
    const colors: { [key: string]: string } = {
      'GK': 'bg-gray-600',
      'DEF': 'bg-blue-600',
      'MID': 'bg-green-600',
      'FWD': 'bg-red-600',
    };
    return colors[position] || 'bg-gray-600';
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 50) return 'bg-[var(--pl-green)]';
    if (probability >= 30) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  const isActualScorer = (playerId: number, team: 'home' | 'away') => {
    if (!actualScorers) return false;
    return team === 'home' 
      ? actualScorers.home.includes(playerId)
      : actualScorers.away.includes(playerId);
  };

  const ScorerList = ({ 
    team, 
    scorers, 
    teamInfo 
  }: { 
    team: 'home' | 'away';
    scorers: GoalScorer[];
    teamInfo: { id: number; name: string };
  }) => (
    <div className="flex-1">
      <div className="flex items-center gap-2 mb-3">
        <TeamLogo teamId={teamInfo.id} size={24} />
        <h3 className="text-sm font-semibold">{teamInfo.name}</h3>
      </div>
      <div className="space-y-2">
        {scorers.length > 0 ? (
          scorers.map((scorer, idx) => {
            const formBadge = getFormBadge(scorer.form);
            const isCorrect = isActualScorer(scorer.playerId, team);
            
            return (
              <div
                key={scorer.playerId}
                className={`
                  p-2 rounded-lg border transition-all
                  ${isCorrect 
                    ? 'border-green-500 bg-green-500/10' 
                    : 'border-[var(--pl-dark)]/50 bg-[var(--pl-dark)]/30'
                  }
                `}
              >
                <div className="flex items-center gap-2 mb-2">
                  {/* Ranking */}
                  <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${idx === 0 ? 'bg-[var(--pl-green)] text-white' :
                      idx === 1 ? 'bg-yellow-500 text-black' :
                      idx === 2 ? 'bg-orange-500 text-white' :
                      'bg-gray-600 text-white'
                    }
                  `}>
                    {idx + 1}
                  </div>
                  
                  {/* Player Photo/Initial */}
                  <div className="w-8 h-8 rounded-full bg-[var(--pl-dark)] flex items-center justify-center overflow-hidden">
                    {scorer.photo ? (
                      <img 
                        src={scorer.photo} 
                        alt={scorer.playerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-semibold text-[var(--pl-text-muted)]">
                        {scorer.playerName.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  
                  {/* Player Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{scorer.playerName}</span>
                      {isCorrect && (
                        <span className="text-green-500 text-xs">✓</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`text-xs px-1.5 py-0.5 rounded ${getPositionBadge(scorer.position)} text-white`}>
                        {scorer.position}
                      </span>
                      {scorer.recentGoals !== undefined && (
                        <span className="text-xs text-[var(--pl-text-muted)]">
                          {scorer.recentGoals} goals (last 5)
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Form Badge */}
                  {scorer.form && (
                    <div className={`text-xs ${formBadge.color}`} title={formBadge.label}>
                      {formBadge.icon}
                    </div>
                  )}
                </div>
                
                {/* Probability Bar */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-2 bg-[var(--pl-dark)] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getProbabilityColor(scorer.probability)} transition-all duration-500`}
                      style={{ width: `${scorer.probability}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold w-12 text-right">
                    {scorer.probability}%
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-xs text-[var(--pl-text-muted)] text-center py-4">
            No goal scorer predictions available
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>⚽</span>
        <span>Most Likely Goal Scorers</span>
      </h2>
      
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
        <ScorerList team="home" scorers={homeScorers} teamInfo={homeTeam} />
        <div className="hidden sm:block w-px bg-[var(--pl-dark)]/50" />
        <ScorerList team="away" scorers={awayScorers} teamInfo={awayTeam} />
      </div>
      
      {actualScorers && (
        <div className="mt-4 pt-4 border-t border-[var(--pl-dark)]/50">
          <p className="text-xs text-[var(--pl-text-muted)]">
            ✓ = Correctly predicted scorer
          </p>
        </div>
      )}
    </div>
  );
}

'use client';

import TeamLogo from '@/components/TeamLogo';

interface MatchPredictionCardProps {
  fixture: {
    id: number;
    homeTeam: { id: number; name: string; logo?: string };
    awayTeam: { id: number; name: string; logo?: string };
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
  actualResult?: {
    homeScore: number;
    awayScore: number;
  };
  onViewDetails: () => void;
}

export default function MatchPredictionCard({
  fixture,
  prediction,
  actualResult,
  onViewDetails,
}: MatchPredictionCardProps) {
  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 70) return { label: 'High', color: 'green', border: 'border-[var(--pl-green)]' };
    if (confidence >= 40) return { label: 'Medium', color: 'yellow', border: 'border-yellow-500' };
    return { label: 'Low', color: 'gray', border: 'border-gray-500' };
  };

  const getProbabilityColor = (probability: number) => {
    if (probability >= 70) return 'bg-[var(--pl-green)]';
    if (probability >= 40) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const confidence = getConfidenceLevel(prediction.confidence);
  const isCompleted = !!actualResult;
  const isExactMatch = isCompleted && 
    actualResult.homeScore === prediction.predictedHomeScore &&
    actualResult.awayScore === prediction.predictedAwayScore;
  const isOutcomeCorrect = isCompleted && 
    ((actualResult.homeScore > actualResult.awayScore && prediction.predictedHomeScore > prediction.predictedAwayScore) ||
     (actualResult.homeScore < actualResult.awayScore && prediction.predictedHomeScore < prediction.predictedAwayScore) ||
     (actualResult.homeScore === actualResult.awayScore && prediction.predictedHomeScore === prediction.predictedAwayScore));

  return (
    <div className={`
      glass rounded-xl p-4
      border-2 ${confidence.border}
      hover:scale-[1.02] transition-all
      cursor-pointer
    `} onClick={onViewDetails}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
          confidence.color === 'green' ? 'bg-[var(--pl-green)] text-white' :
          confidence.color === 'yellow' ? 'bg-yellow-500 text-black' :
          'bg-gray-500 text-white'
        }`}>
          {confidence.label} Confidence
        </span>
        <span className="text-xs text-[var(--pl-text-muted)]">
          {new Date(fixture.date).toLocaleDateString('en-GB', { 
            weekday: 'short', 
            day: 'numeric', 
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Teams */}
      <div className="flex items-center justify-center gap-4 mb-4">
        <div className="text-center flex-1">
          <TeamLogo teamId={fixture.homeTeam.id} size={32} />
          <div className="text-sm font-semibold mt-1">{fixture.homeTeam.name}</div>
        </div>
        <div className="text-center">
          <div className="text-4xl sm:text-5xl font-bold">
            {prediction.predictedHomeScore}-{prediction.predictedAwayScore}
          </div>
          {isCompleted && (
            <div className="text-xs text-[var(--pl-text-muted)] mt-1">
              Actual: {actualResult.homeScore}-{actualResult.awayScore}
            </div>
          )}
        </div>
        <div className="text-center flex-1">
          <TeamLogo teamId={fixture.awayTeam.id} size={32} />
          <div className="text-sm font-semibold mt-1">{fixture.awayTeam.name}</div>
        </div>
      </div>

      {/* Outcome Probabilities */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--pl-text-muted)] w-20">Home Win:</span>
          <div className="flex-1 h-2 bg-[var(--pl-dark)] rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProbabilityColor(prediction.homeWinProbability)} transition-all duration-500`}
              style={{ width: `${prediction.homeWinProbability}%` }}
            />
          </div>
          <span className="text-xs font-semibold w-12 text-right">{prediction.homeWinProbability}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--pl-text-muted)] w-20">Draw:</span>
          <div className="flex-1 h-2 bg-[var(--pl-dark)] rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProbabilityColor(prediction.drawProbability)} transition-all duration-500`}
              style={{ width: `${prediction.drawProbability}%` }}
            />
          </div>
          <span className="text-xs font-semibold w-12 text-right">{prediction.drawProbability}%</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--pl-text-muted)] w-20">Away Win:</span>
          <div className="flex-1 h-2 bg-[var(--pl-dark)] rounded-full overflow-hidden">
            <div 
              className={`h-full ${getProbabilityColor(prediction.awayWinProbability)} transition-all duration-500`}
              style={{ width: `${prediction.awayWinProbability}%` }}
            />
          </div>
          <span className="text-xs font-semibold w-12 text-right">{prediction.awayWinProbability}%</span>
        </div>
      </div>

      {/* Key Factors */}
      {prediction.keyFactors.length > 0 && (
        <div className="mb-4">
          <div className="text-xs font-semibold text-[var(--pl-text-muted)] mb-2">Key Factors:</div>
          <ul className="space-y-1">
            {prediction.keyFactors.slice(0, 3).map((factor, idx) => (
              <li key={idx} className="text-xs text-[var(--pl-text-muted)] flex items-start gap-2">
                <span>•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Accuracy Indicator (if completed) */}
      {isCompleted && (
        <div className="mb-4 p-2 rounded-lg bg-[var(--pl-dark)]/50">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--pl-text-muted)]">Accuracy:</span>
            <div className="flex items-center gap-2">
              {isExactMatch ? (
                <>
                  <span className="text-green-500">✓</span>
                  <span className="text-xs font-semibold text-green-500">100%</span>
                </>
              ) : isOutcomeCorrect ? (
                <>
                  <span className="text-yellow-500">✓</span>
                  <span className="text-xs font-semibold text-yellow-500">50%</span>
                </>
              ) : (
                <>
                  <span className="text-red-500">✗</span>
                  <span className="text-xs font-semibold text-red-500">0%</span>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* View Details Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onViewDetails();
        }}
        className="w-full py-2 px-4 rounded-lg bg-[var(--pl-green)]/20 hover:bg-[var(--pl-green)]/30 text-[var(--pl-green)] font-semibold text-sm transition-colors"
      >
        View Details
      </button>
    </div>
  );
}

'use client';

interface AccuracyMetrics {
  overallAccuracy: number;
  exactScoreAccuracy: number;
  outcomeAccuracy: number;
  goalScorerAccuracy: number;
}

interface RecentPrediction {
  fixture: string;
  predicted: string;
  actual: string;
  accuracy: 'exact' | 'outcome' | 'wrong';
  date: string;
}

interface PredictionAccuracyWidgetProps {
  metrics: AccuracyMetrics;
  trend?: any[]; // Not used in new design
  recentPredictions?: RecentPrediction[];
}

export default function PredictionAccuracyWidget({
  metrics,
  recentPredictions,
}: PredictionAccuracyWidgetProps) {
  // Count prediction types
  const exactCount = recentPredictions?.filter(p => p.accuracy === 'exact').length || 0;
  const outcomeCount = recentPredictions?.filter(p => p.accuracy === 'outcome').length || 0;
  const wrongCount = recentPredictions?.filter(p => p.accuracy === 'wrong').length || 0;
  const totalCount = recentPredictions?.length || 0;

  const getAccuracyBadge = (type: 'exact' | 'outcome' | 'wrong') => {
    switch (type) {
      case 'exact':
        return { icon: '🎯', label: 'Exact', bgColor: 'bg-green-500/20', textColor: 'text-green-400', borderColor: 'border-green-500' };
      case 'outcome':
        return { icon: '✓', label: 'Outcome', bgColor: 'bg-yellow-500/20', textColor: 'text-yellow-400', borderColor: 'border-yellow-500' };
      case 'wrong':
        return { icon: '✗', label: 'Wrong', bgColor: 'bg-red-500/20', textColor: 'text-red-400', borderColor: 'border-red-500' };
    }
  };

  // Calculate ring progress for overall accuracy
  const ringProgress = metrics.overallAccuracy;
  const ringCircumference = 2 * Math.PI * 45; // radius = 45
  const ringOffset = ringCircumference - (ringProgress / 100) * ringCircumference;

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <span>📊</span>
          <span>Prediction Accuracy</span>
        </h2>
        <span className="text-xs text-[var(--pl-text-muted)]">
          Last {totalCount} matches
        </span>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Accuracy Ring */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-32 h-32">
            <svg className="w-full h-full transform -rotate-90">
              {/* Background ring */}
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="rgba(255,255,255,0.1)"
                strokeWidth="8"
              />
              {/* Progress ring */}
              <circle
                cx="64"
                cy="64"
                r="45"
                fill="none"
                stroke="url(#gradient)"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="var(--pl-green)" />
                  <stop offset="100%" stopColor="var(--pl-cyan)" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold">{Math.round(metrics.overallAccuracy)}%</span>
              <span className="text-xs text-[var(--pl-text-muted)]">Overall</span>
            </div>
          </div>
          <p className="text-xs text-[var(--pl-text-muted)] mt-2 text-center">
            Combines exact scores (100%) + correct outcomes (50%)
          </p>
        </div>

        {/* Middle: Breakdown Cards */}
        <div className="space-y-3">
          <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎯</span>
                <div>
                  <div className="text-sm font-semibold text-green-400">Exact Score</div>
                  <div className="text-xs text-[var(--pl-text-muted)]">Perfect predictions</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-green-400">{exactCount}</div>
                <div className="text-xs text-[var(--pl-text-muted)]">{Math.round(metrics.exactScoreAccuracy)}%</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✓</span>
                <div>
                  <div className="text-sm font-semibold text-yellow-400">Correct Outcome</div>
                  <div className="text-xs text-[var(--pl-text-muted)]">Right result, wrong score</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-yellow-400">{outcomeCount}</div>
                <div className="text-xs text-[var(--pl-text-muted)]">{totalCount > 0 ? Math.round((outcomeCount / totalCount) * 100) : 0}%</div>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xl">✗</span>
                <div>
                  <div className="text-sm font-semibold text-red-400">Wrong</div>
                  <div className="text-xs text-[var(--pl-text-muted)]">Incorrect outcome</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-red-400">{wrongCount}</div>
                <div className="text-xs text-[var(--pl-text-muted)]">{totalCount > 0 ? Math.round((wrongCount / totalCount) * 100) : 0}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Recent Predictions */}
        <div>
          <h3 className="text-sm font-semibold mb-3 text-[var(--pl-text-muted)]">Recent Results</h3>
          {recentPredictions && recentPredictions.length > 0 ? (
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {recentPredictions.slice(0, 6).map((pred, idx) => {
                const badge = getAccuracyBadge(pred.accuracy);
                return (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg ${badge.bgColor} border ${badge.borderColor}/30`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold truncate">{pred.fixture}</div>
                        <div className="flex items-center gap-2 text-xs text-[var(--pl-text-muted)]">
                          <span>{pred.predicted}</span>
                          <span>→</span>
                          <span className="font-semibold text-white">{pred.actual}</span>
                        </div>
                      </div>
                      <span className={`text-lg ${badge.textColor}`}>{badge.icon}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-[var(--pl-text-muted)] text-sm">
              No completed predictions yet
            </div>
          )}
        </div>
      </div>

      {/* Performance Bar */}
      {totalCount > 0 && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs text-[var(--pl-text-muted)]">Performance breakdown:</span>
          </div>
          <div className="h-3 rounded-full overflow-hidden flex bg-[var(--pl-dark)]">
            {exactCount > 0 && (
              <div 
                className="h-full bg-green-500 transition-all" 
                style={{ width: `${(exactCount / totalCount) * 100}%` }}
                title={`Exact: ${exactCount}`}
              />
            )}
            {outcomeCount > 0 && (
              <div 
                className="h-full bg-yellow-500 transition-all" 
                style={{ width: `${(outcomeCount / totalCount) * 100}%` }}
                title={`Outcome: ${outcomeCount}`}
              />
            )}
            {wrongCount > 0 && (
              <div 
                className="h-full bg-red-500 transition-all" 
                style={{ width: `${(wrongCount / totalCount) * 100}%` }}
                title={`Wrong: ${wrongCount}`}
              />
            )}
          </div>
          <div className="flex justify-between mt-1 text-xs text-[var(--pl-text-muted)]">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              Exact
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
              Outcome
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Wrong
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

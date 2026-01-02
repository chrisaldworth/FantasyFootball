'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface AccuracyMetrics {
  overallAccuracy: number;
  exactScoreAccuracy: number;
  outcomeAccuracy: number;
  goalScorerAccuracy: number;
}

interface AccuracyTrend {
  date: string;
  accuracy: number;
  exactScore: number;
  outcome: number;
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
  trend?: AccuracyTrend[];
  recentPredictions?: RecentPrediction[];
}

export default function PredictionAccuracyWidget({
  metrics,
  trend,
  recentPredictions,
}: PredictionAccuracyWidgetProps) {
  const getAccuracyColor = (accuracy: number) => {
    if (accuracy >= 70) return 'text-[var(--pl-green)]';
    if (accuracy >= 50) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getAccuracyBadgeColor = (accuracy: number) => {
    if (accuracy >= 70) return 'bg-[var(--pl-green)]';
    if (accuracy >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getAccuracyIcon = (type: 'exact' | 'outcome' | 'wrong') => {
    if (type === 'exact') return { icon: '✓', color: 'text-green-500' };
    if (type === 'outcome') return { icon: '~', color: 'text-yellow-500' };
    return { icon: '✗', color: 'text-red-500' };
  };

  return (
    <div className="glass rounded-xl p-4 sm:p-6">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>📊</span>
        <span>Prediction Accuracy</span>
      </h2>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className={`text-2xl sm:text-3xl font-bold mb-1 ${getAccuracyColor(metrics.overallAccuracy)}`}>
            {metrics.overallAccuracy}%
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Overall</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl sm:text-3xl font-bold mb-1 ${getAccuracyColor(metrics.exactScoreAccuracy)}`}>
            {metrics.exactScoreAccuracy}%
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Exact Score</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl sm:text-3xl font-bold mb-1 ${getAccuracyColor(metrics.outcomeAccuracy)}`}>
            {metrics.outcomeAccuracy}%
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Outcome</div>
        </div>
        <div className="text-center">
          <div className={`text-2xl sm:text-3xl font-bold mb-1 ${getAccuracyColor(metrics.goalScorerAccuracy)}`}>
            {metrics.goalScorerAccuracy}%
          </div>
          <div className="text-xs text-[var(--pl-text-muted)]">Goal Scorers</div>
        </div>
      </div>

      {/* Accuracy Trend Chart */}
      {trend && trend.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-semibold mb-3 text-[var(--pl-text-muted)]">Accuracy Over Time</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#888" 
                fontSize={12}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
              />
              <YAxis 
                stroke="#888" 
                fontSize={12}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a2e', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                }}
                formatter={(value: number) => [`${value}%`, 'Accuracy']}
                labelFormatter={(label) => new Date(label).toLocaleDateString('en-GB')}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10b981" 
                strokeWidth={2} 
                name="Overall Accuracy"
                dot={{ fill: '#10b981', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="exactScore" 
                stroke="#f59e0b" 
                strokeWidth={2} 
                name="Exact Score"
                dot={{ fill: '#f59e0b', r: 4 }}
              />
              <Line 
                type="monotone" 
                dataKey="outcome" 
                stroke="#3b82f6" 
                strokeWidth={2} 
                name="Outcome"
                dot={{ fill: '#3b82f6', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Recent Predictions */}
      {recentPredictions && recentPredictions.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold mb-3 text-[var(--pl-text-muted)]">Recent Predictions</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {recentPredictions.map((pred, idx) => {
              const accuracyIcon = getAccuracyIcon(pred.accuracy);
              return (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[var(--pl-dark)]/50 border border-[var(--pl-dark)]/50"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-lg ${accuracyIcon.color}`}>
                        {accuracyIcon.icon}
                      </span>
                      <span className="text-sm font-semibold">{pred.fixture}</span>
                    </div>
                    <span className="text-xs text-[var(--pl-text-muted)]">
                      {new Date(pred.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-[var(--pl-text-muted)]">Predicted:</span>
                    <span className="font-semibold">{pred.predicted}</span>
                    <span className="text-[var(--pl-text-muted)]">•</span>
                    <span className="text-[var(--pl-text-muted)]">Actual:</span>
                    <span className="font-semibold">{pred.actual}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {(!trend || trend.length === 0) && (!recentPredictions || recentPredictions.length === 0) && (
        <div className="text-center py-8 text-[var(--pl-text-muted)]">
          <p className="text-sm">No accuracy data available yet</p>
          <p className="text-xs mt-1">Predictions will be tracked after matches are completed</p>
        </div>
      )}
    </div>
  );
}

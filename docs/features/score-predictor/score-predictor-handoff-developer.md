# Score Predictor - Developer Handoff

**Date**: 2025-12-21  
**From**: UI Designer Agent  
**To**: Developer Agent  
**Status**: ✅ Design Complete, Ready for Implementation  
**Priority**: P1 (Score Predictor - AI-Powered Match Predictions)

---

## Overview

Complete implementation guide for the Score Predictor feature. This document provides step-by-step instructions, code examples, and implementation details for all 5 components.

**Reference Documents**:
- Design Specification: `score-predictor-design-spec.md` ⭐ **START HERE**
- Requirements: `score-predictor-requirements.md`
- Handoff: `score-predictor-handoff-ui-designer.md`

---

## Design Specification

**Full Design Spec**: `docs/features/score-predictor/score-predictor-design-spec.md`

**Key Design Decisions**:
- Large scoreline format for predicted scores (48-64px)
- Horizontal probability bars with percentages
- Confidence badges with color-coded borders
- Vertical list for goal scorers with probability bars
- Mini line charts + trend arrows for form
- Gradient color scale (green/yellow/red) for confidence
- Progressive disclosure (card → modal for details)
- Side-by-side comparison bars for team stats
- Before/after comparison for accuracy display
- Stacked layout for mobile optimization

---

## Implementation Tasks

### Task 1: Create MatchPredictionCard Component

**File**: `frontend/src/components/score-predictor/MatchPredictionCard.tsx`

**Props**:
```typescript
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
```

**Implementation**:
```tsx
'use client';

import TeamLogo from '@/components/TeamLogo';

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
```

---

### Task 2: Create GoalScorerPredictions Component

**File**: `frontend/src/components/score-predictor/GoalScorerPredictions.tsx`

**Implementation**: See design spec for layout. Use probability bars, player photos, form indicators.

---

### Task 3: Create PredictionDetailsModal Component

**File**: `frontend/src/components/score-predictor/PredictionDetailsModal.tsx`

**Implementation**: 
- Tabbed interface (Summary, Form, H2H, Stats, Scorers)
- Charts using Recharts or Chart.js
- Team form line charts
- Head-to-head timeline
- Statistical comparisons

---

### Task 4: Create PredictionAccuracyWidget Component

**File**: `frontend/src/components/score-predictor/PredictionAccuracyWidget.tsx`

**Implementation**:
- Accuracy metrics with progress bars
- Trend chart (line chart)
- Recent predictions list
- Color-coded indicators

---

### Task 5: Create FixturesWithPredictions Component

**File**: `frontend/src/app/predictions/page.tsx`

**Implementation**:
- Grid layout of MatchPredictionCard components
- Filters (team, gameweek, date)
- Sort options
- Empty/loading states

---

## API Integration

### Required Backend Endpoints

1. **Get Predictions**: `GET /api/predictions/fixtures`
   - Query params: `gameweek`, `team_id`, `date_from`, `date_to`
   - Response: Array of match predictions

2. **Get Single Prediction**: `GET /api/predictions/match/{fixture_id}`
   - Response: Full prediction with detailed analysis

3. **Get Goal Scorers**: `GET /api/predictions/goal-scorers/{fixture_id}`
   - Response: Array of predicted goal scorers

4. **Get Accuracy**: `GET /api/predictions/accuracy`
   - Response: Historical accuracy metrics

### Frontend API Methods

Add to `frontend/src/lib/api.ts`:

```typescript
export const predictionsApi = {
  getFixtures: async (filters?: {
    gameweek?: number;
    team_id?: number;
    date_from?: string;
    date_to?: string;
  }) => {
    const params = new URLSearchParams();
    if (filters?.gameweek) params.append('gameweek', filters.gameweek.toString());
    if (filters?.team_id) params.append('team_id', filters.team_id.toString());
    if (filters?.date_from) params.append('date_from', filters.date_from);
    if (filters?.date_to) params.append('date_to', filters.date_to);
    
    const response = await api.get(`/api/predictions/fixtures?${params.toString()}`);
    return response.data;
  },

  getMatchPrediction: async (fixtureId: number) => {
    const response = await api.get(`/api/predictions/match/${fixtureId}`);
    return response.data;
  },

  getGoalScorers: async (fixtureId: number) => {
    const response = await api.get(`/api/predictions/goal-scorers/${fixtureId}`);
    return response.data;
  },

  getAccuracy: async (limit?: number) => {
    const params = limit ? `?limit=${limit}` : '';
    const response = await api.get(`/api/predictions/accuracy${params}`);
    return response.data;
  },
};
```

---

## Chart Library

**Recommended**: **Recharts** (React-friendly, good TypeScript support)

**Installation**:
```bash
npm install recharts
```

**Usage Example**:
```tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

<ResponsiveContainer width="100%" height={200}>
  <LineChart data={formData}>
    <CartesianGrid strokeDasharray="3 3" />
    <XAxis dataKey="match" />
    <YAxis />
    <Tooltip />
    <Line type="monotone" dataKey="goals" stroke="#00ff87" />
  </LineChart>
</ResponsiveContainer>
```

---

## State Management

### Prediction Data Caching

Consider using React Context or SWR for caching:

```tsx
// frontend/src/hooks/usePredictions.ts
import useSWR from 'swr';

export function usePredictions(filters?: PredictionFilters) {
  const { data, error, isLoading } = useSWR(
    ['predictions', filters],
    () => predictionsApi.getFixtures(filters),
    { revalidateOnFocus: false, revalidateOnReconnect: true }
  );

  return {
    predictions: data?.predictions || [],
    loading: isLoading,
    error,
  };
}
```

---

## Testing Checklist

### Functionality
- [ ] MatchPredictionCard displays correctly
- [ ] Probability bars show correct percentages
- [ ] Confidence levels calculated correctly
- [ ] Goal scorer predictions display correctly
- [ ] PredictionDetailsModal opens and displays data
- [ ] Charts render correctly
- [ ] Accuracy widget shows correct metrics
- [ ] Filters work correctly
- [ ] Empty states display correctly
- [ ] Loading states work

### Integration
- [ ] Predictions appear in fixtures list
- [ ] Predictions appear in match details
- [ ] Dashboard widget displays predictions
- [ ] Favorite team section shows predictions
- [ ] FPL integration highlights predicted scorers

### Responsive
- [ ] Mobile (320px) - Stacked layout, bottom sheet
- [ ] Tablet (768px) - 2-column grid
- [ ] Desktop (1024px+) - 3-column grid, full details

### Accessibility
- [ ] WCAG AA contrast ratios
- [ ] Keyboard navigation works
- [ ] Screen reader support (ARIA labels)
- [ ] Focus indicators visible
- [ ] Charts have text alternatives

---

**Handoff Complete** ✅  
**Ready for Implementation** 🚀

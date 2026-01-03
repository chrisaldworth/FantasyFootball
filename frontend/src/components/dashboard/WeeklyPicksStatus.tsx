'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { weeklyPicksApi, fplApi } from '@/lib/api';

interface WeeklyPicksStatusProps {
  userId?: number;
}

interface PicksStatus {
  gameweek: number;
  hasPicks: boolean;
  deadline: Date | null;
  isLocked: boolean;
  scorePredictions: number;
  playerPicks: number;
}

export default function WeeklyPicksStatus({ userId }: WeeklyPicksStatusProps) {
  // Always call hooks at the top level - never conditionally
  const [currentWeekPicks, setCurrentWeekPicks] = useState<PicksStatus | null>(null);
  const [nextWeekPicks, setNextWeekPicks] = useState<PicksStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Handle undefined userId inside the effect, not by conditionally calling hooks
    if (!userId) {
      setLoading(false);
      setCurrentWeekPicks(null);
      setNextWeekPicks(null);
      return;
    }

    const fetchPicksStatus = async () => {
      try {
        setLoading(true);
        const bootstrap = await fplApi.getBootstrap();
        const events = bootstrap?.events || [];
        
        // Find current and next gameweek
        const currentEvent = events.find((e: any) => e.is_current);
        const allEvents = events.filter((e: any) => !e.finished).sort((a: any, b: any) => a.id - b.id);
        const nextEvent = allEvents.find((e: any) => e.id > (currentEvent?.id || 0));

        // Fetch picks for current week
        if (currentEvent && currentEvent.id && currentEvent.deadline_time) {
          try {
            const picks = await weeklyPicksApi.getPicks(currentEvent.id);
            const deadline = new Date(currentEvent.deadline_time);
            if (!isNaN(deadline.getTime())) {
              setCurrentWeekPicks({
                gameweek: currentEvent.id,
                hasPicks: !!(picks && picks.scorePredictions && picks.playerPicks),
                deadline,
                isLocked: new Date() >= deadline,
                scorePredictions: picks?.scorePredictions?.length || 0,
                playerPicks: picks?.playerPicks?.length || 0,
              });
            }
          } catch (error) {
            console.error('Error fetching current week picks:', error);
            try {
              const deadline = new Date(currentEvent.deadline_time);
              if (!isNaN(deadline.getTime())) {
                setCurrentWeekPicks({
                  gameweek: currentEvent.id,
                  hasPicks: false,
                  deadline,
                  isLocked: new Date() >= deadline,
                  scorePredictions: 0,
                  playerPicks: 0,
                });
              }
            } catch (dateError) {
              console.error('Error parsing deadline date:', dateError);
            }
          }
        }

        // Fetch picks for next week
        if (nextEvent && nextEvent.id && nextEvent.deadline_time) {
          try {
            const picks = await weeklyPicksApi.getPicks(nextEvent.id);
            const deadline = new Date(nextEvent.deadline_time);
            if (!isNaN(deadline.getTime())) {
              setNextWeekPicks({
                gameweek: nextEvent.id,
                hasPicks: !!(picks && picks.scorePredictions && picks.playerPicks),
                deadline,
                isLocked: new Date() >= deadline,
                scorePredictions: picks?.scorePredictions?.length || 0,
                playerPicks: picks?.playerPicks?.length || 0,
              });
            }
          } catch (error) {
            console.error('Error fetching next week picks:', error);
            try {
              const deadline = new Date(nextEvent.deadline_time);
              if (!isNaN(deadline.getTime())) {
                setNextWeekPicks({
                  gameweek: nextEvent.id,
                  hasPicks: false,
                  deadline,
                  isLocked: new Date() >= deadline,
                  scorePredictions: 0,
                  playerPicks: 0,
                });
              }
            } catch (dateError) {
              console.error('Error parsing deadline date:', dateError);
            }
          }
        }
      } catch (error) {
        console.error('Error fetching weekly picks status:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPicksStatus();
  }, [userId]);

  if (loading || (!currentWeekPicks && !nextWeekPicks)) {
    return null;
  }

  const renderPicksCard = (picks: PicksStatus | null, label: string) => {
    if (!picks || typeof picks.gameweek !== 'number') return null;

    const isComplete = picks.scorePredictions === 3 && picks.playerPicks === 3;
    const hasPartial = picks.hasPicks && !isComplete;

    return (
      <div className="glass rounded-xl p-1.5 sm:p-4">
        <div className="flex items-center justify-between mb-1 sm:mb-2">
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="text-sm sm:text-lg">🎯</span>
            <span className="text-xs sm:text-base font-semibold text-white">{label}</span>
            <span className="text-[10px] sm:text-sm text-[var(--pl-text-muted)]">GW {picks.gameweek}</span>
          </div>
          {isComplete ? (
            <span className="text-xs px-2 py-1 rounded bg-[var(--pl-green)]/20 text-[var(--pl-green)]">
              Complete
            </span>
          ) : hasPartial ? (
            <span className="text-xs px-2 py-1 rounded bg-[var(--pl-yellow)]/20 text-[var(--pl-yellow)]">
              Partial
            </span>
          ) : (
            <span className="text-xs px-2 py-1 rounded bg-[var(--pl-pink)]/20 text-[var(--pl-pink)]">
              Not Started
            </span>
          )}
        </div>
        
        <div className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-2 sm:mb-3">
          {picks.scorePredictions}/3 Score Predictions • {picks.playerPicks}/3 Player Picks
        </div>

        {picks.deadline && (
          <div className="text-[10px] sm:text-xs text-[var(--pl-text-muted)] mb-2 sm:mb-3">
            Deadline: {new Date(picks.deadline).toLocaleDateString('en-GB', { 
              weekday: 'short', 
              day: 'numeric', 
              month: 'short',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        )}

        <Link
          href={`/weekly-picks/make-picks?gameweek=${picks.gameweek}`}
          className="block w-full text-center py-2 px-4 rounded-lg bg-[var(--pl-green)]/10 border border-[var(--pl-green)]/30 text-[var(--pl-green)] hover:bg-[var(--pl-green)]/20 transition-colors text-sm font-medium"
        >
          {isComplete ? 'Edit Picks' : hasPartial ? 'Complete Picks' : 'Make Picks'}
        </Link>
      </div>
    );
  };

  return (
    <div className="space-y-2 sm:space-y-4">
      {currentWeekPicks && renderPicksCard(currentWeekPicks, 'This Week')}
      {nextWeekPicks && renderPicksCard(nextWeekPicks, 'Next Week')}
    </div>
  );
}


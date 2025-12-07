'use client';

import { useEffect, useRef, useCallback } from 'react';
import { fplApi } from '@/lib/api';
import {
  getNotificationSettings,
  trackPlayerStats,
  clearTrackedStats,
} from '@/lib/notifications';

interface Player {
  id: number;
  web_name: string;
  team: number;
}

interface Team {
  id: number;
  short_name: string;
  name: string;
}

interface Pick {
  element: number;
  position: number;
  multiplier: number;
}

interface LiveElement {
  id: number;
  stats: {
    minutes: number;
    goals_scored: number;
    assists: number;
    clean_sheets: number;
    goals_conceded: number;
    own_goals: number;
    penalties_saved: number;
    penalties_missed: number;
    yellow_cards: number;
    red_cards: number;
    saves: number;
    bonus: number;
    bps: number;
    influence: string;
    creativity: string;
    threat: string;
    ict_index: string;
    total_points: number;
  };
}

interface UseLiveNotificationsProps {
  picks: Pick[] | null;
  players: Player[];
  teams: Team[];
  currentGameweek: number | null;
  enabled?: boolean;
  pollInterval?: number; // in milliseconds
}

export function useLiveNotifications({
  picks,
  players,
  teams,
  currentGameweek,
  enabled = true,
  pollInterval = 60000, // Default: poll every 60 seconds
}: UseLiveNotificationsProps) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastPollRef = useRef<number>(0);

  const getTeamName = useCallback((teamId: number): string => {
    return teams.find((t) => t.id === teamId)?.short_name || 'Unknown';
  }, [teams]);

  const checkForUpdates = useCallback(async () => {
    if (!picks || !currentGameweek || picks.length === 0) return;

    const settings = getNotificationSettings();
    if (!settings.enabled) return;

    try {
      const liveData = await fplApi.getLiveGameweek(currentGameweek);
      if (!liveData?.elements) return;

      const liveElements: LiveElement[] = liveData.elements;

      // Check each player in user's team
      picks.forEach((pick) => {
        const player = players.find((p) => p.id === pick.element);
        if (!player) return;

        const liveStats = liveElements.find((e) => e.id === pick.element);
        if (!liveStats) return;

        // Track and notify about changes
        trackPlayerStats(
          player.id,
          player.web_name,
          getTeamName(player.team),
          {
            goals: liveStats.stats.goals_scored,
            assists: liveStats.stats.assists,
            yellowCards: liveStats.stats.yellow_cards,
            redCards: liveStats.stats.red_cards,
            bonus: liveStats.stats.bonus,
            minutes: liveStats.stats.minutes,
          }
        );
      });

      lastPollRef.current = Date.now();
    } catch (error) {
      console.error('Failed to check for live updates:', error);
    }
  }, [picks, players, currentGameweek, getTeamName]);

  // Start/stop polling based on enabled state
  useEffect(() => {
    if (!enabled || !picks || !currentGameweek) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    // Initial check
    checkForUpdates();

    // Set up polling
    intervalRef.current = setInterval(checkForUpdates, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, picks, currentGameweek, checkForUpdates, pollInterval]);

  // Clear stats when gameweek changes
  useEffect(() => {
    clearTrackedStats();
  }, [currentGameweek]);

  return {
    lastPoll: lastPollRef.current,
    forceCheck: checkForUpdates,
  };
}


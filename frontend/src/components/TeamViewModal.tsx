'use client';

import { useState, useEffect } from 'react';
import { fplApi } from '@/lib/api';
import TeamPitch from './TeamPitch';

interface TeamViewModalProps {
  teamId: number;
  teamName: string;
  managerName: string;
  onClose: () => void;
  bootstrapData: any;
}

interface TeamData {
  id: number;
  name: string;
  player_first_name: string;
  player_last_name: string;
  summary_overall_points: number;
  summary_overall_rank: number;
  summary_event_points: number;
  summary_event_rank: number;
}

interface PicksData {
  entry_history: {
    event: number;
    points: number;
    total_points: number;
    rank: number;
    overall_rank: number;
    bank: number;
    value: number;
  };
  picks: {
    element: number;
    position: number;
    multiplier: number;
    is_captain: boolean;
    is_vice_captain: boolean;
  }[];
}

export default function TeamViewModal({
  teamId,
  teamName,
  managerName,
  onClose,
  bootstrapData,
}: TeamViewModalProps) {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [picks, setPicks] = useState<PicksData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentGW, setCurrentGW] = useState<number | null>(null);

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      setError('');

      // Find current gameweek from bootstrap data
      const currentEvent = bootstrapData?.events?.find((e: any) => e.is_current);
      const finishedEvents = bootstrapData?.events?.filter((e: any) => e.finished) || [];
      const latestEvent = currentEvent || finishedEvents[finishedEvents.length - 1];

      if (!latestEvent) {
        setError('Could not determine current gameweek');
        setLoading(false);
        return;
      }

      setCurrentGW(latestEvent.id);

      const [team, picksData] = await Promise.all([
        fplApi.getTeam(teamId),
        fplApi.getTeamPicks(teamId, latestEvent.id),
      ]);

      setTeamData(team);
      setPicks(picksData);
    } catch (err) {
      console.error('Failed to fetch team:', err);
      setError('Failed to load team data');
    } finally {
      setLoading(false);
    }
  };

  const formatRank = (rank: number) => rank.toLocaleString();

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
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

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--pl-pink)] to-[var(--pl-purple)] flex items-center justify-center text-2xl">
              👤
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold">{teamName}</h2>
              <p className="text-sm text-[var(--pl-text-muted)]">
                {managerName} • GW {currentGW}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          {teamData && (
            <div className="grid grid-cols-4 gap-2 mt-4">
              <div className="bg-[var(--pl-dark)]/50 rounded-lg p-2 text-center">
                <div className="text-xs text-[var(--pl-text-muted)]">Total</div>
                <div className="font-bold text-[var(--pl-green)]">
                  {formatRank(teamData.summary_overall_points)}
                </div>
              </div>
              <div className="bg-[var(--pl-dark)]/50 rounded-lg p-2 text-center">
                <div className="text-xs text-[var(--pl-text-muted)]">Rank</div>
                <div className="font-bold">{formatRank(teamData.summary_overall_rank)}</div>
              </div>
              <div className="bg-[var(--pl-dark)]/50 rounded-lg p-2 text-center">
                <div className="text-xs text-[var(--pl-text-muted)]">GW Pts</div>
                <div className="font-bold text-[var(--pl-cyan)]">
                  {teamData.summary_event_points}
                </div>
              </div>
              <div className="bg-[var(--pl-dark)]/50 rounded-lg p-2 text-center">
                <div className="text-xs text-[var(--pl-text-muted)]">GW Rank</div>
                <div className="font-bold">
                  {teamData.summary_event_rank ? formatRank(teamData.summary_event_rank) : '-'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-2 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {error && (
            <div className="text-center py-12 text-[var(--pl-pink)]">{error}</div>
          )}

          {!loading && !error && picks && bootstrapData && (
            <TeamPitch
              picks={picks.picks}
              players={bootstrapData.elements}
              teams={bootstrapData.teams}
              bank={picks.entry_history?.bank || 0}
              teamValue={picks.entry_history?.value || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import { FormInput } from '@/components/admin/FormInput';
import ActionMenu from '@/components/admin/ActionMenu';

interface ScorePrediction {
  id: number;
  fixture_id: number;
  home_team_id: number;
  away_team_id: number;
  predicted_home_score: number;
  predicted_away_score: number;
  actual_home_score: number | null;
  actual_away_score: number | null;
  points: number;
  breakdown: any;
}

interface PlayerPick {
  id: number;
  player_id: number;
  fixture_id: number;
  fpl_points: number | null;
  points: number;
}

interface WeeklyPickDetail {
  id: number;
  user_id: number;
  username: string;
  email: string;
  gameweek: number;
  total_points: number;
  rank: number | null;
  flagged: boolean;
  created_at: string;
  updated_at: string;
  score_predictions: ScorePrediction[];
  player_picks: PlayerPick[];
}

export default function WeeklyPickDetailPage() {
  const searchParams = useSearchParams();
  const pickId = searchParams.get('id');
  const [pick, setPick] = useState<WeeklyPickDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [newPoints, setNewPoints] = useState<string>('');
  const [adjusting, setAdjusting] = useState(false);

  useEffect(() => {
    const fetchPick = async () => {
      if (!pickId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/weekly-picks/${pickId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setPick(data);
        }
      } catch (error) {
        console.error('Error fetching weekly pick:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPick();
  }, [pickId]);

  const handleAdjustPoints = async () => {
    if (!pick || !newPoints) return;
    
    setAdjusting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/weekly-picks/${pick.id}/points`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ total_points: parseInt(newPoints) }),
        }
      );

      if (response.ok) {
        setPick({ ...pick, total_points: parseInt(newPoints) });
        setShowAdjustModal(false);
        setNewPoints('');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to adjust points');
      }
    } catch (error) {
      console.error('Error adjusting points:', error);
      alert('Failed to adjust points');
    } finally {
      setAdjusting(false);
    }
  };

  const handleFlag = async (flag: boolean) => {
    if (!pick) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/weekly-picks/${pick.id}/flag`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ flagged: flag }),
        }
      );

      if (response.ok) {
        setPick({ ...pick, flagged: flag });
      } else {
        alert('Failed to update flag status');
      }
    } catch (error) {
      console.error('Error flagging pick:', error);
      alert('Failed to update flag status');
    }
  };

  const handleDelete = async () => {
    if (!pick) return;
    
    if (!confirm(`Are you sure you want to delete this weekly pick? This action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/weekly-picks/${pick.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        window.location.href = '/admin/weekly-picks';
      } else {
        alert('Failed to delete weekly pick');
      }
    } catch (error) {
      console.error('Error deleting pick:', error);
      alert('Failed to delete weekly pick');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!pick || !pickId) {
    return (
      <div className="text-center py-12">
        <p className="text-[#999999] mb-4">Weekly pick not found</p>
        <Link href="/admin/weekly-picks" className="text-[#10b981] hover:text-[#059669]">
          Back to Weekly Picks
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/weekly-picks" className="text-[#999999] hover:text-white mb-2 inline-block">
            ← Back to Weekly Picks
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Weekly Pick Details</h1>
        </div>
        <div className="flex gap-3">
          <ActionMenu
            items={[
              {
                label: 'Adjust Points',
                onClick: () => {
                  setNewPoints(pick.total_points.toString());
                  setShowAdjustModal(true);
                },
              },
              {
                label: pick.flagged ? 'Unflag' : 'Flag',
                onClick: () => handleFlag(!pick.flagged),
                danger: pick.flagged,
              },
              {
                label: 'Delete',
                onClick: handleDelete,
                danger: true,
              },
            ]}
            trigger={
              <button className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition">
                Actions
              </button>
            }
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">Pick Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#999999]">User</label>
              <p className="text-white">{pick.username}</p>
              <p className="text-sm text-[#999999]">{pick.email}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Gameweek</label>
              <p className="text-white">{pick.gameweek}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Total Points</label>
              <p className="text-2xl font-bold text-white">{pick.total_points}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Rank</label>
              <p className="text-white">{pick.rank ? `#${pick.rank}` : 'Not ranked'}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Status</label>
              <div className="mt-1">
                {pick.flagged ? (
                  <StatusBadge status="flagged" label="Flagged" />
                ) : (
                  <StatusBadge status="active" label="Normal" />
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Created At</label>
              <p className="text-white">{new Date(pick.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">Summary</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#999999]">Score Predictions</label>
              <p className="text-white">{pick.score_predictions.length} predictions</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Player Picks</label>
              <p className="text-white">{pick.player_picks.length} picks</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Total Score Prediction Points</label>
              <p className="text-white">
                {pick.score_predictions.reduce((sum, sp) => sum + sp.points, 0)} points
              </p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Total Player Pick Points</label>
              <p className="text-white">
                {pick.player_picks.reduce((sum, pp) => sum + pp.points, 0)} points
              </p>
            </div>
          </div>
        </div>
      </div>

      {pick.score_predictions.length > 0 && (
        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">Score Predictions</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left py-3 px-4 text-sm text-[#999999]">Fixture ID</th>
                  <th className="text-left py-3 px-4 text-sm text-[#999999]">Prediction</th>
                  <th className="text-left py-3 px-4 text-sm text-[#999999]">Actual</th>
                  <th className="text-left py-3 px-4 text-sm text-[#999999]">Points</th>
                </tr>
              </thead>
              <tbody>
                {pick.score_predictions.map((sp) => (
                  <tr key={sp.id} className="border-b border-[#2a2a2a]">
                    <td className="py-3 px-4 text-white">{sp.fixture_id}</td>
                    <td className="py-3 px-4 text-white">
                      {sp.predicted_home_score} - {sp.predicted_away_score}
                    </td>
                    <td className="py-3 px-4 text-white">
                      {sp.actual_home_score !== null && sp.actual_away_score !== null
                        ? `${sp.actual_home_score} - ${sp.actual_away_score}`
                        : 'Not played'}
                    </td>
                    <td className="py-3 px-4 text-white font-semibold">{sp.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {pick.player_picks.length > 0 && (
        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">Player Picks</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left py-3 px-4 text-sm text-[#999999]">Player ID</th>
                  <th className="text-left py-3 px-4 text-sm text-[#999999]">Fixture ID</th>
                  <th className="text-left py-3 px-4 text-sm text-[#999999]">FPL Points</th>
                  <th className="text-left py-3 px-4 text-sm text-[#999999]">Points</th>
                </tr>
              </thead>
              <tbody>
                {pick.player_picks.map((pp) => (
                  <tr key={pp.id} className="border-b border-[#2a2a2a]">
                    <td className="py-3 px-4 text-white">{pp.player_id}</td>
                    <td className="py-3 px-4 text-white">{pp.fixture_id}</td>
                    <td className="py-3 px-4 text-white">{pp.fpl_points ?? '-'}</td>
                    <td className="py-3 px-4 text-white font-semibold">{pp.points}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setNewPoints('');
        }}
        title="Adjust Points"
      >
        <div className="space-y-4">
          <FormInput
            label="New Total Points"
            type="number"
            value={newPoints}
            onChange={(e) => setNewPoints(e.target.value)}
            placeholder="Enter new points"
            required
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAdjustPoints}
              disabled={adjusting || !newPoints}
              className="flex-1 px-4 py-2 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#555555] disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {adjusting ? 'Adjusting...' : 'Adjust Points'}
            </button>
            <button
              onClick={() => {
                setShowAdjustModal(false);
                setNewPoints('');
              }}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}


'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import FilterBar from '@/components/admin/FilterBar';
import { FormSelect, FormInput } from '@/components/admin/FormInput';
import ActionMenu from '@/components/admin/ActionMenu';
import Modal from '@/components/admin/Modal';

interface WeeklyPick {
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
}

interface WeeklyPicksResponse {
  items: WeeklyPick[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function WeeklyPicksPage() {
  const searchParams = useSearchParams();
  const [picks, setPicks] = useState<WeeklyPick[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [gameweek, setGameweek] = useState<string>('');
  const [userId, setUserId] = useState<string>('');
  const [flagged, setFlagged] = useState<string>('all');
  const [minPoints, setMinPoints] = useState<string>('');
  const [maxPoints, setMaxPoints] = useState<string>('');
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedPick, setSelectedPick] = useState<WeeklyPick | null>(null);
  const [newPoints, setNewPoints] = useState<string>('');
  const [adjusting, setAdjusting] = useState(false);

  const fetchPicks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      
      if (gameweek) params.append('gameweek', gameweek);
      if (userId) params.append('user_id', userId);
      if (flagged !== 'all') params.append('flagged', flagged === 'flagged' ? 'true' : 'false');
      if (minPoints) params.append('min_points', minPoints);
      if (maxPoints) params.append('max_points', maxPoints);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/weekly-picks?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: WeeklyPicksResponse = await response.json();
        setPicks(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching weekly picks:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setGameweek('');
    setUserId('');
    setFlagged('all');
    setMinPoints('');
    setMaxPoints('');
    setPage(1);
  };

  const handleAdjustPoints = async () => {
    if (!selectedPick || !newPoints) return;
    
    setAdjusting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/weekly-picks/${selectedPick.id}/points`,
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
        setShowAdjustModal(false);
        setSelectedPick(null);
        setNewPoints('');
        fetchPicks();
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

  const handleFlag = async (pick: WeeklyPick, flag: boolean) => {
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
        fetchPicks();
      } else {
        alert('Failed to update flag status');
      }
    } catch (error) {
      console.error('Error flagging pick:', error);
      alert('Failed to update flag status');
    }
  };

  const handleDelete = async (pick: WeeklyPick) => {
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
        fetchPicks();
      } else {
        alert('Failed to delete weekly pick');
      }
    } catch (error) {
      console.error('Error deleting pick:', error);
      alert('Failed to delete weekly pick');
    }
  };

  useEffect(() => {
    fetchPicks();
  }, [page, gameweek, userId, flagged, minPoints, maxPoints]);

  const columns = [
    {
      key: 'id' as keyof WeeklyPick,
      label: 'ID',
      sortable: false,
    },
    {
      key: 'username' as keyof WeeklyPick,
      label: 'User',
      sortable: false,
      render: (value: string, row: WeeklyPick) => (
        <div>
          <div className="text-white">{value}</div>
          <div className="text-sm text-[#999999]">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'gameweek' as keyof WeeklyPick,
      label: 'Gameweek',
      sortable: false,
    },
    {
      key: 'total_points' as keyof WeeklyPick,
      label: 'Points',
      sortable: false,
      render: (value: number) => (
        <span className="font-semibold text-white">{value}</span>
      ),
    },
    {
      key: 'rank' as keyof WeeklyPick,
      label: 'Rank',
      sortable: false,
      render: (value: number | null) => (
        value ? <span className="text-white">#{value}</span> : <span className="text-[#999999]">-</span>
      ),
    },
    {
      key: 'flagged' as keyof WeeklyPick,
      label: 'Status',
      sortable: false,
      render: (value: boolean) => (
        value ? (
          <StatusBadge status="flagged" label="Flagged" />
        ) : (
          <StatusBadge status="active" label="Normal" />
        )
      ),
    },
    {
      key: 'created_at' as keyof WeeklyPick,
      label: 'Created',
      sortable: false,
      render: (value: string) => (
        <span className="text-[#999999]">
          {new Date(value).toLocaleDateString()}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Weekly Picks</h1>
        <p className="text-[#999999]">Manage weekly picks submissions</p>
      </div>

      <FilterBar onClear={clearFilters}>
        <FormInput
          label="Gameweek"
          type="number"
          value={gameweek}
          onChange={(e) => {
            setGameweek(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by gameweek"
          className="min-w-[120px]"
        />
        <FormInput
          label="User ID"
          type="number"
          value={userId}
          onChange={(e) => {
            setUserId(e.target.value);
            setPage(1);
          }}
          placeholder="Filter by user ID"
          className="min-w-[120px]"
        />
        <FormSelect
          label="Flagged"
          value={flagged}
          onChange={(e) => {
            setFlagged(e.target.value);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'flagged', label: 'Flagged' },
            { value: 'not_flagged', label: 'Not Flagged' },
          ]}
          className="min-w-[150px]"
        />
        <FormInput
          label="Min Points"
          type="number"
          value={minPoints}
          onChange={(e) => {
            setMinPoints(e.target.value);
            setPage(1);
          }}
          placeholder="Min"
          className="min-w-[100px]"
        />
        <FormInput
          label="Max Points"
          type="number"
          value={maxPoints}
          onChange={(e) => {
            setMaxPoints(e.target.value);
            setPage(1);
          }}
          placeholder="Max"
          className="min-w-[100px]"
        />
      </FilterBar>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <DataTable
          data={picks}
          columns={columns}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          actions={(row) => (
            <div className="flex items-center gap-2">
              <Link
                href={`/admin/weekly-picks/view?id=${row.id}`}
                className="text-[#10b981] hover:text-[#059669] transition"
              >
                View
              </Link>
              <ActionMenu
                items={[
                  {
                    label: 'Adjust Points',
                    onClick: () => {
                      setSelectedPick(row);
                      setNewPoints(row.total_points.toString());
                      setShowAdjustModal(true);
                    },
                  },
                  {
                    label: row.flagged ? 'Unflag' : 'Flag',
                    onClick: () => handleFlag(row, !row.flagged),
                    danger: row.flagged,
                  },
                  {
                    label: 'Delete',
                    onClick: () => handleDelete(row),
                    danger: true,
                  },
                ]}
                trigger={
                  <button className="text-[#999999] hover:text-white transition">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                }
              />
            </div>
          )}
        />
      )}

      <Modal
        isOpen={showAdjustModal}
        onClose={() => {
          setShowAdjustModal(false);
          setSelectedPick(null);
          setNewPoints('');
        }}
        title="Adjust Points"
      >
        <div className="space-y-4">
          {selectedPick && (
            <div className="text-sm text-[#999999]">
              User: {selectedPick.username} | Gameweek: {selectedPick.gameweek} | Current Points: {selectedPick.total_points}
            </div>
          )}
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
                setSelectedPick(null);
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



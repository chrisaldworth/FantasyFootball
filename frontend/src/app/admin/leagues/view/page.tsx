'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import { FormInput } from '@/components/admin/FormInput';
import ActionMenu from '@/components/admin/ActionMenu';
import DataTable from '@/components/admin/DataTable';

interface LeagueMember {
  id: number;
  user_id: number;
  username: string;
  email: string;
  joined_at: string;
}

interface LeagueDetail {
  id: number;
  name: string;
  description: string | null;
  code: string;
  type: string;
  created_by: number;
  creator_username: string;
  creator_email: string;
  created_at: string;
  updated_at: string;
  members: LeagueMember[];
  member_count: number;
}

export default function LeagueDetailPage() {
  const searchParams = useSearchParams();
  const leagueId = searchParams.get('id');
  const [league, setLeague] = useState<LeagueDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberUserId, setNewMemberUserId] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const fetchLeague = async () => {
      if (!leagueId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/leagues/${leagueId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          setLeague(data);
        }
      } catch (error) {
        console.error('Error fetching league:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeague();
  }, [leagueId]);

  const handleAddMember = async () => {
    if (!league || !newMemberUserId) return;
    
    setAdding(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/leagues/${league.id}/members/${newMemberUserId}`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh league data
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/leagues/${league.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setLeague(data);
        }
        setShowAddMemberModal(false);
        setNewMemberUserId('');
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    } finally {
      setAdding(false);
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!league) return;
    
    if (!confirm('Are you sure you want to remove this member from the league?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/leagues/${league.id}/members/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        // Refresh league data
        const refreshResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/leagues/${league.id}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );
        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          setLeague(data);
        }
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to remove member');
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!league || !leagueId) {
    return (
      <div className="text-center py-12">
        <p className="text-[#999999] mb-4">League not found</p>
        <Link href="/admin/leagues" className="text-[#10b981] hover:text-[#059669]">
          Back to Leagues
        </Link>
      </div>
    );
  }

  const memberColumns = [
    {
      key: 'username' as keyof LeagueMember,
      label: 'User',
      sortable: false,
      render: (value: string, row: LeagueMember) => (
        <div>
          <div className="text-white">{value}</div>
          <div className="text-sm text-[#999999]">{row.email}</div>
        </div>
      ),
    },
    {
      key: 'joined_at' as keyof LeagueMember,
      label: 'Joined',
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
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/leagues" className="text-[#999999] hover:text-white mb-2 inline-block">
            ← Back to Leagues
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">League Details</h1>
        </div>
        <button
          onClick={() => {
            setNewMemberUserId('');
            setShowAddMemberModal(true);
          }}
          className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg transition"
        >
          Add Member
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">League Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#999999]">Name</label>
              <p className="text-white font-semibold">{league.name}</p>
            </div>
            {league.description && (
              <div>
                <label className="text-sm text-[#999999]">Description</label>
                <p className="text-white">{league.description}</p>
              </div>
            )}
            <div>
              <label className="text-sm text-[#999999]">Code</label>
              <p className="font-mono text-[#10b981]">{league.code}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Type</label>
              <div className="mt-1">
                <StatusBadge 
                  status={league.type === 'both' ? 'active' : league.type === 'weekly' ? 'premium' : 'inactive'} 
                  label={league.type.charAt(0).toUpperCase() + league.type.slice(1)} 
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Creator</label>
              <p className="text-white">{league.creator_username}</p>
              <p className="text-sm text-[#999999]">{league.creator_email}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Member Count</label>
              <p className="text-2xl font-bold text-white">{league.member_count}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Created At</label>
              <p className="text-white">{new Date(league.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link
              href={`/admin/users/view?id=${league.created_by}`}
              className="block px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition text-center"
            >
              View Creator Profile
            </Link>
            <button
              onClick={() => {
                navigator.clipboard.writeText(league.code);
                alert('League code copied to clipboard!');
              }}
              className="w-full px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition"
            >
              Copy League Code
            </button>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Members ({league.member_count})</h3>
        </div>
        {league.members.length > 0 ? (
          <DataTable
            data={league.members}
            columns={memberColumns}
            actions={(row) => (
              <div className="flex items-center gap-2">
                <Link
                  href={`/admin/users/view?id=${row.user_id}`}
                  className="text-[#10b981] hover:text-[#059669] transition"
                >
                  View User
                </Link>
                <button
                  onClick={() => handleRemoveMember(row.user_id)}
                  className="text-[#ef4444] hover:text-[#dc2626] transition"
                >
                  Remove
                </button>
              </div>
            )}
          />
        ) : (
          <p className="text-[#999999] text-center py-8">No members in this league</p>
        )}
      </div>

      <Modal
        isOpen={showAddMemberModal}
        onClose={() => {
          setShowAddMemberModal(false);
          setNewMemberUserId('');
        }}
        title="Add Member"
      >
        <div className="space-y-4">
          <FormInput
            label="User ID"
            type="number"
            value={newMemberUserId}
            onChange={(e) => setNewMemberUserId(e.target.value)}
            placeholder="Enter user ID to add"
            required
            helperText="Enter the user ID of the user you want to add to this league"
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleAddMember}
              disabled={adding || !newMemberUserId}
              className="flex-1 px-4 py-2 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#555555] disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {adding ? 'Adding...' : 'Add Member'}
            </button>
            <button
              onClick={() => {
                setShowAddMemberModal(false);
                setNewMemberUserId('');
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



'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';
import FilterBar from '@/components/admin/FilterBar';
import { FormSelect, FormInput } from '@/components/admin/FormInput';
import ActionMenu from '@/components/admin/ActionMenu';
import Modal from '@/components/admin/Modal';
import { FormTextarea } from '@/components/admin/FormInput';

interface League {
  id: number;
  name: string;
  description: string | null;
  code: string;
  type: string;
  created_by: number;
  creator_username: string;
  creator_email: string;
  member_count: number;
  created_at: string;
  updated_at: string;
}

interface LeaguesResponse {
  items: League[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function LeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editType, setEditType] = useState('both');
  const [updating, setUpdating] = useState(false);

  const fetchLeagues = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      
      if (search) params.append('search', search);
      if (typeFilter !== 'all') params.append('type', typeFilter);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/leagues?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: LeaguesResponse = await response.json();
        setLeagues(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setPage(1);
  };

  const handleEdit = (league: League) => {
    setSelectedLeague(league);
    setEditName(league.name);
    setEditDescription(league.description || '');
    setEditType(league.type);
    setShowEditModal(true);
  };

  const handleUpdate = async () => {
    if (!selectedLeague) return;
    
    setUpdating(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/leagues/${selectedLeague.id}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: editName,
            description: editDescription || null,
            type: editType,
          }),
        }
      );

      if (response.ok) {
        setShowEditModal(false);
        setSelectedLeague(null);
        fetchLeagues();
      } else {
        const error = await response.json();
        alert(error.detail || 'Failed to update league');
      }
    } catch (error) {
      console.error('Error updating league:', error);
      alert('Failed to update league');
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedLeague) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/leagues/${selectedLeague.id}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setShowDeleteModal(false);
        setSelectedLeague(null);
        fetchLeagues();
      } else {
        alert('Failed to delete league');
      }
    } catch (error) {
      console.error('Error deleting league:', error);
      alert('Failed to delete league');
    }
  };

  useEffect(() => {
    fetchLeagues();
  }, [page, search, typeFilter]);

  const columns = [
    {
      key: 'id' as keyof League,
      label: 'ID',
      sortable: false,
    },
    {
      key: 'name' as keyof League,
      label: 'Name',
      sortable: false,
      render: (value: string, row: League) => (
        <div>
          <div className="text-white font-semibold">{value}</div>
          {row.description && (
            <div className="text-sm text-[#999999]">{row.description}</div>
          )}
        </div>
      ),
    },
    {
      key: 'code' as keyof League,
      label: 'Code',
      sortable: false,
      render: (value: string) => (
        <span className="font-mono text-[#10b981]">{value}</span>
      ),
    },
    {
      key: 'type' as keyof League,
      label: 'Type',
      sortable: false,
      render: (value: string) => (
        <StatusBadge 
          status={value === 'both' ? 'active' : value === 'weekly' ? 'premium' : 'inactive'} 
          label={value.charAt(0).toUpperCase() + value.slice(1)} 
        />
      ),
    },
    {
      key: 'creator_username' as keyof League,
      label: 'Creator',
      sortable: false,
      render: (value: string, row: League) => (
        <div>
          <div className="text-white">{value}</div>
          <div className="text-sm text-[#999999]">{row.creator_email}</div>
        </div>
      ),
    },
    {
      key: 'member_count' as keyof League,
      label: 'Members',
      sortable: false,
      render: (value: number) => (
        <span className="text-white font-semibold">{value}</span>
      ),
    },
    {
      key: 'created_at' as keyof League,
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
        <h1 className="text-3xl font-bold text-white mb-2">Leagues</h1>
        <p className="text-[#999999]">Manage weekly picks leagues</p>
      </div>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Search leagues by name or code..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#10b981]"
        />

        <FilterBar onClear={clearFilters}>
          <FormSelect
            label="Type"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Types' },
              { value: 'weekly', label: 'Weekly' },
              { value: 'seasonal', label: 'Seasonal' },
              { value: 'both', label: 'Both' },
            ]}
            className="min-w-[150px]"
          />
        </FilterBar>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <DataTable
          data={leagues}
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
                href={`/admin/leagues/view?id=${row.id}`}
                className="text-[#10b981] hover:text-[#059669] transition"
              >
                View
              </Link>
              <ActionMenu
                items={[
                  {
                    label: 'Edit',
                    onClick: () => handleEdit(row),
                  },
                  {
                    label: 'Delete',
                    onClick: () => {
                      setSelectedLeague(row);
                      setShowDeleteModal(true);
                    },
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
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedLeague(null);
        }}
        title="Edit League"
      >
        <div className="space-y-4">
          <FormInput
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            placeholder="League name"
            required
          />
          <FormTextarea
            label="Description"
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="League description (optional)"
          />
          <FormSelect
            label="Type"
            value={editType}
            onChange={(e) => setEditType(e.target.value)}
            options={[
              { value: 'weekly', label: 'Weekly' },
              { value: 'seasonal', label: 'Seasonal' },
              { value: 'both', label: 'Both' },
            ]}
            required
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleUpdate}
              disabled={updating || !editName}
              className="flex-1 px-4 py-2 bg-[#10b981] hover:bg-[#059669] disabled:bg-[#555555] disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {updating ? 'Updating...' : 'Update League'}
            </button>
            <button
              onClick={() => {
                setShowEditModal(false);
                setSelectedLeague(null);
              }}
              className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedLeague(null);
        }}
        title="Delete League"
      >
        <div className="space-y-4">
          {selectedLeague && (
            <p className="text-white">
              Are you sure you want to delete the league <strong>"{selectedLeague.name}"</strong>?
              This will remove all memberships and cannot be undone.
            </p>
          )}
          <div className="flex gap-3 pt-4">
            <button
              onClick={handleDelete}
              className="flex-1 px-4 py-2 bg-[#ef4444] hover:bg-[#dc2626] text-white rounded-lg transition"
            >
              Delete League
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSelectedLeague(null);
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



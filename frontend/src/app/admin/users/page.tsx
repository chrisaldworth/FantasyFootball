'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import DataTable from '@/components/admin/DataTable';
import StatusBadge from '@/components/admin/StatusBadge';

interface User {
  id: number;
  email: string;
  username: string;
  is_active: boolean;
  is_premium: boolean;
  role: string | null;
  created_at: string;
}

interface UsersResponse {
  items: User[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams({
        page: page.toString(),
        page_size: pageSize.toString(),
      });
      
      if (search) {
        params.append('search', search);
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users?${params}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data: UsersResponse = await response.json();
        setUsers(data.items);
        setTotal(data.total);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const columns = [
    {
      key: 'id' as keyof User,
      label: 'ID',
      sortable: false,
    },
    {
      key: 'username' as keyof User,
      label: 'Username',
      sortable: false,
    },
    {
      key: 'email' as keyof User,
      label: 'Email',
      sortable: false,
    },
    {
      key: 'role' as keyof User,
      label: 'Role',
      sortable: false,
      render: (value: string | null) => (
        <StatusBadge status={value || 'user'} label={value || 'user'} />
      ),
    },
    {
      key: 'is_active' as keyof User,
      label: 'Status',
      sortable: false,
      render: (value: boolean) => (
        <StatusBadge status={value ? 'active' : 'inactive'} />
      ),
    },
    {
      key: 'is_premium' as keyof User,
      label: 'Premium',
      sortable: false,
      render: (value: boolean) => (
        value ? <StatusBadge status="premium" /> : <span className="text-[#999999]">-</span>
      ),
    },
    {
      key: 'created_at' as keyof User,
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Users</h1>
          <p className="text-[#999999]">Manage platform users</p>
        </div>
        <Link
          href="/admin/users/create"
          className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg transition"
        >
          Create User
        </Link>
      </div>

      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="flex-1 px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#10b981]"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      ) : (
        <DataTable
          data={users}
          columns={columns}
          pagination={{
            page,
            pageSize,
            total,
            onPageChange: setPage,
          }}
          actions={(row) => (
            <Link
              href={`/admin/users/${row.id}`}
              className="text-[#10b981] hover:text-[#059669] transition"
            >
              View
            </Link>
          )}
        />
      )}
    </div>
  );
}


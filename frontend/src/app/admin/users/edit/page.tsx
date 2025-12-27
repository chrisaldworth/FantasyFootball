'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';

interface User {
  id: number;
  email: string;
  username: string;
  fpl_team_id: number | null;
  favorite_team_id: number | null;
  is_active: boolean;
  is_premium: boolean;
  role: string | null;
  created_at: string;
}

export default function EditUserPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    fpl_team_id: '',
    favorite_team_id: '',
    is_active: true,
    is_premium: false,
    role: 'user',
  });

  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users/${userId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        if (response.ok) {
          const data: User = await response.json();
          setUser(data);
          setFormData({
            email: data.email,
            username: data.username,
            fpl_team_id: data.fpl_team_id?.toString() || '',
            favorite_team_id: data.favorite_team_id?.toString() || '',
            is_active: data.is_active,
            is_premium: data.is_premium,
            role: data.role || 'user',
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchUser();
    }
  }, [userId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    
    setError('');
    setSaving(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users/${userId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            fpl_team_id: formData.fpl_team_id ? parseInt(formData.fpl_team_id) : null,
            favorite_team_id: formData.favorite_team_id ? parseInt(formData.favorite_team_id) : null,
          }),
        }
      );

      if (response.ok) {
        // Update role separately if changed
        if (formData.role !== user?.role) {
          const roleResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users/${userId}/role?role=${formData.role}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          if (!roleResponse.ok) {
            throw new Error('Failed to update role');
          }
        }

        // Update status separately if changed
        if (formData.is_active !== user?.is_active) {
          const statusResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users/${userId}/status?is_active=${formData.is_active}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          if (!statusResponse.ok) {
            throw new Error('Failed to update status');
          }
        }

        // Update premium status separately if changed
        if (formData.is_premium !== user?.is_premium) {
          const premiumResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users/${userId}/premium?is_premium=${formData.is_premium}`,
            {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${token}`,
              },
            }
          );
          if (!premiumResponse.ok) {
            throw new Error('Failed to update premium status');
          }
        }

        router.push(`/admin/users/view?id=${userId}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to update user');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to update user');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  if (!user || !userId) {
    return (
      <div className="text-center py-12">
        <p className="text-[#999999] mb-4">User not found</p>
        <Link href="/admin/users" className="text-[#10b981] hover:text-[#059669]">
          Back to Users
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/users/view?id=${userId}`} className="text-[#999999] hover:text-white mb-2 inline-block">
          ← Back to User Details
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Edit User</h1>
      </div>

      <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a] max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#10b981]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">
              Username *
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#10b981]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">
              FPL Team ID
            </label>
            <input
              type="number"
              value={formData.fpl_team_id}
              onChange={(e) => setFormData({ ...formData, fpl_team_id: e.target.value })}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#10b981]"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">
              Favorite Team ID
            </label>
            <input
              type="number"
              value={formData.favorite_team_id}
              onChange={(e) => setFormData({ ...formData, favorite_team_id: e.target.value })}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#10b981]"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">
              Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:border-[#10b981]"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="super_admin">Super Admin</option>
            </select>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#10b981] focus:ring-[#10b981]"
              />
              <span className="text-sm text-[#999999]">Active</span>
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={formData.is_premium}
                onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                className="w-4 h-4 rounded border-[#2a2a2a] bg-[#0a0a0a] text-[#10b981] focus:ring-[#10b981]"
              />
              <span className="text-sm text-[#999999]">Premium</span>
            </label>
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link
              href={`/admin/users/view?id=${userId}`}
              className="px-6 py-2 bg-[#2a2a2a] hover:bg-[#3a3a3a] text-white rounded-lg transition"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}


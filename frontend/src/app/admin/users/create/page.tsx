'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CreateUserPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    fpl_team_id: '',
    role: 'user',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            email: formData.email,
            username: formData.username,
            password: formData.password,
            fpl_team_id: formData.fpl_team_id ? parseInt(formData.fpl_team_id) : undefined,
          }),
        }
      );

      if (response.ok) {
        const user = await response.json();
        router.push(`/admin/users/${user.id}`);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create user');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/users" className="text-[#999999] hover:text-white mb-2 inline-block">
          ← Back to Users
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Create User</h1>
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
              placeholder="user@example.com"
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
              placeholder="username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#999999] mb-2">
              Password *
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white placeholder-[#666666] focus:outline-none focus:border-[#10b981]"
              placeholder="••••••••"
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

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-[#10b981] hover:bg-[#059669] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {loading ? 'Creating...' : 'Create User'}
            </button>
            <Link
              href="/admin/users"
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


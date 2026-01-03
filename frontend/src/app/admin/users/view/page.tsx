'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/components/admin/StatusBadge';
import Modal from '@/components/admin/Modal';
import { FormInput } from '@/components/admin/FormInput';

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

export default function UserDetailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('id');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [resetting, setResetting] = useState(false);

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
          const data = await response.json();
          setUser(data);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId]);

  const handlePasswordReset = async () => {
    setPasswordError('');
    
    if (!newPassword || !confirmPassword) {
      setPasswordError('Please fill in all fields');
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    setResetting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/users/${userId}/reset-password`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ new_password: newPassword }),
        }
      );
      
      if (response.ok) {
        setShowPasswordReset(false);
        setNewPassword('');
        setConfirmPassword('');
        setPasswordError('');
        alert('Password reset successfully');
      } else {
        const error = await response.json();
        setPasswordError(error.detail || 'Failed to reset password');
      }
    } catch (error) {
      console.error('Error resetting password:', error);
      setPasswordError('Failed to reset password');
    } finally {
      setResetting(false);
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
      <div className="flex items-center justify-between">
        <div>
          <Link href="/admin/users" className="text-[#999999] hover:text-white mb-2 inline-block">
            ← Back to Users
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">User Details</h1>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowPasswordReset(true)}
            className="px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] text-white rounded-lg transition"
          >
            Reset Password
          </button>
          <Link
            href={`/admin/users/edit?id=${userId}`}
            className="px-4 py-2 bg-[#10b981] hover:bg-[#059669] text-white rounded-lg transition"
          >
            Edit User
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#999999]">ID</label>
              <p className="text-white">{user.id}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Username</label>
              <p className="text-white">{user.username}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Email</label>
              <p className="text-white">{user.email}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Role</label>
              <div className="mt-1">
                <StatusBadge status={user?.role || 'user'} label={user?.role || 'user'} />
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">Status & Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-[#999999]">Status</label>
              <div className="mt-1">
                <StatusBadge status={user.is_active ? 'active' : 'inactive'} />
              </div>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Premium</label>
              <div className="mt-1">
                {user.is_premium ? (
                  <StatusBadge status="premium" />
                ) : (
                  <span className="text-[#999999]">No</span>
                )}
              </div>
            </div>
            <div>
              <label className="text-sm text-[#999999]">FPL Team ID</label>
              <p className="text-white">{user.fpl_team_id || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Favorite Team ID</label>
              <p className="text-white">{user.favorite_team_id || 'Not set'}</p>
            </div>
            <div>
              <label className="text-sm text-[#999999]">Created At</label>
              <p className="text-white">{new Date(user.created_at).toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showPasswordReset}
        onClose={() => {
          setShowPasswordReset(false);
          setNewPassword('');
          setConfirmPassword('');
          setPasswordError('');
        }}
        title="Reset Password"
      >
        <div className="space-y-4">
          <FormInput
            label="New Password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Enter new password"
            required
            error={passwordError}
            helperText="Password must be at least 8 characters"
          />
          <FormInput
            label="Confirm Password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            required
          />
          <div className="flex gap-3 pt-4">
            <button
              onClick={handlePasswordReset}
              disabled={resetting}
              className="flex-1 px-4 py-2 bg-[#f59e0b] hover:bg-[#d97706] disabled:bg-[#555555] disabled:cursor-not-allowed text-white rounded-lg transition"
            >
              {resetting ? 'Resetting...' : 'Reset Password'}
            </button>
            <button
              onClick={() => {
                setShowPasswordReset(false);
                setNewPassword('');
                setConfirmPassword('');
                setPasswordError('');
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


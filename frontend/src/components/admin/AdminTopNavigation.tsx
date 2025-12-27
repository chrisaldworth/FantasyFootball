'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';

export default function AdminTopNavigation() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-[#1a1a1a] border-b border-[#2a2a2a] px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="text-xl font-bold text-white">
            Admin Portal
          </Link>
          <div className="flex items-center gap-6">
            <Link href="/admin" className="text-[#999999] hover:text-white transition">
              Dashboard
            </Link>
            <Link href="/admin/users" className="text-[#999999] hover:text-white transition">
              Users
            </Link>
            <Link href="/admin/analytics" className="text-[#999999] hover:text-white transition">
              Analytics
            </Link>
            <Link href="/admin/users" className="text-[#999999] hover:text-white transition">
              Users
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[#999999]">{user?.username || 'Admin'}</span>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-[#2a2a2a] hover:bg-[#3a3a3a] rounded-lg transition"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}


'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="fixed left-0 top-16 h-[calc(100vh-4rem)] w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] p-6 overflow-y-auto">
      <div className="space-y-6">
        <div>
          <h3 className="text-xs font-semibold text-[#666666] uppercase mb-3">Quick Links</h3>
          <nav className="space-y-2">
            <Link
              href="/admin"
              className={`block px-4 py-2 rounded-lg transition ${
                isActive('/admin') && pathname === '/admin'
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-[#999999] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              Dashboard
            </Link>
            <Link
              href="/admin/users"
              className={`block px-4 py-2 rounded-lg transition ${
                isActive('/admin/users')
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-[#999999] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              Users
            </Link>
            <Link
              href="/admin/analytics"
              className={`block px-4 py-2 rounded-lg transition ${
                isActive('/admin/analytics')
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-[#999999] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              Analytics
            </Link>
            <Link
              href="/admin/weekly-picks"
              className={`block px-4 py-2 rounded-lg transition ${
                isActive('/admin/weekly-picks')
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-[#999999] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              Weekly Picks
            </Link>
            <Link
              href="/admin/leagues"
              className={`block px-4 py-2 rounded-lg transition ${
                isActive('/admin/leagues')
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-[#999999] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              Leagues
            </Link>
            <Link
              href="/admin/audit"
              className={`block px-4 py-2 rounded-lg transition ${
                isActive('/admin/audit')
                  ? 'bg-[#2a2a2a] text-white'
                  : 'text-[#999999] hover:bg-[#2a2a2a] hover:text-white'
              }`}
            >
              Audit Log
            </Link>
          </nav>
        </div>

        <div>
          <h3 className="text-xs font-semibold text-[#666666] uppercase mb-3">System</h3>
          <div className="space-y-2">
            <div className="px-4 py-2 text-sm text-[#999999]">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>System Online</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}


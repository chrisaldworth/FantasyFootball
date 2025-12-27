'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import AdminTopNavigation from '@/components/admin/AdminTopNavigation';
import AdminSidebar from '@/components/admin/AdminSidebar';


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        console.log('[Admin] No user found, redirecting to home');
        router.push('/');
      } else if (!['admin', 'super_admin'].includes(user.role || '')) {
        console.log('[Admin] User role is not admin:', user.role);
        console.log('[Admin] User data:', { id: user.id, email: user.email, role: user.role });
        router.push('/');
      } else {
        console.log('[Admin] Access granted, role:', user.role);
      }
    }
  }, [user, loading, router]);

  if (loading || !user || !['admin', 'super_admin'].includes(user.role || '')) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <AdminTopNavigation />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 ml-64 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}


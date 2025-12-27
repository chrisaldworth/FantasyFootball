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
      console.log('[Admin Layout] Auth state:', { 
        hasUser: !!user, 
        userRole: user?.role, 
        userEmail: user?.email,
        userId: user?.id,
        loading 
      });
      
      if (!user) {
        console.log('[Admin] No user found, redirecting to home');
        router.push('/');
        return;
      }
      
      const userRole = user.role || null;
      console.log('[Admin] Checking role:', { 
        role: userRole, 
        type: typeof userRole,
        isAdmin: ['admin', 'super_admin'].includes(userRole || ''),
        fullUser: JSON.stringify(user, null, 2)
      });
      
      if (!['admin', 'super_admin'].includes(userRole || '')) {
        console.error('[Admin] Access denied - User role is not admin:', userRole);
        console.error('[Admin] Full user object:', user);
        router.push('/');
        return;
      }
      
      console.log('[Admin] ✅ Access granted, role:', userRole);
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


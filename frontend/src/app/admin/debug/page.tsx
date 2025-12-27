'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';

export default function AdminDebugPage() {
  const { user, loading, token } = useAuth();
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const response = await fetch(`${apiUrl}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setApiResponse(data);
        } else {
          setApiError(`API Error: ${response.status} ${response.statusText}`);
        }
      } catch (error: any) {
        setApiError(`Fetch Error: ${error.message}`);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-8">
      <h1 className="text-3xl font-bold mb-6">Admin Debug Page</h1>
      
      <div className="space-y-6">
        <div className="glass rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold mb-4">Auth Context State</h2>
          <div className="space-y-2">
            <p><strong>Loading:</strong> {loading ? 'true' : 'false'}</p>
            <p><strong>Has Token:</strong> {token ? 'yes' : 'no'}</p>
            <p><strong>Has User:</strong> {user ? 'yes' : 'no'}</p>
            {user && (
              <div className="mt-4">
                <p><strong>User ID:</strong> {user.id}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Username:</strong> {user.username}</p>
                <p><strong>Role:</strong> <span className={user.role === 'admin' || user.role === 'super_admin' ? 'text-green-500' : 'text-red-500'}>{user.role || 'null/undefined'}</span></p>
                <p><strong>Role Type:</strong> {typeof user.role}</p>
                <p><strong>Is Active:</strong> {user.is_active ? 'true' : 'false'}</p>
                <p><strong>Is Premium:</strong> {user.is_premium ? 'true' : 'false'}</p>
              </div>
            )}
          </div>
        </div>

        <div className="glass rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold mb-4">Raw User Object (JSON)</h2>
          <pre className="bg-[#0a0a0a] p-4 rounded overflow-auto text-sm">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>

        <div className="glass rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold mb-4">API Response (/api/auth/me)</h2>
          {apiError ? (
            <p className="text-red-500">{apiError}</p>
          ) : apiResponse ? (
            <div>
              <p className="mb-2"><strong>Role from API:</strong> <span className={apiResponse.role === 'admin' || apiResponse.role === 'super_admin' ? 'text-green-500' : 'text-red-500'}>{apiResponse.role || 'null/undefined'}</span></p>
              <pre className="bg-[#0a0a0a] p-4 rounded overflow-auto text-sm mt-4">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            </div>
          ) : (
            <p>Loading API response...</p>
          )}
        </div>

        <div className="glass rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold mb-4">Environment</h2>
          <div className="space-y-2">
            <p><strong>API URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}</p>
            <p><strong>Token Length:</strong> {token?.length || 0}</p>
          </div>
        </div>

        <div className="glass rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h2 className="text-xl font-semibold mb-4">Role Check</h2>
          <div className="space-y-2">
            <p><strong>User Role:</strong> {user?.role || 'null/undefined'}</p>
            <p><strong>Is Admin:</strong> {['admin', 'super_admin'].includes(user?.role || '') ? <span className="text-green-500">✅ YES</span> : <span className="text-red-500">❌ NO</span>}</p>
            <p><strong>Role Check Logic:</strong></p>
            <pre className="bg-[#0a0a0a] p-4 rounded overflow-auto text-sm mt-2">
{`['admin', 'super_admin'].includes(user?.role || '')
Result: ${['admin', 'super_admin'].includes(user?.role || '')}`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}


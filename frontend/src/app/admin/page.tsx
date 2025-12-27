'use client';

import { useEffect, useState } from 'react';
import MetricCard from '@/components/admin/MetricCard';

interface OverviewMetrics {
  total_users: number;
  active_users: number;
  new_users_today: number;
  premium_users: number;
  admin_users: number;
  inactive_users: number;
}

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<OverviewMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/admin/analytics/overview`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error('Error fetching metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-[#999999]">Overview of platform metrics and activity</p>
      </div>

      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label="Total Users"
              value={metrics.total_users.toLocaleString()}
            />
            <MetricCard
              label="Active Users"
              value={metrics.active_users.toLocaleString()}
            />
            <MetricCard
              label="New Today"
              value={metrics.new_users_today}
              trend={metrics.new_users_today > 0 ? 'up' : 'neutral'}
              trendValue={metrics.new_users_today > 0 ? `${metrics.new_users_today} new` : 'No new users'}
            />
            <MetricCard
              label="Premium Users"
              value={metrics.premium_users.toLocaleString()}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white mb-4">User Status</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#999999]">Active</span>
                  <span className="text-white font-semibold">{metrics.active_users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#999999]">Inactive</span>
                  <span className="text-white font-semibold">{metrics.inactive_users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#999999]">Premium</span>
                  <span className="text-white font-semibold">{metrics.premium_users}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#999999]">Admins</span>
                  <span className="text-white font-semibold">{metrics.admin_users}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
              <h3 className="text-lg font-semibold text-white mb-4">System Health</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#999999]">Database</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white">Healthy</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#999999]">API</span>
                  <span className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-white">Online</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


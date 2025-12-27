'use client';

import { useEffect, useState } from 'react';
import MetricCard from '@/components/admin/MetricCard';

interface UserAnalytics {
  period_days: number;
  user_growth: Array<{ date: string; count: number }>;
}

interface EngagementAnalytics {
  fpl_linked_users: number;
  fpl_linked_percentage: number;
  favorite_team_set: number;
  favorite_team_percentage: number;
  total_users: number;
}

export default function AnalyticsPage() {
  const [userAnalytics, setUserAnalytics] = useState<UserAnalytics | null>(null);
  const [engagement, setEngagement] = useState<EngagementAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const [userRes, engagementRes] = await Promise.all([
          fetch(`${baseUrl}/api/admin/analytics/users?days=30`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
          fetch(`${baseUrl}/api/admin/analytics/engagement`, {
            headers: { 'Authorization': `Bearer ${token}` },
          }),
        ]);

        if (userRes.ok) {
          const userData = await userRes.json();
          setUserAnalytics(userData);
        }

        if (engagementRes.ok) {
          const engagementData = await engagementRes.json();
          setEngagement(engagementData);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
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
        <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
        <p className="text-[#999999]">Platform analytics and insights</p>
      </div>

      {engagement && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="FPL Linked Users"
            value={engagement.fpl_linked_users.toLocaleString()}
            trendValue={`${engagement.fpl_linked_percentage.toFixed(1)}%`}
          />
          <MetricCard
            label="Favorite Team Set"
            value={engagement.favorite_team_set.toLocaleString()}
            trendValue={`${engagement.favorite_team_percentage.toFixed(1)}%`}
          />
        </div>
      )}

      {userAnalytics && (
        <div className="rounded-xl p-6 bg-[#1a1a1a] border border-[#2a2a2a]">
          <h3 className="text-lg font-semibold text-white mb-4">User Growth (Last {userAnalytics.period_days} days)</h3>
          <div className="space-y-2">
            {userAnalytics.user_growth.length > 0 ? (
              userAnalytics.user_growth.map((day) => (
                <div key={day.date} className="flex items-center justify-between py-2 border-b border-[#2a2a2a]">
                  <span className="text-[#999999]">{new Date(day.date).toLocaleDateString()}</span>
                  <span className="text-white font-semibold">{day.count} users</span>
                </div>
              ))
            ) : (
              <p className="text-[#999999]">No user growth data available</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


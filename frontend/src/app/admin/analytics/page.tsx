'use client';

import { useEffect, useState } from 'react';
import MetricCard from '@/components/admin/MetricCard';
import ChartComponent from '@/components/admin/ChartComponent';

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
  const [days, setDays] = useState(30);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem('token');
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

        const [userRes, engagementRes] = await Promise.all([
          fetch(`${baseUrl}/api/admin/analytics/users?days=${days}`, {
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
  }, [days]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    );
  }

  // Format user growth data for chart
  const userGrowthChartData = userAnalytics?.user_growth.map((day) => ({
    date: new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    users: day.count,
  })) || [];

  // Engagement pie chart data
  const engagementChartData = engagement
    ? [
        {
          name: 'FPL Linked',
          value: engagement.fpl_linked_users,
          percentage: engagement.fpl_linked_percentage,
        },
        {
          name: 'Not Linked',
          value: engagement.total_users - engagement.fpl_linked_users,
          percentage: 100 - engagement.fpl_linked_percentage,
        },
      ]
    : [];

  const favoriteTeamChartData = engagement
    ? [
        {
          name: 'Team Set',
          value: engagement.favorite_team_set,
          percentage: engagement.favorite_team_percentage,
        },
        {
          name: 'Not Set',
          value: engagement.total_users - engagement.favorite_team_set,
          percentage: 100 - engagement.favorite_team_percentage,
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics</h1>
          <p className="text-[#999999]">Platform analytics and insights</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[#999999]">Period:</label>
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-4 py-2 bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#10b981]"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>
      </div>

      {engagement && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            label="Total Users"
            value={engagement.total_users.toLocaleString()}
          />
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
          <MetricCard
            label="FPL Linked %"
            value={`${engagement.fpl_linked_percentage.toFixed(1)}%`}
            trend={engagement.fpl_linked_percentage > 50 ? 'up' : 'neutral'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {userGrowthChartData.length > 0 && (
          <ChartComponent
            type="line"
            data={userGrowthChartData}
            dataKey="users"
            nameKey="date"
            title={`User Growth (Last ${days} days)`}
            height={300}
            xAxisLabel="Date"
            yAxisLabel="Users"
            showLegend={false}
          />
        )}

        {engagementChartData.length > 0 && (
          <ChartComponent
            type="pie"
            data={engagementChartData}
            dataKey="value"
            nameKey="name"
            title="FPL Account Linking"
            height={300}
          />
        )}
      </div>

      {favoriteTeamChartData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartComponent
            type="pie"
            data={favoriteTeamChartData}
            dataKey="value"
            nameKey="name"
            title="Favorite Team Setup"
            height={300}
          />
        </div>
      )}
    </div>
  );
}


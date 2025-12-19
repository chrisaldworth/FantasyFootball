'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { fplApi } from '@/lib/api';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import SideNavigation from '@/components/navigation/SideNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';

interface FPLHistory {
  current: Array<{
    event: number;
    points: number;
    total_points: number;
    overall_rank: number;
  }>;
  chips: Array<{
    name: string;
    event: number;
  }>;
}

interface BootstrapData {
  events: Array<{ id: number }>;
}

function AnalyticsContent() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<FPLHistory | null>(null);
  const [bootstrap, setBootstrap] = useState<BootstrapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user?.fpl_team_id) {
      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [historyData, bootstrapData] = await Promise.all([
        fplApi.getMyHistory(),
        fplApi.getBootstrap(),
      ]);

      setHistory(historyData);
      setBootstrap(bootstrapData);
    } catch (err: any) {
      setError('Failed to load analytics data');
      console.error('Failed to fetch analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user?.fpl_team_id) {
    return (
      <div className="min-h-screen bg-[var(--pl-dark)]">
        <SideNavigation />
        <BottomNavigation />
        <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto">
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h2 className="text-2xl font-bold mb-4">Analytics</h2>
              <p className="text-[var(--pl-text-muted)] mb-6">
                Link your FPL team to view analytics
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--pl-dark)]">
      <SideNavigation />
      <BottomNavigation />
      <main className="pt-20 sm:pt-24 lg:pt-32 lg:pl-60 pb-20 lg:pb-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)]"
              aria-label="Back to dashboard"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Analytics</h1>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)]">
              {error}
            </div>
          )}

          {history && bootstrap ? (
            <AnalyticsDashboard
              history={history}
              totalGameweeks={bootstrap.events?.length || 38}
            />
          ) : (
            <div className="glass rounded-xl p-8 text-center">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold mb-2">No Analytics Data</h3>
              <p className="text-[var(--pl-text-muted)]">
                Complete a gameweek to see your analytics
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function AnalyticsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[var(--pl-dark)] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <AnalyticsContent />
    </Suspense>
  );
}


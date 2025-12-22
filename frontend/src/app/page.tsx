'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TeamSelection from '@/components/TeamSelection';
import TopNavigation from '@/components/navigation/TopNavigation';
import Logo from '@/components/Logo';
import FeatureCard from '@/components/home/FeatureCard';
import QuickActionsBar from '@/components/home/QuickActionsBar';
import DashboardHeader from '@/components/home/DashboardHeader';
import StatsCard from '@/components/home/StatsCard';
import StickyCTA from '@/components/home/StickyCTA';
import PersonalizedNewsFeed from '@/components/news/PersonalizedNewsFeed';
import QuickRecommendations from '@/components/dashboard/QuickRecommendations';
import { fplApi } from '@/lib/api';

// Loading spinner component
function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--pl-green)]"></div>
    </div>
  );
}

// Logged-Out Home Page
function LoggedOutHomePage() {
  const features = [
    {
      icon: '🤖',
      title: 'AI Transfer Assistant',
      description: 'Get personalized transfer recommendations based on form, fixtures, and value.',
      color: 'var(--pl-green)',
      href: '/fantasy-football/transfers',
    },
    {
      icon: '👑',
      title: 'Captaincy Optimizer',
      description: 'Never miss a captaincy pick with our xG-based predictions.',
      color: 'var(--pl-pink)',
      href: '/fantasy-football/captain',
    },
    {
      icon: '📊',
      title: 'Team Rating',
      description: 'See how your squad scores against the ideal team structure.',
      color: 'var(--pl-cyan)',
      href: '/fantasy-football/analytics',
    },
    {
      icon: '📅',
      title: 'Fixture Planner',
      description: 'Visual fixture difficulty ratings for the next 8 gameweeks.',
      color: 'var(--pl-green)',
      href: '/fantasy-football/fixtures',
    },
    {
      icon: '💰',
      title: 'Price Predictions',
      description: 'Stay ahead of price changes with our prediction model.',
      color: 'var(--pl-pink)',
      href: '/fantasy-football/transfers',
    },
    {
      icon: '🏆',
      title: 'Mini-League Insights',
      description: 'Analyze your rivals and find your competitive edge.',
      color: 'var(--pl-cyan)',
      href: '/fantasy-football/leagues',
    },
  ];

  return (
    <div className="min-h-screen">
      <TopNavigation
        showFavoriteTeam={false}
        showNotifications={false}
        showLinkFPL={false}
      />

      {/* Hero Section */}
      <section className="pt-20 sm:pt-24 lg:pt-16 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            <div className="inline-block px-4 py-2 rounded-full border border-[var(--pl-green)] text-[var(--pl-green)] text-sm font-medium">
              🚀 Season 2024/25 Ready
            </div>
            
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
              Your Complete
              <span className="text-gradient-primary block">Football Companion</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-[var(--pl-text-muted)] max-w-2xl mx-auto">
              Follow your favorite team, track fixtures, get the latest news, and dominate your Fantasy Premier League. 
              Everything you need in one place.
            </p>
            
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="btn-primary text-lg px-8 py-4">
                Start Free Trial
              </Link>
              <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                Learn More
              </Link>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4">
              <StatsCard value="50K+" label="Active Managers" />
              <StatsCard value="85%" label="Accuracy Rate" />
              <StatsCard value="4.9★" label="User Rating" />
            </div>
          </div>
        </div>
      </section>

      {/* Feature Showcase */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-[var(--pl-text-muted)] text-base sm:text-lg max-w-2xl mx-auto">
              Everything you need to make informed FPL decisions, all in one place.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                href={feature.href}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section id="final-cta" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Climb the Rankings?</h2>
              <p className="text-lg sm:text-xl text-[var(--pl-text-muted)] mb-8 max-w-2xl mx-auto">
                Join thousands of FPL managers using AI-powered insights to make smarter decisions.
              </p>
              <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-block">
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky CTA (Mobile Only) */}
      <StickyCTA hideAtSelector="#final-cta" />

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo
            variant="full"
            color="full"
            size={100}
            href="/"
            className="flex items-center"
          />
          <div className="text-[var(--pl-text-muted)] text-sm">
            © 2024 Fotmate. Not affiliated with the Premier League.
          </div>
        </div>
      </footer>
    </div>
  );
}

// Logged-In Dashboard
function LoggedInDashboard({ user }: { user: any }) {
  const [fplData, setFplData] = useState<{
    rank?: number;
    points?: number;
    gameweek?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFPLData = async () => {
      if (!user.fpl_team_id) {
        setLoading(false);
        return;
      }

      try {
        const [history, bootstrap] = await Promise.all([
          fplApi.getMyHistory(),
          fplApi.getBootstrap(),
        ]);

        const currentGameweek = bootstrap?.events?.find((e: any) => e.is_current)?.id || null;
        const overallRank = history?.current?.[0]?.overall_rank || history?.summary_overall_rank || null;
        const overallPoints = history?.current?.[0]?.total_points || history?.summary_overall_points || null;

        setFplData({
          rank: overallRank,
          points: overallPoints,
          gameweek: currentGameweek,
        });
      } catch (error) {
        console.error('Error fetching FPL data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFPLData();
  }, [user.fpl_team_id]);

  const userName = user.username || user.email?.split('@')[0] || 'User';

  return (
    <div className="min-h-screen">
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {/* Personalized Header */}
        <div className="mb-6 sm:mb-8">
          <DashboardHeader
            userName={userName}
            rank={fplData?.rank}
            points={fplData?.points}
            gameweek={fplData?.gameweek}
          />
        </div>

        {/* Quick Actions Bar */}
        <div className="mb-6 sm:mb-8">
          <QuickActionsBar />
        </div>

        {/* Personalized Insights */}
        {user.fpl_team_id && (
          <div className="mb-6 sm:mb-8">
            <QuickRecommendations />
          </div>
        )}

        {/* News Feed */}
        <div className="mb-6 sm:mb-8">
          <div className="glass rounded-xl p-4 sm:p-6">
            <h3 className="text-xl sm:text-2xl font-bold mb-4">Personalized News</h3>
            <PersonalizedNewsFeed />
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="mb-6 sm:mb-8">
          <h3 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6">Explore Features</h3>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                icon: '🤖',
                title: 'AI Transfer Assistant',
                description: 'Get personalized transfer recommendations based on form, fixtures, and value.',
                color: 'var(--pl-green)',
                href: '/fantasy-football/transfers',
              },
              {
                icon: '👑',
                title: 'Captaincy Optimizer',
                description: 'Never miss a captaincy pick with our xG-based predictions.',
                color: 'var(--pl-pink)',
                href: '/fantasy-football/captain',
              },
              {
                icon: '📊',
                title: 'Team Rating',
                description: 'See how your squad scores against the ideal team structure.',
                color: 'var(--pl-cyan)',
                href: '/fantasy-football/analytics',
              },
              {
                icon: '📅',
                title: 'Fixture Planner',
                description: 'Visual fixture difficulty ratings for the next 8 gameweeks.',
                color: 'var(--pl-green)',
                href: '/fantasy-football/fixtures',
              },
              {
                icon: '💰',
                title: 'Price Predictions',
                description: 'Stay ahead of price changes with our prediction model.',
                color: 'var(--pl-pink)',
                href: '/fantasy-football/transfers',
              },
              {
                icon: '🏆',
                title: 'Mini-League Insights',
                description: 'Analyze your rivals and find your competitive edge.',
                color: 'var(--pl-cyan)',
                href: '/fantasy-football/leagues',
              },
            ].map((feature) => (
              <FeatureCard
                key={feature.title}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                color={feature.color}
                href={feature.href}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Home Component
export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showTeamSelection, setShowTeamSelection] = useState(false);

  useEffect(() => {
    // If user is logged in, redirect to dashboard
    if (user && user.favorite_team_id) {
      router.push('/dashboard');
      return;
    }
    
    // If user is logged in but hasn't selected a favorite team, show selection
    if (user && !user.favorite_team_id) {
      setShowTeamSelection(true);
    }
  }, [user, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Team Selection Section - Show if user logged in but no favorite team
  if (user && !user.favorite_team_id) {
    return (
      <div className="min-h-screen">
        <TopNavigation
          showFavoriteTeam={false}
          showNotifications={false}
          showLinkFPL={false}
        />
        <section className="pt-20 sm:pt-24 lg:pt-16 pb-8 sm:pb-12 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto">
            <div className="glass rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8">
              <TeamSelection 
                onTeamSelected={() => {
                  setShowTeamSelection(false);
                  router.push('/dashboard');
                }}
                redirectAfterSelection={true}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  // If user is logged in with favorite team, show loading while redirecting
  if (user && user.favorite_team_id) {
    return <LoadingSpinner />;
  }

  // Logged-out users: Show marketing home page
  return <LoggedOutHomePage />;
}

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
import AnimatedStatsCard from '@/components/home/AnimatedStatsCard';
import PreviewCard from '@/components/home/PreviewCard';
import TestimonialCard from '@/components/home/TestimonialCard';
import ScreenshotCarousel from '@/components/home/ScreenshotCarousel';
import StickyCTA from '@/components/home/StickyCTA';
import PersonalizedNewsFeed from '@/components/news/PersonalizedNewsFeed';
import QuickRecommendations from '@/components/dashboard/QuickRecommendations';
import { fplApi } from '@/lib/api';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

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
      icon: '⚽',
      title: 'Follow Your Team',
      description: 'Track your favorite team\'s fixtures, results, news, and player stats all in one place.',
      color: 'var(--pl-green)',
      href: '/dashboard',
    },
    {
      icon: '📊',
      title: 'Advanced Statistics',
      description: 'Deep dive into match stats, player performance, and team analytics with detailed insights.',
      color: 'var(--pl-cyan)',
      href: '/dashboard',
    },
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
      icon: '📅',
      title: 'Fixture Planner',
      description: 'Visual fixture difficulty ratings for the next 8 gameweeks.',
      color: 'var(--pl-green)',
      href: '/fantasy-football/fixtures',
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

      {/* Enhanced Hero Section with Animated Background */}
      <section className="relative pt-28 sm:pt-32 lg:pt-24 pb-12 sm:pb-16 lg:pb-20 px-4 sm:px-6 overflow-hidden">
        {/* Animated Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--pl-dark)] via-[var(--pl-dark)] to-[var(--pl-dark)]">
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--pl-green)]/20 via-[var(--pl-cyan)]/20 to-[var(--pl-pink)]/20 animate-gradient-shift" />
        </div>
        
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center space-y-8">
            {/* Animated Badge */}
            <div className="inline-block px-4 py-2 rounded-full border border-[var(--pl-green)] text-[var(--pl-green)] text-sm font-medium animate-fade-in-up">
              🚀 Season 2024/25 Ready
            </div>
            
            {/* Animated Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight animate-fade-in-up animation-delay-100">
              Your Complete
              <span className="text-gradient-primary block animate-gradient-text">Football Companion</span>
            </h1>
            
            <p className="text-lg sm:text-xl text-[var(--pl-text-muted)] max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Follow your favorite team, track fixtures, get the latest news, and dominate your Fantasy Premier League. 
              Everything you need in one place.
            </p>
            
            {/* Enhanced CTAs with Pulsing Effect */}
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up animation-delay-300">
              <Link 
                href="/register" 
                className="btn-primary text-lg px-8 py-4 relative animate-pulse-glow hover:scale-105 transition-transform"
              >
                Start Free Trial
              </Link>
              <Link 
                href="#features" 
                className="btn-secondary text-lg px-8 py-4 hover:scale-105 transition-transform"
              >
                Learn More
              </Link>
            </div>
            
            {/* Animated Stats */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-4 animate-fade-in-up animation-delay-400">
              <AnimatedStatsCard value={50} suffix="K+" label="Active Managers" />
              <AnimatedStatsCard value={85} suffix="%" label="Accuracy Rate" />
              <AnimatedStatsCard value={4.9} suffix="★" label="User Rating" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Data Previews Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-b from-transparent to-[var(--pl-dark)]/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">See What You're Missing</h2>
            <p className="text-[var(--pl-text-muted)] text-base sm:text-lg max-w-2xl mx-auto">
              Real insights from real data. Sign up to unlock team tracking, advanced stats, and AI-driven FPL management.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Transfer Preview */}
            <PreviewCard
              title="AI Transfer Suggestion"
              unlockText="Sign up to unlock"
              data={
                <div className="space-y-4">
                  <div className="flex items-center gap-4 p-4 bg-[var(--pl-dark)]/50 rounded-xl">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-2xl">
                      ⚽
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Transfer Out: Player A</div>
                      <div className="text-sm text-[var(--pl-text-muted)]">Form: 4.2 • Fixtures: Hard</div>
                    </div>
                    <div className="text-[var(--pl-pink)] font-mono">-£7.5m</div>
                  </div>
                  <div className="flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-[var(--pl-green)]/20 flex items-center justify-center">
                      <span className="text-[var(--pl-green)]">↓</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 p-4 bg-[var(--pl-dark)]/50 rounded-xl border border-[var(--pl-green)]/30">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-2xl">
                      ⚽
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold">Transfer In: Player B</div>
                      <div className="text-sm text-[var(--pl-text-muted)]">Form: 8.1 • Fixtures: Easy</div>
                    </div>
                    <div className="text-[var(--pl-green)] font-mono">£7.2m</div>
                  </div>
                  <div className="text-center text-sm text-[var(--pl-text-muted)]">
                    Expected Points Gain: <span className="text-[var(--pl-green)] font-bold">+12.4</span> over 5 GWs
                  </div>
                </div>
              }
            />
            
            {/* Captain Preview */}
            <PreviewCard
              title="Captain Pick Optimizer"
              unlockText="Sign up to unlock"
              data={
                <div className="space-y-4">
                  <div className="text-center p-6 bg-[var(--pl-dark)]/50 rounded-xl">
                    <div className="text-4xl mb-4">👑</div>
                    <div className="font-semibold text-lg mb-2">Top Captain Pick</div>
                    <div className="text-2xl font-bold text-gradient-primary mb-2">Player Name</div>
                    <div className="text-sm text-[var(--pl-text-muted)] mb-4">Expected Points: 12.5</div>
                    <div className="text-xs text-[var(--pl-text-muted)]">
                      Based on xG, fixtures, and form analysis
                    </div>
                  </div>
                </div>
              }
            />
            
            {/* Fixture Preview */}
            <PreviewCard
              title="Fixture Planner"
              unlockText="Sign up to unlock"
              data={
                <div className="space-y-3">
                  <div className="text-sm font-semibold mb-3">Next 5 Gameweeks</div>
                  {[1, 2, 3, 4, 5].map((gw) => (
                    <div key={gw} className="flex items-center justify-between p-3 bg-[var(--pl-dark)]/50 rounded-lg">
                      <div className="text-sm">GW {gw}</div>
                      <div className="flex gap-1">
                        {['easy', 'medium', 'hard'].map((diff, i) => (
                          <div
                            key={i}
                            className={`w-3 h-3 rounded-full ${
                              diff === 'easy' ? 'bg-[var(--pl-green)]' :
                              diff === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              }
            />
          </div>
        </div>
      </section>

      {/* Enhanced Feature Showcase with Scroll Animations */}
      <section id="features" className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-[var(--pl-text-muted)] text-base sm:text-lg max-w-2xl mx-auto">
              Follow your favorite team, track detailed stats, and dominate your Fantasy Premier League. 
              Everything you need in one place.
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {features.map((feature, index) => {
              const { ref, isVisible } = useScrollAnimation({ triggerOnce: true });
              return (
                <div
                  key={feature.title}
                  ref={ref}
                  className={`transition-all duration-500 ${
                    isVisible
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <FeatureCard
                    icon={feature.icon}
                    title={feature.title}
                    description={feature.description}
                    color={feature.color}
                    href={feature.href}
                  />
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gradient-to-b from-[var(--pl-dark)]/50 to-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">Trusted by Thousands of Managers</h2>
          </div>
          
          <TestimonialCard
            testimonials={[
              {
                quote: "Fotmate's AI transfer suggestions helped me climb from 500K to 50K in just 8 gameweeks. The insights are spot-on!",
                author: "Alex M.",
                rank: 45231,
                points: 1245,
                avatar: "👤",
              },
              {
                quote: "Never missed a captaincy pick since using Fotmate. The xG predictions are incredibly accurate.",
                author: "Sarah K.",
                rank: 12345,
                points: 1389,
                avatar: "👤",
              },
              {
                quote: "Best FPL tool I've used. The fixture planner alone is worth the subscription.",
                author: "James T.",
                rank: 78901,
                points: 1123,
                avatar: "👤",
              },
            ]}
            autoRotate={true}
            rotationInterval={5000}
          />
        </div>
      </section>

      {/* App Preview Section */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <ScreenshotCarousel
            screenshots={[
              {
                image: '',
                title: 'Follow Your Team',
                description: 'Track fixtures, results, news, and player stats for your favorite team.',
              },
              {
                image: '',
                title: 'Advanced Statistics',
                description: 'Detailed match stats, player performance metrics, and team analytics.',
              },
              {
                image: '',
                title: 'Fantasy Football Dashboard',
                description: 'View your FPL squad, track performance, and get personalized insights.',
              },
              {
                image: '',
                title: 'AI Transfer Assistant',
                description: 'Get AI-powered transfer recommendations based on form, fixtures, and value.',
              },
              {
                image: '',
                title: 'Fixture Planner',
                description: 'Visual fixture difficulty ratings for the next 8 gameweeks.',
              },
            ]}
            autoPlay={true}
            interval={5000}
          />
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

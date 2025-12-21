'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TeamSelection from '@/components/TeamSelection';
import TopNavigation from '@/components/navigation/TopNavigation';
import Logo from '@/components/Logo';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showTeamSelection, setShowTeamSelection] = useState(false);

  useEffect(() => {
    // If user is logged in but hasn't selected a favorite team, show selection
    if (user && !user.favorite_team_id) {
      setShowTeamSelection(true);
    }
  }, [user]);

  return (
    <div className="min-h-screen">
      {/* Top Navigation */}
      <TopNavigation
        showFavoriteTeam={false}
        showNotifications={false}
        showLinkFPL={false}
      />

      {/* Team Selection Section - Show if user logged in but no favorite team */}
      {user && !user.favorite_team_id && (
        <section className="pt-14 sm:pt-16 pb-8 sm:pb-12 px-4 sm:px-6">
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
      )}

      {/* Hero Section */}
      {(!user || user.favorite_team_id) && (
        <section className="pt-14 sm:pt-16 pb-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8 opacity-0 animate-slide-up">
              <div className="inline-block px-4 py-2 rounded-full border border-[var(--pl-green)] text-[var(--pl-green)] text-sm font-medium">
                🚀 Season 2024/25 Ready
              </div>
              
              <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                Your Complete
                <span className="text-gradient-primary block">Football Companion</span>
              </h1>
              
              <p className="text-xl text-[var(--pl-text-muted)] max-w-lg">
                Follow your favorite team, track fixtures, get the latest news, and dominate your Fantasy Premier League. 
                Everything you need in one place.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link href="/register" className="btn-primary text-lg px-8 py-4">
                  Start Free Trial
                </Link>
                <Link href="#features" className="btn-secondary text-lg px-8 py-4">
                  Learn More
                </Link>
              </div>
              
              <div className="flex items-center gap-8 pt-4">
                <div>
                  <div className="text-3xl font-bold text-gradient-primary">50K+</div>
                  <div className="text-sm text-[var(--pl-text-muted)]">Active Managers</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-primary">85%</div>
                  <div className="text-sm text-[var(--pl-text-muted)]">Accuracy Rate</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-gradient-primary">4.9★</div>
                  <div className="text-sm text-[var(--pl-text-muted)]">User Rating</div>
                </div>
              </div>
            </div>
            
            {/* Hero Visual */}
            <div className="relative opacity-0 animate-slide-up stagger-2">
              <div className="absolute inset-0 bg-gradient-to-r from-[var(--pl-green)] to-[var(--pl-cyan)] rounded-3xl blur-3xl opacity-20" />
              <div className="relative glass rounded-3xl p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">AI Transfer Suggestion</h3>
                  <span className="px-3 py-1 rounded-full bg-[var(--pl-green)]/20 text-[var(--pl-green)] text-sm">
                    High Confidence
                  </span>
                </div>
                
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
            </div>
          </div>
        </div>
        </section>
      )}

      {/* Features Section */}
      {(!user || user.favorite_team_id) && (
        <section id="features" className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-[var(--pl-text-muted)] text-lg max-w-2xl mx-auto">
              Everything you need to make informed FPL decisions, all in one place.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: '🤖',
                title: 'AI Transfer Assistant',
                description: 'Get personalized transfer recommendations based on form, fixtures, and value.',
                color: 'var(--pl-green)',
              },
              {
                icon: '👑',
                title: 'Captaincy Optimizer',
                description: 'Never miss a captaincy pick with our xG-based predictions.',
                color: 'var(--pl-pink)',
              },
              {
                icon: '📊',
                title: 'Team Rating',
                description: 'See how your squad scores against the ideal team structure.',
                color: 'var(--pl-cyan)',
              },
              {
                icon: '📅',
                title: 'Fixture Planner',
                description: 'Visual fixture difficulty ratings for the next 8 gameweeks.',
                color: 'var(--pl-green)',
              },
              {
                icon: '💰',
                title: 'Price Predictions',
                description: 'Stay ahead of price changes with our prediction model.',
                color: 'var(--pl-pink)',
              },
              {
                icon: '🏆',
                title: 'Mini-League Insights',
                description: 'Analyze your rivals and find your competitive edge.',
                color: 'var(--pl-cyan)',
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                className={`card opacity-0 animate-slide-up stagger-${index + 1}`}
                style={{ ['--feature-color' as string]: feature.color }}
              >
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4"
                  style={{ background: `${feature.color}20` }}
                >
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[var(--pl-text-muted)]">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
        </section>
      )}

      {/* CTA Section */}
      {(!user || user.favorite_team_id) && (
        <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-3xl p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--pl-purple)] to-[var(--pl-pink)] opacity-20" />
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-4">Ready to Climb the Rankings?</h2>
              <p className="text-xl text-[var(--pl-text-muted)] mb-8 max-w-2xl mx-auto">
                Join thousands of FPL managers using AI-powered insights to make smarter decisions.
              </p>
              <Link href="/register" className="btn-primary text-lg px-10 py-4 inline-block">
                Get Started for Free
              </Link>
            </div>
          </div>
        </div>
        </section>
      )}

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

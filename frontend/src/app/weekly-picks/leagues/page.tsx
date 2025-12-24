'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import TopNavigation from '@/components/navigation/TopNavigation';
import BottomNavigation from '@/components/navigation/BottomNavigation';
import LeagueCard from '@/components/weekly-picks/LeagueCard';
import InviteCodeDisplay from '@/components/weekly-picks/InviteCodeDisplay';
import { weeklyPicksApi } from '@/lib/api';

export default function LeaguesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [leagues, setLeagues] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [leagueName, setLeagueName] = useState('');
  const [leagueDescription, setLeagueDescription] = useState('');
  const [leagueType, setLeagueType] = useState<'weekly' | 'seasonal' | 'both'>('both');
  const [inviteCode, setInviteCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/weekly-picks');
      return;
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const leaguesData = await weeklyPicksApi.getLeagues();
        setLeagues(leaguesData || []);
      } catch (error) {
        console.error('Error fetching leagues:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user]);

  const handleCreateLeague = async () => {
    if (!leagueName.trim()) {
      alert('Please enter a league name');
      return;
    }

    try {
      setSubmitting(true);
      const newLeague = await weeklyPicksApi.createLeague(leagueName, leagueDescription, leagueType);
      setInviteCode(newLeague.code);
      setShowCreateModal(false);
      setLeagueName('');
      setLeagueDescription('');
      setLeagueType('both');
      // Refresh leagues list
      const leaguesData = await weeklyPicksApi.getLeagues();
      setLeagues(leaguesData || []);
    } catch (error) {
      console.error('Error creating league:', error);
      alert('Failed to create league. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleJoinLeague = async () => {
    if (!joinCode.trim()) {
      alert('Please enter a league code');
      return;
    }

    try {
      setSubmitting(true);
      await weeklyPicksApi.joinLeague(joinCode);
      setShowJoinModal(false);
      setJoinCode('');
      // Refresh leagues list
      const leaguesData = await weeklyPicksApi.getLeagues();
      setLeagues(leaguesData || []);
    } catch (error) {
      console.error('Error joining league:', error);
      alert('Failed to join league. Please check the code and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--pl-green)]"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen pb-16 lg:pb-0">
      <TopNavigation />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 sm:pt-20 lg:pt-28 pb-8 sm:pb-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold">My Private Leagues</h1>
          <div className="flex gap-3">
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create League
            </button>
            <button
              onClick={() => setShowJoinModal(true)}
              className="btn-secondary"
            >
              Join League
            </button>
          </div>
        </div>

        {/* Leagues List */}
        {leagues.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <LeagueCard
                key={league.id}
                league={{
                  id: league.id,
                  name: league.name,
                  memberCount: league.memberCount || 0,
                  yourRank: league.yourRank || 0,
                  type: league.type || 'both',
                }}
                onClick={() => router.push(`/weekly-picks/leagues/${league.id}`)}
              />
            ))}
          </div>
        ) : (
          <div className="glass rounded-xl p-12 text-center">
            <div className="text-4xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold mb-2">No Leagues Yet</h2>
            <p className="text-[var(--pl-text-muted)] mb-6">
              Create or join a league to compete with friends
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary"
            >
              Create Your First League
            </button>
          </div>
        )}

        {/* Create League Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass rounded-xl p-6 sm:p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Create New League</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">League Name</label>
                  <input
                    type="text"
                    value={leagueName}
                    onChange={(e) => setLeagueName(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 focus:border-[var(--pl-green)] focus:outline-none"
                    placeholder="Enter league name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                  <textarea
                    value={leagueDescription}
                    onChange={(e) => setLeagueDescription(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 focus:border-[var(--pl-green)] focus:outline-none"
                    placeholder="Enter description"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">League Type</label>
                  <div className="space-y-2">
                    {(['weekly', 'seasonal', 'both'] as const).map((type) => (
                      <label key={type} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          value={type}
                          checked={leagueType === type}
                          onChange={(e) => setLeagueType(e.target.value as any)}
                          className="w-4 h-4"
                        />
                        <span className="capitalize">{type}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setLeagueName('');
                      setLeagueDescription('');
                      setLeagueType('both');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateLeague}
                    disabled={submitting || !leagueName.trim()}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Join League Modal */}
        {showJoinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass rounded-xl p-6 sm:p-8 max-w-md w-full">
              <h2 className="text-2xl font-bold mb-6">Join League</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">League Code</label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    className="w-full px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 focus:border-[var(--pl-green)] focus:outline-none font-mono text-center text-lg"
                    placeholder="ABC123"
                    maxLength={6}
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowJoinModal(false);
                      setJoinCode('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleJoinLeague}
                    disabled={submitting || !joinCode.trim()}
                    className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Joining...' : 'Join'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Invite Code Display */}
        {inviteCode && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="glass rounded-xl p-6 sm:p-8 max-w-md w-full">
              <InviteCodeDisplay
                code={inviteCode}
                leagueName={leagueName}
                onCopy={() => {}}
                onShare={() => {}}
              />
              <button
                onClick={() => setInviteCode('')}
                className="btn-secondary w-full mt-4"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
      <BottomNavigation />
    </div>
  );
}


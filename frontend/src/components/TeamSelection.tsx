'use client';

import { useState, useEffect } from 'react';
import { footballApi, authApi } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';

interface Team {
  id: number;
  name: string;
  logo: string | null;
  code: string | null;
}

interface TeamSelectionProps {
  onTeamSelected?: () => void;
  redirectAfterSelection?: boolean;
}

export default function TeamSelection({ onTeamSelected, redirectAfterSelection = false }: TeamSelectionProps) {
  const { user, checkAuth } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      const data = await footballApi.getUkTeams();
      if (data.teams) {
        setTeams(data.teams);
        // Pre-select user's favorite team if they have one
        if (user?.favorite_team_id) {
          setSelectedTeam(user.favorite_team_id);
        }
      } else {
        setError(data.error || 'Failed to load teams');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to load teams');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTeam = async (teamId: number) => {
    console.log('[TeamSelection] handleSelectTeam called with teamId:', teamId);
    
    if (!user) {
      const errorMsg = 'Please login to save your favorite team';
      console.log('[TeamSelection] No user found:', errorMsg);
      setError(errorMsg);
      return;
    }

    try {
      console.log('[TeamSelection] Starting save process...');
      setSaving(true);
      setError('');
      setSelectedTeam(teamId); // Update UI immediately for feedback
      
      console.log('[TeamSelection] Calling updateFavoriteTeamId API...');
      const result = await authApi.updateFavoriteTeamId(teamId);
      console.log('[TeamSelection] API response:', result);
      
      console.log('[TeamSelection] Refreshing auth data...');
      await checkAuth(); // Refresh user data
      console.log('[TeamSelection] Auth data refreshed');
      
      if (onTeamSelected) {
        console.log('[TeamSelection] Calling onTeamSelected callback...');
        onTeamSelected();
      }
      
      if (redirectAfterSelection) {
        console.log('[TeamSelection] Redirecting to dashboard...');
        window.location.href = '/dashboard';
      } else {
        console.log('[TeamSelection] Team selection complete');
      }
    } catch (err: any) {
      console.error('[TeamSelection] Error saving team selection:', err);
      const errorMsg = err.response?.data?.detail || err.message || 'Failed to save team selection';
      setError(errorMsg);
      setSelectedTeam(null); // Reset selection on error
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !teams.length) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--pl-pink)] mb-4">{error}</p>
        <button
          onClick={loadTeams}
          className="btn-secondary"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2">Choose Your Favorite Team</h2>
        <p className="text-[var(--pl-text-muted)]">Select your favorite Premier League team</p>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-[var(--pl-pink)]/10 border border-[var(--pl-pink)]/30 text-[var(--pl-pink)] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
        {teams.map((team) => (
          <button
            key={team.id}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log('[TeamSelection] Button clicked for team:', team.name, team.id);
              handleSelectTeam(team.id);
            }}
            disabled={saving || !user}
            className={`
              p-3 sm:p-4 rounded-xl border-2 transition-all relative
              ${selectedTeam === team.id
                ? 'border-[var(--pl-green)] bg-[var(--pl-green)]/10 ring-2 ring-[var(--pl-green)]/30'
                : 'border-white/10 bg-[var(--pl-card)] hover:border-white/20 hover:bg-[var(--pl-card-hover)] active:scale-95'
              }
              ${saving || !user ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer touch-manipulation'}
              ${saving && selectedTeam === team.id ? 'animate-pulse' : ''}
            `}
            type="button"
          >
            {team.logo && (
              <img
                src={team.logo}
                alt={team.name}
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 mx-auto mb-2 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div className="text-xs sm:text-sm font-medium text-center truncate leading-tight">{team.name}</div>
            {selectedTeam === team.id && saving && (
              <div className="mt-1 sm:mt-2 text-[var(--pl-green)] text-[10px] sm:text-xs text-center font-medium">
                <span className="inline-block animate-spin mr-1">⏳</span> Saving...
              </div>
            )}
            {selectedTeam === team.id && !saving && (
              <div className="mt-1 sm:mt-2 text-[var(--pl-green)] text-[10px] sm:text-xs text-center font-medium">✓ Selected</div>
            )}
          </button>
        ))}
      </div>

      {!user && (
        <div className="text-center text-sm text-[var(--pl-text-muted)]">
          <p>Want to save your favorite team? <a href="/login" className="text-[var(--pl-green)] hover:underline">Login</a> or <a href="/register" className="text-[var(--pl-green)] hover:underline">Register</a></p>
        </div>
      )}
    </div>
  );
}


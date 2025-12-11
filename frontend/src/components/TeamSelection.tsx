'use client';

import { useState, useEffect } from 'react';
import { footballApi, authApi, fplApi } from '@/lib/api';
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
  const [warning, setWarning] = useState<string>('');

  useEffect(() => {
    loadTeams();
  }, []);

  // Reload teams when user changes (e.g., after login)
  useEffect(() => {
    if (user && teams.length === 0 && !loading && !error) {
      loadTeams();
    }
  }, [user]);

  const loadTeams = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('[TeamSelection] Loading teams...');
      const data = await footballApi.getUkTeams();
      console.log('[TeamSelection] Teams data received:', data);
      
      // Check for error first
      if (data.error) {
        const errorMsg = data.error;
        console.error('[TeamSelection] Error loading teams:', errorMsg);
        setError(errorMsg);
        setTeams([]);
        
        // If API key is not configured, try fallback to FPL teams
        if (errorMsg.includes('API_FOOTBALL_KEY not configured') || errorMsg.includes('API key')) {
          console.log('[TeamSelection] Attempting fallback to FPL teams...');
          try {
            const fplData = await fplApi.getBootstrap();
            if (fplData && fplData.teams) {
              // Map FPL teams to our format (note: these will have FPL team IDs, not API-FOOTBALL IDs)
              const fplTeams = fplData.teams.map((team: any) => ({
                id: team.id, // This is FPL team ID, not API-FOOTBALL ID
                name: team.name,
                logo: null, // FPL doesn't provide logos
                code: team.short_name,
              }));
              setTeams(fplTeams);
              setError(''); // Clear error since we have fallback teams
              console.log(`[TeamSelection] Loaded ${fplTeams.length} teams from FPL fallback`);
              if (user?.favorite_team_id) {
                setSelectedTeam(user.favorite_team_id);
              }
              return; // Exit early
            }
          } catch (fplErr) {
            console.error('[TeamSelection] FPL fallback also failed:', fplErr);
            // Keep the original error
          }
        }
      } else if (data.teams && Array.isArray(data.teams)) {
        setTeams(data.teams);
        console.log(`[TeamSelection] Loaded ${data.teams.length} teams`);
        // Show warning if present (e.g., using fallback)
        if (data.warning) {
          setWarning(data.warning);
          setError(''); // Clear any previous errors
        } else {
          setWarning('');
        }
        // Pre-select user's favorite team if they have one
        if (user?.favorite_team_id) {
          setSelectedTeam(user.favorite_team_id);
        }
      } else {
        const errorMsg = 'Failed to load teams. Please check API configuration.';
        console.error('[TeamSelection] Error loading teams:', errorMsg);
        setError(errorMsg);
        setTeams([]);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.error || err.message || 'Failed to load teams. Please check your connection and API configuration.';
      console.error('[TeamSelection] Exception loading teams:', err);
      setError(errorMsg);
      setTeams([]);
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
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-[var(--pl-text-muted)]">Loading teams...</p>
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

  if (!loading && teams.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-[var(--pl-pink)] mb-4">No teams available. This might be due to API configuration issues.</p>
        <button
          onClick={loadTeams}
          className="btn-secondary"
        >
          Retry
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

      {/* Show warning if using fallback */}
      {warning && (
        <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-sm">
          <p className="font-semibold mb-1">⚠️ {warning}</p>
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


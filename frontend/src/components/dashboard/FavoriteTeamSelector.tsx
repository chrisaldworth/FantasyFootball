'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { footballApi, fplApi } from '@/lib/api';

interface Team {
  id: number;
  name: string;
  logo?: string | null;
  code?: string | null;
}

interface FavoriteTeamSelectorProps {
  currentTeamId: number | null;
  currentTeamName: string | null;
  onTeamChange: (teamId: number) => void;
}

export default function FavoriteTeamSelector({
  currentTeamId,
  currentTeamName,
  onTeamChange,
}: FavoriteTeamSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const { updateFavoriteTeamId } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  const fetchTeams = async () => {
    if (teams.length > 0) return;
    
    setLoading(true);
    try {
      // Try to get teams from football API first
      const data = await footballApi.getUkTeams();
      if (data.teams && Array.isArray(data.teams)) {
        setTeams(data.teams);
      } else {
        // Fallback to FPL teams
        const fplData = await fplApi.getBootstrap();
        if (fplData && fplData.teams) {
          const fplTeams = fplData.teams.map((team: any) => ({
            id: team.id,
            name: team.name,
            logo: null,
            code: team.short_name,
          }));
          setTeams(fplTeams);
        }
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
      // Fallback to FPL teams
      try {
        const fplData = await fplApi.getBootstrap();
        if (fplData && fplData.teams) {
          const fplTeams = fplData.teams.map((team: any) => ({
            id: team.id,
            name: team.name,
            logo: null,
            code: team.short_name,
          }));
          setTeams(fplTeams);
        }
      } catch (fplErr) {
        console.error('Failed to fetch FPL teams:', fplErr);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && teams.length === 0) {
      fetchTeams();
    }
  }, [isOpen]);

  const handleTeamSelect = async (teamId: number) => {
    try {
      await updateFavoriteTeamId(teamId);
      onTeamChange(teamId);
      setIsOpen(false);
    } catch (err) {
      console.error('Failed to update favorite team:', err);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) {
            fetchTeams();
          }
        }}
        className="glass rounded-lg px-3 sm:px-4 py-2 flex items-center gap-2 hover:bg-white/10 transition-colors text-sm sm:text-base"
        aria-label="Select favorite team"
        aria-expanded={isOpen}
      >
        <span className="text-[var(--pl-text-muted)] hidden sm:inline">
          My favourite team:
        </span>
        <span className="font-semibold text-white">
          {currentTeamName || 'Select team'}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-2 glass rounded-xl p-2 min-w-[200px] max-w-[300px] max-h-[400px] overflow-y-auto z-50 shadow-lg">
          {loading ? (
            <div className="p-4 text-center text-[var(--pl-text-muted)]">
              Loading teams...
            </div>
          ) : teams.length === 0 ? (
            <div className="p-4 text-center text-[var(--pl-text-muted)]">
              No teams available
            </div>
          ) : (
            <div className="space-y-1">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    currentTeamId === team.id
                      ? 'bg-[var(--pl-green)]/20 text-white'
                      : 'hover:bg-white/10 text-white'
                  }`}
                >
                  {team.name}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


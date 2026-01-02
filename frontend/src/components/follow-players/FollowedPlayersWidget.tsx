'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { fplApi } from '@/lib/api';
import { useFollowedPlayers } from '@/hooks/useFollowedPlayers';
import TeamLogo from '@/components/TeamLogo';
import Link from 'next/link';

interface FollowedPlayerWithStats {
  followed_player_id: number;
  player_id: number;
  followed_at: string;
  player: {
    id: number;
    web_name: string;
    photo?: string;
    team: number;
    team_name: string;
    element_type: number;
    price: number;
    form: number;
    total_points: number;
  };
}

function getPlayerPhotoUrl(photo: string | undefined): string | null {
  if (!photo) return null;
  const photoCode = photo.replace('.jpg', '').replace('.png', '');
  return `https://resources.premierleague.com/premierleague/photos/players/110x140/p${photoCode}.png`;
}

function getFormColor(form: number): string {
  if (form >= 5.0) return '#10b981'; // Green
  if (form >= 3.0) return '#f59e0b'; // Yellow
  return '#ef4444'; // Red
}

export default function FollowedPlayersWidget() {
  const router = useRouter();
  const { isFollowed } = useFollowedPlayers();
  const [players, setPlayers] = useState<FollowedPlayerWithStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowedPlayers();
  }, []);

  const loadFollowedPlayers = async () => {
    try {
      const data = await fplApi.getFollowedPlayersWithStats();
      // Show up to 5 players
      setPlayers(data.slice(0, 5));
    } catch (err) {
      console.error('Failed to load followed players:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Followed Players</h3>
        </div>
        <div className="flex gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-24 h-32 rounded-lg bg-[var(--pl-dark)]/50 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (players.length === 0) {
    return (
      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Followed Players</h3>
        </div>
        <div className="text-center py-8">
          <p className="text-[var(--pl-text-muted)] mb-3">Follow players to see them here</p>
          <Link
            href="/fantasy-football/players"
            className="text-sm text-[var(--pl-green)] hover:underline"
          >
            Browse Players
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-white">Followed Players</h3>
        <Link
          href="/fantasy-football/followed-players"
          className="text-sm text-[var(--pl-green)] hover:underline"
        >
          View All
        </Link>
      </div>
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {players.map((playerData) => {
          const photoUrl = getPlayerPhotoUrl(playerData.player.photo);
          const formColor = getFormColor(playerData.player.form);
          
          return (
            <div
              key={playerData.followed_player_id}
              className="flex-shrink-0 w-24 text-center cursor-pointer group"
              onClick={() => router.push(`/fantasy-football/followed-players`)}
            >
              {/* Player Photo */}
              <div className="relative w-16 h-16 mx-auto mb-2 rounded-full overflow-hidden border-2 border-[var(--pl-dark)] group-hover:border-[var(--pl-green)] transition-colors">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt={playerData.player.web_name}
                    className="w-full h-full object-cover object-top scale-150 translate-y-0.5"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--pl-purple)] to-[var(--pl-pink)] text-white font-bold text-xs">
                    {playerData.player.web_name.substring(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Player Name */}
              <div className="text-xs font-semibold text-white truncate mb-1">
                {playerData.player.web_name}
              </div>

              {/* Key Stat (Price or Form) */}
              <div 
                className="text-sm font-bold"
                style={{ color: formColor }}
              >
                {playerData.player.form.toFixed(1)}
              </div>
              <div className="text-[10px] text-[var(--pl-text-muted)]">
                £{playerData.player.price.toFixed(1)}m
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

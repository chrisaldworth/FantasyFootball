'use client';

import { useMemo } from 'react';
import FollowButton from './FollowButton';
import TeamLogo from '@/components/TeamLogo';

interface FollowedPlayerCardProps {
  player: {
    id: number;
    name: string;
    photo?: string;
    team: string;
    teamId: number;
    position: string;
    positionId: number;
    price: number;
    form: number;
    totalPoints: number;
    priceChange?: number; // -1, 0, 1
    ownership?: number;
    nextFixture?: {
      opponent: string;
      difficulty: number;
      isHome: boolean;
    };
  };
  onViewDetails: () => void;
  onUnfollow: () => void;
  isFollowed: boolean;
  onToggleFollow: (playerId: number, willFollow: boolean) => Promise<void>;
}

const POSITION_NAMES: { [key: number]: string } = {
  1: 'GK',
  2: 'DEF',
  3: 'MID',
  4: 'FWD',
};

const POSITION_COLORS: { [key: number]: string } = {
  1: 'from-green-500 to-green-600',
  2: 'from-blue-500 to-blue-600',
  3: 'from-yellow-500 to-yellow-600',
  4: 'from-red-500 to-red-600',
};

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

function getDifficultyColor(difficulty: number): string {
  if (difficulty <= 2) return '#10b981'; // Green - Easy
  if (difficulty <= 3) return '#f59e0b'; // Yellow - Medium
  return '#ef4444'; // Red - Hard
}

export default function FollowedPlayerCard({
  player,
  onViewDetails,
  onUnfollow,
  isFollowed,
  onToggleFollow,
}: FollowedPlayerCardProps) {
  const photoUrl = getPlayerPhotoUrl(player.photo);
  const formColor = getFormColor(player.form);
  const positionColor = POSITION_COLORS[player.positionId] || 'from-gray-500 to-gray-600';

  return (
    <div className="glass rounded-xl p-4 relative hover:scale-[1.02] transition-all duration-200 hover:shadow-lg group">
      {/* Follow Button - Top Right */}
      <div className="absolute top-3 right-3 z-10">
        <FollowButton
          playerId={player.id}
          playerName={player.name}
          isFollowed={isFollowed}
          onToggle={onToggleFollow}
          size="medium"
          className="bg-[var(--pl-dark)]/50 backdrop-blur-sm"
        />
      </div>

      {/* Header - Photo, Name, Team, Position */}
      <div className="flex items-start gap-3 mb-4 pr-8">
        {/* Player Photo */}
        <div className="relative flex-shrink-0">
          <div className={`w-16 h-16 rounded-full overflow-hidden border-2 bg-gradient-to-br ${positionColor}`}>
            {photoUrl ? (
              <img
                src={photoUrl}
                alt={player.name}
                className="w-full h-full object-cover object-top scale-150 translate-y-0.5"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white font-bold text-lg">
                {player.name.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Name, Team, Position */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-white truncate mb-1">{player.name}</h3>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <TeamLogo teamId={player.teamId} size={16} />
              <span className="text-sm text-[var(--pl-text-muted)]">{player.team}</span>
            </div>
            <span className="text-xs text-[var(--pl-text-muted)]">•</span>
            <span className={`px-2 py-0.5 rounded text-xs font-semibold bg-gradient-to-r ${positionColor} text-white`}>
              {POSITION_NAMES[player.positionId] || player.position}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="space-y-2 mb-4">
        {/* Price, Form, Points */}
        <div className="flex items-center gap-3 flex-wrap">
          <div>
            <span className="text-xs text-[var(--pl-text-muted)]">Price</span>
            <div className="text-base font-bold text-white">£{player.price.toFixed(1)}m</div>
          </div>
          <div>
            <span className="text-xs text-[var(--pl-text-muted)]">Form</span>
            <div 
              className="text-base font-bold"
              style={{ color: formColor }}
            >
              {player.form.toFixed(1)}
            </div>
          </div>
          <div>
            <span className="text-xs text-[var(--pl-text-muted)]">Points</span>
            <div className="text-base font-bold text-[var(--pl-green)]">{player.totalPoints}</div>
          </div>
        </div>

        {/* Price Change & Ownership */}
        {(player.priceChange !== undefined || player.ownership !== undefined) && (
          <div className="flex items-center gap-3 text-xs text-[var(--pl-text-muted)]">
            {player.priceChange !== undefined && player.priceChange !== 0 && (
              <span className={player.priceChange > 0 ? 'text-[#10b981]' : 'text-[#ef4444]'}>
                {player.priceChange > 0 ? '↑' : '↓'} £{Math.abs(player.priceChange / 10).toFixed(1)}m
              </span>
            )}
            {player.ownership !== undefined && (
              <span>Owned: {parseFloat(player.ownership.toString()).toFixed(1)}%</span>
            )}
          </div>
        )}
      </div>

      {/* Next Fixture */}
      {player.nextFixture && (
        <div className="mb-4 p-2 rounded-lg bg-[var(--pl-dark)]/50">
          <div className="text-xs text-[var(--pl-text-muted)] mb-1">Next Fixture</div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-white">
              {player.nextFixture.isHome ? 'vs' : '@'} {player.nextFixture.opponent}
            </span>
            <span
              className="px-2 py-0.5 rounded text-xs font-bold text-white"
              style={{ backgroundColor: getDifficultyColor(player.nextFixture.difficulty) }}
            >
              [{player.nextFixture.difficulty}]
            </span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-4">
        <button
          onClick={onViewDetails}
          className="flex-1 px-4 py-2 rounded-lg bg-[var(--pl-green)] hover:bg-[var(--pl-green)]/80 text-white font-medium text-sm transition-colors"
        >
          View Details
        </button>
        <button
          onClick={onUnfollow}
          className="px-4 py-2 rounded-lg bg-[var(--pl-dark)]/50 hover:bg-[var(--pl-dark)]/70 text-[var(--pl-text-muted)] hover:text-white text-sm transition-colors"
        >
          Unfollow
        </button>
      </div>
    </div>
  );
}

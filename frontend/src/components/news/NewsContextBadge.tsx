'use client';

interface NewsContextBadgeProps {
  context: 'favorite-team' | 'fpl-player' | 'trending' | 'breaking';
  playerName?: string;
}

export default function NewsContextBadge({ context, playerName }: NewsContextBadgeProps) {
  const badgeConfig = {
    'favorite-team': {
      text: 'Your favorite team',
      color: 'bg-[var(--pl-cyan)]',
    },
    'fpl-player': {
      text: playerName ? `Your FPL player: ${playerName}` : 'Your FPL player',
      color: 'bg-[var(--pl-green)]',
    },
    'trending': {
      text: 'Trending',
      color: 'bg-[var(--pl-purple)]',
    },
    'breaking': {
      text: 'Breaking',
      color: 'bg-[var(--pl-pink)]',
    },
  };

  const config = badgeConfig[context];

  return (
    <span className={`px-2 py-1 rounded text-xs font-semibold ${config.color} text-white`}>
      {config.text}
    </span>
  );
}




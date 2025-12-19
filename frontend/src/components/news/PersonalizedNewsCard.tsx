'use client';

import NewsTypeBadge from './NewsTypeBadge';
import PlayerNameDisplay from './PlayerNameDisplay';

interface PersonalizedNewsCardProps {
  newsItem: {
    id: string;
    title: string;
    summary: string;
    type: 'team' | 'player';
    player_name?: string;
    player_team?: string;
    team_logo?: string;
    categories?: string[];
    importance_score?: number;
    publishedAt: string;
    source: string;
    url?: string;
  };
}

export default function PersonalizedNewsCard({ newsItem }: PersonalizedNewsCardProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  const getCategoryIcon = (categories: string[] = []) => {
    if (categories.includes('transfer')) return '🔄';
    if (categories.includes('injury')) return '🏥';
    if (categories.includes('match')) return '⚽';
    if (categories.includes('manager')) return '👔';
    if (categories.includes('contract')) return '📝';
    return '📰';
  };

  const getCategoryColor = (categories: string[] = []) => {
    if (categories.includes('transfer')) return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    if (categories.includes('injury')) return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (categories.includes('match')) return 'bg-[var(--pl-green)]/20 text-[var(--pl-green)] border-[var(--pl-green)]/30';
    if (categories.includes('manager')) return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
    if (categories.includes('contract')) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };

  const cardContent = (
    <div className="glass rounded-xl p-4 sm:p-6 relative">
      {/* News Type Badge */}
      <NewsTypeBadge
        type={newsItem.type}
        teamLogo={newsItem.team_logo}
        playerName={newsItem.player_name}
      />

      {/* Player Name Display (only for player news) */}
      {newsItem.type === 'player' && newsItem.player_name && (
        <PlayerNameDisplay
          playerName={newsItem.player_name}
          teamName={newsItem.player_team}
          showTeam={!!newsItem.player_team}
        />
      )}

      {/* Title */}
      <h5 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2 pr-16">
        {newsItem.title}
      </h5>

      {/* Summary */}
      <p className="text-xs sm:text-sm text-[var(--pl-text-muted)] line-clamp-2 mb-3">
        {newsItem.summary}
      </p>

      {/* Categories and Source */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {newsItem.categories?.slice(0, 3).map((cat) => (
            <span
              key={cat}
              className={`px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(newsItem.categories)}`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </span>
          ))}
          <span className="text-xs text-[var(--pl-text-muted)]">{newsItem.source}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[var(--pl-text-muted)]">
            {formatTimeAgo(newsItem.publishedAt)}
          </span>
          {newsItem.url && (
            <span className="text-xs text-[var(--pl-green)]">Read more →</span>
          )}
        </div>
      </div>
    </div>
  );

  if (newsItem.url) {
    return (
      <a
        href={newsItem.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block hover:opacity-90 transition-opacity focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)] rounded-xl"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}


'use client';

import NewsTypeBadge from './NewsTypeBadge';
import PlayerNameDisplay from './PlayerNameDisplay';

interface CompactNewsCardProps {
  newsItem: {
    id: string;
    title: string;
    summary?: string;
    type?: 'team' | 'player';
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

// Calculate priority based on importance score and categories
const calculatePriority = (item: CompactNewsCardProps['newsItem']): 'high' | 'medium' | 'low' => {
  const score = item.importance_score || 0;
  const categories = item.categories || [];
  
  if (score >= 8 || categories.includes('injury') || categories.includes('transfer')) {
    return 'high';
  }
  if (score >= 5) {
    return 'medium';
  }
  return 'low';
};

// Get priority-based CSS classes
const getPriorityClasses = (priority: 'high' | 'medium' | 'low', categories?: string[]): string => {
  const baseClasses = 'min-h-[80px] sm:min-h-[100px]';
  
  if (priority === 'high') {
    if (categories?.includes('injury')) {
      return `${baseClasses} border-l-[3px] border-red-500 min-h-[100px] sm:min-h-[120px]`;
    }
    if (categories?.includes('transfer')) {
      return `${baseClasses} border-l-[3px] border-blue-500 min-h-[100px] sm:min-h-[120px]`;
    }
    return `${baseClasses} border-l-[3px] border-[var(--pl-green)] min-h-[100px] sm:min-h-[120px]`;
  }
  
  if (priority === 'medium') {
    return `${baseClasses} border-l border-white/20`;
  }
  
  return `${baseClasses} border-l border-white/5 opacity-90`;
};

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

export default function CompactNewsCard({ newsItem }: CompactNewsCardProps) {
  const priority = calculatePriority(newsItem);
  const priorityClasses = getPriorityClasses(priority, newsItem.categories);
  
  const cardContent = (
    <div className={`glass rounded-lg p-3 sm:p-4 relative transition-all hover:scale-[1.02] ${priorityClasses}`}>
      {/* Badge */}
      {newsItem.type && (
        <NewsTypeBadge
          type={newsItem.type}
          teamLogo={newsItem.team_logo}
          playerName={newsItem.player_name}
        />
      )}
      
      {/* Player Name (if player news) */}
      {newsItem.type === 'player' && newsItem.player_name && (
        <div className="mb-1">
          <PlayerNameDisplay
            playerName={newsItem.player_name}
            teamName={newsItem.player_team}
            showTeam={!!newsItem.player_team}
          />
        </div>
      )}
      
      {/* Headline */}
      <h5 className="text-base sm:text-lg font-bold mb-1 line-clamp-2 pr-16">
        {newsItem.title}
      </h5>
      
      {/* Summary (optional, hidden on mobile) */}
      {newsItem.summary && (
        <p className="text-xs sm:text-sm text-[var(--pl-text-muted)] line-clamp-1 hidden sm:block mb-2">
          {newsItem.summary}
        </p>
      )}
      
      {/* Metadata */}
      <div className="flex items-center gap-2 text-[10px] sm:text-xs text-[var(--pl-text-muted)]">
        <span>{newsItem.source}</span>
        <span>•</span>
        <span>{formatTimeAgo(newsItem.publishedAt)}</span>
        {newsItem.categories?.[0] && (
          <>
            <span>•</span>
            <span className="capitalize">{newsItem.categories[0]}</span>
          </>
        )}
      </div>
    </div>
  );

  if (newsItem.url) {
    return (
      <a
        href={newsItem.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block focus:outline-none focus:ring-2 focus:ring-[var(--team-primary)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)] rounded-lg"
      >
        {cardContent}
      </a>
    );
  }

  return cardContent;
}


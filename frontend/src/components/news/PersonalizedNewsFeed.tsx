'use client';

import { useState, useEffect, useMemo } from 'react';
import { footballApi } from '@/lib/api';
import CompactNewsCard from './CompactNewsCard';
import ShowMoreButton from './ShowMoreButton';
import NewsFilterButtons from './NewsFilterButtons';
import NewsSortDropdown from './NewsSortDropdown';
import NewsCardSkeleton from './NewsCardSkeleton';
import EmptyTeamNews from './EmptyTeamNews';
import EmptyPlayerNews from './EmptyPlayerNews';
import EmptyNews from './EmptyNews';

interface PersonalizedNewsItem {
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
  context?: 'favorite-team' | 'fpl-player' | 'trending' | 'breaking';
}

interface PersonalizedNewsResponse {
  favorite_team_news?: {
    overview: string;
    highlights: any[];
    big_news: any[];
    categories: Record<string, number>;
    total_count: number;
  } | null;
  fpl_player_news?: {
    overview: string;
    highlights: any[];
    big_news: any[];
    categories: Record<string, number>;
    total_count: number;
    players_covered: string[];
  } | null;
  combined_news: PersonalizedNewsItem[];
  total_count: number;
}

// Calculate priority based on importance score and categories
const calculatePriority = (item: PersonalizedNewsItem): 'high' | 'medium' | 'low' => {
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

export default function PersonalizedNewsFeed() {
  const [news, setNews] = useState<PersonalizedNewsItem[]>([]);
  const [filter, setFilter] = useState<'all' | 'team' | 'players'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'important' | 'category'>('recent');
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasFavoriteTeam, setHasFavoriteTeam] = useState<boolean | null>(null);
  const [hasFplTeam, setHasFplTeam] = useState<boolean | null>(null);
  
  const initialItems = 5;

  useEffect(() => {
    fetchPersonalizedNews();
  }, []);

  const fetchPersonalizedNews = async () => {
    try {
      setLoading(true);
      setError('');
      const data: PersonalizedNewsResponse = await footballApi.getPersonalizedNews();
      
      // Check if user has favorite team and FPL team
      setHasFavoriteTeam(data.favorite_team_news !== null);
      setHasFplTeam(data.fpl_player_news !== null);

      // Transform combined_news to include type, player_name, and context
      const transformedNews: PersonalizedNewsItem[] = (data.combined_news || []).map((item: any) => {
        // Determine context based on item properties
        let context: 'favorite-team' | 'fpl-player' | 'trending' | 'breaking' | undefined;
        
        if (item.type === 'team' && data.favorite_team_news) {
          // Check if this is favorite team news
          context = 'favorite-team';
        } else if (item.type === 'player' && data.fpl_player_news) {
          // Check if this is FPL player news
          context = 'fpl-player';
        } else if (item.categories?.includes('breaking')) {
          context = 'breaking';
        } else if (item.importance_score && item.importance_score >= 7) {
          context = 'trending';
        }
        
        return {
          ...item,
          type: item.type || 'team', // Default to 'team' if not specified
          player_name: item.player_name,
          player_team: item.player_team,
          team_logo: item.team_logo,
          context,
        };
      });

      setNews(transformedNews);
    } catch (err: any) {
      setError('Failed to load personalized news');
      console.error('Failed to fetch personalized news:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter news based on selected filter
  const filteredNews = useMemo(() => {
    return news.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'team') return item.type === 'team';
      if (filter === 'players') return item.type === 'player';
      return true;
    });
  }, [news, filter]);

  // Sort news based on selected sort option with priority first
  const sortedNews = useMemo(() => {
    const sorted = [...filteredNews].sort((a, b) => {
      // Priority first (high → medium → low)
      const priorityA = calculatePriority(a);
      const priorityB = calculatePriority(b);
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      
      if (priorityA !== priorityB) {
        return priorityOrder[priorityA] - priorityOrder[priorityB];
      }
      
      // Then by sort option
      if (sortBy === 'important') {
        return (b.importance_score || 0) - (a.importance_score || 0);
      }
      
      if (sortBy === 'recent') {
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      
      // Category sorting: group by category, then by date
      if (sortBy === 'category') {
        const aCategory = a.categories?.[0] || '';
        const bCategory = b.categories?.[0] || '';
        if (aCategory !== bCategory) {
          return aCategory.localeCompare(bCategory);
        }
        return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      }
      
      return 0;
    });
    
    return sorted;
  }, [filteredNews, sortBy]);
  
  // Limit display
  const displayedNews = showAll ? sortedNews : sortedNews.slice(0, initialItems);

  // Show empty states
  if (!loading && hasFavoriteTeam === false && hasFplTeam === false) {
    return <EmptyNews />;
  }

  if (!loading && filter === 'team' && hasFavoriteTeam === false) {
    return <EmptyTeamNews />;
  }

  if (!loading && filter === 'players' && hasFplTeam === false) {
    return <EmptyPlayerNews />;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <NewsFilterButtons activeFilter={filter} onFilterChange={setFilter} />
        <NewsSortDropdown sortBy={sortBy} onSortChange={setSortBy} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="text-center py-8">
          <p className="text-[var(--pl-text-muted)] text-sm mb-4">{error}</p>
          <button
            onClick={fetchPersonalizedNews}
            className="px-4 py-2 rounded-lg bg-[var(--pl-green)] text-white font-semibold hover:opacity-90 transition-opacity touch-manipulation focus:outline-none focus:ring-2 focus:ring-[var(--pl-green)] focus:ring-offset-2 focus:ring-offset-[var(--pl-dark)]"
          >
            Retry
          </button>
        </div>
      )}

      {/* News Feed */}
      {!loading && !error && sortedNews.length > 0 && (
        <div className="space-y-3">
          {displayedNews.map((item) => (
            <CompactNewsCard key={item.id} newsItem={item} />
          ))}
          
          {/* Show More Button */}
          {sortedNews.length > initialItems && (
            <ShowMoreButton
              showAll={showAll}
              remainingCount={sortedNews.length - initialItems}
              onToggle={() => setShowAll(!showAll)}
            />
          )}
        </div>
      )}

      {/* Empty State (no news items) */}
      {!loading && !error && sortedNews.length === 0 && (
        <EmptyNews />
      )}
    </div>
  );
}


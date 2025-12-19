'use client';

import { useState, useEffect } from 'react';
import { footballApi } from '@/lib/api';

interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publishedAt: string;
  source: string;
  url?: string;
  categories?: string[];
  importance_score?: number;
}

interface NewsOverview {
  overview: string;
  highlights: NewsItem[];
  big_news: NewsItem[];
  categories: Record<string, number>;
  total_count: number;
  team?: string;
  error?: string;
}

interface TeamNewsOverviewProps {
  teamId: number;
  teamName: string;
}

export default function TeamNewsOverview({ teamId, teamName }: TeamNewsOverviewProps) {
  const [overview, setOverview] = useState<NewsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOverview();
  }, [teamId]);

  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await footballApi.getTeamNewsOverview(teamId);
      if (data.error) {
        setError(data.error);
      } else {
        setOverview(data);
      }
    } catch (err: any) {
      setError('Failed to load news overview');
      console.error('Failed to fetch news overview:', err);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="w-8 h-8 border-4 border-[var(--pl-green)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !overview) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--pl-text-muted)] text-sm">{error}</p>
        <button onClick={fetchOverview} className="btn-secondary mt-2 text-xs">
          Retry
        </button>
      </div>
    );
  }

  if (!overview || overview.total_count === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--pl-text-muted)] text-sm">No news available at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview Summary */}
      <div className="p-4 rounded-lg bg-gradient-to-r from-[var(--pl-green)]/10 to-[var(--pl-cyan)]/10 border border-[var(--pl-green)]/20">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📊</div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm sm:text-base mb-1">Today's News Overview</h4>
            <p className="text-xs sm:text-sm text-[var(--pl-text-muted)]">{overview.overview}</p>
          </div>
        </div>
      </div>

      {/* Highlights - Big News for Today */}
      {overview.highlights && overview.highlights.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <span>Today's Highlights</span>
          </h4>
          <div className="space-y-3">
            {overview.highlights.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-4 rounded-lg bg-gradient-to-r from-[var(--pl-pink)]/10 to-[var(--pl-purple)]/10 border border-[var(--pl-pink)]/20 hover:bg-[var(--pl-card-hover)] transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-start gap-2 flex-1">
                    <span className="text-lg flex-shrink-0">{getCategoryIcon(item.categories)}</span>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-sm sm:text-base mb-1 line-clamp-2">{item.title}</h5>
                      <p className="text-xs sm:text-sm text-[var(--pl-text-muted)] line-clamp-2">{item.summary}</p>
                    </div>
                  </div>
                  <span className="text-xs text-[var(--pl-text-muted)] whitespace-nowrap flex-shrink-0">
                    {formatTimeAgo(item.publishedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    {item.categories?.map((cat) => (
                      <span
                        key={cat}
                        className={`px-2 py-0.5 rounded text-xs font-medium border ${getCategoryColor(item.categories)}`}
                      >
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </span>
                    ))}
                    <span className="text-xs text-[var(--pl-text-muted)]">{item.source}</span>
                  </div>
                  <span className="text-xs text-[var(--pl-green)] hover:underline">Read more →</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Big News - Top Stories */}
      {overview.big_news && overview.big_news.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <span className="text-lg">🔥</span>
            <span>Top Stories</span>
          </h4>
          <div className="space-y-2">
            {overview.big_news.slice(0, 3).map((item) => {
              // Skip if already in highlights
              if (overview.highlights?.some(h => h.id === item.id)) {
                return null;
              }
              return (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 hover:bg-[var(--pl-card-hover)] transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <span className="text-base flex-shrink-0">{getCategoryIcon(item.categories)}</span>
                      <div className="flex-1 min-w-0">
                        <h5 className="font-semibold text-xs sm:text-sm mb-1 line-clamp-2">{item.title}</h5>
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.categories?.slice(0, 2).map((cat) => (
                            <span
                              key={cat}
                              className={`px-1.5 py-0.5 rounded text-xs font-medium border ${getCategoryColor(item.categories)}`}
                            >
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </span>
                          ))}
                          <span className="text-xs text-[var(--pl-text-muted)]">{item.source}</span>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--pl-text-muted)] whitespace-nowrap flex-shrink-0">
                      {formatTimeAgo(item.publishedAt)}
                    </span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Category Summary */}
      {overview.categories && Object.keys(overview.categories).length > 0 && (
        <div className="pt-2 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-[var(--pl-text-muted)]">Categories:</span>
            {Object.entries(overview.categories).map(([cat, count]) => (
              <span
                key={cat}
                className="px-2 py-1 rounded text-xs bg-[var(--pl-dark)]/50 border border-white/10"
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)} ({count})
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}










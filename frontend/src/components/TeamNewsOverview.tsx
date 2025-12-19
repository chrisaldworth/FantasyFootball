'use client';

import { useState, useEffect, useMemo } from 'react';
import { footballApi } from '@/lib/api';
import CompactNewsCard from './news/CompactNewsCard';
import ShowMoreButton from './news/ShowMoreButton';
import CollapsibleSection from './shared/CollapsibleSection';

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

// Calculate priority based on importance score and categories
const calculatePriority = (item: NewsItem): 'high' | 'medium' | 'low' => {
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

export default function TeamNewsOverview({ teamId, teamName }: TeamNewsOverviewProps) {
  const [overview, setOverview] = useState<NewsOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);
  
  const initialItems = 5;

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

  // Combine all news and remove duplicates
  const allNews = useMemo(() => {
    if (!overview) return [];
    
    const combined = [
      ...(overview.highlights || []),
      ...(overview.big_news || []),
    ];
    
    // Remove duplicates
    const uniqueNews = combined.filter((item, index, self) =>
      index === self.findIndex((t) => t.id === item.id)
    );
    
    // Sort by priority first, then importance, then date
    return uniqueNews.sort((a, b) => {
      const priorityA = calculatePriority(a);
      const priorityB = calculatePriority(b);
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      
      if (priorityA !== priorityB) {
        return priorityOrder[priorityA] - priorityOrder[priorityB];
      }
      
      // Then by importance score
      const importanceDiff = (b.importance_score || 0) - (a.importance_score || 0);
      if (importanceDiff !== 0) {
        return importanceDiff;
      }
      
      // Then by date (newest first)
      return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
    });
  }, [overview]);
  
  // Limit display
  const displayedNews = showAll ? allNews : allNews.slice(0, initialItems);

  if (!overview || overview.total_count === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--pl-text-muted)] text-sm">No news available at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Overview Summary - Collapsible */}
      {overview.overview && (
        <CollapsibleSection
          title="Today's News Overview"
          defaultExpanded={false}
          className="mb-4"
        >
          <p className="text-xs sm:text-sm text-[var(--pl-text-muted)]">{overview.overview}</p>
        </CollapsibleSection>
      )}

      {/* Unified News List */}
      {allNews.length > 0 && (
        <div className="space-y-3">
          {displayedNews.map((item) => (
            <CompactNewsCard
              key={item.id}
              newsItem={{
                ...item,
                type: 'team' as const,
              }}
            />
          ))}
          
          {/* Show More Button */}
          {allNews.length > initialItems && (
            <ShowMoreButton
              showAll={showAll}
              remainingCount={allNews.length - initialItems}
              onToggle={() => setShowAll(!showAll)}
            />
          )}
        </div>
      )}
    </div>
  );
}










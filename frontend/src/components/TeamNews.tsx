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
}

interface TeamNewsProps {
  teamId: number;
  teamName: string;
}

export default function TeamNews({ teamId, teamName }: TeamNewsProps) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNews();
  }, [teamId]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      setError('');
      // For now, we'll use placeholder data or fetch from an API
      // In the future, this could integrate with a news API
      const data = await footballApi.getTeamNews(teamId);
      if (data.error) {
        setError(data.error);
      } else {
        setNews(data.news || []);
      }
    } catch (err: any) {
      // If endpoint doesn't exist yet, use placeholder news
      setNews(getPlaceholderNews(teamName));
    } finally {
      setLoading(false);
    }
  };

  const getPlaceholderNews = (team: string): NewsItem[] => {
    // Placeholder news items - in production, this would come from an API
    return [
      {
        id: '1',
        title: `${team} prepare for upcoming fixture`,
        summary: `Latest updates from the ${team} camp as they prepare for their next Premier League match.`,
        publishedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        source: 'Premier League',
      },
      {
        id: '2',
        title: `Manager press conference highlights`,
        summary: `Key quotes from the manager's latest press conference ahead of the weekend fixture.`,
        publishedAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
        source: 'Club Official',
      },
      {
        id: '3',
        title: `Injury update ahead of matchday`,
        summary: `Latest team news and injury updates as ${team} prepare for their next fixture.`,
        publishedAt: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
        source: 'Premier League',
      },
    ];
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

  if (error && news.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--pl-text-muted)] text-sm">{error}</p>
      </div>
    );
  }

  if (news.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--pl-text-muted)] text-sm">No news available at the moment</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {news.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-lg bg-[var(--pl-dark)]/50 border border-white/10 hover:bg-[var(--pl-card-hover)] transition-all"
        >
          <div className="flex items-start justify-between gap-3 mb-2">
            <h4 className="font-semibold text-sm sm:text-base flex-1">{item.title}</h4>
            <span className="text-xs text-[var(--pl-text-muted)] whitespace-nowrap">
              {formatTimeAgo(item.publishedAt)}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--pl-text-muted)] mb-2">{item.summary}</p>
          <div className="flex items-center justify-between">
            <span className="text-xs text-[var(--pl-text-muted)]">{item.source}</span>
            {item.url && (
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-[var(--pl-green)] hover:underline"
              >
                Read more →
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}


"""
News Service - Fetches and parses RSS feeds for football team news
"""
import feedparser
import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
import re


class NewsService:
    """Service for fetching football team news from RSS feeds"""
    
    def __init__(self):
        self.client = httpx.AsyncClient(timeout=30.0)
        
        # RSS feed URLs for football news
        self.rss_feeds = [
            "https://feeds.bbci.co.uk/sport/football/rss.xml",  # BBC Sport
            "https://www.skysports.com/rss/football",  # Sky Sports
            "https://www.theguardian.com/football/rss",  # The Guardian
            "https://www.espn.com/espn/rss/news",  # ESPN (general sports, filter for football)
        ]
        
        # Team name mappings - map FPL team names to common variations used in news
        self.team_name_mappings = {
            "Arsenal": ["Arsenal", "Gunners"],
            "Aston Villa": ["Aston Villa", "Villa"],
            "Bournemouth": ["Bournemouth", "Cherries"],
            "Brentford": ["Brentford", "Bees"],
            "Brighton": ["Brighton", "Brighton & Hove Albion", "Seagulls"],
            "Burnley": ["Burnley", "Clarets"],
            "Chelsea": ["Chelsea", "Blues"],
            "Crystal Palace": ["Crystal Palace", "Palace", "Eagles"],
            "Everton": ["Everton", "Toffees"],
            "Fulham": ["Fulham", "Cottagers"],
            "Liverpool": ["Liverpool", "Reds"],
            "Luton": ["Luton", "Luton Town", "Hatters"],
            "Manchester City": ["Manchester City", "Man City", "City", "Citizens"],
            "Manchester Utd": ["Manchester United", "Man United", "Man Utd", "United", "Red Devils"],
            "Newcastle": ["Newcastle", "Newcastle United", "Magpies"],
            "Nottingham Forest": ["Nottingham Forest", "Forest", "Nott'm Forest"],
            "Sheffield Utd": ["Sheffield United", "Sheff Utd", "Blades"],
            "Tottenham": ["Tottenham", "Spurs", "Tottenham Hotspur"],
            "West Ham": ["West Ham", "West Ham United", "Hammers"],
            "Wolves": ["Wolves", "Wolverhampton", "Wanderers"],
        }
    
    def _normalize_team_name(self, team_name: str) -> List[str]:
        """Get all possible name variations for a team"""
        # Check if team name is in mappings
        for key, variations in self.team_name_mappings.items():
            if team_name == key or team_name in variations:
                return variations
        
        # If not found, return the team name and common variations
        return [team_name]
    
    def _is_team_related(self, title: str, summary: str, team_names: List[str]) -> bool:
        """Check if a news item is related to the team"""
        text = f"{title} {summary}".lower()
        
        for team_name in team_names:
            if team_name.lower() in text:
                return True
        
        return False
    
    def _parse_feed_item(self, item: Dict[str, Any], team_names: List[str]) -> Optional[Dict[str, Any]]:
        """Parse a single RSS feed item and check if it's team-related"""
        title = item.get('title', '')
        summary = item.get('summary', '') or item.get('description', '')
        link = item.get('link', '')
        
        # Check if this news item is related to the team
        if not self._is_team_related(title, summary, team_names):
            return None
        
        # Parse published date
        published_parsed = item.get('published_parsed')
        published_at = None
        if published_parsed:
            try:
                published_at = datetime(*published_parsed[:6]).isoformat()
            except:
                pass
        
        # If no parsed date, use current time as fallback
        if not published_at:
            published_at = datetime.now().isoformat()
        
        # Extract source from feed title or link
        source = "Football News"
        if 'bbc' in link.lower():
            source = "BBC Sport"
        elif 'skysports' in link.lower():
            source = "Sky Sports"
        elif 'theguardian' in link.lower():
            source = "The Guardian"
        elif 'espn' in link.lower():
            source = "ESPN"
        
        # Clean up summary (remove HTML tags if present)
        summary_clean = re.sub(r'<[^>]+>', '', summary)
        summary_clean = summary_clean.strip()
        
        # Limit summary length
        if len(summary_clean) > 200:
            summary_clean = summary_clean[:200] + "..."
        
        return {
            'id': link or f"news-{hash(title)}",
            'title': title,
            'summary': summary_clean or title,  # Use title as fallback if no summary
            'publishedAt': published_at,
            'source': source,
            'url': link,
        }
    
    async def get_team_news(self, team_name: str, limit: int = 10) -> List[Dict[str, Any]]:
        """
        Fetch news for a specific team from RSS feeds
        
        Args:
            team_name: Name of the team (FPL team name)
            limit: Maximum number of news items to return
            
        Returns:
            List of news items
        """
        print(f"[News Service] Fetching news for team: {team_name}")
        
        # Get all name variations for the team
        team_names = self._normalize_team_name(team_name)
        print(f"[News Service] Searching for: {team_names}")
        
        all_news = []
        
        # Fetch from all RSS feeds
        for feed_url in self.rss_feeds:
            try:
                print(f"[News Service] Fetching from: {feed_url}")
                response = await self.client.get(feed_url)
                response.raise_for_status()
                
                # Parse RSS feed
                feed = feedparser.parse(response.text)
                
                # Process each item in the feed
                for item in feed.entries:
                    news_item = self._parse_feed_item(item, team_names)
                    if news_item:
                        all_news.append(news_item)
                
                print(f"[News Service] Found {len([n for n in all_news if n])} relevant items from {feed_url}")
                
            except Exception as e:
                print(f"[News Service] Error fetching from {feed_url}: {e}")
                continue
        
        # Remove duplicates (based on title similarity)
        seen_titles = set()
        unique_news = []
        for item in all_news:
            title_lower = item['title'].lower()
            # Simple deduplication - check if we've seen a very similar title
            is_duplicate = False
            for seen_title in seen_titles:
                # If titles are very similar (80% overlap), consider it duplicate
                if self._similarity(title_lower, seen_title) > 0.8:
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                seen_titles.add(title_lower)
                unique_news.append(item)
        
        # Sort by published date (most recent first)
        unique_news.sort(
            key=lambda x: x.get('publishedAt', ''),
            reverse=True
        )
        
        # Limit results
        result = unique_news[:limit]
        print(f"[News Service] Returning {len(result)} news items for {team_name}")
        
        return result
    
    def _similarity(self, s1: str, s2: str) -> float:
        """Calculate simple similarity between two strings"""
        # Simple word overlap similarity
        words1 = set(s1.split())
        words2 = set(s2.split())
        
        if not words1 or not words2:
            return 0.0
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        return len(intersection) / len(union) if union else 0.0
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Singleton instance
news_service = NewsService()


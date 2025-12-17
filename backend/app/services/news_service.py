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
    
    def _categorize_news(self, news_item: Dict[str, Any]) -> Dict[str, Any]:
        """Categorize and score news importance"""
        title = news_item.get('title', '').lower()
        summary = news_item.get('summary', '').lower()
        text = f"{title} {summary}"
        
        # Keywords for different news types
        transfer_keywords = ['transfer', 'signing', 'sign', 'deal', 'move', 'join', 'leave', 'exit', 'departure', 'arrival']
        injury_keywords = ['injury', 'injured', 'fitness', 'doubt', 'concern', 'scan', 'recovery', 'out', 'ruled out']
        match_keywords = ['match', 'fixture', 'game', 'vs', 'versus', 'defeat', 'win', 'victory', 'draw', 'result']
        manager_keywords = ['manager', 'coach', 'boss', 'press conference', 'interview', 'quotes']
        contract_keywords = ['contract', 'extension', 'renew', 'agreement', 'deal']
        
        categories = []
        importance_score = 0
        
        # Check for transfer news (high importance)
        if any(keyword in text for keyword in transfer_keywords):
            categories.append('transfer')
            importance_score += 10
        
        # Check for injury news (high importance)
        if any(keyword in text for keyword in injury_keywords):
            categories.append('injury')
            importance_score += 8
        
        # Check for match results/news (medium importance)
        if any(keyword in text for keyword in match_keywords):
            categories.append('match')
            importance_score += 5
        
        # Check for manager news (medium importance)
        if any(keyword in text for keyword in manager_keywords):
            categories.append('manager')
            importance_score += 4
        
        # Check for contract news (medium importance)
        if any(keyword in text for keyword in contract_keywords):
            categories.append('contract')
            importance_score += 6
        
        # Boost importance if published today
        published_at = news_item.get('publishedAt', '')
        if published_at:
            try:
                # Handle timezone-aware and timezone-naive datetimes
                pub_str = published_at.replace('Z', '+00:00')
                try:
                    pub_date = datetime.fromisoformat(pub_str)
                    # Convert to naive datetime for comparison
                    if pub_date.tzinfo:
                        from datetime import timezone
                        utc_now = datetime.now(timezone.utc)
                        pub_date_utc = pub_date.astimezone(timezone.utc)
                        hours_ago = (utc_now - pub_date_utc).total_seconds() / 3600
                    else:
                        hours_ago = (datetime.now() - pub_date).total_seconds() / 3600
                except ValueError:
                    # Fallback for other date formats
                    pub_date = datetime.fromisoformat(pub_str.split('+')[0].split('Z')[0])
                    hours_ago = (datetime.now() - pub_date).total_seconds() / 3600
                
                if hours_ago < 24:
                    importance_score += 3  # Boost for recent news
                if hours_ago < 6:
                    importance_score += 5  # Extra boost for very recent news
            except Exception as e:
                print(f"[News Service] Error parsing date {published_at}: {e}")
                pass
        
        return {
            'categories': categories if categories else ['general'],
            'importance_score': importance_score,
        }
    
    async def get_team_news_overview(self, team_name: str, limit: int = 20) -> Dict[str, Any]:
        """
        Get news overview with analysis and highlights for a team
        
        Args:
            team_name: Name of the team (FPL team name)
            limit: Maximum number of news items to analyze
            
        Returns:
            Dictionary with overview, highlights, and categorized news
        """
        print(f"[News Service] Fetching news overview for team: {team_name}")
        
        # Get all news items
        all_news = await self.get_team_news(team_name, limit=limit)
        
        if not all_news:
            return {
                'overview': f'No recent news found for {team_name}.',
                'highlights': [],
                'big_news': [],
                'categories': {},
                'total_count': 0,
            }
        
        # Categorize and score each news item
        categorized_news = []
        for item in all_news:
            category_info = self._categorize_news(item)
            categorized_news.append({
                **item,
                **category_info,
            })
        
        # Sort by importance score (highest first)
        categorized_news.sort(key=lambda x: x.get('importance_score', 0), reverse=True)
        
        # Get big news (top 3-5 most important)
        big_news = categorized_news[:5]
        
        # Get today's highlights (published in last 24 hours, high importance)
        from datetime import timezone
        utc_now = datetime.now(timezone.utc)
        highlights = []
        for item in categorized_news:
            try:
                pub_str = item.get('publishedAt', '').replace('Z', '+00:00')
                try:
                    pub_date = datetime.fromisoformat(pub_str)
                    if pub_date.tzinfo:
                        pub_date_utc = pub_date.astimezone(timezone.utc)
                        hours_ago = (utc_now - pub_date_utc).total_seconds() / 3600
                    else:
                        hours_ago = (datetime.now() - pub_date).total_seconds() / 3600
                except ValueError:
                    # Fallback for other date formats
                    pub_date = datetime.fromisoformat(pub_str.split('+')[0].split('Z')[0])
                    hours_ago = (datetime.now() - pub_date).total_seconds() / 3600
                
                if hours_ago < 24 and item.get('importance_score', 0) >= 8:
                    highlights.append(item)
            except Exception as e:
                print(f"[News Service] Error parsing date for highlights: {e}")
                pass
        
        # Limit highlights to top 3
        highlights = highlights[:3]
        
        # Group by category
        categories = {}
        for item in categorized_news:
            for cat in item.get('categories', ['general']):
                if cat not in categories:
                    categories[cat] = []
                categories[cat].append(item)
        
        # Generate overview summary
        overview_parts = []
        if highlights:
            overview_parts.append(f"{len(highlights)} major story{'ies' if len(highlights) > 1 else ''} today")
        if 'transfer' in categories:
            overview_parts.append(f"{len(categories['transfer'])} transfer update{'s' if len(categories['transfer']) > 1 else ''}")
        if 'injury' in categories:
            overview_parts.append(f"{len(categories['injury'])} injury update{'s' if len(categories['injury']) > 1 else ''}")
        
        overview = f"Latest updates for {team_name}. " + ", ".join(overview_parts) + "." if overview_parts else f"Recent news and updates for {team_name}."
        
        return {
            'overview': overview,
            'highlights': highlights,
            'big_news': big_news,
            'categories': {k: len(v) for k, v in categories.items()},
            'total_count': len(all_news),
            'team': team_name,
        }
    
    async def close(self):
        """Close the HTTP client"""
        await self.client.aclose()


# Singleton instance
news_service = NewsService()


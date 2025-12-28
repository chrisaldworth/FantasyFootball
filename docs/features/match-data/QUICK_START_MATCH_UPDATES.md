# Quick Start: Automated Match Updates

**Recommended Method: FPL API** ⭐

---

## 🚀 Quick Start (FPL API - Recommended)

```bash
# Update matches from last 7 days
./backend/scripts/update_matches_from_fpl_api.sh

# Update matches from last 3 days  
./backend/scripts/update_matches_from_fpl_api.sh --days 3

# Update specific gameweek
./backend/scripts/update_matches_from_fpl_api.sh --gameweek 19
```

**That's it!** The FPL API method is fast, reliable, and updates your database directly.

---

## 📅 Schedule Daily Updates

Add to crontab (`crontab -e`):

```bash
# Run daily at 2 AM
0 2 * * * /path/to/FantasyFootball/backend/scripts/update_matches_from_fpl_api.sh --days 3
```

---

## 🔄 Alternative: fbref.com Scraper (For Detailed Stats)

If you need detailed match statistics (lineups, player stats, events):

```bash
# Use scraper for comprehensive data
./backend/scripts/auto_update_matches.sh --use-scraper --days 7
```

---

## 📊 What Gets Updated?

### FPL API Updates:
- ✅ Match scores (home/away)
- ✅ Match status (finished/live/scheduled)
- ✅ Match dates and kickoff times
- ✅ Team information

### fbref.com Scraper Updates:
- ✅ Everything from FPL API, plus:
- ✅ Detailed player statistics
- ✅ Lineups (starting XI + substitutes)
- ✅ Match events (goals, cards, substitutions)
- ✅ Venue and referee information

---

## 🎯 Recommendation

**For regular automated updates**: Use **FPL API** (fast, reliable, real-time)

**For detailed analysis**: Use **fbref.com scraper** (comprehensive data, but slower)

---

## 📚 More Information

- **FPL API Guide**: `docs/features/match-data/FPL_API_MATCH_UPDATES.md`
- **Full Documentation**: `docs/features/match-data/AUTO_UPDATE_MATCHES.md`

---

**Last Updated**: 2025-12-21


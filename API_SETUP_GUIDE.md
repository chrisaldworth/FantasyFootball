# Football API Setup Guide

This guide explains how to set up additional data sources for UK football teams and fixtures.

## Current Data Sources

### ✅ FPL API (Always Available - No Key Required)
- **Coverage:** Premier League only
- **Data:** Teams, fixtures, results, player data
- **Status:** ✅ Working - No setup required

### ⚠️ Additional APIs (Require Free Registration)

To get data for **Championship, League One, League Two, Scottish Premiership, FA Cup, League Cup, Champions League**, you need to add one of these APIs:

## Option 1: Football-Data.org (Recommended - Free)

**Best for:** UK leagues, simple setup

### Setup Steps:

1. **Register for Free Account:**
   - Go to: https://www.football-data.org/
   - Click "Sign Up" (free)
   - Verify your email

2. **Get Your API Key:**
   - Log in to your account
   - Go to "API" section
   - Copy your API token (looks like: `abc123def456...`)

3. **Add to Backend:**
   ```bash
   # Edit backend/.env
   FOOTBALL_DATA_KEY=your_api_token_here
   ```

4. **Restart Backend:**
   ```bash
   # The backend will automatically use this key
   ```

### What You Get:
- ✅ Championship teams & fixtures
- ✅ League One teams & fixtures
- ✅ League Two teams & fixtures
- ✅ Scottish Premiership teams & fixtures
- ✅ FA Cup fixtures
- ✅ League Cup fixtures
- ✅ Team logos, venues, founded dates
- ⚠️ Limited to 10 calls/minute (free tier)

## Option 2: API-FOOTBALL (More Features)

**Best for:** More competitions, better coverage

### Setup Steps:

1. **Register for Free Account:**
   - Go to: https://www.api-football.com/
   - Sign up (free tier available)
   - Verify your email

2. **Get Your API Key:**
   - Log in
   - Go to "Dashboard" → "API Key"
   - Copy your RapidAPI key

3. **Add to Backend:**
   ```bash
   # Edit backend/.env
   API_FOOTBALL_KEY=your_rapidapi_key_here
   ```

4. **Restart Backend**

### What You Get:
- ✅ All UK leagues (Championship, League One, League Two)
- ✅ Champions League fixtures
- ✅ Europa League fixtures
- ✅ FA Cup fixtures
- ✅ League Cup fixtures
- ✅ Team logos and detailed info
- ✅ Match statistics, lineups, events
- ⚠️ Limited to 100 requests/day (free tier)

## Quick Setup (Choose One)

### Football-Data.org (Easiest)
```bash
# 1. Register at https://www.football-data.org/
# 2. Get your API token
# 3. Add to backend/.env:
echo "FOOTBALL_DATA_KEY=your_token_here" >> backend/.env

# 4. Restart backend
```

### API-FOOTBALL (More Features)
```bash
# 1. Register at https://www.api-football.com/
# 2. Get your RapidAPI key
# 3. Add to backend/.env:
echo "API_FOOTBALL_KEY=your_key_here" >> backend/.env

# 4. Restart backend
```

## Testing Your Setup

After adding an API key, test it:

```bash
# Check backend health
curl http://localhost:8080/health

# Test API connection
curl http://localhost:8080/api/football/test
```

Or visit in browser:
- http://localhost:8080/api/football/test

## What Data You'll Get

### With FPL API Only (Current):
- ✅ Premier League teams (20 teams)
- ✅ Premier League fixtures & results
- ❌ No Championship, League One, League Two
- ❌ No FA Cup, League Cup
- ❌ No Champions League

### With Football-Data.org Added:
- ✅ Premier League (20 teams)
- ✅ Championship (24 teams)
- ✅ League One (24 teams)
- ✅ League Two (24 teams)
- ✅ Scottish Premiership (12 teams)
- ✅ FA Cup fixtures
- ✅ League Cup fixtures
- ✅ Team logos, venues, info

### With API-FOOTBALL Added:
- ✅ All of the above PLUS:
- ✅ Champions League fixtures
- ✅ Europa League fixtures
- ✅ More detailed match statistics
- ✅ Lineups and events

## Cost Comparison

| Service | Free Tier | Paid Plans |
|---------|-----------|------------|
| **FPL API** | ✅ Unlimited | N/A (Free) |
| **Football-Data.org** | ✅ 10 calls/min | From €10/month |
| **API-FOOTBALL** | ✅ 100 calls/day | From $10/month |

## Recommendation

**For UK teams only:** Use **Football-Data.org** (simpler, sufficient for UK leagues)

**For all competitions:** Use **API-FOOTBALL** (more features, Champions League, etc.)

**For development/testing:** Start with **Football-Data.org** (easier setup)

## Troubleshooting

### "No teams returned"
- Check API key is set correctly in `.env`
- Restart backend after adding key
- Verify key is active in provider dashboard

### "Rate limit exceeded"
- Free tiers have limits
- Football-Data.org: 10 calls/minute
- API-FOOTBALL: 100 calls/day
- Consider caching or upgrading plan

### "API key invalid"
- Verify key is copied correctly (no extra spaces)
- Check key hasn't expired
- Re-generate key if needed

## Next Steps

1. Choose an API provider
2. Register and get API key
3. Add to `backend/.env`
4. Restart backend
5. Test with `/api/football/test` endpoint
6. Enjoy expanded team and fixture data! 🎉










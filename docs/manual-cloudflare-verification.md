# Manual Cloudflare Verification Guide

## The Problem

Cloudflare is detecting the automated browser and requiring human verification. Even with `undetected-chromedriver`, you may still need to verify manually.

## Solution: Run in Visible Mode and Complete Verification

### Step 1: Install undetected-chromedriver (if not already installed)

```bash
cd /Users/chrisaldworth/Football/FantasyFootball/backend
source venv/bin/activate
pip install undetected-chromedriver
```

### Step 2: Run with --no-headless flag

```bash
cd /Users/chrisaldworth/Football/FantasyFootball/backend && source venv/bin/activate && python scripts/scrape_fbref_comprehensive.py --season 25/26 --delay 0.5 --skip-club-matches --no-headless
```

### Step 3: When Cloudflare Appears

1. **A browser window will open** - Don't close it!
2. **You'll see a Cloudflare verification page** with a checkbox
3. **Click the checkbox** to verify you're human
4. **Wait for it to complete** - The page will redirect automatically
5. **The script will continue** - You'll see "✓ Cloudflare verification completed" in the terminal

### Important Notes

- **Keep the browser window open** - Don't close it while the script is running
- **You may need to verify multiple times** - Cloudflare may challenge again for different pages
- **The script will wait up to 2 minutes** for you to complete each verification
- **After verification, the script continues automatically** - No need to do anything else

## Alternative: Increase Delays

If you're getting too many challenges, try increasing the delay:

```bash
python scripts/scrape_fbref_comprehensive.py --season 25/26 --delay 2.0 --skip-club-matches --no-headless
```

Or even longer:

```bash
python scripts/scrape_fbref_comprehensive.py --season 25/26 --delay 3.0 --skip-club-matches --no-headless
```

## What the Script Does Now

- ✅ Detects Cloudflare challenges automatically
- ✅ Waits for you to complete verification (up to 2 minutes)
- ✅ Continues automatically after verification
- ✅ Works on both schedule page and individual match pages
- ✅ Provides clear instructions in the terminal

## Troubleshooting

**Q: The script times out waiting for verification**
- Make sure you're running with `--no-headless`
- Complete the verification within 2 minutes
- Try increasing the delay with `--delay 2.0`

**Q: I keep getting challenged**
- This is normal - Cloudflare may challenge multiple times
- Just complete each verification as it appears
- Consider using a VPN if it's excessive

**Q: The browser closes before I can verify**
- Make sure you're using `--no-headless`
- The browser should stay open during verification




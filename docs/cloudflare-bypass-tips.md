# Cloudflare Bypass Tips

If the scraper is being blocked by Cloudflare, try these solutions:

## 1. Run in Non-Headless Mode (Recommended)

Cloudflare is less likely to block visible browsers. Run with `--no-headless`:

```bash
cd /Users/chrisaldworth/Football/FantasyFootball/backend && source venv/bin/activate && python scripts/scrape_fbref_comprehensive.py --season 25/26 --delay 0.5 --skip-club-matches --no-headless
```

## 2. Increase Delay Between Requests

Add more delay to appear more human-like:

```bash
python scripts/scrape_fbref_comprehensive.py --season 25/26 --delay 2.0 --skip-club-matches --no-headless
```

## 3. Wait Between Runs

If you've been blocked, wait 10-15 minutes before trying again. Cloudflare may temporarily block rapid requests.

## 4. Use a VPN

If you're consistently blocked, try using a VPN to change your IP address.

## 5. Manual Intervention

If Cloudflare shows a challenge page, you can:
- Run in non-headless mode (`--no-headless`)
- Manually complete the Cloudflare challenge in the browser window
- The script will continue automatically after the challenge

## What the Script Does

The script now:
- ✅ Uses realistic browser fingerprints
- ✅ Removes automation indicators
- ✅ Detects Cloudflare challenges and waits
- ✅ Uses recent Chrome user agent
- ✅ Sets proper browser properties

## Error Messages

If you see:
- `Cloudflare blocking detected` - Wait 10-15 minutes and try again
- `Access denied` - Cloudflare is blocking your IP, try VPN or wait
- `Page load timeout` - Network issue or Cloudflare challenge taking too long




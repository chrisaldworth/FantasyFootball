# Render Cron Job Setup Guide

This guide shows how to manually create the match data update cron job in Render.

## Step-by-Step Instructions

### 1. Create Cron Job in Render Dashboard

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New"** → **"Cron Job"**
3. Fill in the following:

   **Name:** `match-data-update`
   
   **Region:** Choose your region (same as your API service)
   
   **Branch:** `main` (or your default branch)
   
   **Root Directory:** `backend`
   
   **Environment:** `Python 3`
   
   **Build Command:**
   ```bash
   pip install --upgrade pip setuptools wheel
   pip install --only-binary=all greenlet || pip install greenlet
   pip install -r requirements.txt
   ```
   
   **Start Command:**
   ```bash
   python3 scripts/update_matches_from_fpl_api.py --days 7
   ```
   
   **Schedule:** `0 2 * * *` (Daily at 2 AM UTC)
   
   **OR use cron expression:** `0 2 * * *`

### 2. Add Environment Variables

After creating the cron job, add these environment variables:

1. Go to your cron job → **Environment** tab
2. Add the following variables:

   | Variable | Value | Notes |
   |----------|-------|-------|
   | `DATABASE_URL` | Your database connection string | Same as your main API service |
   | `PL_DATABASE_URL` | (Optional) Separate PL database URL | If not set, uses DATABASE_URL |

### 3. (Optional) Create Weekend Update Cron Job

For more frequent updates during match days:

1. Create another cron job: **"New"** → **"Cron Job"**
2. Name: `match-data-update-matchdays`
3. Same settings as above, but:
   - **Start Command:** `python3 scripts/update_matches_from_fpl_api.py --days 2`
   - **Schedule:** `0 */4 * * 0,6` (Every 4 hours on weekends)

### 4. Verify Cron Job is Running

1. Go to your cron job in Render
2. Click **"Logs"** tab
3. You should see output from the script when it runs
4. Check **"Events"** tab to see when it last ran

## Troubleshooting

### Cron Job Not Appearing

- Make sure you're looking in the correct workspace
- Check if you have the right permissions
- Try refreshing the dashboard

### No Logs Appearing

- Wait for the scheduled time (or trigger manually)
- Check that the script outputs to stdout (uses `print()` statements)
- Verify the cron job is actually running (check Events tab)

### Script Errors

- Check the Logs tab for error messages
- Verify environment variables are set correctly
- Ensure the script path is correct (`scripts/update_matches_from_fpl_api.py`)

## Manual Trigger

To test the cron job immediately:

1. Go to your cron job in Render
2. Click **"Manual Deploy"** or look for a **"Run Now"** button
3. Watch the Logs tab for real-time output

## Schedule Examples

- `0 2 * * *` - Daily at 2 AM UTC
- `0 */4 * * 0,6` - Every 4 hours on weekends (Sat/Sun)
- `0 */2 * * *` - Every 2 hours, every day
- `0 0,12 * * *` - Twice daily (midnight and noon UTC)

## Next Steps

After creating the cron job:
1. Wait for the next scheduled run (or trigger manually)
2. Check the Logs tab to verify it's working
3. Check your match database to see if matches are being updated

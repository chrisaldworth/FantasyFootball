# FPL Login Troubleshooting

If you're getting "Login failed - no session cookies received", FPL may have changed their authentication system.

## Quick Fix: Manual Cookie Method

If automated login doesn't work, you can manually extract your session cookies:

### Steps:

1. **Open your browser** and go to https://fantasy.premierleague.com
2. **Log in** to FPL normally
3. **Open Developer Tools** (F12 or Right-click → Inspect)
4. **Go to Application/Storage tab** → Cookies → `https://fantasy.premierleague.com`
5. **Find these cookies:**
   - `pl_profile` or `sessionid` or `pl_session`
   - `csrftoken`
6. **Copy the cookie values**

Then we can add a feature to paste these cookies directly (coming soon).

## Alternative: Use Planning Mode

You can still use all features without linking:
- **Team Selection** - Plan your changes (then apply on FPL website)
- **Transfer Assistant** - Get recommendations
- **Captain Pick** - See optimal captain
- **Squad Form** - Analyze player form

Just click "Open FPL Website →" after planning your changes.

## Why This Happens

FPL may have:
- Added JavaScript-based authentication
- Changed their login endpoints
- Added bot protection
- Moved to OAuth flow

We're working on a solution using browser automation (Playwright) which will handle these cases.


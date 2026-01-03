# Vercel Preview Deployment Guide

This guide explains how to use Vercel preview deployments to test changes in a cloud environment with better error reporting.

## Overview

Since the app uses Next.js static export, we can't run a true "development" server on Vercel. However, we can use **preview deployments** to test changes before merging to production.

## Setting Up Preview Deployments

### Option 1: Automatic Preview Deployments (Recommended)

Vercel automatically creates preview deployments for:
- Pull requests
- Commits to branches other than `main`

**Steps:**
1. Create a new branch: `git checkout -b preview/test-errors`
2. Make your changes
3. Push to GitHub: `git push origin preview/test-errors`
4. Vercel will automatically create a preview deployment
5. Check the Vercel dashboard for the preview URL

### Option 2: Manual Preview Branch

Create a dedicated preview branch that you can push to:

```bash
# Create and push preview branch
git checkout -b preview
git push origin preview

# When you want to test changes:
git checkout preview
git merge main  # or cherry-pick specific commits
git push origin preview
```

## Enabling Better Error Reporting

### Source Maps (Already Enabled)

Source maps are enabled in `next.config.ts` with `productionBrowserSourceMaps: true`. This allows you to see:
- Original file names and line numbers in error stack traces
- Better debugging information in browser DevTools

### Viewing Errors in Preview Deployments

1. **Browser Console**: Open DevTools (F12) and check the Console tab
2. **Error Boundary**: The app has an ErrorBoundary that catches React errors and displays them
3. **Network Tab**: Check for API errors (500, 404, etc.)

## Debugging Tips

### 1. Check Browser Console
- Open DevTools (F12)
- Look for unminified errors in the Console
- Check the Network tab for failed API requests

### 2. Use React DevTools
- Install React DevTools browser extension
- Inspect component tree and state

### 3. Check Vercel Logs
- Go to Vercel Dashboard → Your Project → Deployments
- Click on a deployment → View Function Logs
- Check for server-side errors

### 4. Enable Verbose Logging

Add this to your component to see more details:

```typescript
// In development, log more details
if (process.env.NODE_ENV === 'development') {
  console.log('Component state:', state);
  console.log('Props:', props);
}
```

## Environment Variables

You can set different environment variables for preview deployments:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add variables and select "Preview" as the environment
3. These will only apply to preview deployments, not production

## Comparing Production vs Preview

To compare production and preview:
1. Production: `https://fotmate.com`
2. Preview: Check Vercel dashboard for preview URL

## Troubleshooting

### Preview Not Updating
- Check that you pushed to the branch
- Verify the deployment in Vercel dashboard
- Check build logs for errors

### Errors Still Minified
- Clear browser cache
- Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
- Check that source maps are enabled in `next.config.ts`

### Can't See Stack Traces
- Enable source maps (already done)
- Check browser DevTools → Sources tab
- Look for original source files, not minified bundles

## Best Practices

1. **Always test in preview before merging to main**
2. **Use descriptive branch names** (e.g., `preview/fix-react-error-310`)
3. **Check preview URL in PR description** for easy access
4. **Monitor Vercel build logs** for build-time errors
5. **Use browser DevTools** for runtime errors

## Quick Commands

```bash
# Create preview branch
git checkout -b preview/test-feature

# Push and create preview deployment
git push origin preview/test-feature

# Merge specific commit to preview
git checkout preview
git cherry-pick <commit-hash>
git push origin preview
```

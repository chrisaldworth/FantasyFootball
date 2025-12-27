# Debugging Admin Access Issues

If you're being redirected from `/admin` back to home, follow these steps:

## Step 1: Check the Debug Page

Visit: **`https://fotmate.com/admin/debug`**

This page will show you:
- What the auth context thinks your role is
- What the API actually returns
- Full user object details
- Environment configuration

**Look for:**
- Is `role` showing as `admin` or `super_admin`?
- Is `role` showing as `null` or `undefined`?
- Does the API response match the auth context?

## Step 2: Check Browser Console

Open your browser's Developer Tools (F12) and check the Console tab.

You should see logs like:
```
[Auth] User data after login: {...}
[Auth] User role: admin
[Admin Layout] Auth state: { hasUser: true, userRole: 'admin', ... }
[Admin] ✅ Access granted, role: admin
```

**If you see:**
```
[Admin] User role is not admin: user
```
or
```
[Admin] User role is not admin: null
```

Then the role isn't set correctly in the database or isn't being returned by the API.

## Step 3: Verify Database Role

Connect to your Neon database and run:

```sql
SELECT id, email, username, role FROM users WHERE email = 'your-email@example.com';
```

**Expected result:**
```
id | email              | username | role
---|--------------------|----------|------
1  | your-email@...     | ...      | admin
```

**If `role` is `NULL` or `user`:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

## Step 4: Test API Directly

Open your browser console and run:

```javascript
const token = localStorage.getItem('token');
fetch('https://fpl-companion-api.onrender.com/api/auth/me', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('API Response:', data);
  console.log('Role:', data.role);
});
```

**Check:**
- Does the response include `role: "admin"`?
- Is `role` missing or `null`?

## Step 5: Clear Cache and Re-login

1. **Clear browser cache:**
   - Chrome: Settings → Privacy → Clear browsing data → Cached images and files
   - Or use Incognito/Private mode

2. **Clear localStorage:**
   - Open browser console
   - Run: `localStorage.clear()`

3. **Log out and log back in:**
   - Make sure you log out properly (don't just close the tab)
   - Log back in with your credentials
   - Check console logs for role

## Step 6: Check Backend Logs

If you have access to your backend logs (Render dashboard), check for:
- Any errors when calling `/api/auth/me`
- Database connection issues
- SQL errors

## Common Issues

### Issue 1: Role is `null` in Database
**Solution:** Run the SQL update command from Step 3

### Issue 2: Role is `user` instead of `admin`
**Solution:** You updated the wrong user or the update didn't work. Re-run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

### Issue 3: API Returns Role but Frontend Doesn't See It
**Solution:** 
- Clear browser cache
- Clear localStorage
- Log out and log back in
- Check browser console for errors

### Issue 4: Role Column Doesn't Exist
**Solution:** Run this SQL:
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Issue 5: CORS or Network Issues
**Solution:**
- Check that your backend URL is correct in the frontend
- Check browser Network tab for failed requests
- Verify backend is running and accessible

## Quick Fix Script

If you have access to your Neon database, run this complete fix:

```sql
-- Add role column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';

-- Set your user to admin (REPLACE WITH YOUR EMAIL)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Verify
SELECT id, email, username, role, is_active FROM users WHERE email = 'your-email@example.com';
```

Then:
1. Clear browser localStorage: `localStorage.clear()` in console
2. Log out
3. Log back in
4. Visit `/admin/debug` to verify
5. Try `/admin` again

## Still Not Working?

If after all these steps it still doesn't work:

1. **Check the debug page** (`/admin/debug`) and note:
   - What role is shown in "Auth Context State"
   - What role is shown in "API Response"
   - Any error messages

2. **Share the debug info:**
   - Screenshot of `/admin/debug` page
   - Browser console logs
   - Database query result showing your role

3. **Check backend:**
   - Is the backend running?
   - Are there any errors in backend logs?
   - Can you access `/api/auth/me` directly with your token?


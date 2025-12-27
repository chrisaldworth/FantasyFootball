# Quick Fix: Admin Portal Access

## Problem
Navigating to `/admin` redirects you back to home page.

## Cause
Your user account doesn't have the `admin` or `super_admin` role set.

## Quick Fix (3 Steps)

### Step 1: Add Role Column (if missing)

**PostgreSQL:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
```

**SQLite:**
```sql
ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';
```

### Step 2: Set Your User to Admin

Replace `your-email@example.com` with your actual email:

**PostgreSQL:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

**SQLite:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Step 3: Log Out and Log Back In

1. Log out from the frontend
2. Log back in
3. Navigate to `/admin`

The frontend caches user data, so you need to refresh it by logging out and back in.

## Verify It Worked

After logging back in, check the browser console (F12 → Console). You should see:
```
[Admin] Access granted, role: admin
```

If you see:
```
[Admin] User role is not admin: user
```

Then the role wasn't updated correctly. Check:
1. Did you use the correct email?
2. Did the SQL command run successfully?
3. Is the role column in the database?

## Alternative: Use API Endpoint

If you have database access via API:

```bash
# First, get your user ID by checking the database or API
# Then update role via API (requires you to be logged in as admin first)
curl -X PUT "https://your-api.com/api/admin/users/{user_id}/role?role=admin" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Still Not Working?

1. **Check browser console** - Look for `[Admin]` log messages
2. **Check Network tab** - See what `/api/auth/me` returns
3. **Verify database** - Run: `SELECT email, role FROM users WHERE email = 'your-email@example.com';`


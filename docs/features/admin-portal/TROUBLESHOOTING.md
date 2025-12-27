# Admin Portal Troubleshooting

## Issue: Redirected from /admin back to home

### Cause
The admin layout checks if the logged-in user has `admin` or `super_admin` role. If not, it redirects to home.

### Solution

#### Step 1: Verify your user has admin role

Check your user's role in the database:

**PostgreSQL:**
```sql
SELECT id, email, username, role FROM users WHERE email = 'your-email@example.com';
```

**SQLite:**
```sql
SELECT id, email, username, role FROM users WHERE email = 'your-email@example.com';
```

#### Step 2: Set your user to admin

**Option A: Direct Database Update**

```sql
-- Update your user to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Or set to super_admin
UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
```

**Option B: Using Admin API (if you have another admin user)**

```bash
# Get your auth token
TOKEN="your-jwt-token"

# Update user role
curl -X PUT "https://your-api.com/api/admin/users/{user_id}/role?role=admin" \
  -H "Authorization: Bearer $TOKEN"
```

**Option C: Using the Setup Script**

If your backend is running locally:

```bash
cd backend
python3 scripts/setup_admin_portal.py
```

Follow the prompts to update your user's role.

#### Step 3: Verify Role Column Exists

If the `role` column doesn't exist in your database:

**PostgreSQL:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
```

**SQLite:**
```sql
ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';
```

Or use the API endpoint:
```bash
curl -X POST https://your-api.com/api/admin/fix-schema
```

#### Step 4: Log out and log back in

After updating your role:
1. Log out from the frontend
2. Log back in
3. Navigate to `/admin`

The frontend caches the user data, so you need to refresh it by logging out and back in.

### Debug Steps

1. **Check browser console:**
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab to see what `/api/auth/me` returns

2. **Verify API response:**
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" https://your-api.com/api/auth/me
   ```
   
   Look for `"role": "admin"` or `"role": "super_admin"` in the response.

3. **Check localStorage:**
   - Open DevTools → Application → Local Storage
   - Check if `token` exists
   - The user data is fetched from `/api/auth/me` on page load

### Common Issues

**Issue:** Role is `null` or `"user"`
- **Fix:** Update role in database (see Step 2 above)

**Issue:** Role column doesn't exist
- **Fix:** Run schema migration (see Step 3 above)

**Issue:** User data not refreshing
- **Fix:** Log out and log back in to refresh cached user data

**Issue:** API returns 401 Unauthorized
- **Fix:** Check that your token is valid and not expired

### Quick Fix Script

If you have database access, run this SQL:

```sql
-- Add role column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';

-- Set your user to admin (replace with your email)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

Then log out and log back in.


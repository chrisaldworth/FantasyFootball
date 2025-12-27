# Setting Admin Role on Cloud Database

## Quick Guide

### Option 1: Using Render.com Database (Recommended)

1. **Access Render Dashboard:**
   - Go to https://dashboard.render.com
   - Find your PostgreSQL database service

2. **Connect to Database:**
   - Click on your database service
   - Go to "Info" or "Connect" tab
   - Copy the "Internal Database URL" or connection string

3. **Use Render Shell (Easiest):**
   - In Render dashboard, click on your database
   - Click "Connect" → "Shell"
   - This opens a psql terminal

4. **Run SQL Commands:**
   ```sql
   -- First, add role column if missing
   ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
   
   -- Then set your user to admin (replace with your email)
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   
   -- Verify it worked
   SELECT id, email, username, role FROM users WHERE email = 'your-email@example.com';
   ```

### Option 2: Using Neon Database

1. **Access Neon Dashboard:**
   - Go to https://console.neon.tech
   - Select your project

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the sidebar
   - Or use the "Query" button

3. **Run SQL Commands:**
   ```sql
   -- Add role column if missing
   ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
   
   -- Set your user to admin
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   
   -- Verify
   SELECT id, email, username, role FROM users WHERE email = 'your-email@example.com';
   ```

### Option 3: Using API Endpoint (No Database Access Needed)

If you can't access the database directly, use the API:

1. **First, add the role column:**
   ```bash
   curl -X POST https://your-api.onrender.com/api/admin/fix-schema
   ```

2. **Then, if you have another admin user, update your role:**
   ```bash
   # Get your auth token (from browser localStorage or login)
   TOKEN="your-jwt-token"
   
   # Get your user ID first (check the /api/auth/me response)
   # Then update role
   curl -X PUT "https://your-api.onrender.com/api/admin/users/{user_id}/role?role=admin" \
     -H "Authorization: Bearer $TOKEN"
   ```

### Option 4: Using Local psql Client

If you have PostgreSQL client installed locally:

1. **Get Connection String from Render/Neon:**
   - Render: Dashboard → Database → "Info" tab → "Internal Database URL"
   - Neon: Dashboard → Connection Details → Connection String

2. **Connect:**
   ```bash
   psql "postgresql://user:password@host:port/database"
   ```

3. **Run SQL:**
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```

### Option 5: Using pgAdmin or DBeaver

1. **Install pgAdmin or DBeaver** (GUI database tools)

2. **Add Connection:**
   - Host: From your cloud provider
   - Port: Usually 5432
   - Database: Your database name
   - Username/Password: From your cloud provider

3. **Run SQL Query:**
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

## Step-by-Step: Render.com

### Method 1: Render Shell (Easiest)

1. Go to https://dashboard.render.com
2. Click on your PostgreSQL database service
3. Click "Connect" → "Shell" (or look for "Shell" button)
4. You'll see a terminal prompt
5. Type: `psql $DATABASE_URL` (or use the connection string shown)
6. Run:
   ```sql
   \c your_database_name
   ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   \q
   ```

### Method 2: Render Web Terminal

1. Go to your database service in Render
2. Look for "Shell" or "Terminal" option
3. Connect and run psql commands

## Step-by-Step: Neon

1. Go to https://console.neon.tech
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Paste and run:
   ```sql
   ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
   UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
   SELECT email, role FROM users WHERE email = 'your-email@example.com';
   ```

## Verification

After running the SQL, verify it worked:

```sql
SELECT id, email, username, role FROM users WHERE email = 'your-email@example.com';
```

You should see `role` = `'admin'`.

Then:
1. Log out from your frontend
2. Log back in
3. Navigate to `/admin`

## Troubleshooting

**Can't find Shell/Terminal:**
- Some Render plans don't include shell access
- Use the API endpoint method instead (Option 3)

**Connection refused:**
- Make sure you're using the internal connection string (not external)
- Check firewall/security settings

**Column already exists error:**
- That's fine! Just run the UPDATE command

**No rows updated:**
- Check your email spelling
- Run: `SELECT email FROM users;` to see all emails

## Quick Reference

**Add role column:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
```

**Set user to admin:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

**Verify:**
```sql
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```


# Setting Admin Role on Neon Database

## Your Connection String

```
postgresql://neondb_owner:npg_gCje9Ad0NbXU@ep-still-moon-absrnhma-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

## Method 1: Using Neon SQL Editor (Easiest)

1. Go to https://console.neon.tech
2. Select your project
3. Click **"SQL Editor"** in the left sidebar
4. Paste and run this SQL:

```sql
-- Add role column if missing
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';

-- Set your user to admin (replace with your email)
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Verify it worked
SELECT id, email, username, role FROM users WHERE email = 'your-email@example.com';
```

5. You should see your user with `role = 'admin'`

## Method 2: Using psql Command Line

If you have `psql` installed locally:

```bash
psql 'postgresql://neondb_owner:npg_gCje9Ad0NbXU@ep-still-moon-absrnhma-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

Then run:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
SELECT email, role FROM users WHERE email = 'your-email@example.com';
\q
```

## Method 3: Using the Script

I've created a helper script for you:

```bash
cd backend/scripts
./set_admin_role_neon.sh your-email@example.com
```

This will:
1. Connect to your Neon database
2. Add the role column if missing
3. Set your user to admin
4. Show verification

## Method 4: Using Python Script

```bash
cd backend
python3 scripts/cloud_setup_admin.py --email your-email@example.com --password your-password --role admin
```

**Note:** This requires the `DATABASE_URL` environment variable to be set to your Neon connection string.

## After Setting Admin Role

1. **Log out** from your frontend
2. **Log back in** (this refreshes the cached user data)
3. Navigate to **`/admin`** - it should work now!

## Verify It Worked

Check the browser console (F12 → Console) after logging back in. You should see:
```
[Admin] Access granted, role: admin
```

If you see:
```
[Admin] User role is not admin: user
```

Then the role wasn't set correctly. Double-check:
- Did you use the correct email?
- Did the SQL command run successfully?
- Did you log out and log back in?

## Troubleshooting

**Can't connect to database:**
- Make sure you're using the full connection string
- Check that SSL mode is set correctly (`sslmode=require`)

**Column already exists error:**
- That's fine! Just run the UPDATE command

**No rows updated:**
- Check your email spelling
- Run: `SELECT email FROM users;` to see all emails

## Quick Reference

**Connection String:**
```
postgresql://neondb_owner:npg_gCje9Ad0NbXU@ep-still-moon-absrnhma-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**SQL Commands:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```


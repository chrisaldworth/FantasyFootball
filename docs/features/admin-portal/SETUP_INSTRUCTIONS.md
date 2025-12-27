# Admin Portal Setup Instructions

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

If your backend server is running:

```bash
cd backend
./scripts/setup_admin_simple.sh
```

This will call the API endpoint to add the `role` column to your database.

### Option 2: Manual Database Migration

#### PostgreSQL

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
```

#### SQLite

```sql
ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';
```

### Option 3: Using the API Endpoint

If your backend is running, you can call:

```bash
curl -X POST http://localhost:8080/api/admin/fix-schema
```

---

## Create Admin User

### Option 1: Direct Database Update

```sql
-- Update existing user to admin
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';

-- Or create super_admin
UPDATE users SET role = 'super_admin' WHERE email = 'your-email@example.com';
```

### Option 2: Using Python Script

```bash
cd backend
python3 scripts/setup_admin_portal.py
```

Follow the prompts to:
1. Add the role column (if not exists)
2. Create or update an admin user

### Option 3: Using Admin API (After First Admin is Created)

Once you have at least one admin user, you can use the API:

```bash
# Get your auth token first by logging in
TOKEN="your-jwt-token"

# Update user role
curl -X PUT "http://localhost:8080/api/admin/users/{user_id}/role?role=admin" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Verify Setup

1. **Check Database Schema:**
   ```bash
   curl http://localhost:8080/api/admin/schema-check
   ```
   
   Look for `"role"` in the `columns` array.

2. **Test Admin Access:**
   - Log in with your admin account
   - Navigate to `http://localhost:3000/admin`
   - You should see the admin dashboard

3. **Check User Role:**
   ```sql
   SELECT email, username, role FROM users WHERE role IN ('admin', 'super_admin');
   ```

---

## Troubleshooting

### "Role column doesn't exist" error

Run the schema fix:
```bash
POST /api/admin/fix-schema
```

Or manually:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';
```

### "Admin access required" error

Make sure your user has the `admin` or `super_admin` role:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

### Backend not running

Start the backend:
```bash
cd backend
uvicorn app.main:app --reload --port 8080
```

---

## Default Roles

- `user` - Regular user (default)
- `admin` - Admin access to admin portal
- `super_admin` - Super admin (can assign super_admin role)

---

## Security Notes

- Only users with `admin` or `super_admin` role can access `/admin` routes
- Only `super_admin` can assign `super_admin` role to other users
- All admin API endpoints require authentication and admin role


# Admin Portal - Cloud Deployment Guide

This guide covers deploying the Admin Portal to cloud platforms (Render, Heroku, Railway, etc.).

---

## Prerequisites

- Database with `users` table
- Backend API deployed and running
- Environment variables configured

---

## Setup Options

### Option 1: Automatic Setup (Recommended)

Add a one-time setup task that runs after deployment.

#### Render.com

Add to your `render.yaml`:

```yaml
services:
  - type: web
    name: fpl-assistant-api
    # ... existing config ...
    
  # One-time setup task
  - type: worker
    name: admin-portal-setup
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: python3 scripts/cloud_setup_admin.py --email $ADMIN_EMAIL --password $ADMIN_PASSWORD --role admin
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: your-database
          property: connectionString
      - key: ADMIN_EMAIL
        sync: false  # Set manually in Render dashboard
      - key: ADMIN_PASSWORD
        sync: false  # Set manually in Render dashboard
      - key: ADMIN_ROLE
        value: admin
```

**Steps:**
1. Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` in Render dashboard
2. Deploy the worker service (runs once)
3. Delete the worker service after successful setup

#### Heroku

Add a release phase to your `Procfile`:

```
release: python3 backend/scripts/cloud_setup_admin.py --email $ADMIN_EMAIL --password $ADMIN_PASSWORD --role admin || true
web: uvicorn app.main:app --host 0.0.0.0 --port $PORT
```

Or use a one-off dyno:

```bash
heroku run python3 backend/scripts/cloud_setup_admin.py --email your-email@example.com --password your-password --role admin
```

#### Railway

Add a setup script in `railway.json`:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  },
  "setup": {
    "run": "python3 backend/scripts/cloud_setup_admin.py --email $ADMIN_EMAIL --password $ADMIN_PASSWORD --role admin"
  }
}
```

---

### Option 2: Manual Database Migration

#### Using SQL

**PostgreSQL:**
```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
```

**MySQL:**
```sql
ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'user';
```

**SQLite:**
```sql
ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';
```

#### Using API Endpoint

If your backend is already deployed:

```bash
curl -X POST https://your-api.com/api/admin/fix-schema
```

**Note:** This endpoint is unauthenticated by default (for initial setup). Consider adding authentication in production.

---

### Option 3: Using Admin API (After First Admin)

Once you have at least one admin user, you can create more via API:

```bash
# Get auth token
TOKEN=$(curl -X POST https://your-api.com/api/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin@example.com&password=your-password" \
  | jq -r '.access_token')

# Create admin user
curl -X PUT "https://your-api.com/api/admin/users/{user_id}/role?role=admin" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Environment Variables

Set these in your cloud platform:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Database connection string | Yes |
| `ADMIN_EMAIL` | Email for initial admin user | Optional |
| `ADMIN_PASSWORD` | Password for initial admin user | Optional |
| `ADMIN_ROLE` | Role for initial admin (admin/super_admin) | Optional (default: admin) |
| `SECRET_KEY` | JWT secret key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |

---

## Setup Script Usage

### Schema Migration Only

```bash
python3 backend/scripts/cloud_setup_admin.py --skip-user
```

### Full Setup with Admin User

```bash
python3 backend/scripts/cloud_setup_admin.py \
  --email admin@example.com \
  --password secure-password \
  --role admin
```

### Using Environment Variables

```bash
export ADMIN_EMAIL=admin@example.com
export ADMIN_PASSWORD=secure-password
export ADMIN_ROLE=admin

python3 backend/scripts/cloud_setup_admin.py \
  --email "$ADMIN_EMAIL" \
  --password "$ADMIN_PASSWORD" \
  --role "$ADMIN_ROLE"
```

---

## Verification

### Check Database Schema

```bash
curl https://your-api.com/api/admin/schema-check
```

Look for `"role"` in the `columns` array.

### Test Admin Access

1. Log in with admin account at your frontend
2. Navigate to `/admin`
3. You should see the admin dashboard

### Check User Roles

```sql
SELECT email, username, role FROM users WHERE role IN ('admin', 'super_admin');
```

---

## Security Considerations

### Production Setup

1. **Remove Unauthenticated Endpoints:**
   - Update `backend/app/api/admin.py` to require authentication for `/fix-schema`
   - Or remove the endpoint entirely after initial setup

2. **Secure Admin Creation:**
   - Use environment variables for admin credentials
   - Don't commit admin passwords to version control
   - Rotate admin passwords regularly

3. **Role Management:**
   - Only `super_admin` can assign `super_admin` role
   - Audit admin user creation
   - Monitor admin API access

### Recommended Production Flow

1. **Initial Setup:**
   - Run setup script once to add `role` column
   - Create first admin user via script or direct SQL

2. **Ongoing Management:**
   - Use admin portal to manage users
   - Use API endpoints (authenticated) for automation
   - Remove or secure setup endpoints

---

## Troubleshooting

### "Role column doesn't exist"

Run the schema migration:
```bash
python3 backend/scripts/cloud_setup_admin.py --skip-user
```

Or manually:
```sql
ALTER TABLE users ADD COLUMN role VARCHAR DEFAULT 'user';
```

### "Cannot connect to database"

Check:
- `DATABASE_URL` is set correctly
- Database is accessible from your cloud platform
- SSL/connection settings are correct

### "Admin access required"

Verify user has admin role:
```sql
SELECT email, role FROM users WHERE email = 'your-email@example.com';
```

Update if needed:
```sql
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```

---

## Example: Render.com Deployment

### 1. Update `render.yaml`

```yaml
services:
  - type: web
    name: fpl-assistant-api
    runtime: python
    rootDir: backend
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn app.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: fpl-db
          property: connectionString
      - key: ADMIN_EMAIL
        sync: false
      - key: ADMIN_PASSWORD
        sync: false
```

### 2. Set Environment Variables

In Render dashboard:
- `ADMIN_EMAIL`: your-admin@example.com
- `ADMIN_PASSWORD`: secure-password-here

### 3. Run Setup (One-Time)

Use Render's shell or add a one-time worker:

```bash
# Via Render shell
python3 scripts/cloud_setup_admin.py \
  --email $ADMIN_EMAIL \
  --password $ADMIN_PASSWORD \
  --role admin
```

### 4. Verify

```bash
curl https://your-api.onrender.com/api/admin/schema-check
```

---

## Post-Deployment Checklist

- [ ] Role column added to database
- [ ] At least one admin user created
- [ ] Admin portal accessible at `/admin`
- [ ] API endpoints working
- [ ] Authentication working
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] Setup endpoints secured or removed

---

**Ready for Cloud Deployment** 🚀


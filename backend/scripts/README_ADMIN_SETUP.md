# Admin Portal Setup Scripts

## Quick Reference

### Local Development

```bash
# Simple setup (requires backend running)
cd backend
./scripts/setup_admin_simple.sh

# Full setup with Python script
cd backend
python3 scripts/setup_admin_portal.py
```

### Cloud Deployment

```bash
# Schema migration only
python3 scripts/cloud_setup_admin.py --skip-user

# Full setup with admin user
python3 scripts/cloud_setup_admin.py \
  --email admin@example.com \
  --password secure-password \
  --role admin
```

## Scripts

### `setup_admin_simple.sh`
- Calls API endpoint to fix schema
- Requires backend server to be running
- Quick setup for local development

### `setup_admin_portal.py`
- Interactive Python script
- Adds role column directly to database
- Creates/updates admin user with prompts
- Works without API server running

### `cloud_setup_admin.py`
- Non-interactive script for cloud deployment
- Command-line arguments for automation
- Supports environment variables
- Can skip user creation for schema-only migration

### `cloud_setup_admin.sh`
- Shell wrapper for cloud setup
- Uses environment variables
- Can be used in CI/CD pipelines

## Environment Variables

- `ADMIN_EMAIL` - Email for admin user
- `ADMIN_PASSWORD` - Password for admin user
- `ADMIN_ROLE` - Role (admin/super_admin), default: admin
- `SKIP_USER` - Skip user creation, only migrate schema

## Usage Examples

### Render.com One-Time Worker

```yaml
- type: worker
  name: admin-setup
  startCommand: python3 scripts/cloud_setup_admin.py --email $ADMIN_EMAIL --password $ADMIN_PASSWORD
```

### Heroku Release Phase

```
release: python3 backend/scripts/cloud_setup_admin.py --email $ADMIN_EMAIL --password $ADMIN_PASSWORD || true
```

### Direct Database Migration

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS role VARCHAR DEFAULT 'user';
UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';
```


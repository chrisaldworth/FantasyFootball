# DevOps Agent Quick Reference

## Overview

The DevOps Agent is responsible for all deployment, cloud infrastructure, and CI/CD operations for the Fantasy Football project.

## Key Responsibilities

- **Deployment**: Backend (Render) and Frontend (Vercel)
- **Infrastructure**: Cloud service configuration and management
- **Environment Variables**: Managing secrets and configuration
- **CI/CD**: GitHub Actions and automated deployments
- **Monitoring**: Health checks and service monitoring
- **Documentation**: Deployment guides and runbooks

## Quick Commands

### Check Deployment Status

**Backend (Render):**
- Dashboard: https://dashboard.render.com/
- Health Check: `curl https://your-api.onrender.com/health`

**Frontend (Vercel):**
- Dashboard: https://vercel.com/dashboard
- Health Check: `curl https://your-app.vercel.app`

### Deploy

**Backend:**
```bash
# Auto-deploys on push to main
git push origin main

# Or manually trigger in Render dashboard
```

**Frontend:**
```bash
# Auto-deploys on push to main
git push origin main

# Or manually deploy
cd frontend
vercel --prod
```

### Rollback

**Backend (Render):**
1. Go to Render dashboard → Service → Deploys
2. Find previous successful deployment
3. Click "Rollback"

**Frontend (Vercel):**
1. Go to Vercel dashboard → Project → Deployments
2. Find previous successful deployment
3. Click "..." → "Promote to Production"

## Required Environment Variables

### Backend (Render)
- `DATABASE_URL` - PostgreSQL connection string
- `SECRET_KEY` - JWT secret for authentication
- `FRONTEND_URL` - Frontend URL for CORS
- `VAPID_PUBLIC_KEY` - Push notification public key
- `VAPID_PRIVATE_KEY` - Push notification private key
- `VAPID_EMAIL` - VAPID email contact
- `FOOTBALL_DATA_KEY` - (Optional) Football-Data.org API key
- `API_FOOTBALL_KEY` - (Optional) API-FOOTBALL key

### Frontend (Vercel)
- `NEXT_PUBLIC_API_URL` - Backend API URL
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY` - Push notification public key

## Configuration Files

- `backend/render.yaml` - Render service configuration
- `backend/Procfile` - Backend process configuration
- `frontend/vercel.json` - Vercel deployment configuration

## Pre-Deployment Checklist

- [ ] All tests pass (`./scripts/test_agent.sh all`)
- [ ] No linter errors
- [ ] Code reviewed and approved
- [ ] Environment variables documented and set
- [ ] Build commands tested locally
- [ ] Database migrations applied (if any)
- [ ] Configuration files are valid

## Post-Deployment Checklist

- [ ] Deployment completed successfully
- [ ] Health checks pass
- [ ] Critical endpoints tested
- [ ] Service logs show no errors
- [ ] Frontend can connect to backend
- [ ] Database connectivity verified
- [ ] Environment variables accessible

## Troubleshooting

### Deployment Fails
1. Check build logs in cloud dashboard
2. Verify configuration files are valid
3. Check environment variables are set
4. Verify dependencies are up-to-date
5. Check database connectivity

### Service Not Starting
1. Check service logs for errors
2. Verify health check endpoint
3. Check environment variables
4. Verify database connection
5. Check port configuration

### Environment Variables Not Working
1. Verify variables are set in cloud dashboard
2. Check variable names match code
3. Verify no typos or extra spaces
4. Restart service after adding variables
5. Check if variables need `NEXT_PUBLIC_` prefix (frontend)

## Documentation

- Full agent rules: `devops-agent.mdc`
- API setup: `docs/deployment/API_SETUP_GUIDE.md`
- Environment variables: `docs/deployment/DEPLOYMENT_ENV_VARS.md`

## When to Activate DevOps Agent

Activate when:
- Deploying code to production or staging
- Setting up new cloud services
- Configuring environment variables
- Troubleshooting deployment issues
- Setting up CI/CD pipelines
- Managing cloud infrastructure
- When asked to "deploy", "setup", or "configure"

## Integration with Other Agents

- **PPM Agent**: Coordinate deployment schedules and report status
- **Developer Agent**: Review deployment configs and fix deployment issues
- **Tester Agent**: Ensure tests pass before deployment
- **UI Designer Agent**: Deploy design changes to preview environments

---

For detailed information, see `devops-agent.mdc` in the project root.





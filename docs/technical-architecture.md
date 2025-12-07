# Technical Architecture

## 1. Frontend
- Next.js (React)  
- Tailwind CSS  
- SSR for SEO  
- Responsive design for mobile users

## 2. Backend
- Node.js or Python FastAPI
- REST API or GraphQL gateway
- Redis caching for FPL API data
- PostgreSQL for persistent storage

## 3. Data Sync
### Cron Jobs
- Nightly full FPL sync
- Hourly price monitoring
- Live data every 1–2 minutes on GW days

## 4. Infrastructure
- Vercel for frontend
- DigitalOcean / AWS for backend + DB
- Cloudflare caching

## 5. Security
- Token‑based auth
- GDPR‑compliant storage
- No long‑term cookie storage for FPL login

## 6. Future Scaling
- Microservices for predictions
- Kubernetes or Docker Swarm

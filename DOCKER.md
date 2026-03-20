# Docker Build Guide

## Quick Start

### 1. Using Docker Compose (Recommended)

```bash
# Copy environment variables
cp .env.example .env
# Edit .env with your credentials

# Build and run both frontend and backend
docker-compose up --build

# Frontend will be at http://localhost:3000
# Backend will be at http://localhost:3001
```

### 2. Building Individual Images

**Frontend:**
```bash
docker build -t biblefunland-frontend .
docker run -p 3000:3000 \
  -e VITE_CLERK_PUBLISHABLE_KEY=your_key \
  -e VITE_STRIPE_PUBLISHABLE_KEY=your_key \
  biblefunland-frontend
```

**Backend:**
```bash
cd server
docker build -t biblefunland-backend .
docker run -p 3001:3001 \
  -e ANTHROPIC_API_KEY=your_key \
  -e STRIPE_SECRET_KEY=your_key \
  biblefunland-backend
```

### 3. Pushing to Docker Registry

```bash
# Tag images
docker tag biblefunland-frontend yourdockerhub/biblefunland-frontend:latest
docker tag biblefunland-backend yourdockerhub/biblefunland-backend:latest

# Push to Docker Hub
docker push yourdockerhub/biblefunland-frontend:latest
docker push yourdockerhub/biblefunland-backend:latest
```

## Environment Variables

Required env vars for docker-compose:
- `VITE_CLERK_PUBLISHABLE_KEY`
- `VITE_STRIPE_PUBLISHABLE_KEY`
- `VITE_ADMIN_PIN`
- `ANTHROPIC_API_KEY`
- `STRIPE_SECRET_KEY`
- `RESEND_API_KEY`
- `VITE_TURSO_DATABASE_URL`
- `VITE_TURSO_AUTH_TOKEN`
- `CLERK_SECRET_KEY`

## Health Checks

Both containers include health checks that verify the services are running:
- Frontend: `GET http://localhost:3000`
- Backend: `GET http://localhost:3001`

View health status:
```bash
docker ps
# Look at the STATUS column for "healthy" or "unhealthy"
```

## Logs

```bash
# View all logs
docker-compose logs -f

# Frontend only
docker-compose logs -f frontend

# Backend only
docker-compose logs -f backend
```

## Common Issues

**Port already in use:**
```bash
# Change ports in docker-compose.yml or use -p flag
docker run -p 8000:3000 biblefunland-frontend
```

**Out of memory:**
```bash
# Increase Docker memory limit in Docker Desktop settings
```

**Build fails:**
```bash
# Clean up and rebuild
docker-compose down
docker system prune -a
docker-compose up --build
```

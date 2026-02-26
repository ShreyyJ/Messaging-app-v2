# Docker Compose Setup Guide

This Docker Compose configuration sets up your entire messaging app with MongoDB, backend, and frontend services.

## Prerequisites
- Docker and Docker Compose installed on your system

## Files Created

- `docker-compose.yml` - Main compose configuration
- `.env.docker` - Environment variables template
- `backend/Dockerfile` - Backend Node.js image
- `frontend/Dockerfile` - Frontend Vite + Nginx image
- `frontend/nginx.conf` - Nginx configuration for serving the React app

## Quick Start

### 1. Configure Environment Variables

Copy and customize the `.env.docker` file:

```bash
cp .env.docker .env
```

Then edit `.env` and update these critical values:
- `MONGO_ROOT_PASSWORD` - Change the MongoDB password
- `JWT_SECRET` - Generate a strong secret key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` - Your Cloudinary credentials

### 2. Build and Run

```bash
# Build images and start all services
docker-compose up --build

# Or run in background
docker-compose up -d --build
```

### 3. Access the Application

- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000/api
- **MongoDB**: mongodb://admin:password@localhost:27017 (change credentials in .env)

## Services

### MongoDB
- Container: `messaging-app-mongodb`
- Port: `27017`
- Default username: `admin`
- Default password: `password` (change in .env)
- Data persisted in `mongodb_data` volume

### Backend
- Container: `messaging-app-backend`
- Port: `5000`
- Environment: Uses variables from `.env`
- Health: Waits for MongoDB to be ready before starting

### Frontend
- Container: `messaging-app-frontend`
- Port: `80`
- Built with Vite and served via Nginx
- SPA routing configured

## Useful Commands

```bash
# View logs
docker-compose logs -f

# View logs of specific service
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# Stop services
docker-compose down

# Stop and remove volumes (careful - deletes data)
docker-compose down -v

# Rebuild specific service
docker-compose build backend
docker-compose build frontend

# Run commands in container
docker-compose exec backend npm install
docker-compose exec frontend npm install
```

## Development Mode

For local development without Docker, run both services separately:

```bash
# Terminal 1 - Backend
cd backend
npm install
npm run dev

# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

## Production Deployment

For production:

1. Update `.env` with production values
2. Set `NODE_ENV=production`
3. Use a reverse proxy (nginx) in front
4. Use proper database credentials
5. Generate strong JWT secret
6. Configure proper CORS origins

```bash
docker-compose up -d --build
```

## Troubleshooting

### MongoDB Connection Error
- Check if MongoDB is running: `docker-compose logs mongodb`
- Verify `MONGODBURI` environment variable
- Ensure MongoDB is healthy: `docker-compose ps`

### Frontend Not Loading
- Check if backend is accessible: `curl http://localhost:5000/api`
- Verify `VITE_API_URL` in frontend environment
- Check nginx logs: `docker-compose logs frontend`

### Port Conflicts
- Change ports in `.env` file:
  - `BACKEND_PORT=5000`
  - `FRONTEND_PORT=80` (change to 8080 if port 80 requires sudo)

## Network
Services communicate through a Docker bridge network named `messaging-network`. Internal URLs:
- Backend: `http://backend:5000`
- MongoDB: `mongodb://admin:password@mongodb:27017`

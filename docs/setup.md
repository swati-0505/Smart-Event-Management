# Development Setup Guide

This guide explains how to configure and run the Smart Event Management System on a new machine.

## 1. Project Components

- **Frontend:** React and Vite, located in `frontend2/`.
- **Backend:** FastAPI and Python, located in `backend/`.
- **Database:** PostgreSQL.
- **Cache:** Redis.
- **AI and RAG:** OpenRouter and configurable embedding models.
- **Migrations:** Alembic.
- **Containerization:** Docker Compose.

Docker Compose is the recommended option for running the complete application.

## 2. Prerequisites

| Requirement | Purpose |
|---|---|
| Git | Clone the repository |
| Docker Desktop | Run the complete application using Docker |
| PostgreSQL | Store application data |
| OpenRouter API key | Enable supported AI features |
| Python 3.11 or newer | Run the backend locally |
| uv | Manage Python dependencies |
| Node.js and npm | Run the frontend locally |
| Redis 7 or newer | Enable caching during local development |

For the Docker setup, install Git and Docker Desktop, prepare a PostgreSQL database, and configure `backend/.env`.

## 3. Get the Code

```bash
git clone https://github.com/swati-0505/Smart-Event-Management.git
cd Smart-Event-Management
```

## 4. Configure Environment Variables

Create the environment file.

**macOS/Linux:**

```bash
cp backend/.env.example backend/.env
```

**Windows PowerShell:**

```powershell
Copy-Item backend/.env.example backend/.env
```

Edit `backend/.env` and configure these important values:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL |
| `SECRET_KEY` | Strong secret for signing authentication tokens |
| `CORS_ORIGINS` | Allowed frontend origins |
| `OPENROUTER_API_KEY` | API key for supported AI features |
| `OPENROUTER_MODEL` | Primary chat model |
| `OPENROUTER_FALLBACK_MODELS` | Fallback chat models |
| `REDIS_URL` | Redis connection URL |
| `ENABLE_REDIS_CACHE` | Enable or disable Redis caching |
| `ENABLE_API_DOCS` | Enable or disable API documentation |

For Docker Compose, set the Redis URL to:

```env
REDIS_URL=redis://redis:6379/0
ENABLE_REDIS_CACHE=true
CORS_ORIGINS=http://localhost,http://127.0.0.1
```

For local frontend development, allow the Vite origin:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Keep other AI and RAG settings from the supplied environment template unless a change is required.

**Security:** Never commit `backend/.env`, API keys, database passwords, or production secrets. Replace example credentials and placeholder secrets before deployment.

## 5. Run with Docker Compose

1. Start Docker Desktop and wait until it is running.
2. Open a terminal in the project root.
3. Build and start the services:

```bash
docker compose up --build -d
```

4. Check the running containers:

```bash
docker compose ps
```

5. View backend logs if needed:

```bash
docker compose logs -f backend
```

The Compose configuration runs the Redis, backend, and frontend services.

### Application URLs

| Service | URL |
|---|---|
| Frontend | http://localhost |
| Backend health check | http://localhost:8000/health |
| API documentation, if enabled | http://localhost:8000/docs |
| Alternative API documentation | http://localhost:8000/redoc |

To stop the services:

```bash
docker compose down
```

To stop the services and remove the Redis data volume, only when you intentionally want to delete that cached data:

```bash
docker compose down -v
```

## 6. Run Locally for Development

### A. Install uv

Follow the official installation instructions at https://docs.astral.sh/uv/getting-started/installation/.

### B. Start PostgreSQL and Redis

Ensure PostgreSQL is running and `DATABASE_URL` points to the intended database.

For Redis caching, start Redis and set:

```env
REDIS_URL=redis://localhost:6379/0
ENABLE_REDIS_CACHE=true
```

If Redis is unavailable and caching is not required, set `ENABLE_REDIS_CACHE=false`.

### C. Start the Backend

From the project root:

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend: http://127.0.0.1:8000

API documentation: http://127.0.0.1:8000/docs, if enabled.

### D. Start the Frontend

Open another terminal from the project root:

```bash
cd frontend2
npm install
npm run dev
```

Frontend: http://localhost:5173

The Vite development server proxies API requests to the backend. Ensure the backend is running and the CORS settings allow the frontend origin.

## 7. Database Migrations

After configuring `DATABASE_URL` to point to the intended database, apply migrations from the backend directory:

```bash
cd backend
uv run alembic upgrade head
```

With Docker, run migrations using a one-off backend container:

```bash
docker compose run --rm backend alembic upgrade head
```

Run migrations against the correct database only. Do not point development migrations at a production database unintentionally.

## 8. Health Checks and Troubleshooting

- **Backend unavailable:** Check `docker compose ps` and `docker compose logs -f backend`.
- **Database connection errors:** Verify PostgreSQL is running and `DATABASE_URL` is correct.
- **Redis errors:** Verify `REDIS_URL` and Redis availability, or disable caching for local development.
- **AI features unavailable:** Verify `OPENROUTER_API_KEY`, model configuration, and network access.
- **Frontend API errors:** Confirm the backend is running and `CORS_ORIGINS` includes the frontend origin.
- **API documentation unavailable:** Check whether `ENABLE_API_DOCS` is enabled.
- **Migration errors:** Verify the database URL and run migrations from the backend directory.

## 9. Quick Checklist

- [ ] Repository cloned successfully.
- [ ] `backend/.env` created and configured.
- [ ] PostgreSQL is accessible.
- [ ] Redis is configured if caching is enabled.
- [ ] Database migrations applied.
- [ ] Backend health endpoint responds successfully.
- [ ] Frontend starts successfully.
- [ ] AI credentials configured if AI features are needed.
- [ ] Secrets are excluded from version control.

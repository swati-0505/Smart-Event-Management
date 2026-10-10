# Smart Event Management — Run Manual (New Machine)

Step-by-step guide to run this project on another person’s computer.

---

## What you need before starting

| Prerequisite | Version / notes | Required for |
| :--- | :--- | :--- |
| **Git** | Latest | Clone the repo |
| **Docker Desktop** | Latest (includes Docker Compose) | **Recommended** full stack |
| **PostgreSQL** | Cloud (Neon / Supabase / Render) or local | Database (always required) |
| **OpenRouter API key** | From [openrouter.ai](https://openrouter.ai) | AI chat / RAG features |
| **Python** | 3.11 or 3.12 | Local backend only (not needed with Docker) |
| **uv** | [astral.sh/uv](https://docs.astral.sh/uv/) | Local backend only |
| **Node.js + npm** | 18 or 20+ | Local frontend only |
| **Redis** | 7+ | Local cache only (Docker provides Redis) |

**Minimum to run with Docker:** Git + Docker Desktop + a PostgreSQL database + `backend/.env` filled in.

---

## Part 1 — Get the code

```bash
git clone <YOUR_REPO_URL>
cd Smart-Event-Management
```

---

## Part 2 — Create the environment file (required)

1. Copy the example env file:

**Windows (PowerShell):**
```powershell
Copy-Item backend\.env.example backend\.env
```

**macOS / Linux:**
```bash
cp backend/.env.example backend/.env
```

2. Open `backend/.env` and set at least these values:

| Variable | What to put |
| :--- | :--- |
| `DATABASE_URL` | Your PostgreSQL URL, e.g. `postgresql://user:pass@host:5432/dbname?sslmode=require` |
| `SECRET_KEY` | Any long random string (JWT signing) |
| `OPENROUTER_API_KEY` | Your OpenRouter key |
| `OPENROUTER_MODEL` | Chat model id (example in `.env.example`) |
| `CORS_ORIGINS` | For Docker frontend use: `http://localhost,http://127.0.0.1` |

3. For **Docker**, also set Redis like this in `backend/.env` (Compose overrides it, but keep it consistent):

```env
REDIS_URL=redis://redis:6379/0
ENABLE_REDIS_CACHE=true
```

Leave other AI/RAG settings as in `.env.example` unless you know you need to change them.

> **Never commit** `backend/.env` — secrets stay on each machine.

---

## Part 3 — Run with Docker (recommended)

### Step 1 — Start Docker Desktop

Open Docker Desktop and wait until it shows **Running**.

**Optional (Windows — avoids DNS / package download failures during build):**  
Docker Desktop → **Settings** → **Docker Engine** → add, then **Apply & Restart**:

```json
{
  "dns": ["8.8.8.8", "1.1.1.1"]
}
```

### Step 2 — Free old containers (if this project ran before)

From the project root:

```bash
docker compose down
```

Full clean (containers + images + Redis volume):

```bash
docker compose down -v --rmi local
```

### Step 3 — Build and start

```bash
docker compose up --build -d
```

First build can take **10–20+ minutes** (Python packages download inside Docker). Later builds are faster.

### Step 4 — Check status

```bash
docker compose ps
docker compose logs -f backend
```

You should see three services: `smart-event-redis`, `smart-event-backend`, `smart-event-frontend`.

### Step 5 — Open the apps

| Service | URL |
| :--- | :--- |
| Frontend | http://localhost |
| Backend health | http://localhost:8000/health |
| API (if docs enabled) | http://localhost:8000/docs |

> Compose sets `ENABLE_API_DOCS=false` for the backend container. To use Swagger while developing, run the backend locally (Part 4) or temporarily set docs on in compose.

### Step 6 — Stop

```bash
docker compose down
```

---

## Part 4 — Run locally (development, without Docker)

Use this when you want hot reload and easier debugging.

### A. Database

Have PostgreSQL ready and put its URL in `backend/.env` as `DATABASE_URL`.

### B. Redis (optional)

- With Redis: keep `ENABLE_REDIS_CACHE=true` and `REDIS_URL=redis://localhost:6379/0`
- Without Redis: set `ENABLE_REDIS_CACHE=false` (app falls back to DB)

### C. Backend

```bash
cd backend
uv sync
uv run alembic upgrade head
uv run uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

Backend: http://127.0.0.1:8000  
Docs: http://127.0.0.1:8000/docs (if `ENABLE_API_DOCS=true` in `.env`)

### D. Frontend (new terminal)

```bash
cd frontend2
npm install
npm run dev
```

Frontend: http://localhost:5173  
Vite proxies `/api` → `http://localhost:8000`.

For local frontend, keep in `.env`:

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

---

## Part 5 — Database migrations

After pointing `DATABASE_URL` at a new empty database:

```bash
cd backend
uv run alembic upgrade head
```

With Docker-only setup (no local Python), run migrations once from a one-off container:

```bash
docker compose run --rm backend alembic upgrade head
```

(If the image entrypoint differs, use:)

```bash
docker compose run --rm backend python -m alembic upgrade head
```

---

## Important environment variables (summary)

| Variable | Purpose |
| :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection |
| `SECRET_KEY` | JWT auth secret |
| `CORS_ORIGINS` | Allowed frontend origins (comma-separated) |
| `REDIS_URL` / `ENABLE_REDIS_CACHE` | Cache |
| `OPENROUTER_API_KEY` | LLM provider |
| `OPENROUTER_MODEL` | Primary chat model |
| `OPENROUTER_FALLBACK_MODELS` | Fallback chat models |
| `HUGGINGFACE_API_KEY` | Legacy embeddings (if used) |
| `EMBEDDING_MODEL` / `EMBEDDING_DIM` | RAG embedding settings |
| `ENABLE_API_DOCS` | Show `/docs` and `/redoc` |

Full list with comments: `backend/.env.example`.

---

## Troubleshooting

### Docker build: network timeout / “Name does not resolve”
- Set Docker Engine DNS to `8.8.8.8` and `1.1.1.1` (see Part 3).
- Retry: `docker compose up --build -d`
- Backend Dockerfile already uses longer `UV_HTTP_TIMEOUT` and retries.

### Docker build: “No interpreter found for Python 3.11”
- Image uses Python **3.12**. Keep the repo’s Dockerfile / `.dockerignore` as committed (`.python-version` is ignored in Docker).
- Rebuild: `docker compose up --build -d`

### Backend won’t start / healthcheck fails
```bash
docker compose logs backend
```
Check `DATABASE_URL`, network access to Postgres, and that migrations ran.

### Frontend loads but API calls fail
- Confirm backend is up: http://localhost:8000/health
- Fix `CORS_ORIGINS` for the URL you open (Docker: `http://localhost` / local Vite: `http://localhost:5173`)

### Ports already in use
Free **80**, **8000**, and **6379**, or change ports in `docker-compose.yml`.

### Clean rebuild from scratch
```bash
docker compose down -v --rmi local
docker compose up --build -d
```

---

## Quick checklist for a new person

1. [ ] Install **Docker Desktop** (+ Git)
2. [ ] Clone the repository
3. [ ] Copy `backend/.env.example` → `backend/.env`
4. [ ] Set `DATABASE_URL`, `SECRET_KEY`, `OPENROUTER_API_KEY`, `OPENROUTER_MODEL`, `CORS_ORIGINS`
5. [ ] Start Docker Desktop
6. [ ] From project root: `docker compose up --build -d`
7. [ ] Run DB migrations if the database is new
8. [ ] Open http://localhost

---

## Project layout (short)

```text
Smart-Event-Management/
├── backend/                 # FastAPI + AI/RAG
│   ├── .env.example         # Copy to .env
│   ├── Dockerfile
│   ├── pyproject.toml
│   └── uv.lock
├── frontend2/               # React (Vite) UI
│   └── Dockerfile
├── docker-compose.yml       # Redis + Backend + Frontend
└── SETUP_INSTRUCTIONS.md    # This manual
```

# 🚀 Smart Event Management System - Setup & Execution Guide

Welcome to the **Smart Event Management System**! This guide provides comprehensive, step-by-step instructions to set up and run both the Frontend (`frontend2`) and Backend (`backend`) services using **Docker Compose** or **Local Development Mode**.

---

## 📋 Prerequisites

Before getting started, ensure you have the following installed on your machine:

- **Docker & Docker Compose** *(Recommended for containerized execution)*
- **Python** (v3.11 or v3.12)
- **Node.js** (v18 or v20+) & **npm**
- **Git**
- **PostgreSQL** *(Required for standalone local backend execution)*

---

## 🐳 Option A: Running with Docker Compose (Recommended)

Docker Compose sets up Redis, the FastAPI Backend, and the React Frontend simultaneously with a single command.

### Step 1: Environment Configuration
Create a `.env` file inside the `backend/` directory by copying `.env.example`:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` to configure your PostgreSQL connection and AI tokens:
```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
REDIS_URL=redis://redis:6379/0
ENABLE_REDIS_CACHE=true
HF_TOKEN=your_huggingface_token
SECRET_KEY=your_jwt_secret
```

### Step 2: Build and Launch Containers
From the project root directory, run:

```bash
docker compose up --build
```

### Step 3: Access the Applications
Once the containers are built and started:
- **React Frontend**: [http://localhost](http://localhost) (or [http://localhost:80](http://localhost:80))
- **FastAPI Backend**: [http://localhost:8000](http://localhost:8000)
- **Interactive API Docs (Swagger)**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Health Check**: [http://localhost:8000/health](http://localhost:8000/health)

---

## 💻 Option B: Running Locally (Development Mode)

If you prefer to run services manually for active development:

### 1️⃣ Backend Setup (`backend/`)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   ```bash
   python -m venv .venv
   
   # Windows PowerShell
   .\.venv\Scripts\Activate.ps1
   
   # Linux / macOS
   source .venv/bin/activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
   *(Or if using `uv`: `uv sync`)*

4. Apply database migrations:
   ```bash
   alembic upgrade head
   ```

5. Start the FastAPI development server:
   ```bash
   uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

   The backend will be running at [http://127.0.0.1:8000](http://127.0.0.1:8000).

---

### 2️⃣ Frontend Setup (`frontend2/`)

1. Open a new terminal and navigate to the `frontend2` directory:
   ```bash
   cd frontend2
   ```

2. Install Node dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```

   The frontend will be running at [http://localhost:5173](http://localhost:5173).

---

## ⚙️ Environment Variables Overview (`backend/.env`)

| Environment Variable | Default / Example | Purpose |
| :--- | :--- | :--- |
| `DATABASE_URL` | `postgresql://user:pass@host/db` | PostgreSQL connection string |
| `REDIS_URL` | `redis://localhost:6379/0` | Redis connection URL for caching |
| `ENABLE_REDIS_CACHE` | `true` | Toggle Redis caching (falls back to DB if false/unavailable) |
| `HF_TOKEN` | `hf_xxx...` | HuggingFace Inference API token for LLM chat assistant |
| `SECRET_KEY` | `supersecretkey` | JWT token secret for authentication |
| `ALGORITHM` | `HS256` | JWT signature algorithm |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60` | JWT expiration time in minutes |

---

## ❓ Frequently Asked Questions & Troubleshooting

### Q1: Redis Connection Timeout Warning
```text
Redis connection unavailable at redis://localhost:6379/0 (Timeout connecting to server). Falling back to direct database queries.
```
* **Explanation**: When running locally without Docker or Redis, the system automatically and safely falls back to querying PostgreSQL directly. It will not break the app.

### Q2: LangChain `@tool` Error
```text
ValueError: Function must have a docstring if description not provided.
```
* **Explanation**: Functions decorated with `@tool` in `backend/app/tools/` require docstrings so that the LLM agent understands how to invoke the tool. Ensure all tool functions maintain valid docstrings.

### Q3: Building Frontend Production Bundle
To build the frontend production assets manually:
```bash
cd frontend2
npm run build
```
Output will be placed in `frontend2/dist`.

---

## 🛠️ Project Structure Summary

```text
Smart-Event-Management/
├── backend/
│   ├── app/                # FastAPI application source (routers, services, tools, agents)
│   ├── alembic/            # Database migrations
│   ├── Dockerfile          # Backend Docker container configuration
│   └── requirements.txt    # Python dependencies
├── frontend2/
│   ├── src/                # React components, pages, services, layouts
│   ├── nginx.conf          # Nginx production web server configuration
│   ├── Dockerfile          # Multi-stage production build configuration
│   └── package.json        # Node.js dependencies & scripts
├── docker-compose.yml      # Orchestration for Redis, Backend, & Frontend
└── SETUP_INSTRUCTIONS.md   # This setup & execution guide
```

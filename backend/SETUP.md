# Backend Starter Setup

## 1. Copy these files into your `backend/` folder
Merge this structure into `D:\event_management\backend\` (don't overwrite your existing `pyproject.toml`).

## 2. Add pydantic-settings (needed for config.py)
```
uv add pydantic-settings
```

## 3. Create your real .env file
Copy `.env.example` to `.env` and fill in your actual local Postgres credentials.
`.env` is already in `.gitignore` — never commit it.

## 4. Run the app
```
uv run uvicorn app.main:app --reload
```
Open http://127.0.0.1:8000/health in a browser — should show `{"status":"ok"}`.

## 5. Set up Alembic (migrations)
```
uv add alembic
uv run alembic init alembic
```
Then edit `alembic/env.py`:
- Add near the top: `from app.db.database import Base` and `from app.models.user import User`
- Set `target_metadata = Base.metadata`
- In `alembic.ini`, set `sqlalchemy.url` to your DATABASE_URL (or read it from settings in env.py)

Generate and run the first migration:
```
uv run alembic revision --autogenerate -m "create users table"
uv run alembic upgrade head
```

## 6. Commit and push
```
git add .
git commit -m "Backend skeleton: FastAPI app, config, User model, Alembic"
git push
```

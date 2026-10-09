# Project Structure

## Root Directory

```text
Smart-Event-Management/
├── app/
│   ├── main.py
│   ├── api/
│   ├── agent/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── observability/
│   ├── rag/
│   ├── routers/
│   ├── schemas/
│   ├── services/
│   ├── tools/
│   └── ...
├── frontend/
│   ├── src/
│   ├── public/
│   ├── index.html
│   ├── admin.html
│   ├── package.json
│   └── ...
├── documents/
│   ├── AGENT_RAG_README.md
│   ├── attendance_policy.md
│   ├── cancellation_policy.md
│   ├── event_policy.md
│   ├── faq.md
│   ├── registration_policy.md
│   ├── venue_policy.md
│   └── ...
├── docs/
│   ├── admin-guide.md
│   ├── ai-rag.md
│   ├── api.md
│   ├── architecture.md
│   ├── database.md
│   ├── modules.md
│   ├── overview.md
│   ├── project-structure.md
│   ├── setup.md
│   ├── testing.md
│   ├── troubleshooting.md
│   └── user-guide.md
├── scripts/
│   └── ingest_knowledge.py
├── tests/
│   ├── ai/
│   ├── test_auth.py
│   ├── test_schemas.py
│   └── ...
├── alembic/
├── pyproject.toml
├── README.md
└── ...
```

## Directory Descriptions

* **`app/`** — Backend application containing API endpoints, routing, database access, data models, validation schemas, business services, and AI-related functionality.
* **`app/api/`** — API modules for authentication, chat, administration, and other API functionality.
* **`app/agent/`** — AI agent logic, graph execution, prompts, state management, and memory.
* **`app/core/`** — Core application configuration, security, and AI configuration.
* **`app/db/`** — Database connection and related database functionality.
* **`app/models/`** — Database model definitions.
* **`app/observability/`** — AI and application execution monitoring.
* **`app/rag/`** — Retrieval-augmented generation (RAG) components and knowledge retrieval functionality.
* **`app/routers/`** — Backend routes for events, registrations, users, venues, feedback, payments, and settings.
* **`app/schemas/`** — Data validation and request/response schemas.
* **`app/services/`** — Application service-layer functionality.
* **`app/tools/`** — Tools used by the AI agent.
* **`frontend/`** — React-based user interface and related frontend assets and configuration.
* **`documents/`** — Knowledge-base documents, policies, FAQs, and AI/RAG documentation used by the project.
* **`docs/`** — Project documentation covering setup, architecture, APIs, database design, modules, testing, troubleshooting, and user/admin guidance.
* **`scripts/`** — Utility scripts, including the knowledge ingestion script.
* **`tests/`** — Automated tests for authentication, schemas, AI components, and related functionality.
* **`alembic/`** — Database migration configuration and migration files.

## Notes

* The backend is built with FastAPI, and the frontend uses React and Vite.
* PostgreSQL is used for database functionality.
* The project includes AI agent and RAG components for knowledge-based assistance.
* This document describes the main project directories; individual files and additional directories may be omitted for readability.

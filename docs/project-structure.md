# Project Structure

## Overview

The Smart Event Management System is a full-stack application built using React, FastAPI, Python, and PostgreSQL. It includes event and registration management, authentication, administration, and an AI assistant with Retrieval-Augmented Generation (RAG) capabilities.

The current GitHub repository organizes the application into separate backend and frontend directories.

## Root Directory

```text
Smart-Event-Management/
├── backend/
│   ├── app/
│   │   ├── agent/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── llm/
│   │   ├── models/
│   │   ├── observability/
│   │   ├── rag/
│   │   ├── routers/
│   │   ├── schemas/
│   │   ├── services/
│   │   ├── tools/
│   │   └── main.py
│   ├── alembic/
│   ├── documents/
│   ├── tests/
│   ├── Dockerfile
│   ├── alembic.ini
│   ├── pyproject.toml
│   └── .env.example
├── frontend2/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── auth/
│   │   ├── components/
│   │   ├── context/
│   │   ├── layouts/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── README.md
├── .vscode/
├── README.md
└── SETUP_INSTRUCTIONS.md
```

*Note: This is a simplified overview. It does not list every file, and the directory contents may change as development continues.*

## Directory Descriptions

### Backend — `backend/`

Contains the FastAPI application, database integration, business logic, AI services, and backend tests.

- **`backend/app/`** — Main Python application package.
- **`backend/app/agent/`** — AI agent graph, prompts, memory, nodes, and state management.
- **`backend/app/api/`** — API endpoints for authentication, chat, events, administration, and users.
- **`backend/app/core/`** — Application configuration, AI configuration, security, and Redis caching.
- **`backend/app/db/`** — Database connection and session configuration.
- **`backend/app/llm/`** — Language-model routing, configuration, exceptions, and provider integrations.
- **`backend/app/models/`** — Database models for users, events, registrations, venues, payments, feedback, and AI-related data.
- **`backend/app/observability/`** — Application logging and observability.
- **`backend/app/rag/`** — RAG functionality, including document conversion, chunking, retrieval, reranking, and generation.
- **`backend/app/routers/`** — API routes for events, registrations, users, venues, payments, and feedback.
- **`backend/app/schemas/`** — Request and response schemas.
- **`backend/app/services/`** — Business logic and service-layer operations.
- **`backend/app/tools/`** — Tools and utilities used by the AI agent.
- **`backend/alembic/`** — Database migration scripts.
- **`backend/documents/`** — Backend knowledge documents and related resources.
- **`backend/tests/`** — Backend automated tests.
- **`backend/app/main.py`** — FastAPI application entry point.

### Frontend — `frontend2/`

Contains the React-based user interface.

- **`frontend2/src/auth/`** — Authentication provider and related logic.
- **`frontend2/src/components/`** — Reusable interface components, including event, navigation, payment, and chat components.
- **`frontend2/src/context/`** — Shared React context, including AI chat state.
- **`frontend2/src/layouts/`** — Layouts for public, user, and administrator pages.
- **`frontend2/src/pages/`** — Pages for authentication, public event browsing, user workflows, and administration.
- **`frontend2/src/assets/`** — Frontend image and other asset files.
- **`frontend2/src/main.jsx`** — React application entry point.
- **`frontend2/package.json`** — Frontend dependencies and scripts.
- **`frontend2/Dockerfile`** — Frontend container configuration.
- **`frontend2/nginx.conf`** — Nginx configuration.

### Root Configuration

- **`README.md`** — Main project overview and entry point for contributors.
- **`SETUP_INSTRUCTIONS.md`** — Setup instructions for running the project on another machine.
- **`.vscode/`** — Editor configuration files.

## Technology Stack

- **Frontend:** React and JavaScript.
- **Backend:** Python and FastAPI.
- **Database:** PostgreSQL.
- **AI:** Language-model integrations, AI agents, and RAG.
- **Caching:** Redis-related application support.
- **Database migrations:** Alembic.
- **Containerization:** Docker.

## Notes

- The backend and frontend are maintained in separate directories.
- The exact files and modules may change as features are developed.
- Refer to `SETUP_INSTRUCTIONS.md` for environment setup and execution instructions.
- Consult the API, architecture, and database documentation for more detailed technical information.
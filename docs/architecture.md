# System Architecture

## 1. Architecture Overview

The Smart Event Management System follows a full-stack client-server architecture. It separates the frontend interface, backend application logic, persistent data storage, and AI-assisted functionality into distinct components.

The current GitHub repository organizes the application into two main directories:

- `frontend2/` — React-based frontend.
- `backend/` — FastAPI backend and supporting services.

The frontend communicates with the backend through HTTP API requests. The backend processes requests, applies application logic, interacts with the database, and coordinates supported AI and RAG operations.

## 2. High-Level Architecture

```text
                       User
                        |
                        v
                 Web Browser
                        |
                        v
              React Frontend
                frontend2/
                        |
                 HTTP API Requests
                        |
                        v
              FastAPI Backend
                 backend/
                        |
          +-------------+--------------+
          |             |              |
          v             v              v
      API Routes    Application     AI / Agent
      and Schemas    Services       Workflows
          |             |              |
          +-------------+              v
          |                      LLM Integration
          v                             |
     Database Layer                     v
          |                        RAG Pipeline
          v                             |
      PostgreSQL                        v
                                Knowledge Documents
```

*This is a conceptual overview of the application. It does not represent every runtime dependency or execution path.*

## 3. Frontend Layer

The frontend is maintained in `frontend2/` and is built using React and JavaScript.

Its responsibilities include:

- Rendering public event pages and user-facing interfaces.
- Providing login and registration interfaces.
- Displaying event details and registration workflows.
- Providing administrative pages for supported management operations.
- Displaying AI assistant interactions.
- Communicating with backend APIs.
- Managing reusable components, layouts, and shared frontend state.

Important frontend directories include:

- `src/auth/` — authentication-related functionality.
- `src/components/` — reusable UI components.
- `src/context/` — shared React context.
- `src/layouts/` — public, user, and administrator layouts.
- `src/pages/` — application pages.
- `src/assets/` — frontend assets.

## 4. Backend and API Layer

The backend is maintained in `backend/` and uses Python and FastAPI.

It exposes application endpoints and coordinates authentication, validation, business logic, persistence, and AI-related operations.

The backend is divided into several functional areas:

- `app/api/` — API endpoints for authentication, administration, chat, events, and users.
- `app/routers/` — routes for events, registrations, users, venues, payments, and feedback.
- `app/schemas/` — request and response validation schemas.
- `app/services/` — application service-layer logic.
- `app/core/` — configuration, security, AI configuration, and caching support.
- `app/main.py` — FastAPI application entry point.

The precise route behavior and API contracts should be documented alongside the corresponding backend implementation.

## 5. Database Layer

PostgreSQL provides persistent storage for application data.

The backend includes SQLAlchemy-based database models and database connection functionality. Alembic is used to manage database schema migrations.

The repository includes models for application entities such as users, events, registrations, venues, payments, and feedback, as well as AI-related data.

The database layer is responsible for storing and retrieving application records and supporting the operations performed by backend services.

## 6. Authentication and Authorization

The application includes authentication and access-control functionality.

The backend contains authentication API modules and security-related components. The frontend includes authentication-related state and interfaces.

Protected operations should be available only to appropriately authenticated and authorized users. Specific token handling, role permissions, and security behavior should follow the current implementation.

## 7. AI Agent and Language Model Layer

The backend includes an AI agent subsystem under `backend/app/agent/`.

Its modules include graph execution, nodes, prompts, state, and memory functionality. Agent tools are organized under `backend/app/tools/`.

The LLM integration layer is located under `backend/app/llm/` and includes provider and routing functionality. The current repository includes an OpenRouter provider integration.

These components support AI-assisted interaction and the execution of supported application operations. Available functionality depends on the configured model provider, environment settings, and implemented tools.

## 8. Retrieval-Augmented Generation (RAG)

The RAG subsystem is located under `backend/app/rag/`.

Its components support tasks such as:

- Document conversion and processing.
- Text chunking.
- Knowledge ingestion.
- Metadata handling.
- Information retrieval.
- Reranking and retrieval fusion.
- Response generation.

The RAG pipeline supplies relevant knowledge to AI-assisted responses. Its behavior depends on the available documents, configured retrieval components, and backend settings.

## 9. Caching and Observability

The backend includes Redis-related caching support under `backend/app/core/redis_cache.py`.

Application logging and observability functionality is maintained under `backend/app/observability/`.

The actual use of caching and logging depends on the runtime configuration and the code paths enabled in the deployed environment.

## 10. Database Migrations and Testing

Database migrations are maintained in `backend/alembic/`. These migrations track database schema changes over time.

Backend automated tests are maintained in `backend/tests/`. They help verify application functionality and should be run according to the project's current testing instructions.

## 11. Deployment and Configuration

The repository contains Docker configuration for the backend and frontend. Environment-specific settings are provided through configuration files and environment variables.

Sensitive credentials, API keys, database connection strings, and deployment secrets should be supplied through appropriate environment configuration rather than committed to source control.

Refer to `SETUP_INSTRUCTIONS.md` and the relevant environment example files for the current setup procedure.

## 12. Summary

The system combines a React frontend, FastAPI backend, PostgreSQL persistence, and AI-assisted functionality. Its modular organization separates user interfaces, APIs, application services, database operations, agent workflows, and RAG processing, making individual components easier to maintain and extend.
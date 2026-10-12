# Smart Event Management System

## 1. Project Overview

The Smart Event Management System is a full-stack web application designed to simplify event discovery, registration, and administration through a centralized platform.

Users can discover published events, view event details, register for events, and manage their registrations. Administrators can manage events, users, venues, registrations, payments, and feedback through administrative interfaces.

The application also includes an AI-powered assistant that supports natural-language interaction. Its AI components combine agent workflows and Retrieval-Augmented Generation (RAG) to retrieve relevant information from the application's knowledge base and assist with supported operations.

The frontend is implemented using React and JavaScript, while the backend uses Python and FastAPI. PostgreSQL provides persistent data storage. The backend also includes database models, validation schemas, service-layer logic, API endpoints, and database migrations.

The current repository organizes the application into two main directories: `backend/` for the backend application and `frontend2/` for the React frontend.

The primary objective is to provide a unified platform for event-related workflows while incorporating AI-assisted information retrieval and interaction.

## 2. Key Features

The major features of the system include:

### User and Authentication
- User registration and login
- Authentication and access control
- User profile management

### Event Management
- Event discovery and published event listings
- Event detail views
- Event creation and management
- Event registration and cancellation
- User-wise and event-wise registration tracking

### Administration
- Administrative dashboard
- User and venue management
- Registration management
- Payment management
- Feedback management

### AI and Knowledge Retrieval
- AI-powered conversational assistant
- Natural-language interaction
- Retrieval-Augmented Generation (RAG)
- Knowledge document processing and retrieval
- AI agent workflows and state management
- Chat session functionality
- Administrative views for AI agent activity

*Feature availability and access depend on the implemented application workflows and user permissions.*

## 3. Technology Stack

| Category | Technology |
|---|---|
| Frontend | React, JavaScript |
| Frontend Build Tool | Vite |
| Backend | FastAPI |
| Programming Language | Python |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migrations | Alembic |
| Authentication | JWT-based authentication |
| AI Agent | Agent graph and workflow components |
| Language Model Integration | LLM provider integration, including OpenRouter in the current backend |
| Retrieval | RAG and document retrieval components |
| Caching | Redis-related application support |
| Backend Package Management | uv |
| Frontend Package Management | npm |
| Containerization | Docker |

The exact versions, providers, and optional dependencies are defined in the project's configuration files and environment settings.

## 4. Main Components

### 4.1 Frontend

The frontend is located in `frontend2/`. It provides the interfaces through which users and administrators interact with the application.

Its source code includes authentication, reusable UI components, layouts, event pages, administrative pages, and AI chat components.

### 4.2 Backend

The backend is located in `backend/` and is built with FastAPI and Python.

It provides API endpoints, request and response schemas, database models, business services, authentication functionality, and AI-related operations.

The backend is organized into modules for APIs, routers, services, models, schemas, agent workflows, language-model integrations, and RAG.

### 4.3 Database

PostgreSQL is used for persistent application data, including user, event, registration, venue, payment, and feedback information.

SQLAlchemy provides database interaction through Python models and database sessions. Alembic manages database schema migrations.

### 4.4 AI Assistant

The AI assistant enables natural-language interaction with the application.

The backend contains agent workflow components, prompts, state management, memory functionality, language-model routing, and tools for supported operations. The available functionality depends on the configured AI provider and implemented integrations.

### 4.5 Knowledge Base and RAG

The RAG components support document processing, retrieval, and response generation using relevant knowledge sources.

The backend includes document conversion, chunking, ingestion, retrieval, reranking, and generation components. Knowledge documents and related resources are maintained in the repository's document directories.

### 4.6 Testing and Database Migrations

The backend contains automated tests under `backend/tests/`. These tests help verify application behavior and supported functionality.

Database migration scripts are maintained under `backend/alembic/` and are managed through Alembic.

## 5. Repository Documentation

The project documentation is maintained in the `docs/` directory in the local documentation set.

The documentation covers project architecture, setup, APIs, database design, application modules, AI/RAG functionality, testing, troubleshooting, and user and administrator guidance.

The repository also contains `README.md` and `SETUP_INSTRUCTIONS.md` for the project introduction and environment setup.

## 6. Conclusion

The Smart Event Management System combines event management, user registration, administration, and AI-assisted information retrieval in one full-stack application. Its modular frontend and backend organization supports the development and maintenance of application features, while the AI and RAG components provide additional ways to access relevant event-related information.
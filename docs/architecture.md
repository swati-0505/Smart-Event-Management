# System Architecture

## 1. Architecture Overview

The Smart Event Management System follows a full-stack client-server architecture.

The system consists of the following major layers:

1. Frontend Layer
2. Backend/API Layer
3. Database Layer
4. AI and RAG Layer
5. Authentication and Authorization Layer

The frontend communicates with the FastAPI backend through REST APIs. The backend handles business logic, authentication, database operations, and AI-related requests.

PostgreSQL is used for persistent data storage, while pgvector supports vector-based retrieval for the AI knowledge base.

---

## 2. High-Level Architecture

```text
                         ┌─────────────────────────┐
                         │        User             │
                         │   Web Browser           │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      React Frontend     │
                         │      + Vite             │
                         │      + Tailwind CSS     │
                         └────────────┬────────────┘
                                      │
                              REST API Requests
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │      FastAPI Backend    │
                         │                         │
                         │  Authentication        │
                         │  Events                 │
                         │  Registrations          │
                         │  Venues                 │
                         │  Payments               │
                         │  Feedback               │
                         │  Administration         │
                         │  AI Chat                │
                         └───────┬─────────┬───────┘
                                 │         │
                    Database     │         │     AI/RAG
                    Operations   │         │     Operations
                                 ▼         ▼
                    ┌──────────────┐   ┌─────────────────┐
                    │ PostgreSQL   │   │ AI Agent        │
                    │ Database     │   │ + LangGraph     │
                    │              │   │ + LangChain     │
                    │ Application  │   │ + OpenAI        │
                    │ Data         │   │ + RAG           │
                    └──────────────┘   └────────┬────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │ Knowledge Base  │
                                       │ + pgvector      │
                                       │ + Documents     │
                                       └─────────────────┘
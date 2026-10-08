# Smart Event Management System

## 1. Project Overview

The Smart Event Management System is a full-stack web application designed to provide a centralized platform for managing events and related activities.

The system allows users to discover and view events, register for events, manage their registrations, and interact with event-related information. It also provides administrative functionality for managing events, users, venues, registrations, payments, and feedback.

The application includes an AI-powered assistant that allows users to interact with the system using natural language. The AI assistant uses retrieval-based techniques and an agent workflow to provide relevant information from the application's knowledge base and support supported operations.

The frontend of the application is developed using React, while the backend is built using FastAPI and Python. PostgreSQL is used as the primary database for persistent data storage. The system also uses authentication and role-based access control to provide appropriate access to users and administrators.

The overall purpose of the Smart Event Management System is to simplify event-related operations by bringing event discovery, registration, administration, information retrieval, and AI-assisted interaction into a single platform.

---

## 2. Key Features

The major features of the Smart Event Management System include:

- User registration and authentication
- JWT-based authentication
- Role-based access control
- User profile management
- Event creation and management
- Published event listing
- Event details
- Event registration
- Registration cancellation
- User-wise registration tracking
- Event-wise registration tracking
- Venue management
- Payment management
- Feedback management
- Administrative dashboard
- AI-powered conversational assistant
- Natural-language interaction
- Knowledge document management
- Knowledge document ingestion
- Retrieval-Augmented Generation (RAG)
- AI agent workflow
- Chat session management
- Administrative monitoring of AI agent activity

---

## 3. Technology Stack

| Category | Technology |
|---|---|
| Frontend | React |
| Frontend Build Tool | Vite |
| Styling | Tailwind CSS |
| Backend | FastAPI |
| Programming Language | Python |
| Database | PostgreSQL |
| ORM | SQLAlchemy |
| Database Migration | Alembic |
| Authentication | JWT |
| Password Hashing | bcrypt / Passlib |
| AI Agent Framework | LangGraph |
| AI/LLM Framework | LangChain |
| AI Model Integration | OpenAI |
| Vector Search | pgvector |
| Document Processing | MarkItDown |
| Backend Server | Uvicorn |
| Testing | Pytest, Pytest-Asyncio |
| Package Management | uv |

---

## 4. Main Components

The application can be divided into the following major components:

### 4.1 Frontend

The frontend provides the user interface through which users and administrators interact with the application. It is developed using React and provides interfaces for authentication, event browsing, registration, administration, and AI-assisted interaction.

### 4.2 Backend

The backend is developed using FastAPI and Python. It provides REST APIs for authentication, users, events, registrations, venues, payments, feedback, administration, and AI-related functionality.

### 4.3 Database

PostgreSQL is used to store application data including users, events, registrations, venues, and other system information.

SQLAlchemy is used as the ORM layer for interaction between the backend application and the PostgreSQL database.

### 4.4 AI Assistant

The application includes an AI-powered assistant that enables users to communicate with the system using natural language. The AI functionality uses an agent-based workflow and retrieval techniques to provide relevant responses based on available knowledge.

### 4.5 Knowledge Base

The project contains a `documents/` directory containing knowledge documents used by the AI/RAG system. These include event policies, registration policies, cancellation policies, attendance policies, venue policies, FAQs, and AI/RAG-related documentation.
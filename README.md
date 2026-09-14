# 🎟️ Smart Event Management System

<p align="center">
  <strong>A modern, scalable event management platform with a React frontend, FastAPI backend, database-driven services, and an extensible AI/RAG layer.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?logo=react&logoColor=white" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?logo=fastapi&logoColor=white" alt="FastAPI">
  <img src="https://img.shields.io/badge/Python-3.x-3776AB?logo=python&logoColor=white" alt="Python">
  <img src="https://img.shields.io/badge/AI%20%2F%20RAG-Extensible-purple" alt="AI/RAG">
  <img src="https://img.shields.io/badge/Status-Active-success" alt="Status">
  <img src="https://img.shields.io/badge/License-Academic-blue" alt="License">
</p>

---

## 📌 Overview

**Smart Event Management System** is a full-stack platform designed to simplify the creation, discovery, registration, and administration of events through a centralized digital system.

The project combines a responsive user-facing interface with a dedicated administration dashboard and a RESTful FastAPI backend. Its architecture is designed to support future intelligent capabilities such as **Retrieval-Augmented Generation (RAG), embeddings, AI agents, event recommendations, automated insights, and natural-language assistance**.

The system is being developed as an extensible academic project, with a foundation suitable for further expansion into an **agentic AI-powered event management platform**.

---

## ✨ Key Features

### 👤 User Management
- User registration and authentication
- User profile management
- User lookup by ID or email
- Secure API-based communication

### 🎫 Event Management
- Create events
- View event listings
- Retrieve event details
- Update event information
- Delete events
- Published-event retrieval

### 📝 Registration Management
- Event registration
- Registration lookup
- Event-wise registrations
- User-wise registrations
- Registration cancellation

### 🏢 Venue Management
- Create and manage venues
- Retrieve venue information
- Update venue details
- Delete venues

### 💳 Payment Management
- Payment records
- Event-wise payment retrieval
- User-wise payment retrieval
- Payment status updates

### ⭐ Feedback
- Submit feedback
- Event-wise feedback
- User-wise feedback

### 🛡️ Admin Dashboard
- Dedicated admin interface
- Dashboard metrics
- Event management
- Registration management
- User management
- Search and navigation
- Light/dark theme support
- Admin authentication and logout

### 🤖 AI & RAG Foundation
The project includes an extensible foundation for:
- Document loading
- Text chunking
- Embeddings
- Semantic retrieval
- Vector database integration
- LLM-powered responses
- Agentic workflows
---

## 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │       End Users         │
                         └────────────┬────────────┘
                                      │
                                      ▼
                         ┌─────────────────────────┐
                         │    React Frontend       │
                         │                         │
                         │  • User Interface       │
                         │  • Event Discovery      │
                         │  • Registration         │
                         └────────────┬────────────┘
                                      │
                                      │ REST API
                                      ▼
                    ┌──────────────────────────────────┐
                    │         FastAPI Backend           │
                    │                                  │
                    │  • Authentication                 │
                    │  • Users                          │
                    │  • Events                         │
                    │  • Registrations                  │
                    │  • Venues                         │
                    │  • Payments                       │
                    │  • Feedback                       │
                    └───────────────┬──────────────────┘
                                    │
                    ┌───────────────┴──────────────────┐
                    ▼                                  ▼
          ┌────────────────────┐             ┌────────────────────┐
          │     Database       │             │   AI / RAG Layer   │
          │                    │             │                    │
          │ Users              │             │ Documents          │
          │ Events             │             │ Chunking            │
          │ Registrations      │             │ Embeddings          │
          │ Venues             │             │ Retrieval           │
          │ Payments           │             │ LLM / Agents        │
          │ Feedback           │             │ Recommendations     │
          └────────────────────┘             └────────────────────┘
```

---

## 🧩 Project Modules

| Module | Responsibility |
|---|---|
| 🔐 Authentication | Registration, login and authentication |
| 👤 Users | User CRUD and user information |
| 🎫 Events | Event creation, retrieval, update and deletion |
| 📝 Registrations | Event registration and cancellation |
| 🏢 Venues | Venue management |
| 💳 Payments | Payment records and status |
| ⭐ Feedback | Event and user feedback |
| 🛡️ Admin | Administrative dashboard and management |
| 🧠 RAG | Document processing and semantic knowledge retrieval |
| 🤖 AI Agents | Planned intelligent workflows and automation |

---

## 🛠️ Technology Stack

### Frontend
- **React**
- **Vite**
- **JavaScript / JSX**
- **Tailwind CSS**

### Backend
- **Python**
- **FastAPI**
- **Uvicorn**
- **Pydantic**
- RESTful API architecture

### Database
- Relational database architecture
- SQLAlchemy-based backend models/services

### AI / Machine Learning
- **Sentence Transformers**
- `all-MiniLM-L6-v2`
- Embeddings
- RAG architecture
- Vector database integration planned
- LLM and agent pipelines planned

### Development Tools
- Git
- GitHub
- `uv`
- npm
- Vite

---

## 📁 Project Structure

```text
Smart-Event-Management/
│
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── models/
│   │   ├── routers/
│   │   ├── rag/
│   │   ├── db/
│   │   └── main.py
│   ├── pyproject.toml
│   └── uv.lock
│
├── frontend/
│   ├── src/
│   │   ├── admin/
│   │   │   ├── components/
│   │   │   ├── pages/
│   │   │   ├── services/
│   │   │   ├── AdminApp.jsx
│   │   │   └── main.jsx
│   │   ├── components/
│   │   ├── pages/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── admin.html
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

# ⚙️ Getting Started

## Prerequisites

- Python 3.x
- Node.js and npm
- Git
- `uv`

## 1️⃣ Clone the Repository

```bash
git clone <YOUR_GITHUB_REPOSITORY_URL>
cd Smart-Event-Management
```

## 2️⃣ Backend Setup

```bash
cd backend
uv sync
uv run uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

Expected:

```json
{"status":"ok"}
```

Interactive API documentation:

```text
http://127.0.0.1:8000/docs
```

## 3️⃣ Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

Admin dashboard:

```text
http://localhost:5173/admin.html
```

---

# 🔌 API Overview

The backend provides REST APIs for:

```text
/api/auth/...
/api/users/...
/api/events/...
/api/registrations/...
/api/venues/...
/api/payments/...
/api/feedback/...
/api/admin/dashboard
```

### Events

```text
GET     /api/events/
POST    /api/events/
GET     /api/events/published
GET     /api/events/{event_id}
PUT     /api/events/{event_id}
DELETE  /api/events/{event_id}
```

### Registrations

```text
GET     /api/registrations/
POST    /api/registrations/
GET     /api/registrations/event/{event_id}
GET     /api/registrations/user/{user_id}
GET     /api/registrations/{registration_id}
PUT     /api/registrations/{registration_id}/cancel
```

### Users

```text
GET     /api/users/
POST    /api/users/
GET     /api/users/{user_id}
GET     /api/users/email/{email}
DELETE  /api/users/{user_id}
```

### Venues

```text
GET     /api/venues/
POST    /api/venues/
GET     /api/venues/{venue_id}
PUT     /api/venues/{venue_id}
DELETE  /api/venues/{venue_id}
```

### Payments

```text
GET     /api/payments/
POST    /api/payments/
GET     /api/payments/{payment_id}
GET     /api/payments/event/{event_id}
GET     /api/payments/user/{user_id}
PUT     /api/payments/{payment_id}/status
```

### Feedback

```text
GET     /api/feedback/
POST    /api/feedback/
GET     /api/feedback/event/{event_id}
GET     /api/feedback/user/{user_id}
```

---

# 🖥️ Admin Dashboard

The dedicated administration interface provides:

- Dashboard metrics
- Event management
- Registration management
- User management
- Authentication
- Search and navigation
- Theme switching
- Logout

The frontend service layer connects the currently integrated modules to the FastAPI backend.

---

# 🧠 AI / RAG Architecture

The major-project direction extends the platform with intelligent event-management capabilities.

### RAG Pipeline

```text
Documents / Event Data
          │
          ▼
     Document Loader
          │
          ▼
        Chunking
          │
          ▼
      Embeddings
          │
          ▼
     Vector Database
          │
          ▼
       Retriever
          │
          ▼
          LLM
          │
          ▼
   Context-Aware Answer
```

### Planned Agentic Architecture

```text
                    User Query
                        │
                        ▼
                 ┌─────────────┐
                 │ AI Orchestrator│
                 └──────┬──────┘
                        │
          ┌─────────────┼─────────────┐
          ▼             ▼             ▼
     Event Agent   Venue Agent   Registration Agent
          │             │             │
          └─────────────┼─────────────┘
                        ▼
                Recommendation /
                 Final Response
```

### Planned Intelligent Features

- Natural-language event search
- Event recommendations
- Venue recommendations
- RAG-based event assistant
- Event description generation
- Feedback summarization
- Feedback sentiment analysis
- Registration analytics
- Organizer assistance
- Intelligent event planning
- Multi-step agentic workflows

---

# 🧪 Build & Verification

Frontend production build:

```bash
cd frontend
npm run build
```

Backend development server:

```bash
cd backend
uv run uvicorn app.main:app --reload
```

Health endpoint:

```text
GET /health
```

---
# 👥 Team & Contributions

This project is developed collaboratively as an academic software engineering project.

| Area | Responsibility |
|---|---|
| Backend | Authentication, events, registrations, users and backend services |
| AI | RAG, embeddings, vector database, agents and LLM pipelines |
| Frontend | User interface and admin dashboard |
| Database | Schema design, queries and optimization |
| Integration | AI/backend/frontend integration |

> Add individual team-member names and GitHub profiles here before final submission.

---

# 🔒 Security

For production deployment, consider:

- HTTPS
- Secure secret management
- Token expiration and refresh
- HTTP-only secure cookies where appropriate
- Role-based authorization
- Rate limiting
- Database access controls
- Environment-variable configuration
- Secure CORS configuration
- Production logging and monitoring

Never commit:

```text
.env
API keys
database passwords
private credentials
secret tokens
```

---

# 🤝 Contributing

1. Create a feature branch.
2. Implement the feature.
3. Test locally.
4. Run the production build.
5. Review changes.
6. Commit with a meaningful message.
7. Push the branch.
8. Open a Pull Request.

Example:

```bash
git checkout -b feature/ai-recommendation
git add .
git commit -m "Add AI event recommendation service"
git push origin feature/ai-recommendation
```

---

# 📌 Project Vision

The long-term objective is to evolve the platform from a conventional event-management application into an **intelligent, agent-assisted event management system**.

The major extension combines:

```text
Full-Stack Application
        +
REST APIs
        +
Database
        +
RAG
        +
LLMs
        +
AI Agents
        +
Recommendations
        +
Analytics
```

This architecture provides a strong foundation for building a scalable and intelligent event-management platform.

---

# 📄 License

This project is developed for academic and educational purposes.

A formal open-source license can be added if the project is later released publicly.

---

<p align="center">
  <strong>🎟️ Smart Event Management System</strong><br>
  <sub>Built with React • FastAPI • Python • Database • AI/RAG</sub>
</p>

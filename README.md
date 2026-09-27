## 🎟️ Smart Event Management System

A modern, full-stack event management platform built with React, FastAPI, Python, PostgreSQL, and AI/RAG. The system provides event, registration, user, and administration management along with an integrated AI assistant capable of retrieving event-related information and responding to natural-language queries.

## 📌 Overview

Smart Event Management System is a full-stack platform designed to simplify the creation, management, discovery, and registration of events through a centralized digital system.

## The platform combines:

- 🖥️ React-based user and admin interfaces
- ⚡ FastAPI REST backend
- 🗄️ Database-driven services
- 🔐 Authentication and authorization
- 🎫 Event and registration management
- 🤖 Integrated AI assistant
- 🧠 Retrieval-Augmented Generation (RAG)
- 🔎 Semantic knowledge retrieval
- 🛠️ AI tools for interacting with event-management services

The architecture is designed to support intelligent event-management workflows and future extensions such as recommendations, analytics, automated insights, and advanced agentic workflows.

## ✨ Key Features

## 👤 User Management

- User registration and authentication
- User profile management
- User lookup by ID or email
- Secure API-based communication
- Role-based access support

## 🎫 Event Management

- Create events
- View event listings
- Retrieve event details
- Update event information
- Delete events
- Retrieve published events
- Event search and navigation

## 📝 Registration Management

- Register for events
- Retrieve registrations
- Event-wise registrations
- User-wise registrations
- Registration cancellation

## 🏢 Venue Management

- Create and manage venues
- Retrieve venue information
- Update venue details
- Delete venues

## 💳 Payment Management

- Payment records
- Event-wise payment retrieval
- User-wise payment retrieval
- Payment status updates

## ⭐ Feedback

- Submit feedback
- Event-wise feedback
- User-wise feedback

## 🛡️ Admin Dashboard

The project includes a dedicated React-based administration dashboard with:

- Dashboard overview and metrics
- Event management
- Registration management
- User management
- Event listing and upcoming events
- Search and navigation
- Authentication
- Logout
- Theme support
- API-connected dashboard services

## 🤖 AI Assistant

The platform includes an integrated AI assistant that can interact with the event-management backend.

Current capabilities include:

- Natural-language interaction
- Event-related queries
- RAG-based information retrieval
- Context-aware responses
- AI chat sessions
- Knowledge-base retrieval
- Integration with backend tools
- Agent-based workflow support

The AI assistant is connected to the application backend rather than being a standalone chatbot.

## 🧠 AI / RAG Architecture

The AI layer combines RAG, semantic retrieval, LLMs, and backend tools.

RAG Pipeline

Documents / Knowledge
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
 Vector / Knowledge Store
        │
        ▼
     Retriever
        │
        ▼
   Relevant Context
        │
        ▼
       LLM
        │
        ▼
 Context-Aware Response

Integrated AI Workflow

                 User Query
                     │
                     ▼
              AI Chat Endpoint
                     │
                     ▼
              AI Agent / Graph
                     │
          ┌──────────┴──────────┐
          │                     │
          ▼                     ▼
      RAG Retrieval        Backend Tools
          │                     │
          │              ┌──────┼──────┐
          │              ▼      ▼      ▼
          │           Events  Venue  Registration
          │
          └──────────┬──────────┘
                     ▼
              Context + Results
                     │
                     ▼
                    LLM
                     │
                     ▼
              Final AI Response

---

🏗️ System Architecture

                         ┌──────────────────────┐
                         │       Users          │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │    React Frontend    │
                         │                      │
                         │ • User Interface     │
                         │ • Event Discovery    │
                         │ • Registration       │
                         │ • Admin Dashboard    │
                         │ • AI Assistant       │
                         └──────────┬───────────┘
                                    │
                                    │ REST API
                                    ▼
                    ┌────────────────────────────────┐
                    │         FastAPI Backend        │
                    │                                │
                    │ • Authentication               │
                    │ • Users                        │
                    │ • Events                       │
                    │ • Registrations                │
                    │ • Venues                        │
                    │ • Payments                      │
                    │ • Feedback                      │
                    │ • AI Chat                       │
                    │ • Admin APIs                    │
                    └───────────────┬────────────────┘
                                    │
                    ┌───────────────┴────────────────┐
                    ▼                                ▼
          ┌────────────────────┐          ┌────────────────────┐
          │     Database       │          │    AI / RAG Layer  │
          │                    │          │                    │
          │ Users              │          │ Knowledge          │
          │ Events             │          │ Embeddings         │
          │ Registrations      │          │ Retrieval          │
          │ Venues             │          │ LLM                │
          │ Payments           │          │ Agent Graph        │
          │ Feedback           │          │ AI Tools           │
          └────────────────────┘          └────────────────────┘

---

🧩 Project Modules

Module| Responsibility
🔐 Authentication| Registration, login, authentication and authorization
👤 Users| User management and user information
🎫 Events| Event creation, retrieval, update and deletion
📝 Registrations| Event registration and cancellation
🏢 Venues| Venue management
💳 Payments| Payment records and status
⭐ Feedback| Event and user feedback
🛡️ Admin| Administrative dashboard and management
🧠 RAG| Knowledge processing and semantic retrieval
🤖 AI Assistant| Natural-language interaction and intelligent responses
🛠️ AI Tools| Backend operations exposed to the AI workflow

---

🛠️ Technology Stack

Frontend

- React
- Vite
- JavaScript / JSX
- CSS
- Lucide React

Backend

- Python
- FastAPI
- Uvicorn
- Pydantic
- RESTful API architecture

Database

- PostgreSQL
- SQLAlchemy
- Alembic

AI / Machine Learning

- LLM-based conversational AI
- Retrieval-Augmented Generation (RAG)
- Embeddings
- Semantic search
- Vector-based knowledge retrieval
- Agentic AI workflow
- Backend-integrated AI tools

Development Tools

- Git
- GitHub
- npm
- uv
- Vite
- Alembic

## ⚙️ Getting Started

Prerequisites

Make sure the following are installed:

- Python 3.x
- Node.js
- npm
- Git
- uv
- PostgreSQL


## 1️⃣ Clone the Repository

git clone <https://github.com/swati-0505/Smart-Event-Management>
cd Smart-Event-Management

## 2️⃣ Backend Setup

Install dependencies:

uv sync

Start the FastAPI development server:

uv run uvicorn app.main:app --reload

Backend:

http://127.0.0.1:8000

Health Check

http://127.0.0.1:8000/health

Expected response:

{
  "status": "ok"
}

API Documentation

Open:

http://127.0.0.1:8000/docs

FastAPI provides an interactive Swagger API interface for testing the available endpoints.


## 3️⃣ Frontend Setup

Open another terminal:

cd frontend
npm install
npm run dev

Frontend:

http://localhost:5173

Admin dashboard:

http://localhost:5173/admin.html

## 🔌 API Overview

The backend provides REST APIs for:

/api/auth/...
/api/users/...
/api/events/...
/api/registrations/...
/api/venues/...
/api/payments/...
/api/feedback/...
/api/admin/...
/api/chat/...

## 🖥️ Admin Dashboard

The dedicated administration interface provides:

- 📊 Dashboard metrics
- 🎫 Event management
- 📝 Registration management
- 👤 User management
- 📅 Upcoming events
- 🔎 Search and navigation
- 🔐 Admin authentication
- 🚪 Logout
- 🌓 Theme support
- 🔌 Backend API integration
- 🤖 AI assistant

The frontend service layer communicates with the FastAPI backend through REST APIs.


## 🤖 AI Assistant

The AI assistant is integrated directly into the Smart Event Management System.

Instead of functioning only as a general conversational chatbot, the AI layer is designed to work with application data and backend services.

Example Workflow

User:
"Show me all available events"

             ↓

        AI Assistant

             ↓

      Agent / Workflow

             ↓

     Event-related Tool

             ↓

       Backend API

             ↓

       Event Database

             ↓

       Retrieved Data

             ↓

          LLM

             ↓

       Natural-language
          Response

This allows users to interact with the event-management system using natural language.

---

## 🧠 RAG

The RAG layer provides knowledge retrieval capabilities for the AI system.

RAG Workflow

Knowledge Documents
        ↓
Document Loading
        ↓
Text Chunking
        ↓
Embedding Generation
        ↓
Knowledge / Vector Store
        ↓
Semantic Retrieval
        ↓
Relevant Context
        ↓
LLM
        ↓
Final Response

RAG can be extended to support event information, organizational knowledge, FAQs, policies, venue information, and other relevant documents.


## 🧪 Build & Verification

Frontend Production Build

cd frontend
npm run build

A successful build confirms that the frontend compiles correctly.

Backend

uv run uvicorn app.main:app --reload

Health Check

GET /health

API Testing

Use the FastAPI Swagger interface:

http://127.0.0.1:8000/docs


## 👥 Team & Contributions

This project is developed collaboratively as a part of the Infosyd Springboard Virtual Internship Program

Area| Responsibility
Backend| Authentication, events, registrations, users and backend services
AI| RAG, embeddings, LLM, agent workflows and AI tools
Frontend| User interface and administration dashboard
Database| Schema, queries and database integration
Integration| AI, backend and frontend integration
Testing| API, frontend and integration testing

Individual team-member names and GitHub profiles can be added before final submission.


## 🔒 Security

For production deployment, the following security practices should be followed:

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

.env
API keys
Database passwords
Private credentials
Secret tokens

---

## 🤝 Contributing

1. Create a feature branch.

git checkout -b feature/your-feature

2. Implement the feature.

3. Test locally.

4. Run the production build.

npm run build

5. Review your changes.

6. Commit with a meaningful message.

git add .
git commit -m "Add your feature"

7. Push the branch.

git push origin feature/your-feature

8. Open a Pull Request.

Example

git checkout -b feature/ai-recommendation
git add .
git commit -m "Add AI event recommendation service"
git push origin feature/ai-recommendation

## 🚀 Project Vision

The long-term objective is to evolve the platform from a conventional event-management application into an intelligent, AI-assisted event-management system.

The architecture combines:

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
Backend Tools
        +
Natural-Language Interaction
        +
Future Recommendations & Analytics

The current implementation provides a foundation for building intelligent workflows around event discovery, registration, knowledge retrieval, administration, and event-related assistance.

## 📄 License

This project was developed as part of the Infosys Springboard Virtual Internship Program for educational and professional learning purposes.

A formal open-source license can be added if the project is later released publicly.

## 🎟️ Smart Event Management System

Built with React • FastAPI • Python • PostgreSQL • RAG • LLM • AI Agents
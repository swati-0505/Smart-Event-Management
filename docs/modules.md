# Application Modules

This document describes the main functional modules of the Smart Event Management application, including their responsibilities and related backend components.

## 1. Authentication Module

Handles user registration, login, authentication, and authorization.

**Main operations:**
- User registration and duplicate-email validation
- User login and JWT token generation
- Current authenticated user information
- Password hashing and verification
- Role-based access control

**Related source:** `backend/app/api/auth.py`, `backend/app/core/`

## 2. User Module

Manages user information, profiles, and roles.

**Main operations:**
- Retrieve users and user details
- Look up users by email
- Create and manage user records
- Update user roles
- Delete users when authorized

**Related source:** `backend/app/api/users.py`, `backend/app/routers/user.py`, `backend/app/models/user.py`

## 3. Event Module

Handles event creation, discovery, and management.

**Main operations:**
- Create, view, update, and delete events
- Retrieve published events
- Manage event status and categories
- Manage event capacity and available seats
- Maintain event dates and registration deadlines
- Associate events with venues and creators

**Related source:** `backend/app/api/events.py`, `backend/app/routers/event.py`, `backend/app/models/event.py`

## 4. Registration Module

Manages user registrations for events.

**Main operations:**
- Create registrations
- Retrieve registration details
- View registrations by user or event
- Cancel registrations
- Enforce applicable access and registration rules

**Related source:** `backend/app/routers/registration.py`, `backend/app/models/registration.py`

## 5. Venue Module

Manages venue information associated with events.

**Main operations:**
- Create and retrieve venues
- Update venue information
- Delete venues when permitted
- Maintain venue names, addresses, cities, and capacities

**Related source:** `backend/app/routers/venue.py`, `backend/app/models/venue.py`

## 6. Payment Module

Manages payment records associated with users and events.

**Main operations:**
- Create payment records
- Retrieve payment information
- View payments by user or event
- Update payment status
- Maintain payment amounts, currency, transaction identifiers, and payment dates

**Related source:** `backend/app/routers/payment.py`, `backend/app/models/payment.py`

Note: The presence of payment-record APIs does not necessarily mean that a complete external payment gateway is integrated.

## 7. Feedback Module

Handles feedback and ratings associated with events.

**Main operations:**
- Submit feedback
- Retrieve feedback records
- Retrieve feedback by event or user
- Store ratings, comments, and creation timestamps

**Related source:** `backend/app/routers/feedback.py`, `backend/app/models/feedback.py`

## 8. Administration Module

Provides administrative operations and application-level management.

**Main operations:**
- Manage events, users, venues, registrations, and payment records through the applicable APIs
- Access the administrative dashboard
- Inspect cache status
- Clear application cache when authorized
- Access permitted AI monitoring and knowledge-management functions

**Related source:** `backend/app/api/admin.py`, `backend/app/core/`

Administrative operations are protected by the relevant authorization dependencies.

## 9. AI Assistant Module

Provides conversational AI functionality and application-related assistance.

**Main operations:**
- Process user chat requests
- Manage chat sessions and message history
- Detect user intent and execute agent workflows
- Use available application tools
- Generate responses using configured language-model services
- Record agent execution information

**Related source:** `backend/app/api/chat.py`, `backend/app/agent/`, `backend/app/tools/`, `backend/app/llm/`

The available functionality depends on the configured models, tools, and authorization rules.

## 10. RAG and Knowledge Module

Supports retrieval-augmented generation (RAG) by providing relevant information from ingested knowledge documents.

**Main operations:**
- Upload knowledge documents
- Ingest and process documents
- Split document content into searchable chunks
- Generate and store embeddings
- Retrieve relevant content using vector and text search
- Track document metadata and ingestion status

**Related source:** `backend/app/rag/`, `backend/app/api/chat.py`, `backend/app/models/knowledge.py`

The knowledge layer uses PostgreSQL with vector-search support and full-text search functionality.

## 11. AI Monitoring Module

Provides visibility into AI agent execution and tool activity for authorized administrators.

**Main operations:**
- View agent execution records
- Inspect individual agent runs
- Review tool calls and execution outcomes
- Inspect available latency, status, error, and grounding information

**Related source:** `backend/app/api/chat.py`, `backend/app/models/agent.py`

Monitoring details depend on the information recorded during each execution.

## 12. Database and Persistence Module

Provides persistent storage for application data and AI-related records.

**Main responsibilities:**
- Store users, events, venues, registrations, payments, and feedback
- Store AI sessions, messages, agent runs, and tool-call records
- Store knowledge documents and searchable chunks
- Define database models and relationships
- Manage schema changes through migrations

**Related source:** `backend/app/db/`, `backend/app/models/`, `backend/alembic/`

## 13. Frontend Module

Provides the user interface for interacting with the application.

**Main responsibilities:**
- Render application pages and user interfaces
- Support user interactions with event and registration functionality
- Communicate with backend APIs
- Display application data and responses
- Provide the configured client-side experience

**Related source:** `frontend2/`

## 14. Testing and Quality Assurance Module

Supports verification of application behavior and helps detect regressions.

**Main responsibilities:**
- Test backend endpoints and business logic
- Validate expected application behavior
- Support regression testing during development

**Related source:** `backend/tests/`

## Module Integration

The modules work together as follows:

1. The frontend sends requests to the backend APIs.
2. Authentication and authorization dependencies control access to protected operations.
3. Application routers and services implement the event-management functionality.
4. Database models persist application records in PostgreSQL.
5. The AI assistant coordinates language-model calls and available tools.
6. The RAG module retrieves relevant knowledge to support AI responses.
7. AI monitoring records provide visibility into agent runs and tool execution.
8. Tests help verify backend behavior and changes.

The exact runtime integration depends on the routers, services, and configuration enabled in the current application.

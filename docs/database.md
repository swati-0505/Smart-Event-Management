# Database Documentation

## 1. Database Technology

The Smart Event Management System uses the following database technologies:

- **PostgreSQL:** Primary relational database.
- **SQLAlchemy:** Object-relational mapper (ORM) for database operations.
- **Alembic:** Database schema migration management.
- **pgvector:** Stores and retrieves vector embeddings for AI-powered knowledge retrieval.
- **PostgreSQL full-text search:** Uses `TSVECTOR` fields to support text-based retrieval.

The database configuration is defined in `backend/app/db/database.py`, and model definitions are maintained in `backend/app/models/`.

## 2. Main Database Entities

### 2.1 User

**Table:** `users`

Stores user accounts and authentication information.

| Field | Description |
|---|---|
| `id` | UUID primary key |
| `name` | User's name |
| `email` | Unique, indexed email address |
| `password_hash` | Hashed password |
| `role` | User role; defaults to `USER` |
| `created_at` | Account creation timestamp |

### 2.2 Event

**Table:** `events`

Stores event details, scheduling, capacity, pricing, and publication status.

| Field | Description |
|---|---|
| `event_id` | UUID primary key |
| `title` | Event title |
| `description` | Optional event description |
| `category` | Event category |
| `venue_id` | Foreign key referencing `venues.venue_id` |
| `event_date` | Event start date and time |
| `end_time` | Optional event end time |
| `registration_deadline` | Optional registration deadline |
| `capacity` | Event capacity |
| `available_seats` | Available seats |
| `created_by` | Foreign key referencing `users.id` |
| `status` | Event status; defaults to `draft` |
| `ticket_price` | Ticket price; defaults to `0.0` |
| `created_at` | Event creation timestamp |

### 2.3 Venue

**Table:** `venues`

Stores the locations where events are held.

| Field | Description |
|---|---|
| `venue_id` | UUID primary key |
| `name` | Venue name |
| `address` | Venue address |
| `city` | City; indexed |
| `capacity` | Venue capacity; indexed |
| `created_at` | Record creation timestamp |

### 2.4 Registration

**Table:** `registrations`

Records users registering for events.

| Field | Description |
|---|---|
| `registration_id` | UUID primary key |
| `user_id` | Foreign key referencing `users.id`; indexed |
| `event_id` | Foreign key referencing `events.event_id`; indexed |
| `registration_date` | Registration timestamp |
| `status` | Registration status; defaults to `confirmed` |
| `created_at` | Record creation timestamp |

The model also declares a uniqueness constraint. Check `backend/app/models/registration.py` for its exact columns before documenting the constraint in more detail.

### 2.5 Payment

**Table:** `payments`

Stores payment records associated with users and events.

| Field | Description |
|---|---|
| `payment_id` | UUID primary key |
| `user_id` | Foreign key referencing `users.id`; indexed |
| `event_id` | Foreign key referencing `events.event_id`; indexed |
| `amount` | Payment amount |
| `currency` | Currency; defaults to `INR` |
| `payment_status` | Payment status; defaults to `pending` |
| `transaction_id` | Optional unique transaction identifier |
| `payment_date` | Payment record timestamp |

### 2.6 Feedback

**Table:** `feedback`

Stores event ratings and comments submitted by users.

| Field | Description |
|---|---|
| `feedback_id` | UUID primary key |
| `user_id` | Foreign key referencing `users.id`; indexed |
| `event_id` | Foreign key referencing `events.event_id`; indexed |
| `rating` | Feedback rating; indexed |
| `comment` | Optional feedback comment |
| `created_at` | Feedback creation timestamp |

## 3. AI Agent and Chat Tables

### 3.1 Agent Sessions

**Table:** `agent_sessions`

Stores AI chat session information, including the session owner, title, creation time, and last activity time.

Important fields include `session_id`, `user_id`, `title`, `created_at`, and `last_active_at`.

The `user_id` field is nullable, allowing sessions without an associated user.

### 3.2 Chat Messages

**Table:** `chat_messages`

Stores messages belonging to AI chat sessions.

Important fields include `message_id`, `session_id`, `role`, `content`, and `created_at`.

The `session_id` field references `agent_sessions.session_id` and specifies cascading deletion.

### 3.3 Agent Runs

**Table:** `agent_runs`

Stores information about AI agent executions.

Important fields include:

- `run_id`, `session_id`, and `user_id`
- `user_request` and `detected_intent`
- `final_response`
- `tool_loop_count` and `retry_count`
- `grounded`, `latency_ms`, and `status`
- `error` and `created_at`

This table supports monitoring and analysis of agent activity.

### 3.4 Tool Calls

**Table:** `tool_calls`

Records tool invocations made during agent runs.

Important fields include `tool_call_id`, `run_id`, `tool_name`, `tool_input`, `tool_output`, `latency_ms`, `status`, `error`, `sequence`, and `created_at`.

The `tool_input` field uses PostgreSQL JSONB storage. Tool calls reference `agent_runs.run_id`.

## 4. AI Knowledge and Retrieval Tables

### 4.1 Knowledge Documents

**Table:** `knowledge_documents`

Stores metadata about ingested knowledge documents.

Important fields include:

- `document_id`
- `filename` and `title`
- `doc_type`
- `content_hash`
- `chunk_count`
- `created_at` and `updated_at`

The filename is unique.

### 4.2 Knowledge Chunks

**Table:** `knowledge_chunks`

Stores chunks of ingested documents for retrieval.

Important fields include:

- `chunk_id` and `document_id`
- `doc_type` and `source_filename`
- `chunk_index` and `content`
- `embedding`
- `search_vec`
- `doc_metadata` and `created_at`

The `embedding` column uses pgvector. The `search_vec` column uses PostgreSQL's `TSVECTOR` type for full-text search. Metadata is stored using JSONB.

### 4.3 NVIDIA Knowledge Chunks

**Table:** `knowledge_chunks_nvidia`

Stores knowledge chunks in a separate table for an NVIDIA-specific knowledge index.

Its fields include `chunk_id`, `document_id`, `doc_type`, `source_filename`, `chunk_index`, `content`, `content_hash`, `primary_model`, `fallback_model`, `embedding_primary`, `embedding_fallback`, `search_vec`, `doc_metadata`, and `created_at`.

The primary and fallback embedding columns use pgvector, while `search_vec` supports PostgreSQL full-text search.

## 5. Database Relationships

The foreign keys declared in the models establish these relationships:

```text
users
 ├── events                 (created_by)
 ├── registrations
 ├── payments
 ├── feedback
 ├── agent_sessions         (optional user)
 └── agent_runs             (optional user)

venues
 └── events

events
 ├── registrations
 ├── payments
 └── feedback

agent_sessions
 ├── chat_messages
 └── agent_runs

agent_runs
 └── tool_calls

knowledge_documents
 ├── knowledge_chunks
 └── knowledge_chunks_nvidia
```

The relationships above reflect foreign-key declarations in the model files. Application-level ownership checks and business rules may impose additional restrictions.

## 6. Schema Migrations

Alembic is used to manage database schema migrations. Migration files are maintained in the backend's Alembic directory.

Review the existing migration scripts before applying schema changes to a shared or production database.

## 7. Relevant Source Files

- `backend/app/db/database.py` — Database engine and session configuration.
- `backend/app/models/user.py` — User model.
- `backend/app/models/event.py` — Event model.
- `backend/app/models/venue.py` — Venue model.
- `backend/app/models/registration.py` — Registration model.
- `backend/app/models/payment.py` — Payment model.
- `backend/app/models/feedback.py` — Feedback model.
- `backend/app/models/agent.py` — AI sessions, messages, runs, and tool calls.
- `backend/app/models/knowledge.py` — Knowledge documents, chunks, and embeddings.
- `backend/alembic/` — Database migration files.

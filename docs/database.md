# Database Documentation

## 1. Database Technology

The application uses PostgreSQL as its primary relational database.

SQLAlchemy is used as the ORM for database operations.

Alembic is used for database schema migrations.

pgvector is used for vector storage and retrieval for the AI/RAG functionality.

---

## 2. Main Database Entities

### User

Stores application user information.

Main fields:

- `id`
- `name`
- `email`
- `password_hash`
- `role`
- `created_at`

---

### Event

Stores event information.

Main fields:

- `event_id`
- `title`
- `description`
- `category`
- `venue_id`
- `event_date`
- `registration_deadline`
- `capacity`
- `available_seats`
- `created_by`
- `status`
- `created_at`

---

### Venue

Stores event venue information.

Main fields:

- `venue_id`
- `name`
- `address`
- `city`
- `capacity`
- `created_at`

---

### Registration

Stores user registrations for events.

The registration entity connects users with events and stores registration-related information.

---

### Payment

Stores payment-related information associated with the application's event registration workflow.

---

### Feedback

Stores feedback submitted by users.

---

### AI / Knowledge Data

The database also supports AI-related data required for chat sessions, knowledge retrieval, and vector-based search.

---

## 3. Relationships

The main relationships include:

```text
User
 │
 ├── Registrations
 │
 └── Created Events

Event
 │
 ├── Venue
 │
 └── Registrations

Venue
 │
 └── Events
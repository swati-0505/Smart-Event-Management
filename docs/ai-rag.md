# AI and RAG Documentation

The Smart Event Management System contains an Agentic AI and Retrieval-Augmented Generation (RAG) layer.

Detailed implementation documentation for this layer is available in:

[`documents/AGENT_RAG_README.md`](../documents/AGENT_RAG_README.md)

The existing AI/RAG documentation covers:

- LangGraph agent architecture
- Agent state and workflow
- Business tools
- RAG tools
- Tool permissions and RBAC
- Knowledge document ingestion
- Document conversion and chunking
- Embeddings
- PostgreSQL pgvector storage
- Sparse text search
- Dense vector search
- Reciprocal Rank Fusion (RRF)
- Reranking
- Grounding and hallucination checking
- Conversation memory
- AI configuration
- AI agent monitoring
- AI/RAG tests
- AI/RAG troubleshooting
- Current limitations and roadmap coverage

## Knowledge Documents

The AI knowledge base is maintained in the `documents/` directory.

Current knowledge documents include:

- `attendance_policy.md`
- `cancellation_policy.md`
- `event_policy.md`
- `faq.md`
- `registration_policy.md`
- `venue_policy.md`

These documents are processed and indexed for retrieval by the RAG pipeline.

## AI API

The main AI endpoints are:

```text
POST /api/chat
GET /api/chat/sessions
GET /api/chat/sessions/{session_id}
GET /api/admin/agent-activity
GET /api/admin/agent-activity/{run_id}
POST /api/admin/knowledge/ingest
GET /api/admin/knowledge/status
# Agent + RAG Layer

The Agentic AI half of the Smart Event Management System: the LangGraph agent,
its tools, and the hybrid-search RAG pipeline behind the policy knowledge base.

Built against the Infosys *Agentic AI Smart Event Management System* roadmap
(sections 10 to 16 and weeks 3 to 6), with the retrieval architecture adapted
from the hybrid-search design in the team's pipeline diagram.

---

## 1. What this layer does

```
User message
    │
    ▼
POST /api/chat ──► LangGraph agent ──► tool selection
                         │
            ┌────────────┴────────────┐
            ▼                         ▼
     Business tools               RAG tool
   (via service layer)      (hybrid search over
            │                 policy documents)
            ▼                         ▼
       PostgreSQL              pgvector + tsvector
            └────────────┬────────────┘
                         ▼
                   Agent observes
                         │
              another tool? ──yes──┐
                         │         │
                         no        └─► loop (capped)
                         ▼
                  Final response
```

Everything is logged to `agent_runs` and `tool_calls` for the
`/admin/agent-activity` view.

---

## 2. Setup

### Prerequisites

- PostgreSQL with the **pgvector** extension available
- Python 3.11+
- An OpenRouter API key — <https://openrouter.ai/keys>

Check pgvector is installable before anything else. If this fails, nothing
below will work:

```bash
psql -d eventdb -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

On Debian/Ubuntu: `sudo apt install postgresql-16-pgvector`.
On macOS/Homebrew: `brew install pgvector`.
Docker: use the `pgvector/pgvector:pg16` image instead of plain `postgres`.

### Install

```bash
cd backend
uv sync                 # or: pip install -e .
cp .env.example .env    # then replace the DATABASE_URL with your shared cloud DB
```

For a group project, do not use localhost as the database host. Use one shared PostgreSQL database in Neon, Supabase, Render, or Railway. Everyone on the team should point their local `.env` file to the same `DATABASE_URL` so you all work on the same data set.

### Migrate

```bash
alembic upgrade head
```

Migration `a1b2c3d4e5f6` creates the vector extension, the two knowledge
tables (with HNSW and GIN indexes) and the four agent tables.

### Index the policy documents

```bash
python scripts/ingest_knowledge.py
```

Expect roughly 38 chunks across the six documents in `documents/`. Re-running
is safe — unchanged files are skipped by content hash.

```bash
python scripts/ingest_knowledge.py --force   # after changing model or chunk size
python scripts/ingest_knowledge.py --clear   # wipe the index first
```

### Run

```bash
uvicorn app.main:app --reload
```

Verify the index is populated:

```bash
curl -H "Authorization: Bearer <admin-jwt>" \
  http://localhost:8000/api/admin/knowledge/status
```

---

## 3. Endpoints

| Method | Path | Access | Purpose |
|---|---|---|---|
| POST | `/api/chat` | any user | Talk to the agent |
| GET | `/api/chat/sessions` | any user | The caller's conversation threads |
| GET | `/api/chat/sessions/{id}` | owner only | Messages in one thread |
| GET | `/api/admin/agent-activity` | admin | Recent agent runs |
| GET | `/api/admin/agent-activity/{run_id}` | admin | One run with its tool calls |
| POST | `/api/admin/knowledge/ingest` | admin | Reindex the documents |
| GET | `/api/admin/knowledge/status` | admin | What is currently indexed |

### Request / response

```jsonc
// POST /api/chat
{ "message": "find an AI workshop and register me", "session_id": null }

// 200
{
  "reply": "I found the AI Foundations workshop on Saturday and registered you...",
  "session_id": "…", "run_id": "…",
  "intent": "MULTI_STEP",
  "tools_used": ["search_events", "register_participant"],
  "sources": [],
  "latency_ms": 3120.5,
  "status": "success"
}
```

Pass `session_id` back on the next message to continue the conversation.
Omit it to start a fresh thread.

### Frontend wiring

`frontend/src/admin/services/aiService.js` is still returning its mock. Switch
`sendAIMessage` to the real call:

```js
export async function sendAIMessage(message, conversationId = null) {
  return apiPost("/chat", { message, session_id: conversationId });
}
```

The response field is `session_id`, not `conversation_id` — the mock used the
latter, so that one rename is needed on the calling side.

---

## 4. The tools

Nine from section 10 of the roadmap, plus three helpers.

| Tool | Access | Wraps |
|---|---|---|
| `search_events` | user | `event_service` |
| `get_event_details` | user | `event_service` |
| `search_venues` * | user | `venue_service` |
| `check_venue_availability` | user | `availability_service` |
| `register_participant` | user | `registration_service` |
| `cancel_registration` | user | `registration_service` |
| `my_registrations` * | user | `registration_service` |
| `search_event_policy` | user | RAG pipeline |
| `create_event` | **admin** | `event_service` |
| `update_event` | **admin** | `event_service` |
| `cancel_event` | **admin** | `event_service` |
| `get_event_registrations` * | **admin** | `registration_service` |

\* Not in the roadmap's list. `search_venues` exists because
`check_venue_availability` needs a `venue_id` and users say "the Main
Auditorium" — without a lookup the model's only way to produce that id is to
invent one.

**No tool touches SQL.** Every one calls a service, per section 10.

### Identity and permissions

Tools take business arguments only. `user_id`, `role` and the database session
travel through a `contextvars`-based `ToolContext`, set by the chat endpoint
from the JWT.

This is deliberate. LangChain turns a tool signature into the JSON schema the
model sees, so a visible `user_id` parameter would let a user say *"register
bob@example.com for me"* and have the model comply. A test asserts no tool
exposes it.

Admin tools are filtered out before binding **and** call `require_admin()`
internally. The prompt also says so, but prompt instructions are a suggestion
and the Python check is the guarantee.

---

## 5. RAG pipeline

### Indexing

```
documents/*.md
   │ MarkItDown (pdf, docx, pptx, xlsx, html, csv)
   ▼ Markdown
   │ heading-aware chunker
   ▼ chunks (~1400 chars)
   │ LLM metadata extractor (summary + synonym keywords)
   ▼
   ├─► dense embedding ──► knowledge_chunks.embedding  (vector 1024, HNSW)
   └─► to_tsvector      ──► knowledge_chunks.search_vec (tsvector, GIN)
```

### Query

```
question
   ├─► dense_search  (cosine, top 20)  ─┐
   └─► sparse_search (ts_rank_cd, 20)  ─┴─► RRF fusion (top 10)
                                              │
                                         reranker (top 4)
                                              │
                                        prompt builder
                                              │
                                             LLM
                                              │
                                     hallucination checker
                                         │         │
                                    grounded   ungrounded ──► retry once
                                         │                       │
                                         ▼                       ▼
                                   final answer            refuse to answer
```

### Where this departs from the diagram

| Diagram | Here | Why |
|---|---|---|
| Qdrant | PostgreSQL + pgvector | The roadmap mandates pgvector. One database instead of two services. |
| BM25 via FastEmbed | Postgres FTS (`tsvector` + `ts_rank_cd`) | pgvector has no sparse-vector support. `ts_rank_cd` lacks BM25's document-length normalisation, but over short uniform policy chunks that barely matters, and it brings stemming and stopwords for free. |
| `nomic-embed-text` | `liquid/lfm-2.5-embedding-350m` | What the team's `.env` specifies. |
| Ollama / Gemma | OpenRouter | Same. |
| — | Reranking stage | Requested; retrieval is tuned for recall, so precision has to come from somewhere. |
| — | Conversation memory | Requested; also needed for the roadmap's `agent_sessions`. |

Everything else — unified conversion, smart chunking, LLM metadata, dual
embedding, RRF fusion, hallucination check with retry — follows the diagram.

### Why RRF rather than combining scores

Cosine similarity lives roughly in `[0, 1]`; `ts_rank_cd` is unbounded and
differently distributed. You cannot add them, and normalising into a shared
range needs assumptions that break as soon as the corpus changes. RRF discards
the scores and uses only rank:

```
score(chunk) = Σ  1 / (K + rank_in_that_list)
```

A chunk ranked first by one arm and missing from the other still scores well,
which is the point — the arms are *supposed* to disagree.

---

## 6. Configuration

All in `app/core/ai_config.py`, overridable from `.env`.

### The three settings that matter most

**`EMBEDDING_DIM=1024`** must match the `vector(1024)` column in migration
`a1b2c3d4e5f6`. Changing the embedding model means a new migration *and*
`--force` reingest. `embed_texts()` raises if the model returns a different
size rather than corrupting the column.

**`CHUNK_SIZE_CHARS=1400`** is set by the embedding model's **512-token**
limit, not by taste. Longer chunks are silently truncated by the model — you
get a vector that does not represent its own text and **no error anywhere**. A
test asserts `CHUNK_SIZE + OVERLAP` stays under that ceiling.

**`CHAT_MODEL=openrouter/free`** routes to a *randomly chosen* free model on
every request. It filters for tool-calling support so it works, but the model
changing between calls makes agent behaviour inconsistent. Fine while
developing; **pin a specific slug before a demo or evaluation.**

### Retrieval tuning

| Setting | Default | Effect |
|---|---|---|
| `DENSE_TOP_K` / `SPARSE_TOP_K` | 20 | Candidates per arm. Raise for recall, cost is rerank latency. |
| `RRF_K` | 60 | Lower sharpens the top rank; higher flattens. |
| `FUSED_TOP_K` | 10 | Candidates reaching the reranker. |
| `FINAL_TOP_K` | 4 | Chunks reaching the prompt. Raising this often *hurts* — irrelevant context is a common cause of confident wrong answers. |
| `AGENT_MAX_TOOL_LOOPS` | 6 | Hard stop on the reason/act cycle. |
| `MEMORY_WINDOW_MESSAGES` | 10 | Prior turns loaded into context. |

Feature flags: `ENABLE_RERANKER`, `ENABLE_METADATA_EXTRACTION`,
`ENABLE_HALLUCINATION_CHECK`. Turn them off to isolate a problem — if answers
improve with the reranker off, the reranker is the issue.

---

## 7. Tests

```bash
pytest tests/ai -q          # 89 tests, no database or API key needed
```

The parent `tests/conftest.py` has an autouse fixture that creates tables
against a real Postgres. `tests/ai/conftest.py` shadows it, so chunking and
fusion arithmetic do not depend on a running database. The API tests are
unaffected.

| File | Covers |
|---|---|
| `test_chunker.py` | Heading trails, size limits, overlap, merge-not-drop |
| `test_fusion.py` | RRF formula, rank-over-score, single-arm survival |
| `test_generation.py` | Score parsing, grounding verdicts, failure fallbacks |
| `test_tools_security.py` | Context isolation, RBAC, no identity in signatures |
| `test_agent_graph.py` | Routing, loop cap, tool errors, finalize fallbacks |

### Two bugs these tests caught

**Short sections vanished from the index.** Splitting by heading gave each
section its own chunk, and anything under `min_size` was dropped. Policy
documents put the rule in short sections — *"Less than 48 hours before the
event, no refund is issued"* is 56 characters. It was being deleted while the
surrounding prose stayed, so retrieval returned something plausible and wrong
with no error anywhere. Undersized chunks now merge into a neighbour.

**`overlap or default` swallowed an explicit `0`.** Passing `overlap=0`
silently became 200, so chunks exceeded their stated size. Now `is None`.

---

## 8. Troubleshooting

**`type "vector" does not exist`** — pgvector is not installed in the
database. See prerequisites.

**`Embedding model returned N dims but EMBEDDING_DIM is 1024`** — the model
changed. Update `EMBEDDING_DIM`, write a migration altering the column, then
`--force` reingest.

**Agent invents event IDs** — usually the model, not the prompt. Pin
`CHAT_MODEL` to a known tool-calling slug rather than `openrouter/free`. The
UUID parse error already tells the model to search first.

**Policy answers are "I could not find that"** — check
`/api/admin/knowledge/status` shows chunks. If it does, the grounding checker
may be over-rejecting; set `ENABLE_HALLUCINATION_CHECK=false` to confirm
before tuning.

**Rate limits (429)** — free-tier limits are low and ingest makes one metadata
call per chunk. Set `ENABLE_METADATA_EXTRACTION=false` for a faster, cheaper
ingest; retrieval degrades slightly.

**Everything is slow** — one turn can be four LLM calls (intent, reason,
rerank, grounding) plus a retry. Free models are slow. Set
`ENABLE_METADATA_EXTRACTION=false` and pin a fast model for a demo.

---

## 9. Layout

```
app/
├── agent/
│   ├── state.py          AgentState (roadmap section 10)
│   ├── prompts.py        System prompt + intent classification
│   ├── memory.py         Session and message persistence
│   ├── nodes.py          classify_intent, load_memory, reason, act, finalize
│   └── graph.py          StateGraph assembly + run_agent()
├── tools/
│   ├── context.py        ToolContext, require_admin  ← security boundary
│   ├── registry.py       Role-filtered tool lists
│   ├── formatting.py     Tool output formatting, UUID/date parsing
│   ├── event_tools.py    5 tools
│   ├── venue_tools.py    2 tools
│   ├── registration_tools.py  4 tools
│   └── rag_tools.py      search_event_policy
├── rag/
│   ├── clients.py        OpenRouter chat + embeddings
│   ├── converter.py      MarkItDown → Markdown
│   ├── chunker.py        Heading-aware splitting
│   ├── metadata.py       LLM metadata extraction
│   ├── ingest.py         Indexing orchestration
│   ├── search.py         dense_search + sparse_search
│   ├── fusion.py         Reciprocal Rank Fusion
│   ├── reranker.py       LLM / cross-encoder reranking
│   ├── generator.py      Prompt building + grounding check
│   └── pipeline.py       retrieve() and answer()
├── observability/logger.py   agent_runs + tool_calls
├── models/{knowledge,agent}.py
├── services/availability_service.py
└── api/chat.py
```

---

## 10. Roadmap coverage

Done: authentication-aware agent, RBAC, controlled tool calling, agent state,
multi-step workflows, document ingestion, chunking, embeddings, vector
storage, semantic search, business-vs-RAG routing, agent activity logging,
tool-failure handling, unit and agent and RAG tests.

Not mine / not done: notification tools (no notification service exists),
E2E tests with Playwright (frontend), Docker deployment (week 8).

Known limits worth naming in a review:

- `Event` has no `end_time`, so availability assumes a 3-hour window.
- Ingest is synchronous. Fine for six documents; move it to a worker beyond that.
- `ts_rank_cd` is not true BM25 (no length normalisation).
- Memory is a fixed window of 10 turns — no summarisation of older context.

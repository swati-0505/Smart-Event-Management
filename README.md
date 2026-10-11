# Retrieval-Augmented Generation (RAG) Module

## Smart Event Management — Infosys Springboard Virtual Internship 7.0

**Contributor:** Pushpa Uppu  
**Project:** Smart Event Management  
**Module:** Retrieval-Augmented Generation (RAG), Embeddings and Knowledge Retrieval

---

## 1. Introduction

The Retrieval-Augmented Generation (RAG) module enables the Smart Event Management AI assistant to retrieve relevant information from project knowledge documents and use that information to generate context-aware responses.

Instead of relying only on information learned during language model training, RAG retrieves relevant content from an external knowledge base at query time. The retrieved content is supplied as context to the language model.

This approach supports answering questions about event policies, registration procedures, cancellation rules, venue information, attendance policies, and frequently asked questions.

## 2. Objectives

The main objectives of the RAG module are:

- Process and prepare event-related knowledge documents.
- Divide documents into smaller, meaningful text chunks.
- Convert text into numerical embeddings.
- Store and retrieve vector representations using a vector-enabled database.
- Find information semantically relevant to a user's question.
- Supply retrieved information as context for AI response generation.
- Support more relevant and context-aware answers from the AI assistant.
- Make the knowledge base easier to maintain and extend.

## 3. RAG Architecture

The RAG workflow consists of two major processes: knowledge ingestion and query-time retrieval.

### A. Knowledge Ingestion Pipeline

1. **Document Loading:** Read supported knowledge documents.
2. **Document Conversion:** Prepare document content as text for processing.
3. **Text Chunking:** Divide longer documents into smaller text segments.
4. **Metadata Preparation:** Associate relevant metadata with processed content.
5. **Embedding Generation:** Convert text chunks into numerical vector representations.
6. **Vector Storage:** Store embeddings and associated knowledge in the configured database.

### B. Query and Retrieval Pipeline

1. **User Query:** The user asks a question through the AI assistant.
2. **Query Processing:** Prepare the query for retrieval.
3. **Semantic Retrieval:** Search for relevant knowledge using vector similarity.
4. **Context Preparation:** Collect the retrieved content for use by the AI workflow.
5. **Response Generation:** The language model uses the query and retrieved context to generate a response.
6. **Response Delivery:** Return the generated answer through the application's AI assistant.

The exact execution path depends on the application's configured retrieval and agent workflow.

## 4. Architecture Diagram

```text
                 KNOWLEDGE INGESTION

        Event Policies and Knowledge Documents
                         |
                         v
               Document Processing
                         |
                         v
                   Text Chunking
                         |
                         v
                 Embedding Generation
                         |
                         v
               Vector / Knowledge Store


                  QUERY PROCESSING

                    User Question
                         |
                         v
                  AI Chat Workflow
                         |
                         v
                Query / RAG Retrieval
                         |
                         v
               Relevant Knowledge Chunks
                         |
                         v
                 Context Preparation
                         |
                         v
                  Language Model
                         |
                         v
                 Context-Aware Answer
```

## 5. Knowledge Base Documents

The project includes knowledge documents covering important event-management topics.

| Document | Purpose |
|---|---|
| `event_policy.md` | Event-related policies |
| `registration_policy.md` | Registration procedures and rules |
| `cancellation_policy.md` | Cancellation-related information |
| `venue_policy.md` | Venue-related information |
| `attendance_policy.md` | Attendance rules and information |
| `faq.md` | Frequently asked questions |

These documents provide domain-specific knowledge that can be processed and retrieved by the RAG system.

## 6. Document Processing and Chunking

Documents can contain more information than is suitable for a single retrieval unit. Chunking divides the document text into smaller segments.

### Why chunking is important

- Improves the retrieval of specific information.
- Helps retrieve only the relevant portions of longer documents.
- Makes it easier to associate metadata with individual text segments.
- Provides focused context for the language model.

### Chunk overlap

Chunk overlap preserves some text between neighboring chunks. This can help retain context when an important sentence or concept crosses a chunk boundary.

The chunk size and overlap should be selected according to document length, retrieval quality, and the embedding model's input limits.

## 7. Embeddings

Embeddings represent text as numerical vectors. Texts with related meanings can have similar vector representations, allowing semantic retrieval beyond exact keyword matching.

For example, a question such as "How can I cancel my event registration?" may be related to a document section that explains cancellation procedures, even when the wording is different.

The project README identifies `BAAI/bge-small-en-v1.5` as the RAG embedding model. It produces 384-dimensional embeddings.

### Benefits of embeddings

- Support semantic similarity search.
- Help identify related content even when wording differs.
- Convert text into a representation suitable for vector retrieval.
- Support knowledge retrieval for natural-language questions.

## 8. Vector Database and PGVector

PostgreSQL with the PGVector extension supports storing and searching vector embeddings alongside structured database information.

The project uses a PostgreSQL-based architecture with vector support for its knowledge retrieval workflow.

### Role of the vector store

- Stores embedding vectors with associated knowledge.
- Supports similarity-based retrieval.
- Helps identify relevant chunks for a user's query.
- Can associate stored knowledge with metadata.

### Similarity search

Similarity search compares vector representations to identify text chunks related to the query. The selected results are passed to the retrieval and context-preparation stages.

Retrieval quality depends on factors such as chunking, embedding quality, search configuration, and the relevance of the source documents.

## 9. Metadata and Retrieval

Metadata provides additional information about stored knowledge, such as document identity or source information, where configured.

Metadata can help organize retrieved content and trace results back to their source documents.

The retrieval stage identifies relevant chunks for a user's query. A top-k retrieval strategy, when configured, selects a limited number of the most relevant candidates.

The quality of retrieved context is important because the language model uses this context when preparing its answer.

## 10. Integration with the AI Assistant

The RAG module forms part of the Smart Event Management AI workflow.

The AI assistant accepts natural-language questions and works with the backend AI workflow to retrieve knowledge and generate responses.

Example questions include:

- What is the event registration process?
- What is the cancellation policy?
- What are the attendance rules?
- What information is available about venue policies?
- Where can I find answers to common event-related questions?

The final answer depends on the available knowledge documents, retrieval results, and the configured language model.

## 11. Technology Stack

| Technology | Purpose |
|---|---|
| Python | RAG implementation and document processing |
| FastAPI | Backend API integration |
| PostgreSQL | Relational database |
| PGVector | Vector storage and similarity search |
| BAAI/bge-small-en-v1.5 | Embedding model identified by the project configuration |
| Large Language Model (LLM) | Response generation using retrieved context |
| Git and GitHub | Version control and collaboration |

## 12. Relevant Source Code

The RAG implementation is located in `backend/app/rag/`.

| File | Area of responsibility |
|---|---|
| `chunker.py` | Text chunking |
| `clients.py` | RAG-related client integrations |
| `converter.py` | Content conversion |
| `fusion.py` | Retrieval fusion functionality |
| `generator.py` | Response-generation functionality |
| `ingest.py` | Knowledge ingestion |
| `metadata.py` | Metadata handling |
| `pipeline.py` | RAG pipeline coordination |
| `reranker.py` | Candidate reranking |
| `search.py` | Search and retrieval |

Additional project files relevant to knowledge ingestion and configuration include:

- `backend/scripts/ingest_knowledge.py`
- `backend/app/models/knowledge.py`
- `backend/app/core/ai_config.py`
- `backend/AGENT_RAG_README.md`

These files should be consulted when tracing the exact implementation or configuration of a particular feature.

## 13. Testing and Evaluation

The RAG workflow should be evaluated using representative questions from the event-management domain.

Useful evaluation checks include:

- Whether the expected source document is retrieved.
- Whether the retrieved chunks are relevant to the question.
- Whether important information is preserved during chunking.
- Whether the generated response is supported by the retrieved context.
- Whether missing information is handled appropriately.
- Whether changes to chunking or embedding configuration affect retrieval quality.

Relevant automated tests are available under `backend/tests/ai/`, including tests related to chunking, search, clients, and generation.

## 14. Challenges and Considerations

Important considerations when developing a RAG system include:

- Choosing suitable chunk sizes and overlap.
- Generating consistent embeddings.
- Keeping the embedding model and stored vector dimensions compatible.
- Retrieving relevant context without adding unnecessary information.
- Keeping knowledge documents up to date.
- Managing database configuration and document ingestion.
- Evaluating generated answers for relevance and factual support.

## 15. My Contribution — Pushpa Uppu

My assigned area in the Smart Event Management team project is the RAG module, with a focus on embeddings, vector database concepts, and knowledge retrieval.

My learning and contribution areas include:

- Understanding the end-to-end RAG architecture.
- Studying document loading, processing, and chunking.
- Understanding how text embeddings support semantic search.
- Exploring PostgreSQL with PGVector for vector-based knowledge retrieval.
- Understanding similarity search, metadata, and retrieved context.
- Documenting the RAG pipeline and its integration with the AI assistant.

This documentation describes my RAG-related work and the module's role in the overall project. Individual implementation and testing responsibilities should be described according to the work actually completed.

## 16. Conclusion

The RAG module provides a knowledge-retrieval layer for the Smart Event Management AI assistant. By processing event-related documents, generating embeddings, and retrieving relevant content, it supports context-aware responses to natural-language questions.

The module demonstrates how document processing, vector search, and language-model generation can work together to support an intelligent event-management application.

---

**Project:** Smart Event Management  
**Internship:** Infosys Springboard Virtual Internship 7.0  
**Module:** RAG, Embeddings and Vector-Based Knowledge Retrieval  
**Contributor:** Pushpa Uppu

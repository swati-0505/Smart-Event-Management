# AI and RAG Documentation

## 1. Overview

The Smart Event Management System includes an AI-powered assistant that uses an agent-based workflow and Retrieval-Augmented Generation (RAG).

The AI system can retrieve relevant information from the project's knowledge base and generate responses based on the retrieved information.

---

## 2. AI Components

The AI functionality uses:

- LangGraph
- LangChain
- OpenAI
- pgvector
- MarkItDown

---

## 3. Knowledge Base

The project's `documents/` directory contains knowledge documents used by the AI system.

Examples include:

- Event policies
- Registration policies
- Cancellation policies
- Attendance policies
- Venue policies
- FAQs

---

## 4. RAG Workflow

The RAG workflow follows these steps:

```text
User Question
      │
      ▼
AI Chat API
      │
      ▼
AI Agent
      │
      ▼
Knowledge Retrieval
      │
      ▼
Vector Search
      │
      ▼
Relevant Documents
      │
      ▼
Language Model
      │
      ▼
Generated Response
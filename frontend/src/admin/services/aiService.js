// aiService.js
// AI Assistant — connected to FastAPI backend.
import { apiPost, apiGet } from "./api";

export async function sendAIMessage(message, sessionId = null) {
  return await apiPost("/chat", {
    message,
    session_id: sessionId,
  });
}

export async function getConversation(conversationId) {
  return await apiGet(`/chat/${conversationId}`);
}

export async function getQuickPrompts() {
  return [
    "Show me upcoming events",
    "How many registrations this month?",
    "Generate a report for last week",
    "Create a new event template",
    "What's the attendance rate?",
  ];
}

export default {
  sendAIMessage,
  getConversation,
  getQuickPrompts,
};
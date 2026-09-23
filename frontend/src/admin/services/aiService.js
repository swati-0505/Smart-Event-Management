// aiService.js
// AI Assistant — connected to FastAPI backend.

import { apiPost, apiGet } from "./api";
export async function sendAIMessage(message, conversationId = null) {
  if (!message || !message.trim()) {
    throw new Error("Message cannot be empty.");
  }
  const payload = {
    message: message.trim(),
  };
  if (conversationId) {
    payload.conversation_id = conversationId;
  }
  return await apiPost("/chat", payload);
}
export async function getConversation(conversationId) {
  if (!conversationId) {
    return [];
  }

  return await apiGet(`/chat/conversations/${conversationId}`);
}

/**
 * Quick prompts shown in the AI Assistant.
 */
export async function getQuickPrompts() {
  return [
    "Show me upcoming events",
    "How many registrations this month?",
    "Generate a report for last week",
    "Create a new event template",
    "What's the attendance rate?",
    "Show me available venues",
  ];
}

export default {
  sendAIMessage,
  getConversation,
  getQuickPrompts,
};
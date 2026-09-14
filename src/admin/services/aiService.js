// aiService.js
// AI Assistant — backend-ready.
// Sends messages to LangGraph agent via FastAPI.

import { apiPost, apiGet } from "./api";

/**
 * Send a message to AI assistant.
 * 🚀 Backend: POST /admin/ai/chat
 * Returns: { reply: string, tool_used?: string, latency?: number }
 */
export async function sendAIMessage(message, conversationId = null) {
  // ✅ MOCK — simulate a reply
  await new Promise((r) => setTimeout(r, 1200));

  return {
    reply:
      "This is a demo response. Once the backend AI agent is connected, I'll provide real answers based on your event data.",
    tool_used: null,
    latency: 1200,
    conversation_id: conversationId || `conv_${Date.now()}`,
  };

  // 🚀 PRODUCTION
  // return apiPost("/admin/ai/chat", {
  //   message,
  //   conversation_id: conversationId,
  // });
}

/**
 * Get AI conversation history.
 * 🚀 Backend: GET /admin/ai/conversations/:id
 */
export async function getConversation(conversationId) {
  await new Promise((r) => setTimeout(r, 200));
  return [];

  // 🚀 PRODUCTION
  // return apiGet(`/admin/ai/conversations/${conversationId}`);
}

/**
 * Get quick prompts / suggestions.
 * 🚀 Backend: GET /admin/ai/prompts
 */
export async function getQuickPrompts() {
  await new Promise((r) => setTimeout(r, 100));

  return [
    "Show me upcoming events",
    "How many registrations this month?",
    "Generate a report for last week",
    "Create a new event template",
    "What's the attendance rate?",
  ];

  // 🚀 PRODUCTION
  // return apiGet("/admin/ai/prompts");
}

export default { sendAIMessage, getConversation, getQuickPrompts };
import { apiGet, apiPost, apiDelete } from "./api/client";

export async function sendChatMessage(message, sessionId = null) {
  const response = await apiPost(
    "/chat",
    { message, session_id: sessionId },
    { timeoutMs: 90000 }
  );

  if (response && response.status === "error") {
    throw new Error(response.reply || "The AI assistant encountered an error processing your request.");
  }

  return response;
}

export async function getChatSessions() {
  return apiGet("/chat/sessions");
}

export async function getSessionMessages(sessionId) {
  return apiGet(`/chat/sessions/${encodeURIComponent(sessionId)}`);
}

export async function deleteChatSession(sessionId) {
  return apiDelete(`/chat/sessions/${encodeURIComponent(sessionId)}`);
}

export async function deleteMultipleChatSessions(sessionIds) {
  return apiDelete("/chat/sessions", { body: { session_ids: sessionIds } });
}


import React, { createContext, useContext, useState, useEffect } from "react";
import { sendChatMessage, getChatSessions, getSessionMessages, deleteChatSession } from "../services/chatService";

const AIChatContext = createContext();

export function AIChatProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([
    {
      id: "init",
      role: "assistant",
      content: "👋 Hello! I am your SmartEvent AI Assistant. Ask me anything about events, venues, registration rules, or platform analytics.",
      timestamp: new Date(),
    },
  ]);
  const [loading, setLoading] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);

  const toggleAIChat = () => setIsOpen((prev) => !prev);
  const openAIChat = () => setIsOpen(true);
  const closeAIChat = () => setIsOpen(false);

  
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await getChatSessions();
      if (Array.isArray(data)) {
        setSessions(data);
      }
    } catch (err) {
      console.warn("Could not load AI chat sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  
  const selectSession = async (sessionId) => {
    setActiveSessionId(sessionId);
    if (!sessionId) {
      setMessages([
        {
          id: "init",
          role: "assistant",
          content: "👋 Starting a new chat session. How can I help you today?",
          timestamp: new Date(),
        },
      ]);
      return;
    }

    setLoading(true);
    try {
      const history = await getSessionMessages(sessionId);
      if (Array.isArray(history) && history.length > 0) {
        setMessages(
          history.map((m, idx) => ({
            id: m.id || idx.toString(),
            role: m.role,
            content: m.content,
            timestamp: m.created_at ? new Date(m.created_at) : new Date(),
          }))
        );
      }
    } catch (err) {
      console.warn("Error loading session messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([
      {
        id: "init",
        role: "assistant",
        content: "👋 New conversation started. Ask me any question!",
        timestamp: new Date(),
      },
    ]);
  };

  
  const deleteSession = async (sessionId) => {
    try {
      await deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      if (activeSessionId === sessionId) {
        startNewChat();
      }
    } catch (err) {
      console.warn("Failed to delete session:", err);
      throw err;
    }
  };

  
  const sendMessage = async (userQuery) => {
    if (!userQuery.trim() || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      role: "user",
      content: userQuery.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await sendChatMessage(userQuery, activeSessionId);
      
      if (response?.session_id && !activeSessionId) {
        setActiveSessionId(response.session_id);
        loadSessions(); 
      }

      const assistantMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response.reply || response.response || response.message || "I have processed your query.",
        latency: response.latency_seconds || (response.latency_ms ? response.latency_ms / 1000 : null),
        toolsUsed: response.tools_used || [],
        sources: response.sources || [],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
      window.dispatchEvent(new CustomEvent("registration-changed"));
    } catch (err) {
      const errorMsg = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        isError: true,
        content: err.message || "Sorry, I couldn't reach the AI Assistant.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadSessions();
    }
  }, [isOpen]);

  return (
    <AIChatContext.Provider
      value={{
        isOpen,
        toggleAIChat,
        openAIChat,
        closeAIChat,
        sessions,
        activeSessionId,
        messages,
        loading,
        loadingSessions,
        selectSession,
        startNewChat,
        deleteSession,
        sendMessage,
      }}
    >
      {children}
    </AIChatContext.Provider>
  );
}

export function useAIChat() {
  return useContext(AIChatContext);
}

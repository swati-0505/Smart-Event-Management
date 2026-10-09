import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  Send,
  User,
  AlertCircle,
  Plus,
  History,
  MessageSquare,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import {
  sendChatMessage,
  getChatSessions,
  getSessionMessages,
  deleteChatSession,
} from "../../services/chatService";
import { LoadingSpinner } from "../../components/common/LoadingSpinner";
import ChatMessageContent from "../../components/chat/ChatMessageContent";

const INIT_MSG = {
  id: "init",
  role: "assistant",
  content:
    "Hello! I am your SmartEvent AI Operations Assistant. Ask me anything about event schedules, venue statistics, registrations, or system policies.",
  timestamp: new Date(),
};

export default function AIAssistant() {
  const [messages, setMessages] = useState([INIT_MSG]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);

  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState(null);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  
  const loadSessions = async () => {
    setLoadingSessions(true);
    try {
      const data = await getChatSessions();
      if (Array.isArray(data)) setSessions(data);
    } catch (err) {
      console.warn("Could not load sessions:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  useEffect(() => {
    loadSessions();
  }, []);

  const selectSession = async (sessionId) => {
    setActiveSessionId(sessionId);
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
      } else {
        setMessages([INIT_MSG]);
      }
    } catch (err) {
      console.warn("Failed to load session messages:", err);
    } finally {
      setLoading(false);
    }
  };

  const startNewChat = () => {
    setActiveSessionId(null);
    setMessages([
      {
        id: "init-new",
        role: "assistant",
        content: "Started a new conversation. How can I assist you today?",
        timestamp: new Date(),
      },
    ]);
  };

  const handleDeleteSession = async (sessionId) => {
    setDeletingSessionId(sessionId);
    try {
      await deleteChatSession(sessionId);
      setSessions((prev) => prev.filter((s) => s.session_id !== sessionId));
      if (activeSessionId === sessionId) startNewChat();
    } catch (err) {
      console.warn("Failed to delete session:", err);
    } finally {
      setDeletingSessionId(null);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setMessages((prev) => [
      ...prev,
      { id: Date.now().toString(), role: "user", content: userQuery, timestamp: new Date() },
    ]);
    setInput("");
    setLoading(true);

    try {
      const response = await sendChatMessage(userQuery, activeSessionId);
      if (response?.session_id && !activeSessionId) {
        setActiveSessionId(response.session_id);
        loadSessions();
      }
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content:
            response.reply ||
            response.response ||
            response.answer ||
            response.message ||
            "I have processed your query.",
          latency: response.latency_ms ? response.latency_ms / 1000 : null,
          timestamp: new Date(),
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          isError: true,
          content: err.message || "Sorry, I encountered an issue connecting to the AI service.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", height: "calc(100vh - var(--navbar-height) - 4rem)", gap: "1rem" }}>
      
      <div
        style={{
          width: sidebarOpen ? "260px" : "48px",
          transition: "width 0.25s ease",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg-elevated)",
          borderRadius: "var(--radius-xl)",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
        }}
      >
        
        <div
          style={{
            padding: "0.875rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "0.5rem",
          }}
        >
          {sidebarOpen && (
            <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)", whiteSpace: "nowrap" }}>
              Conversation History
            </span>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="btn btn-ghost btn-icon"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
            style={{ marginLeft: "auto", flexShrink: 0 }}
          >
            {sidebarOpen ? <ChevronLeft size={16} /> : <History size={16} />}
          </button>
        </div>

        
        {sidebarOpen && (
          <div style={{ padding: "0.75rem" }}>
            <button
              onClick={startNewChat}
              className="btn btn-primary btn-sm"
              style={{ width: "100%", fontSize: "0.8rem" }}
            >
              <Plus size={14} /> New Chat
            </button>
          </div>
        )}

        
        {sidebarOpen && (
          <div style={{ flex: 1, overflowY: "auto", padding: "0 0.5rem 0.75rem" }}>
            {loadingSessions ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.75rem 0.5rem" }}>
                Loading sessions...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", padding: "0.75rem 0.5rem" }}>
                No previous conversations.
              </div>
            ) : (
              sessions.map((s) => {
                const isActive = s.session_id === activeSessionId;
                const isDeleting = deletingSessionId === s.session_id;
                return (
                  <div
                    key={s.session_id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      borderRadius: "var(--radius-md)",
                      backgroundColor: isActive ? "var(--color-primary-light)" : "transparent",
                      marginBottom: "0.25rem",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <button
                      onClick={() => selectSession(s.session_id)}
                      style={{
                        flex: 1,
                        minWidth: 0,
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        padding: "0.5rem 0.6rem",
                        background: "transparent",
                        border: "none",
                        cursor: "pointer",
                        textAlign: "left",
                        borderRadius: "var(--radius-md)",
                        color: isActive ? "var(--color-primary)" : "var(--text-primary)",
                      }}
                    >
                      <MessageSquare size={13} style={{ flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          style={{
                            fontSize: "0.78rem",
                            fontWeight: isActive ? 700 : 500,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {s.title || `Session ${s.session_id.slice(0, 8)}`}
                        </div>
                        <div style={{ fontSize: "0.65rem", color: "var(--text-muted)" }}>
                          {s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (!isDeleting) await handleDeleteSession(s.session_id);
                      }}
                      disabled={isDeleting}
                      title="Delete session"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: isDeleting ? "wait" : "pointer",
                        color: "var(--color-danger)",
                        opacity: isDeleting ? 0.4 : 0.6,
                        padding: "0.3rem",
                        borderRadius: "var(--radius-sm)",
                        display: "flex",
                        alignItems: "center",
                        flexShrink: 0,
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        
        <div style={{ marginBottom: "0.875rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "38px",
              height: "38px",
              borderRadius: "10px",
              background: "linear-gradient(135deg, var(--color-primary), #818cf8)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <Bot size={21} />
          </div>
          <div>
            <h1 style={{ fontSize: "var(--font-xl)", fontWeight: 800, lineHeight: 1.2 }}>SmartEvent AI Assistant</h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.78rem" }}>
              Query event databases, policies, and system status via AI agent.
            </p>
          </div>
        </div>

        
        <div
          className="card"
          style={{ flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden", borderRadius: "var(--radius-xl)" }}
        >
          
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "1.25rem",
              display: "flex",
              flexDirection: "column",
              gap: "1.1rem",
              backgroundColor: "var(--bg-secondary)",
            }}
          >
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  style={{ display: "flex", gap: "0.75rem", justifyContent: isUser ? "flex-end" : "flex-start" }}
                >
                  {!isUser && (
                    <div
                      style={{
                        width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
                        background: msg.isError ? "#fee2e2" : "linear-gradient(135deg, var(--color-primary), #818cf8)",
                        color: msg.isError ? "var(--color-danger)" : "#fff",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {msg.isError ? <AlertCircle size={18} /> : <Bot size={18} />}
                    </div>
                  )}
                  <div style={{ maxWidth: "78%", display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                    <div
                      style={{
                        padding: "0.8rem 1rem",
                        borderRadius: isUser ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                        backgroundColor: isUser ? "var(--color-primary)" : msg.isError ? "#fee2e2" : "var(--bg-elevated)",
                        color: isUser ? "#fff" : msg.isError ? "var(--color-danger)" : "var(--text-primary)",
                        boxShadow: "var(--shadow-sm)",
                        border: isUser || msg.isError ? "none" : "1px solid var(--border-color)",
                        fontSize: "0.91rem",
                        lineHeight: 1.65,
                      }}
                    >
                      <ChatMessageContent text={msg.content} isUser={isUser} />
                    </div>
                    {msg.latency && (
                      <span style={{ fontSize: "0.68rem", color: "var(--text-muted)", alignSelf: isUser ? "flex-end" : "flex-start", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <Clock size={10} /> {Number(msg.latency).toFixed(2)}s
                      </span>
                    )}
                  </div>
                  {isUser && (
                    <div
                      style={{
                        width: "34px", height: "34px", borderRadius: "50%", flexShrink: 0,
                        background: "var(--bg-tertiary)", color: "var(--text-primary)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      <User size={16} />
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
                <div
                  style={{
                    width: "34px", height: "34px", borderRadius: "10px", flexShrink: 0,
                    background: "linear-gradient(135deg, var(--color-primary), #818cf8)", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  <Bot size={18} />
                </div>
                <div
                  style={{
                    padding: "0.65rem 1rem", borderRadius: "18px 18px 18px 4px",
                    backgroundColor: "var(--bg-elevated)", border: "1px solid var(--border-color)",
                    display: "flex", alignItems: "center", gap: "0.5rem",
                    fontSize: "0.85rem", color: "var(--text-secondary)",
                  }}
                >
                  <LoadingSpinner size="sm" /> Thinking &amp; querying tools...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          
          <form
            onSubmit={handleSend}
            style={{
              padding: "0.875rem 1.1rem",
              borderTop: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-elevated)",
              display: "flex",
              gap: "0.75rem",
            }}
          >
            <input
              type="text"
              placeholder="Ask AI Assistant about events, users, or venue capacities..."
              className="form-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ fontSize: "0.9rem" }}
            />
            <button type="submit" disabled={!input.trim() || loading} className="btn btn-primary" style={{ flexShrink: 0 }}>
              <Send size={17} /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

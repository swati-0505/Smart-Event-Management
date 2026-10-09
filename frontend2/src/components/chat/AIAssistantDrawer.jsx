import React, { useState, useRef, useEffect } from "react";
import {
  Bot,
  X,
  Send,
  User,
  Plus,
  History,
  Sparkles,
  MessageSquare,
  Clock,
  Wrench,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { useAIChat } from "../../context/AIChatContext";
import { useAuth } from "../../auth/AuthProvider";
import { LoadingSpinner } from "../common/LoadingSpinner";
import ChatMessageContent from "./ChatMessageContent";

export default function AIAssistantDrawer() {
  const { isAuthenticated } = useAuth();
  const {
    isOpen,
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
  } = useAIChat();

  const [input, setInput] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, loading, isOpen]);

  if (!isOpen || !isAuthenticated) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput("");
    sendMessage(q);
  };

  const quickPrompts = [
    "📅 Show upcoming events",
    "🏢 List available venues",
    "🎟️ How do I register for an event?",
    "📊 What is venue capacity policy?",
  ];

  return (
    <>
      
      <div
        onClick={closeAIChat}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(15, 23, 42, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 1099,
          animation: "fadeIn 0.2s ease-out",
        }}
      />

      
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(460px, 100vw)",
          height: "100vh",
          backgroundColor: "var(--bg-primary)",
          boxShadow: "-8px 0 25px rgba(0,0,0,0.15)",
          zIndex: 1100,
          display: "flex",
          flexDirection: "column",
          animation: "slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
          borderLeft: "1px solid var(--border-color)",
        }}
      >
        
        <div
          style={{
            padding: "1rem 1.25rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-elevated)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div
              style={{
                width: "38px",
                height: "38px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, var(--color-primary), #818cf8)",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
              }}
            >
              <Bot size={22} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <h3 style={{ fontSize: "1.05rem", fontWeight: 800 }}>SmartEvent AI</h3>
                <span
                  style={{
                    fontSize: "0.65rem",
                    padding: "2px 6px",
                    borderRadius: "4px",
                    background: "var(--color-primary-light)",
                    color: "var(--color-primary)",
                    fontWeight: 700,
                  }}
                >
                  ONLINE
                </span>
              </div>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0 }}>
                Intelligent RAG & Event Operations Assistant
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={() => setShowHistory((prev) => !prev)}
              className="btn btn-ghost btn-icon"
              title="Chat History"
              style={{ color: showHistory ? "var(--color-primary)" : "var(--text-secondary)" }}
            >
              <History size={18} />
            </button>
            <button onClick={startNewChat} className="btn btn-ghost btn-icon" title="New Chat Session">
              <Plus size={18} />
            </button>
            <button onClick={closeAIChat} className="btn btn-ghost btn-icon" title="Close Drawer">
              <X size={20} />
            </button>
          </div>
        </div>

        
        {showHistory && (
          <div
            style={{
              padding: "1rem",
              backgroundColor: "var(--bg-tertiary)",
              borderBottom: "1px solid var(--border-color)",
              maxHeight: "220px",
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: "0.5rem",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.25rem" }}>
              <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                Previous Conversations
              </span>
              <button
                onClick={startNewChat}
                className="btn btn-primary btn-sm"
                style={{ fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                + New Chat
              </button>
            </div>

            {loadingSessions ? (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.5rem" }}>
                Loading session history...
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0.5rem" }}>
                No past conversation sessions.
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
                      backgroundColor: isActive ? "var(--bg-elevated)" : "transparent",
                      boxShadow: isActive ? "var(--shadow-sm)" : "none",
                    }}
                  >
                    <button
                      onClick={() => {
                        selectSession(s.session_id);
                        setShowHistory(false);
                      }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.6rem",
                        padding: "0.5rem 0.75rem",
                        textAlign: "left",
                        border: "none",
                        background: "transparent",
                        color: isActive ? "var(--color-primary)" : "var(--text-primary)",
                        cursor: "pointer",
                        fontSize: "0.825rem",
                        fontWeight: isActive ? 700 : 400,
                        flex: 1,
                        minWidth: 0,
                      }}
                    >
                      <MessageSquare size={14} style={{ flexShrink: 0 }} />
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                        {s.title || `Session ${s.session_id.slice(0, 8)}`}
                      </span>
                      <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", flexShrink: 0 }}>
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : ""}
                      </span>
                    </button>
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (isDeleting) return;
                        setDeletingSessionId(s.session_id);
                        try {
                          await deleteSession(s.session_id);
                        } finally {
                          setDeletingSessionId(null);
                        }
                      }}
                      disabled={isDeleting}
                      title="Delete session"
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: isDeleting ? "wait" : "pointer",
                        color: "var(--color-danger)",
                        padding: "0.35rem",
                        borderRadius: "var(--radius-sm)",
                        flexShrink: 0,
                        opacity: isDeleting ? 0.5 : 0.7,
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        )}

        
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "1.25rem",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            backgroundColor: "var(--bg-secondary)",
          }}
        >
          {messages.map((msg) => {
            const isUser = msg.role === "user";
            return (
              <div
                key={msg.id}
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  justifyContent: isUser ? "flex-end" : "flex-start",
                }}
              >
                {!isUser && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "10px",
                      background: msg.isError
                        ? "#fee2e2"
                        : "linear-gradient(135deg, var(--color-primary), #818cf8)",
                      color: msg.isError ? "var(--color-danger)" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    {msg.isError ? <AlertCircle size={16} /> : <Bot size={16} />}
                  </div>
                )}

                <div style={{ maxWidth: "82%", display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  <div
                    style={{
                      padding: "0.875rem 1.125rem",
                      borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      backgroundColor: isUser
                        ? "var(--color-primary)"
                        : msg.isError
                        ? "#fee2e2"
                        : "var(--bg-elevated)",
                      color: isUser ? "#fff" : msg.isError ? "var(--color-danger)" : "var(--text-primary)",
                      boxShadow: "var(--shadow-sm)",
                      border: isUser || msg.isError ? "none" : "1px solid var(--border-color)",
                      lineHeight: 1.6,
                      fontSize: "0.9rem",
                      wordBreak: "break-word",
                    }}
                  >
                    <ChatMessageContent text={msg.content} isUser={isUser} />
                  </div>

                  
                  {!isUser && msg.latency && (
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.7rem", color: "var(--text-muted)", paddingLeft: "0.25rem" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <Clock size={11} /> {Number(msg.latency).toFixed(2)}s response
                      </span>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div
                    style={{
                      width: "32px",
                      height: "32px",
                      borderRadius: "50%",
                      background: "var(--bg-tertiary)",
                      color: "var(--text-primary)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
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
                  width: "32px",
                  height: "32px",
                  borderRadius: "10px",
                  background: "linear-gradient(135deg, var(--color-primary), #818cf8)",
                  color: "#fff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Bot size={16} />
              </div>
              <div
                style={{
                  padding: "0.65rem 1rem",
                  borderRadius: "16px 16px 16px 4px",
                  backgroundColor: "var(--bg-elevated)",
                  border: "1px solid var(--border-color)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)",
                }}
              >
                <LoadingSpinner size="sm" /> Searching events & knowledge base...
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        
        <div
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "var(--bg-elevated)",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            gap: "0.5rem",
            overflowX: "auto",
            scrollbarWidth: "none",
          }}
        >
          {quickPrompts.map((p, i) => (
            <button
              key={i}
              onClick={() => sendMessage(p.replace(/^[^\s]+\s/, ""))}
              disabled={loading}
              style={{
                fontSize: "0.75rem",
                padding: "0.3rem 0.65rem",
                borderRadius: "20px",
                backgroundColor: "var(--bg-tertiary)",
                border: "1px solid var(--border-color)",
                color: "var(--text-secondary)",
                whiteSpace: "nowrap",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              {p}
            </button>
          ))}
        </div>

        
        <form
          onSubmit={handleFormSubmit}
          style={{
            padding: "1rem 1.25rem",
            backgroundColor: "var(--bg-elevated)",
            borderTop: "1px solid var(--border-color)",
            display: "flex",
            gap: "0.75rem",
          }}
        >
          <input
            type="text"
            placeholder="Ask AI Assistant anything..."
            className="form-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            style={{ fontSize: "0.9rem" }}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="btn btn-primary"
            style={{ padding: "0 1rem", flexShrink: 0 }}
          >
            <Send size={18} />
          </button>
        </form>
      </div>

      <style>{`
        @keyframes slideLeft {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
}

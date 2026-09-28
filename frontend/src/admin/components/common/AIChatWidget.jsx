// AIChatWidget.jsx
// Responsive AI chat widget — floating button bottom-right.
// Mobile: full screen. Tablet/Desktop: floating panel.
// Connected to FastAPI: POST /api/chat (JWT required)

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles } from "lucide-react";

// ---- CONFIG: change these if needed ----
const API_URL = "http://localhost:8000/api/chat";
const TOKEN_KEY = "admin-auth-token"; // key used in localStorage.setItem(...) at login
// ----------------------------------------

const getTime = () =>
  new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

const initialMessages = [
  {
    role: "ai",
    text: "Hi! I'm your SmartEvent AI Assistant. How can I help you today?",
    time: getTime(),
  },
];

const quickPrompts = [
  "Show upcoming events",
  "Registration stats",
  "Generate report",
];

function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  useEffect(() => {
    function handleOpen() {
      setOpen(true);
    }
    window.addEventListener("open-ai-chat", handleOpen);
    return () => window.removeEventListener("open-ai-chat", handleOpen);
  }, []);

  useEffect(() => {
    const isMobile = window.innerWidth < 640;
    if (open && isMobile) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    setMessages((prev) => [...prev, { role: "user", text, time: getTime() }]);
    setInput("");
    setIsTyping(true);

    try {
      const token = localStorage.getItem(TOKEN_KEY);
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, session_id: sessionId }),
      });

      if (res.status === 401) {
        throw new Error("Session expired. Please log in again.");
      }
      if (!res.ok) {
        throw new Error(`Server error (${res.status})`);
      }

      const data = await res.json();
      if (data.session_id) setSessionId(data.session_id);

      setMessages((prev) => [
        ...prev,
        { role: "ai", text: data.reply, time: getTime() },
      ]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            err.message === "Failed to fetch"
              ? "Can't reach the server. Check that the backend is running."
              : err.message || "Something went wrong. Please try again.",
          time: getTime(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <>
      {/* Floating Button — hidden when chat open */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="ai-chat-fab fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white shadow-lg transition hover:scale-110 sm:bottom-6 sm:right-6"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={22} />
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
          </span>
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div
          className={[
            "animate-scale-in fixed z-40 flex flex-col overflow-hidden bg-theme-secondary shadow-2xl",
            "inset-0 h-dvh w-full rounded-none border-0",
            "sm:inset-auto sm:bottom-6 sm:right-6 sm:h-140 sm:max-h-[calc(100vh-3rem)] sm:w-95 sm:rounded-2xl sm:border sm:border-theme",
          ].join(" ")}
        >
          <div className="flex items-center justify-between bg-linear-to-r from-indigo-500 to-purple-600 px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Bot size={18} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-white">AI Assistant</p>
                <p className="flex items-center gap-1.5 text-[10px] text-white/80">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                  Online
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
              aria-label="Close"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600">
                    <Bot size={12} className="text-white" />
                  </div>
                )}

                <div className={`max-w-[85%] sm:max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed sm:text-sm ${
                      msg.role === "user"
                        ? "bg-indigo-600 text-white"
                        : "bg-theme-tertiary text-theme-secondary"
                    }`}
                  >
                    {msg.text}
                  </div>
                  <p className="mt-1 text-[10px] text-theme-dim">{msg.time}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-indigo-500 to-purple-600">
                  <Bot size={12} className="text-white" />
                </div>
                <div className="rounded-2xl bg-theme-tertiary px-4 py-3">
                  <div className="flex gap-1">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-theme-muted" style={{ animationDelay: "0ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-theme-muted" style={{ animationDelay: "150ms" }} />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-theme-muted" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="flex flex-wrap gap-2 border-t border-theme px-4 pt-3">
              {quickPrompts.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInput(p)}
                  className="rounded-lg border border-theme bg-theme-tertiary px-2.5 py-1.5 text-[11px] font-medium text-theme-secondary transition hover:border-indigo-300 hover:text-indigo-600"
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-theme p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="min-w-0 flex-1 bg-transparent text-sm text-theme-primary outline-none placeholder:text-theme-dim"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatWidget;
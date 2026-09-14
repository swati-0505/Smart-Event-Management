// AIChatWidget.jsx
// Floating AI chat widget — small icon at bottom-right, opens on click.

import { useState, useRef, useEffect } from "react";
import { Bot, Send, X, Sparkles, Minimize2 } from "lucide-react";

const initialMessages = [
  {
    role: "ai",
    text: "Hi! I'm your SmartEvent AI Assistant. How can I help you today?",
    time: "10:24 AM",
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
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping]);

  // Send message
  function handleSend(e) {
    e?.preventDefault();
    if (!input.trim()) return;

    const userMsg = {
      role: "user",
      text: input,
      time: new Date().toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response (backend-ready)
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "This is a demo response. Once backend is connected, I'll provide real answers based on your event data.",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsTyping(false);
    }, 1000);
  }

  return (
    <>
      {/* Floating Button (only when closed) */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg transition hover:scale-110"
          aria-label="Open AI Assistant"
        >
          <Sparkles size={22} />

          {/* Pulsing dot */}
          <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75" />
            <span className="relative inline-flex h-3 w-3 rounded-full bg-indigo-500" />
          </span>
        </button>
      )}

      {/* Chat Panel (only when open) */}
      {open && (
        <div className="animate-scale-in fixed bottom-6 right-6 z-40 flex h-[560px] w-[380px] max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-theme bg-theme-secondary shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3.5">
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

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                aria-label="Minimize"
              >
                <Minimize2 size={14} />
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/80 transition hover:bg-white/20 hover:text-white"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "ai" && (
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                    <Bot size={12} className="text-white" />
                  </div>
                )}

                <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
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
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
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

          {/* Quick prompts (only show at start) */}
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

          {/* Input */}
          <div className="border-t border-theme p-3">
            <form
              onSubmit={handleSend}
              className="flex items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="min-w-0 flex-1 bg-transparent text-xs text-theme-primary outline-none placeholder:text-theme-dim"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700 disabled:opacity-50"
              >
                <Send size={14} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default AIChatWidget;
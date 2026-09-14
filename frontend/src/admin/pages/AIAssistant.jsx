// AIAssistant.jsx
// Full-page AI Assistant chat interface.

import { useState } from "react";
import { Sparkles, Send, User, Bot } from "lucide-react";

const initialMessages = [
  {
    role: "ai",
    text: "Hello! I'm your SmartEvent AI Assistant. I can help you with event planning, registration management, reports, and much more. How can I help you today?",
    time: "10:24 AM",
  },
];

const quickPrompts = [
  "Show me upcoming events",
  "How many registrations this month?",
  "Generate a report for last week",
  "Create a new event template",
  "What's the attendance rate?",
];

function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

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

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "This is a simulated response. Once the backend AI agent is connected, I'll provide real answers based on your event data.",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
      setIsTyping(false);
    }, 1200);
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold text-theme-primary">AI Assistant</h1>
            <span className="badge badge-info">New</span>
          </div>
          <p className="mt-1 text-sm text-theme-muted">
            Chat with SmartEvent AI to manage events, registrations, and reports.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2">
          <Sparkles size={14} className="text-indigo-600" />
          <span className="text-xs font-semibold text-indigo-600">
            Powered by SmartEvent AI
          </span>
        </div>
      </div>

      {/* Chat container */}
      <div className="card flex h-[calc(100vh-220px)] flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-theme p-5">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Bot size={20} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-theme-primary">
              SmartEvent Assistant
            </h2>
            <p className="flex items-center gap-1.5 text-xs text-emerald-600">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Online
            </p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 space-y-5 overflow-y-auto p-5">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "ai" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                  <Bot size={16} className="text-white" />
                </div>
              )}

              <div className={`max-w-[75%] ${msg.role === "user" ? "text-right" : ""}`}>
                <div
                  className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-indigo-600 text-white"
                      : "bg-theme-tertiary text-theme-secondary"
                  }`}
                >
                  {msg.text}
                </div>
                <p className="mt-1.5 text-[10px] text-theme-dim">{msg.time}</p>
              </div>

              {msg.role === "user" && (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-sm font-bold text-white shadow-md">
                  Y
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                <Bot size={16} className="text-white" />
              </div>
              <div className="rounded-2xl bg-theme-tertiary px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-theme-muted" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-theme-muted" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-theme-muted" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <div className="border-t border-theme p-4">
          <form onSubmit={handleSend} className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about your events..."
              className="flex-1 rounded-xl border border-theme bg-theme-tertiary px-4 py-3 text-sm text-theme-primary outline-none focus:border-indigo-400"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition hover:bg-indigo-700 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </form>

          {/* Quick prompts */}
          <div className="mt-3 flex flex-wrap gap-2">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-lg border border-theme bg-theme-tertiary px-3 py-1.5 text-[11px] font-medium text-theme-secondary transition hover:border-indigo-300 hover:text-indigo-600"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AIAssistant;
// AIPanel.jsx
// AI Assistant side panel with chat preview.

import { Sparkles, Send, MoreHorizontal } from "lucide-react";
import { useState } from "react";

const messages = [
  { role: "ai", text: "Hello Yugant! 👋 I'm your AI assistant. I can help you with event planning, registration queries, reports, analytics and much more.\n\nHow can I assist you today?", time: "10:24 AM" },
  { role: "user", text: "Create a new event for next month", time: "10:25 AM" },
  { role: "ai", text: "Sure! Here's a step-by-step guide to create a new event:\n\n1. Go to the \"Create Event\" section\n2. Fill in the event details (name, date, time, location, etc.)\n3. Add description and upload any files\n4. Click \"Create\"\n\nWould you like me to fill in a sample event for you, or open the event creation form now?", time: "10:25 AM" },
  { role: "user", text: "Yes, open the event creation form", time: "10:26 AM" },
  { role: "ai", text: "Opening the event creation form for you...", time: "10:25 AM", action: "Go to Create Event →" },
];

const quickChips = ["Event ideas", "Registration stats", "Generate report"];

function AIPanel({ onNavigate }) {
  const [input, setInput] = useState("");

  return (
    <div className="card animate-fade-in-up flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-theme p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-theme-primary">AI Assistant</h2>
            <p className="text-[11px] text-theme-muted">Your smart event management helper</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onNavigate("ai-assistant")}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
        >
          <Sparkles size={12} />
          Ask AI
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-4" style={{ maxHeight: "520px" }}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            {msg.role === "ai" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600">
                <Sparkles size={12} className="text-white" />
              </div>
            )}

            <div className={`max-w-[80%] ${msg.role === "user" ? "text-right" : ""}`}>
              <div
                className={`rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-indigo-600 text-white"
                    : "bg-theme-tertiary text-theme-secondary"
                }`}
                style={{ whiteSpace: "pre-line" }}
              >
                {msg.text}
                {msg.action && (
                  <button
                    type="button"
                    onClick={() => onNavigate("events")}
                    className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
                  >
                    <Sparkles size={12} /> {msg.action}
                  </button>
                )}
              </div>
              <p className="mt-1 text-[10px] text-theme-dim">{msg.time}</p>
            </div>

            {msg.role === "user" && (
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[10px] font-bold text-white">
                Y
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-theme p-4">
        <div className="flex items-center gap-2 rounded-xl border border-theme bg-theme-tertiary px-3 py-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="min-w-0 flex-1 bg-transparent text-xs text-theme-primary outline-none placeholder:text-theme-dim"
          />
          <button
            type="button"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white transition hover:bg-indigo-700"
          >
            <Send size={14} />
          </button>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              className="rounded-lg border border-theme bg-theme-tertiary px-2.5 py-1 text-[11px] font-medium text-theme-secondary transition hover:border-indigo-300 hover:text-indigo-600"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AIPanel;
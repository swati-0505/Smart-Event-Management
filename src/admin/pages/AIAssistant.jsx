// AIAssistant.jsx
// AI-powered assistant page for event management.

import { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

// Mock AI responses
// Later, this will come from backend AI agent
const mockResponses = [
  {
    id: 1,
    role: "assistant",
    content: "Hello! I'm your SmartEvent AI Assistant. I can help you with event management tasks like searching events, checking venue availability, or managing registrations. How can I help you today?",
    timestamp: new Date().toISOString(),
  },
];

function AIAssistant() {
  // State for chat messages
  const [messages, setMessages] = useState(mockResponses);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Handle sending a message
  async function handleSendMessage(event) {
    event.preventDefault();

    if (!input.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: input,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response delay
    // Later, this will call backend AI agent
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        role: "assistant",
        content: "I'm processing your request. This is a simulated response for now. Once the backend AI agent is connected, I'll provide real answers based on your event data.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, aiResponse]);
      setIsTyping(false);
    }, 1500);
  }

  // Format timestamp
  function formatTime(timestamp) {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      {/* Page header */}
      <header className="mb-7 sm:mb-8">
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-[#d7a63a]">
          Intelligence
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-white sm:text-[34px]">
              AI Assistant
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-white/40">
              Chat with the SmartEvent AI assistant to manage events, venues, and registrations.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-md border border-[#d7a63a]/20 bg-[#d7a63a]/[0.05] px-3 py-2">
            <Sparkles size={14} className="text-[#d7a63a]" />
            <span className="text-xs text-[#d7a63a]/80">Powered by SmartEvent AI</span>
          </div>
        </div>
      </header>

      {/* Chat interface */}
      <section className="admin-section flex h-[600px] flex-col overflow-hidden">
        {/* Chat header */}
        <div className="flex items-center gap-3 border-b border-white/[0.07] px-5 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#d7a63a]/15">
            <Bot size={20} className="text-[#d7a63a]" />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-white">SmartEvent Assistant</h2>
            <p className="text-xs text-green-400/80">● Online</p>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7a63a]/15">
                  <Bot size={16} className="text-[#d7a63a]" />
                </div>
              )}

              <div
                className={`max-w-[75%] rounded-lg px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "bg-[#d7a63a]/15 text-white/90"
                    : "bg-white/[0.05] text-white/80"
                }`}
              >
                <p>{message.content}</p>
                <p className="mt-2 text-[10px] text-white/30">
                  {formatTime(message.timestamp)}
                </p>
              </div>

              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10">
                  <User size={16} className="text-white/60" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d7a63a]/15">
                <Bot size={16} className="text-[#d7a63a]" />
              </div>

              <div className="rounded-lg bg-white/[0.05] px-4 py-3 text-sm text-white/50">
                <span className="animate-pulse">Typing...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input area */}
        <form
          onSubmit={handleSendMessage}
          className="border-t border-white/[0.07] p-4"
        >
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about events, venues, registrations..."
              className="flex-1 rounded-md border border-white/[0.08] bg-[#151515] px-4 py-3 text-sm text-white outline-none transition focus:border-[#d7a63a]/40"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#d7a63a] text-[#0b0b0b] transition hover:bg-[#e3b957] disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default AIAssistant;
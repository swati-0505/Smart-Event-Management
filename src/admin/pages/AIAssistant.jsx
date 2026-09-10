// AIAssistant.jsx
// AI-powered assistant page for event management.

import { useState, useRef, useEffect } from "react";
import { Bot, Send, Sparkles, User, Zap } from "lucide-react";

// Mock AI responses
// Later, this will come from backend AI agent
const initialMessages = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hello! I'm your SmartEvent AI Assistant. I can help you with event management tasks like searching events, checking venue availability, or managing registrations. How can I help you today?",
    timestamp: new Date().toISOString(),
  },
];

// Suggested quick prompts
const quickPrompts = [
  "Show me upcoming events",
  "How many registrations this month?",
  "Check venue availability",
  "Create a new event",
];

function AIAssistant() {
  // State for chat messages
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new message arrives
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Handle sending a message
  async function handleSendMessage(event, customMessage = null) {
    if (event) event.preventDefault();

    const messageText = customMessage || input;

    if (!messageText.trim()) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText,
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
        content:
          "I'm processing your request. This is a simulated response for now. Once the backend AI agent is connected, I'll provide real answers based on your event data.",
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
        <p className="text-[9px] font-semibold uppercase tracking-[0.22em] text-theme-accent">
          Intelligence
        </p>

        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-theme-primary sm:text-[34px]">
              AI Assistant
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-theme-muted">
              Chat with the SmartEvent AI assistant to manage events, venues,
              and registrations.
            </p>
          </div>

          <div className="ai-powered-badge">
            <Sparkles size={14} className="ai-badge-icon" />
            <span>Powered by SmartEvent AI</span>
            <div className="ai-badge-dot"></div>
          </div>
        </div>
      </header>

      {/* Chat interface */}
      <section className="ai-chat-container">
        {/* Chat header */}
        <div className="ai-chat-header">
          <div className="ai-chat-header-left">
            <div className="ai-avatar">
              <Bot size={20} />
              <div className="ai-avatar-ring"></div>
            </div>

            <div>
              <h2 className="ai-chat-title">SmartEvent Assistant</h2>
              <div className="ai-chat-status">
                <span className="ai-status-dot"></span>
                <span>Online</span>
              </div>
            </div>
          </div>

          <div className="ai-chat-header-right">
            <Zap size={14} className="text-theme-accent" />
            <span className="text-xs text-theme-muted">Fast responses</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="ai-messages-area">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`ai-message-row ${
                message.role === "user" ? "ai-message-user" : "ai-message-bot"
              }`}
            >
              {message.role === "assistant" && (
                <div className="ai-message-avatar ai-message-avatar-bot">
                  <Bot size={16} />
                </div>
              )}

              <div
                className={`ai-message-bubble ${
                  message.role === "user"
                    ? "ai-bubble-user"
                    : "ai-bubble-bot"
                }`}
              >
                <p className="ai-message-text">{message.content}</p>
                <span className="ai-message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>

              {message.role === "user" && (
                <div className="ai-message-avatar ai-message-avatar-user">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="ai-message-row ai-message-bot">
              <div className="ai-message-avatar ai-message-avatar-bot">
                <Bot size={16} />
              </div>

              <div className="ai-message-bubble ai-bubble-bot ai-typing-bubble">
                <div className="ai-typing-dots">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick prompts (only when few messages) */}
        {messages.length <= 1 && (
          <div className="ai-quick-prompts">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(null, prompt)}
                className="ai-quick-prompt"
              >
                <Sparkles size={12} />
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <form onSubmit={handleSendMessage} className="ai-input-area">
          <div className="ai-input-wrapper">
            <input
              type="text"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Ask about events, venues, registrations..."
              className="ai-input"
            />

            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="ai-send-btn"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>

          <p className="ai-input-hint">
            Press Enter to send · AI can make mistakes
          </p>
        </form>
      </section>
    </div>
  );
}

export default AIAssistant;
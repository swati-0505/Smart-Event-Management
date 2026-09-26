// AIAssistant.jsx
// AI Assistant — full page chat, messages from bottom.

import { useState, useRef, useEffect } from "react";
import {
  Send,
  Bot,
  User,
  Sparkles,
  Paperclip,
  Lightbulb,
  ImageIcon,
  Microscope,
  Mic,
  MicOff,
  X,
} from "lucide-react";
import { sendAIMessage, getQuickPrompts } from "../services/aiService";
import PageWrapper from "../components/common/PageWrapper";
import RobotMascot from "../components/common/RobotMascot";
import { toast } from "sonner";
import "../components/common/AIAssistantPage.css";

const initialMessages = [];

const defaultChips = [
  { label: "Events" },
  { label: "Attendees" },
  { label: "Reports" },
  { label: "Analytics" },
  { label: "Venues" },
  { label: "Tickets" },
];

function AIAssistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [quickPrompts, setQuickPrompts] = useState(defaultChips);

  const [activeTools, setActiveTools] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  const firstName =
    (localStorage.getItem("admin-name") || "Admin").split(" ")[0];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    getQuickPrompts()
      .then((p) => {
        if (Array.isArray(p) && p.length) {
          setQuickPrompts(p.slice(0, 6).map((label) => ({ label })));
        }
      })
      .catch(() => {});
  }, []);

  function toggleTool(tool) {
    setActiveTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  }

  function handleAttachClick() {
    fileInputRef.current?.click();
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setAttachedFile(file.name);
      toast.success(`Attached: ${file.name}`);
    }
    e.target.value = "";
  }

  function removeFile() {
    setAttachedFile(null);
  }

  function toggleMic() {
    setIsListening((prev) => {
      const next = !prev;
      if (next) {
        toast.info("Listening... Speak now");
        setTimeout(() => {
          setIsListening(false);
          toast.success("Voice captured");
        }, 3000);
      }
      return next;
    });
  }

  async function handleSend(e) {
    e?.preventDefault();
    const text = input.trim();
    if (!text || isTyping) return;

    const now = new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });

    setMessages((prev) => [...prev, { role: "user", text, time: now }]);
    setInput("");
    setAttachedFile(null);
    setActiveTools([]);
    setIsTyping(true);

    try {
      const res = await sendAIMessage(text, conversationId);
      if (res?.session_id) setConversationId(res.session_id);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res?.reply || "I couldn't process that. Please try again.",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "Sorry, something went wrong. Please try again.",
          time: new Date().toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    } finally {
      setIsTyping(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  function pickPrompt(p) {
    setInput(p);
    inputRef.current?.focus();
  }

  const showWelcome = messages.length === 0;

  return (
    <PageWrapper>
      <div className="ai-page-bg">
        <div className="ai-shell">
          <div className="ai-main">
            {/* ============ Body ============ */}
            {showWelcome ? (
              <div className="ai-welcome">
                <h1>
                  <span className="ai-hi">Hi {firstName},</span> Ready to
                  achieve great things?
                </h1>

                <div className="ai-mascot-wrap">
                  <div className="ai-bubble left">
                    <span className="ai-bubble-icon">
                      <Bot size={11} />
                    </span>
                    Hey! Need a boost?
                  </div>

                  <RobotMascot size={200} />

                  <div className="ai-bubble right">
                    <span className="ai-bubble-icon">
                      <Bot size={11} />
                    </span>
                    Hey there! Need a boost?
                  </div>
                </div>

                {/* Welcome chips */}
                <div className="ai-welcome-chips">
                  {quickPrompts.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      className="ai-welcome-chip"
                      onClick={() => pickPrompt(c.label)}
                    >
                      <Sparkles size={12} />
                      {c.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="ai-messages">
                <div className="ai-date-sep">
                  <span>Today</span>
                </div>

                {messages.map((msg, idx) => (
                  <MessageBubble key={idx} msg={msg} />
                ))}
                {isTyping && <TypingIndicator />}
                <div ref={messagesEndRef} />
              </div>
            )}

            {/* ============ Input area ============ */}
            <div className="ai-input-area">
              <div className="ai-input-card">
                {attachedFile && (
                  <div className="ai-attached-file">
                    <Paperclip size={11} />
                    <span>{attachedFile}</span>
                    <button
                      type="button"
                      onClick={removeFile}
                      className="ai-attached-remove"
                      aria-label="Remove file"
                    >
                      <X size={11} />
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend}>
                  <div className="ai-input-inner">
                    <textarea
                      id="ai-input"
                      name="ai-input"
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      placeholder="Initiate a query or send a command to the AI..."
                      rows={1}
                    />
                  </div>

                  <div className="ai-action-row">
                    <input
                      ref={fileInputRef}
                      type="file"
                      onChange={handleFileChange}
                      style={{ display: "none" }}
                      aria-hidden="true"
                    />

                    <button
                      type="button"
                      className={`ai-action-btn ${
                        activeTools.includes("attach") ? "active" : ""
                      }`}
                      onClick={handleAttachClick}
                    >
                      <Paperclip size={13} />
                      <span>Attach File</span>
                    </button>

                    <button
                      type="button"
                      className={`ai-action-btn ${
                        activeTools.includes("reasoning") ? "active" : ""
                      }`}
                      onClick={() => toggleTool("reasoning")}
                    >
                      <Lightbulb size={13} />
                      <span>Reasoning</span>
                    </button>

                    <button
                      type="button"
                      className={`ai-action-btn ${
                        activeTools.includes("image") ? "active" : ""
                      }`}
                      onClick={() => {
                        toggleTool("image");
                        toast.info("Image generation mode");
                      }}
                    >
                      <ImageIcon size={13} />
                      <span>Create Image</span>
                    </button>

                    <button
                      type="button"
                      className={`ai-action-btn ${
                        activeTools.includes("research") ? "active" : ""
                      }`}
                      onClick={() => {
                        toggleTool("research");
                        toast.info("Deep research mode");
                      }}
                    >
                      <Microscope size={13} />
                      <span>Deep Research</span>
                    </button>

                    <div className="ai-action-spacer" />

                    <button
                      type="button"
                      className={`ai-mic-btn ${
                        isListening ? "listening" : ""
                      }`}
                      onClick={toggleMic}
                      aria-label="Voice input"
                    >
                      {isListening ? <MicOff size={16} /> : <Mic size={16} />}
                    </button>

                    <button
                      type="submit"
                      className="ai-send-fab"
                      disabled={!input.trim() || isTyping}
                      aria-label="Send"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </form>
              </div>

              {/* Chips — only in welcome state */}
              {showWelcome && (
                <div className="ai-chips-hidden" aria-hidden="true" />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}

/* ============================================================
   Message Bubble
   ============================================================ */
function MessageBubble({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      <div
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
          isUser ? "bg-slate-700 text-white" : "bg-indigo-600 text-white"
        }`}
      >
        {isUser ? <User size={14} /> : <Bot size={14} />}
      </div>

      <div
        className={`flex max-w-[75%] flex-col ${
          isUser ? "items-end" : "items-start"
        }`}
      >
        <div
          className={`rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
            isUser
              ? "rounded-tr-sm bg-indigo-600 text-white"
              : "rounded-tl-sm border border-theme bg-theme-secondary text-theme-primary"
          }`}
        >
          {msg.text}
        </div>
        <p className="mt-1 text-[10px] text-theme-dim">{msg.time}</p>
      </div>
    </div>
  );
}

/* ============================================================
   Typing Indicator
   ============================================================ */
function TypingIndicator() {
  return (
    <div className="flex gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white">
        <Bot size={14} />
      </div>
      <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border border-theme bg-theme-secondary px-4 py-3">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-theme-muted" />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-theme-muted"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="h-1.5 w-1.5 animate-bounce rounded-full bg-theme-muted"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}

export default AIAssistant;
import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Badge from "../common/Badge";
import { CheckCircle2, Clock, XCircle, AlertTriangle, Check, Copy } from "lucide-react";


function cleanAIMessageContent(content) {
  if (typeof content !== "string") return "";
  let text = content.trim();

  
  if ((text.startsWith("{") && text.endsWith("}")) || (text.startsWith("[") && text.endsWith("]"))) {
    try {
      const parsed = JSON.parse(text);
      if (parsed.reply) return cleanAIMessageContent(parsed.reply);
      if (parsed.message) return cleanAIMessageContent(parsed.message);
      if (parsed.answer) return cleanAIMessageContent(parsed.answer);

      
      if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object") {
        const keys = Object.keys(parsed[0]).filter(k => !k.includes("id") && !k.startsWith("_"));
        if (keys.length > 0) {
          const headerRow = `| ${keys.map(k => k.replace(/_/g, " ").toUpperCase()).join(" | ")} |`;
          const separatorRow = `| ${keys.map(() => "---").join(" | ")} |`;
          const rows = parsed.map(row => `| ${keys.map(k => row[k] ?? "-").join(" | ")} |`);
          return [headerRow, separatorRow, ...rows].join("\n");
        }
      }
    } catch (e) {}
  }

  
  text = text.replace(/(?:tool_calls|tools_used|internal_debug):\s*\[.*?\]/gi, "");
  text = text.replace(/Executed tool \w+\(.*?\):?/gi, "");
  text = text.replace(/```json\s*\{[\s\S]*?"tool":[\s\S]*?\}\s*```/gi, "");

  return text.trim();
}


function getStatusVariant(val) {
  if (typeof val !== "string") return null;
  const s = val.trim().toUpperCase();

  if (["PUBLISHED", "CONFIRMED", "ACTIVE", "SUCCESS", "APPROVED", "AVAILABLE", "COMPLETED", "UPCOMING"].includes(s)) {
    return "success";
  }
  if (["PENDING", "DRAFT", "SCHEDULED", "REVIEW", "WAITLIST"].includes(s)) {
    return "warning";
  }
  if (["CANCELLED", "CANCELED", "FULL", "FAILED", "DENIED", "UNAVAILABLE", "EXPIRED", "CLOSED"].includes(s)) {
    return "danger";
  }
  return null;
}


function formatDateTimeText(str) {
  if (typeof str !== "string") return str;
  const trimmed = str.trim();

  
  const isoDateTimeRegex = /^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?/;
  const matchDateTime = trimmed.match(isoDateTimeRegex);
  if (matchDateTime) {
    const [_, year, month, day, hour, min] = matchDateTime;
    const date = new Date(year, month - 1, day, hour, min);
    if (!isNaN(date.getTime())) {
      const dateStr = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const timeStr = date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });
      return `${dateStr} | ${timeStr}`;
    }
  }

  
  const isoDateRegex = /^(\d{4})-(\d{2})-(\d{2})$/;
  const matchDate = trimmed.match(isoDateRegex);
  if (matchDate) {
    const [_, year, month, day] = matchDate;
    const date = new Date(year, month - 1, day);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
    }
  }

  return str;
}


function CellContent({ children }) {
  if (!children) return null;

  
  const textContent = Array.isArray(children)
    ? children.map(c => (typeof c === "string" ? c : c?.props?.children || "")).join("")
    : typeof children === "string"
    ? children
    : String(children?.props?.children || children);

  const trimmed = textContent.trim();
  const badgeVariant = getStatusVariant(trimmed);

  if (badgeVariant) {
    let icon = null;
    if (badgeVariant === "success") icon = <CheckCircle2 size={12} />;
    if (badgeVariant === "warning") icon = <Clock size={12} />;
    if (badgeVariant === "danger") icon = <XCircle size={12} />;

    return (
      <Badge variant={badgeVariant} style={{ textTransform: "capitalize", fontWeight: 700 }}>
        {icon} {trimmed}
      </Badge>
    );
  }

  const formattedDate = formatDateTimeText(trimmed);
  return <>{formattedDate}</>;
}


function CodeBlock({ children, className }) {
  const [copied, setCopied] = React.useState(false);
  const codeText = String(children).replace(/\n$/, "");
  const match = /language-(\w+)/.exec(className || "");
  const lang = match ? match[1] : "";

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      style={{
        position: "relative",
        margin: "0.75rem 0",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
        border: "1px solid var(--border-color-strong)",
        backgroundColor: "#0f172a",
        color: "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "0.4rem 0.875rem",
          backgroundColor: "#1e293b",
          borderBottom: "1px solid #334155",
          fontSize: "0.75rem",
          color: "#94a3b8",
          fontWeight: 600,
        }}
      >
        <span>{lang ? lang.toUpperCase() : "CODE"}</span>
        <button
          onClick={handleCopy}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.3rem",
            color: copied ? "#34d399" : "#94a3b8",
            fontSize: "0.75rem",
            background: "transparent",
            border: "none",
            cursor: "pointer",
          }}
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre style={{ padding: "0.875rem 1rem", margin: 0, overflowX: "auto", fontSize: "0.85rem", lineHeight: 1.55, fontFamily: "monospace" }}>
        <code>{codeText}</code>
      </pre>
    </div>
  );
}


export default function ChatMessageContent({ text, isUser = false }) {
  const cleanedText = React.useMemo(() => cleanAIMessageContent(text), [text]);

  if (isUser) {
    return <div style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{text}</div>;
  }

  return (
    <div className="chat-markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          
          h1: ({ children }) => (
            <h1
              style={{
                fontSize: "1.15rem",
                fontWeight: 800,
                margin: "0.75rem 0 0.5rem",
                color: "var(--text-primary)",
                borderBottom: "2px solid var(--color-primary-light)",
                paddingBottom: "0.25rem",
              }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              style={{
                fontSize: "1.05rem",
                fontWeight: 700,
                margin: "0.65rem 0 0.4rem",
                color: "var(--text-primary)",
              }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                margin: "0.5rem 0 0.3rem",
                color: "var(--text-primary)",
              }}
            >
              {children}
            </h3>
          ),

          
          p: ({ children }) => (
            <p style={{ margin: "0 0 0.65rem 0", lineHeight: 1.6, fontSize: "0.9rem" }}>
              {children}
            </p>
          ),

          
          ul: ({ children }) => (
            <ul
              style={{
                margin: "0.4rem 0 0.75rem 1.25rem",
                padding: 0,
                listStyleType: "disc",
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
              }}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              style={{
                margin: "0.4rem 0 0.75rem 1.25rem",
                padding: 0,
                listStyleType: "decimal",
                display: "flex",
                flexDirection: "column",
                gap: "0.3rem",
              }}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li style={{ fontSize: "0.9rem", lineHeight: 1.55 }}>{children}</li>
          ),

          
          table: ({ children }) => (
            <div
              style={{
                margin: "0.75rem 0",
                overflowX: "auto",
                borderRadius: "var(--radius-lg)",
                border: "1px solid var(--border-color)",
                boxShadow: "var(--shadow-sm)",
                backgroundColor: "var(--bg-elevated)",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  textAlign: "left",
                  fontSize: "0.85rem",
                }}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead
              style={{
                backgroundColor: "var(--bg-tertiary)",
                borderBottom: "2px solid var(--border-color)",
              }}
            >
              {children}
            </thead>
          ),
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => (
            <tr
              style={{
                borderBottom: "1px solid var(--border-color)",
                transition: "background-color 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "var(--bg-tertiary)")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "transparent")}
            >
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th
              style={{
                padding: "0.55rem 0.75rem",
                fontWeight: 700,
                color: "var(--text-secondary)",
                fontSize: "0.75rem",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                whiteSpace: "normal",
              }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              style={{
                padding: "0.55rem 0.75rem",
                color: "var(--text-primary)",
                verticalAlign: "middle",
                lineHeight: 1.4,
                whiteSpace: "normal",
                overflowWrap: "anywhere",
              }}
            >
              <CellContent>{children}</CellContent>
            </td>
          ),

          
          code: ({ node, inline, className, children, ...props }) => {
            if (inline || (!className && !String(children).includes("\n"))) {
              return (
                <code
                  style={{
                    backgroundColor: "var(--bg-tertiary)",
                    color: "var(--color-primary)",
                    padding: "0.15rem 0.4rem",
                    borderRadius: "var(--radius-sm)",
                    fontSize: "0.825rem",
                    fontFamily: "monospace",
                    border: "1px solid var(--border-color)",
                  }}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return <CodeBlock className={className}>{children}</CodeBlock>;
          },

          
          blockquote: ({ children }) => (
            <blockquote
              style={{
                margin: "0.5rem 0",
                padding: "0.5rem 0.875rem",
                borderLeft: "3px solid var(--color-primary)",
                backgroundColor: "var(--color-primary-light)",
                borderRadius: "0 var(--radius-md) var(--radius-md) 0",
                color: "var(--text-secondary)",
                fontSize: "0.875rem",
                fontStyle: "italic",
              }}
            >
              {children}
            </blockquote>
          ),
        }}
      >
        {cleanedText}
      </ReactMarkdown>
    </div>
  );
}

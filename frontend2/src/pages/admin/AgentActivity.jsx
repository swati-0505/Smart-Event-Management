import React, { useEffect, useState } from "react";
import {
  Activity,
  RefreshCw,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  ChevronRight,
  X,
  Wrench,
  Zap,
  AlertTriangle,
} from "lucide-react";
import { getAgentActivity, getAgentRunDetail } from "../../services/adminService";
import PageLoader from "../../components/common/PageLoader";
import ErrorState from "../../components/common/ErrorState";
import EmptyState from "../../components/common/EmptyState";


function StatusBadge({ status }) {
  const s = (status || "").toLowerCase();
  const isSuccess = s === "success";
  const isRunning = s === "running";

  const cfg = isSuccess
    ? { bg: "#dcfce7", color: "#166534", icon: <CheckCircle2 size={13} /> }
    : isRunning
    ? { bg: "#dbeafe", color: "#1e40af", icon: <Zap size={13} /> }
    : { bg: "#fee2e2", color: "#991b1b", icon: <XCircle size={13} /> };

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.3rem",
        padding: "0.25rem 0.65rem",
        borderRadius: "999px",
        backgroundColor: cfg.bg,
        color: cfg.color,
        fontSize: "0.75rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {cfg.icon}
      {(status || "unknown").toUpperCase()}
    </span>
  );
}

function formatDuration(ms) {
  if (ms == null) return "—";
  if (ms < 1000) return `${Math.round(ms)}ms`;
  return `${(ms / 1000).toFixed(2)}s`;
}

function formatDate(dt) {
  if (!dt) return "—";
  const d = new Date(dt);
  return d.toLocaleString();
}


function RunDetailModal({ runId, onClose }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    getAgentRunDetail(runId)
      .then((d) => setDetail(d))
      .catch((e) => setError(e.message || "Failed to load run detail."))
      .finally(() => setLoading(false));
  }, [runId]);

  return (
    <>
      
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 1100,
          backgroundColor: "rgba(15,23,42,0.5)",
          backdropFilter: "blur(4px)",
        }}
      />

      
      <div
        style={{
          position: "fixed",
          top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 1101,
          width: "min(780px, 96vw)",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "var(--bg-primary)",
          borderRadius: "var(--radius-2xl)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.3)",
          border: "1px solid var(--border-color)",
          overflow: "hidden",
        }}
      >
        
        <div
          style={{
            padding: "1.1rem 1.5rem",
            borderBottom: "1px solid var(--border-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            backgroundColor: "var(--bg-elevated)",
            flexShrink: 0,
          }}
        >
          <div>
            <h2 style={{ fontSize: "1.05rem", fontWeight: 800, margin: 0 }}>Agent Run Detail</h2>
            <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", margin: 0, marginTop: "0.15rem" }}>
              Run ID: {runId}
            </p>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-icon">
            <X size={20} />
          </button>
        </div>

        
        <div style={{ flex: 1, overflowY: "auto", padding: "1.5rem" }}>
          {loading ? (
            <div style={{ display: "flex", justifyContent: "center", padding: "3rem" }}>
              <RefreshCw size={28} className="spin" style={{ color: "var(--color-primary)", animation: "spin 1s linear infinite" }} />
            </div>
          ) : error ? (
            <div style={{ padding: "1rem", background: "#fee2e2", color: "var(--color-danger)", borderRadius: "var(--radius-md)", fontSize: "0.875rem" }}>
              {error}
            </div>
          ) : detail ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "1rem" }}>
                {[
                  { label: "Status", value: <StatusBadge status={detail.status} /> },
                  { label: "User", value: detail.user_email || "Guest User" },
                  { label: "Intent", value: detail.detected_intent || "—" },
                  { label: "Duration", value: formatDuration(detail.latency_ms) },
                  { label: "Tool Calls", value: detail.tool_loop_count ?? "—" },
                  { label: "Timestamp", value: formatDate(detail.created_at) },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    style={{
                      padding: "0.875rem 1rem",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.35rem" }}>
                      {label}
                    </div>
                    <div style={{ fontSize: "0.875rem", color: "var(--text-primary)", fontWeight: 600 }}>
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              
              <div>
                <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>User Query</h4>
                <div
                  style={{
                    padding: "0.875rem 1rem",
                    backgroundColor: "var(--bg-secondary)",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid var(--border-color)",
                    fontSize: "0.895rem",
                    color: "var(--text-primary)",
                    lineHeight: 1.6,
                  }}
                >
                  {detail.user_request || "—"}
                </div>
              </div>

              
              {detail.final_response && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>AI Response</h4>
                  <div
                    style={{
                      padding: "0.875rem 1rem",
                      backgroundColor: "var(--bg-secondary)",
                      borderRadius: "var(--radius-lg)",
                      border: "1px solid var(--border-color)",
                      fontSize: "0.875rem",
                      color: "var(--text-primary)",
                      lineHeight: 1.65,
                      whiteSpace: "pre-wrap",
                      maxHeight: "200px",
                      overflowY: "auto",
                    }}
                  >
                    {detail.final_response}
                  </div>
                </div>
              )}

              
              {detail.error && (
                <div
                  style={{
                    padding: "0.875rem 1rem",
                    backgroundColor: "#fee2e2",
                    borderRadius: "var(--radius-lg)",
                    border: "1px solid #fca5a5",
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "flex-start",
                  }}
                >
                  <AlertTriangle size={18} style={{ color: "var(--color-danger)", flexShrink: 0, marginTop: "0.1rem" }} />
                  <div>
                    <div style={{ fontSize: "0.8rem", fontWeight: 700, color: "var(--color-danger)", marginBottom: "0.25rem" }}>Error</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--color-danger)" }}>{detail.error}</div>
                  </div>
                </div>
              )}

              
              {detail.tool_calls && detail.tool_calls.length > 0 && (
                <div>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)", marginBottom: "0.5rem" }}>
                    Tools Used ({detail.tool_calls.length})
                  </h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {detail.tool_calls.map((tc, i) => (
                      <div
                        key={tc.tool_call_id || i}
                        style={{
                          padding: "0.875rem 1rem",
                          backgroundColor: "var(--bg-secondary)",
                          borderRadius: "var(--radius-lg)",
                          border: "1px solid var(--border-color)",
                        }}
                      >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                            <Wrench size={14} style={{ color: "var(--color-primary)" }} />
                            <span style={{ fontSize: "0.8rem", fontWeight: 700, fontFamily: "monospace", color: "var(--text-primary)" }}>
                              {tc.tool_name}
                            </span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                            <StatusBadge status={tc.status} />
                            <span style={{ fontSize: "0.7rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                              <Clock size={11} /> {formatDuration(tc.latency_ms)}
                            </span>
                          </div>
                        </div>
                        {tc.tool_input && (
                          <details style={{ marginBottom: "0.35rem" }}>
                            <summary style={{ fontSize: "0.75rem", color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>Input</summary>
                            <pre
                              style={{
                                fontSize: "0.72rem",
                                fontFamily: "monospace",
                                backgroundColor: "var(--bg-tertiary)",
                                padding: "0.5rem",
                                borderRadius: "var(--radius-md)",
                                overflow: "auto",
                                color: "var(--text-secondary)",
                                maxHeight: "120px",
                                marginTop: "0.35rem",
                              }}
                            >
                              {JSON.stringify(tc.tool_input, null, 2)}
                            </pre>
                          </details>
                        )}
                        {tc.tool_output && (
                          <details>
                            <summary style={{ fontSize: "0.75rem", color: "var(--text-muted)", cursor: "pointer", fontWeight: 600 }}>Output</summary>
                            <pre
                              style={{
                                fontSize: "0.72rem",
                                fontFamily: "monospace",
                                backgroundColor: "var(--bg-tertiary)",
                                padding: "0.5rem",
                                borderRadius: "var(--radius-md)",
                                overflow: "auto",
                                color: "var(--text-secondary)",
                                maxHeight: "160px",
                                marginTop: "0.35rem",
                                whiteSpace: "pre-wrap",
                                wordBreak: "break-all",
                              }}
                            >
                              {tc.tool_output}
                            </pre>
                          </details>
                        )}
                        {tc.error && (
                          <div style={{ fontSize: "0.75rem", color: "var(--color-danger)", marginTop: "0.35rem" }}>
                            Error: {tc.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}


export default function AgentActivity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRunId, setSelectedRunId] = useState(null);

  const loadActivities = () => {
    setLoading(true);
    setError("");
    getAgentActivity(100)
      .then((data) => setActivities(Array.isArray(data) ? data : []))
      .catch((err) => setError(err.message || "Failed to fetch agent activity logs."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadActivities();
  }, []);

  if (loading) return <PageLoader message="Loading agent execution logs..." />;
  if (error) return <ErrorState message={error} onRetry={loadActivities} />;

  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 style={{ fontSize: "var(--font-3xl)", fontWeight: 800, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <Activity style={{ color: "var(--color-primary)" }} /> AI Agent Activity
            </h1>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
              Inspect agent runs, tool invocations, latency, and error logs.
            </p>
          </div>
          <button onClick={loadActivities} className="btn btn-secondary btn-sm">
            <RefreshCw size={15} /> Refresh
          </button>
        </div>

        
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(170px, 1fr))", gap: "1rem" }}>
          {[
            { label: "Total Runs", value: activities.length, color: "var(--color-primary)" },
            { label: "Successful", value: activities.filter((a) => (a.status || "").toLowerCase() === "success").length, color: "#16a34a" },
            { label: "Failed", value: activities.filter((a) => (a.status || "").toLowerCase() === "failed").length, color: "var(--color-danger)" },
            {
              label: "Avg Duration",
              value: activities.length
                ? formatDuration(activities.reduce((s, a) => s + (a.latency_ms || 0), 0) / activities.length)
                : "—",
              color: "#d97706",
            },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="card"
              style={{ padding: "1.1rem 1.25rem", borderLeft: `4px solid ${color}` }}
            >
              <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {label}
              </div>
              <div style={{ fontSize: "1.6rem", fontWeight: 900, color: color, marginTop: "0.25rem" }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        
        {activities.length === 0 ? (
          <EmptyState
            icon={Activity}
            title="No recent agent activity"
            description="Agent activity logs will appear here when users interact with the AI assistant."
          />
        ) : (
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.875rem" }}>
                <thead>
                  <tr
                    style={{
                      backgroundColor: "var(--bg-tertiary)",
                      borderBottom: "2px solid var(--border-color)",
                      color: "var(--text-secondary)",
                    }}
                  >
                    {["Run ID", "User", "Query", "Intent", "Status", "Duration", "Timestamp", ""].map((h) => (
                      <th key={h} style={{ padding: "0.875rem 1rem", fontWeight: 700, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {activities.map((act, idx) => (
                    <tr
                      key={act.run_id || idx}
                      style={{
                        borderBottom: "1px solid var(--border-color)",
                        cursor: "pointer",
                        transition: "background 0.12s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-secondary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                      onClick={() => setSelectedRunId(act.run_id)}
                    >
                      <td style={{ padding: "0.875rem 1rem", fontFamily: "monospace", fontSize: "0.75rem", color: "var(--text-muted)" }}>
                        {String(act.run_id || "").slice(0, 8)}...
                      </td>
                      <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                          <User size={14} style={{ color: "var(--text-muted)", flexShrink: 0 }} />
                          <span style={{ color: "var(--text-primary)", fontSize: "0.835rem", fontWeight: 500 }}>
                            {act.user_email || "Guest User"}
                          </span>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "0.875rem 1rem",
                          color: "var(--text-primary)",
                          maxWidth: "220px",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                        title={act.user_request}
                      >
                        {act.user_request}
                      </td>
                      <td style={{ padding: "0.875rem 1rem", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                        {act.detected_intent || "—"}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <StatusBadge status={act.status} />
                      </td>
                      <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap", color: "var(--text-secondary)", fontSize: "0.8rem" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                          <Clock size={12} /> {formatDuration(act.latency_ms)}
                        </span>
                      </td>
                      <td style={{ padding: "0.875rem 1rem", whiteSpace: "nowrap", color: "var(--text-muted)", fontSize: "0.78rem" }}>
                        {formatDate(act.created_at)}
                      </td>
                      <td style={{ padding: "0.875rem 1rem" }}>
                        <button
                          className="btn btn-ghost btn-icon"
                          onClick={(e) => { e.stopPropagation(); setSelectedRunId(act.run_id); }}
                          title="View run details"
                          style={{ color: "var(--color-primary)" }}
                        >
                          <ChevronRight size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      
      {selectedRunId && (
        <RunDetailModal runId={selectedRunId} onClose={() => setSelectedRunId(null)} />
      )}
    </>
  );
}

"use client";

export default function OutboundPanel() {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  return (
    <div
      style={{
        background: "var(--panel)",
        border: "1px solid var(--line)",
        borderRadius: "10px",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "14px 16px 12px",
          borderBottom: "1px solid var(--line)",
        }}
      >
        <span style={{ fontSize: "13px" }}>↗</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--tx)", flex: 1 }}>
          Outbound
        </span>
        <span style={{ fontSize: "10px", color: "var(--tx-3)" }}>daily check-in</span>
      </div>

      {/* Card */}
      <div style={{ padding: "14px 16px" }}>
        <div
          style={{
            padding: "12px 14px",
            borderRadius: "8px",
            background: "var(--panel-2)",
            border: "1px solid var(--line)",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              color: "var(--tx-3)",
              letterSpacing: "0.04em",
              marginBottom: "6px",
              fontFamily: '"Geist Mono", ui-monospace',
            }}
          >
            Daily · {today}
          </div>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 500,
              color: "var(--tx)",
              marginBottom: "4px",
              lineHeight: 1.35,
            }}
          >
            Check HeyReach — respond to open messages
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "var(--tx-3)",
              lineHeight: 1.5,
              marginBottom: "12px",
            }}
          >
            Follow-ups go stale fast. Clear the inbox before deep work.
          </div>
          <a
            href="https://app.heyreach.io"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              fontSize: "11px",
              color: "var(--accent-bright)",
              textDecoration: "none",
              fontWeight: 500,
              transition: "opacity 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
          >
            ↗ Open HeyReach
          </a>
        </div>
      </div>
    </div>
  );
}

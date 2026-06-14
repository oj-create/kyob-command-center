"use client";

const WORKSPACE = "C:/Users/ADMIN/Downloads/Everything Quely";

type ToolFile = { name: string; path: string };

type Tool = {
  name: string;
  description: string;
  inputs: string;
  claudeSkillPath: string;
  category: string;
  lastRun: string | null;
  files?: ToolFile[];
  connectors?: string[];
};

type Props = {
  tool: Tool | null;
  onClose: () => void;
  onLaunch: (tool: Tool) => void;
};

function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}

function toVSCodeLink(relativePath: string): string {
  const full = `${WORKSPACE}/${relativePath}`;
  return "vscode://file/" + full.replace(/ /g, "%20");
}

function fileIcon(name: string): string {
  if (name === "SKILL.md") return "◆";
  if (name === "CONNECTORS.md") return "⬡";
  if (name.endsWith(".md")) return "◇";
  return "·";
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontSize: "9px",
        color: "var(--tx-3)",
        letterSpacing: "0.07em",
        textTransform: "uppercase",
        marginBottom: "8px",
      }}
    >
      {children}
    </div>
  );
}

export default function ToolDrawer({ tool, onClose, onLaunch }: Props) {
  if (!tool) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Tool: ${tool.name}`}
    >
      {/* Drawer panel */}
      <div
        style={{
          width: "400px",
          height: "100%",
          background: "var(--panel-2)",
          borderLeft: "1px solid var(--line-2)",
          display: "flex",
          flexDirection: "column",
          boxShadow: "-16px 0 48px rgba(0,0,0,0.4)",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: "18px 18px 16px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <div style={{ flex: 1 }}>
            <div
              style={{
                fontSize: "9px",
                color: "var(--tx-3)",
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                marginBottom: "4px",
              }}
            >
              {tool.category}
            </div>
            <div
              style={{
                fontSize: "15px",
                fontWeight: 600,
                color: "var(--tx)",
                lineHeight: 1.25,
              }}
            >
              {tool.name}
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              color: "var(--tx-3)",
              fontSize: "18px",
              lineHeight: 1,
              cursor: "pointer",
              flexShrink: 0,
              marginTop: "2px",
              transition: "color 0.15s",
            }}
            aria-label="Close drawer"
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--tx)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "var(--tx-3)"; }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div
          style={{
            flex: 1,
            padding: "16px 18px",
            display: "flex",
            flexDirection: "column",
            gap: "18px",
          }}
        >
          {/* Description */}
          <div>
            <SectionLabel>What it does</SectionLabel>
            <div
              style={{
                fontSize: "12px",
                color: "var(--tx-2)",
                lineHeight: 1.65,
              }}
            >
              {tool.description}
            </div>
          </div>

          {/* Connectors */}
          {tool.connectors && tool.connectors.length > 0 && (
            <div>
              <SectionLabel>Connectors</SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                {tool.connectors.map((c) => (
                  <div
                    key={c}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "6px 10px",
                      borderRadius: "6px",
                      background: "var(--elev)",
                      border: "1px solid var(--line)",
                    }}
                  >
                    <span
                      style={{
                        width: "6px",
                        height: "6px",
                        borderRadius: "50%",
                        background: "var(--slack)",
                        flexShrink: 0,
                      }}
                    />
                    <span style={{ fontSize: "11px", color: "var(--tx-2)", flex: 1 }}>
                      {c}
                    </span>
                    <span
                      style={{
                        fontSize: "10px",
                        color: "var(--slack)",
                        fontFamily: '"Geist Mono", ui-monospace',
                      }}
                    >
                      Connected
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Inputs */}
          <div>
            <SectionLabel>Inputs needed</SectionLabel>
            <div
              style={{
                fontSize: "12px",
                color: "var(--tx-2)",
                lineHeight: 1.6,
              }}
            >
              {tool.inputs}
            </div>
          </div>

          {/* Files */}
          {tool.files && tool.files.length > 0 && (
            <div>
              <SectionLabel>
                Skill files
                <span style={{ color: "var(--tx-3)", textTransform: "none", letterSpacing: 0, fontStyle: "italic", marginLeft: "4px" }}>
                  — opens in VS Code
                </span>
              </SectionLabel>
              <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
                {tool.files.map((file) => (
                  <a
                    key={file.path}
                    href={toVSCodeLink(file.path)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "7px 10px",
                      borderRadius: "6px",
                      background: "var(--elev)",
                      border: "1px solid var(--line)",
                      textDecoration: "none",
                      transition: "background 0.1s, border-color 0.1s",
                    }}
                    title={`Open in VS Code: ${file.path}`}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--panel-2)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line-2)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.background = "var(--elev)";
                      (e.currentTarget as HTMLElement).style.borderColor = "var(--line)";
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--accent-bright)",
                        width: "12px",
                        flexShrink: 0,
                      }}
                    >
                      {fileIcon(file.name)}
                    </span>
                    <span
                      style={{
                        fontSize: "11px",
                        color: "var(--tx-2)",
                        fontFamily: '"Geist Mono", ui-monospace',
                        flex: 1,
                      }}
                    >
                      {file.name}
                    </span>
                    <span
                      style={{
                        fontSize: "9px",
                        color: "var(--tx-3)",
                        flexShrink: 0,
                        transition: "color 0.1s",
                      }}
                    >
                      VS Code ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Last run */}
          <div>
            <SectionLabel>Last run</SectionLabel>
            <div
              style={{
                fontSize: "12px",
                color: "var(--tx-3)",
                fontFamily: '"Geist Mono", ui-monospace',
              }}
            >
              {tool.lastRun ? timeAgo(tool.lastRun) : "Never"}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: "14px 18px",
            borderTop: "1px solid var(--line)",
          }}
        >
          <button
            onClick={() => onLaunch(tool)}
            style={{
              width: "100%",
              padding: "10px 16px",
              borderRadius: "8px",
              background: "var(--accent)",
              border: "none",
              color: "#fff",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "background 0.15s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent-deep)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent)"; }}
          >
            ⌘ Launch in Claude Code
          </button>
        </div>
      </div>
    </div>
  );
}

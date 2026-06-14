"use client";

import { useEffect, useState, useMemo } from "react";
import ToolDrawer from "./ToolDrawer";

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

export default function ToolsSection() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selected, setSelected] = useState<Tool | null>(null);
  const [search, setSearch] = useState("");

  const refreshTools = () => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTools(data);
      });
  };

  useEffect(() => {
    refreshTools();
  }, []);

  async function handleLaunch(tool: Tool) {
    await fetch("/api/tools/runs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toolName: tool.name }),
    });
    setSelected(null);
    refreshTools();
  }

  const filtered = useMemo(() => {
    if (!search.trim()) return tools;
    const q = search.toLowerCase();
    return tools.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
    );
  }, [tools, search]);

  const grouped = useMemo(() => {
    const map: Record<string, Tool[]> = {};
    for (const tool of filtered) {
      if (!map[tool.category]) map[tool.category] = [];
      map[tool.category].push(tool);
    }
    return map;
  }, [filtered]);

  return (
    <>
      {/* Zone header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "12px 14px 8px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", color: "var(--tx-3)" }}>⚙</span>
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--tx)" }}>
            Tools
          </span>
        </div>
        <span
          style={{
            fontSize: "10px",
            color: "var(--tx-3)",
            fontFamily: '"Geist Mono", ui-monospace',
          }}
        >
          {tools.length} skills
        </span>
      </div>

      {/* Search */}
      <div style={{ padding: "0 10px 8px" }}>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={`Filter ${tools.length} tools…`}
          style={{
            width: "100%",
            background: "var(--panel-2)",
            border: "1px solid var(--line)",
            borderRadius: "6px",
            padding: "6px 10px",
            fontSize: "11px",
            color: "var(--tx-2)",
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "inherit",
            transition: "border-color 0.15s",
          }}
          onFocus={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent-line)"; }}
          onBlur={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--line)"; }}
        />
      </div>

      {/* Tool list */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 4px 12px" }}>
        {Object.entries(grouped).map(([category, categoryTools]) => (
          <div key={category} style={{ marginBottom: "4px" }}>
            <div
              style={{
                padding: "4px 10px 2px",
                fontSize: "9px",
                color: "var(--tx-3)",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span>{category}</span>
              <span style={{ fontFamily: '"Geist Mono", ui-monospace' }}>
                {categoryTools.length}
              </span>
            </div>
            {categoryTools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => setSelected(tool)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "6px 10px",
                  borderRadius: "6px",
                  background: selected?.name === tool.name ? "var(--accent-tint)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "8px",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) => {
                  if (selected?.name !== tool.name)
                    (e.currentTarget as HTMLElement).style.background = "var(--panel-2)";
                }}
                onMouseLeave={(e) => {
                  if (selected?.name !== tool.name)
                    (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span
                  style={{
                    fontSize: "12px",
                    color: selected?.name === tool.name ? "var(--accent-bright)" : "var(--tx-2)",
                    lineHeight: 1.3,
                    transition: "color 0.1s",
                  }}
                >
                  {tool.name}
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--tx-3)",
                    opacity: 0,
                    transition: "opacity 0.1s",
                    flexShrink: 0,
                  }}
                  className="chev"
                >
                  ›
                </span>
              </button>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ padding: "16px 10px", textAlign: "center" }}>
            <div style={{ fontSize: "12px", color: "var(--tx-3)" }}>No tools match</div>
          </div>
        )}
      </div>

      <ToolDrawer tool={selected} onClose={() => setSelected(null)} onLaunch={handleLaunch} />
    </>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import { Wrench, Search, ChevronRight, PenLine, Send, Globe, BarChart3, Target, Box } from "lucide-react";
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

const CAT_ICON: Record<string, React.ReactNode> = {
  "Content & LinkedIn": <PenLine />,
  "Outbound & Sales": <Send />,
  "Research": <Search />,
  "GTM Strategy": <Target />,
  "Product": <Box />,
  "Data": <BarChart3 />,
};

export default function ToolsSection() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selected, setSelected] = useState<Tool | null>(null);
  const [search, setSearch] = useState("");

  const refreshTools = () => {
    fetch("/api/tools")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setTools(data); });
  };

  useEffect(() => { refreshTools(); }, []);

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
      <div className="tools-zone">
        <div className="tool-zone-head">
          <div className="zone-title">
            <Wrench />
            Tools
          </div>
          <div className="zone-count">{tools.length} skills</div>
        </div>

        <div className="tool-search">
          <Search />
          <input
            placeholder={`Filter ${tools.length} tools…`}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="tool-scroll">
          {Object.entries(grouped).map(([category, categoryTools]) => (
            <div key={category} className="tool-cat">
              <div className="tool-cat-head">
                <span className="tool-cat-name">{category}</span>
                <span className="tool-cat-count">{categoryTools.length}</span>
              </div>
              {categoryTools.map((tool) => (
                <button
                  key={tool.name}
                  className={`tool-btn${selected?.name === tool.name ? " is-open" : ""}`}
                  onClick={() => setSelected(tool)}
                >
                  {CAT_ICON[category] ?? <Globe />}
                  {tool.name}
                  <ChevronRight className="chev" />
                </button>
              ))}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: "20px 8px", textAlign: "center", color: "var(--tx-3)", fontSize: 12 }}>
              No tools match &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      </div>

      <ToolDrawer tool={selected} onClose={() => setSelected(null)} onLaunch={handleLaunch} />
    </>
  );
}

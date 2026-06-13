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
      <div className="flex flex-col gap-2">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search tools..."
          className="w-full bg-white/5 border border-white/10 rounded px-2 py-1 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-500"
        />
        {Object.entries(grouped).map(([category, categoryTools]) => (
          <div key={category}>
            <p className="text-[9px] text-white/25 uppercase tracking-widest mt-2 mb-0.5 px-1">
              {category}
            </p>
            {categoryTools.map((tool) => (
              <button
                key={tool.name}
                onClick={() => setSelected(tool)}
                className="w-full text-left px-2 py-1 rounded hover:bg-white/5 transition-colors group"
              >
                <p className="text-xs text-white/60 group-hover:text-white/90 leading-snug">
                  {tool.name}
                </p>
              </button>
            ))}
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-white/25 px-1">No tools found</p>
        )}
      </div>
      <ToolDrawer
        tool={selected}
        onClose={() => setSelected(null)}
        onLaunch={handleLaunch}
      />
    </>
  );
}

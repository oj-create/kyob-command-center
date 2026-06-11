"use client";

import { useEffect, useState } from "react";
import ToolDrawer from "./ToolDrawer";

type Tool = {
  name: string;
  description: string;
  inputs: string;
  claudeSkillPath: string;
  lastRun: string | null;
};

export default function ToolsSection() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [selected, setSelected] = useState<Tool | null>(null);

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

  return (
    <>
      <div className="flex flex-col gap-1">
        {tools.map((tool) => (
          <button
            key={tool.name}
            onClick={() => setSelected(tool)}
            className="text-left px-2 py-1.5 rounded hover:bg-white/5 transition-colors group"
          >
            <p className="text-sm text-white/70 group-hover:text-white/90">
              {tool.name}
            </p>
            {tool.lastRun && (
              <p className="text-[10px] text-white/25">
                {new Date(tool.lastRun).toLocaleDateString()}
              </p>
            )}
          </button>
        ))}
      </div>
      <ToolDrawer
        tool={selected}
        onClose={() => setSelected(null)}
        onLaunch={handleLaunch}
      />
    </>
  );
}

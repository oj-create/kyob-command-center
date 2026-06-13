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

export default function ToolDrawer({ tool, onClose, onLaunch }: Props) {
  if (!tool) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Tool: ${tool.name}`}
    >
      <div
        className="w-96 h-full bg-[#16162a] border-l border-white/10 flex flex-col shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 pb-4 border-b border-white/5">
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
              {tool.category}
            </p>
            <h2 className="text-base font-semibold text-white leading-snug">{tool.name}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-white/30 hover:text-white/60 text-xl leading-none mt-0.5 flex-shrink-0 transition-colors"
            aria-label="Close drawer"
          >
            ×
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5 flex-1">
          {/* Description */}
          <p className="text-sm text-white/60 leading-relaxed">{tool.description}</p>

          {/* Inputs */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">
              Inputs needed
            </p>
            <p className="text-xs text-white/55 leading-relaxed">{tool.inputs}</p>
          </div>

          {/* Files */}
          {tool.files && tool.files.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                Files
              </p>
              <div className="flex flex-col gap-1">
                {tool.files.map((file) => (
                  <a
                    key={file.path}
                    href={toVSCodeLink(file.path)}
                    className="flex items-center gap-2 px-2 py-1.5 rounded hover:bg-white/5 group transition-colors"
                    title={`Open in VS Code: ${file.path}`}
                  >
                    <span className="text-[10px] text-purple-400/60 w-3 flex-shrink-0">
                      {fileIcon(file.name)}
                    </span>
                    <span className="text-xs text-white/50 group-hover:text-white/80 transition-colors font-mono leading-none">
                      {file.name}
                    </span>
                    <span className="ml-auto text-[9px] text-white/15 group-hover:text-white/30 transition-colors flex-shrink-0">
                      VS Code ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Connectors */}
          {tool.connectors && tool.connectors.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">
                Connectors
              </p>
              <div className="flex flex-wrap gap-1.5">
                {tool.connectors.map((c) => (
                  <span
                    key={c}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/40 border border-white/5"
                  >
                    {c}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Last run */}
          <div>
            <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1.5">
              Last run
            </p>
            <p className="text-xs text-white/40">
              {tool.lastRun ? timeAgo(tool.lastRun) : "Never"}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 pt-0">
          <button
            onClick={() => onLaunch(tool)}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white text-sm py-2.5 rounded-lg transition-colors"
          >
            Launch in Claude Code
          </button>
        </div>
      </div>
    </div>
  );
}

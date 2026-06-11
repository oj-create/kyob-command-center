"use client";

type Tool = {
  name: string;
  description: string;
  inputs: string;
  claudeSkillPath: string;
  lastRun: string | null;
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
        className="w-80 h-full bg-[#16162a] border-l border-white/10 p-6 flex flex-col gap-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="self-end text-white/30 hover:text-white/60 text-sm"
          aria-label="Close drawer"
        >
          close
        </button>
        <h2 className="text-lg font-semibold text-white">{tool.name}</h2>
        <p className="text-sm text-white/60 leading-relaxed">{tool.description}</p>

        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
            Inputs needed
          </p>
          <p className="text-sm text-white/60">{tool.inputs}</p>
        </div>

        <div>
          <p className="text-[10px] text-white/30 uppercase tracking-widest mb-1">
            Last run
          </p>
          <p className="text-sm text-white/60">
            {tool.lastRun ? timeAgo(tool.lastRun) : "Never"}
          </p>
        </div>

        <button
          onClick={() => onLaunch(tool)}
          className="mt-auto bg-purple-600 hover:bg-purple-500 text-white text-sm py-2.5 rounded-lg transition-colors"
        >
          Launch in Claude Code
        </button>
      </div>
    </div>
  );
}

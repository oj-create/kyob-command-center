"use client";

import { X } from "lucide-react";

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
    <>
      <div className="drawer-scrim" onClick={onClose} />
      <div
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={`Tool: ${tool.name}`}
      >
        <div className="drawer-head">
          <div>
            <div className="drawer-kicker">{tool.category}</div>
            <div className="drawer-title">{tool.name}</div>
          </div>
          <button className="drawer-x" onClick={onClose} aria-label="Close drawer">
            <X />
          </button>
        </div>

        <div className="drawer-body">
          <div className="dsec">
            <div className="lbl">What it does</div>
            <div className="dsec-txt">{tool.description}</div>
          </div>

          {tool.connectors && tool.connectors.length > 0 && (
            <div className="dsec">
              <div className="lbl">Connectors</div>
              <div className="conn-list">
                {tool.connectors.map((c) => (
                  <div key={c} className="conn-row ok">
                    <span className="conn-dot" />
                    <span className="conn-name">{c}</span>
                    <span className="conn-status">Connected</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="dsec">
            <div className="lbl">Inputs needed</div>
            <div className="dsec-txt">{tool.inputs}</div>
          </div>

          {tool.files && tool.files.length > 0 && (
            <div className="dsec">
              <div className="lbl">
                Skill files
                <span style={{ fontStyle: "italic", fontWeight: 400, textTransform: "none", letterSpacing: 0, color: "var(--tx-3)", marginLeft: 4 }}>
                  — opens in VS Code
                </span>
              </div>
              <div className="file-list">
                {tool.files.map((file) => (
                  <a
                    key={file.path}
                    className="file-row"
                    href={toVSCodeLink(file.path)}
                    title={`Open in VS Code: ${file.path}`}
                  >
                    <div className="file-info">
                      <span className="file-glyph">{fileIcon(file.name)}</span>
                      <span className="file-name">{file.name}</span>
                    </div>
                    <span className="file-open">VS Code ↗</span>
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="dsec">
            <div className="lbl">Last run</div>
            <div className="dsec-txt mono">
              {tool.lastRun ? timeAgo(tool.lastRun) : "Never"}
            </div>
          </div>
        </div>

        <div className="drawer-foot">
          <button className="btn btn-launch" onClick={() => onLaunch(tool)}>
            ⌘ Launch in Claude Code
          </button>
        </div>
      </div>
    </>
  );
}

"use client";

import { useEffect, useRef, type ReactNode } from "react";

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;
const DEFAULT_WIDTH = 280;
const STORAGE_KEY = "sidebar-width";

export default function Sidebar({ children }: { children: ReactNode }) {
  const widthRef = useRef(DEFAULT_WIDTH);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const w = parseInt(saved, 10);
      if (w >= MIN_WIDTH && w <= MAX_WIDTH) {
        widthRef.current = w;
        document.documentElement.style.setProperty("--sidebar-width", `${w}px`);
      }
    }
  }, []);

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    let animFrame: number | null = null;

    function onMouseMove(ev: MouseEvent) {
      if (animFrame) cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, ev.clientX));
        widthRef.current = w;
        document.documentElement.style.setProperty("--sidebar-width", `${w}px`);
      });
    }

    function onMouseUp() {
      if (animFrame) cancelAnimationFrame(animFrame);
      localStorage.setItem(STORAGE_KEY, String(widthRef.current));
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }

  return (
    <aside
      style={{
        width: "var(--sidebar-width)",
        background: "var(--panel)",
        borderRight: "1px solid var(--line)",
      }}
      className="fixed top-0 left-0 h-screen flex flex-col overflow-y-auto"
    >
      {/* Brand mark */}
      <div
        style={{
          padding: "18px 16px 16px",
          borderBottom: "1px solid var(--line)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            background: "var(--accent-tint)",
            border: "1px solid var(--accent-line)",
            borderRadius: "6px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "14px", color: "var(--accent-bright)" }}>⌘</span>
        </div>
        <div>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--tx)", lineHeight: 1.2 }}>
            Kyob Command Center
          </div>
          <div style={{ fontSize: "10px", color: "var(--tx-3)", marginTop: "2px" }}>
            ops · single operator
          </div>
        </div>
      </div>

      {/* Children (TodaySection + ToolsSection) */}
      <div className="flex flex-col flex-1 overflow-y-auto" style={{ padding: "0" }}>
        {children}
      </div>

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize group"
        style={{ right: "-3px", zIndex: 10 }}
        title="Drag to resize"
      >
        <div
          className="absolute inset-y-0 left-1/2 w-px transition-colors"
          style={{
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = "var(--accent-line)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = "transparent";
          }}
        />
      </div>
    </aside>
  );
}

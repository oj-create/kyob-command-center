"use client";

import { useEffect, useRef, type ReactNode } from "react";

const MIN_WIDTH = 200;
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
      style={{ width: "var(--sidebar-width)" }}
      className="fixed top-0 left-0 h-screen bg-[#16162a] border-r border-white/10 flex flex-col overflow-y-auto p-4 gap-6"
    >
      {children}

      {/* Drag handle */}
      <div
        onMouseDown={handleMouseDown}
        className="absolute top-0 right-0 w-2 h-full cursor-col-resize group"
        style={{ right: "-4px", zIndex: 10 }}
        title="Drag to resize"
      >
        <div className="absolute inset-y-0 left-1/2 w-px bg-white/0 group-hover:bg-purple-500/40 transition-colors" />
      </div>
    </aside>
  );
}

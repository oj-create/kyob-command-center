"use client";

import { useRef } from "react";

const MIN_WIDTH = 220;
const MAX_WIDTH = 520;

export default function SidebarResizer() {
  const dragging = useRef(false);

  function handleMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    dragging.current = true;
    let raf: number | null = null;

    function onMove(ev: MouseEvent) {
      if (!dragging.current) return;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const w = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, ev.clientX));
        document.documentElement.style.setProperty("--sidebar-width", `${w}px`);
      });
    }

    function onUp() {
      if (raf) cancelAnimationFrame(raf);
      dragging.current = false;
      const current = parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--sidebar-width")
      );
      try { localStorage.setItem("sidebar-width", String(current)); } catch {}
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    }

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  }

  return (
    <div
      className="side-resizer"
      onMouseDown={handleMouseDown}
      title="Drag to resize sidebar"
    />
  );
}

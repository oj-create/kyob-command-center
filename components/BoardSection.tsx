"use client";

import { useRef, useState } from "react";
import ContentPanel from "./ContentPanel";
import OutboundPanel from "./OutboundPanel";
import WebsitePanel from "./WebsitePanel";

const MIN_SPLIT = 0.32;
const MAX_SPLIT = 0.72;
const DEFAULT_SPLIT = 0.55;
const STORAGE_KEY = "board-split";

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

function getSavedSplit(): number {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (s) return clamp(parseFloat(s), MIN_SPLIT, MAX_SPLIT);
  } catch {}
  return DEFAULT_SPLIT;
}

export default function BoardSection() {
  const [split, setSplit] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_SPLIT;
    return getSavedSplit();
  });
  const boardRef = useRef<HTMLDivElement>(null);

  function handleSplitterDown(e: React.PointerEvent) {
    e.preventDefault();
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    let raf: number | null = null;

    function onMove(ev: PointerEvent) {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = boardRef.current?.getBoundingClientRect();
        if (!rect) return;
        const newSplit = clamp((ev.clientX - rect.left) / rect.width, MIN_SPLIT, MAX_SPLIT);
        setSplit(newSplit);
      });
    }

    function onUp() {
      if (raf) cancelAnimationFrame(raf);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      setSplit((s) => {
        try { localStorage.setItem(STORAGE_KEY, String(s)); } catch {}
        return s;
      });
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }

  return (
    <div>
      {/* Board section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "14px",
        }}
      >
        <span style={{ fontSize: "13px", color: "var(--tx-3)" }}>⊞</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--tx)" }}>
          Today&apos;s board
        </span>
        <span style={{ fontSize: "11px", color: "var(--tx-3)", marginLeft: "2px" }}>
          Outbound · Content · Website
        </span>
      </div>

      {/* 2-column grid */}
      <div
        ref={boardRef}
        style={{
          display: "grid",
          gridTemplateColumns: `${split}fr 12px ${1 - split}fr`,
          gap: "0",
          alignItems: "start",
        }}
      >
        {/* Left: ContentPanel */}
        <ContentPanel />

        {/* Splitter */}
        <div
          onPointerDown={handleSplitterDown}
          style={{
            height: "100%",
            minHeight: "100px",
            cursor: "col-resize",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: "40px",
          }}
          title="Drag to resize columns"
        >
          <div
            style={{
              width: "2px",
              height: "48px",
              borderRadius: "2px",
              background: "var(--line-2)",
              transition: "background 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--accent-line)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--line-2)"; }}
          />
        </div>

        {/* Right: Outbound + Website stacked */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <OutboundPanel />
          <WebsitePanel />
        </div>
      </div>
    </div>
  );
}

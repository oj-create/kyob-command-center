"use client";

import { useRef, useState } from "react";
import { LayoutGrid } from "lucide-react";
import ContentPanel from "./ContentPanel";
import OutboundPanel from "./OutboundPanel";
import WebsitePanel from "./WebsitePanel";

const MIN_SPLIT = 0.32;
const MAX_SPLIT = 0.75;
const DEFAULT_SPLIT = 0.608; /* matches 1.55fr / (1.55 + 1) */

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

export default function BoardSection() {
  const [split, setSplit] = useState<number>(() => {
    if (typeof window === "undefined") return DEFAULT_SPLIT;
    try {
      const s = localStorage.getItem("board-split");
      if (s) return clamp(parseFloat(s), MIN_SPLIT, MAX_SPLIT);
    } catch {}
    return DEFAULT_SPLIT;
  });
  const boardRef = useRef<HTMLDivElement>(null);

  function handleResizerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
    let raf: number | null = null;

    function onMove(ev: PointerEvent) {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const rect = boardRef.current?.getBoundingClientRect();
        if (!rect) return;
        setSplit(clamp((ev.clientX - rect.left) / rect.width, MIN_SPLIT, MAX_SPLIT));
      });
    }

    function onUp() {
      if (raf) cancelAnimationFrame(raf);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      setSplit((s) => {
        try { localStorage.setItem("board-split", String(s)); } catch {}
        return s;
      });
    }

    document.addEventListener("pointermove", onMove);
    document.addEventListener("pointerup", onUp);
  }

  return (
    <div>
      <div className="sec-head">
        <span className="sec-ico"><LayoutGrid /></span>
        <span className="sec-title">Today&apos;s board</span>
        <span className="sec-sub">Outbound · Content · Website</span>
      </div>

      <div
        ref={boardRef}
        className="cgrid"
        style={{ gridTemplateColumns: `${split}fr 20px ${1 - split}fr` }}
      >
        <ContentPanel />
        <div
          className="board-resizer"
          onPointerDown={handleResizerDown}
          role="separator"
          aria-orientation="vertical"
        />
        <div className="col">
          <OutboundPanel />
          <WebsitePanel />
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, type ReactNode } from "react";
import { Command } from "lucide-react";

export default function Sidebar({ children }: { children: ReactNode }) {
  useEffect(() => {
    try {
      const saved = localStorage.getItem("sidebar-width");
      if (saved) {
        const w = parseInt(saved, 10);
        if (w >= 220 && w <= 520) {
          document.documentElement.style.setProperty("--sidebar-width", `${w}px`);
        }
      }
    } catch {}
  }, []);

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <Command />
        </div>
        <div>
          <div className="brand-name">Kyob Command Center</div>
          <div className="brand-sub">ops · single operator</div>
        </div>
      </div>
      {children}
    </aside>
  );
}

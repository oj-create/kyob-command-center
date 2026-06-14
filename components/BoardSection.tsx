"use client";

import { LayoutGrid } from "lucide-react";
import TodaySection from "./TodaySection";
import ContentPanel from "./ContentPanel";
import OutboundPanel from "./OutboundPanel";
import WebsitePanel from "./WebsitePanel";

export default function BoardSection() {
  return (
    <div>
      <div className="sec-head">
        <span className="sec-ico"><LayoutGrid /></span>
        <span className="sec-title">Today&apos;s board</span>
        <span className="sec-sub">Tasks · Content · Outbound · Website</span>
      </div>

      <div className="cgrid">
        <TodaySection />
        <div className="col">
          <ContentPanel />
          <OutboundPanel />
          <WebsitePanel />
        </div>
      </div>
    </div>
  );
}

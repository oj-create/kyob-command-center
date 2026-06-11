import Sidebar from "@/components/Sidebar";
import TodaySection from "@/components/TodaySection";
import OutboundPanel from "@/components/OutboundPanel";
import ContentPanel from "@/components/ContentPanel";
import WebsitePanel from "@/components/WebsitePanel";
import ToolsSection from "@/components/ToolsSection";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <div>
          <p className="text-xs text-white/40 uppercase tracking-widest">Quick Tasks</p>
          <p className="text-[10px] text-white/20 mt-0.5">personal &amp; ad-hoc</p>
        </div>
        <TodaySection />
        <p className="text-xs text-white/40 uppercase tracking-widest mt-4">Tools</p>
        <ToolsSection />
      </Sidebar>

      <main
        style={{ marginLeft: "var(--sidebar-width)" }}
        className="flex-1 p-6 flex flex-col gap-6"
      >
        <h1 className="text-lg font-semibold text-white/80">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </h1>
        <p className="text-[10px] text-white/25 uppercase tracking-widest -mt-4">Focus Areas</p>
        <OutboundPanel />
        <ContentPanel />
        <WebsitePanel />
      </main>
    </div>
  );
}

import Sidebar from "@/components/Sidebar";
import TodaySection from "@/components/TodaySection";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      <Sidebar>
        <p className="text-xs text-white/40 uppercase tracking-widest">Today</p>
        <TodaySection />
        <p className="text-xs text-white/40 uppercase tracking-widest mt-4">Tools</p>
        {/* ToolsSection goes here in Task 10 */}
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
        <div className="rounded-xl bg-[#1e1e35] border border-white/10 p-5">
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-2">Outbound</p>
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
        <div className="rounded-xl bg-[#1e1e35] border border-white/10 p-5">
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-2">Content</p>
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
        <div className="rounded-xl bg-[#1e1e35] border border-white/10 p-5">
          <p className="text-xs text-purple-400 uppercase tracking-widest mb-2">Website</p>
          <p className="text-white/40 text-sm">Loading...</p>
        </div>
      </main>
    </div>
  );
}

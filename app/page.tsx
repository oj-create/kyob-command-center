import Sidebar from "@/components/Sidebar";
import TodaySection from "@/components/TodaySection";
import ToolsSection from "@/components/ToolsSection";
import OrientBar from "@/components/OrientBar";
import RepurposeRitual from "@/components/RepurposeRitual";
import BoardSection from "@/components/BoardSection";

export default function Dashboard() {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar>
        <TodaySection />
        <ToolsSection />
      </Sidebar>

      <main
        style={{
          marginLeft: "var(--sidebar-width)",
          flex: 1,
          padding: "24px 28px",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
          maxWidth: "calc(100vw - var(--sidebar-width))",
          boxSizing: "border-box",
        }}
      >
        <OrientBar />
        <RepurposeRitual />
        <BoardSection />
      </main>
    </div>
  );
}

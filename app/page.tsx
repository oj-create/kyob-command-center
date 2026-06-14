import Sidebar from "@/components/Sidebar";
import SidebarResizer from "@/components/SidebarResizer";
import ToolsSection from "@/components/ToolsSection";
import OrientBar from "@/components/OrientBar";
import RepurposeRitual from "@/components/RepurposeRitual";
import BoardSection from "@/components/BoardSection";

export default function Dashboard() {
  return (
    <div className="app">
      <Sidebar>
        <ToolsSection />
      </Sidebar>

      <SidebarResizer />

      <main className="main">
        <div className="main-inner">
          <OrientBar />
          <RepurposeRitual />
          <BoardSection />
        </div>
      </main>
    </div>
  );
}

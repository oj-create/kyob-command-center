export default function Sidebar({ children }: { children: React.ReactNode }) {
  return (
    <aside
      style={{ width: "var(--sidebar-width)" }}
      className="fixed top-0 left-0 h-screen bg-[#16162a] border-r border-white/10 flex flex-col overflow-y-auto p-4 gap-6"
    >
      {children}
    </aside>
  );
}

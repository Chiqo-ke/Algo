import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { CommandPalette } from "./CommandPalette";
import { TutorPanel } from "./TutorPanel";

interface DashboardLayoutProps {
  children: React.ReactNode;
  hideAssistant?: boolean;
}

export const DashboardLayout = ({ children, hideAssistant = false }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const { pathname } = useLocation();
  const isOnDashboard = pathname === "/dashboard";

  // Global keyboard shortcut for command palette
  useState(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  });

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      {/* Left Sidebar (Desktop Only) */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto pb-20 sm:pb-24 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Right AI Assistant Panel */}
      {!hideAssistant && assistantOpen && (
        <AIAssistantPanel onClose={() => setAssistantOpen(false)} />
      )}

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />

      {/* Tutor overlay + step panel — always mounted so tours work across page navigations */}
      <TutorPanel />
    </div>
  );
};

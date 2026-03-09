import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { MobileBottomNav } from "./MobileBottomNav";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { CommandPalette } from "./CommandPalette";
import { TourButton } from "@/components/tour";

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

      {/* Tour Button - fixed top-right, only on the main Dashboard page */}
      {isOnDashboard && (
        <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-50">
          <TourButton />
        </div>
      )}

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

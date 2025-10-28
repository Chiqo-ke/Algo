import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { AIAssistantPanel } from "./AIAssistantPanel";
import { CommandPalette } from "./CommandPalette";

interface DashboardLayoutProps {
  children: React.ReactNode;
  hideAssistant?: boolean;
}

export const DashboardLayout = ({ children, hideAssistant = false }: DashboardLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);

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
      {/* Left Sidebar */}
      <Sidebar collapsed={sidebarCollapsed} onToggle={() => setSidebarCollapsed(!sidebarCollapsed)} />

      {/* Main Content Area */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Right AI Assistant Panel */}
      {!hideAssistant && assistantOpen && (
        <AIAssistantPanel onClose={() => setAssistantOpen(false)} />
      )}

      {/* Command Palette */}
      <CommandPalette open={commandOpen} onOpenChange={setCommandOpen} />
    </div>
  );
};

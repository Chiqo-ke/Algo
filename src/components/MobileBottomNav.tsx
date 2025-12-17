import { NavLink } from "react-router-dom";
import { LayoutDashboard, Bot, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileBottomNav = () => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-sidebar border-t border-sidebar-border">
      <div className="flex items-center justify-around h-16 px-2">
        {/* Dashboard Button - Left */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
            )
          }
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] font-medium">Dashboard</span>
        </NavLink>

        {/* Strategy Button - Center (Emphasized) */}
        <NavLink
          to="/strategy"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-1 px-4 py-2 rounded-xl transition-all relative scale-105",
              "bg-gradient-primary shadow-glow",
              isActive 
                ? "ring-2 ring-primary ring-offset-2 ring-offset-background" 
                : "hover:scale-110 hover:shadow-[0_0_40px_rgba(56,189,248,0.3)]"
            )
          }
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-primary-foreground" />
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
          </div>
          <span className="text-[10px] font-bold text-primary-foreground">Strategy</span>
        </NavLink>

        {/* Settings Button - Right */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            cn(
              "flex flex-col items-center justify-center gap-0.5 px-3 py-1.5 rounded-lg transition-all",
              "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              isActive && "bg-sidebar-accent text-sidebar-primary font-medium"
            )
          }
        >
          <Settings className="w-5 h-5" />
          <span className="text-[10px] font-medium">Settings</span>
        </NavLink>
      </div>
    </nav>
  );
};

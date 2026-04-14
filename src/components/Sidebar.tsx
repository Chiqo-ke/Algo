import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Sparkles, 
  Bot, 
  GraduationCap, 
  Settings,
  Shield,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Bot, label: "Strategy", path: "/strategy" },
    { icon: Zap, label: "Live Trading", path: "/live-trading" },
    { icon: GraduationCap, label: "Learning Hub", path: "/learning" },
    ...(isAdmin ? [{ icon: Shield, label: "Admin", path: "/admin" }] : []),
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <TooltipProvider delayDuration={200}>
      <aside 
        className={cn(
          "hidden md:flex relative flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
          collapsed ? "w-16 lg:w-20" : "w-52 lg:w-64"
        )}
      >
        {/* Logo / Brand */}
        <div className="flex items-center justify-between p-3 lg:p-5 border-b border-sidebar-border">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 lg:w-8 lg:h-8 rounded-lg bg-gradient-primary flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 lg:w-5 lg:h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-base lg:text-lg text-sidebar-foreground truncate">AlgoAI</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="text-sidebar-foreground hover:bg-sidebar-accent h-8 w-8 lg:h-9 lg:w-9 flex-shrink-0"
          >
            {collapsed ? <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" /> : <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />}
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 lg:p-3 space-y-1">
          {menuItems.map((item) => (
            <Tooltip key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 lg:px-4 lg:py-3 rounded-lg transition-all",
                    "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive && "bg-sidebar-accent text-sidebar-primary font-medium shadow-glow",
                    collapsed && "justify-center"
                  )
                }
              >
                {/* Use TooltipTrigger on inner inline-flex to avoid className function stringification */}
                <TooltipTrigger asChild>
                  <span className={cn("inline-flex items-center gap-2 lg:gap-3")}>
                    <item.icon className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                    {!collapsed && <span className="text-xs lg:text-sm truncate">{item.label}</span>}
                  </span>
                </TooltipTrigger>
              </NavLink>
              {collapsed && (
                <TooltipContent 
                  side="right" 
                  className="luminous-tooltip bg-sidebar-accent/95 border-primary/30 text-sidebar-accent-foreground shadow-[0_0_30px_rgba(56,189,248,0.3)] backdrop-blur-sm"
                >
                  <p className="font-medium">{item.label}</p>
                </TooltipContent>
              )}
            </Tooltip>
          ))}
        </nav>

        {/* Bottom: Logout separated */}
        <div className="mt-auto p-2 lg:p-3 border-t border-sidebar-border">
          <Tooltip>
            <button
              onClick={handleLogout}
              className={cn(
                "w-full flex items-center px-3 py-2 lg:px-4 lg:py-3 rounded-lg transition-all",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                collapsed && "justify-center"
              )}
            >
              <TooltipTrigger asChild>
                <span className={cn("inline-flex items-center gap-2 lg:gap-3")}>
                  <LogOut className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  {!collapsed && <span className="text-xs lg:text-sm">Logout</span>}
                </span>
              </TooltipTrigger>
            </button>
            {collapsed && (
              <TooltipContent 
                side="right" 
                className="luminous-tooltip bg-sidebar-accent/95 border-primary/30 text-sidebar-accent-foreground shadow-[0_0_30px_rgba(56,189,248,0.3)] backdrop-blur-sm"
              >
                <p className="font-medium">Logout</p>
              </TooltipContent>
            )}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  );
};

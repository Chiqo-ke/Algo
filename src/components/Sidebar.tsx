import { NavLink, useNavigate } from "react-router-dom";
import { 
  LayoutDashboard, 
  Sparkles, 
  Bot, 
  BarChart3, 
  GraduationCap, 
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Bot, label: "Strategy", path: "/strategy" },
  { icon: BarChart3, label: "Analytics", path: "/analytics" },
  { icon: GraduationCap, label: "Learning Hub", path: "/learning" },
  { icon: Settings, label: "Settings", path: "/settings" },
];

export const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <aside 
      className={cn(
        "relative flex flex-col bg-sidebar border-r border-sidebar-border transition-all duration-300",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Logo / Brand */}
      <div className="flex items-center justify-between p-6 border-b border-sidebar-border">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-sidebar-foreground">TradeAI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg transition-all",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isActive && "bg-sidebar-accent text-sidebar-primary font-medium shadow-glow",
                collapsed && "justify-center"
              )
            }
          >
            <item.icon className="w-5 h-5 flex-shrink-0" />
            {!collapsed && <span className="text-sm">{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Section */}
      {!collapsed && (
        <div className="p-4 border-t border-sidebar-border space-y-2">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user?.username || 'User'}</p>
              <p className="text-xs text-muted-foreground">{user?.email || 'user@example.com'}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      )}
      {collapsed && (
        <div className="p-4 border-t border-sidebar-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-full text-sidebar-foreground hover:bg-sidebar-accent"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      )}
    </aside>
  );
};

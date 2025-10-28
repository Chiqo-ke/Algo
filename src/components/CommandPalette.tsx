import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { 
  LayoutDashboard, 
  Sparkles, 
  FlaskConical, 
  Bot, 
  BarChart3, 
  GraduationCap, 
  Settings 
} from "lucide-react";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const commands = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/", keywords: ["home", "overview"] },
  { icon: Sparkles, label: "AI Strategy Builder", path: "/strategy-builder", keywords: ["create", "build", "ai"] },
  { icon: FlaskConical, label: "Backtesting", path: "/backtesting", keywords: ["test", "backtest", "historical"] },
  { icon: Bot, label: "Live Bots", path: "/live-bots", keywords: ["bots", "automation", "live"] },
  { icon: BarChart3, label: "Analytics", path: "/analytics", keywords: ["stats", "metrics", "data"] },
  { icon: GraduationCap, label: "Learning Hub", path: "/learning", keywords: ["learn", "education", "tutorial"] },
  { icon: Settings, label: "Settings", path: "/settings", keywords: ["config", "preferences"] },
];

export const CommandPalette = ({ open, onOpenChange }: CommandPaletteProps) => {
  const navigate = useNavigate();

  const handleSelect = (path: string) => {
    navigate(path);
    onOpenChange(false);
  };

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Search commands or navigate..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {commands.map((command) => (
            <CommandItem
              key={command.path}
              onSelect={() => handleSelect(command.path)}
              className="flex items-center gap-3 py-3"
            >
              <command.icon className="w-4 h-4 text-primary" />
              <span>{command.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
};

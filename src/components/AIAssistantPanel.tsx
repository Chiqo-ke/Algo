import { useState } from "react";
import { X, Send, Sparkles, Lightbulb, Zap } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { cn } from "@/lib/utils";
import { STRATEGY_PROMPT_TEMPLATES, demoMode, type StrategyPromptTemplate } from "@/lib/demoTemplates";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";

interface AIAssistantPanelProps {
  onClose: () => void;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export const AIAssistantPanel = ({ onClose }: AIAssistantPanelProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI trading assistant. I can help you build strategies, explain indicators, or optimize your bots. What would you like to do?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [showTemplates, setShowTemplates] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<StrategyPromptTemplate | null>(null);

  const handleTemplateSelect = (template: StrategyPromptTemplate) => {
    setSelectedTemplate(template);
    setInput(template.prompt);
    setShowTemplates(false);
    
    // Add assistant message about template
    const templateMessage: Message = {
      id: Date.now().toString(),
      role: "assistant",
      content: `I've loaded the "${template.name}" template for you. This is a ${template.category}-level strategy that ${template.description.toLowerCase()}. Click send to generate this strategy!`,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, templateMessage]);
  };

  const handleClearTemplate = () => {
    setSelectedTemplate(null);
    setInput("");
  };

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I understand you want to " + input + ". Let me help you with that...",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <aside className="w-96 bg-card border-l border-border flex flex-col shadow-card">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">AI Assistant</h3>
            <p className="text-xs text-muted-foreground">Always here to help</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex gap-3",
                message.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  message.role === "assistant"
                    ? "bg-gradient-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground"
                )}
              >
                {message.role === "assistant" ? (
                  <Sparkles className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-bold">U</span>
                )}
              </div>
              <div
                className={cn(
                  "flex-1 px-4 py-2 rounded-lg",
                  message.role === "assistant"
                    ? "bg-secondary text-secondary-foreground"
                    : "bg-primary text-primary-foreground"
                )}
              >
                <p className="text-sm">{message.content}</p>
                <p className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border space-y-3">
        {/* Template Selector */}
        {showTemplates ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium">Demo Templates</h4>
              <Button variant="ghost" size="sm" onClick={() => setShowTemplates(false)}>
                Cancel
              </Button>
            </div>
            <ScrollArea className="h-64">
              <div className="space-y-2 pr-4">
                {STRATEGY_PROMPT_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                    onClick={() => handleTemplateSelect(template)}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h5 className="text-sm font-medium">{template.name}</h5>
                      <Badge variant={
                        template.category === 'beginner' ? 'default' :
                        template.category === 'intermediate' ? 'secondary' : 'destructive'
                      }>
                        {template.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{template.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">⏱️ {template.expectedDuration}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <>
            {/* Template Indicator */}
            {selectedTemplate && (
              <div className="flex items-center gap-2 p-2 bg-accent rounded-lg">
                <Lightbulb className="w-4 h-4 text-yellow-500" />
                <span className="text-xs flex-1">Using template: {selectedTemplate.name}</span>
                <Button variant="ghost" size="sm" onClick={handleClearTemplate}>
                  Clear
                </Button>
              </div>
            )}
            
            {/* Quick Template Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowTemplates(true)}
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              Load Demo Template
            </Button>

            {/* Input Area */}
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask me anything or use a template..."
                className="flex-1"
              />
              <Button onClick={handleSend} size="icon" className="bg-gradient-primary">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
};

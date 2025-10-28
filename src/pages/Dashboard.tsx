import { useState } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export default function Dashboard() {
  const location = useLocation();
  const editMode = location.state?.editMode || false;
  const strategyName = location.state?.strategyName || "Algo";
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasStartedChat, setHasStartedChat] = useState(false);

  const handleSendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setHasStartedChat(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: editMode 
          ? `I understand you want to ${input}. Let me help you edit your ${strategyName} strategy...`
          : `I understand you want to ${input}. Let me analyze your trading portfolio and provide insights...`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    }, 1000);
  };

  const exampleQuestions = editMode
    ? [
        `Improve the entry conditions for ${strategyName}`,
        "Add a trailing stop loss feature",
        "Optimize the risk-reward ratio",
        "Add time-based filters to avoid low volatility periods",
        "Implement position sizing based on volatility"
      ]
    : [
        "How is my Momentum Scalper performing?",
        "What's the best time to run my bots?",
        "Why did my RSI bot make that last trade?",
        "Optimize my bot settings for better performance",
        "Show me risk analysis for current positions"
      ];

  return (
    <DashboardLayout hideAssistant={true}>
      <div className="flex flex-col items-center justify-center min-h-screen p-8">
        {/* Header at Top Center */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground flex items-center justify-center gap-3">
            <Sparkles className="w-10 h-10" />
            {strategyName}
          </h1>
          {editMode && (
            <p className="text-muted-foreground mt-2">
              Editing strategy - Ask AI to help improve and optimize
            </p>
          )}
        </div>
        {/* AI Assistant Section - Centered */}
        <div className={cn(
          "transition-all duration-500 ease-in-out w-full",
          hasStartedChat ? "max-w-4xl" : "max-w-4xl"
        )}>
            {!hasStartedChat && (
              <div className="text-center mb-8 space-y-4">
                <div className="w-16 h-16 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {editMode ? `Edit ${strategyName}` : "Ask AI about your trading"}
                </h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  {editMode 
                    ? "Describe the changes you want to make to your strategy. I can help optimize parameters, add new indicators, or improve risk management."
                    : "Get insights about your portfolio performance, optimize your bots, or analyze market conditions. Ask about strategy adjustments, risk management, or any trading questions you have."}
                </p>              {/* Example Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-6">
                {exampleQuestions.map((question, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto p-4 text-left justify-start hover:bg-secondary"
                    onClick={() => setInput(question)}
                  >
                    <span className="text-sm">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          <Card className="bg-card border-border shadow-card">
            <CardContent className="space-y-4 pt-6">
              {/* Messages */}
              {messages.length > 0 && (
                <ScrollArea className="h-96 pr-4">
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
                            "flex-1 px-4 py-2 rounded-lg max-w-lg",
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
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder={editMode 
                    ? `Ask about editing ${strategyName}...`
                    : "Ask about your trading strategy, bots, or market analysis..."}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} size="icon" className="bg-gradient-primary">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

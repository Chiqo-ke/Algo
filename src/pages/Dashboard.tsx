import { useState } from "react";
import { useLocation } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Sparkles, AlertCircle, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: string;
    classification?: string;
    warnings?: string[];
    recommendations?: Array<{
      title: string;
      priority: string;
      rationale: string;
    }>;
  };
}

export default function Dashboard() {
  const location = useLocation();
  const editMode = location.state?.editMode || false;
  const strategyName = location.state?.strategyName || "Algo";
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [strategyId, setStrategyId] = useState<number | null>(null);

  // API base URL - adjust based on your environment
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput("");
    setHasStartedChat(true);
    setIsLoading(true);

    try {
      if (editMode && strategyId) {
        // Update existing strategy with AI
        const response = await fetch(
          `${API_BASE_URL}/api/strategies/api/${strategyId}/update_strategy_with_ai/`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              strategy_text: userInput,
              input_type: "freetext",
              use_gemini: true,
              strict_mode: false,
              update_description: `User requested: ${userInput.substring(0, 100)}`,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Create AI response message with validation results
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: formatAIResponse(data.ai_validation, true),
          timestamp: new Date(),
          metadata: {
            confidence: data.ai_validation?.confidence,
            classification: data.ai_validation?.classification,
            warnings: data.ai_validation?.warnings || [],
            recommendations: data.ai_validation?.recommendations_list || [],
          },
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        toast({
          title: "Strategy Updated",
          description: `${strategyName} has been updated with AI validation`,
        });

      } else {
        // Create new strategy or validate
        const endpoint = editMode
          ? `${API_BASE_URL}/api/strategies/api/create_strategy_with_ai/`
          : `${API_BASE_URL}/api/strategies/api/validate_strategy_with_ai/`;

        const payload = editMode
          ? {
              strategy_text: userInput,
              input_type: "freetext",
              name: strategyName,
              description: `Strategy created via chat on ${new Date().toLocaleDateString()}`,
              tags: ["ai-generated", "chat-created"],
              use_gemini: true,
              strict_mode: false,
              save_to_backtest: true,
            }
          : {
              strategy_text: userInput,
              input_type: "freetext",
              use_gemini: true,
              strict_mode: false,
            };

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `API error: ${response.status}`);
        }

        const data = await response.json();
        
        // Save strategy ID if created
        if (editMode && data.strategy?.id) {
          setStrategyId(data.strategy.id);
        }

        // Create AI response message
        const validationData = editMode ? data.ai_validation : data;
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: formatAIResponse(validationData, editMode),
          timestamp: new Date(),
          metadata: {
            confidence: validationData?.confidence,
            classification: validationData?.classification,
            warnings: validationData?.warnings || [],
            recommendations: validationData?.recommendations_list || [],
          },
        };
        
        setMessages((prev) => [...prev, aiMessage]);

        if (editMode && data.strategy) {
          toast({
            title: "Strategy Created",
            description: `${strategyName} created successfully with ID: ${data.strategy.id}`,
          });
        }
      }
    } catch (error) {
      console.error("API Error:", error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ I encountered an error processing your request: ${
          error instanceof Error ? error.message : "Unknown error"
        }\n\nPlease make sure the Django server is running at ${API_BASE_URL}`,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process your request. Check console for details.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatAIResponse = (data: any, isEdit: boolean): string => {
    if (!data || data.status !== "success") {
      return data?.message || "Unable to process strategy. Please try again.";
    }

    let response = isEdit
      ? `✅ **Strategy ${strategyId ? 'Updated' : 'Created'} Successfully!**\n\n`
      : `✅ **Strategy Analysis Complete**\n\n`;

    // Add classification
    if (data.classification_detail) {
      response += `**Classification:**\n`;
      response += `• Type: ${data.classification_detail.type}\n`;
      response += `• Risk Tier: ${data.classification_detail.risk_tier}\n`;
      response += `• Confidence: ${data.confidence || 'medium'}\n\n`;
    }

    // Add canonicalized steps
    if (data.canonicalized_steps && data.canonicalized_steps.length > 0) {
      response += `**Strategy Steps:**\n`;
      data.canonicalized_steps.slice(0, 5).forEach((step: string) => {
        response += `• ${step}\n`;
      });
      response += `\n`;
    }

    // Add warnings
    if (data.warnings && data.warnings.length > 0) {
      response += `⚠️ **Warnings:**\n`;
      data.warnings.forEach((warning: string) => {
        response += `• ${warning}\n`;
      });
      response += `\n`;
    }

    // Add top recommendations
    if (data.recommendations_list && data.recommendations_list.length > 0) {
      response += `💡 **AI Recommendations:**\n`;
      data.recommendations_list.slice(0, 3).forEach((rec: any) => {
        response += `• **${rec.title}** (${rec.priority})\n  ${rec.rationale}\n`;
      });
      response += `\n`;
    }

    // Add next actions
    if (data.next_actions && data.next_actions.length > 0) {
      response += `🎯 **Suggested Next Steps:**\n`;
      data.next_actions.slice(0, 3).forEach((action: string) => {
        response += `• ${action}\n`;
      });
    }

    return response;
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
                            "flex-1 px-4 py-2 rounded-lg max-w-lg space-y-2",
                            message.role === "assistant"
                              ? "bg-secondary text-secondary-foreground"
                              : "bg-primary text-primary-foreground"
                          )}
                        >
                          <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                          
                          {/* Display AI Metadata (Confidence, Warnings, etc.) */}
                          {message.metadata && message.role === "assistant" && (
                            <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                              {/* Confidence Badge */}
                              {message.metadata.confidence && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-4 h-4 text-green-500" />
                                  <span className="text-xs font-medium">
                                    Confidence: {message.metadata.confidence.toUpperCase()}
                                  </span>
                                </div>
                              )}
                              
                              {/* Warnings */}
                              {message.metadata.warnings && message.metadata.warnings.length > 0 && (
                                <div className="flex items-start gap-2">
                                  <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5" />
                                  <div className="flex-1">
                                    <span className="text-xs font-medium block mb-1">
                                      Warnings ({message.metadata.warnings.length})
                                    </span>
                                    <ul className="text-xs opacity-80 space-y-1">
                                      {message.metadata.warnings.slice(0, 2).map((warning, i) => (
                                        <li key={i}>• {warning}</li>
                                      ))}
                                      {message.metadata.warnings.length > 2 && (
                                        <li className="italic">
                                          +{message.metadata.warnings.length - 2} more...
                                        </li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                          
                          <p className="text-xs opacity-60 mt-2">
                            {message.timestamp.toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {/* Loading Indicator */}
                    {isLoading && (
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                        <div className="flex-1 px-4 py-2 rounded-lg max-w-lg bg-secondary text-secondary-foreground">
                          <p className="text-sm">Analyzing your strategy with AI...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              )}

              {/* Input */}
              <div className="flex gap-2">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && !isLoading && handleSendMessage()}
                  placeholder={editMode 
                    ? `Ask about editing ${strategyName}...`
                    : "Ask about your trading strategy, bots, or market analysis..."}
                  className="flex-1"
                  disabled={isLoading}
                />
                <Button 
                  onClick={handleSendMessage} 
                  size="icon" 
                  className="bg-gradient-primary"
                  disabled={isLoading || !input.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

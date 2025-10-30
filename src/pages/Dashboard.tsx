import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Sparkles, AlertCircle, Loader2, CheckCircle, ArrowRight, FileCheck, Lightbulb } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

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
  strategyData?: any; // Store full strategy data for confirmation
}

interface StrategyConfirmation {
  strategyId?: number;
  strategyName?: string;
  canonicalJson?: any;
  humanReadable?: string;
  aiValidation?: any;
}

export default function Dashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const editMode = location.state?.editMode || false;
  const strategyName = location.state?.strategyName || "Algo";
  const { toast } = useToast();
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [hasStartedChat, setHasStartedChat] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [strategyId, setStrategyId] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [confirmationData, setConfirmationData] = useState<StrategyConfirmation | null>(null);
  const [isProceedingToNext, setIsProceedingToNext] = useState(false);
  const [editedStrategyName, setEditedStrategyName] = useState("");
  
  // NEW: Conversation memory state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [useContext, setUseContext] = useState(true);
  
  // NEW: Metadata display configuration
  const [showFullWarnings, setShowFullWarnings] = useState<Record<string, boolean>>({});
  const [showFullRecommendations, setShowFullRecommendations] = useState<Record<string, boolean>>({});

  // API base URL - adjust based on your environment
  const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Convert canonical JSON to human-readable format
  const formatStrategyForConfirmation = (canonicalJson: any): string => {
    if (!canonicalJson) return "Unable to format strategy data.";

    let readable = "";

    // Strategy Name and Description
    if (canonicalJson.strategy_name) {
      readable += `📊 **Strategy Name:** ${canonicalJson.strategy_name}\n\n`;
    }
    if (canonicalJson.description) {
      readable += `📝 **Description:** ${canonicalJson.description}\n\n`;
    }

    // Classification
    if (canonicalJson.classification) {
      const cls = canonicalJson.classification;
      readable += `🏷️ **Classification:**\n`;
      readable += `   • Type: ${cls.type || 'N/A'}\n`;
      readable += `   • Risk Tier: ${cls.risk_tier || 'N/A'}\n`;
      readable += `   • Market Condition: ${cls.market_condition || 'N/A'}\n\n`;
    }

    // Entry Rules
    if (canonicalJson.entry_rules && canonicalJson.entry_rules.length > 0) {
      readable += `🎯 **Entry Rules:**\n`;
      canonicalJson.entry_rules.forEach((rule: any, idx: number) => {
        readable += `   ${idx + 1}. ${rule.description || JSON.stringify(rule)}\n`;
      });
      readable += `\n`;
    }

    // Exit Rules
    if (canonicalJson.exit_rules && canonicalJson.exit_rules.length > 0) {
      readable += `🚪 **Exit Rules:**\n`;
      canonicalJson.exit_rules.forEach((rule: any, idx: number) => {
        readable += `   ${idx + 1}. ${rule.description || JSON.stringify(rule)}\n`;
      });
      readable += `\n`;
    }

    // Risk Management
    if (canonicalJson.risk_management) {
      const risk = canonicalJson.risk_management;
      readable += `⚠️ **Risk Management:**\n`;
      if (risk.stop_loss) readable += `   • Stop Loss: ${JSON.stringify(risk.stop_loss)}\n`;
      if (risk.take_profit) readable += `   • Take Profit: ${JSON.stringify(risk.take_profit)}\n`;
      if (risk.position_sizing) readable += `   • Position Sizing: ${JSON.stringify(risk.position_sizing)}\n`;
      readable += `\n`;
    }

    // Indicators
    if (canonicalJson.indicators && canonicalJson.indicators.length > 0) {
      readable += `📈 **Indicators Used:**\n`;
      canonicalJson.indicators.forEach((indicator: any) => {
        readable += `   • ${indicator.name || indicator.type || 'Unknown'}\n`;
      });
      readable += `\n`;
    }

    // Timeframe
    if (canonicalJson.timeframe) {
      readable += `⏱️ **Timeframe:** ${canonicalJson.timeframe}\n\n`;
    }

    return readable;
  };

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
        // Update existing strategy with AI + conversation memory
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
              session_id: sessionId || undefined, // Use existing session
              use_context: useContext,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`);
        }

        const data = await response.json();
        
        console.log("📊 UPDATE STRATEGY RESPONSE:", JSON.stringify(data, null, 2));
        
        // Update session info from response
        if (data.session_id) {
          setSessionId(data.session_id);
          setMessageCount(data.message_count || messageCount + 2);
        }
        
        // Parse canonical_json if it's a string
        let canonicalJsonParsed = data.canonical_json;
        if (typeof data.canonical_json === 'string') {
          try {
            canonicalJsonParsed = JSON.parse(data.canonical_json);
          } catch (e) {
            console.error("Failed to parse canonical_json:", e);
          }
        }
        
        console.log("🎯 Parsed canonical JSON:", canonicalJsonParsed);
        
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
          strategyData: {
            strategyId: data.strategy?.id,
            canonicalJson: canonicalJsonParsed,
            aiValidation: data.ai_validation,
            strategyName: strategyName,
          },
        };
        
        setMessages((prev) => [...prev, aiMessage]);
        
        toast({
          title: "Strategy Updated",
          description: `${strategyName} has been updated with AI validation`,
        });

      } else {
        // Create new strategy or validate with conversation memory
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
              session_id: sessionId || undefined, // Use existing session or create new
              use_context: useContext,
            }
          : {
              strategy_text: userInput,
              input_type: "freetext",
              use_gemini: true,
              strict_mode: false,
              session_id: sessionId || undefined, // Use existing session or create new
              use_context: useContext,
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
        
        console.log("📊 VALIDATE/CREATE STRATEGY RESPONSE:", JSON.stringify(data, null, 2));
        
        // Update session info from response
        if (data.session_id) {
          setSessionId(data.session_id);
          setMessageCount(data.message_count || messageCount + 2);
          console.log(`📝 Session ${data.session_id} - Message count: ${data.message_count}`);
        }
        
        // Save strategy ID if created
        if (editMode && data.strategy?.id) {
          setStrategyId(data.strategy.id);
        }

        // Parse canonical_json if it's a string
        let canonicalJsonParsed = data.canonical_json;
        if (typeof data.canonical_json === 'string') {
          try {
            canonicalJsonParsed = JSON.parse(data.canonical_json);
            console.log("✅ Successfully parsed canonical_json from string");
          } catch (e) {
            console.error("❌ Failed to parse canonical_json:", e);
          }
        }
        
        console.log("🎯 Parsed canonical JSON:", canonicalJsonParsed);

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
          strategyData: editMode ? {
            strategyId: data.strategy?.id,
            canonicalJson: canonicalJsonParsed,
            aiValidation: data.ai_validation,
            strategyName: strategyName,
          } : {
            canonicalJson: canonicalJsonParsed,
            aiValidation: data,
            strategyName: strategyName,
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

    // ✅ AI HAS FULL CONTROL - Trust the AI's formatted response completely
    if (data.formatted_response) {
      return data.formatted_response;
    }

    // ⚠️ Fallback only if backend didn't provide formatted_response
    console.warn("⚠️ Backend didn't provide formatted_response, using minimal fallback");
    
    // Minimal fallback - just show the essential message
    let response = data.message || (isEdit 
      ? "Strategy has been processed successfully." 
      : "Strategy analysis complete.");
    
    // Add basic context if available
    if (data.context_used || sessionId) {
      response += `\n\n🧠 *Using conversation context from previous ${messageCount} messages*`;
    }

    return response;
  };

  const handleOpenConfirmation = (message: Message) => {
    if (!message.strategyData) {
      console.error("❌ No strategyData found in message:", message);
      return;
    }

    console.log("📋 Opening confirmation dialog with data:", message.strategyData);
    console.log("📋 Canonical JSON structure:", message.strategyData.canonicalJson);

    const humanReadable = formatStrategyForConfirmation(message.strategyData.canonicalJson);
    const defaultName = message.strategyData.strategyName || strategyName;
    
    console.log("📋 Generated human readable:", humanReadable);
    
    setConfirmationData({
      strategyId: message.strategyData.strategyId,
      strategyName: defaultName,
      canonicalJson: message.strategyData.canonicalJson,
      humanReadable: humanReadable,
      aiValidation: message.strategyData.aiValidation,
    });
    
    // Set the editable name
    setEditedStrategyName(defaultName);
    setShowConfirmDialog(true);
  };

  const handleConfirmAndProceed = async () => {
    if (!confirmationData) return;

    // Validate strategy name
    if (!editedStrategyName.trim()) {
      toast({
        title: "Strategy name required",
        description: "Please enter a name for your strategy",
        variant: "destructive",
      });
      return;
    }

    setIsProceedingToNext(true);

    try {
      // If strategy was already created during editMode, update the name if changed
      if (confirmationData.strategyId) {
        console.log("✅ Strategy already exists with ID:", confirmationData.strategyId);
        
        // Update the strategy name if it was changed
        if (editedStrategyName.trim() !== confirmationData.strategyName) {
          try {
            const updateResponse = await fetch(
              `${API_BASE_URL}/api/strategies/api/strategies/${confirmationData.strategyId}/`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  name: editedStrategyName.trim(),
                }),
              }
            );

            if (!updateResponse.ok) {
              console.warn("Failed to update strategy name, continuing anyway");
            }
          } catch (e) {
            console.warn("Failed to update strategy name:", e);
          }
        }
        
        toast({
          title: "Strategy Confirmed",
          description: `Proceeding with ${editedStrategyName}`,
        });
        
        setShowConfirmDialog(false);
        
        // Navigate to backtest page with strategy ID
        navigate('/backtest', { 
          state: { 
            strategyId: confirmationData.strategyId,
            strategyName: editedStrategyName.trim()
          } 
        });
        
      } else {
        console.log("💾 Creating new strategy with canonical JSON");
        
        // Extract metadata from canonical JSON for proper categorization
        const canonicalJson = confirmationData.canonicalJson;
        const classification = confirmationData.aiValidation?.classification_detail || {};
        
        // Build tags array, filtering out undefined/null values
        const tags = [
          "ai-generated",
          "confirmed",
          ...(Array.isArray(classification.primary_instruments) ? classification.primary_instruments : []),
          ...(classification.type ? [classification.type] : [])
        ].filter(tag => tag && typeof tag === 'string').slice(0, 10); // Max 10 tags, must be strings
        
        // Helper function to safely parse numeric values
        const parseOptionalDecimal = (value: any): number | null => {
          if (value === null || value === undefined || value === '') return null;
          const parsed = typeof value === 'string' ? parseFloat(value) : Number(value);
          return isNaN(parsed) ? null : parsed;
        };
        
        const payload = {
          name: editedStrategyName.trim(),
          description: canonicalJson?.description || `Strategy confirmed on ${new Date().toLocaleDateString()}`,
          strategy_code: JSON.stringify(canonicalJson), // Store canonical JSON as strategy_code
          parameters: canonicalJson?.metadata || {},
          tags: tags,
          timeframe: (canonicalJson?.timeframe || canonicalJson?.metadata?.timeframe || "").toString().slice(0, 20), // Max 20 chars
          risk_level: (classification.risk_tier || "").toString().slice(0, 20), // Max 20 chars
          expected_return: parseOptionalDecimal(canonicalJson?.expected_return || canonicalJson?.metadata?.expected_return),
          max_drawdown: parseOptionalDecimal(canonicalJson?.max_drawdown || canonicalJson?.metadata?.max_drawdown),
        };
        
        console.log("📤 Sending create_strategy payload:", JSON.stringify(payload, null, 2));
        
        // If only validated, create the strategy now using the create_strategy endpoint
        const response = await fetch(
          `${API_BASE_URL}/api/strategies/api/create_strategy/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
          }
        );

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          console.error("❌ Create strategy failed:");
          console.error("Status:", response.status);
          console.error("Error data:", JSON.stringify(errorData, null, 2));
          console.error("Payload sent:", JSON.stringify({
            name: editedStrategyName.trim(),
            description: canonicalJson?.description || `Strategy confirmed on ${new Date().toLocaleDateString()}`,
            strategy_code: JSON.stringify(canonicalJson),
            parameters: canonicalJson?.metadata || {},
            tags: ["ai-generated", "confirmed"],
          }, null, 2));
          
          // Show detailed error message
          const errorMessage = errorData.error 
            || (errorData.detail ? JSON.stringify(errorData.detail) : null)
            || Object.entries(errorData).map(([key, value]) => `${key}: ${value}`).join(', ')
            || `Failed to save strategy: ${response.status}`;
          
          throw new Error(errorMessage);
        }

        const data = await response.json();
        
        console.log("✅ Strategy created successfully:", data);
        
        toast({
          title: "Strategy Saved",
          description: `${editedStrategyName} saved successfully. Redirecting to strategies page...`,
        });

        setShowConfirmDialog(false);
        
        // Navigate to strategy page to view all strategies
        // The newly created strategy will be visible in the list
        navigate('/strategy', { 
          state: { 
            newStrategyId: data.id,
            newStrategyName: editedStrategyName.trim(),
            showSuccessMessage: true
          } 
        });
      }
    } catch (error) {
      console.error("Error confirming strategy:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to confirm strategy",
        variant: "destructive",
      });
    } finally {
      setIsProceedingToNext(false);
    }
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
      <div className="flex flex-col h-full p-4 gap-4">
        {/* Header */}
        <div className="text-center flex-shrink-0">
          <h1 className="text-2xl font-bold text-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-6 h-6" />
            {strategyName}
          </h1>
          {editMode && (
            <p className="text-muted-foreground mt-1 text-xs">
              Editing strategy - Ask AI to help improve and optimize
            </p>
          )}
          {/* Conversation Memory Indicator */}
          {sessionId && (
            <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span>
                Conversation memory active • {messageCount} messages • Session: {sessionId.substring(0, 12)}...
              </span>
            </div>
          )}
        </div>

        {/* Chat Area - Fills available space */}
        <div className="flex-1 flex flex-col min-h-0">
          {!hasStartedChat && (
            <div className="text-center mb-6 space-y-3">
              <div className="w-10 h-10 mx-auto rounded-full bg-gradient-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h2 className="text-lg font-bold text-foreground">
                {editMode ? `Edit ${strategyName}` : "Ask AI about your trading"}
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-xs">
                {editMode 
                  ? "Describe the changes you want to make to your strategy. I can help optimize parameters, add new indicators, or improve risk management."
                  : "Get insights about your portfolio performance, optimize your bots, or analyze market conditions. Ask about strategy adjustments, risk management, or any trading questions you have."}
              </p>
              
              {/* Example Questions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4 max-w-xl mx-auto">
                {exampleQuestions.map((question, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="h-auto p-2.5 text-left justify-start hover:bg-secondary text-[11px]"
                    onClick={() => setInput(question)}
                  >
                    <span>{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Messages Area - Scrollable */}
          {messages.length > 0 && (
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4 pb-4 max-w-xl mx-auto">
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
                        <Sparkles className="w-3.5 h-3.5" />
                      ) : (
                        <span className="text-[10px] font-bold">U</span>
                      )}
                    </div>
                    <div
                      className={cn(
                        "flex-1 px-3 py-2.5 rounded-lg space-y-2",
                        message.role === "assistant"
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-primary text-primary-foreground"
                      )}
                    >
                      {/* Render markdown content */}
                      <MarkdownRenderer content={message.content} />
                      
                      {/* Display AI Metadata (Confidence, Warnings, etc.) */}
                      {message.metadata && message.role === "assistant" && (
                        <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
                          {/* Confidence Badge */}
                          {message.metadata.confidence && (
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                              <span className="text-[10px] font-medium">
                                Confidence: {message.metadata.confidence.toUpperCase()}
                              </span>
                            </div>
                          )}
                          
                          {/* Warnings - Configurable Display */}
                          {message.metadata.warnings && message.metadata.warnings.length > 0 && (
                            <div className="flex items-start gap-2">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-[10px] font-medium block mb-1">
                                  Warnings ({message.metadata.warnings.length})
                                </span>
                                <ul className="text-[10px] opacity-80 space-y-1">
                                  {(showFullWarnings[message.id] 
                                    ? message.metadata.warnings 
                                    : message.metadata.warnings.slice(0, 2)
                                  ).map((warning, i) => (
                                    <li key={i}>• {warning}</li>
                                  ))}
                                </ul>
                                {message.metadata.warnings.length > 2 && (
                                  <button
                                    onClick={() => setShowFullWarnings(prev => ({
                                      ...prev,
                                      [message.id]: !prev[message.id]
                                    }))}
                                    className="text-[10px] text-blue-500 hover:text-blue-600 mt-1 underline"
                                  >
                                    {showFullWarnings[message.id] 
                                      ? 'Show less' 
                                      : `Show ${message.metadata.warnings.length - 2} more...`}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {/* Recommendations - Configurable Display */}
                          {message.metadata.recommendations && message.metadata.recommendations.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Lightbulb className="w-3.5 h-3.5 text-blue-500 mt-0.5" />
                              <div className="flex-1">
                                <span className="text-[10px] font-medium block mb-1">
                                  AI Recommendations ({message.metadata.recommendations.length})
                                </span>
                                <ul className="text-[10px] opacity-80 space-y-1.5">
                                  {(showFullRecommendations[message.id] 
                                    ? message.metadata.recommendations 
                                    : message.metadata.recommendations.slice(0, 3)
                                  ).map((rec, i) => (
                                    <li key={i} className="space-y-0.5">
                                      <div className="font-medium">
                                        • {rec.title} <span className="text-[9px] opacity-60">({rec.priority})</span>
                                      </div>
                                      <div className="pl-3 opacity-70">{rec.rationale}</div>
                                    </li>
                                  ))}
                                </ul>
                                {message.metadata.recommendations.length > 3 && (
                                  <button
                                    onClick={() => setShowFullRecommendations(prev => ({
                                      ...prev,
                                      [message.id]: !prev[message.id]
                                    }))}
                                    className="text-[10px] text-blue-500 hover:text-blue-600 mt-1 underline"
                                  >
                                    {showFullRecommendations[message.id] 
                                      ? 'Show less' 
                                      : `Show ${message.metadata.recommendations.length - 3} more...`}
                                  </button>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Next Button for AI responses with strategy data */}
                      {message.role === "assistant" && message.strategyData && (
                        <div className="mt-4 pt-3 border-t border-border/50">
                          <Button
                            onClick={() => handleOpenConfirmation(message)}
                            className="w-full bg-gradient-primary hover:opacity-90 transition-opacity shadow-glow group"
                            size="sm"
                          >
                            <FileCheck className="w-4 h-4 mr-2" />
                            Review & Proceed to Next Step
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </div>
                      )}
                      
                      <p className="text-[10px] opacity-60 mt-2">
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
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    </div>
                    <div className="flex-1 px-3 py-2 rounded-lg bg-secondary text-secondary-foreground">
                      <p className="text-xs">Analyzing your strategy with AI...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Input Area - Fixed at bottom */}
          <div className="flex gap-2 pt-4 flex-shrink-0 max-w-xl mx-auto w-full">
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
        </div>
      </div>

      {/* Strategy Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <FileCheck className="w-6 h-6 text-primary" />
              Review & Name Your Strategy
            </DialogTitle>
            <DialogDescription>
              Give your strategy a name and review how it will be saved. Make sure all the details look correct before proceeding.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            {confirmationData && (
              <div className="space-y-4">
                {/* Editable Strategy Name */}
                <div className="space-y-2">
                  <label htmlFor="strategy-name" className="text-sm font-medium text-foreground flex items-center justify-between">
                    <span>Strategy Name *</span>
                    <span className="text-xs text-muted-foreground font-normal">
                      {editedStrategyName.length}/100
                    </span>
                  </label>
                  <Input
                    id="strategy-name"
                    value={editedStrategyName}
                    onChange={(e) => setEditedStrategyName(e.target.value.slice(0, 100))}
                    placeholder="e.g., RSI Mean Reversion Pro"
                    className={cn(
                      "text-lg font-semibold bg-background border-primary/30 focus:border-primary transition-colors",
                      !editedStrategyName.trim() && "border-destructive/50 focus:border-destructive"
                    )}
                    disabled={isProceedingToNext}
                    maxLength={100}
                  />
                  {confirmationData.strategyId && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Already saved with ID: {confirmationData.strategyId}
                    </p>
                  )}
                </div>

                {/* Human-Readable Strategy */}
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <MarkdownRenderer content={confirmationData.humanReadable} />
                  </CardContent>
                </Card>

                {/* AI Validation Summary */}
                {confirmationData.aiValidation && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Confidence */}
                    {confirmationData.aiValidation.confidence && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-success" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Confidence
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          {confirmationData.aiValidation.confidence.toUpperCase()}
                        </p>
                      </div>
                    )}

                    {/* Classification */}
                    {confirmationData.aiValidation.classification && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <Sparkles className="w-4 h-4 text-primary" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Type
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          {confirmationData.aiValidation.classification}
                        </p>
                      </div>
                    )}

                    {/* Warnings Count */}
                    {confirmationData.aiValidation.warnings && (
                      <div className="p-3 bg-secondary rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <AlertCircle className="w-4 h-4 text-warning" />
                          <span className="text-xs font-medium text-muted-foreground">
                            Warnings
                          </span>
                        </div>
                        <p className="text-sm font-semibold">
                          {confirmationData.aiValidation.warnings.length || 0} Issues
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Warnings Details */}
                {confirmationData.aiValidation?.warnings && 
                 confirmationData.aiValidation.warnings.length > 0 && (
                  <Card className="bg-warning/10 border-warning/30">
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Important Warnings
                      </h4>
                      <ul className="space-y-1 text-sm">
                        {confirmationData.aiValidation.warnings.map((warning: string, i: number) => (
                          <li key={i} className="flex items-start gap-2">
                            <span className="text-warning mt-0.5">•</span>
                            <span>{warning}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="flex-shrink-0 gap-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isProceedingToNext}
            >
              Go Back & Edit
            </Button>
            <Button
              onClick={handleConfirmAndProceed}
              disabled={isProceedingToNext}
              className="bg-gradient-primary shadow-glow group"
            >
              {isProceedingToNext ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Confirm & Proceed
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

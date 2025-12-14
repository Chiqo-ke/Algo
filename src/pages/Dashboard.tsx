import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Send, Sparkles, AlertCircle, Loader2, CheckCircle, ArrowRight, FileCheck, Lightbulb, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { WorkflowProgress } from "@/components/WorkflowProgress";
import { CodeGenerationStatus } from "@/components/CodeGenerationStatus";
import * as ProductionAPI from "@/lib/productionApi";
import { apiCall } from "@/lib/api";
import { codeGenerationService, type CodeGenerationRequest } from "@/lib/codeGenerationService";
import type { CodeGenerationProgress } from "@/lib/types";

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "failed" | "skipped";
  started_at: string | null;
  completed_at: string | null;
  error_message: string | null;
  substeps: string[];
  current_substep: string | null;
  progress_percentage: number;
}

interface WorkflowState {
  workflow_name: string;
  started_at: string;
  completed_at: string | null;
  steps: WorkflowStep[];
  current_step_index: number;
  progress_summary: {
    workflow_name: string;
    total_steps: number;
    completed_steps: number;
    failed_steps: number;
    in_progress_steps: number;
    overall_percentage: number;
    current_step_index: number;
    is_complete: boolean;
    duration_seconds: number;
  };
}

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
  workflow?: WorkflowState | null; // NEW: Track workflow progress
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
  
  // Backtest configuration fields
  const [backtestSymbol, setBacktestSymbol] = useState("AAPL");
  const [backtestPeriod, setBacktestPeriod] = useState("1y");
  const [backtestInterval, setBacktestInterval] = useState("1d");
  
  // NEW: Conversation memory state
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messageCount, setMessageCount] = useState(0);
  const [useContext, setUseContext] = useState(true);
  
  // NEW: Metadata display configuration
  const [showFullWarnings, setShowFullWarnings] = useState<Record<string, boolean>>({});
  const [showFullRecommendations, setShowFullRecommendations] = useState<Record<string, boolean>>({});
  
  // NEW: Workflow state
  const [currentWorkflow, setCurrentWorkflow] = useState<WorkflowState | null>(null);
  
  // NEW: Production features state
  const [productionHealth, setProductionHealth] = useState<ProductionAPI.HealthStatus | null>(null);
  const [showSandboxTest, setShowSandboxTest] = useState(false);
  const [sandboxResults, setSandboxResults] = useState<ProductionAPI.SandboxTestResponse | null>(null);
  const [showBacktestDialog, setShowBacktestDialog] = useState(false);
  const [backtestResults, setBacktestResults] = useState<ProductionAPI.BacktestResults | null>(null);
  // Lifecycle data will be used in Strategy.tsx
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [lifecycleData, setLifecycleData] = useState<ProductionAPI.LifecycleData | null>(null);
  
  // NEW: Code generation progress state
  const [codeGenProgress, setCodeGenProgress] = useState<CodeGenerationProgress | null>(null);
  const [showCodeGenProgress, setShowCodeGenProgress] = useState(false);

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

  // NEW: Validate strategy schema with Pydantic
  const validateStrategySchema = async (strategyData: any): Promise<boolean> => {
    try {
      const result = await ProductionAPI.validateStrategySchema(strategyData);
      
      if (result.status === "invalid") {
        toast({
          title: "❌ Schema Validation Failed",
          description: `${result.errors?.length || 0} validation errors found`,
          variant: "destructive",
        });
        console.error("Schema validation errors:", result.errors);
        return false;
      }
      
      console.log("✅ Schema validation passed");
      return true;
    } catch (error) {
      console.error("Schema validation error:", error);
      toast({
        title: "Validation Error",
        description: "Could not validate strategy schema",
        variant: "destructive",
      });
      return false;
    }
  };

  // NEW: Validate generated code for safety
  const validateCodeSafety = async (code: string): Promise<boolean> => {
    try {
      const result = await ProductionAPI.validateCodeSafety(code, true);
      
      if (!result.safe) {
        toast({
          title: "🚨 Dangerous Code Detected",
          description: `Found ${result.issues?.length || 0} security issues`,
          variant: "destructive",
        });
        console.error("Code safety issues:", result.issues);
        return false;
      }
      
      console.log("✅ Code safety check passed");
      return true;
    } catch (error) {
      console.error("Code safety validation error:", error);
      // Don't block on error, but warn
      toast({
        title: "⚠️ Safety Check Warning",
        description: "Could not validate code safety",
      });
      return true; // Allow to proceed with warning
    }
  };

  // NEW: Run sandbox test
  // Will be used when adding test buttons to strategy cards
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const runSandboxTest = async (strategyId: number) => {
    try {
      setShowSandboxTest(true);
      toast({
        title: "🐳 Running Sandbox Test",
        description: "Testing strategy in isolated environment...",
      });

      const result = await ProductionAPI.runSandboxTest(strategyId, 60);
      setSandboxResults(result);

      if (result.success) {
        toast({
          title: "✅ Sandbox Test Passed",
          description: `Execution time: ${result.execution_time.toFixed(2)}s`,
        });
      } else {
        toast({
          title: "❌ Sandbox Test Failed",
          description: result.errors || "Test execution failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Sandbox test error:", error);
      toast({
        title: "Test Error",
        description: "Failed to run sandbox test",
        variant: "destructive",
      });
    }
  };

  // NEW: Run backtest
  // Will be used when adding backtest buttons
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const runBacktest = async (strategyId: number, configId: number) => {
    try {
      setShowBacktestDialog(true);
      toast({
        title: "📊 Running Backtest",
        description: "Analyzing strategy performance...",
      });

      const result = await ProductionAPI.runBacktestSandbox(
        strategyId,
        configId,
        "2024-01-01",
        "2024-12-31",
        ["AAPL"],
        { cpu: "1.0", memory: "1g", timeout: 300 }
      );

      setBacktestResults(result);

      if (result.status === "completed") {
        toast({
          title: "✅ Backtest Complete",
          description: `Total Return: ${((result.results?.total_return || 0) * 100).toFixed(2)}%`,
        });
      } else {
        toast({
          title: "❌ Backtest Failed",
          description: result.error || "Backtest execution failed",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Backtest error:", error);
      toast({
        title: "Backtest Error",
        description: "Failed to run backtest",
        variant: "destructive",
      });
    }
  };

  // NEW: Get lifecycle status
  // Will be used in Strategy.tsx for status tracking
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchLifecycleStatus = async (strategyId: number) => {
    try {
      const data = await ProductionAPI.getStrategyLifecycle(strategyId);
      setLifecycleData(data);
    } catch (error) {
      console.error("Failed to fetch lifecycle data:", error);
    }
  };

  // NEW: Check production health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const health = await ProductionAPI.checkStrategyHealth();
        setProductionHealth(health);
        
        if (health.overall === "unhealthy") {
          toast({
            title: "⚠️ Production Components Degraded",
            description: "Some features may be limited",
          });
        }
      } catch (error) {
        console.error("Health check failed:", error);
      }
    };

    checkHealth();
  }, []);

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
        const result = await apiCall(
          `${API_BASE_URL}/api/strategies/api/${strategyId}/update_strategy_with_ai/`,
          {
            method: "PUT",
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

        if (result.error) {
          throw new Error(result.error);
        }

        const data = result.data;
        
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
          workflow: data.workflow || null, // NEW: Capture workflow state
        };
        
        // Update current workflow display
        if (data.workflow) {
          setCurrentWorkflow(data.workflow);
        }
        
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

        // Use apiCall helper which includes authentication
        const result = await apiCall(endpoint, {
          method: "POST",
          body: JSON.stringify(payload),
        });

        if (result.error) {
          throw new Error(result.error);
        }

        const data = result.data;
        
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
          workflow: data.workflow || null, // NEW: Capture workflow state
        };
        
        // Update current workflow display
        if (data.workflow) {
          setCurrentWorkflow(data.workflow);
        }
        
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
            const updateResult = await apiCall(
              `${API_BASE_URL}/api/strategies/api/strategies/${confirmationData.strategyId}/`,
              {
                method: "PATCH",
                body: JSON.stringify({
                  name: editedStrategyName.trim(),
                }),
              }
            );

            if (updateResult.error) {
              console.warn("Failed to update strategy name, continuing anyway");
            }
          } catch (e) {
            console.warn("Failed to update strategy name:", e);
          }
        }
        
        // 🔒 PRODUCTION: Validate schema before code generation
        // TODO: Transform canonical JSON to StrategyDefinition schema format
        // The canonical JSON from Strategy validator has a different structure than
        // the StrategyDefinition Pydantic model expects
        console.log("⚠️ Skipping production schema validation (schema format mismatch)");
        // const isSchemaValid = await validateStrategySchema(confirmationData.canonicalJson);
        // if (!isSchemaValid) {
        //   console.error("❌ Schema validation failed, aborting code generation");
        //   setIsProceedingToNext(false);
        //   return;
        // }
        // console.log("✅ Schema validation passed");
        
        // Generate executable code with automatic validation and error fixing
        console.log("🔧 Generating executable strategy code with auto-fix...");
        
        // Show progress to user
        toast({
          title: "Generating Code",
          description: "Generating and validating your strategy...",
        });
        
        try {
          // Use the new auto-fix endpoint that handles validation and fixing
          const codeGenResult = await apiCall(
            `${API_BASE_URL}/api/strategies/api/generate_executable_code/`,
            {
              method: "POST",
              body: JSON.stringify({
                canonical_json: confirmationData.canonicalJson,
                strategy_name: editedStrategyName.trim(),
                strategy_id: confirmationData.strategyId,
                test_config: {
                  symbol: backtestSymbol,
                  period: backtestPeriod,
                  interval: backtestInterval,
                },
              }),
            }
          );

          if (!codeGenResult.error && codeGenResult.data) {
            const codeGenData = codeGenResult.data;
            console.log("✅ Strategy code generated:", codeGenData.file_name);
            
            // Check execution results if available
            if (codeGenData.execution) {
              console.log("📊 Execution results:", codeGenData.execution);
              
              if (!codeGenData.execution.success) {
                console.warn("⚠️ Strategy execution failed:", codeGenData.execution.error_message);
                
                // Check if error fixing was attempted
                if (codeGenData.error_fixing && codeGenData.error_fixing.attempted) {
                  const fixAttempts = codeGenData.error_fixing.attempts || 0;
                  const fixStatus = codeGenData.error_fixing.final_status;
                  
                  toast({
                    title: "Code Generation Complete",
                    description: `Generated code with ${fixAttempts} fix attempt(s). Status: ${fixStatus}`,
                    variant: fixStatus === 'fixed' ? 'default' : 'destructive',
                  });
                  
                  if (fixStatus !== 'fixed') {
                    // Show error details and don't navigate
                    console.error("❌ Failed to fix errors after", fixAttempts, "attempts");
                    setIsProceedingToNext(false);
                    return;
                  }
                } else {
                  // No auto-fix, just warn but allow proceeding
                  toast({
                    title: "Validation Warning",
                    description: "Code generated but not validated. Proceed with caution.",
                    variant: "destructive",
                  });
                }
              } else {
                // Execution successful!
                console.log("✅ Strategy validated successfully!");
                if (codeGenData.execution.metrics) {
                  console.log("📈 Metrics:", codeGenData.execution.metrics);
                }
              }
            }
            
            toast({
              title: "Strategy Ready",
              description: `${editedStrategyName} is ready for backtesting!`,
            });
            
            setShowConfirmDialog(false);
            
            // Navigate to backtesting page with strategy ID, code file info, and backtest config
            navigate(`/backtesting/${confirmationData.strategyId}`, { 
              state: { 
                strategyId: confirmationData.strategyId,
                strategyName: editedStrategyName.trim(),
                codeFilePath: codeGenData.file_path,
                codeFileName: codeGenData.file_name,
                executionResults: codeGenData.execution,
                backtestConfig: {
                  symbol: backtestSymbol,
                  period: backtestPeriod,
                  interval: backtestInterval
                }
              } 
            });
          } else {
            console.warn("⚠️ Code generation failed, proceeding without executable code");
            
            toast({
              title: "Strategy Confirmed",
              description: `Proceeding with ${editedStrategyName}`,
            });
            
            setShowConfirmDialog(false);
            
            // Navigate to backtesting page with strategy ID and backtest config
            navigate(`/backtesting/${confirmationData.strategyId}`, { 
              state: { 
                strategyId: confirmationData.strategyId,
                strategyName: editedStrategyName.trim(),
                backtestConfig: {
                  symbol: backtestSymbol,
                  period: backtestPeriod,
                  interval: backtestInterval
                }
              } 
            });
          }
        } catch (codeGenError) {
          console.error("❌ Code generation error:", codeGenError);
          
          toast({
            title: "Strategy Confirmed",
            description: `Proceeding with ${editedStrategyName}`,
          });
          
          setShowConfirmDialog(false);
          
          // Navigate to backtesting page with strategy ID and backtest config
          navigate(`/backtesting/${confirmationData.strategyId}`, { 
            state: { 
              strategyId: confirmationData.strategyId,
              strategyName: editedStrategyName.trim(),
              backtestConfig: {
                symbol: backtestSymbol,
                period: backtestPeriod,
                interval: backtestInterval
              }
            } 
          });
        }
        
      } else {
        console.log("💾 Creating new strategy with canonical JSON");
        
        // Extract metadata from canonical JSON for proper categorization
        const canonicalJson = confirmationData.canonicalJson;
        const classification = confirmationData.aiValidation?.classification_detail || {};
        
        // 🔒 PRODUCTION: Validate schema before creating strategy
        // TODO: Transform canonical JSON to StrategyDefinition schema format
        console.log("⚠️ Skipping production schema validation (schema format mismatch)");
        // const isSchemaValid = await validateStrategySchema(canonicalJson);
        // if (!isSchemaValid) {
        //   console.error("❌ Schema validation failed, aborting strategy creation");
        //   setIsProceedingToNext(false);
        //   return;
        // }
        // console.log("✅ Schema validation passed");
        
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
        const result = await apiCall(
          `${API_BASE_URL}/api/strategies/api/create_strategy/`,
          {
            method: "POST",
            body: JSON.stringify(payload),
          }
        );

        if (result.error) {
          console.error("❌ Create strategy failed:", result.error);
          console.error("Payload sent:", JSON.stringify({
            name: editedStrategyName.trim(),
            description: canonicalJson?.description || `Strategy confirmed on ${new Date().toLocaleDateString()}`,
            strategy_code: JSON.stringify(canonicalJson),
            parameters: canonicalJson?.metadata || {},
            tags: ["ai-generated", "confirmed"],
          }, null, 2));
          
          throw new Error(result.error);
        }

        const data = result.data;
        
        console.log("✅ Strategy created successfully:", data);
        
        // Generate executable code from canonical JSON
        console.log("🔧 Generating executable strategy code...");
        
        try {
          const codeGenResult = await apiCall(
            `${API_BASE_URL}/api/strategies/api/generate_executable_code/`,
            {
              method: "POST",
              body: JSON.stringify({
                canonical_json: confirmationData.canonicalJson,
                strategy_name: editedStrategyName.trim(),
                strategy_id: data.id,
              }),
            }
          );

          if (!codeGenResult.error && codeGenResult.data) {
            const codeGenData = codeGenResult.data;
            console.log("✅ Strategy code generated:", codeGenData.file_name);
            
            // Check execution results if available
            if (codeGenData.execution) {
              console.log("📊 Execution results:", codeGenData.execution);
              
              if (!codeGenData.execution.success) {
                console.warn("⚠️ Strategy execution failed:", codeGenData.execution.error_message);
                
                // Check if error fixing was attempted
                if (codeGenData.error_fixing && codeGenData.error_fixing.attempted) {
                  const fixAttempts = codeGenData.error_fixing.attempts || 0;
                  const fixStatus = codeGenData.error_fixing.final_status;
                  
                  toast({
                    title: "Code Generation Complete",
                    description: `Generated code with ${fixAttempts} fix attempt(s). Status: ${fixStatus}`,
                    variant: fixStatus === 'fixed' ? 'default' : 'destructive',
                  });
                  
                  if (fixStatus !== 'fixed') {
                    console.error("❌ Failed to fix errors after", fixAttempts, "attempts");
                    // Navigate to strategy list instead
                    navigate('/strategy', { 
                      state: { 
                        newStrategyId: data.id,
                        newStrategyName: editedStrategyName.trim(),
                        showSuccessMessage: false,
                        errorMessage: 'Code validation failed'
                      } 
                    });
                    setIsProceedingToNext(false);
                    return;
                  }
                }
              } else {
                console.log("✅ Strategy validated successfully!");
                if (codeGenData.execution.metrics) {
                  console.log("📈 Metrics:", codeGenData.execution.metrics);
                }
              }
            }
            
            toast({
              title: "Strategy Ready",
              description: `${editedStrategyName} is ready! Code generated at ${codeGenData.file_name}`,
            });

            setShowConfirmDialog(false);
            
            // Navigate to backtesting page with strategy info and backtest config
            navigate(`/backtesting/${data.id}`, { 
              state: { 
                strategyId: data.id,
                strategyName: editedStrategyName.trim(),
                codeFilePath: codeGenData.file_path,
                codeFileName: codeGenData.file_name,
                executionResults: codeGenData.execution,
                fromNewStrategy: true,
                backtestConfig: {
                  symbol: backtestSymbol,
                  period: backtestPeriod,
                  interval: backtestInterval
                }
              } 
            });
          } else {
            console.warn("⚠️ Code generation failed, proceeding to strategies page");
            
            toast({
              title: "Strategy Saved",
              description: `${editedStrategyName} saved successfully. Redirecting to strategies page...`,
            });

            setShowConfirmDialog(false);
            
            // Navigate to strategy page to view all strategies
            navigate('/strategy', { 
              state: { 
                newStrategyId: data.id,
                newStrategyName: editedStrategyName.trim(),
                showSuccessMessage: true
              } 
            });
          }
        } catch (codeGenError) {
          console.error("❌ Code generation error:", codeGenError);
          
          toast({
            title: "Strategy Saved",
            description: `${editedStrategyName} saved successfully. Redirecting to strategies page...`,
          });

          setShowConfirmDialog(false);
          
          // Navigate to strategy page to view all strategies
          navigate('/strategy', { 
            state: { 
              newStrategyId: data.id,
              newStrategyName: editedStrategyName.trim(),
              showSuccessMessage: true
            } 
          });
        }
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
          
          {/* Production Health Indicator */}
          {productionHealth && (
            <div className="mt-3 flex items-center justify-center gap-2">
              <div className={cn(
                "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border",
                ProductionAPI.isProductionHealthy(productionHealth) 
                  ? "bg-green-500/10 border-green-500/30 text-green-700"
                  : productionHealth.overall === 'degraded'
                  ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-700"
                  : "bg-red-500/10 border-red-500/30 text-red-700"
              )}>
                <span className={cn(
                  "w-2 h-2 rounded-full",
                  ProductionAPI.isProductionHealthy(productionHealth) ? "bg-green-500" :
                  productionHealth.overall === 'degraded' ? "bg-yellow-500" : "bg-red-500"
                )} />
                Production System: {productionHealth.overall.toUpperCase()}
                {productionHealth.error && (
                  <span className="ml-1 opacity-75">• {productionHealth.error}</span>
                )}
              </div>
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
                {/* Active Workflow Progress (shown while loading) */}
                {isLoading && currentWorkflow && (
                  <div className="sticky top-0 z-10 mb-4">
                    <WorkflowProgress workflow={currentWorkflow} isLoading={true} />
                  </div>
                )}
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
                      
                      {/* Display AI Metadata removed: fixed and not needed */}

                      {/* Workflow Progress Display */}
                      {message.role === "assistant" && message.workflow && (
                        <div className="mt-4">
                          <WorkflowProgress workflow={message.workflow} />
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

                {/* Backtest Configuration Section */}
                <div className="space-y-3 p-4 bg-secondary/50 rounded-lg border border-border">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" />
                    Backtest Configuration
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Symbol */}
                    <div className="space-y-1.5">
                      <Label htmlFor="backtest-symbol" className="text-xs">Symbol/Ticker</Label>
                      <Input
                        id="backtest-symbol"
                        value={backtestSymbol}
                        onChange={(e) => setBacktestSymbol(e.target.value.toUpperCase())}
                        placeholder="AAPL"
                        className="uppercase"
                        disabled={isProceedingToNext}
                      />
                    </div>

                    {/* Period */}
                    <div className="space-y-1.5">
                      <Label htmlFor="backtest-period" className="text-xs">Period</Label>
                      <Select value={backtestPeriod} onValueChange={setBacktestPeriod} disabled={isProceedingToNext}>
                        <SelectTrigger id="backtest-period">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1mo">1 Month</SelectItem>
                          <SelectItem value="3mo">3 Months</SelectItem>
                          <SelectItem value="6mo">6 Months</SelectItem>
                          <SelectItem value="1y">1 Year</SelectItem>
                          <SelectItem value="2y">2 Years</SelectItem>
                          <SelectItem value="5y">5 Years</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Interval */}
                    <div className="space-y-1.5">
                      <Label htmlFor="backtest-interval" className="text-xs">Interval</Label>
                      <Select value={backtestInterval} onValueChange={setBacktestInterval} disabled={isProceedingToNext}>
                        <SelectTrigger id="backtest-interval">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1m">1 Minute</SelectItem>
                          <SelectItem value="5m">5 Minutes</SelectItem>
                          <SelectItem value="15m">15 Minutes</SelectItem>
                          <SelectItem value="1h">1 Hour</SelectItem>
                          <SelectItem value="1d">1 Day</SelectItem>
                          <SelectItem value="1wk">1 Week</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Human-Readable Strategy */}
                <Card className="bg-card border-border">
                  <CardContent className="pt-6">
                    <MarkdownRenderer content={confirmationData.humanReadable} />
                  </CardContent>
                </Card>
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

      {/* Sandbox Test Results Dialog */}
      <Dialog open={showSandboxTest} onOpenChange={setShowSandboxTest}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Sandbox Test Results
            </DialogTitle>
            <DialogDescription>
              Strategy execution in isolated Docker environment
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {sandboxResults && (
              <>
                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  {sandboxResults.status === 'completed' ? (
                    <span className="px-3 py-1 bg-green-500/20 text-green-600 rounded-full text-sm font-semibold flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      Completed
                    </span>
                  ) : sandboxResults.status === 'failed' ? (
                    <span className="px-3 py-1 bg-red-500/20 text-red-600 rounded-full text-sm font-semibold flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      Failed
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-yellow-500/20 text-yellow-600 rounded-full text-sm font-semibold">
                      {sandboxResults.status}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground ml-auto">
                    Execution time: {sandboxResults.execution_time}s
                  </span>
                </div>

                {/* Output */}
                {sandboxResults.output && (
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-semibold mb-2">Output:</h4>
                      <pre className="text-xs bg-secondary p-3 rounded overflow-x-auto">
                        {sandboxResults.output}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Error */}
                {sandboxResults.errors && (
                  <Card className="border-destructive/30">
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-semibold mb-2 text-destructive">Errors:</h4>
                      <pre className="text-xs bg-destructive/10 p-3 rounded overflow-x-auto text-destructive">
                        {sandboxResults.errors}
                      </pre>
                    </CardContent>
                  </Card>
                )}

                {/* Resource Usage */}
                {sandboxResults.resource_usage && (
                  <Card>
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-semibold mb-3">Resource Usage:</h4>
                      <div className="grid grid-cols-2 gap-4">
                        {sandboxResults.resource_usage.max_memory_mb && (
                          <div>
                            <span className="text-xs text-muted-foreground">Memory:</span>
                            <p className="text-sm font-semibold">{sandboxResults.resource_usage.max_memory_mb} MB</p>
                          </div>
                        )}
                        {sandboxResults.resource_usage.cpu_percent && (
                          <div>
                            <span className="text-xs text-muted-foreground">CPU:</span>
                            <p className="text-sm font-semibold">{sandboxResults.resource_usage.cpu_percent}%</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Timed Out Warning */}
                {sandboxResults.timed_out && (
                  <Card className="border-warning/30">
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-warning" />
                        Execution Timed Out
                      </h4>
                      <p className="text-sm">The strategy execution exceeded the allowed time limit.</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowSandboxTest(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backtest Results Dialog */}
      <Dialog open={showBacktestDialog} onOpenChange={setShowBacktestDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Backtest Results
            </DialogTitle>
            <DialogDescription>
              Historical performance metrics
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4 space-y-4">
            {backtestResults && (
              <>
                {/* Status */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Status:</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-sm font-semibold",
                    backtestResults.status === 'completed' && "bg-green-500/20 text-green-600",
                    backtestResults.status === 'failed' && "bg-red-500/20 text-red-600"
                  )}>
                    {backtestResults.status}
                  </span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    Execution time: {backtestResults.execution_time}s
                  </span>
                </div>

                {/* Performance Metrics */}
                {backtestResults.results && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {backtestResults.results.total_return !== undefined && (
                      <Card>
                        <CardContent className="pt-4">
                          <span className="text-xs text-muted-foreground">Total Return</span>
                          <p className={cn(
                            "text-lg font-bold",
                            backtestResults.results.total_return >= 0 ? "text-green-600" : "text-red-600"
                          )}>
                            {backtestResults.results.total_return}%
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {backtestResults.results.sharpe_ratio !== undefined && (
                      <Card>
                        <CardContent className="pt-4">
                          <span className="text-xs text-muted-foreground">Sharpe Ratio</span>
                          <p className="text-lg font-bold">{backtestResults.results.sharpe_ratio}</p>
                        </CardContent>
                      </Card>
                    )}
                    {backtestResults.results.max_drawdown !== undefined && (
                      <Card>
                        <CardContent className="pt-4">
                          <span className="text-xs text-muted-foreground">Max Drawdown</span>
                          <p className="text-lg font-bold text-red-600">
                            {backtestResults.results.max_drawdown}%
                          </p>
                        </CardContent>
                      </Card>
                    )}
                    {backtestResults.results.win_rate !== undefined && (
                      <Card>
                        <CardContent className="pt-4">
                          <span className="text-xs text-muted-foreground">Win Rate</span>
                          <p className="text-lg font-bold">{backtestResults.results.win_rate}%</p>
                        </CardContent>
                      </Card>
                    )}
                  </div>
                )}

                {/* Error */}
                {backtestResults.error && (
                  <Card className="border-destructive/30">
                    <CardContent className="pt-4">
                      <h4 className="text-sm font-semibold mb-2 text-destructive">Error:</h4>
                      <p className="text-sm text-destructive">{backtestResults.error}</p>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>

          <DialogFooter>
            <Button onClick={() => setShowBacktestDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}

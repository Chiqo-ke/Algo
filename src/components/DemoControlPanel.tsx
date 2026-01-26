import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ScrollArea } from "./ui/scroll-area";
import {
  Video,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Play,
  CheckCircle2,
  Circle,
  AlertCircle,
} from "lucide-react";
import {
  DEMO_SCENARIOS,
  STRATEGY_PROMPT_TEMPLATES,
  BACKTEST_TEMPLATES,
  demoMode,
  type DemoScenario,
} from "@/lib/demoTemplates";
import { cn } from "@/lib/utils";

export function DemoControlPanel() {
  const [selectedScenario, setSelectedScenario] = useState<DemoScenario | null>(null);
  const [currentStep, setCurrentStep] = useState(0);

  const handleSelectScenario = (scenario: DemoScenario) => {
    setSelectedScenario(scenario);
    setCurrentStep(0);
    demoMode.enable();
    demoMode.setScenario(scenario.id);
  };

  const handleNextStep = () => {
    if (selectedScenario && currentStep < selectedScenario.steps.length - 1) {
      setCurrentStep(currentStep + 1);
      demoMode.nextStep();
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      demoMode.previousStep();
    }
  };

  const handleReset = () => {
    setSelectedScenario(null);
    setCurrentStep(0);
    demoMode.disable();
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Video className="w-6 h-6 text-primary" />
            Demo Control Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Guided scenarios for creating professional demo videos
          </p>
        </div>
        {selectedScenario && (
          <Button variant="outline" onClick={handleReset}>
            Reset Demo
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Scenario Selection */}
        <Card className={cn("lg:col-span-1", selectedScenario && "opacity-50")}>
          <CardHeader>
            <CardTitle className="text-lg">Demo Scenarios</CardTitle>
            <CardDescription>Choose a walkthrough script</CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <div className="space-y-2 pr-4">
                {DEMO_SCENARIOS.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={cn(
                      "p-3 border rounded-lg cursor-pointer transition-all",
                      selectedScenario?.id === scenario.id
                        ? "bg-primary text-primary-foreground border-primary"
                        : "hover:bg-accent"
                    )}
                    onClick={() => handleSelectScenario(scenario)}
                  >
                    <h4 className="font-semibold text-sm mb-1">{scenario.name}</h4>
                    <p className="text-xs opacity-80 mb-2">{scenario.description}</p>
                    <div className="flex items-center gap-2 text-xs">
                      <Play className="w-3 h-3" />
                      <span>{scenario.steps.length} steps</span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Step-by-Step Guide */}
        {selectedScenario ? (
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedScenario.name}</CardTitle>
                  <CardDescription>
                    Step {currentStep + 1} of {selectedScenario.steps.length}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleNextStep}
                    disabled={currentStep === selectedScenario.steps.length - 1}
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-primary h-full transition-all duration-300"
                    style={{
                      width: `${((currentStep + 1) / selectedScenario.steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Current Step Details */}
              <div className="p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                <div className="flex items-start gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold flex-shrink-0">
                    {currentStep + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">
                      {selectedScenario.steps[currentStep].title}
                    </h3>
                    <p className="text-muted-foreground">
                      {selectedScenario.steps[currentStep].action}
                    </p>
                  </div>
                </div>

                {/* Template Hint */}
                {selectedScenario.steps[currentStep].templateId && (
                  <div className="mt-4 p-3 bg-background/50 rounded border">
                    <div className="flex items-center gap-2 text-sm">
                      <Sparkles className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">Template Available:</span>
                      <code className="text-xs bg-secondary px-2 py-1 rounded">
                        {selectedScenario.steps[currentStep].templateId}
                      </code>
                    </div>
                  </div>
                )}
              </div>

              {/* All Steps Overview */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium">All Steps</h4>
                <div className="space-y-2">
                  {selectedScenario.steps.map((step, idx) => (
                    <div
                      key={step.step}
                      className={cn(
                        "flex items-start gap-3 p-2 rounded-lg transition-colors",
                        idx === currentStep && "bg-accent",
                        idx < currentStep && "opacity-50"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {idx < currentStep ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : idx === currentStep ? (
                          <AlertCircle className="w-5 h-5 text-primary animate-pulse" />
                        ) : (
                          <Circle className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="lg:col-span-2">
            <CardContent className="flex flex-col items-center justify-center h-96 text-center">
              <Video className="w-16 h-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a Demo Scenario</h3>
              <p className="text-muted-foreground max-w-md">
                Choose a walkthrough script from the left to begin creating your demo video.
                Each scenario includes step-by-step guidance and pre-configured templates.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Template Reference Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strategy Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Available Strategy Templates
            </CardTitle>
            <CardDescription>
              {STRATEGY_PROMPT_TEMPLATES.length} pre-configured strategy prompts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {STRATEGY_PROMPT_TEMPLATES.slice(0, 3).map((template) => (
                <div key={template.id} className="p-2 border rounded text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{template.name}</span>
                    <Badge
                      variant={
                        template.category === "beginner"
                          ? "default"
                          : template.category === "intermediate"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {template.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              ))}
              <Button variant="link" className="w-full text-xs">
                View all {STRATEGY_PROMPT_TEMPLATES.length} templates
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Backtest Templates */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Available Backtest Templates
            </CardTitle>
            <CardDescription>
              {BACKTEST_TEMPLATES.length} pre-configured backtest scenarios
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {BACKTEST_TEMPLATES.slice(0, 3).map((template) => (
                <div key={template.id} className="p-2 border rounded text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{template.name}</span>
                    <Badge variant="outline">{template.symbol}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{template.description}</p>
                </div>
              ))}
              <Button variant="link" className="w-full text-xs">
                View all {BACKTEST_TEMPLATES.length} templates
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

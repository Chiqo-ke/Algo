import { MessageSquare, Code2, BarChart4, ArrowRight, X } from "lucide-react";
import { useState } from "react";

export const HowItWorks = () => {
  const [showExample, setShowExample] = useState(false);
  const steps = [
    {
      number: 1,
      icon: MessageSquare,
      title: "Describe your idea",
      description: "Explain your trading rules in plain English — the same way you'd explain it to another trader.",
      color: "from-blue-500 to-cyan-500",
      example: `I want to create a simple EMA crossover trading strategy.

Use two exponential moving averages:
• One EMA with a period of 30
• One EMA with a period of 70

Entry rules:
• Open a buy (long) trade when the 30 EMA crosses above the 70 EMA
• Open a sell (short) trade when the 30 EMA crosses below the 70 EMA

Risk management:
• Set a stop loss at 15 pips away from the entry price
• Set a take profit at 70 pips away from the entry price

Only one trade should be open at a time.`
    },
    {
      number: 2,
      icon: Code2,
      title: "Strategy construction",
      description: "Algo converts your description into structured logic and prepares it for testing.",
      color: "from-purple-500 to-pink-500"
    },
    {
      number: 3,
      icon: BarChart4,
      title: "Backtest and refine",
      description: "Analyze historical performance, adjust rules if needed, and repeat the process. (Live execution will be optional and introduced later.)",
      color: "from-orange-500 to-red-500"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              From idea to tested bot in three simple steps
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-full w-full -ml-4 -mr-4">
                    <ArrowRight className="w-8 h-8 text-teal-500/30 mx-auto" />
                  </div>
                )}

                {/* Step card */}
                <div className="relative group">
                  <div className="absolute inset-0 bg-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl blur-xl" />
                  <div className="relative bg-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-teal-500/50 transition-all duration-300">
                    {/* Step number */}
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-teal-500/20 border border-teal-500/30 text-teal-400 font-bold text-lg mb-6">
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="w-16 h-16 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-6">
                      <step.icon className="w-8 h-8 text-teal-400" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed">
                      {step.description}
                    </p>
                    
                    {step.example && (
                      <button
                        onClick={() => setShowExample(true)}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all duration-300 text-sm font-medium"
                      >
                        <MessageSquare className="w-4 h-4" />
                        See Example
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Example Modal */}
      {showExample && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setShowExample(false)}
        >
          <div 
            className="relative max-w-2xl w-full bg-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={() => setShowExample(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-gray-600 transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Modal content */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
                  <MessageSquare className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">Strategy Example</h3>
                  <p className="text-sm text-gray-400">EMA Crossover Strategy</p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gray-950/50 border border-gray-700/30">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line font-mono text-sm">
                  {steps[0].example}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-400">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                <span>Click anywhere outside to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

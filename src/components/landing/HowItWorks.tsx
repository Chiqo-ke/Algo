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
      svgElement: (
        <svg className="absolute -right-4 -top-4 w-24 h-24 opacity-10" viewBox="0 0 100 100">
          <path d="M20 30 Q50 10 80 30 T80 70 Q50 90 20 70 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-blue-400" />
          <circle cx="30" cy="40" r="3" fill="currentColor" className="text-cyan-400 animate-pulse" />
          <circle cx="50" cy="35" r="3" fill="currentColor" className="text-cyan-400 animate-pulse" style={{ animationDelay: '0.3s' }} />
          <circle cx="70" cy="40" r="3" fill="currentColor" className="text-cyan-400 animate-pulse" style={{ animationDelay: '0.6s' }} />
        </svg>
      ),
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
      color: "from-purple-500 to-pink-500",
      svgElement: (
        <svg className="absolute -right-4 -top-4 w-24 h-24 opacity-10" viewBox="0 0 100 100">
          <rect x="20" y="20" width="60" height="60" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-400" />
          <line x1="30" y1="35" x2="50" y2="35" stroke="currentColor" strokeWidth="2" className="text-pink-400" />
          <line x1="30" y1="45" x2="60" y2="45" stroke="currentColor" strokeWidth="2" className="text-pink-400" />
          <line x1="30" y1="55" x2="45" y2="55" stroke="currentColor" strokeWidth="2" className="text-pink-400" />
          <circle cx="70" cy="70" r="8" fill="none" stroke="currentColor" strokeWidth="1" className="text-purple-400 animate-spin" style={{ animationDuration: '4s' }} />
        </svg>
      )
    },
    {
      number: 3,
      icon: BarChart4,
      title: "Backtest and refine",
      description: "Analyze historical performance, adjust rules if needed, and repeat the process. (Live execution will be optional and introduced later.)",
      color: "from-orange-500 to-red-500",
      svgElement: (
        <svg className="absolute -right-4 -top-4 w-24 h-24 opacity-10" viewBox="0 0 100 100">
          <path d="M20 80 L30 60 L40 70 L50 40 L60 50 L70 30 L80 45" fill="none" stroke="currentColor" strokeWidth="2" className="text-orange-400" />
          <circle cx="50" cy="40" r="4" fill="currentColor" className="text-red-400 animate-pulse" />
          <line x1="20" y1="80" x2="80" y2="80" stroke="currentColor" strokeWidth="1" className="text-orange-400" />
          <line x1="20" y1="80" x2="20" y2="20" stroke="currentColor" strokeWidth="1" className="text-orange-400" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-800 relative overflow-hidden">
      {/* Futuristic background pattern */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="workflow-pattern" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
              <circle cx="40" cy="40" r="1" fill="#14b8a6" />
              <circle cx="0" cy="0" r="1" fill="#14b8a6" />
              <circle cx="80" cy="0" r="1" fill="#14b8a6" />
              <circle cx="0" cy="80" r="1" fill="#14b8a6" />
              <circle cx="80" cy="80" r="1" fill="#14b8a6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#workflow-pattern)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header with futuristic styling */}
          <div className="text-center mb-16 relative">
            <div className="inline-block relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 relative z-10">
                How It Works
              </h2>
              <div className="absolute inset-0 blur-2xl bg-teal-500/10 animate-glow" />
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              From idea to tested bot in three simple steps
            </p>
            
            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-teal-500" />
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-teal-500" />
            </div>
          </div>

          {/* Steps with enhanced design */}
          <div className="grid md:grid-cols-3 gap-8 relative">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector arrow (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-20 left-full w-full -ml-4 -mr-4 z-0">
                    <div className="relative flex items-center justify-center">
                      <div className="h-px w-full bg-gradient-to-r from-teal-500/50 to-teal-500/20" />
                      <ArrowRight className="absolute w-8 h-8 text-teal-500/50 animate-pulse" style={{ animationDuration: '2s', animationDelay: `${index * 0.3}s` }} />
                    </div>
                  </div>
                )}

                {/* Step card with futuristic design */}
                <div className="relative group h-full">
                  {/* Outer glow effect */}
                  <div className="absolute -inset-1 bg-gradient-to-br from-teal-500/0 to-teal-500/0 group-hover:from-teal-500/20 group-hover:to-cyan-500/20 rounded-2xl blur-xl transition-all duration-500 opacity-0 group-hover:opacity-100" />
                  
                  <div className="relative bg-gray-900/50 p-8 rounded-2xl border border-gray-700/50 backdrop-blur-sm hover:border-teal-500/50 transition-all duration-300 h-full overflow-hidden">
                    {/* Background SVG illustration */}
                    {step.svgElement}
                    
                    {/* Corner decorations */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-teal-500/30 rounded-tl-2xl" />
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-teal-500/30 rounded-br-2xl" />
                    
                    {/* Step number with enhanced styling */}
                    <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-teal-500/20 border-2 border-teal-500/40 text-teal-400 font-display font-bold text-xl mb-6 relative group-hover:scale-110 transition-transform duration-300">
                      {step.number}
                      <div className="absolute inset-0 rounded-full bg-teal-500/20 animate-ping opacity-0 group-hover:opacity-75" />
                    </div>

                    {/* Icon with animated container */}
                    <div className="w-16 h-16 rounded-xl bg-gray-800/50 border border-gray-700/50 flex items-center justify-center mb-6 group-hover:border-teal-500/50 transition-all duration-300 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      <step.icon className="w-8 h-8 text-teal-400 relative z-10 group-hover:scale-110 transition-transform" />
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-display font-bold text-white mb-3 relative z-10">
                      {step.title}
                    </h3>
                    <p className="text-gray-300 leading-relaxed relative z-10">
                      {step.description}
                    </p>
                    
                    {step.example && (
                      <button
                        onClick={() => setShowExample(true)}
                        className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-500/10 border border-teal-500/30 text-teal-400 hover:bg-teal-500/20 hover:border-teal-500/50 transition-all duration-300 text-sm font-display font-medium relative z-10 group/btn"
                      >
                        <MessageSquare className="w-4 h-4 group-hover/btn:rotate-12 transition-transform" />
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

      {/* Example Modal with futuristic design */}
      {showExample && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setShowExample(false)}
        >
          <div 
            className="relative max-w-2xl w-full bg-gray-900 rounded-2xl border-2 border-teal-500/30 shadow-2xl shadow-teal-500/20 animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Decorative corner accents */}
            <div className="absolute -top-2 -left-2 w-8 h-8 border-t-4 border-l-4 border-teal-400 rounded-tl-xl" />
            <div className="absolute -top-2 -right-2 w-8 h-8 border-t-4 border-r-4 border-teal-400 rounded-tr-xl" />
            <div className="absolute -bottom-2 -left-2 w-8 h-8 border-b-4 border-l-4 border-teal-400 rounded-bl-xl" />
            <div className="absolute -bottom-2 -right-2 w-8 h-8 border-b-4 border-r-4 border-teal-400 rounded-br-xl" />
            
            {/* Close button */}
            <button
              onClick={() => setShowExample(false)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800/80 border border-gray-700/50 text-gray-400 hover:text-white hover:bg-gray-800 hover:border-teal-500/50 transition-all duration-200 z-10 group"
            >
              <X className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            </button>

            {/* Modal content */}
            <div className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-xl bg-teal-500/20 border-2 border-teal-500/40 flex items-center justify-center relative">
                  <MessageSquare className="w-7 h-7 text-teal-400 relative z-10" />
                  <div className="absolute inset-0 rounded-xl bg-teal-500/10 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-2xl font-display font-bold text-white">Strategy Example</h3>
                  <p className="text-sm text-teal-400 font-display">EMA Crossover Strategy</p>
                </div>
              </div>

              <div className="p-6 rounded-xl bg-gray-950/80 border-2 border-teal-500/20 relative overflow-hidden">
                {/* Scanning line effect */}
                <div className="absolute inset-0 overflow-hidden opacity-10">
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan" />
                </div>
                
                <p className="text-gray-300 leading-relaxed whitespace-pre-line font-mono text-sm relative z-10">
                  {steps[0].example}
                </p>
              </div>

              <div className="mt-6 flex items-center gap-2 text-sm text-gray-400 font-display">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
                <span>Click anywhere outside to close</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

import { AlertTriangle, TrendingDown, BarChart3, Brain } from "lucide-react";

export const ProblemSection = () => {
  const problems = [
    { icon: Brain, label: "Fear & Greed", color: "from-red-500 to-orange-500" },
    { icon: TrendingDown, label: "Inconsistency", color: "from-orange-500 to-yellow-500" },
    { icon: AlertTriangle, label: "Revenge Trading", color: "from-yellow-500 to-red-500" },
    { icon: BarChart3, label: "Backtest Bias", color: "from-red-500 to-pink-500" }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-900 relative overflow-hidden">
      {/* Futuristic background effect */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="problems-grid" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
              <path d="M 50 0 L 0 0 0 50" fill="none" stroke="#14b8a6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#problems-grid)" />
        </svg>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Problem icons with SVG illustrations */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {problems.map((problem, index) => (
              <div 
                key={index} 
                className="flex flex-col items-center gap-3 p-4 group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative">
                  {/* Outer glow ring */}
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${problem.color} opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-300`} />
                  
                  {/* Icon container */}
                  <div className="relative w-16 h-16 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 group-hover:scale-110 group-hover:border-red-500/40 transition-all duration-300">
                    <problem.icon className="w-8 h-8 animate-pulse" style={{ animationDuration: '2s' }} />
                  </div>
                  
                  {/* Corner accents */}
                  <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 border-red-500/50" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 border-red-500/50" />
                  <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 border-red-500/50" />
                  <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 border-red-500/50" />
                </div>
                
                <span className="text-sm font-display font-medium text-gray-300 group-hover:text-red-400 transition-colors">
                  {problem.label}
                </span>
              </div>
            ))}
          </div>

          {/* Problem description with futuristic styling */}
          <div className="text-center space-y-4 relative">
            {/* Decorative lines */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-8 bg-gradient-to-b from-transparent to-teal-500/50" />
            
            <h2 className="text-3xl md:text-4xl font-display font-bold text-white relative inline-block">
              Why Good Ideas Fail Without Discipline
              <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
            </h2>
            
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
              Many traders struggle not because they lack ideas, but because execution is inconsistent. Fear, overconfidence, overtrading, revenge trading, and biased backtests can erode good strategies. AlgoAI enforces structure by converting your rules into systematic, repeatable processes that can be tested objectively before you commit real risk.
            </p>
            
            {/* Decorative bottom element */}
            <div className="flex items-center justify-center gap-2 pt-6">
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-glow" />
              <div className="w-16 h-px bg-gradient-to-r from-teal-500 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-cyan-400 animate-glow" style={{ animationDelay: '0.5s' }} />
              <div className="w-16 h-px bg-gradient-to-l from-cyan-500 to-transparent" />
              <div className="w-2 h-2 rounded-full bg-teal-400 animate-glow" style={{ animationDelay: '1s' }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

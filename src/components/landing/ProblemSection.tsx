import { AlertTriangle, TrendingDown, BarChart3, Brain } from "lucide-react";

export const ProblemSection = () => {
  const problems = [
    { icon: Brain, label: "Fear & Greed" },
    { icon: TrendingDown, label: "Inconsistency" },
    { icon: AlertTriangle, label: "Revenge Trading" },
    { icon: BarChart3, label: "Backtest Bias" }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Problem icons */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {problems.map((problem, index) => (
              <div key={index} className="flex flex-col items-center gap-3 p-4">
                <div className="w-12 h-12 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400">
                  <problem.icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-gray-300">
                  {problem.label}
                </span>
              </div>
            ))}
          </div>

          {/* Problem description */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold text-white">
              Why Algo Exists
            </h2>
            <p className="text-lg md:text-xl text-gray-300 leading-relaxed">
              Many traders struggle not because they lack ideas, but because execution is inconsistent. Common challenges include fear, overconfidence, overtrading, revenge trading, and biased backtesting. Algo addresses these challenges by enforcing structure — converting your trading rules into systematic, repeatable processes that can be tested objectively.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

import { Brain, TrendingDown, Clock, MoveDown, Bot, Zap, LineChart, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export const ProblemSection = () => {
  return (
    <section className="py-16 md:py-24 bg-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-white mb-6">
            The Execution Gap
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Good strategies fail because of human psychology. Automation bridges the gap.
          </p>
        </div>

        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8 items-center">
          
          {/* Manual Trading */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-red-500/5 border border-red-500/20 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Brain className="w-32 h-32 text-red-500" />
            </div>
            <h3 className="text-2xl font-bold text-red-400 mb-6 flex items-center gap-3">
              <Brain className="w-6 h-6" /> Manual Trading
            </h3>
            
            <ul className="space-y-6">
              {[
                { icon: TrendingDown, text: "Emotional decisions ruin profitable strategies" },
                { icon: Clock, text: "Impossible to monitor markets 24/7" },
                { icon: MoveDown, text: "Slippage and delayed execution" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center text-red-400 shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* VS Badge (visible on desktop) */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-12 h-12 bg-gray-800 border border-gray-700 rounded-full items-center justify-center z-20 text-gray-400 font-bold font-display">
            VS
          </div>

          {/* AI Trading */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            className="bg-teal-500/5 border border-teal-500/20 rounded-3xl p-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Bot className="w-32 h-32 text-teal-500" />
            </div>
            <h3 className="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-3">
              <Bot className="w-6 h-6" /> AlgoAI Bots
            </h3>
            
            <ul className="space-y-6">
              {[
                { icon: ShieldCheck, text: "100% disciplined, logic-based execution" },
                { icon: LineChart, text: "Monitors 100+ assets simultaneously 24/7" },
                { icon: Zap, text: "Sub-millisecond trade execution" }
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-gray-300">
                  <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center text-teal-400 shrink-0">
                    <item.icon className="w-5 h-5" />
                  </div>
                  <span>{item.text}</span>
                </li>
              ))}
            </ul>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

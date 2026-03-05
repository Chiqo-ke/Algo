import { MessageSquare, Code2, Rocket, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

// Exported for schema.org data in LandingPage
export const howItWorksSteps = [
  {
    title: "1. Plain English Rules",
    description: "Describe your trading strategy naturally. No coding skills required."
  },
  {
    title: "2. AI Evaluation Engine",
    description: "Our engine immediately converts syntax to an executable bot."
  },
  {
    title: "3. Backtest & Deploy",
    description: "Test against historical data & deploy to live markets."
  }
];

export const HowItWorks = () => {
  return (
    <section className="py-24 bg-gray-900 overflow-hidden relative">
      {/* Decorative Blur */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-teal-500/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight">
            From Idea to <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-blue-500">Execution</span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Watch how our engine seamlessly converts your thoughts into powerful trading algorithms.
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-[120px] left-[10%] right-[10%] h-[2px] bg-gradient-to-r from-transparent via-gray-700 to-transparent z-0" />
            
            <div className="grid md:grid-cols-3 gap-8 relative z-10">
              {/* Step 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex flex-col items-center text-center space-y-6 bg-gray-800/20 p-8 rounded-3xl border border-gray-700/30 backdrop-blur-md"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-teal-500/20 border border-teal-500/30 flex items-center justify-center text-teal-400 shadow-[0_0_30px_rgba(20,184,166,0.15)]">
                  <MessageSquare className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">1. Describe Idea</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Tell the AI your exact conditions: "Buy ETH when the 50 SMA crosses above 200 SMA on the 1H chart".</p>
                </div>
              </motion.div>

              {/* Step 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="flex flex-col items-center text-center space-y-6 bg-gray-800/20 p-8 rounded-3xl border border-gray-700/30 backdrop-blur-md"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shadow-[0_0_30px_rgba(236,72,153,0.15)]">
                  <Code2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">2. Instant Processing</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">The AlgoAI NLP engine parses the intent and generates flawless, optimized machine code in milliseconds.</p>
                </div>
              </motion.div>

              {/* Step 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
                className="flex flex-col items-center text-center space-y-6 bg-gray-800/20 p-8 rounded-3xl border border-gray-700/30 backdrop-blur-md"
              >
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border border-yellow-500/30 flex items-center justify-center text-yellow-500 shadow-[0_0_30px_rgba(234,179,8,0.15)]">
                  <Rocket className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">3. Test & Deploy</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">Backtest against 10+ years of tick data instantly, then deploy the bot live directly onto your exchange.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

import { Bot, BarChart3, CloudLightning, ShieldAlert, Lock, Zap } from "lucide-react";
import { motion } from "framer-motion";

export const LandingFeatures = () => {
  return (
    <section className="py-12 md:py-20 lg:py-24 bg-gray-900 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8 sm:mb-12 md:mb-16 space-y-3 sm:space-y-4">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white tracking-tight">
            Agentic Infrastructure
          </h2>
          <p className="text-gray-400 text-sm sm:text-base md:text-lg max-w-2xl mx-auto">
            Everything you need to automate trading at institutional speeds, simplified into an intuitive interface.
          </p>
        </div>

        {/* Bento Box Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6 max-w-6xl mx-auto">
          
          {/* Box 1 (Span 2 cols on desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="md:col-span-2 bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4 sm:p-6 md:p-8 opacity-10 group-hover:opacity-20 transition-opacity">
              <Bot className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 text-teal-400" />
            </div>
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-teal-500/20 flex items-center justify-center text-teal-400 mb-3 sm:mb-4 md:mb-6">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Autonomous Bots</h3>
            <p className="text-gray-400 text-sm max-w-md">Deploy AI bots to continuously scan markets, manage risk, and execute orders 24/7 without intervention.</p>
          </motion.div>

          {/* Box 2 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 relative group"
          >
             <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 mb-3 sm:mb-4 md:mb-6">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3">Deep Backtesting</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Test multiple market conditions instantly via precise historical data mapping.</p>
          </motion.div>

          {/* Box 3 */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 relative group"
          >
             <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-pink-500/20 flex items-center justify-center text-pink-400 mb-3 sm:mb-4 md:mb-6">
              <CloudLightning className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-2 sm:mb-3">Cloud Execution</h3>
            <p className="text-gray-400 text-xs sm:text-sm">Zero local setup. Bots run on edge networks with &lt;15ms execution delays.</p>
          </motion.div>

          {/* Box 4 (Span 2 cols on desktop) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="md:col-span-2 bg-gradient-to-br from-gray-800 to-gray-800/50 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 border border-gray-700/50 relative overflow-hidden group"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 mb-3 sm:mb-4 md:mb-6">
              <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-2 sm:mb-3">Military-Grade Risk Guard</h3>
            <p className="text-gray-400 text-sm max-w-md">Pre-program absolute bounds. Hard stop-losses and automatic circuit breakers protect your capital even in flash crashes.</p>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

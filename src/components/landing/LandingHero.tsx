import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Terminal, Activity, Code2, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export const LandingHero = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden pt-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-400/[0.02] bg-[size:32px_32px]" />
      
      {/* Animated glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[100px] animate-pulse-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] animate-pulse-glow" style={{ animationDelay: '2s' }} />
      
      <div className="container relative z-10 mx-auto px-4 py-8 md:py-16 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Side: Text and CTA */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-left space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span className="font-display tracking-wide uppercase">Generative AI Trading</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white leading-tight">
            Build your strategy <br/>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-500">in plain English.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-xl leading-relaxed">
            Stop wrestling with syntax. Describe your entry, exit, and risk rules, and our AI engine instantly deploys them into autonomous, backtestable trading bots.
          </p>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-teal-500 to-blue-600 hover:from-teal-400 hover:to-blue-500 text-white border-0 px-8 h-14 rounded-xl font-medium shadow-lg shadow-teal-500/25 transition-all hover:scale-105"
              onClick={handleGetStarted}
            >
              Start Building Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-200 px-8 h-14 rounded-xl backdrop-blur-sm transition-all"
              onClick={() => navigate('/docs')}
            >
              Read Docs
            </Button>
          </div>
        </motion.div>

        {/* Right Side: Animated Code / Diagram Visual */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="relative w-full aspect-square md:aspect-video lg:aspect-square max-w-lg mx-auto"
        >
          {/* Glass pane terminal */}
          <div className="absolute inset-0 rounded-2xl bg-gray-900/60 border border-gray-700/50 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col">
            <div className="h-10 bg-gray-800/80 border-b border-gray-700 flex items-center px-4 gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="ml-2 text-xs text-gray-500 font-mono">algo-bot.ui</span>
            </div>
            
            <div className="p-6 font-mono text-sm sm:text-base space-y-6 flex-1 flex flex-col justify-center">
              {/* Fake typing effect for plain English */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="flex items-start gap-4 text-teal-300"
              >
                <Terminal className="w-5 h-5 mt-1 shrink-0 opacity-70" />
                <p>
                  "Buy Bitcoin if 14-period RSI drops below 30 and MACD turns bullish..."
                  <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ repeat: Infinity, duration: 1 }}>|</motion.span>
                </p>
              </motion.div>

              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                transition={{ duration: 0.5, delay: 2.5 }}
                className="pl-9 overflow-hidden"
              >
                <div className="border border-gray-700 rounded-lg p-4 bg-gray-900/50 space-y-2 relative">
                  <div className="absolute -top-3 right-4 bg-gray-800 px-2 text-xs text-blue-400 flex items-center gap-1">
                    <Code2 className="w-3 h-3" /> compiled
                  </div>
                  <p className="text-pink-400">if <span className="text-gray-300">(rsi_14 {"<"} 30 && macd_hist {">"} 0)</span> {"{"}</p>
                  <p className="text-blue-400 pl-4">executeOrder<span className="text-gray-300">({`{ type: 'BUY', asset: 'BTC' }`})</span>;</p>
                  <p className="text-pink-400">{"}"}</p>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 3.5 }}
                className="flex items-center gap-3 text-emerald-400 pl-9"
              >
                <Activity className="w-5 h-5" />
                <span>Bot successfully deployed to Backtester.</span>
              </motion.div>
            </div>
          </div>
          
          {/* Floating decorative blocks */}
          <motion.div 
            animate={{ y: [-10, 10, -10] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="absolute -right-8 top-1/4 bg-gray-800 border border-gray-700 p-4 rounded-xl shadow-xl flex items-center gap-3 backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-gray-400 font-medium uppercase">Latency</p>
              <p className="text-sm text-white font-bold">&lt; 15ms</p>
            </div>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
};

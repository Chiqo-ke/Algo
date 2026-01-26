import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, TrendingUp, Zap, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface LandingHeroProps {
  onDemoClick: () => void;
}

export const LandingHero = ({ onDemoClick }: LandingHeroProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleDemoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Futuristic background decoration */}
      <div className="absolute inset-0 bg-grid-slate-400/[0.02] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      
      {/* Animated teal glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-glow" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl animate-glow" style={{ animationDelay: '2s' }} />
      
      {/* Scanning line effect */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan" />
      </div>
      
      {/* Futuristic SVG circuit pattern */}
      <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
            <circle cx="10" cy="10" r="1.5" fill="#14b8a6" />
            <circle cx="90" cy="90" r="1.5" fill="#14b8a6" />
            <line x1="10" y1="10" x2="90" y2="10" stroke="#14b8a6" strokeWidth="0.5" />
            <line x1="90" y1="10" x2="90" y2="90" stroke="#14b8a6" strokeWidth="0.5" />
            <circle cx="50" cy="50" r="2" fill="#06b6d4" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit)" />
      </svg>
      
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Animated tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium backdrop-blur-sm animate-pulse-glow">
            <Sparkles className="w-4 h-4 animate-spin" style={{ animationDuration: '3s' }} />
            <span className="font-display">AI-Powered Trading Agents</span>
          </div>

          {/* Futuristic headline with glow */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight text-white relative">
            <span className="relative inline-block">
              AlgoAI
              <div className="absolute inset-0 blur-2xl bg-teal-500/20 animate-glow -z-10" />
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Build <span className="text-teal-400 font-semibold">autonomous AI trading agents</span> in plain English. Our agentic platform powered by artificial intelligence transforms your trading ideas into intelligent, self-executing systems that trade with discipline and precision.{" "}
            <span className="text-teal-400 font-medium">Automated trading without the complexity.</span>
          </p>

          {/* Enhanced value bullets with icons */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:border-teal-500/50 transition-all duration-300 group">
              <Shield className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-gray-300">
                Rules over emotions — strategies executed exactly as defined.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:border-teal-500/50 transition-all duration-300 group">
              <TrendingUp className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-gray-300">
                Objective backtesting — reduce confirmation bias with consistent testing.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm hover:border-teal-500/50 transition-all duration-300 group">
              <Zap className="w-5 h-5 text-teal-400 mt-1 flex-shrink-0 group-hover:scale-110 transition-transform" />
              <p className="text-sm text-gray-300">
                Lower technical barrier — no coding required, just clear descriptions.
              </p>
            </div>
          </div>

          {/* CTA - Using WhatsApp button style for Try Demo */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-base px-8 py-6 border-teal-500/50 text-teal-400 hover:bg-teal-500/10 hover:text-accent-foreground h-11 rounded-md font-display"
              onClick={handleDemoClick}
            >
              Get Started for Free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Trust indicator */}
          <p className="text-sm text-gray-500 pt-4 font-display">
            No credit card required • Free trial available • 100% strategy ownership
          </p>
        </div>
        
        {/* Futuristic floating robot/AI illustration */}
        <div className="absolute bottom-10 right-10 hidden lg:block animate-float">
          <svg width="200" height="200" viewBox="0 0 200 200" className="opacity-30">
            <defs>
              <linearGradient id="robotGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.4" />
              </linearGradient>
            </defs>
            {/* Robot head */}
            <rect x="60" y="40" width="80" height="70" rx="10" fill="url(#robotGradient)" stroke="#14b8a6" strokeWidth="2" />
            {/* Eyes */}
            <circle cx="80" cy="70" r="8" fill="#14b8a6" className="animate-glow" />
            <circle cx="120" cy="70" r="8" fill="#14b8a6" className="animate-glow" />
            {/* Antenna */}
            <line x1="100" y1="40" x2="100" y2="20" stroke="#14b8a6" strokeWidth="3" strokeLinecap="round" />
            <circle cx="100" cy="15" r="5" fill="#14b8a6" className="animate-pulse-glow" />
            {/* Body */}
            <rect x="70" y="110" width="60" height="50" rx="8" fill="url(#robotGradient)" stroke="#14b8a6" strokeWidth="2" opacity="0.6" />
            {/* Arms */}
            <rect x="40" y="115" width="30" height="10" rx="5" fill="#14b8a6" opacity="0.5" />
            <rect x="130" y="115" width="30" height="10" rx="5" fill="#14b8a6" opacity="0.5" />
          </svg>
        </div>
      </div>

      {/* Hero illustration placeholder */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />
    </section>
  );
};

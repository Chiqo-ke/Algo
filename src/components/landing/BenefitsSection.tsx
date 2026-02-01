import { CheckCircle2, Zap } from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    { 
      text: "Consistency — the same rules applied the same way every time.",
      delay: "0s"
    },
    { 
      text: "Reduced emotional mistakes — fewer impulsive decisions during winning or losing streaks.",
      delay: "0.1s"
    },
    { 
      text: "Better use of time — less manual chart-watching, more focused analysis.",
      delay: "0.2s"
    },
    { 
      text: "Faster improvement — clearer feedback on what works and what doesn't.",
      delay: "0.3s"
    },
    { 
      text: "Ownership and transparency — your strategies, your data, your decisions.",
      delay: "0.4s"
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-800 relative overflow-hidden">
      {/* Futuristic background with animated elements */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="benefits-hex" x="0" y="0" width="100" height="87" patternUnits="userSpaceOnUse">
              <path d="M50 0 L93.3 25 L93.3 62 L50 87 L6.7 62 L6.7 25 Z" fill="none" stroke="#14b8a6" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#benefits-hex)" />
        </svg>
      </div>
      
      {/* Animated glow orbs */}
      <div className="absolute top-10 right-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '0.5s' }} />
      <div className="absolute bottom-10 left-10 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1.5s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Section header with futuristic styling */}
          <div className="text-center mb-12 relative">
            <div className="inline-block relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 relative z-10">
                What This Means For You
              </h2>
              <div className="absolute inset-0 blur-2xl bg-teal-500/10 animate-glow" />
            </div>
            <p className="text-lg text-gray-300">
              Algo is a tool to support disciplined trading — not a replacement for judgment or risk management
            </p>
            
            {/* Decorative line */}
            <div className="flex items-center justify-center gap-2 mt-6">
              <Zap className="w-4 h-4 text-teal-400 animate-pulse" />
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-teal-500 to-transparent" />
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>

          {/* Benefits list with enhanced styling */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="group flex items-start gap-4 p-5 rounded-lg bg-gray-900/50 border border-gray-700/50 hover:border-teal-500/50 backdrop-blur-sm transition-all duration-300 hover:shadow-[0_0_20px_rgba(20,184,166,0.1)] relative overflow-hidden"
                style={{ animationDelay: benefit.delay }}
              >
                {/* Shimmer effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-teal-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                
                {/* Icon with animated container */}
                <div className="relative">
                  <div className="absolute inset-0 bg-teal-400/20 rounded-full blur-md group-hover:blur-lg transition-all" />
                  <CheckCircle2 className="w-5 h-5 md:w-6 md:h-6 text-teal-400 flex-shrink-0 mt-0.5 relative z-10 group-hover:scale-110 transition-transform" />
                </div>
                
                <p className="text-lg text-gray-300 group-hover:text-gray-200 transition-colors relative z-10">
                  {benefit.text}
                </p>
                
                {/* Corner accent */}
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b-2 border-r-2 border-teal-500/20 rounded-br-lg opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>

          {/* Additional trust message with futuristic design */}
          <div className="mt-12 relative group">
            {/* Outer glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-xl blur-xl group-hover:blur-2xl transition-all" />
            
            <div className="relative p-6 rounded-xl bg-teal-500/10 border-2 border-teal-500/30 backdrop-blur-sm overflow-hidden">
              {/* Decorative corners */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-teal-400 rounded-tl-lg" />
              <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-teal-400 rounded-tr-lg" />
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-teal-400 rounded-bl-lg" />
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-teal-400 rounded-br-lg" />
              
              {/* Scanning line */}
              <div className="absolute inset-0 overflow-hidden opacity-10">
                <div className="h-px w-full bg-gradient-to-r from-transparent via-teal-400 to-transparent animate-scan" />
              </div>
              
              <p className="text-center text-gray-300 relative z-10 font-display">
                <strong className="text-teal-400 font-bold">Trust, Control, and Transparency:</strong>{" "}
                You stay in control. No strategy runs without your approval. Full history recorded. Your strategies and data remain yours.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

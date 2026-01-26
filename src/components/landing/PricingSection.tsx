import { Check, Sparkles } from "lucide-react";

export const PricingSection = () => {
  const tiers = [
    {
      name: "Free Trial",
      description: "Build and backtest up to 3 strategies",
      price: "Free",
      period: "",
      features: [
        "Up to 3 strategies",
        "Limited to Forex & Crypto markets",
        "Sample datasets",
        "Basic backtesting",
        "Performance reports"
      ],
      cta: "Start Free Trial",
      highlighted: false
    },
    {
      name: "Builder",
      description: "For traders actively testing ideas",
      price: "$5",
      period: "per month",
      features: [
        "Unlimited strategies",
        "All markets (Forex, Crypto, Equities)",
        "Full historical data access",
        "Advanced backtesting",
        "Strategy versioning",
        "Export & collaboration",
        "Email support"
      ],
      cta: "Get Started",
      highlighted: true
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-900 relative overflow-hidden">
      {/* Futuristic background */}
      <div className="absolute inset-0 opacity-5">
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="pricing-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <rect x="0" y="0" width="60" height="60" fill="none" stroke="#14b8a6" strokeWidth="0.5" />
              <circle cx="30" cy="30" r="1" fill="#14b8a6" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#pricing-grid)" />
        </svg>
      </div>
      
      {/* Animated glow orbs */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl animate-glow" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-glow" style={{ animationDelay: '1s' }} />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Section header with futuristic styling */}
          <div className="text-center mb-16 relative">
            <div className="inline-block relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 relative z-10">
                Access Options
              </h2>
              <div className="absolute inset-0 blur-2xl bg-cyan-500/10 animate-glow" />
            </div>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Start free and explore what works for your trading process
            </p>
            
            {/* Decorative elements */}
            <div className="flex items-center justify-center gap-3 mt-6">
              <div className="w-20 h-px bg-gradient-to-r from-transparent to-cyan-500" />
              <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div className="w-20 h-px bg-gradient-to-l from-transparent to-cyan-500" />
            </div>
          </div>

          {/* Pricing cards with enhanced design */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tiers.map((tier, index) => (
              <div 
                key={index}
                className="relative group"
              >
                {/* Outer glow effect */}
                <div className={`absolute -inset-1 rounded-2xl blur-xl transition-all duration-500 ${
                  tier.highlighted
                    ? 'bg-gradient-to-r from-teal-500/50 to-emerald-500/50 opacity-75 group-hover:opacity-100'
                    : 'bg-gradient-to-r from-teal-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-50'
                }`} />
                
                <div className={`relative rounded-2xl p-8 h-full transition-all duration-300 ${
                  tier.highlighted
                    ? 'bg-gradient-to-br from-teal-500/90 to-emerald-600/90 text-white shadow-2xl shadow-teal-500/20 backdrop-blur-sm border-2 border-teal-400/50'
                    : 'bg-gray-800/80 border-2 border-gray-700/50 backdrop-blur-sm hover:border-teal-500/30'
                }`}>
                  
                  {/* Decorative corners */}
                  <div className={`absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 rounded-tl-2xl ${
                    tier.highlighted ? 'border-white/50' : 'border-teal-500/30'
                  }`} />
                  <div className={`absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 rounded-br-2xl ${
                    tier.highlighted ? 'border-white/50' : 'border-teal-500/30'
                  }`} />
                  
                  {tier.highlighted && (
                    <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-display font-bold px-6 py-1.5 rounded-full shadow-lg border-2 border-orange-400 animate-pulse-glow">
                        Most Popular
                      </span>
                    </div>
                  )}

                  <div className="mb-6 relative z-10">
                    <h3 className={`text-2xl font-display font-bold mb-2 ${
                      tier.highlighted ? 'text-white' : 'text-white'
                    }`}>
                      {tier.name}
                    </h3>
                    <p className={`text-sm ${
                      tier.highlighted ? 'text-gray-100' : 'text-gray-300'
                    }`}>
                      {tier.description}
                    </p>
                  </div>

                  <div className="mb-6 relative z-10">
                    <div className={`text-5xl font-display font-bold mb-1 ${
                      tier.highlighted ? 'text-white' : 'text-white'
                    }`}>
                      {tier.price}
                    </div>
                    {tier.period && (
                      <div className={`text-sm font-display ${
                        tier.highlighted ? 'text-gray-100' : 'text-gray-300'
                      }`}>
                        {tier.period}
                      </div>
                    )}
                  </div>

                  <ul className="space-y-3 mb-8 relative z-10">
                    {tier.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start gap-3 group/item">
                        <div className="relative">
                          <div className={`absolute inset-0 blur-sm rounded-full ${
                            tier.highlighted ? 'bg-white/30' : 'bg-teal-400/30'
                          }`} />
                          <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 relative z-10 ${
                            tier.highlighted ? 'text-white' : 'text-teal-400'
                          }`} />
                        </div>
                        <span className={`text-sm ${
                          tier.highlighted ? 'text-gray-100' : 'text-gray-300'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-3 px-6 rounded-lg font-display font-semibold transition-all duration-300 relative overflow-hidden group/btn ${
                      tier.highlighted
                        ? 'bg-white text-gray-900 hover:bg-gray-100 shadow-lg'
                        : 'bg-teal-500 text-gray-900 hover:bg-teal-600 border-2 border-teal-400'
                    }`}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover/btn:translate-x-full transition-transform duration-1000" />
                    <span className="relative z-10">{tier.cta}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Additional note with futuristic styling */}
          <div className="mt-12 text-center relative">
            <div className="inline-block relative">
              <p className="text-gray-300 font-display">
                All plans include full strategy ownership and export capabilities.{" "}
                <a href="#" className="text-teal-400 hover:text-teal-300 font-medium underline decoration-teal-500/50 hover:decoration-teal-400 transition-colors">
                  View detailed comparison
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

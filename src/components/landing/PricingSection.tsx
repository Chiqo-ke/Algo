import { Check } from "lucide-react";

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
    <section className="py-16 md:py-24 bg-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Access Options
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Start free and explore what works for your trading process
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {tiers.map((tier, index) => (
              <div 
                key={index}
                className={`relative rounded-2xl p-8 ${
                  tier.highlighted
                    ? 'bg-gradient-to-b from-teal-500 to-emerald-600 text-white shadow-2xl shadow-teal-500/20 scale-105 md:scale-110'
                    : 'bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center">
                    <span className="bg-orange-500 text-white text-sm font-bold px-4 py-1 rounded-full shadow-lg">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-2xl font-bold mb-2 ${
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

                <div className="mb-6">
                  <div className={`text-4xl font-bold ${
                    tier.highlighted ? 'text-white' : 'text-white'
                  }`}>
                    {tier.price}
                  </div>
                  {tier.period && (
                    <div className={`text-sm ${
                      tier.highlighted ? 'text-gray-100' : 'text-gray-300'
                    }`}>
                      {tier.period}
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                        tier.highlighted ? 'text-white' : 'text-teal-400'
                      }`} />
                      <span className={`text-sm ${
                        tier.highlighted ? 'text-gray-100' : 'text-gray-300'
                      }`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                    tier.highlighted
                      ? 'bg-white text-gray-900 hover:bg-gray-100'
                      : 'bg-teal-500 text-gray-900 hover:bg-teal-600'
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            ))}
          </div>

          {/* Additional note */}
          <div className="mt-12 text-center">
            <p className="text-gray-300">
              All plans include full strategy ownership and export capabilities.{" "}
              <a href="#" className="text-teal-400 hover:underline font-medium">
                View detailed comparison
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

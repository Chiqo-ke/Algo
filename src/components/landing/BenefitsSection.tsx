import { CheckCircle2 } from "lucide-react";

export const BenefitsSection = () => {
  const benefits = [
    "Consistency — the same rules applied the same way every time.",
    "Reduced emotional mistakes — fewer impulsive decisions during winning or losing streaks.",
    "Better use of time — less manual chart-watching, more focused analysis.",
    "Faster improvement — clearer feedback on what works and what doesn't.",
    "Ownership and transparency — your strategies, your data, your decisions."
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              What This Means For You
            </h2>
            <p className="text-lg text-gray-300">
              Algo is a tool to support disciplined trading — not a replacement for judgment or risk management
            </p>
          </div>

          {/* Benefits list */}
          <div className="space-y-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50 border border-gray-700/50 hover:border-teal-500/30 backdrop-blur-sm transition-colors duration-200"
              >
                <CheckCircle2 className="w-6 h-6 text-teal-400 flex-shrink-0 mt-0.5" />
                <p className="text-lg text-gray-300">
                  {benefit}
                </p>
              </div>
            ))}
          </div>

          {/* Additional trust message */}
          <div className="mt-12 p-6 rounded-xl bg-teal-500/10 border border-teal-500/20 backdrop-blur-sm">
            <p className="text-center text-gray-300">
              <strong className="text-teal-400">Trust, Control, and Transparency:</strong>{" "}
              You stay in control. No strategy runs without your approval. Full history recorded. Your strategies and data remain yours.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

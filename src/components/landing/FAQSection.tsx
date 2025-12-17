import { useState } from "react";
import { ChevronDown } from "lucide-react";

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: "Do I need to know how to code?",
      answer: "No. Strategies are created using plain English descriptions."
    },
    {
      question: "Does Algo guarantee profits?",
      answer: "No. Algo helps you test and automate strategies, but trading always involves risk. Results depend on the strategy, market conditions, and risk management."
    },
    {
      question: "Can I modify a strategy after testing?",
      answer: "Yes. Strategies can be edited, versioned, and re-tested at any time."
    },
    {
      question: "Is live trading available?",
      answer: "Not yet. Currently, Algo focuses on strategy creation and backtesting. Live execution is planned for a future release."
    },
    {
      question: "Who owns the strategies?",
      answer: "You do. All strategy logic and results belong to you."
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Section header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-300">
              Everything you need to know about Algo Agent
            </p>
          </div>

          {/* FAQ accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="border border-gray-700/50 rounded-lg overflow-hidden backdrop-blur-sm"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left bg-gray-900/50 hover:bg-gray-900/70 transition-colors duration-200"
                  aria-expanded={openIndex === index}
                >
                  <span className="text-lg font-semibold text-white pr-8">
                    {faq.question}
                  </span>
                  <ChevronDown 
                    className={`w-5 h-5 text-teal-400 flex-shrink-0 transition-transform duration-200 ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openIndex === index && (
                  <div className="px-6 pb-6 pt-2 bg-gray-900/50">
                    <p className="text-gray-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional help */}
          <div className="mt-12 text-center">
            <p className="text-gray-300">
              Still have questions?{" "}
              <a href="mailto:support@algoagent.com" className="text-teal-400 hover:underline font-medium">
                Contact our team
              </a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

import { Sparkles, Shield, FileText, BookOpen, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

export default function Legal() {
  const sections = [
    {
      id: "privacy",
      title: "Privacy Policy",
      icon: Shield,
      content: [
        {
          heading: "Information We Collect",
          text: "We collect information you provide directly to us, including your email, name, and trading preferences. We also collect usage data to improve our platform and services."
        },
        {
          heading: "How We Use Your Information",
          text: "Your information is used to provide, maintain, and improve our services, communicate with you, and ensure platform security. We never sell your personal data to third parties."
        },
        {
          heading: "Data Security",
          text: "We implement industry-standard security measures to protect your data. All sensitive information is encrypted both in transit and at rest."
        },
        {
          heading: "Your Rights",
          text: "You have the right to access, correct, or delete your personal information at any time through your account settings or by contacting our support team."
        }
      ]
    },
    {
      id: "terms",
      title: "Terms of Service",
      icon: FileText,
      content: [
        {
          heading: "Platform Usage",
          text: "AlgoAI provides an AI-powered platform for creating and managing trading strategies. By using our platform, you agree to use it responsibly and in compliance with all applicable laws and regulations."
        },
        {
          heading: "Bot Ownership",
          text: "All trading bots and strategies created using our platform belong exclusively to you. You retain full ownership and intellectual property rights to your creations."
        },
        {
          heading: "Token System",
          text: "Our platform is currently free to use for all registered users. However, usage is limited by a token system to ensure fair access and platform stability. When your tokens are depleted, you will receive a notification and will need to wait for token regeneration before continuing to use the platform."
        },
        {
          heading: "Account Responsibilities",
          text: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You must notify us immediately of any unauthorized use."
        },
        {
          heading: "Service Modifications",
          text: "We reserve the right to modify, suspend, or discontinue any aspect of our service at any time. We will provide reasonable notice of significant changes when possible."
        },
        {
          heading: "Prohibited Activities",
          text: "You may not use our platform to engage in illegal activities, manipulate markets, violate securities laws, or attempt to circumvent our token system or other platform limitations."
        }
      ]
    },
    {
      id: "risk",
      title: "Risk Disclosure",
      icon: AlertTriangle,
      content: [
        {
          heading: "Financial Risk Warning",
          text: "Trading in financial markets carries substantial risk and is not suitable for all investors. You could lose some or all of your invested capital. Never invest money you cannot afford to lose."
        },
        {
          heading: "No Guarantees",
          text: "AlgoAI provides tools for strategy development and backtesting but does not guarantee profits or success. Past performance is not indicative of future results. All trading decisions are made at your own discretion and risk."
        },
        {
          heading: "Not Financial Advice",
          text: "The information and tools provided by AlgoAI are for educational and informational purposes only. We do not provide financial, investment, or trading advice. Always conduct your own research and consider consulting with licensed financial professionals before making investment decisions."
        },
        {
          heading: "Market Volatility",
          text: "Financial markets can be highly volatile and unpredictable. Automated trading strategies may not perform as expected during extreme market conditions, technical failures, or unexpected events."
        },
        {
          heading: "System Limitations",
          text: "While we strive to provide reliable services, technical issues, downtime, or data inaccuracies may occur. We are not liable for losses resulting from system failures or interruptions."
        },
        {
          heading: "Your Responsibility",
          text: "You are solely responsible for understanding the risks, monitoring your trading activities, and making informed decisions. Ensure you understand how the platform works before deploying real capital."
        }
      ]
    },
    {
      id: "guides",
      title: "User Guides",
      icon: BookOpen,
      content: [
        {
          heading: "Getting Started",
          text: "New to AlgoAI? Start by creating an account and exploring our AI Strategy Builder. Use plain English to describe your trading strategy, and our AI will help build it for you."
        },
        {
          heading: "Creating Your First Bot",
          text: "Navigate to the Strategy page, describe your trading approach, and let our AI generate a trading strategy. Review the generated parameters, backtest using historical data, and refine as needed."
        },
        {
          heading: "Understanding Backtesting",
          text: "Backtesting allows you to test your strategy against historical market data. Use our comprehensive backtesting tools to analyze performance metrics, identify weaknesses, and optimize your approach before live deployment."
        },
        {
          heading: "Token Management",
          text: "Your account includes tokens that replenish over time. Monitor your token balance in your account settings. When tokens run low, you'll receive notifications. Plan your strategy development and testing accordingly."
        },
        {
          heading: "Best Practices",
          text: "Start with small positions, diversify your strategies, regularly review performance, keep learning from our Learning Hub, and always maintain risk management principles. Never risk more than you can afford to lose."
        },
        {
          heading: "Getting Help",
          text: "Need assistance? Visit our Learning Hub for tutorials and guides, check our documentation for detailed API references, or contact our support team at support@algoai.com."
        }
      ]
    },
    {
      id: "documentation",
      title: "Documentation",
      icon: BookOpen,
      content: [
        {
          heading: "Platform Overview",
          text: "AlgoAI is an agentic AI platform that enables users to build, test, and deploy trading strategies using natural language. Our AI translates your trading ideas into executable strategies."
        },
        {
          heading: "AI Strategy Builder",
          text: "Our core feature allows you to describe trading strategies in plain English. The AI understands complex trading concepts and converts them into structured, backtestable strategies."
        },
        {
          heading: "Backtesting Engine",
          text: "Test your strategies against historical market data. Our backtesting engine provides comprehensive performance metrics, including returns, drawdowns, Sharpe ratios, and win rates."
        },
        {
          heading: "Token System",
          text: "Currently, AlgoAI is free for all users with a token-based usage limit. Tokens control access to AI generation, backtesting, and other platform features. Tokens regenerate automatically over time."
        },
        {
          heading: "Data & Indicators",
          text: "Access a wide range of technical indicators, market data, and analysis tools. Our platform supports multiple timeframes and asset classes for comprehensive strategy development."
        },
        {
          heading: "API Integration",
          text: "For advanced users, we provide API access for programmatic strategy management and data retrieval. Full API documentation is available for developers looking to extend platform capabilities."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50 backdrop-blur-sm bg-gray-900/95">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5 text-gray-400" />
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 bg-teal-500/10 rounded-lg border border-teal-500/30 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-teal-400" />
                </div>
                <span className="text-white font-display font-bold text-lg">AlgoAI</span>
              </div>
            </Link>
            <nav className="hidden md:flex gap-6">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="text-sm text-gray-400 hover:text-teal-400 transition-colors"
                >
                  {section.title}
                </a>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="pt-16 pb-8 px-4">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-4">
            Legal & Documentation
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Everything you need to know about using AlgoAI, including privacy policies, terms of service, risk disclosures, and comprehensive guides.
          </p>
        </div>
      </section>

      {/* Content Sections */}
      <div className="container mx-auto px-4 pb-16">
        <div className="max-w-4xl mx-auto space-y-16">
          {sections.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-24"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                  <section.icon className="w-6 h-6 text-teal-400" />
                </div>
                <h2 className="text-3xl font-display font-bold text-white">
                  {section.title}
                </h2>
              </div>

              <div className="space-y-6">
                {section.content.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 backdrop-blur-sm"
                  >
                    <h3 className="text-xl font-semibold text-white mb-3">
                      {item.heading}
                    </h3>
                    <p className="text-gray-400 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {/* Contact Section */}
        <div className="max-w-4xl mx-auto mt-16 pt-16 border-t border-gray-800">
          <div className="bg-gradient-to-br from-teal-500/10 to-blue-500/10 border border-teal-500/30 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-display font-bold text-white mb-4">
              Questions or Concerns?
            </h2>
            <p className="text-gray-400 mb-6">
              If you have any questions about our policies, terms, or platform usage, we're here to help.
            </p>
            <a
              href="mailto:support@algoai.com"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 hover:bg-teal-600 text-white font-semibold rounded-lg transition-colors"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-gray-400">
          <p>© {new Date().getFullYear()} AlgoAI. All rights reserved.</p>
          <p className="mt-2">Last updated: January 28, 2026</p>
        </div>
      </footer>
    </div>
  );
}

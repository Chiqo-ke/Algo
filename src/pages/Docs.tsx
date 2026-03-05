import { Helmet } from "react-helmet";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { FAQSection } from "@/components/landing/FAQSection";
import { LandingFooter } from "@/components/landing/LandingFooter";

const DocsPage = () => {
  return (
    <>
      <Helmet>
        <title>Documentation | AlgoAI</title>
        <meta name="description" content="Detailed documentation and FAQs for AlgoAI trading platform." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100 flex flex-col">
        {/* Navigation Bar */}
        <nav className="fixed w-full z-50 bg-gray-900/80 backdrop-blur-lg border-b border-gray-800">
          <div className="container mx-auto px-4 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 text-primary-400 hover:text-primary-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Home</span>
            </Link>
            <div className="font-semibold text-xl tracking-wider text-white">
              Algo<span className="text-primary-500">AI</span> Docs
            </div>
          </div>
        </nav>

        {/* Content Container */}
        <main className="flex-1 container mx-auto px-4 pt-24 pb-16 max-w-4xl">
          <div className="space-y-12">
            
            {/* Header */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                Documentation & FAQ
              </h1>
              <p className="text-xl text-gray-400">
                Deep dive into automated trading with AlgoAI
              </p>
            </div>

            {/* How It Works Detailed */}
            <section className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">Detailed Architecture</h2>
              <div className="space-y-6 text-gray-300 leading-relaxed">
                <div>
                  <h3 className="text-lg font-semibold text-blue-400 mb-2">1. Plain-English Parsing</h3>
                  <p>Our NLP engine parses your strategy rules (e.g., "Buy when RSI < 30"). We extract indicators, thresholds, sequence steps, and logical operators to generate internal configuration syntax.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-teal-400 mb-2">2. Backtesting Engine</h3>
                  <p>Once converted, your strategy runs against historical tick and minute data. It simulates slippage, commission, and latency. The resulting backtest report gives you precise metrics like Max Drawdown, Sharpe Ratio, and Expected Value.</p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-purple-400 mb-2">3. Live Deployment</h3>
                  <p>When you connect an exchange via API key safely, the bot listens to Live WebSockets, executing orders exactly the moment your conditions are met with sub-millisecond delays.</p>
                </div>
              </div>
            </section>

            {/* In-depth Features */}
            <section className="bg-gray-800/50 rounded-2xl p-8 border border-gray-700/50 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6 text-white border-b border-gray-700 pb-4">Platform Features Deep Dive</h2>
              <ul className="space-y-4 text-gray-300 list-disc list-inside px-4">
                <li><strong>Multiple Asset Classes:</strong> Trade Cryptocurrency, Forex pairs, and traditional Equities from one interface.</li>
                <li><strong>Advanced Risk Management:</strong> Auto-stop-losses, dynamic position sizing based on account equity, and daily max-loss breakers.</li>
                <li><strong>Cloud-hosted Architecture:</strong> Your bots run 24/7 on our distributed edge-network ensuring zero downtime.</li>
                <li><strong>Strategy Market (Upcoming):</strong> Share and monetize your most profitable strategies with other users.</li>
              </ul>
            </section>

            {/* Reused FAQ Component, modified heavily if needed, but for now we render it inside Docs */}
            <div id="faq" className="bg-gray-900 rounded-2xl ring-1 ring-gray-800 mt-8 py-8">
               <FAQSection />
            </div>
            
          </div>
        </main>
        
        <LandingFooter />
      </div>
    </>
  );
};

export default DocsPage;
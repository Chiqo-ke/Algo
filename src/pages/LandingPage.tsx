import { useState } from "react";
import { LandingHero } from "@/components/landing/LandingHero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { BenefitsSection } from "@/components/landing/BenefitsSection";
import { PersonasSection } from "@/components/landing/PersonasSection";
import { FAQSection } from "@/components/landing/FAQSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { DemoForm } from "@/components/landing/DemoForm";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Helmet } from "react-helmet";

const LandingPage = () => {
  const [demoOpen, setDemoOpen] = useState(false);

  return (
    <>
      <Helmet>
        <title>AlgoAI - AI Trading Agents | Automated Trading Platform</title>
        <meta 
          name="description" 
          content="Build autonomous AI trading agents in plain English. AlgoAI is an agentic platform powered by artificial intelligence for automated trading. No coding required." 
        />
        
        {/* Structured Data - Software Application */}
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            "name": "AlgoAI",
            "applicationCategory": "FinanceApplication",
            "operatingSystem": "Web",
            "offers": {
              "@type": "Offer",
              "price": "0",
              "priceCurrency": "USD",
              "description": "Free trial - Build up to 3 AI trading agents"
            },
            "description": "AlgoAI is an agentic platform powered by artificial intelligence for automated trading. Build autonomous AI trading agents in plain English without coding. Advanced backtesting for Forex, Crypto, and Equities.",
            "featureList": [
              "AI-powered trading agents",
              "Agentic autonomous trading",
              "Plain language agent creation",
              "Automated backtesting",
              "No coding required",
              "Forex, Crypto & Equities support",
              "AI-driven strategy optimization",
              "Autonomous decision-making agents"
            ],
            "keywords": "AI trading agents, agentic platform, automated trading, artificial intelligence, autonomous trading bots"
          }`}
        </script>

        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AlgoAI",
            "alternateName": "AlgoAI - AI Trading Agents Platform",
            "url": "https://algoai.biz",
            "logo": "https://algoai.biz/sparkles-icon.svg",
            "description": "Agentic AI platform for automated trading. Build autonomous trading agents powered by artificial intelligence.",
            "sameAs": [
              "https://twitter.com/algoai",
              "https://github.com/algoai",
              "https://linkedin.com/company/algoai"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "email": "support@algoai.com",
              "contactType": "Customer Support"
            }
          }`}
        </script>
        
        <meta property="og:title" content="AlgoAI - Build AI Trading Agents in Plain English" />
        <meta 
          property="og:description" 
          content="Agentic AI platform for automated trading. Create autonomous trading agents powered by artificial intelligence. No coding required." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://algoai.biz/" />
        <meta property="og:image" content="https://algoai.biz/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AlgoAI - AI Trading Agents Platform" />
        <meta name="twitter:description" content="Build autonomous AI trading agents without coding. Agentic platform powered by artificial intelligence for automated trading." />
        
        {/* Analytics placeholder - Replace with actual IDs */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script> */}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <LandingHero 
          onDemoClick={() => setDemoOpen(true)}
        />
        
        <ProblemSection />
        
        <div id="how-it-works">
          <HowItWorks />
        </div>
        
        <div id="features">
          <LandingFeatures />
        </div>
        
        <BenefitsSection />
        
        <PersonasSection />
        
        <div id="pricing">
          <PricingSection />
        </div>
        
        <div id="faq">
          <FAQSection />
        </div>
        
        <LandingFooter />

        {/* Demo Form */}
        <DemoForm open={demoOpen} onOpenChange={setDemoOpen} />
      </div>
    </>
  );
};

export default LandingPage;

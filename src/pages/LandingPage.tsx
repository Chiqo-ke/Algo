import { useState } from "react";
import { LandingHero } from "@/components/landing/LandingHero";
import { ProblemSection } from "@/components/landing/ProblemSection";
import { HowItWorks, howItWorksSteps } from "@/components/landing/HowItWorks";
import { LandingFeatures } from "@/components/landing/LandingFeatures";
import { PersonasSection } from "@/components/landing/PersonasSection";
import { landingFaqs } from "@/components/landing/FAQSection";
import { PricingSection } from "@/components/landing/PricingSection";
import { DemoForm } from "@/components/landing/DemoForm";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Helmet } from "react-helmet";

const LandingPage = () => {
  const [demoOpen, setDemoOpen] = useState(false);
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: landingFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer
      }
    }))
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to create a trading strategy in AlgoAI",
    description: "Create a testable trading strategy in AlgoAI using plain-English rules.",
    step: howItWorksSteps.map((step) => ({
      "@type": "HowToStep",
      name: step.title,
      text: step.description
    }))
  };

  return (
    <>
      <Helmet>
        <title>AlgoAI - AI Trading Bots | Automated Trading Platform</title>
        <meta 
          name="description" 
          content="Learn how to build AI trading strategies without coding. AlgoAI converts plain-English rules into testable strategies with transparent backtest metrics for Forex, crypto, and equities." 
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
              "description": "Free trial - Build up to 3 AI trading bots"
            },
            "description": "AlgoAI is a bot platform powered by artificial intelligence for automated trading. Build autonomous AI trading bots in plain English without coding. Advanced backtesting for Forex, Crypto, and Equities.",
            "featureList": [
              "AI-powered trading bots",
              "Automated autonomous trading",
              "Plain language bot creation",
              "Automated backtesting",
              "No coding required",
              "Forex, Crypto & Equities support",
              "AI-driven strategy optimization",
              "Autonomous decision-making bots"
            ],
            "keywords": "AI trading bots, bot platform, automated trading, artificial intelligence, autonomous trading bots"
          }`}
        </script>

        {/* Structured Data - Organization */}
        <script type="application/ld+json">
          {`{
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "AlgoAI",
            "alternateName": "AlgoAI - AI Trading Bots Platform",
            "url": "https://algoai.biz",
            "logo": "https://algoai.biz/sparkles-icon.svg",
            "description": "AI bot platform for automated trading. Build autonomous trading bots powered by artificial intelligence.",
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

        {/* Structured Data - FAQPage */}
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>

        {/* Structured Data - HowTo */}
        <script type="application/ld+json">
          {JSON.stringify(howToSchema)}
        </script>
        
        <meta property="og:title" content="AlgoAI - Build AI Trading Bots in Plain English" />
        <meta 
          property="og:description" 
          content="AI bot platform for automated trading. Create autonomous trading bots powered by artificial intelligence. No coding required." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://algoai.biz/" />
        <meta property="og:image" content="https://algoai.biz/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="AlgoAI - AI Trading Bots Platform" />
        <meta name="twitter:description" content="Build autonomous AI trading bots without coding. AI bot platform powered by artificial intelligence for automated trading." />
        
        {/* Analytics placeholder - Replace with actual IDs */}
        {/* <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script> */}
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <LandingHero />
        
        <ProblemSection />
        
        <div id="how-it-works">
          <HowItWorks />
        </div>
        
        <div id="features">
          <LandingFeatures />
        </div>
        
        <PersonasSection />
        
        <div id="pricing">
          <PricingSection />
        </div>
        
        <LandingFooter />

        {/* Demo Form */}
        <DemoForm open={demoOpen} onOpenChange={setDemoOpen} />
      </div>
    </>
  );
};

export default LandingPage;

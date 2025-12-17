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
        <title>Algo Agent - Build Trading Bots in Plain English</title>
        <meta 
          name="description" 
          content="Build your own trading bot in plain English. Algo automates strategy creation and backtesting - no coding required. Remove emotion from trading." 
        />
        <meta property="og:title" content="Algo Agent - Trade Smarter, Not Emotionally" />
        <meta 
          property="og:description" 
          content="Turn trading ideas into tested bots in minutes. AI-powered strategy builder with rigorous backtesting. Live trading coming soon." 
        />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Algo Agent - Build Trading Bots in Plain English" />
        <meta name="twitter:description" content="Remove emotion from trading. Build, test, and iterate trading strategies without coding." />
        
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

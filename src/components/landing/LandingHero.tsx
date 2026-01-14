import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface LandingHeroProps {
  onDemoClick: () => void;
}

export const LandingHero = ({ onDemoClick }: LandingHeroProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleDemoClick = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-slate-400/[0.02] bg-[size:32px_32px]" />
      <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
      {/* Teal glow effect */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
      
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Tagline */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-sm font-medium backdrop-blur-sm">
            <Sparkles className="w-4 h-4" />
            <span>Build your own bot</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-white">
            Algo AI
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Trading is difficult largely because humans are inconsistent. Algo Agent helps you turn your trading ideas into clearly defined, testable systems so you can trade with structure, discipline, and evidence rather than emotion.{" "}
            <span className="text-teal-400 font-medium">Live trading support is planned for the future.</span>
          </p>

          {/* Value bullets */}
          <div className="grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-left">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-300">
                Rules over emotions — strategies executed exactly as defined.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-300">
                Objective backtesting — reduce confirmation bias with consistent testing.
              </p>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 backdrop-blur-sm">
              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-300">
                Lower technical barrier — no coding required, just clear descriptions.
              </p>
            </div>
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              className="w-full sm:w-auto text-base px-8 py-6 bg-teal-500 hover:bg-teal-600 text-gray-900 font-semibold"
              onClick={handleDemoClick}
            >
              Try the Demo
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="w-full sm:w-auto text-base px-8 py-6 border-teal-500/50 text-teal-400 hover:bg-teal-500/10"
              onClick={() => window.open('https://chat.whatsapp.com/your-community-link', '_blank')}
            >
              <MessageCircle className="mr-2 w-5 h-5" />
              Join WhatsApp Community
            </Button>
          </div>

          {/* Trust indicator */}
          <p className="text-sm text-gray-500 pt-4">
            No credit card required • Free trial available • 100% strategy ownership
          </p>
        </div>
      </div>

      {/* Hero illustration placeholder */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-900 to-transparent opacity-80" />
    </section>
  );
};

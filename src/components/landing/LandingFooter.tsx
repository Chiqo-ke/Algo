import { Github, Twitter, Linkedin, Mail } from "lucide-react";

export const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    product: [
      { label: "Features", href: "#features" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Pricing", href: "#pricing" },
      { label: "FAQ", href: "#faq" }
    ],
    company: [
      { label: "About", href: "#" },
      { label: "Blog", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "mailto:support@algoagent.com" }
    ],
    legal: [
      { label: "Privacy Policy", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Risk Disclosure", href: "#" },
      { label: "Cookie Policy", href: "#" }
    ],
    resources: [
      { label: "Documentation", href: "#" },
      { label: "API Reference", href: "#" },
      { label: "Guides", href: "#" },
      { label: "Support", href: "#" }
    ]
  };

  const socialLinks = [
    { icon: Twitter, href: "https://twitter.com/algoagent", label: "Twitter" },
    { icon: Github, href: "https://github.com/algoagent", label: "GitHub" },
    { icon: Linkedin, href: "https://linkedin.com/company/algoagent", label: "LinkedIn" },
    { icon: Mail, href: "mailto:support@algoagent.com", label: "Email" }
  ];

  return (
    <footer className="bg-gray-950 text-gray-400 pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Main footer content */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Brand column */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg" />
                <span className="text-white font-bold text-lg">Algo Agent</span>
              </div>
              <p className="text-sm mb-4 text-gray-400">
                Build trading bots in plain English. No coding required.
              </p>
              <div className="flex gap-3">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-lg bg-gray-800 border border-gray-700 hover:bg-gray-700 hover:border-teal-500/50 flex items-center justify-center transition-colors duration-200"
                    aria-label={social.label}
                  >
                    <social.icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Product links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Resources links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                {footerLinks.resources.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal links */}
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a href={link.href} className="text-sm text-gray-400 hover:text-teal-400 transition-colors duration-200">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Legal disclaimer */}
          <div className="border-t border-gray-800 pt-8 mb-8">
            <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-4 backdrop-blur-sm">
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-gray-300">Important Note:</strong> Algo Agent provides tools for strategy automation and backtesting. 
                It does not provide financial advice or profit guarantees. Trading involves risk, and users are responsible for their own decisions. 
                Past performance is not indicative of future results. 
                Always conduct your own research and consider consulting licensed financial professionals.
              </p>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-400">
            <p>
              © {currentYear} Algo Agent. All rights reserved.
            </p>
            <p className="text-center md:text-right">
              Made with care for traders who value discipline and data.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

# Algo Agent Landing Page

A production-ready, responsive landing page for **Algo Agent** - an AI-powered trading bot builder that allows users to create trading strategies in plain English.

## 🎯 Overview

This landing page targets retail traders, part-time traders, DIY quants, and investors who want to automate their trading strategies without coding knowledge.

## ✨ Features

- **Hero Section** with clear value proposition and CTAs
- **Problem/Solution** explanation of trading challenges
- **How It Works** - 3-step process visualization
- **Key Features** showcase with icons
- **Benefits** list for user outcomes
- **Target Personas** section
- **FAQ** accordion with common questions
- **Pricing** preview (coming soon tiers)
- **Demo Form** - Request personalized demo
- **Waitlist Form** - Join live trading waitlist
- **Footer** with links and legal disclaimer

## 🚀 Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Access at http://localhost:5173
```

## 📁 File Structure

```
/src
  /components/landing
    LandingHero.tsx          # Hero section with CTAs
    ProblemSection.tsx       # Trading problem explanation
    HowItWorks.tsx           # 3-step process
    LandingFeatures.tsx      # Key features grid
    BenefitsSection.tsx      # User benefits
    PersonasSection.tsx      # Target audience
    FAQSection.tsx           # Accordion FAQ
    PricingSection.tsx       # Pricing tiers
    DemoForm.tsx             # Demo request modal
    WaitlistForm.tsx         # Waitlist signup modal
    LandingFooter.tsx        # Footer with links
  /pages
    LandingPage.tsx          # Main landing page composition
/content.json                # Editable marketing copy
```

## 📝 Customization

### Editing Content

All marketing copy is centralized in `content.json` for easy editing:

```json
{
  "hero": {
    "headline": "Trade smarter, not emotionally.",
    "subheadline": "Build your own trading bot...",
    ...
  },
  ...
}
```

### Replacing Placeholders

1. **Analytics**: Add Google Analytics or Segment tracking
   - Update `src/pages/LandingPage.tsx` Helmet section
   - Replace placeholder comments with actual tracking codes

2. **Images**: Add hero illustration
   - Create `/public/hero-illustration.svg`
   - Update Open Graph image: `/public/og-image.png`

3. **API Endpoints**: Wire up form submissions
   - Demo form: `/api/submit-demo`
   - Waitlist form: `/api/waitlist`
   - Currently mocked - implement backend handlers

4. **Social Links**: Update footer social URLs
   - Twitter: `https://twitter.com/algoagent`
   - GitHub: `https://github.com/algoagent`
   - LinkedIn: `https://linkedin.com/company/algoagent`
   - Email: `support@algoagent.com`

5. **Legal Links**: Create legal pages
   - Privacy Policy
   - Terms of Service
   - Risk Disclosure
   - Cookie Policy

## ✅ Acceptance Criteria

- [x] Responsive design (320px - 1440px)
- [x] Hero visible above fold on desktop
- [x] Demo and Waitlist forms with validation
- [x] Exact marketing copy implemented
- [x] Semantic HTML and ARIA attributes
- [x] SEO meta tags (title, description, Open Graph)
- [x] Dark mode support
- [x] All sections from requirements
- [x] Mobile-first design
- [x] Keyboard accessible

## 🎨 Design Tokens

- **Primary Color**: Blue (blue-600)
- **Accent Colors**: Purple, Teal gradients
- **Typography**: System fonts (Inter fallback)
- **Spacing**: Tailwind default scale
- **Dark Mode**: Full support via shadcn/ui

## 📱 Responsive Breakpoints

- Mobile: 320px - 639px
- Tablet: 640px - 1023px
- Desktop: 1024px+

## 🔍 SEO Optimization

- Title: "Algo Agent - Build Trading Bots in Plain English"
- Meta description included
- Open Graph tags for social sharing
- Structured semantic HTML
- Alt text on interactive elements

## ⚡ Performance

- Tailwind CSS for minimal bundle size
- Code-split by route
- Lazy-loaded modals
- Optimized React components
- No heavy dependencies

## 🧪 Testing Suggestions

1. **Lighthouse Audit**
   ```bash
   npm run build
   npm run preview
   # Run Lighthouse on preview URL
   ```

2. **Cross-Browser Testing**
   - Chrome, Edge, Firefox, Safari
   - iOS Safari, Chrome Mobile

3. **Form Testing**
   - Submit with valid data → Success message
   - Submit with invalid email → Validation error
   - Submit without required fields → Validation error

4. **Accessibility Testing**
   - Keyboard navigation (Tab, Enter, Esc)
   - Screen reader compatibility
   - Color contrast ratios (WCAG AA)

## 🚢 Deployment

### Build Production

```bash
npm run build
```

### Deploy to Vercel

```bash
# Already configured - push to main branch
git add .
git commit -m "feat: add landing page"
git push origin main
```

Vercel will auto-deploy from GitHub.

### Environment Variables

No environment variables required for basic deployment. Add when integrating:

- `VITE_GA_MEASUREMENT_ID` - Google Analytics
- `VITE_API_URL` - Backend API for forms

## 📋 Implementation Checklist

- [x] Hero section with 3 CTAs
- [x] Plain-English promise messaging
- [x] Problem + Solution section
- [x] How It Works (3 steps)
- [x] Key Features (5 bullets)
- [x] Benefits list
- [x] Target personas
- [x] FAQ accordion
- [x] Pricing preview
- [x] Demo form with validation
- [x] Waitlist form with validation
- [x] Footer with legal disclaimer
- [x] Responsive design
- [x] Dark mode support
- [x] SEO meta tags
- [x] Accessibility (ARIA, semantic HTML)
- [x] Content.json for easy editing

## ⚠️ Important Notes

1. **Live Trading**: Clearly marked as "coming soon" throughout
2. **Legal Disclaimer**: Prominent risk disclosure in footer
3. **No Guarantees**: FAQ explicitly states no profit guarantees
4. **Strategy Ownership**: Users retain full ownership messaging
5. **Risk Warnings**: Trading risk mentioned in forms and footer

## 🔗 Routes

- `/` - Landing page (public)
- `/dashboard` - Main app (protected)
- `/login` - Authentication
- `/register` - Sign up

## 📞 Support

For questions or issues:
- Email: support@algoagent.com
- Documentation: See FRONTEND_README.md
- GitHub: [Issues page]

## 📄 License

See main project LICENSE

---

**Built with:** React 18, TypeScript, Tailwind CSS, shadcn/ui, Vite

# AlgoAgent Frontend

**Status:** ✅ Production Ready | **Last Updated:** December 17, 2025  
**Version:** 2.0 - Full Backend Integration Complete

## **Overview**

Modern React-based frontend application for the AlgoAgent trading strategy platform. Provides a comprehensive web interface for strategy creation, backtesting, execution monitoring, and AI-powered assistance.

### **Core Capabilities**

- ✅ **AI-Powered Dashboard** - Conversational interface for strategy creation
- ✅ **Strategy Builder** - Visual and code-based strategy development
- ✅ **Backtesting Interface** - Real-time backtest execution and visualization
- ✅ **Production Monitoring** - Live strategy deployment and performance tracking
- ✅ **User Authentication** - JWT-based secure access control
- ✅ **Responsive Design** - Mobile-first with touch-optimized controls
- ✅ **Real-time Updates** - WebSocket integration for live data streams

### **Backend Integration**

Currently integrated with **Monolithic Agent** backend:
- Full API coverage: 90/90 endpoints (100%)
- 19 service modules with 123+ methods
- Production-ready health monitoring
- Comprehensive error handling and logging

---

## **Technology Stack**

### **Core Technologies**

- **React 18** - UI framework with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **TanStack Query** - Server state management
- **React Router** - Client-side routing

### **UI Framework**

- **shadcn/ui** - Accessible component library
- **Radix UI** - Headless UI primitives
- **Tailwind CSS** - Utility-first styling
- **Lucide React** - Icon library
- **cmdk** - Command palette

### **Development Tools**

- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Vite** - Hot module replacement
- **Date-fns** - Date utilities

---

## **Project Structure**

```
Algo/
├── src/
│   ├── components/              ← React components
│   │   ├── AIAssistantPanel.tsx          ← AI chat interface
│   │   ├── BacktestConfigDialog.tsx      ← Backtest configuration
│   │   ├── CodeGenerationStatus.tsx      ← Code generation progress
│   │   ├── CommandPalette.tsx            ← Keyboard shortcuts
│   │   ├── DashboardLayout.tsx           ← Main layout wrapper
│   │   ├── MetricCard.tsx                ← Performance metrics
│   │   ├── RealtimeBacktestChart.tsx     ← Live backtest charts
│   │   ├── Sidebar.tsx                   ← Navigation sidebar
│   │   ├── WorkflowProgress.tsx          ← Workflow status tracker
│   │   └── ui/                           ← shadcn/ui components
│   │
│   ├── pages/                   ← Route pages
│   │   ├── Dashboard.tsx                 ← Main dashboard
│   │   ├── StrategyBuilder.tsx           ← Strategy creation
│   │   ├── Strategy.tsx                  ← Strategy details
│   │   ├── Backtesting.tsx               ← Backtest interface
│   │   ├── Settings.tsx                  ← User settings
│   │   ├── Login.tsx                     ← Authentication
│   │   └── Register.tsx                  ← User registration
│   │
│   ├── lib/                     ← Core libraries
│   │   ├── api.ts                        ← API client & endpoints
│   │   ├── productionApi.ts              ← Production endpoints
│   │   ├── services.ts                   ← Service layer (123 methods)
│   │   ├── productionServices.ts         ← Production services
│   │   ├── types.ts                      ← TypeScript types (50+ interfaces)
│   │   ├── logger.ts                     ← Logging utility
│   │   └── utils.ts                      ← Helper functions
│   │
│   ├── hooks/                   ← Custom React hooks
│   │   ├── useAuth.tsx                   ← Authentication hook
│   │   ├── use-toast.ts                  ← Toast notifications
│   │   └── use-mobile.tsx                ← Mobile detection
│   │
│   ├── App.tsx                  ← Root component
│   ├── main.tsx                 ← Entry point
│   └── index.css                ← Global styles
│
├── public/                      ← Static assets
│   ├── api-test.html                     ← API testing page
│   └── robots.txt
│
├── docs/                        ← Documentation (organized)
│   ├── architecture/            ← System architecture docs
│   ├── api/                     ← API integration guides
│   ├── guides/                  ← User guides
│   └── implementation/          ← Technical implementation
│
├── .env                         ← Environment variables
├── .env.example                 ← Environment template
├── vite.config.ts              ← Vite configuration
├── tailwind.config.ts          ← Tailwind configuration
├── tsconfig.json               ← TypeScript configuration
└── package.json                ← Dependencies

```

---

## **Quick Start**

### **Prerequisites**

- Node.js 18+ and npm
- Backend server running (default: http://localhost:8000)
- API keys configured in backend

### **Installation**

```bash
# Navigate to frontend directory
cd c:\Users\nyaga\Documents\Algo

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL

# Start development server
npm run dev
```

### **Environment Configuration**

Create `.env` file with:

```env
VITE_API_URL=http://localhost:8000
VITE_WS_URL=ws://localhost:8000
```

### **Access Application**

```
Development: http://localhost:5173
Production: (Deploy via Lovable or custom hosting)
```

---

## **Key Features**

### **1. AI Dashboard**

Conversational interface for strategy creation:

```typescript
// AI Assistant Panel usage
<AIAssistantPanel 
  onStrategyGenerated={(strategy) => {
    // Handle generated strategy
  }}
/>
```

**Features:**
- Natural language strategy descriptions
- Real-time code generation
- Automatic error fixing (up to 3 attempts)
- Execution history tracking

### **2. Strategy Builder**

Visual and code-based strategy development:

```typescript
// Strategy creation
import { strategyService } from '@/lib/services';

const createStrategy = async (data) => {
  const strategy = await strategyService.createStrategy({
    name: "RSI Strategy",
    description: "Buy when RSI < 30, sell when RSI > 70",
    code: strategyCode,
    parameters: { rsi_period: 14 }
  });
  return strategy;
};
```

**Features:**
- Code editor with syntax highlighting
- Parameter configuration
- Validation and safety checks
- Template library

### **3. Backtesting**

Real-time backtest execution and visualization:

```typescript
// Backtest execution
import { backtestService } from '@/lib/services';

const runBacktest = async (strategyId, config) => {
  const result = await backtestService.runBacktest({
    strategy: strategyId,
    symbol: "BTCUSDT",
    timeframe: "1h",
    start_date: "2024-01-01",
    end_date: "2024-12-31",
    initial_cash: 10000
  });
  return result;
};
```

**Features:**
- WebSocket streaming for live updates
- Interactive performance charts
- Detailed metrics (Sharpe, drawdown, win rate)
- Historical comparison

### **4. Authentication**

Secure JWT-based authentication:

```typescript
// Auth hook usage
import { useAuth } from '@/hooks/useAuth';

const MyComponent = () => {
  const { user, login, logout, isAuthenticated } = useAuth();
  
  const handleLogin = async (credentials) => {
    await login(credentials.username, credentials.password);
  };
};
```

**Features:**
- User registration and login
- Token refresh handling
- Protected routes
- Session management

---

## **API Integration**

### **Service Layer Architecture**

All backend interactions go through type-safe service modules:

```typescript
// Example: Strategy service
import { strategyService } from '@/lib/services';

// List all strategies
const strategies = await strategyService.getAllStrategies();

// Get single strategy
const strategy = await strategyService.getStrategy(id);

// Create strategy
const newStrategy = await strategyService.createStrategy(data);

// Update strategy
await strategyService.updateStrategy(id, updates);

// Delete strategy
await strategyService.deleteStrategy(id);

// Generate with AI
const generated = await strategyService.generateStrategyWithAI({
  description: "Create MACD crossover strategy",
  execute_after_generation: true
});
```

### **Available Services**

| Service | Methods | Description |
|---------|---------|-------------|
| `authService` | 15 | Authentication & user management |
| `symbolService` | 6 | Symbol CRUD operations |
| `marketDataService` | 6 | Historical & real-time data |
| `indicatorService` | 5 | Technical indicators |
| `strategyService` | 22 | Strategy management |
| `backtestService` | 10 | Backtest execution |
| `productionStrategyService` | 7 | Production deployments |
| `healthService` | 8 | System health monitoring |

**Total:** 19 service modules, 123+ methods

### **Type Safety**

All API responses are fully typed:

```typescript
import type { 
  Strategy, 
  BacktestResult, 
  StrategyPerformance,
  User 
} from '@/lib/types';

// Type-safe API calls
const strategy: Strategy = await strategyService.getStrategy(id);
const backtest: BacktestResult = await backtestService.getBacktest(id);
```

---

## **Development Workflow**

### **Running Development Server**

```bash
npm run dev
```

Server starts at `http://localhost:5173` with hot reload enabled.

### **Building for Production**

```bash
# Production build
npm run build

# Preview production build
npm run preview
```

### **Linting**

```bash
npm run lint
```

### **Type Checking**

```bash
npx tsc --noEmit
```

---

## **Testing**

### **Manual Testing**

Use the built-in API testing page:

```
http://localhost:5173/api-test.html
```

**Test endpoints:**
- Authentication (login/register)
- Strategy creation
- Backtest execution
- Health checks

### **Component Testing**

Test components in isolation:

```typescript
// Example: Testing AI Assistant
import { AIAssistantPanel } from '@/components/AIAssistantPanel';

// Render in Storybook or test file
<AIAssistantPanel 
  onStrategyGenerated={(strategy) => console.log(strategy)}
/>
```

---

## **Logging & Debugging**

### **Built-in Logger**

The frontend includes a comprehensive logging system:

```typescript
import { logger } from '@/lib/logger';

// Category-based logging
logger.auth.info("User logged in", { userId: 123 });
logger.api.error("Request failed", error, { endpoint: "/api/..." });
logger.production.warn("Performance issue", undefined, { metric: "slow" });

// Log levels: info, warn, error
// Categories: auth, api, data, backtest, production, ui, websocket
```

**Features:**
- Color-coded console output
- Structured log data
- Performance timing
- Error context

### **Performance Monitoring**

Track API call performance:

```typescript
// Automatically logged in all services
const startTime = performance.now();
// ... API call
const duration = Math.round(performance.now() - startTime);
logger.api.info("Request completed", { duration });
```

---

## **Deployment**

### **Lovable Platform (Recommended)**

1. Navigate to [Lovable Project](https://lovable.dev/projects/19ea15c1-1208-4c49-8ac6-d20fa518f98d)
2. Click Share → Publish
3. Custom domain available in Project > Settings > Domains

### **Manual Deployment**

```bash
# Build production bundle
npm run build

# Deploy dist/ folder to:
# - Vercel
# - Netlify
# - AWS S3 + CloudFront
# - Custom server
```

### **Environment Variables**

Set in production:

```env
VITE_API_URL=https://your-backend-api.com
VITE_WS_URL=wss://your-backend-api.com
```

---

## **Backend Connection**

### **Monolithic Agent Integration**

Currently integrated with the monolithic backend:

**Backend Server:**
```
URL: http://localhost:8000 (development)
API: /api/strategies/, /api/backtest/, /api/auth/
Docs: http://localhost:8000/docs
```

**Key Endpoints:**
- `/api/strategies/generate_with_ai/` - AI strategy generation
- `/api/strategies/{id}/execute/` - Bot execution
- `/api/strategies/{id}/fix_errors/` - Automatic error fixing
- `/api/backtest/run/` - Backtest execution
- `/api/auth/login/` - User authentication

**Start Backend:**
```bash
cd c:\Users\nyaga\Documents\AlgoAgent\monolithic_agent
python manage.py runserver
```

---

## **Documentation**

### **Architecture Docs**

- [API Integration Complete](API_INTEGRATION_COMPLETE.md) - Full endpoint coverage
- [Frontend Backend Integration](FRONTEND_BACKEND_INTEGRATION.md) - Connection guide
- [Visual Workflow Diagram](VISUAL_WORKFLOW_DIAGRAM.md) - System flow

### **Implementation Guides**

- [API Integration Developer Guide](API_INTEGRATION_DEVELOPER_GUIDE.md) - Service usage
- [Authentication Integration](AUTHENTICATION_INTEGRATION.md) - Auth setup
- [Logging Guide](FRONTEND_LOGGING_GUIDE.md) - Logging best practices
- [Production Integration](FRONTEND_PRODUCTION_INTEGRATION.md) - Production features

### **Feature Docs**

- [AI Dashboard Implementation](AI_DASHBOARD_IMPLEMENTATION_SUMMARY.md) - AI features
- [Backtest Configuration](BACKTEST_CONFIG_INTEGRATION.md) - Backtest setup
- [Conversation Memory](CONVERSATION_MEMORY_FRONTEND.md) - Chat persistence

### **Operational Guides**

- [Quick Start](QUICKSTART.md) - Getting started
- [Launch Checklist](LAUNCH_CHECKLIST.md) - Pre-launch verification
- [Troubleshooting](TROUBLESHOOTING.md) - Common issues

---

## **Key Components**

### **Layout Components**

- **DashboardLayout** - Main app layout with sidebar and header
- **Sidebar** - Navigation menu with route highlighting
- **MobileBottomNav** - Touch-optimized mobile navigation

### **Feature Components**

- **AIAssistantPanel** - Conversational AI interface
- **CodeGenerationStatus** - Progress tracking for code generation
- **BacktestConfigDialog** - Backtest parameter configuration
- **RealtimeBacktestChart** - Live backtest visualization
- **WorkflowProgress** - Multi-step workflow status

### **UI Components**

Full shadcn/ui library including:
- Buttons, Inputs, Select
- Dialog, Alert, Toast
- Table, Card, Accordion
- Command Palette (Cmd+K)
- And 40+ more components

---

## **Future Enhancements**

### **Multi-Agent Integration** (Planned)

Support for the multi-agent CLI system:
- Workflow visualization
- Agent status monitoring
- Artifact management
- Test execution dashboard

### **Additional Features**

- [ ] Real-time collaboration
- [ ] Strategy marketplace
- [ ] Advanced charting tools
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)

---

## **Support & Resources**

### **Links**

- **Frontend Repo:** c:\Users\nyaga\Documents\Algo
- **Backend Repo:** c:\Users\nyaga\Documents\AlgoAgent\monolithic_agent
- **Lovable Project:** [View on Lovable](https://lovable.dev/projects/19ea15c1-1208-4c49-8ac6-d20fa518f98d)

### **Quick Reference**

- All services: `import { strategyService, backtestService } from '@/lib/services'`
- All types: `import type { Strategy, BacktestResult } from '@/lib/types'`
- Logger: `import { logger } from '@/lib/logger'`
- Auth: `import { useAuth } from '@/hooks/useAuth'`

### **Commands**

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview build
npm run lint         # Run ESLint
```

---

**Last Updated:** December 17, 2025  
**Status:** Production Ready with Monolithic Backend Integration

# User Interaction Map - Algo Trading Platform

## Overview
This document defines all possible user interactions with the Algo UI, expected outcomes, and state transitions. This map helps AI models understand user intent and generate appropriate responses.

---

## 1. Authentication Flow

### 1.1 Landing Page (`/`)
**User Interactions:**
- Click "Get Started" / "Sign Up" button
- Click "Sign In" button
- Read about platform features
- View demo content
- Scroll through features/benefits

**Expected Results:**
- Navigate to `/register` or `/login`
- Display feature overview
- Show testimonials/use cases

---

### 1.2 Login Page (`/login`)
**User Interactions:**
- Enter username
- Enter password
- Toggle password visibility (eye icon)
- Click "Sign In" button
- Click "Don't have an account? Register" link
- Submit form (Enter key)

**Expected Results:**
| Action | Outcome |
|--------|---------|
| Valid credentials | Redirect to `/dashboard`, show success toast |
| Invalid credentials | Show error message, stay on login page |
| Missing fields | Disable submit button, show validation error |
| Network error | Show "Failed to login" error toast |
| Password toggle | Show/hide password characters |

**State Management:**
- `username`: string
- `password`: string
- `showPassword`: boolean
- `isLoading`: boolean (disable inputs during submission)
- `error`: string

---

### 1.3 Register Page (`/register`)
**User Interactions:**
- Enter username
- Enter email
- Enter password
- Confirm password
- Click "Create Account" button
- Click "Already have an account? Sign In" link

**Expected Results:**
| Action | Outcome |
|--------|---------|
| Passwords match | Create account, redirect to `/dashboard` |
| Passwords don't match | Show validation error |
| Username taken | Show error "Username already exists" |
| Invalid email | Show email validation error |
| All fields valid | Success toast, auto-login |

---

## 2. Dashboard Flow (`/dashboard`)

### 2.1 Main Chat Interface
**User Interactions:**
- Type strategy description in chat input
- Click "Send" button (or press Enter)
- Select from AI Assistant templates
- View conversation history
- Click "Clear conversation"
- Toggle AI Assistant panel visibility

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Send empty message | Input disabled, no action |
| Send strategy description | Show loading state, AI processes, display response with workflow progress |
| Select template | Load template into input, show template confirmation |
| View workflow | Show WorkflowProgress component with steps |

**Message Structure:**
```typescript
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: string;
    classification?: string;
    warnings?: string[];
    recommendations?: Array<{title, priority, rationale}>;
  };
  strategyData?: any;
  workflow?: WorkflowState;
}
```

---

### 2.2 Strategy Confirmation Dialog
**Trigger:** After AI generates a strategy

**User Interactions:**
- Review generated strategy (formatted as human-readable markdown)
- Click "Confirm Strategy" button
- Click "Edit Strategy" button
- Click "Cancel" button
- View warnings/recommendations

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Confirm | Save strategy to database, show success message, enable backtest button |
| Edit | Return to chat, pre-fill edited strategy name |
| Cancel | Close dialog, discard strategy |
| View warnings | Expand warnings section, display risk analysis |

**Confirmation Data:**
- `strategyId`: number (after confirmation)
- `strategyName`: string
- `canonicalJson`: object (structured strategy)
- `humanReadable`: string (markdown formatted)
- `aiValidation`: object (validation results)

---

### 2.3 Backtest Configuration & Execution
**Trigger:** After strategy confirmation

**User Interactions:**
- Open BacktestConfigDialog
- Select/enter stock symbol (AAPL, MSFT, etc.)
- Select time period (1mo, 3mo, 6mo, 1y, 2y, 5y, max)
- Select candle interval (1m, 5m, 15m, 30m, 1h, 1d, 1wk)
- Enter initial capital amount
- Set commission percentage
- Apply backtest template
- Click "Run Backtest" button

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Select symbol | Update symbol state, validate |
| Select period | Update period state |
| Select interval | Update interval state |
| Enter capital | Validate number input, show error if invalid |
| Apply template | Auto-fill all backtest parameters |
| Run backtest | Execute backtest, show progress indicator, display results |
| Symbol not found | Show validation error, suggest alternatives |

**Backtest Configuration:**
```typescript
interface BacktestConfig {
  symbol: string;
  period: string;
  interval: string;
  initialCapital?: number;
  commission?: number;
}
```

**Backtest Results Display:**
- Performance metrics (total return, Sharpe ratio, max drawdown, win rate)
- Equity curve chart
- Trade list (entry/exit prices, P&L)
- Risk analysis

---

## 3. Strategy Builder Page (`/strategy-builder`)

**User Interactions:**
- Write strategy description in textarea
- Click "Generate Strategy" button
- Click "Load Templates" button
- Select template from dropdown
- Click "Preview" button

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Enter description | Enable Generate button |
| Generate | Send to AI, show loading spinner, return to dashboard with strategy |
| Load templates | Fetch templates, display in dropdown |
| Select template | Pre-fill description with template prompt |
| Preview | Show formatted strategy in modal |

---

## 4. Strategy Page (`/strategy`)

**User Interactions:**
- View all created strategies
- Click strategy row to view details
- Edit strategy (name, description)
- Delete strategy
- Clone strategy
- Export strategy (JSON/CSV)
- Run backtest on strategy
- Open in strategy builder
- Search/filter strategies by name
- Sort by date created, performance, etc.

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Click strategy | Navigate to `/strategy/:id` details page |
| Edit | Open dialog, allow name/description edit, save changes |
| Delete | Show confirmation, delete from database, remove from list |
| Clone | Create copy with new name, show success message |
| Export | Download JSON file with strategy data |
| Run backtest | Open BacktestConfigDialog |
| Search | Filter strategy list by name match |

**Strategy List Item:**
- Strategy name (clickable)
- Creation date
- Performance metrics (if backtested)
- Status indicator
- Action buttons

---

## 5. Backtesting Page (`/backtesting/:strategyId`)

**User Interactions:**
- View backtest results
- Adjust parameters (symbol, period, interval)
- Re-run backtest with new parameters
- View trade list
- Download report (PDF/CSV)
- Compare multiple backtests
- Share results
- View performance chart
- Zoom/pan chart
- Toggle indicators on chart

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Adjust parameters | Re-fetch historical data, update charts |
| Re-run backtest | Show loading spinner, execute, update all results |
| Download report | Generate PDF/CSV, trigger browser download |
| View trade list | Paginated list of all trades with P&L |
| Share | Generate shareable link with results snapshot |
| Chart interaction | Allow zoom, pan, tooltip on hover |

---

## 6. Settings Page (`/settings`)

### 6.1 Profile Tab
**User Interactions:**
- View profile information
- Click "Edit Profile" button
- Update first name
- Update last name
- Update bio
- Update avatar (upload image)
- Click "Save Changes"
- Click "Cancel"

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Edit | Enable input fields, show Save/Cancel buttons |
| Save | Validate inputs, submit to API, show success toast |
| Cancel | Discard changes, revert to original state |
| Upload avatar | Preview image, validate size/format |

---

### 6.2 Account Settings Tab
**User Interactions:**
- Toggle notifications (email/push)
- Select default currency (USD, EUR, GBP, JPY)
- Select default simulation mode (money/pips)
- Save account settings
- View usage statistics

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Toggle notification | Update setting, show confirmation |
| Select currency | Update default for all future strategies |
| Select mode | Set default for backtesting |
| Save | Persist to database, show success message |
| View usage | Display subscription tier and usage limits |

---

### 6.3 Security Tab
**User Interactions:**
- Enter current password
- Enter new password
- Confirm new password
- Click "Change Password" button
- View two-factor authentication (2FA) status
- Enable/disable 2FA
- View active sessions
- Sign out other sessions

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Passwords don't match | Show validation error, disable submit |
| Current password wrong | Show "Incorrect password" error |
| Change successful | Show success message, require re-login on next action |
| Enable 2FA | Show QR code, ask to scan with authenticator app |
| Disable 2FA | Show confirmation, disable after password verification |
| Sign out other sessions | Terminate sessions, show notification |

---

### 6.4 Subscription/Premium Tab
**User Interactions:**
- View current subscription tier
- View subscription expiry date
- View usage limits (strategies, backtests, API calls)
- Click "Upgrade Plan" button
- View billing history
- Cancel subscription
- Redeem coupon/promo code

**Expected Results:**

| Action | Outcome |
|--------|---------|
| View tier | Display current plan and benefits |
| Upgrade | Redirect to payment page |
| View history | Show list of past invoices (downloadable) |
| Cancel | Show confirmation warning, process cancellation |
| Redeem code | Validate code, apply discount, update subscription |

---

## 7. Navigation & Global Components

### 7.1 Sidebar
**User Interactions:**
- Click menu items (Dashboard, Strategy, Analytics, Demo, Learning, Settings)
- Click collapse/expand toggle button
- View user profile in sidebar
- Click logout button

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Click menu item | Navigate to route, highlight active item |
| Collapse | Sidebar shrinks, show icons only with tooltips |
| Expand | Sidebar expands, show full labels |
| Logout | Clear auth state, redirect to `/login` |

---

### 7.2 Command Palette (Cmd+K or Ctrl+K)
**User Interactions:**
- Open command palette (keyboard shortcut)
- Type search query
- Navigate with arrow keys
- Select command with Enter
- Clear search with Escape

**Available Commands:**
- Dashboard
- AI Strategy Builder
- Backtesting
- Live Bots
- Analytics
- Learning Hub
- Settings

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Open | Show command dialog, focus input |
| Type | Filter commands by name/keywords match |
| Select | Navigate to route, close dialog |
| Escape | Close dialog without navigation |

---

### 7.3 AI Assistant Panel
**User Interactions:**
- Click AI Assistant button (floating or sidebar)
- Type question/request in chat input
- Send message (Enter or button click)
- Select AI template
- Clear conversation
- Close panel
- Scroll message history
- Copy message content

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Send message | Add to chat, show loading indicator, get AI response |
| Select template | Load template prompt, show description |
| Clear | Delete all messages, reset conversation |
| Close | Hide panel, save conversation history |
| Copy | Copy message to clipboard, show toast notification |

**AI Response Types:**
- Strategy guidance
- Indicator explanations
- Risk management advice
- Parameter optimization suggestions
- Educational content

---

### 7.4 Toast Notifications
**Trigger Events:**
- Successful action (save, delete, generate)
- Error (failed API call, validation)
- Info (tips, feature info)
- Warning (risky parameters, deprecated features)

**User Interaction:**
- Auto-dismiss after 3-5 seconds
- Click X to dismiss manually
- Click action button if provided

---

## 8. Mobile Navigation

### 8.1 Bottom Navigation (Mobile View)
**User Interactions:**
- Click bottom nav items (Dashboard, Strategy, Settings, etc.)
- View active indicator
- Swipe between pages (gesture)

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Click item | Navigate to route, highlight active item |
| Swipe | Slide to adjacent page |
| Long-press | Show tooltip or context menu |

---

## 9. Demo Mode

**User Interactions:**
- Click "Demo Mode" in sidebar
- View pre-generated strategies
- Run demo backtests
- Interact with demo data
- Reset demo state
- View demo walkthrough

**Expected Results:**

| Action | Outcome |
|--------|---------|
| Enter demo mode | Load pre-populated data, disable real API calls |
| Run backtest | Use demo data, show realistic results |
| Reset | Clear demo state, return to initial state |
| Walkthrough | Show guided tour of features |

---

## 10. AI Model Context Requirements

### What the AI Model Needs to Know:

1. **User Intent Recognition**
   - Strategy building requests vs general questions
   - Backtest execution vs parameter exploration
   - Technical questions vs feature usage help

2. **Current State Context**
   - What page user is on (`/dashboard`, `/strategy`, etc.)
   - Whether a strategy is selected
   - Current chat conversation history
   - Active strategy configuration

3. **Expected Response Format**
   - Markdown for explanations
   - JSON for strategy configs
   - Metrics tables for performance data
   - Step-by-step guides for processes

4. **Validation Rules**
   - Strategy name: 1-255 characters
   - Symbol: Valid ticker (AAPL, MSFT, etc.)
   - Period: 1mo, 3mo, 6mo, 1y, 2y, 5y, max
   - Interval: 1m, 5m, 15m, 30m, 1h, 1d, 1wk
   - Initial capital: Positive number
   - Commission: 0-1 decimal (percentage)

5. **Workflow States**
   - `pending` → `in_progress` → `completed` (or `failed`)
   - Each step has substeps and progress percentage
   - User can view workflow progress in real-time

6. **Error Handling**
   - Show user-friendly error messages
   - Suggest alternatives (e.g., "Symbol not found, try AAPL")
   - Provide recovery steps

---

## 11. Interaction Patterns

### Request-Response Cycle
```
User Input → Validation → Loading State → API Call → Response → Update UI
   ↓            ↓             ↓              ↓          ↓         ↓
 Message    Check fields   Spinner      Process    Display    Refresh
            required/valid   shown       results    message    list/state
```

### Confirmation Flow
```
User Action → Show Confirmation Dialog → Await Decision → Execute or Cancel
   ↓                    ↓                     ↓               ↓
Strategy          Confirm/Edit/Cancel   User clicks    DB update + UI
generated         buttons shown          button         refresh
```

### Error Recovery
```
Failed Action → Show Error Toast → User Option → Retry or Dismiss
      ↓              ↓                   ↓            ↓
API fails       Error message       Click retry    Re-attempt
                 + suggestion        or dismiss     or reset
```

---

## 12. Accessibility & UX Patterns

**Keyboard Shortcuts:**
- `Cmd/Ctrl + K`: Open command palette
- `Enter`: Submit form / Send message
- `Escape`: Close dialog / Clear search
- `Tab`: Navigate between fields
- `Shift + Tab`: Navigate backwards

**Visual Feedback:**
- Hover states on clickable elements
- Loading spinners during async operations
- Success/error toast notifications
- Disabled state for unavailable actions
- Active state indicator for current page

**Responsive Behavior:**
- Desktop: Full sidebar + main content + AI panel
- Tablet: Collapsible sidebar + main content
- Mobile: Hidden sidebar + bottom nav + full-width content

---

## 13. Performance Metrics to Track

For AI recommendations, model should consider:
- **Strategy metrics**: Return %, Sharpe ratio, Max drawdown, Win rate
- **Backtest metrics**: Trade count, Avg trade P&L, Best/worst trade
- **User metrics**: Strategies created, Backtests run, Session duration
- **System health**: API response time, Data freshness, Error rate

---

## 14. Common User Journeys

### Journey 1: First-Time Strategy Creation
1. Land on `/` → Register/Login → `/dashboard`
2. Type strategy description → Chat with AI
3. AI generates strategy → Confirm
4. Open backtest config → Configure parameters
5. Run backtest → View results
6. Decision: Accept or Edit strategy

### Journey 2: Portfolio Management
1. `/strategy` → View all strategies
2. Select strategy → View performance
3. Edit parameters → Re-run backtest
4. Compare multiple backtests
5. Export best performing strategy

### Journey 3: Learning & Exploration
1. `/demo` → Explore demo strategies
2. Ask AI questions about indicators/risk
3. `/learning` → Watch tutorial videos
4. Apply learned concepts to own strategy

---

## 15. Error States & Recovery

**Common Errors:**
- `401 Unauthorized`: Redirect to login
- `403 Forbidden`: Show "Access denied" message
- `404 Not Found`: Redirect to `/dashboard` with error toast
- `500 Server Error`: Show "Server error, please retry"
- `Network Error`: Show "Connection failed, check internet"

**User Recovery Options:**
- Retry button
- Go back button
- Clear form button
- Contact support link

---

## 16. Data Validation Rules for AI

When generating strategies, AI should validate:

```typescript
// Strategy validation
Strategy {
  name: string (1-255 chars) ✓
  description: string (optional)
  entry_rules: Rule[] (minimum 1)
  exit_rules: Rule[] (minimum 1)
  risk_management: {
    stop_loss: number (0.5-20%) ✓
    take_profit: number (1-500%) ✓
    position_sizing: "fixed" | "percentage" ✓
  }
  indicators: Indicator[] (minimum 1)
  timeframe: "1m" | "5m" | "15m" | "1h" | "1d" | "1w" ✓
}

// Backtest validation
BacktestConfig {
  symbol: string (valid ticker) ✓
  period: "1mo" | "3mo" | "6mo" | "1y" | "2y" | "5y" | "max" ✓
  interval: "1m" | "5m" | "15m" | "30m" | "1h" | "1d" | "1wk" ✓
  initialCapital: number > 0 ✓
  commission: number (0-1) ✓
}
```

---

## 17. Quick Reference: Route Map

| Route | Component | Purpose | Auth Required |
|-------|-----------|---------|---------------|
| `/` | LandingPage | Marketing/info | No |
| `/login` | Login | User authentication | No |
| `/register` | Register | Account creation | No |
| `/test-connection` | ConnectionTest | API connectivity | No |
| `/dashboard` | Dashboard | Main chat interface | Yes |
| `/strategy-builder` | StrategyBuilder | Create strategy | Yes |
| `/strategy` | Strategy | View all strategies | Yes |
| `/backtesting/:strategyId` | Backtesting | Backtest results | Yes |
| `/settings` | Settings | User preferences | Yes |
| `/demo` | Demo | Demo mode | Yes |
| `*` | NotFound | 404 page | No |

---

## 18. Message Examples for AI

**User asking for strategy help:**
```
Input: "I want a momentum strategy that uses RSI and MACD"

AI Should:
- Recognize strategy creation intent
- Ask clarifying questions (if needed)
- Generate strategy with those indicators
- Format as markdown
- Provide parameters that work well together
```

**User asking about backtest:**
```
Input: "Run a backtest on AAPL for the last year with 1 hour candles"

AI Should:
- Extract: symbol=AAPL, period=1y, interval=1h
- Validate parameters
- Suggest running backtest
- Ask for strategy if not already selected
```

**User asking for guidance:**
```
Input: "What's a good risk to reward ratio?"

AI Should:
- Provide educational content
- Explain concepts
- Give examples
- Link to learning resources (if available)
- Offer to apply this to current strategy
```

---

This map provides comprehensive context for AI models to understand user intentions, generate appropriate responses, and navigate the application's interaction patterns effectively.

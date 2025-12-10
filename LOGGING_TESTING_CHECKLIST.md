# Frontend Logging Testing Checklist

## 🧪 How to Test the Logging System

### Prerequisites
- Open browser DevTools Console (F12)
- Ensure you're in development mode to see all logs
- Optional: Run `__logger.setDebugEnabled(true)` for maximum verbosity

---

## 1. Authentication Logging Tests

### Login Flow
- [ ] Navigate to `/login`
- [ ] Enter credentials and click Login
- [ ] **Expected logs**:
  ```
  🎨 [UI] User submitting login form { username: "..." }
  🔐 [AUTH] Attempting login { username: "..." }
  🌐 [API] API Request: POST /api/auth/login/
  🌐 [API] Response 200 from /api/auth/login/
  ⏱️  Duration: XXXms
  🔐 [AUTH] Login successful { username: "...", userId: X, duration: XXXms }
  🎨 [UI] Login form successful, navigating to home
  ```

### Failed Login
- [ ] Enter wrong credentials
- [ ] **Expected logs**:
  ```
  🎨 [UI] User submitting login form
  🔐 [AUTH] Attempting login
  🌐 [API] API Request: POST /api/auth/login/
  🌐 [API] HTTP 401 error
  ❌ [AUTH] Login failed
  ❌ [UI] Login form error
  ```

### Registration Flow
- [ ] Navigate to `/register`
- [ ] Fill form and submit
- [ ] **Expected logs**:
  ```
  🎨 [UI] User submitting registration form
  🔐 [AUTH] Attempting registration
  🌐 [API] API Request: POST /api/auth/register/
  🌐 [API] Response 201 from /api/auth/register/
  🔐 [AUTH] Registration successful
  🎨 [UI] Registration form successful, navigating to home
  ```

### Logout
- [ ] Click logout button
- [ ] **Expected logs**:
  ```
  🔐 [AUTH] User logging out { username: "..." }
  🔐 [AUTH] Logout successful
  ```

### Auth Check on Page Load
- [ ] Refresh page while logged in
- [ ] **Expected logs**:
  ```
  🔐 [AUTH] Checking authentication with stored token
  🌐 [API] API Request: GET /api/auth/user/me/
  🌐 [API] Response 200
  🔐 [AUTH] User authenticated successfully { username: "...", userId: X }
  ```

---

## 2. Strategy Logging Tests

### Fetch Strategies
- [ ] Navigate to `/strategy`
- [ ] **Expected logs**:
  ```
  📊 [STRATEGY] Fetching strategies from API
  🌐 [API] API Request: GET /api/strategies/strategies/
  🌐 [API] Response 200 from /api/strategies/strategies/
  ⏱️  Duration: XXXms
  📊 [STRATEGY] Successfully loaded strategies { count: X, duration: XXXms }
  ```

### Fetch Bot Performance
- [ ] After strategies load
- [ ] **Expected logs**:
  ```
  📊 [STRATEGY] Fetching bot performance data { strategyCount: X }
  🌐 [API] API Request: GET /api/strategies/bot-performance/
  🌐 [API] Response 200
  📊 [STRATEGY] Successfully loaded bot performance data { performanceCount: X, duration: XXXms }
  ```

### Run Backtest Button
- [ ] Click "Run Backtest" on a strategy
- [ ] **Expected logs**:
  ```
  📊 [STRATEGY] Navigating to backtest page { strategyId: X, strategyName: "...", isVerified: true/false }
  ```

### Add Strategy Button
- [ ] Click "Add New Strategy" card
- [ ] **Expected logs**:
  ```
  🎨 [UI] User clicked Add Strategy button
  ```

### Go Live Button
- [ ] Click "Go Live" button
- [ ] **Expected logs**:
  ```
  📊 [STRATEGY] User attempted to go live with strategy { strategyId: X }
  ```

---

## 3. API Logging Tests

### Successful API Call
- [ ] Any successful API operation
- [ ] **Expected log pattern**:
  ```
  🌐 [API] API Request: METHOD /path
  🌐 [API] Response STATUS from /path
  ⏱️  Duration: XXXms
  🌐 [API] API request successful { url, method, duration, dataKeys: [...] }
  ```

### Failed API Call (Network Error)
- [ ] Stop Django server
- [ ] Trigger any API call
- [ ] **Expected logs**:
  ```
  🌐 [API] API Request: METHOD /path
  ❌ [API] Network error - server unreachable
  ```

### Failed API Call (4xx/5xx Error)
- [ ] Trigger an invalid request
- [ ] **Expected logs**:
  ```
  🌐 [API] API Request: METHOD /path
  🌐 [API] Response 4XX/5XX
  ❌ [API] HTTP XXX error
  ❌ [API] API call failed
  ```

---

## 4. Production API Logging Tests

### Schema Validation (if applicable)
- [ ] Trigger schema validation
- [ ] **Expected logs**:
  ```
  🚀 [PRODUCTION] Validating strategy schema { strategyName: "..." }
  🚀 [PRODUCTION] Schema validation successful { strategyName, schemaVersion, duration }
  ```
  OR
  ```
  🚀 [PRODUCTION] Validating strategy schema
  ⚠️ [PRODUCTION] Schema validation failed { errors: [...], duration }
  ```

### Code Safety Validation (if applicable)
- [ ] Trigger code safety check
- [ ] **Expected logs**:
  ```
  🚀 [PRODUCTION] Validating code safety { codeLength: XXX, strictMode: true }
  🚀 [PRODUCTION] Code safety validation passed { checksPassedCount: X, duration }
  ```
  OR
  ```
  🚀 [PRODUCTION] Validating code safety
  ⚠️ [PRODUCTION] Code safety validation failed { issuesCount: X, severity: "high", duration }
  ```

---

## 5. Browser Console Utilities Tests

### Get All Logs
```javascript
__logger.getAllLogs()
```
- [ ] Returns array of all log entries with timestamps, levels, categories, messages, and context

### Filter by Category
```javascript
__logger.getLogsByCategory('api')
__logger.getLogsByCategory('auth')
__logger.getLogsByCategory('strategy')
```
- [ ] Returns only logs from specified category

### Filter by Level
```javascript
__logger.getLogsByLevel('error')
__logger.getLogsByLevel('warn')
__logger.getLogsByLevel('info')
```
- [ ] Returns only logs of specified level

### Error Summary
```javascript
__logger.getErrorSummary()
```
- [ ] Returns array like: `[{ category: 'api', count: 3 }, { category: 'auth', count: 1 }]`

### Export Logs
```javascript
copy(__logger.exportLogs())
```
- [ ] Copies JSON string of all logs to clipboard

### Clear Logs
```javascript
__logger.clearLogs()
```
- [ ] Clears console and internal log storage

### Enable/Disable Debug
```javascript
__logger.setDebugEnabled(true)
__logger.setDebugEnabled(false)
```
- [ ] Controls whether debug logs are shown

---

## 6. Performance Tracking Tests

### Check Duration Logging
- [ ] Perform any operation that logs duration
- [ ] **Verify**:
  - Duration is in milliseconds
  - Duration is reasonable (e.g., API calls 100-500ms)
  - Duration appears in log context: `{ duration: XXX }`

### Manual Timing
- [ ] Look for operations using `performance.now()`
- [ ] **Verify**:
  - Start time captured before operation
  - Duration calculated after operation
  - Duration included in log

---

## 7. Error Handling Tests

### Validation Errors
- [ ] Submit invalid form data
- [ ] **Expected logs**:
  ```
  ⚠️ [UI] Registration validation failed: passwords do not match
  ```
  OR
  ```
  ⚠️ [UI] Registration validation failed: password too short
  ```

### API Errors with Context
- [ ] Trigger any API error
- [ ] **Verify log includes**:
  - Error message
  - Full error object
  - Relevant context (e.g., username, strategyId)
  - Duration

### Network Errors
- [ ] Stop backend server
- [ ] Trigger any API call
- [ ] **Expected**:
  ```
  ❌ [API] Network error - server unreachable
  🔌 Cannot connect to server. Make sure Django is running...
  ```

---

## 8. Log Format Verification

### Check Each Log Entry Has:
- [ ] ✅ Timestamp (ISO format)
- [ ] ✅ Level (debug/info/warn/error)
- [ ] ✅ Category (auth/api/strategy/etc.)
- [ ] ✅ Message (clear, descriptive)
- [ ] ✅ Context (relevant metadata)
- [ ] ✅ Icons (emoji for visual identification)

### Visual Formatting
- [ ] Icons display correctly (🔐 🌐 📊 🧪 🎨 etc.)
- [ ] Level indicators clear (🔍 ℹ️ ⚠️ ❌)
- [ ] Timestamps readable
- [ ] Context objects expandable in console

---

## 9. Production Mode Tests

### Test in Production Build
```bash
npm run build
npm run preview
```

- [ ] Console logging suppressed by default
- [ ] Can enable with `__logger.setDebugEnabled(true)`
- [ ] Can still access logs via `__logger.getAllLogs()`
- [ ] Error logs still appear

---

## 10. Edge Cases

### Empty States
- [ ] No strategies: Check logs handle empty arrays
- [ ] No bot performance: Check logs handle missing data

### Rapid Operations
- [ ] Click multiple buttons quickly
- [ ] Verify all actions logged in correct order

### Long Operations
- [ ] Operations > 1 second
- [ ] Verify duration logged correctly

### Special Characters
- [ ] Usernames with special chars
- [ ] Strategy names with unicode
- [ ] Verify logged correctly

---

## ✅ Success Criteria

All tests should show:
1. ✅ Logs appear in console with correct formatting
2. ✅ Icons and emojis display properly
3. ✅ Durations are tracked and reasonable
4. ✅ Context includes relevant metadata
5. ✅ Errors include full details and stack traces
6. ✅ Browser utilities work correctly
7. ✅ No console errors from logger itself
8. ✅ Performance impact negligible

---

## 🐛 Common Issues

### Logs Not Appearing
- Check you're in dev mode: `import.meta.env.DEV`
- Try: `__logger.setDebugEnabled(true)`
- Check console filter settings

### Missing Duration
- Verify `performance.now()` used correctly
- Check timer is called: `const timer = logger.startTimer(...); timer();`

### Wrong Category
- Use correct logger method: `logger.auth.info` not `logger.api.info`

### Missing Context
- Always pass context object: `logger.info('message', { key: value })`

---

## 📊 Test Results Template

```
Date: __________
Tester: __________

Authentication Tests: ☐ Pass ☐ Fail
Strategy Tests: ☐ Pass ☐ Fail
API Tests: ☐ Pass ☐ Fail
Production API Tests: ☐ Pass ☐ Fail
Console Utilities: ☐ Pass ☐ Fail
Performance Tracking: ☐ Pass ☐ Fail
Error Handling: ☐ Pass ☐ Fail
Log Format: ☐ Pass ☐ Fail
Production Mode: ☐ Pass ☐ Fail
Edge Cases: ☐ Pass ☐ Fail

Notes:
_________________________________
_________________________________
_________________________________
```

---

**Last Updated**: December 8, 2025
**Version**: 1.0.0

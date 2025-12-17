# 🚀 AI Dashboard Launch Checklist

Use this checklist to ensure everything is ready to launch your AI-powered strategy dashboard.

## Pre-Flight Checks

### ✅ Backend Prerequisites

- [ ] **Python Environment Active**
  ```powershell
  cd c:\Users\nyaga\Documents\AlgoAgent
  .venv\Scripts\activate
  ```

- [ ] **Required Packages Installed**
  ```powershell
  # All these should already be installed:
  .venv\Scripts\python.exe -c "import jsonschema, dotenv, google.generativeai; print('✅ All packages installed')"
  ```
  Expected output: `✅ All packages installed`

- [ ] **Environment Variables Configured**
  Create `c:\Users\nyaga\Documents\AlgoAgent\.env` with:
  ```env
  GEMINI_API_KEY=your_actual_api_key_here
  DJANGO_SECRET_KEY=your_secret_key
  DEBUG=True
  ```

- [ ] **CORS Configured**
  Verify `c:\Users\nyaga\Documents\AlgoAgent\algoagent_api\settings.py` contains:
  ```python
  CORS_ALLOWED_ORIGINS = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      # ... other origins
  ]
  ```

### ✅ Frontend Prerequisites

- [ ] **Node Modules Installed**
  ```powershell
  cd c:\Users\nyaga\Documents\Algo
  npm install
  ```

- [ ] **Environment File Exists**
  Verify `c:\Users\nyaga\Documents\Algo\.env` contains:
  ```env
  VITE_API_URL=http://localhost:8000
  ```

- [ ] **No TypeScript Errors**
  Dashboard.tsx should have no errors (already verified ✅)

## Launch Sequence

### Step 1: Start Backend

```powershell
# Terminal 1
cd c:\Users\nyaga\Documents\AlgoAgent
.venv\Scripts\activate
python manage.py runserver
```

**Wait for**:
```
Starting development server at http://127.0.0.1:8000/
```

### Step 2: Verify Backend Health

In a new PowerShell window:
```powershell
curl http://localhost:8000/api/strategies/api/health/
```

**Expected Response**:
```json
{
  "status": "healthy",
  "validator_available": true,
  "gemini_configured": true
}
```

**If `gemini_configured: false`**:
- Check GEMINI_API_KEY in `.env`
- Restart Django server
- Verify API key is valid

### Step 3: Start Frontend

```powershell
# Terminal 2
cd c:\Users\nyaga\Documents\Algo
npm run dev
```

**Wait for**:
```
➜  Local:   http://localhost:5173/
```

### Step 4: Open Dashboard

1. Open browser (Chrome/Edge recommended)
2. Navigate to: `http://localhost:5173/dashboard`
3. Open Developer Tools (F12) to monitor console

## First Test

### Test 1: Simple Validation

**In Dashboard**:
1. Type in chat: `Create a simple RSI strategy`
2. Press Enter or click Send

**Expected Behavior**:
- ✅ Loading spinner appears
- ✅ AI responds within 2-5 seconds
- ✅ Response shows:
  - Classification (strategy type)
  - Confidence level
  - Canonicalized steps
  - Warnings (if any)
  - Recommendations
- ✅ No errors in browser console

**If it fails**:
- Check Django terminal for errors
- Check browser console for network errors
- Verify both servers are running
- Check CORS configuration

### Test 2: Strategy Creation

**Navigate to**: `http://localhost:5173/dashboard?edit=true`

**In Dashboard**:
1. Type: `Create EMA crossover strategy with 9 and 21 periods`
2. Press Enter

**Expected Behavior**:
- ✅ Loading spinner appears
- ✅ AI responds with validation
- ✅ Toast notification: "Strategy Created"
- ✅ Response includes strategy ID
- ✅ Strategy saved to database

**Verify in Django Admin** (optional):
1. Go to: `http://localhost:8000/admin/`
2. Login (if you have admin credentials)
3. Check Strategies list - new strategy should appear

### Test 3: Strategy Update

**After Test 2 success**:
1. Type: `Add a 2% stop loss`
2. Press Enter

**Expected Behavior**:
- ✅ Loading spinner appears
- ✅ AI re-validates strategy
- ✅ Toast notification: "Strategy Updated"
- ✅ Response shows updated analysis

## Troubleshooting Matrix

| Symptom | Likely Cause | Solution |
|---------|--------------|----------|
| "Failed to fetch" | Backend not running | Start Django server |
| CORS error | Port mismatch | Verify CORS settings include 5173 |
| "GEMINI_API_KEY not found" | Missing env variable | Add to `.env`, restart server |
| Generic AI responses | Gemini not working | Check API key validity |
| 500 Internal Server Error | Backend code error | Check Django terminal logs |
| Blank dashboard | Frontend build error | Check npm terminal for errors |
| No loading spinner | Frontend issue | Check browser console |

## Success Criteria

### ✅ System is Working When:

1. **Backend Health Check Passes**
   - Status: healthy
   - validator_available: true
   - gemini_configured: true

2. **Frontend Loads Without Errors**
   - Dashboard renders
   - Chat input is visible
   - No console errors

3. **AI Responds to Queries**
   - Loading state shows
   - AI returns structured response
   - Metadata displays (confidence, warnings)
   - No network errors

4. **Strategies Can Be Created**
   - Edit mode works
   - Toast notifications appear
   - Strategy ID returned
   - Database updated

5. **Error Handling Works**
   - Stop backend → See error message in chat
   - Invalid input → See validation error
   - Toast notifications for errors

## Post-Launch Verification

### Database Check

```powershell
cd c:\Users\nyaga\Documents\AlgoAgent
.venv\Scripts\activate
python manage.py shell
```

In Python shell:
```python
from strategy_api.models import Strategy
print(f"Total strategies: {Strategy.objects.count()}")
latest = Strategy.objects.last()
if latest:
    print(f"Latest: {latest.name} (ID: {latest.id})")
```

### Files Check

If `save_to_backtest=true`, verify:
```powershell
ls c:\Users\nyaga\Documents\AlgoAgent\Backtest\codes\
```

Should see `.py` file for created strategy.

## Performance Benchmarks

**Expected Response Times**:
- First request: 2-5 seconds (module loading)
- Subsequent requests: <1 second
- Strategy creation: 2-3 seconds
- Strategy update: 1-2 seconds

**If slower**:
- Check internet connection (Gemini API call)
- Check API rate limits
- Verify server isn't processing other heavy tasks

## Common Issues & Quick Fixes

### Issue: "Module not found" errors in Django

**Fix**:
```powershell
cd c:\Users\nyaga\Documents\AlgoAgent
.venv\Scripts\activate
pip install jsonschema google-generativeai python-dotenv
python manage.py runserver
```

### Issue: Frontend can't connect to backend

**Fix**:
1. Verify `.env` has correct URL
2. Restart frontend dev server
3. Clear browser cache
4. Check firewall settings

### Issue: GEMINI_API_KEY errors

**Fix**:
1. Get key from: https://ai.google.dev/
2. Add to `AlgoAgent/.env`: `GEMINI_API_KEY=your_key`
3. Restart Django server
4. Test health endpoint

### Issue: CORS errors in console

**Fix**:
1. Verify `settings.py` has port 5173
2. Restart Django server (CORS config requires restart)
3. Clear browser cache
4. Try incognito mode

## Rollback Plan

If something breaks:

1. **Backend Issues**:
   ```powershell
   cd c:\Users\nyaga\Documents\AlgoAgent
   git status
   git diff  # Review changes
   # If needed: git restore <file>
   ```

2. **Frontend Issues**:
   ```powershell
   cd c:\Users\nyaga\Documents\Algo
   git status
   git diff
   # If needed: git restore src/pages/Dashboard.tsx
   ```

3. **Nuclear Option**:
   - Stop both servers
   - Clear browser cache
   - Deactivate/reactivate virtual environment
   - npm clean install
   - Restart servers

## Support & Documentation

**Quick References**:
- Setup Guide: `AI_DASHBOARD_QUICKSTART.md`
- Technical Details: `FRONTEND_BACKEND_INTEGRATION.md`
- Implementation Summary: `AI_DASHBOARD_IMPLEMENTATION_SUMMARY.md`

**API Testing**:
- Postman Collection: `Quick_AI_Strategy_Validation.json`
- Health Endpoint: `http://localhost:8000/api/strategies/api/health/`

**Example Prompts**:
- "Create momentum strategy with RSI"
- "Build EMA crossover 50/200"
- "Add trailing stop loss"
- "Optimize position sizing"

## Ready to Launch?

Check all boxes above, then:

1. ✅ Start backend (Terminal 1)
2. ✅ Verify health endpoint
3. ✅ Start frontend (Terminal 2)
4. ✅ Open dashboard in browser
5. ✅ Send test message
6. ✅ Verify AI response
7. 🎉 **You're live!**

---

**Status**: ✅ All systems configured and ready

**Next**: Follow the Launch Sequence above to start your AI Strategy Dashboard!

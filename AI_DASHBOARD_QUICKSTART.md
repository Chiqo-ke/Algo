# Quick Start: AI Strategy Dashboard

Complete guide to run the integrated frontend-backend AI chat system.

## Prerequisites
- ✅ Python 3.13 installed
- ✅ Node.js installed
- ✅ Gemini API key (get from https://ai.google.dev/)

## Step 1: Backend Setup (Django)

### 1.1 Navigate to Backend Directory
```powershell
cd c:\Users\nyaga\Documents\AlgoAgent
```

### 1.2 Activate Virtual Environment
```powershell
.venv\Scripts\activate
```

### 1.3 Install Missing Dependencies
```powershell
pip install google-generativeai
```
> **Note**: `jsonschema` and `python-dotenv` should already be installed

### 1.4 Configure Environment Variables
Create/update `.env` file in `AlgoAgent/` directory:
```env
GEMINI_API_KEY=your_api_key_here
DJANGO_SECRET_KEY=your_django_secret
DEBUG=True
```

### 1.5 Start Django Server
```powershell
python manage.py runserver
```

**Expected Output**:
```
System check identified no issues (0 silenced).
Starting development server at http://127.0.0.1:8000/
Quit the server with CTRL-BREAK.
```

### 1.6 Verify Backend Health
Open new terminal and test:
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

## Step 2: Frontend Setup (React + Vite)

### 2.1 Open New Terminal
Keep Django server running in first terminal.

### 2.2 Navigate to Frontend Directory
```powershell
cd c:\Users\nyaga\Documents\Algo
```

### 2.3 Install Dependencies (if needed)
```powershell
npm install
```

### 2.4 Verify Environment File
Ensure `.env` exists with:
```env
VITE_API_URL=http://localhost:8000
```

### 2.5 Start Frontend Dev Server
```powershell
npm run dev
```

**Expected Output**:
```
VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

## Step 3: Test the Integration

### 3.1 Open Browser
Navigate to: `http://localhost:5173/dashboard`

### 3.2 Test Strategy Validation
In the chat input, type:
```
Create a momentum strategy using RSI indicator with 14-period
```

**Expected Behavior**:
- Loading spinner appears
- AI analyzes your strategy
- Response shows:
  - Strategy classification
  - Confidence level
  - Canonicalized steps
  - Warnings (if any)
  - AI recommendations

### 3.3 Test Strategy Creation (Edit Mode)
Navigate to: `http://localhost:5173/dashboard?edit=true`

Type:
```
Create an EMA crossover strategy with 9 and 21 periods
```

**Expected Behavior**:
- Strategy is created in database
- Returns strategy ID
- Shows validation results
- Toast notification confirms creation

### 3.4 Test Strategy Update
After creation, type:
```
Add a stop loss at 2% below entry
```

**Expected Behavior**:
- Strategy is updated
- Re-validated with AI
- Shows updated analysis

## Troubleshooting

### Backend Issues

#### Error: "No module named 'google.generativeai'"
**Solution**:
```powershell
cd c:\Users\nyaga\Documents\AlgoAgent
.venv\Scripts\activate
pip install google-generativeai
```

#### Error: "GEMINI_API_KEY not found"
**Solution**:
1. Get API key from https://ai.google.dev/
2. Add to `.env` file in `AlgoAgent/` directory
3. Restart Django server

#### Error: "No module named 'canonical_schema'"
**Solution**: Already fixed! If you see this, run:
```powershell
python test_strategy_import.py
```
Should show "✅ ALL TESTS PASSED"

### Frontend Issues

#### Error: "Failed to fetch"
**Causes & Solutions**:
1. Backend not running
   - Start Django server: `python manage.py runserver`
2. Wrong API URL
   - Check `.env` has: `VITE_API_URL=http://localhost:8000`
3. CORS error
   - Already configured in `settings.py` to allow localhost:5173
   - Restart Django server if you just added it

#### Error: "Network Error"
**Solution**:
1. Verify both servers are running
2. Check firewall isn't blocking ports 8000 or 5173
3. Try accessing API directly: `http://localhost:8000/api/strategies/api/health/`

### AI Response Issues

#### AI returns generic/poor responses
**Causes & Solutions**:
1. Invalid API key
   - Verify key is correct in `.env`
   - Check quota at https://ai.google.dev/
2. Gemini not configured
   - Check health endpoint: `gemini_configured` should be `true`
3. Rate limiting
   - Wait a few seconds between requests

## Quick Command Reference

### Start Everything (Two Terminals)

**Terminal 1 - Backend**:
```powershell
cd c:\Users\nyaga\Documents\AlgoAgent
.venv\Scripts\activate
python manage.py runserver
```

**Terminal 2 - Frontend**:
```powershell
cd c:\Users\nyaga\Documents\Algo
npm run dev
```

### Stop Everything
- Press `Ctrl+C` in each terminal

### Restart After Changes
- **Backend code changes**: Restart Django server (Ctrl+C, then rerun)
- **Frontend code changes**: Auto-reloads (Vite HMR)
- **Environment variables**: Restart both servers

## Testing with Postman

If you prefer testing the API directly:

1. Import collection: `Quick_AI_Strategy_Validation.json`
2. Set base URL: `http://localhost:8000`
3. Test endpoints:
   - Health Check
   - Validate Strategy
   - Create Strategy
   - Update Strategy

## Example Prompts to Try

### Momentum Strategies
- "Create RSI strategy with 30/70 thresholds"
- "Build MACD crossover strategy"
- "Design momentum strategy with ADX filter"

### Mean Reversion
- "Create Bollinger Bands mean reversion"
- "Build RSI oversold/overbought strategy"
- "Design pairs trading strategy"

### Trend Following
- "Create EMA crossover 50/200"
- "Build breakout strategy with volume confirmation"
- "Design trend following with ATR stops"

### Strategy Improvements
- "Add trailing stop loss"
- "Optimize position sizing"
- "Add time-based filters"
- "Implement risk management"

## Next Steps

Once everything is working:

1. **Explore Features**:
   - Try different strategy types
   - Test warnings system with incomplete strategies
   - Review AI recommendations

2. **Save Strategies**:
   - Created strategies are in Django database
   - View at: `http://localhost:8000/admin/strategy_api/strategy/`

3. **Backtest Integration**:
   - Strategies with `save_to_backtest=true` are saved to `Backtest/codes/`
   - Can be used directly with your backtesting system

4. **Customize**:
   - Adjust AI parameters (`use_gemini`, `strict_mode`)
   - Modify response formatting in `Dashboard.tsx`
   - Add custom validation rules in `strategy_validator.py`

## Documentation

- **API Reference**: `STRATEGY_AI_VALIDATION_API.md`
- **Integration Guide**: `FRONTEND_BACKEND_INTEGRATION.md`
- **Postman Collection**: `Quick_AI_Strategy_Validation.json`
- **Backend Setup**: `DJANGO_API_README.md`

## Support

If you encounter issues not covered here:
1. Check Django logs (first terminal)
2. Check browser console (F12)
3. Test API health endpoint
4. Verify all dependencies are installed
5. Review error messages in chat interface

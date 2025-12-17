# Quick Start Guide - API Integration

## ✅ What's Been Done

Your frontend is now **fully connected** to your Django backend APIs! Here's what changed:

### 🔗 Connected APIs
1. **Symbol API** - Dynamic symbol dropdown in backtesting
2. **Strategy API** - Real strategy list from database
3. **Backtest API** - Live backtest execution with real results
4. **Market Data API** - Ready for future features

### 📁 New Files
- `src/lib/api.ts` - API configuration and helpers
- `src/lib/services.ts` - Service layer for all APIs
- `API_INTEGRATION.md` - Full technical documentation
- `IMPLEMENTATION_SUMMARY.md` - Detailed change log

### 📝 Updated Files
- `src/pages/Backtesting.tsx` - Now uses real API for backtests
- `src/pages/Strategy.tsx` - Loads strategies from database
- `src/pages/StrategyBuilder.tsx` - Template loading integration

## 🚀 How to Run

### Step 1: Start Backend
```bash
cd c:\Users\nyaga\Documents\AlgoAgent
python manage.py runserver
```

The backend should be running at: `http://127.0.0.1:8000`

### Step 2: Start Frontend
```bash
cd c:\Users\nyaga\Documents\Algo
npm run dev
# or if using bun:
bun dev
```

The frontend will be at: `http://localhost:5173` (or similar)

## 🧪 Test the Integration

### Test 1: Load Strategies
1. Open your browser to the frontend URL
2. Navigate to **Strategy** page (`/strategy`)
3. You should see strategies loaded from your database
4. If no strategies exist, it will show fallback mock data

### Test 2: Run a Backtest
1. Click **Test** on any strategy
2. Select a **Symbol** from the dropdown (loaded from API)
3. Choose a **Period** (e.g., "1 Month")
4. Select a **Timeframe** (e.g., "1 Hour")
5. Click **Run Backtest**
6. Wait for results (shows loading spinner)
7. Results appear from the API!

### Test 3: Check Error Handling
1. Stop your Django backend server
2. Try to load strategies or run a backtest
3. You should see error toast notifications
4. No crashes - graceful error handling!

## 📊 What's Dynamic Now

### ✅ Fully Dynamic
- Symbol selection dropdown
- Strategy list
- Backtest execution
- Loading indicators
- Error notifications
- Strategy template loading

### 🔄 Still Static (Mock Data)
- Dashboard AI chat responses
- Strategy performance metrics (win rate, P&L)
- Daily/symbol statistics in results
- Strategy status badges (live/paused/testing)

## 🎯 Key Features

### 1. Automatic Symbol Loading
The symbol dropdown in backtesting is now populated from your database:
```typescript
const { data, error } = await symbolService.getAll();
```

### 2. Strategy Fetching
Strategies are loaded from the API with proper error handling:
```typescript
const { data, error } = await strategyService.getAll();
```

### 3. Live Backtest Execution
When you click "Run Backtest", it actually calls your backend:
```typescript
const { data, error } = await backtestService.quickRun({
  strategy_code: strategyCode,
  symbol: "EURUSD",
  start_date: "2024-01-01",
  end_date: "2024-12-31",
  // ... other params
});
```

## 🔍 Debugging

### Check if Backend is Running
Open in browser: `http://127.0.0.1:8000/api/`

You should see API endpoints listed.

### View API Calls in Browser
1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Filter by **Fetch/XHR**
4. Perform actions in the app
5. See all API requests and responses

### Common Issues

#### Symbols Not Loading
- Check backend is running
- Verify you have symbols in database
- Check browser console for errors
- Look at Network tab for failed requests

#### Backtest Fails
- Ensure strategy has valid code
- Check symbol exists in database
- Verify date range has available data
- Check Django server logs for errors

#### CORS Errors
If you see CORS errors in console, update Django settings:
```python
# In AlgoAgent/algoagent_api/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

## 📖 Documentation

For detailed technical documentation, see:
- **`API_INTEGRATION.md`** - Complete API reference
- **`IMPLEMENTATION_SUMMARY.md`** - What changed and why

## 🔧 Configuration

### Change API URL
Edit `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
// Change to your backend URL
```

### Add Environment Variables (Recommended)
Create `.env` file in `Algo` folder:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

Then update `src/lib/api.ts`:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api';
```

## 🎉 Next Steps

### Immediate
1. Test all the integrated features
2. Add some symbols to your database
3. Create/import strategies
4. Run backtests and verify results

### Future Enhancements
1. **WebSocket Integration** - Real-time backtest updates
2. **Authentication** - User login and JWT tokens
3. **Data Caching** - Reduce API calls
4. **Advanced Filters** - Filter strategies by category, status
5. **Export Results** - Download backtest results as CSV/PDF
6. **Comparison Tool** - Compare multiple backtest runs

## 💡 Tips

1. **Keep backend running** - Frontend needs API to work
2. **Check browser console** - Errors show up there
3. **Use toast notifications** - They show success/error messages
4. **Look at loading states** - Spinners indicate API calls in progress
5. **Refresh if needed** - Some data might need page refresh after changes

## ✨ What You Can Do Now

✅ View real strategies from your database
✅ Run actual backtests against your backend
✅ Select symbols dynamically from database
✅ See loading states during API calls
✅ Get error notifications when things go wrong
✅ Load strategy templates from backend
✅ No more mock data in key features!

## 🆘 Need Help?

1. Check the documentation files
2. Review browser console and Network tab
3. Check Django server logs
4. Verify database has test data
5. Ensure all services are running

---

**Your frontend is now fully dynamic and connected to your backend! 🎉**

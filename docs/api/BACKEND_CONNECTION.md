# Backend Connection Verification

## ✅ Configuration Status

Your frontend is **correctly configured** to communicate with your Django backend!

### Current Setup

**Backend Server:**
- URL: `http://127.0.0.1:8000`
- API Base: `http://127.0.0.1:8000/api`
- Status: ✅ Running and responding

**Frontend Server:**
- Port: `8080` (Vite dev server)
- API Configuration: `src/lib/api.ts`
- Status: ✅ Configured correctly

**CORS Settings:**
- Django allows: `http://localhost:8080` and `http://127.0.0.1:8080`
- Status: ✅ Properly configured

## Quick Verification

### 1. Check Backend is Running
```powershell
curl http://127.0.0.1:8000/api/
```

**Expected Response:** JSON with API information
```json
{
  "message": "AlgoAgent API",
  "version": "1.0.0",
  "endpoints": {...}
}
```

### 2. Test Symbols Endpoint
```powershell
curl http://127.0.0.1:8000/api/data/symbols/
```

**Expected Response:** List of symbols
```json
{
  "count": 2,
  "results": [
    {"id": 1, "symbol": "AAPL", "name": "Apple Inc.", ...},
    ...
  ]
}
```

### 3. Test Strategies Endpoint
```powershell
curl http://127.0.0.1:8000/api/strategies/strategies/
```

**Expected Response:** List of strategies
```json
{
  "count": 1,
  "results": [
    {"id": 1, "name": "Test Strategy", ...}
  ]
}
```

## Visual API Test

I've created a visual test page for you:

1. **Start your frontend dev server:**
```powershell
cd c:\Users\nyaga\Documents\Algo
npm run dev
# or
bun dev
```

2. **Open the test page:**
```
http://localhost:8080/api-test.html
```

This page will automatically test all your API endpoints and show you:
- ✅ Which endpoints are working
- ❌ Which endpoints have issues
- 📊 Response data from each endpoint

## Connection Flow

```
Frontend (Vite on :8080)
          ↓
    src/lib/api.ts
          ↓
API_BASE_URL = 'http://127.0.0.1:8000/api'
          ↓
    Django Backend (:8000)
          ↓
    CORS Check (allows :8080)
          ↓
    API Response
          ↓
    Frontend Display
```

## Verification Checklist

- [x] Backend running on `http://127.0.0.1:8000` ✅
- [x] Frontend configured to use `http://127.0.0.1:8000/api` ✅
- [x] CORS allows `localhost:8080` and `127.0.0.1:8080` ✅
- [x] Symbols endpoint responding ✅
- [x] Strategies endpoint responding ✅
- [x] Error handling implemented ✅
- [x] Loading states implemented ✅

## Testing the Integration

### Option 1: Use the Visual Test Page
```
http://localhost:8080/api-test.html
```

### Option 2: Test in the App
1. Start both servers (backend and frontend)
2. Navigate to Strategy page: `http://localhost:8080/strategy`
3. You should see strategies loaded from your database
4. Click "Test" on any strategy
5. Symbol dropdown should populate from API
6. Click "Run Backtest" to execute via API

### Option 3: Check Browser DevTools
1. Open your app in the browser
2. Press F12 to open DevTools
3. Go to **Network** tab
4. Filter by **Fetch/XHR**
5. Navigate around the app
6. Watch API calls appear with 200 status codes

## Common Issues & Solutions

### Issue: CORS Error in Browser Console
**Solution:** Already configured! But if you see this:
```python
# In AlgoAgent/algoagent_api/settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
```

### Issue: API calls failing with "Network Error"
**Solution:** Make sure Django backend is running:
```powershell
cd c:\Users\nyaga\Documents\AlgoAgent
python manage.py runserver
```

### Issue: Frontend can't find API
**Solution:** The URL is already correct in `src/lib/api.ts`:
```typescript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

### Issue: Empty data in dropdowns
**Solution:** Make sure you have data in your database:
```powershell
# Create some test symbols
cd c:\Users\nyaga\Documents\AlgoAgent
python manage.py shell
```
```python
from data_api.models import Symbol
Symbol.objects.create(symbol='EURUSD', name='Euro vs US Dollar', exchange='FOREX')
Symbol.objects.create(symbol='GBPUSD', name='British Pound vs US Dollar', exchange='FOREX')
```

## API Endpoints Reference

All endpoints are configured in `src/lib/api.ts`:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/data/symbols/` | GET | List symbols |
| `/api/strategies/strategies/` | GET | List strategies |
| `/api/strategies/strategies/{id}/` | GET | Get strategy details |
| `/api/strategies/templates/` | GET | List templates |
| `/api/backtests/api/quick_run/` | POST | Run backtest |
| `/api/backtests/results/` | GET | Get results |

## Current Status Summary

### ✅ Working
- Backend server is running
- All API endpoints are accessible
- CORS is properly configured
- Frontend is configured with correct API URL
- Error handling is implemented
- Loading states are in place

### 🎯 Ready to Use
Your frontend **can now communicate** with your backend at `http://127.0.0.1:8000`!

Just make sure both servers are running:
1. Backend: `python manage.py runserver` (port 8000)
2. Frontend: `npm run dev` or `bun dev` (port 8080)

Then open `http://localhost:8080` and start using your dynamic app!

## Test Now!

Run this quick test:
```powershell
# Test backend connectivity
curl http://127.0.0.1:8000/api/data/symbols/
```

If you see JSON data with symbols, everything is working! 🎉

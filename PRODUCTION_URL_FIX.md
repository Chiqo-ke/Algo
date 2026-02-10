# Production URL Fixes - February 10, 2026

## 🔴 Issues Found

### 1. **Duplicate /api in URLs (Frontend)**
The frontend was adding `/api` twice in several API calls, causing 404 and CORS errors.

**Root Cause:**
- `API_BASE_URL` = `https://api.algoai.biz/api` (already includes `/api`)
- Code was adding another `/api/` → resulting in `/api/api/strategies/...`

### 2. **Backend Missing Database Tables**
- Database migrations were not run during initial deployment
- Caused 500 errors on `/api/strategies/bot-performance/`

### 3. **Nginx Timeout Too Low**
- Set to 60 seconds
- AI/LLM strategy generation takes 30-120 seconds
- Caused 504 Gateway Timeout errors

---

## ✅ Fixes Applied

### Frontend URL Fixes (Dashboard.tsx)

Fixed 4 instances of duplicate `/api` in Dashboard.tsx:

1. **Line 381** - Update strategy endpoint
   - ❌ Before: `${API_BASE_URL}/api/strategies/api/${strategyId}/update_strategy_with_ai/`
   - ✅ After: `${API_BASE_URL}/strategies/api/${strategyId}/update_strategy_with_ai/`

2. **Line 459** - Create strategy endpoint
   - ❌ Before: `${API_BASE_URL}/api/strategies/api/create_strategy_with_ai/`
   - ✅ After: `${API_BASE_URL}/strategies/api/create_strategy_with_ai/`

3. **Line 460** - Validate strategy endpoint
   - ❌ Before: `${API_BASE_URL}/api/strategies/api/validate_strategy_with_ai/`
   - ✅ After: `${API_BASE_URL}/strategies/api/validate_strategy_with_ai/`

4. **Line 708 & 934** - Generate strategy unified endpoint
   - ❌ Before: `${API_BASE_URL}/api/strategies/api/generate_strategy_unified/`
   - ✅ After: `${API_BASE_URL}/strategies/api/generate_strategy_unified/`

### Backend Fixes (VPS)

1. **✅ Database migrations completed** - All tables now exist
2. **⏳ Nginx timeout** - Needs to be increased to 300s (instructions below)

---

## 🚀 Deployment Steps

### Step 1: Deploy Updated Frontend

```powershell
# In PowerShell on your local machine
cd C:\Users\nyaga\Documents\Algo

# Build for production
npm run build

# Deploy to Vercel (or your hosting)
# If using Vercel:
vercel --prod

# Or if you need to manually upload:
# The built files are in dist/ folder
```

### Step 2: Fix Nginx Timeout on VPS

```bash
# SSH to VPS
ssh root@your-vps-ip

# Edit nginx config
sudo nano /etc/nginx/sites-available/algoagent

# Find this section (around line 58-60):
# Timeouts
# proxy_connect_timeout 60s;
# proxy_send_timeout 60s;
# proxy_read_timeout 60s;

# Change to:
# Timeouts - Increased for AI/LLM operations
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;

# Save: Ctrl+X, Y, Enter

# Test and reload nginx
sudo nginx -t
sudo systemctl reload nginx
```

### Step 3: Verify Everything Works

```bash
# On VPS - Test backend
curl -I http://127.0.0.1:8000/health/
# Should return: HTTP/1.1 200 OK

curl -I http://127.0.0.1:8000/api/strategies/bot-performance/
# Should return: HTTP/1.1 200 OK (not 500)

# Test full URL
curl -I https://api.algoai.biz/health/
# Should return: HTTP/2 200

# Test CORS
curl -H "Origin: https://www.algoai.biz" -v https://api.algoai.biz/api/ 2>&1 | grep -i "access-control"
# Should show: access-control-allow-origin: https://www.algoai.biz
```

### Step 4: Test from Frontend

1. Open https://www.algoai.biz in browser
2. Open DevTools (F12) → Network tab
3. Try generating a strategy
4. Verify:
   - ✅ No CORS errors in console
   - ✅ POST request goes to correct URL (no duplicate `/api`)
   - ✅ Request completes successfully (200 status)
   - ✅ No 504 timeout errors

---

## 📊 Backend URL Structure (Reference)

The Django backend URL structure is:

```
Main routing:        /api/strategies/
ViewSet router:      api/
Action:              generate_strategy_unified/
----------------------------------------------
Full URL:            /api/strategies/api/generate_strategy_unified/
```

**Frontend Usage:**
- `API_BASE_URL` already contains `/api`
- So paths start with `/strategies/...` NOT `/api/strategies/...`

**Example:**
```typescript
// CORRECT ✅
`${API_BASE_URL}/strategies/api/generate_strategy_unified/`
// Results in: https://api.algoai.biz/api/strategies/api/generate_strategy_unified/

// WRONG ❌
`${API_BASE_URL}/api/strategies/api/generate_strategy_unified/`
// Results in: https://api.algoai.biz/api/api/strategies/api/generate_strategy_unified/
```

---

## 🔍 Environment Variables (Reference)

### Production (.env.production)
```bash
VITE_API_BASE_URL=https://api.algoai.biz/api  # Includes /api suffix
VITE_API_URL=https://api.algoai.biz            # No /api suffix
```

### Which to Use?
- **api.ts**: Uses `VITE_API_BASE_URL` (with `/api`)
- **productionApi.ts**: Uses `VITE_API_URL` (without `/api`)

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Frontend builds successfully with no errors
- [ ] Nginx timeout increased to 300s
- [ ] Backend health check returns 200
- [ ] No CORS errors in browser console
- [ ] Strategy generation completes (even if takes 60+ seconds)
- [ ] Bot performance endpoint returns data (not 500 error)
- [ ] All API calls use correct URLs (check Network tab)
- [ ] No 404 "Not Found" errors
- [ ] No 504 "Gateway Timeout" errors

---

## 📝 Files Modified

### Frontend (Algo)
- `src/pages/Dashboard.tsx` - Fixed 5 duplicate `/api` instances

### Backend (AlgoAgent)
- ✅ Migrations already applied
- ⏳ Nginx config needs timeout update (instructions above)

---

## 🆘 If Issues Persist

1. **Clear browser cache**
   ```
   Ctrl+Shift+Delete → Clear cached images and files
   ```

2. **Check browser console for errors**
   - F12 → Console tab
   - Look for red errors

3. **Check Network tab**
   - F12 → Network tab
   - Click on failed request
   - Check Headers → Request URL
   - Verify no duplicate `/api`

4. **Check VPS logs**
   ```bash
   sudo journalctl -u algoagent-daphne -f
   sudo tail -f /var/log/nginx/algoagent-error.log
   ```

---

**Status:** Frontend fixes complete ✅  
**TODO:** Update nginx timeout on VPS  
**Next:** Deploy and test

# Complete Production Deployment Fix
## February 10, 2026

## 🚨 Current Issues

1. **Database Table Missing**: `strategy_api_botperformance` doesn't exist
2. **Frontend Using Wrong API URL**: Missing `/api` prefix in production build

---

## ✅ Step-by-Step Fix

### **Part 1: Fix Backend Database (On VPS)**

#### Option A: Use Automated Fix Script

```bash
# SSH to VPS
ssh root@your-vps-ip

# Upload and run the fix script
# First upload from Windows PowerShell:
```

```powershell
# On your Windows machine
scp C:\Users\nyaga\Documents\AlgoAgent\monolithic_agent\deployment\fix_botperformance_table.sh root@your-vps-ip:/tmp/
```

```bash
# Back on VPS
chmod +x /tmp/fix_botperformance_table.sh
bash /tmp/fix_botperformance_table.sh
```

#### Option B: Manual Fix

```bash
# SSH to VPS
ssh root@your-vps-ip

# Check if table exists
sudo -u postgres psql -d algoagent -c "\dt strategy_api*"

# If botperformance table is missing, create it
sudo -u algoagent bash -c "source /opt/algoagent/venv/bin/activate && cd /opt/algoagent/AlgoAgent/monolithic_agent && python manage.py migrate strategy_api --run-syncdb --settings=algoagent_api.settings_production"

# Verify table was created
sudo -u postgres psql -d algoagent -c "SELECT COUNT(*) FROM strategy_api_botperformance;"

# Restart Daphne
sudo systemctl restart algoagent-daphne

# Test endpoint
curl http://127.0.0.1:8000/api/strategies/bot-performance/
# Should return JSON, not 500 error
```

---

### **Part 2: Fix Frontend URLs (On Windows)**

#### Step 1: Verify Environment File

```powershell
# In PowerShell
cd C:\Users\nyaga\Documents\Algo

# Check production env file
Get-Content .env.production | Select-String "VITE_API"

# Should output:
# VITE_API_BASE_URL=https://api.algoai.biz/api
```

**If it shows something else, fix it:**

```powershell
# Edit .env.production
notepad .env.production

# Ensure it contains:
# VITE_API_BASE_URL=https://api.algoai.biz/api
# VITE_ENV=production
# VITE_DEBUG=false
```

#### Step 2: Clean and Rebuild

```powershell
# Clean old build
Remove-Item -Recurse -Force dist -ErrorAction SilentlyContinue

# Rebuild with production mode
npm run build:prod

# Verify build used correct URL - check for api.algoai.biz
Select-String -Path "dist/assets/*.js" -Pattern "api.algoai.biz/api" -List | Select-Object -First 3
```

**Expected output should show:**
```
dist/assets/index-abc123.js
dist/assets/Dashboard-xyz789.js
```

**If you see `api.algoai.biz` without `/api` suffix, the build is wrong!**

#### Step 3: Deploy to Production

**Option A: If using Vercel**

```powershell
# Install Vercel CLI if not already installed
npm install -g vercel

# Deploy
vercel --prod
```

**Option B: If manually deploying**

```powershell
# The built files are in dist/ folder
# Upload dist/* to your hosting provider
```

**Option C: If hosting on same VPS**

```powershell
# Upload to VPS
scp -r dist/* root@your-vps-ip:/var/www/algoai/
```

---

### **Part 3: Fix Nginx Timeout (On VPS)**

```bash
# Edit nginx config
sudo nano /etc/nginx/sites-available/algoagent
```

**Find (around line 58-60):**
```nginx
# Timeouts
proxy_connect_timeout 60s;
proxy_send_timeout 60s;
proxy_read_timeout 60s;
```

**Change to:**
```nginx
# Timeouts - Increased for AI/LLM operations
proxy_connect_timeout 300s;
proxy_send_timeout 300s;
proxy_read_timeout 300s;
```

**Save and reload:**
```bash
# Test config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx
```

---

## 🧪 Testing & Verification

### **Test 1: Backend Health**

```bash
# On VPS
curl -I http://127.0.0.1:8000/health/
# Expected: HTTP/1.1 200 OK

curl -I http://127.0.0.1:8000/api/strategies/bot-performance/
# Expected: HTTP/1.1 200 OK (not 500)

curl -I https://api.algoai.biz/health/
# Expected: HTTP/2 200
```

### **Test 2: Frontend API Calls**

Open browser to https://www.algoai.biz

**Open DevTools (F12)**:
1. Go to **Network** tab
2. Click **Clear** (🚫 icon)
3. Try generating a strategy
4. Look at the requests

**Expected:**
- ✅ URL: `https://api.algoai.biz/api/strategies/api/validate_strategy_with_ai/`
- ✅ Status: 200 OK
- ✅ No CORS errors

**Not Expected:**
- ❌ URL: `https://api.algoai.biz/strategies/api/...` (missing first `/api`)
- ❌ Status: 404 Not Found
- ❌ CORS errors

### **Test 3: Console Errors**

**Open DevTools → Console tab**

**Should NOT see:**
- ❌ `relation "strategy_api_botperformance" does not exist`
- ❌ `404 (Not Found)`
- ❌ `503 (Service Unavailable)`
- ❌ `504 (Gateway Time-out)`
- ❌ CORS policy errors

**Should see:**
- ✅ Normal API responses
- ✅ No red errors

---

## 🔍 Troubleshooting

### Issue: Frontend still shows wrong URL after rebuild

**Cause:** Browser caching old JavaScript files

**Fix:**
```
1. Hard refresh: Ctrl+Shift+R
2. Or clear cache: Ctrl+Shift+Delete
3. Or test in Incognito mode: Ctrl+Shift+N
```

### Issue: Build doesn't use .env.production

**Check which env file is being used:**

```powershell
# Check if NODE_ENV is set
$env:NODE_ENV

# Explicitly set it
$env:NODE_ENV = "production"
npm run build

# Or use the specific script
npm run build:prod
```

### Issue: Table still missing after migration

**Manual SQL creation:**

```bash
# Get the SQL
sudo -u algoagent bash -c "source /opt/algoagent/venv/bin/activate && cd /opt/algoagent/AlgoAgent/monolithic_agent && python manage.py sqlmigrate strategy_api 0002_bot_performance --settings=algoagent_api.settings_production" > /tmp/create_table.sql

# Review the SQL
cat /tmp/create_table.sql

# Run it manually
sudo -u postgres psql -d algoagent -f /tmp/create_table.sql

# Mark migration as applied
sudo -u algoagent bash -c "source /opt/algoagent/venv/bin/activate && cd /opt/algoagent/AlgoAgent/monolithic_agent && python manage.py migrate strategy_api --fake --settings=algoagent_api.settings_production"

# Restart service
sudo systemctl restart algoagent-daphne
```

---

## ✅ Success Checklist

After completing all steps, verify:

### Backend (VPS)
- [ ] `strategy_api_botperformance` table exists
- [ ] Database migrations all show [X] applied
- [ ] `/api/strategies/bot-performance/` returns 200 OK
- [ ] Nginx timeout set to 300s
- [ ] Daphne service running without errors

### Frontend (Browser)
- [ ] Build completed without errors
- [ ] Deployed to production
- [ ] Browser console shows no errors
- [ ] Network tab shows correct URLs (`/api/strategies/api/...`)
- [ ] No 404, 503, or 504 errors
- [ ] No CORS errors
- [ ] Strategy generation works

---

## 📊 Quick Verification Commands

### On VPS:
```bash
# Check all services
sudo systemctl status algoagent-daphne nginx postgresql redis-server

# Check table
sudo -u postgres psql -d algoagent -c "\dt strategy_api*"

# Test API
curl http://127.0.0.1:8000/api/strategies/bot-performance/

# Check logs
sudo journalctl -u algoagent-daphne -n 20 --no-pager
```

### On Windows:
```powershell
# Verify build
Test-Path .\dist\index.html

# Check env
Get-Content .env.production | Select-String "API"

# Check built files for URL
Select-String -Path "dist/assets/*.js" -Pattern "api.algoai.biz" -List
```

---

## 📝 Summary of Changes

### Code Files Modified:
1. ✅ `Algo/src/pages/Dashboard.tsx` - Fixed 5 URL duplications
2. ✅ `Algo/.env.production` - Verified correct (no changes needed)

### Backend Commands to Run:
1. ⏳ Fix database table (run fix script)
2. ⏳ Update nginx timeout
3. ⏳ Restart services

### Frontend Commands to Run:
1. ⏳ Clean build: `Remove-Item -Recurse -Force dist`
2. ⏳ Production build: `npm run build:prod`
3. ⏳ Deploy to production
4. ⏳ Hard refresh browser

---

## 🆘 If Still Having Issues

1. **Collect diagnostic info:**
   ```bash
   # On VPS
   bash /tmp/fix_production_issues.sh > /tmp/diagnostic.txt 2>&1
   
   # Add logs
   sudo journalctl -u algoagent-daphne -n 100 >> /tmp/diagnostic.txt
   
   # Download
   # Then on Windows: scp root@vps-ip:/tmp/diagnostic.txt .
   ```

2. **Share:**
   - The diagnostic.txt file
   - Screenshot of browser Network tab
   - Screenshot of browser Console errors

---

**Next Steps:**
1. Run backend fixes on VPS
2. Rebuild frontend with `npm run build:prod`
3. Deploy
4. Test

Let me know when you're ready to proceed or if you encounter any issues! 🚀

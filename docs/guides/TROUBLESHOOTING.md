# 🔧 Frontend-Backend Connection Troubleshooting

## Problem: 401 Error / Backend Not Receiving Requests

### ✅ Quick Fixes

#### 1️⃣ **Make Sure Django Server is Running**

```powershell
# Navigate to backend folder
cd AlgoAgent

# Start Django server
python manage.py runserver
```

You should see:
```
Starting development server at http://127.0.0.1:8000/
```

#### 2️⃣ **Verify Server is Accessible**

Open browser and visit: http://127.0.0.1:8000/api/

You should see the Django REST Framework browsable API.

#### 3️⃣ **Check Server Health (Python Script)**

```powershell
cd AlgoAgent
python check_server.py
```

This will test all endpoints and CORS configuration.

#### 4️⃣ **Use the Automated Startup Script**

```powershell
cd Documents
.\start-servers.ps1
```

This starts both Django and Vite servers automatically!

---

## 🐛 Common Issues & Solutions

### Issue 1: Connection Refused / Network Error

**Symptoms:**
- Browser console shows: `Failed to fetch`
- Error: `Cannot connect to server`

**Solution:**
```powershell
# Check if Django is running
netstat -ano | findstr :8000

# If not running, start it:
cd AlgoAgent
python manage.py runserver
```

---

### Issue 2: 401 Unauthorized Error

**Symptoms:**
- Login/Register returns 401
- Console shows: `HTTP error! status: 401`

**Possible Causes & Fixes:**

**A) Server is running but endpoint doesn't exist**
```powershell
# Check Django URLs are configured
cd AlgoAgent
python manage.py show_urls | findstr auth
```

Should show:
```
/api/auth/login/
/api/auth/register/
/api/auth/user/me/
```

**B) CORS not configured properly**

Check `AlgoAgent/algoagent_api/settings.py`:
```python
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

**C) Wrong credentials**

Test with default user:
- Username: `algotrader`
- Password: `Trading@2024`

---

### Issue 3: CORS Policy Error

**Symptoms:**
- Browser console: `blocked by CORS policy`
- Can't make requests from frontend to backend

**Solution:**

1. Check CORS middleware is installed:
```powershell
cd AlgoAgent
pip install django-cors-headers
```

2. Verify `settings.py` has:
```python
INSTALLED_APPS = [
    ...
    'corsheaders',
    ...
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # Must be at top!
    ...
]

CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

3. Restart Django server:
```powershell
# Ctrl+C to stop, then:
python manage.py runserver
```

---

### Issue 4: Wrong URL/Port

**Symptoms:**
- 404 Not Found
- Connection refused

**Solution:**

Check frontend API configuration (`Algo/src/lib/api.ts`):
```typescript
const API_BASE_URL = 'http://127.0.0.1:8000/api';
```

Make sure:
- ✅ Uses `http://` (not `https://`)
- ✅ Port is `8000` (Django default)
- ✅ Path includes `/api`
- ✅ No trailing slash on base URL

---

### Issue 5: Database Not Migrated

**Symptoms:**
- 500 Internal Server Error
- Django logs show database errors

**Solution:**
```powershell
cd AlgoAgent
python manage.py migrate
python manage.py createsuperuser  # If needed
```

---

## 🧪 Testing Steps

### Step 1: Test Backend Directly

**Using PowerShell:**
```powershell
# Test login endpoint
$body = @{
    username = "algotrader"
    password = "Trading@2024"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
```

Expected response:
```json
{
  "tokens": {
    "access": "eyJ0eXAi...",
    "refresh": "eyJ0eXAi..."
  },
  "user": {
    "id": 1,
    "username": "algotrader",
    "email": "trader@example.com"
  }
}
```

**Using Test HTML:**
```powershell
# Open the test page
cd Algo
start test-auth-connection.html
```

### Step 2: Check Browser Console

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for API request logs:
   - 🌐 API Request: POST http://127.0.0.1:8000/api/auth/login/
   - 📡 API Response: 200 OK
   - ✅ API Success: {...}

### Step 3: Check Network Tab

1. Open DevTools → Network tab
2. Filter by "Fetch/XHR"
3. Try to login
4. Check the request:
   - Status should be 200 (not 401, 404, or 500)
   - Response should contain tokens
   - Headers should show CORS headers

---

## 📋 Pre-Flight Checklist

Before running frontend, verify:

- [ ] Django server is running on port 8000
- [ ] Can access http://127.0.0.1:8000/api/ in browser
- [ ] Database is migrated (`python manage.py migrate`)
- [ ] CORS is configured in settings.py
- [ ] Frontend API_BASE_URL is correct
- [ ] Test user exists (algotrader / Trading@2024)

---

## 🚀 Quick Start Commands

**Terminal 1 - Backend:**
```powershell
cd AlgoAgent
python manage.py runserver
```

**Terminal 2 - Frontend:**
```powershell
cd Algo
npm run dev
```

**Or use the automated script:**
```powershell
.\start-servers.ps1
```

---

## 📞 Still Having Issues?

1. **Check Django logs** in the terminal where you ran `python manage.py runserver`
2. **Check browser console** for detailed error messages
3. **Run health check**: `python AlgoAgent/check_server.py`
4. **Test with Postman** using the collections in `AlgoAgent/postman_collections/`

---

## 🔍 Debugging Tools

### Enable Verbose Logging

The frontend now has detailed console logging:
- 🌐 Shows every API request
- 📡 Shows response status
- ✅ Shows successful responses
- ❌ Shows detailed errors

Check your browser console for these logs!

### Django Debug Mode

Already enabled in `settings.py`:
```python
DEBUG = True
```

This shows detailed error pages when something goes wrong.

---

## ✅ Success Indicators

When everything works, you should see:

**Backend Terminal:**
```
"POST /api/auth/login/ HTTP/1.1" 200 234
```

**Frontend Browser Console:**
```
🌐 API Request: POST http://127.0.0.1:8000/api/auth/login/
📡 API Response: 200 OK
✅ API Success: {tokens: {...}, user: {...}}
```

**Browser:**
- Login page → Enter credentials → Redirects to home page
- User is logged in and shown in UI

---

**Last Updated:** October 29, 2025

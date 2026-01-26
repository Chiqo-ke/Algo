# 🔍 401 Error - Quick Fix Guide

## The Problem
You're seeing: `API call failed: Error: HTTP error! status: 401`

This is **NORMAL** if you don't have a valid authentication token!

## Why This Happens

The 401 error occurs when:
1. **App loads** → Checks for existing auth token in localStorage
2. **Token doesn't exist or is expired** → Backend returns 401
3. **Frontend handles it** → Clears invalid token and continues

This is **expected behavior** when not logged in!

## ✅ Quick Fixes

### Fix 1: Clear Old Tokens (Most Common)

Open browser console and run:
```javascript
localStorage.clear()
```

Or visit: **http://localhost:5173/test-connection** and click "Clear Tokens"

### Fix 2: Verify Django is Running

```powershell
# Check if server is running
netstat -ano | findstr :8000

# If not running, start it:
cd AlgoAgent
python manage.py runserver
```

### Fix 3: Test the Connection

Visit the diagnostic page: **http://localhost:5173/test-connection**

Click "Test Connection" and "Test Login" buttons.

## 🧪 Test Your Setup

### Step 1: Start Both Servers

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

### Step 2: Clear Tokens

1. Open http://localhost:5173/test-connection
2. Click "Clear Tokens"

### Step 3: Try Login

1. Go to http://localhost:5173/login
2. Use credentials:
   - Username: `algotrader`
   - Password: `Trading@2024`
3. Click Login

**Expected Result:** ✅ Redirected to dashboard, no errors!

## 🔍 Understanding the Logs

When you open the app, you'll see these console messages:

### Normal Flow (No Token):
```
ℹ️ No token found, user not logged in
```
✅ This is fine! You're not logged in yet.

### Normal Flow (Invalid Token):
```
🔐 Checking authentication with stored token...
⚠️ Token invalid or expired, clearing...
```
✅ This is fine! Old token was cleared.

### Successful Login:
```
🌐 API Request: POST http://127.0.0.1:8000/api/auth/login/
📡 API Response: 200 OK
✅ API Success: {tokens: {...}, user: {...}}
```
✅ Perfect! You're logged in.

### Connection Error:
```
❌ 🔌 Cannot connect to server
```
❌ Problem! Django server is not running.

## 🎯 When to Worry About 401

**DON'T worry if:**
- ✅ You see 401 when app first loads (expected!)
- ✅ You see 401 with message "Token invalid or expired"
- ✅ App still works and you can login

**DO worry if:**
- ❌ You get 401 when trying to login with correct credentials
- ❌ You get 401 immediately after successful login
- ❌ 401 persists after clearing tokens

## 🛠️ Advanced Debugging

### Check What Token You Have

Open browser console:
```javascript
console.log(localStorage.getItem('access_token'))
```

If it shows a long string → You have a token (might be expired)
If it shows `null` → No token (need to login)

### Test Backend Directly

```powershell
# PowerShell - Test login
$body = @{
    username = "algotrader"
    password = "Trading@2024"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://127.0.0.1:8000/api/auth/login/" -Method POST -Body $body -ContentType "application/json"
```

Should return tokens and user info.

### Check CORS Headers

Open DevTools → Network tab → Try to login → Click the login request:
- Headers tab should show: `Access-Control-Allow-Origin: http://localhost:5173`

If missing → CORS issue, check Django settings.py

## 📋 Checklist

- [ ] Django server is running on port 8000
- [ ] Can access http://127.0.0.1:8000/api/ in browser
- [ ] Cleared old tokens from localStorage
- [ ] Using correct credentials (algotrader / Trading@2024)
- [ ] Frontend is on http://localhost:5173
- [ ] No firewall blocking localhost connections

## 🚀 Ready to Go!

If all checks pass:
1. Visit http://localhost:5173/login
2. Enter credentials
3. You should be logged in successfully!

---

## 🆘 Still Having Issues?

### Use the Diagnostic Tool

http://localhost:5173/test-connection

This page will:
- ✅ Test backend connectivity
- ✅ Test login endpoint
- ✅ Show detailed error messages
- ✅ Display debug information
- ✅ Let you clear tokens

### Check the Detailed Logs

The app now has extensive logging:
- Open browser DevTools (F12)
- Go to Console tab
- Look for 🌐, 📡, ✅, and ❌ emojis
- They show exactly what's happening

### Manual Test

Open: `Algo/test-auth-connection.html` in browser
This tests the API without React involved.

---

**Remember:** 401 on initial load is NORMAL and EXPECTED! It just means you need to log in. 🔐

**Last Updated:** October 29, 2025

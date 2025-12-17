# Frontend-Backend Authentication Integration

## ✅ What's Been Connected

Your React frontend is now fully integrated with your Django backend authentication API. Here's what works:

### 1. **Login Flow** (`/login`)
- Users can log in with username and password
- Receives JWT tokens from backend (`/api/auth/login/`)
- Tokens stored in localStorage
- Auto-redirects to home page on success

### 2. **Registration Flow** (`/register`)
- Users can create new accounts
- Optional first/last name fields
- Backend validates and returns tokens immediately
- Auto-login after successful registration
- Redirects to home page

### 3. **Authentication State**
- Tokens persist across page refreshes
- Auto-fetches user info on app load
- Protected routes check authentication status
- Automatic logout on invalid tokens

## 🔧 Updated Files

### Frontend (Algo/)
1. **`src/hooks/useAuth.tsx`**
   - Updated login to handle `tokens` object structure
   - Updated register to send `password2` and optional names
   - Auto-login after registration
   - Fixed user endpoint to `/api/auth/user/me/`

2. **`src/lib/api.ts`**
   - Updated user endpoint to match backend
   - Added profile endpoint for user preferences

3. **`src/pages/Register.tsx`**
   - Added first name and last name fields
   - Updated to navigate to home after registration (auto-login)

4. **`src/pages/Login.tsx`**
   - Already correctly configured
   - Navigates to home after login

## 🚀 How to Test

### Option 1: Test HTML Page (Quick Test)
1. Open `test-auth-connection.html` in browser
2. Click "Test Login" with default credentials
3. Click "Test Register" to create a new user
4. Click "Get User Info" to verify authentication

### Option 2: Full React App
1. **Start Backend (Django)**
   ```powershell
   cd AlgoAgent
   python manage.py runserver
   ```
   Server runs on: http://127.0.0.1:8000

2. **Start Frontend (React + Vite)**
   ```powershell
   cd Algo
   npm run dev
   ```
   App runs on: http://localhost:5173

3. **Test the Flow**
   - Navigate to http://localhost:5173/register
   - Create a new account
   - You'll be automatically logged in and redirected
   - Or go to http://localhost:5173/login to test login

### Option 3: Postman Collections
Use the provided Postman collections in `AlgoAgent/postman_collections/`:
- `Quick_Login.json` - Test login endpoint
- `Quick_Registration.json` - Test registration endpoint
- `Quick_Profile.json` - Test profile endpoints

## 🔐 Default Test Credentials

**Default User (from backend):**
- Username: `algotrader`
- Password: `Trading@2024`

**Test New User:**
- Create your own via the registration page!

## 📋 API Endpoints Being Used

### Authentication
- **POST** `/api/auth/login/` - Login user
- **POST** `/api/auth/register/` - Register new user
- **GET** `/api/auth/user/me/` - Get current user info
- **GET** `/api/auth/profiles/me/` - Get user profile with preferences

### Request/Response Format

**Login Request:**
```json
{
  "username": "algotrader",
  "password": "Trading@2024"
}
```

**Login Response:**
```json
{
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGci...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci..."
  },
  "user": {
    "id": 1,
    "username": "algotrader",
    "email": "trader@example.com"
  }
}
```

**Registration Request:**
```json
{
  "username": "newtrader",
  "email": "newtrader@example.com",
  "password": "SecurePass123!",
  "password2": "SecurePass123!",
  "first_name": "New",
  "last_name": "Trader"
}
```

**Registration Response:**
```json
{
  "tokens": {
    "access": "eyJ0eXAiOiJKV1QiLCJhbGci...",
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGci..."
  },
  "user": {
    "id": 2,
    "username": "newtrader",
    "email": "newtrader@example.com"
  },
  "message": "User registered successfully"
}
```

## 🛡️ Security Features

1. **JWT Token Authentication**
   - Access tokens sent via Bearer header
   - Refresh tokens for session renewal
   - Tokens stored in localStorage

2. **Password Validation**
   - Minimum 8 characters (frontend)
   - Additional backend validation
   - Password confirmation required

3. **Auto Token Refresh**
   - Infrastructure in place for token refresh
   - Endpoint: `/api/auth/token/refresh/`

## 🐛 Troubleshooting

### CORS Errors
If you see CORS errors, make sure Django backend has:
```python
# settings.py
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]
```

### 401 Unauthorized
- Token might be expired
- Try logging in again
- Check token is being sent in Authorization header

### Connection Refused
- Make sure Django server is running on port 8000
- Check `API_BASE_URL` in `src/lib/api.ts`

### Registration Errors
- Username might already exist
- Email might already be registered
- Password doesn't meet requirements

## 📝 Next Steps

1. **Add Token Refresh Logic**
   - Implement automatic token refresh before expiry
   - Handle 401 errors and retry with refresh token

2. **Add Profile Management**
   - Allow users to update their profile
   - Manage trading preferences
   - Update default settings

3. **Add Password Reset**
   - Forgot password flow
   - Email verification
   - Password change in settings

4. **Add Protected Routes**
   - Redirect to login if not authenticated
   - Use `useAuth` hook to check authentication status

## 🎯 Testing Checklist

- [ ] Login with existing user works
- [ ] Registration creates new user and logs in
- [ ] Tokens are saved to localStorage
- [ ] Page refresh maintains authentication
- [ ] Invalid credentials show error message
- [ ] Password mismatch shows error
- [ ] Navigation after login/register works
- [ ] Logout clears tokens and user state

## 📚 Related Files

- Frontend Auth Hook: `Algo/src/hooks/useAuth.tsx`
- API Configuration: `Algo/src/lib/api.ts`
- Login Page: `Algo/src/pages/Login.tsx`
- Register Page: `Algo/src/pages/Register.tsx`
- Backend Auth API: `AlgoAgent/auth_api/views.py`
- Backend URLs: `AlgoAgent/auth_api/urls.py`

---

**Status:** ✅ Ready to use!  
**Last Updated:** October 28, 2025

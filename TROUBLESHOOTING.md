# Troubleshooting Guide: 500 Error on main.jsx

## Problem
You're seeing a **500 Internal Server Error** when loading `main.jsx`, and a deprecation warning about the Apple mobile meta tag.

## Solutions Applied ✅

### 1. **Fixed Missing Dependencies**
- Added `@clerk/clerk-react` to package.json dependencies
- Added `eslint-plugin-jsx-a11y` to devDependencies
- Removed incorrect `jsx-a11y` version
- Ran `npm install` to fetch all packages

### 2. **Added Server Error Handling**
- Global error handler middleware in `server/index.js`
- 404 handler for undefined routes
- Detailed error logging in development mode
- Safe error messages in production mode

### 3. **Fixed Deprecated Meta Tags**
- Updated `index.html` to include both:
  - `<meta name="mobile-web-app-capable" content="yes">` (new standard)
  - `<meta name="apple-mobile-web-app-capable" content="yes">` (Apple-specific)

---

## Common Causes & Quick Fixes

### **Issue 1: Clerk Key Missing**
**Error:** `Missing Clerk Publishable Key`

**Fix:**
```bash
# Verify your .env file has:
VITE_CLERK_PUBLISHABLE_KEY=your_actual_key_here

# Restart dev server:
npm run dev
```

### **Issue 2: Network Request Failing**
**Error:** `Failed to load resource: the server responded with a status of 500`

**Causes & Solutions:**

```bash
# 1. Backend not running
cd server
npm install  # Install server dependencies
node index.js  # Or npm start if you add that script

# 2. Missing environment variables in server
# Verify server/.env has all required keys:
# - ANTHROPIC_API_KEY
# - STRIPE_SECRET_KEY
# - RESEND_API_KEY
# - VITE_TURSO_DATABASE_URL
# - VITE_TURSO_AUTH_TOKEN

# 3. Check server logs for errors
# The server should show detailed error messages now
```

### **Issue 3: Port Conflicts**
**Error:** `Address already in use :::3001`

**Fix:**
```bash
# Kill process using port 3001
lsof -ti :3001 | xargs kill -9

# Or use different port
PORT=3002 npm start
```

---

## Step-by-Step Recovery

### **Step 1: Clean Install**
```bash
# Remove node_modules and lockfile
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### **Step 2: Verify Environment**
```bash
# Create .env from template
cp .env.example .env

# Edit .env and add your actual keys:
# - VITE_CLERK_PUBLISHABLE_KEY
# - VITE_STRIPE_PUBLISHABLE_KEY
# - VITE_ADMIN_PIN
```

### **Step 3: Start Backend**
```bash
cd server
npm install
node index.js
# Should show: "Backend listening at http://localhost:3001"
```

### **Step 4: Start Frontend (new terminal)**
```bash
cd /Users/yahweh/Desktop/biblefunland-vite
npm run dev
# Should open http://localhost:5173
```

### **Step 5: Check Browser Console**
Open DevTools (F12) → Console tab → Look for:
- ✅ `validateEnv()` should log: "✅ All required environment variables are set"
- ❌ If error, read the missing variable and add it to `.env`

---

## Advanced Debugging

### **Enable Verbose Logging**
```javascript
// In server/index.js, add at top:
process.env.DEBUG = 'express:*,biblefunland:*';

// In src/main.jsx, add after imports:
console.log('Environment variables:', {
  clerkKey: import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? '✅' : '❌',
  stripeKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY ? '✅' : '❌',
  adminPin: import.meta.env.VITE_ADMIN_PIN ? '✅' : '❌',
});
```

### **Check Network Requests**
1. Open DevTools → Network tab
2. Reload page
3. Look for failed requests (red highlighting)
4. Click on request to see response status/message

### **View Server Logs**
Keep the server terminal visible to see:
```
Server Error: {
  message: '...',
  status: 500,
  path: '/api/...',
  method: 'POST'
}
```

---

## Health Check Commands

```bash
# Is frontend running?
curl http://localhost:5173 2>/dev/null | head -20

# Is backend running?
curl http://localhost:3001 2>/dev/null | jq

# Are dependencies installed?
npm ls @clerk/clerk-react

# Lint check
npm run lint

# Test run
npm run test -- --run
```

---

## If Still Failing

### **Nuclear Option: Complete Reset**
```bash
# 1. Remove everything
rm -rf node_modules package-lock.json dist .vite-cache

# 2. Fresh install
npm install

# 3. Clear browser cache
# Chrome: DevTools → Application → Clear storage

# 4. Restart both services
# Terminal 1:
cd server && npm install && node index.js

# Terminal 2:
npm run dev
```

### **Check Node/npm Versions**
```bash
node --version  # Should be 18+
npm --version   # Should be 9+

# If not, update:
nvm install 18
nvm use 18
npm install -g npm@latest
```

---

## Preventive Measures

### **Add Pre-Commit Checks**
The husky pre-commit hook will now run:
```bash
git add .
git commit -m "message"
# Husky will lint and format automatically
```

### **CI/CD Will Catch Issues**
When you push to GitHub, the workflow will:
- ✅ Lint all code
- ✅ Run tests
- ✅ Build frontend
- ✅ Build Docker images

---

## Resources

- **Clerk Docs:** https://clerk.com/docs
- **Vite Troubleshooting:** https://vitejs.dev/guide/troubleshooting.html
- **Express Error Handling:** https://expressjs.com/en/guide/error-handling.html
- **Common 500 Errors:** https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/500

---

## Quick Command Reference

```bash
# Development
npm run dev              # Start frontend (port 5173)
npm run lint            # Check code quality
npm run format          # Auto-format code
npm run test            # Run tests
npm run test:coverage   # Test coverage report

# Backend (in server/)
node index.js           # Start backend (port 3001)
npm run lint            # Check server code

# Production
npm run build           # Build optimized frontend
docker-compose up       # Start with Docker

# Debugging
npm run dev --debug     # Dev with debug logging
```

---

## Still Stuck?

If you've tried all steps and still see the error:

1. **Check the server terminal output** - Look for specific error messages
2. **Review recent changes** - Did you modify any critical files?
3. **Check network tab** - What's the exact 500 response?
4. **Clean cache & restart** - Often solves mysterious issues

Let me know the exact error message from:
- Server terminal (when making request)
- Browser Network tab (Response tab)
- Browser Console (any errors)

---

## Files Modified

✅ `package.json` - Added missing dependencies
✅ `index.html` - Fixed deprecated meta tag  
✅ `server/index.js` - Added error handling
✅ `src/main.jsx` - Already includes env validation

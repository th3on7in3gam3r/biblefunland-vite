# Quick Start Checklist

## Pre-Flight Check ✅

- [ ] Node.js v18+ installed: `node --version`
- [ ] npm 9+ installed: `npm --version`
- [ ] In project root: `/Users/yahweh/Desktop/biblefunland-vite`

---

## 1. Environment Setup

```bash
# Copy example to actual .env
cp .env.example .env

# Edit .env with your actual values:
# - VITE_CLERK_PUBLISHABLE_KEY
# - VITE_STRIPE_PUBLISHABLE_KEY  
# - VITE_ADMIN_PIN
```

**Check:**
- [ ] `.env` file exists
- [ ] All VITE_* variables filled in (not just placeholders)

---

## 2. Install Dependencies

```bash
# Root dependencies
npm install

# Server dependencies
cd server
npm install
cd ..
```

**Check:**
- [ ] No error messages
- [ ] `node_modules/` folder exists
- [ ] Can see `@clerk/clerk-react` in `node_modules`

---

## 3. Start Backend

**Terminal 1 - Backend Server:**
```bash
cd server
node index.js
```

**Expected output:**
```
Backend listening at http://localhost:3001
```

**Check:**
- [ ] See "Backend listening" message
- [ ] No error messages in terminal
- [ ] Port 3001 is available

---

## 4. Start Frontend

**Terminal 2 - Frontend Dev Server:**
```bash
npm run dev
```

**Expected output:**
```
  VITE v5.3.1  ready in XXX ms

  ➜  Local:   http://localhost:5173/
  ➜  press h to show help
```

**Check:**
- [ ] Frontend starts without errors
- [ ] Shows URL http://localhost:5173/
- [ ] No red error messages in terminal

---

## 5. Open in Browser

Navigate to: **http://localhost:5173**

**Check in Console (F12 → Console):**
```
✅ All required environment variables are set
```

**If you see error:**
```
❌ Missing required environment variables:
  • VITE_CLERK_PUBLISHABLE_KEY - ...
```

→ Go back to step 1, edit `.env`, restart frontend with `npm run dev`

---

## 6. Verify Features

- [ ] Page loads without 500 error
- [ ] Navigation works
- [ ] No red errors in browser console
- [ ] Can see main content

---

## Troubleshooting Quick Fixes

| Problem | Solution |
|---------|----------|
| **Port 3001 already in use** | `lsof -ti :3001 \| xargs kill -9` |
| **Port 5173 already in use** | `lsof -ti :5173 \| xargs kill -9` |
| **"Cannot find module" error** | `npm install` then restart |
| **Clerk key error** | Check `.env` file has actual key, not placeholder |
| **Still seeing 500 error** | See `TROUBLESHOOTING.md` for detailed guide |

---

## Code Quality Checks (Optional)

```bash
# Check code quality
npm run lint

# Auto-fix issues
npm run lint:fix

# Format code
npm run format

# Run tests
npm run test

# View bundle size
npm run analyze
```

---

## Next Steps

Once running:
- [ ] Read `ACCESSIBILITY.md` for coding standards
- [ ] Review `IMPROVEMENTS.md` for what was added
- [ ] Check `DOCKER.md` if you want to use containers
- [ ] See `TROUBLESHOOTING.md` if issues arise

---

## Keep Running

**Always run these two in parallel:**

```bash
# Terminal 1
cd server && node index.js

# Terminal 2
npm run dev
```

Both must be running for the app to work!

---

## Common Issues Already Fixed ✅

- Missing `@clerk/clerk-react` dependency → **Fixed**
- Missing `eslint-plugin-jsx-a11y` → **Fixed**
- Deprecated meta tag warning → **Fixed**
- No server error handling → **Fixed**
- Environment validation missing → **Already included**

---

## Success Checklist

When everything is working:
- ✅ Frontend loads at http://localhost:5173
- ✅ No 500 errors
- ✅ Browser console shows: "✅ All required environment variables are set"
- ✅ Can navigate between pages
- ✅ No red error messages

---

**If stuck:** See `TROUBLESHOOTING.md` for detailed debugging steps.

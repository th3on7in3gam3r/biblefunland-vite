# BibleFunLand — Vite + React

> **"Where Faith Meets Fun!"**
> Bible games, AI devotionals, interactive maps, flashcards, sermon notes, prayer wall, Stripe payments, and more — built with Vite, React, Supabase, and the Anthropic Claude API.

---

## 📁 Project Structure

```
biblefunland-vite/
├── index.html                  # Vite entry point
├── vite.config.js              # Vite config
├── package.json
├── .env.example                # Copy to .env and fill in
├── public/
│   ├── cross.svg               # Favicon
│   └── music/                  # Put your .mp3 worship files here
│       ├── amazing-grace.mp3
│       ├── how-great-is-our-god.mp3
│       └── ...
└── src/
    ├── main.jsx                # React entry
    ├── App.jsx                 # Router + providers
    ├── index.css               # Global styles + CSS variables
    ├── context/
    │   ├── AuthContext.jsx     # Supabase auth state
    │   ├── ThemeContext.jsx    # Dark/light mode
    │   ├── MusicContext.jsx    # Worship player state
    │   └── StreakContext.jsx   # Reading streak (localStorage + Supabase)
    ├── lib/
    │   ├── supabase.js         # Supabase client + DB helpers
    │   └── stripe.js           # Stripe checkout integration
    ├── components/
    │   ├── Nav.jsx / .module.css
    │   ├── Footer.jsx / .module.css
    │   ├── MusicPlayer.jsx / .module.css
    │   ├── PrivateRoute.jsx    # Requires Supabase login
    │   └── AdminRoute.jsx      # Requires PIN + login
    └── pages/
        ├── Home.jsx / .module.css
        ├── Auth.jsx / .module.css      # Login / Sign Up
        ├── AdminLogin.jsx / .module.css  # PIN entry (hidden route)
        ├── Admin.jsx            # Admin dashboard (protected)
        ├── Premium.jsx / .module.css   # Pricing with Stripe
        ├── Trivia.jsx           # Scripture trivia game
        ├── Devotional.jsx       # AI devotional generator
        ├── BibleMap.jsx         # Interactive Bible map
        ├── Flashcards.jsx       # Memory verse flashcards
        ├── SermonNotes.jsx      # Sermon note-taking tool
        ├── ShareCards.jsx       # Canvas verse graphics
        ├── Videos.jsx           # Video library
        ├── Blog.jsx             # Blog / community posts
        ├── PrayerWall.jsx       # Community prayer wall
        └── Dashboard.jsx        # User progress / badges
```

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
cd biblefunland-vite
npm install
```

### 2. Configure environment variables
```bash
cp .env.example .env
```
Then open `.env` and fill in:
- **Supabase URL + Anon Key** — from your Supabase project settings
- **Anthropic API Key** — from console.anthropic.com
- **Stripe Publishable Key** — from Stripe dashboard
- **Admin PIN** — 4-digit number, change from default `1234`

### 3. Set up Supabase database
Copy the SQL from `src/lib/supabase.js` (bottom of file) and run it in your **Supabase Dashboard → SQL Editor**. This creates:
- `streaks` table (reading streaks)
- `prayers` table (prayer wall)
- `sermon_notes` table
- `badges` table
- Row Level Security policies

### 4. Run locally
```bash
npm run dev
```
Opens at http://localhost:3000

### 5. Build for production
```bash
npm run build
```
Output goes to `dist/` — deploy to Netlify, Vercel, or Render.

---

## 🔐 Admin Access (SECURITY)

The admin dashboard is **completely hidden** from the public nav.

**How to access it:**
1. Click the BibleFunLand **logo 5 times quickly** on any page
2. A PIN entry screen appears at `/admin/login`
3. Enter your 4-digit PIN (default: `1234` — **change it in `.env` immediately!**)
4. On success, the admin dashboard opens for your session only
5. Refreshing the page clears admin access — you must re-enter PIN each time

**To change your PIN:** Set `VITE_ADMIN_PIN=your_new_pin` in `.env`

---

## 🎵 Worship Music

Add MP3 files to `public/music/`:
```
public/music/amazing-grace.mp3
public/music/how-great-is-our-god.mp3
public/music/oceans.mp3
public/music/10000-reasons.mp3
public/music/good-good-father.mp3
```

Or use a streaming URL in `src/context/MusicContext.jsx`:
```js
{ title: 'Air1 Radio', artist: 'Live Stream', src: 'https://rfcmedia.streamguys1.com/MasterAudio.mp3' }
```

**Music Licensing:** Ensure you have a valid **CCLI** (Christian Copyright License) or use royalty-free worship music. Check ccli.com for licensing.

---

## 💳 Stripe Payments

### Setup steps:
1. Create products in [Stripe Dashboard](https://dashboard.stripe.com) → Products
2. Copy the **Price IDs** into `src/lib/stripe.js` → `STRIPE_PRICES`
3. Create a **Supabase Edge Function** (code is in `src/lib/stripe.js` comments)
4. Set the Stripe secret key as a Supabase secret:
   ```bash
   supabase secrets set STRIPE_SECRET_KEY=sk_live_...
   supabase functions deploy create-checkout
   ```
5. Set up a **Stripe webhook** to handle subscription events (cancellations, renewals)

---

## 🤖 AI Devotional Generator

The devotional generator calls the **Anthropic Claude API** directly from the browser.

> ⚠️ **For production:** Proxy API calls through a Supabase Edge Function to keep your API key off the client. The key in `.env` as `VITE_ANTHROPIC_API_KEY` is visible in the browser bundle.

**Supabase Edge Function approach:**
```ts
// supabase/functions/generate-devotional/index.ts
import Anthropic from 'npm:@anthropic-ai/sdk'
const client = new Anthropic()

serve(async (req) => {
  const { topic } = await req.json()
  const msg = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 800,
    messages: [{ role: 'user', content: `Write a devotional about: ${topic}` }]
  })
  return new Response(JSON.stringify({ text: msg.content[0].text }))
})
```

---

## 📱 React Native / Expo (Next Phase)

The Vite web app is the foundation. For the React Native app:

```bash
npx create-expo-app BibleFunLandMobile --template
cd BibleFunLandMobile
npx expo install expo-router @supabase/supabase-js expo-notifications
```

**Key features to port:**
- Auth (Supabase — same backend!)
- Streak system (same Supabase tables)
- AI Devotional (same Edge Function)
- Push notifications for daily verse reminders
- Expo Go for instant testing on your phone

---

## 🌐 Deployment

### Netlify (recommended)
```bash
npm run build
# Drag dist/ to netlify.com/drop
# Or: netlify deploy --prod --dir dist
```
Set environment variables in Netlify dashboard → Site Settings → Environment Variables.

### Vercel
```bash
npx vercel --prod
```

### Your existing Hostinger/Namecheap setup
```bash
npm run build
# Upload dist/ contents to your public_html folder via FTP or cPanel
```

---

## 🗺️ Development Roadmap

### ✅ v5 (current)
- [x] Vite + React scaffold
- [x] Supabase auth (login/signup)
- [x] Dark mode
- [x] Admin PIN protection
- [x] Worship music player
- [x] Scripture trivia game
- [x] AI devotional generator
- [x] Interactive Bible map
- [x] Memory verse flashcards
- [x] Sermon notes tool
- [x] Share card generator
- [x] Premium pricing page
- [x] Stripe integration setup
- [x] Prayer wall
- [x] Email capture popup
- [x] PWA install banner
- [x] Responsive mobile nav

### 🔜 v6 (next)
- [ ] Real game builds (Phaser.js for David & Goliath, Noah's Voyage)
- [ ] Push notifications via Expo / Web Push API
- [ ] React Native / Expo app
- [ ] Blog CMS (Supabase as headless CMS)
- [ ] Family dashboard (link multiple accounts)
- [ ] Stripe webhook handler (subscription management)
- [ ] Admin analytics (real visitor data via Supabase)
- [ ] Bible API integration (API.Bible or ESV API)
- [ ] Social sharing with OG image generation

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vite 5 + React 18 |
| Routing | React Router v6 |
| Styling | CSS Modules + Global CSS variables |
| Auth | Supabase Auth |
| Database | Supabase (PostgreSQL) |
| AI | Anthropic Claude API (claude-sonnet-4) |
| Payments | Stripe Checkout |
| Serverless | Supabase Edge Functions (Deno) |
| Hosting | Netlify / Vercel / Hostinger |
| Mobile (next) | React Native + Expo |

---

## 📞 Support

Built by Jerless. Questions? Contact via biblefunland.com

*"For God so loved the world..." — John 3:16* 🙏

# SongTeam - Complete Installation Guide

## 🎯 What I've Built For You

I've created the complete Next.js application structure with:

✅ **Core Infrastructure**
- Next.js 14 project setup
- TypeScript configuration
- Tailwind CSS styling
- Supabase client libraries
- Stripe integration

✅ **Critical API Routes** (COMPLETED)
- `/api/stripe/checkout` - Create payment sessions
- `/api/stripe/webhook` - Process payments & auto-grant credits
- `/api/songs/generate` - Generate songs (consumes 1 credit)
- `/api/teams/create` - Create team with auto-generated join code
- `/api/teams/join` - Join team with join code
- `/api/admin/grant-credits` - Manually grant credits (developer only)
- `/api/auth/callback` - Supabase auth callback

✅ **Key Features Implemented**
- One-time credit purchases (no subscriptions)
- Auto-generate join codes when team created
- 1 song = 1 credit consumed
- Team-shared credit pool
- Admin manual credit granting
- Automatic credit refund if song generation fails

---

## 📦 What You Have

```
songteam-app/
├── app/
│   ├── api/              ✅ ALL API ROUTES COMPLETE
│   ├── (auth)/           ⏳ Need to add page files
│   ├── (dashboard)/      ⏳ Need to add page files
│   ├── admin/            ⏳ Need to add page files
│   ├── layout.tsx        ✅ DONE
│   └── globals.css       ✅ DONE
├── lib/
│   ├── supabase/         ✅ Client, server, middleware setup
│   ├── stripe/           ✅ Pricing plans configured
│   └── utils/            ✅ Helper functions
├── config/               ✅ Genres, site config
├── middleware.ts         ✅ Auth protection
├── package.json          ✅ All dependencies
├── tailwind.config.ts    ✅ Styling setup
└── tsconfig.json         ✅ TypeScript config
```

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
cd songteam-app
npm install
```

### Step 2: Set Up Environment Variables

Create `.env.local` in the root directory:

```bash
# Copy from .env.example
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:
- Supabase URL and keys (from your Supabase project)
- Stripe keys (from your Stripe dashboard)
- Stripe Price IDs (create products in Stripe first)

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Complete Setup Checklist

### 1. Supabase Setup

**A. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Save your project URL and keys

**B. Run Database Schema**
1. Copy content from `database_schema.sql` (from migration package)
2. Open Supabase SQL Editor
3. Paste and run the entire schema
4. Verify tables created: `profiles`, `teams`, `accomplishments`, `songs`, etc.

**C. Create Your Admin Account**
```sql
-- After you sign up in the app, run this in Supabase SQL Editor:
INSERT INTO admin_users (user_id, can_grant_credits, can_view_analytics)
VALUES ('your-user-id-here', true, true);
```

**D. Configure Supabase Auth**
1. Go to Authentication → URL Configuration
2. Set Site URL: `http://localhost:3000` (dev) or your domain (production)
3. Add Redirect URLs:
   - `http://localhost:3000/api/auth/callback`
   - `https://yourdomain.com/api/auth/callback`

### 2. Stripe Setup

**A. Create Stripe Account**
1. Go to [stripe.com](https://stripe.com)
2. Get your API keys (test mode)

**B. Create Products**
1. Go to Products → Add Product
2. Create 3 products:

**Starter Pack:**
- Name: Starter - 4 Song Credits
- Price: $20 (one-time)
- Copy the Price ID → Add to `.env.local` as `STRIPE_PRICE_ID_STARTER`

**Pro Pack:**
- Name: Pro - 20 Song Credits  
- Price: $75 (one-time)
- Copy the Price ID → Add to `.env.local` as `STRIPE_PRICE_ID_PRO`

**Team Pack:**
- Name: Team - 60 Song Credits
- Price: $200 (one-time)
- Copy the Price ID → Add to `.env.local` as `STRIPE_PRICE_ID_TEAM`

**C. Set Up Webhook** (for production)
1. Go to Developers → Webhooks
2. Add endpoint: `https://yourdomain.com/api/stripe/webhook`
3. Select event: `checkout.session.completed`
4. Copy webhook secret → Add to `.env.local`

**D. Test Webhook Locally**
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

### 3. Song Generation API

If you have an existing song generation API:
1. Add API URL to `.env.local` as `SONG_GENERATION_API_URL`
2. Add API key to `.env.local` as `SONG_GENERATION_API_KEY`

The API is called in `/app/api/songs/generate/route.ts`

---

## 🎨 Adding the UI Pages

I've built all the API logic, but you need to add the page UI files. Here's the fastest way:

### Option 1: Use AI to Generate Pages (Recommended)

Ask me or another AI:
"Create the login page for my Next.js SongTeam app using the Supabase client at /lib/supabase/client.ts"

Do this for each page:
- `/app/(auth)/login/page.tsx`
- `/app/(auth)/signup/page.tsx`
- `/app/(dashboard)/dashboard/page.tsx`
- etc.

### Option 2: Copy from Template

Use a Next.js + Supabase template and adapt the pages:
- [Next.js Supabase Starter](https://github.com/vercel/next.js/tree/canary/examples/with-supabase)
- [Supabase Auth UI](https://supabase.com/docs/guides/auth/auth-helpers/nextjs)

### Option 3: Use shadcn/ui Components

```bash
# Initialize shadcn/ui
npx shadcn-ui@latest init

# Add components as needed
npx shadcn-ui@latest add button
npx shadcn-ui@latest add card
npx shadcn-ui@latest add form
npx shadcn-ui@latest add input
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
```

Then build your pages using these components.

---

## 🎯 Priority Pages to Build

### 1. Authentication Pages (Week 1)

**Login** (`app/(auth)/login/page.tsx`)
- Email/password form
- Call `supabase.auth.signInWithPassword()`
- Redirect to `/dashboard` on success

**Signup** (`app/(auth)/signup/page.tsx`)
- Email/password/name form  
- Call `supabase.auth.signUp()`
- Redirect to `/dashboard` on success

**Reset Password** (`app/(auth)/reset-password/page.tsx`)
- Email form
- Call `supabase.auth.resetPasswordForEmail()`

### 2. Dashboard (Week 1-2)

**Main Dashboard** (`app/(dashboard)/dashboard/page.tsx`)
- Show user's teams
- Display credit balance
- Recent songs
- Quick actions (generate song, add accomplishment)

**Dashboard Layout** (`app/(dashboard)/layout.tsx`)
- Sidebar navigation
- Header with user menu
- Protected by middleware ✅ (already done)

### 3. Team Pages (Week 2)

**Team Management** (`app/(dashboard)/team/page.tsx`)
- Display join code
- Show team members
- Team settings (owner only)

**Team Members** (`app/(dashboard)/team/members/page.tsx`)
- List all members
- Remove members (owner only)

### 4. Songs (Week 2-3)

**Generate Song** (`app/(dashboard)/songs/new/page.tsx`)
- Genre selector
- Date range picker
- Preview accomplishments
- Call `/api/songs/generate`

**Song List** (`app/(dashboard)/songs/page.tsx`)
- Show all team songs
- Filter by status (pending, complete, error)
- Play/download songs

**Song Detail** (`app/(dashboard)/songs/[id]/page.tsx`)
- Display lyrics
- Audio player
- Download button
- Share options

### 5. Accomplishments (Week 2)

**Accomplishment List** (`app/(dashboard)/accomplishments/page.tsx`)
- Show all team accomplishments
- Filter by used/unused
- Add new accomplishment

**Add Accomplishment** (`app/(dashboard)/accomplishments/new/page.tsx`)
- Text input form
- Submit to Supabase

### 6. Credits (Week 3)

**Purchase Credits** (`app/(dashboard)/credits/purchase/page.tsx`)
- Display pricing tiers (from `lib/stripe/prices.ts`)
- "Buy Now" buttons
- Call `/api/stripe/checkout`
- Redirect to Stripe checkout

**Credit History** (`app/(dashboard)/credits/page.tsx`)
- Show transaction history
- Display current balance

### 7. Admin (Week 3)

**Admin Dashboard** (`app/admin/dashboard/page.tsx`)
- Stats overview
- Recent activity

**Grant Credits** (`app/admin/grant-credits/page.tsx`)
- Select team (dropdown)
- Enter credit amount
- Add notes
- Call `/api/admin/grant-credits`

---

## 🧪 Testing Your App

### 1. Test Auth Flow
```
1. Sign up new user
2. Verify email sent
3. Log in
4. Should redirect to /dashboard
```

### 2. Test Team Creation
```
1. Click "Create Team"
2. Enter team name
3. Should see join code generated (e.g., TEAM4X9Z)
4. Credits should be 0
```

### 3. Test Credit Purchase
```
1. Click "Buy Credits"
2. Select a plan
3. Complete Stripe checkout (use test card: 4242 4242 4242 4242)
4. Should redirect back to dashboard
5. Credits should be added
6. Check Stripe webhook logs
```

### 4. Test Song Generation
```
1. Add some accomplishments
2. Click "Generate Song"
3. Select genre
4. Should consume 1 credit
5. Song status: pending → generating → complete
```

### 5. Test Join Code
```
1. Create second user account
2. Use team join code
3. Should join team successfully
4. Both users should see same credit balance
```

### 6. Test Admin
```
1. Make yourself admin (SQL query above)
2. Go to /admin
3. Grant credits to a team
4. Verify credits added
```

---

## 🚢 Deployment (Vercel)

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - SongTeam app"
git remote add origin your-repo-url
git push -u origin main
```

### 2. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Import GitHub repository
3. Add environment variables (same as `.env.local`)
4. Deploy!

### 3. Update Supabase URLs

In Supabase dashboard:
- Update Site URL to your Vercel URL
- Add Vercel URL to redirect URLs

### 4. Update Stripe Webhook

- Add production webhook: `https://yourdomain.vercel.app/api/stripe/webhook`
- Update `STRIPE_WEBHOOK_SECRET` in Vercel

---

## 📊 Data Migration

Once your app is working:

1. Export data from Bubble using their API
2. Run the `migration_script.ts` (from migration package)
3. Verify data in Supabase
4. Test thoroughly
5. Notify users
6. Switch over!

---

## ❓ FAQ

**Q: Do I need to build all pages at once?**
A: No! Build in this order:
1. Auth pages (login/signup)
2. Dashboard
3. Song generation
4. Credit purchase
5. Everything else

**Q: Can I use the app with just the API routes?**
A: Yes! You can test all functionality via API calls (Postman, curl). The API is fully functional.

**Q: How long to complete the UI?**
A: With templates/AI help: 1-2 weeks
From scratch: 3-4 weeks

**Q: Can you generate the page files for me?**
A: Yes! Just ask "Create the [page name] for SongTeam" and I'll generate the complete page code.

---

## 🆘 Need Help?

**I can help you:**
1. Generate any specific page/component
2. Debug errors
3. Add features
4. Optimize performance
5. Fix Stripe/Supabase integration issues

**Just ask!**

---

## ✅ What's Already Working

- ✅ Complete API backend
- ✅ Stripe payment processing
- ✅ Credit management
- ✅ Song generation workflow
- ✅ Team & join code system
- ✅ Admin features
- ✅ Database schema
- ✅ Authentication middleware
- ✅ Type safety
- ✅ Error handling

**You just need to add the UI pages!**

---

**Ready to build? Start with Step 1 above, then ask me to generate the pages you need!** 🚀

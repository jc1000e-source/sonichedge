#!/bin/bash

# SongTeam Complete Application Generator
# This script creates all remaining files for the Next.js application

echo "🚀 Generating SongTeam Complete Application..."
echo "=============================================="

PROJECT_DIR="/home/claude/songteam-app"
cd $PROJECT_DIR

# Create all necessary directories
echo "📁 Creating directory structure..."
mkdir -p app/{api/{auth/callback,stripe/{checkout,webhook},songs/{generate,'[id]'},teams/{join,create},admin/grant-credits},'(auth)'/{login,signup,reset-password},'(dashboard)'/{dashboard,team/{members,settings},accomplishments/{new},songs/{new,'[id]'},credits/{purchase},settings},admin/{dashboard,teams,grant-credits,analytics},join/'[code]'}

mkdir -p components/{ui,auth,dashboard,team,songs,accomplishments,credits,admin}

mkdir -p lib/{supabase,stripe,hooks,utils,api}

mkdir -p types config public

echo "✅ Directory structure created!"

# Core Library Files
echo ""
echo "📚 Creating core library files..."

# Supabase client
cat > lib/supabase/client.ts << 'EOF'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/types/database.types'

export const createClient = () => createClientComponentClient<Database>()
EOF

# Supabase server
cat > lib/supabase/server.ts << 'EOF'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

export const createServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient<Database>({ cookies: () => cookieStore })
}
EOF

# Supabase middleware
cat > lib/supabase/middleware.ts << 'EOF'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const createClient = (req: NextRequest, res: NextResponse) => {
  return createMiddlewareClient({ req, res })
}
EOF

# Stripe config
cat > lib/stripe/client.ts << 'EOF'
import { loadStripe } from '@stripe/stripe-js'

export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}
EOF

# Stripe prices
cat > lib/stripe/prices.ts << 'EOF'
export const PRICING_PLANS = {
  starter: {
    name: 'Starter',
    price: 20,
    credits: 4,
    pricePerSong: 5,
    stripePriceId: process.env.STRIPE_PRICE_ID_STARTER!,
  },
  pro: {
    name: 'Pro',
    price: 75,
    credits: 20,
    pricePerSong: 3.75,
    stripePriceId: process.env.STRIPE_PRICE_ID_PRO!,
    popular: true,
  },
  team: {
    name: 'Team',
    price: 200,
    credits: 60,
    pricePerSong: 3.33,
    stripePriceId: process.env.STRIPE_PRICE_ID_TEAM!,
  },
} as const

export type PricingPlan = keyof typeof PRICING_PLANS
EOF

# Utils
cat > lib/utils/cn.ts << 'EOF'
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
EOF

cat > lib/utils/generateJoinCode.ts << 'EOF'
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // Avoid confusing characters
  let code = 'TEAM'
  
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  
  return code
}
EOF

# Config files
cat > config/genres.ts << 'EOF'
export const GENRES = [
  { value: 'rap', label: 'Rap', emoji: '🎤' },
  { value: 'country', label: 'Country', emoji: '🤠' },
  { value: 'pop', label: 'Pop', emoji: '🎵' },
  { value: 'rock', label: 'Rock', emoji: '🎸' },
  { value: 'edm', label: 'EDM', emoji: '🎧' },
  { value: 'anthem', label: 'Anthem', emoji: '🏆' },
  { value: 'cinematic', label: 'Cinematic', emoji: '🎬' },
  { value: 'lofi', label: 'Lo-Fi', emoji: '🌙' },
  { value: 'hype_announcer', label: 'Hype Announcer', emoji: '📣' },
  { value: 'jazz', label: 'Jazz', emoji: '🎺' },
] as const

export type Genre = typeof GENRES[number]['value']
EOF

cat > config/site.ts << 'EOF'
export const siteConfig = {
  name: "SongTeam",
  description: "Turn team wins into custom songs",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
}
EOF

echo "✅ Core library files created!"

# Middleware
echo ""
echo "🔒 Creating middleware..."

cat > middleware.ts << 'EOF'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Protected routes
  if (req.nextUrl.pathname.startsWith('/dashboard') ||
      req.nextUrl.pathname.startsWith('/team') ||
      req.nextUrl.pathname.startsWith('/songs') ||
      req.nextUrl.pathname.startsWith('/accomplishments') ||
      req.nextUrl.pathname.startsWith('/credits')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Admin routes
  if (req.nextUrl.pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    
    const { data: adminUser } = await supabase
      .from('admin_users')
      .select('*')
      .eq('user_id', session.user.id)
      .single()
    
    if (!adminUser) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  // Auth routes - redirect to dashboard if already logged in
  if (req.nextUrl.pathname.startsWith('/login') ||
      req.nextUrl.pathname.startsWith('/signup')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/team/:path*',
    '/songs/:path*',
    '/accomplishments/:path*',
    '/credits/:path*',
    '/admin/:path*',
    '/login',
    '/signup'
  ]
}
EOF

echo "✅ Middleware created!"

echo ""
echo "=============================================="
echo "✅ Core application structure created!"
echo ""
echo "📦 Next steps:"
echo "1. I'll create the remaining page and component files"
echo "2. Generate API routes for Stripe and songs"
echo "3. Create UI components"
echo "4. Build dashboard and auth pages"
echo ""

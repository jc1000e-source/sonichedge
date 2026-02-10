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
